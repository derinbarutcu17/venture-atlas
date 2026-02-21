import React, { useMemo, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { Startup } from '../types';
import { transformStartupsToHierarchy, type TreemapNode } from '../data/transformer';

// ─── CONFIG ─────────────────────────────────────────────────────
// The internal coordinate system dimensions for the layout.
// The SVG itself will be 100% width/height of its parent.
const VIEWBOX_W = 1600;
const VIEWBOX_H = 1000;

interface D3TreemapProps {
    startups: Startup[];
    onStartupHover: (s: Startup | null, isCategory?: boolean, categoryName?: string) => void;
}

// Helper to determine text color based on background luminance
function getContrastColor(hexcolor: string) {
    if (!hexcolor) return '#000000';
    // Remove hash if present
    hexcolor = hexcolor.replace('#', '');
    // Convert to RGB
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    // Calculate relative luminance
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
}

export const D3Treemap: React.FC<D3TreemapProps> = ({
    startups,
    onStartupHover
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

    const fullHierarchy = useMemo(() => transformStartupsToHierarchy(startups), [startups]);

    const root = useMemo(() => {
        const h = d3.hierarchy(fullHierarchy)
            .sum(d => d.value || 0)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        const treemapLayout = d3.treemap<TreemapNode>()
            .size([VIEWBOX_W, VIEWBOX_H])
            .paddingInner(1)
            .paddingOuter(1)
            .paddingTop(node => (node.depth === 1 ? 40 : node.depth === 2 ? 30 : 0))
            .round(true)
            .tile(d3.treemapSquarify);

        treemapLayout(h);
        return h as d3.HierarchyRectangularNode<TreemapNode>;
    }, [fullHierarchy]);

    const allNodes = useMemo(() => root.descendants(), [root]);

    // ─── STATE: ZOOM NAVIGATION ────────────────────────────────────
    // currentRoot tracks the currently active node defining the layout bounds
    const [currentRoot, setCurrentRoot] = useState<d3.HierarchyRectangularNode<TreemapNode>>(root);

    // D3 Scales mapped to the currentRoot's physical layout bounds
    const dx = useMemo(() => d3.scaleLinear().domain([currentRoot.x0, currentRoot.x1]).range([0, VIEWBOX_W]), [currentRoot]);
    const dy = useMemo(() => d3.scaleLinear().domain([currentRoot.y0, currentRoot.y1]).range([0, VIEWBOX_H]), [currentRoot]);

    const colorScale = useMemo(() => {
        const sectors = fullHierarchy.children?.map(d => d.name) || [];
        return d3.scaleOrdinal<string>()
            .domain(sectors)
            .range(['#E6F4FF', '#F6FFED', '#FFF0F6', '#FFF7E6', '#F9F0FF', '#FFF1F0', '#E6FFFB', '#F5F5F5', '#FEFFE6', '#FCFFE6']);
    }, [fullHierarchy]);

    // Format utility
    const formatValue = (value?: number) => {
        if (!value) return '';
        return value > 999 ? `€${(value / 1000).toFixed(1)}B` : `€${value}M`;
    };

    // ─── INTERACTION ────────────────────────────────────────────────
    const zoomTo = useCallback((node: d3.HierarchyRectangularNode<TreemapNode>) => {
        setCurrentRoot(node);
    }, []);

    const zoomOut = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentRoot.parent) {
            zoomTo(currentRoot.parent);
        }
    }, [currentRoot, zoomTo]);

    const handleNodeClick = useCallback((e: React.MouseEvent, node: d3.HierarchyRectangularNode<TreemapNode>) => {
        e.stopPropagation();
        // Only zoom if the node has children
        if (node.children && node.children.length > 0) {
            zoomTo(node);
        } else if (node === currentRoot && currentRoot.parent) {
            // Clicking the active leaf node zooms out
            zoomTo(currentRoot.parent);
        }
    }, [currentRoot, zoomTo]);

    return (
        <div ref={containerRef} className="w-full h-full bg-white overflow-hidden relative font-mono">
            {/* IN-MAP NAVIGATION OVERLAY */}
            <div className="absolute top-0 left-0 right-0 z-20 flex px-4 py-2 pointer-events-none items-center">
                {currentRoot.depth > 0 && (
                    <button
                        onClick={zoomOut}
                        className="pointer-events-auto flex items-center gap-2 bg-black/80 hover:bg-black text-white px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors shadow-lg backdrop-blur-md"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to {currentRoot.parent?.data.name || 'All'}
                    </button>
                )}
            </div>

            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
                preserveAspectRatio="none"
                className="w-full h-full block cursor-crosshair select-none"
            >
                {allNodes.map((node) => {
                    // Do not render the top-level root rect itself to avoid grey generic background
                    if (node.depth === 0) return null;

                    const isLeaf = !node.children || node.children.length === 0;
                    const isParentCategory = node.depth === 1 || node.depth === 2;
                    const nodeId = node.data.id || node.data.name;

                    // Compute target coordinates based on the current scale
                    const x0 = dx(node.x0);
                    const x1 = dx(node.x1);
                    const y0 = dy(node.y0);
                    const y1 = dy(node.y1);
                    const w = x1 - x0;
                    const h = y1 - y0;

                    // If a node goes completely off-viewport or is inverted during transitions
                    const isVisible = w > 0 && h > 0 && x1 > 0 && x0 < VIEWBOX_W && y1 > 0 && y0 < VIEWBOX_H;

                    // Dynamic colors
                    let sectorNode = node;
                    while (sectorNode.parent && sectorNode.parent.depth > 0) sectorNode = sectorNode.parent;
                    const baseColor = colorScale(sectorNode.data.name);

                    let fill = baseColor;
                    const isHovered = hoveredNodeId === nodeId;
                    if (isHovered) fill = d3.color(fill)?.darker(0.1).formatHex() || fill;

                    // Special styling for category parent containers
                    if (isParentCategory && !isLeaf) {
                        fill = d3.color(baseColor)?.brighter(0.2).formatHex() || fill;
                    }

                    const textColor = getContrastColor(fill);

                    // Skip rendering nodes perfectly invisible
                    if (!isVisible && currentRoot !== node) return null;

                    return (
                        <g
                            key={nodeId}
                            className="transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                            style={{
                                transform: `translate(${x0}px, ${y0}px)`,
                                opacity: isVisible ? 1 : 0
                            }}
                            onMouseEnter={() => {
                                setHoveredNodeId(nodeId);
                                if (isLeaf) {
                                    const s = startups.find(x => x.id === node.data.id);
                                    onStartupHover(s || null);
                                } else {
                                    onStartupHover(null, true, node.data.name);
                                }
                            }}
                            onMouseLeave={() => {
                                setHoveredNodeId(null);
                                onStartupHover(null);
                            }}
                            onClick={(e) => handleNodeClick(e, node)}
                        >
                            <rect
                                width={Math.max(0, w)}
                                height={Math.max(0, h)}
                                fill={fill}
                                stroke="rgba(0,0,0,0.1)"
                                strokeWidth={isHovered ? 2 : 1}
                                className="transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                                rx={2}
                            />

                            {/* TEXT RENDERING via foreignObject */}
                            {w > 30 && h > 15 && (
                                <foreignObject
                                    width={Math.max(0, w)}
                                    height={Math.max(0, h)}
                                    className="pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                                >
                                    {/* HTML Container for Text */}
                                    <div
                                        className={`w-full h-full flex flex-col box-border overflow-hidden 
                                            ${isLeaf ? 'p-1.5 sm:p-2 justify-start' : 'p-2 justify-start'}`}
                                        style={{ color: textColor }}
                                    >
                                        <div
                                            className={`font-black break-words leading-none w-full
                                                ${!isLeaf ? 'uppercase tracking-wider opacity-60 mb-1 border-b' : 'opacity-90'}
                                            `}
                                            style={{
                                                fontSize: isLeaf ? (w > 100 && h > 50 ? '14px' : '10px') : (w > 150 ? '16px' : '12px'),
                                                borderColor: `${textColor}33` // 20% opacity border
                                            }}
                                        >
                                            {node.data.name}
                                        </div>

                                        {isLeaf && w > 60 && h > 40 && (
                                            <div
                                                className="font-bold opacity-50 italic mt-1"
                                                style={{ fontSize: w > 100 ? '11px' : '9px' }}
                                            >
                                                {formatValue(node.data.value)}
                                            </div>
                                        )}

                                        {/* Internal Click Target hint for categories */}
                                        {!isLeaf && w > 100 && h > 80 && currentRoot !== node && isHovered && (
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/10 backdrop-blur-sm text-black px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest items-center gap-1 flex pointer-events-none border border-black/20">
                                                <span className="material-symbols-outlined text-[12px]">zoom_in</span> Zoom
                                            </div>
                                        )}
                                    </div>
                                </foreignObject>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};


