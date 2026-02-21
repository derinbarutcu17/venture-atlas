import React, { useMemo, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { Startup } from '../types';
import { transformStartupsToHierarchy, type TreemapNode } from '../data/transformer';

// ─── CONFIG ─────────────────────────────────────────────────────
const VIEWBOX_W = 1600;
const VIEWBOX_H = 1000;

interface D3TreemapProps {
    startups: Startup[];
    onStartupHover: (s: Startup | null, isCategory?: boolean, categoryName?: string) => void;
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

        // Use standard padding approach for single stroke feel.
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
    const [currentRoot, setCurrentRoot] = useState<d3.HierarchyRectangularNode<TreemapNode>>(root);

    // Instead of mapping x/y, we calculate global transform for the SVG container
    const transformStyle = useMemo(() => {
        // We calculate scale to fit the currentRoot entirely into the viewport
        const targetW = currentRoot.x1 - currentRoot.x0;
        const targetH = currentRoot.y1 - currentRoot.y0;

        // Prevent Divide by 0
        if (targetW === 0 || targetH === 0) return { x: 0, y: 0, k: 1 };

        // Scale factors to fit either width or height identically
        const scaleX = VIEWBOX_W / targetW;
        const scaleY = VIEWBOX_H / targetH;

        const k = Math.min(scaleX, scaleY); // Standard aspect ratio fit

        // Center offsets
        const x = -currentRoot.x0 * k + (VIEWBOX_W - targetW * k) / 2;
        const y = -currentRoot.y0 * k + (VIEWBOX_H - targetH * k) / 2;

        return { x, y, k };
    }, [currentRoot]);

    const colorScale = useMemo(() => {
        const sectors = fullHierarchy.children?.map(d => d.name) || [];
        return d3.scaleOrdinal<string>()
            .domain(sectors)
            .range(['#E6F4FF', '#F6FFED', '#FFF0F6', '#FFF7E6', '#F9F0FF', '#FFF1F0', '#E6FFFB', '#F5F5F5', '#FEFFE6', '#FCFFE6']);
    }, [fullHierarchy]);

    const formatValue = (value?: number) => {
        if (!value) return '';
        return value > 999 ? `€${(value / 1000).toFixed(1)}B` : `€${value}M`;
    };

    const zoomTo = useCallback((node: d3.HierarchyRectangularNode<TreemapNode>) => {
        setCurrentRoot(node);
    }, []);

    const zoomOut = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentRoot.parent) zoomTo(currentRoot.parent);
    }, [currentRoot, zoomTo]);

    const handleNodeClick = useCallback((e: React.MouseEvent, node: d3.HierarchyRectangularNode<TreemapNode>) => {
        e.stopPropagation();
        if (node.children && node.children.length > 0) {
            zoomTo(node);
        } else if (node === currentRoot && currentRoot.parent) {
            zoomTo(currentRoot.parent);
        }
    }, [currentRoot, zoomTo]);

    return (
        <div ref={containerRef} className="w-full h-full bg-white overflow-hidden relative font-mono">
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
                preserveAspectRatio="xMidYMid slice"
                className="block cursor-crosshair select-none bg-white"
            >
                {/* 
                    GLOBAL CAMERA GROUP:
                    We transition the entire map around so siblings stay relative,
                    which perfectly achieves the "Map Zooming" aesthetic.
                */}
                <g
                    style={{
                        transform: `translate(${transformStyle.x}px, ${transformStyle.y}px) scale(${transformStyle.k})`,
                        transformOrigin: '0 0'
                    }}
                    className="transition-transform duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
                >
                    {allNodes.map((node) => {
                        if (node.depth === 0) return null;

                        const isLeaf = !node.children || node.children.length === 0;
                        const isParentCategory = node.depth === 1 || node.depth === 2;
                        const nodeId = node.data.id || node.data.name;

                        // Layout width and height (fixed original coords)
                        const w = node.x1 - node.x0;
                        const h = node.y1 - node.y0;

                        if (w <= 0 || h <= 0) return null;

                        // Unified Colors
                        let sectorNode = node;
                        while (sectorNode.parent && sectorNode.parent.depth > 0) sectorNode = sectorNode.parent;
                        let fill = colorScale(sectorNode.data.name);

                        // Interaction
                        const isHovered = hoveredNodeId === nodeId;
                        if (isHovered && isLeaf) {
                            fill = d3.color(fill)?.darker(0.1).formatHex() || fill;
                        } else if (isParentCategory && !isLeaf) {
                            fill = d3.color(fill)?.darker(0.05).formatHex() || fill;
                        }

                        // Determine if node is active 'header' space to attach back navigation
                        // The user wanted the active header to be the back button
                        const isCurrentActiveHeader = (node === currentRoot) && isParentCategory;

                        return (
                            <g
                                key={nodeId}
                                transform={`translate(${node.x0}, ${node.y0})`}
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
                                onClick={(e) => {
                                    if (isCurrentActiveHeader) {
                                        zoomOut(e);
                                    } else {
                                        handleNodeClick(e, node);
                                    }
                                }}
                            >
                                {/* Rect Graphic */}
                                <rect
                                    width={w}
                                    height={h}
                                    fill={fill}
                                    stroke="rgba(0,0,0,0.15)"
                                    strokeWidth={isHovered && isLeaf ? 1.5 / transformStyle.k : 1 / transformStyle.k}
                                    className="transition-colors duration-300 pointer-events-auto"
                                    onClick={isCurrentActiveHeader ? zoomOut : undefined}
                                />

                                {/* Text Label Logic - We counteract the scale (1/k) so text is crisp and un-stretched globally */}
                                {w * transformStyle.k > 40 && h * transformStyle.k > 20 && (
                                    <foreignObject
                                        width={w}
                                        height={h}
                                        className="pointer-events-none"
                                    >
                                        <div
                                            className={`w-full h-full flex flex-col box-border overflow-hidden 
                                                ${isLeaf ? 'p-1.5 justify-start' : 'p-2 justify-start'}
                                                ${isCurrentActiveHeader ? 'cursor-pointer hover:opacity-80' : ''}
                                            `}
                                            style={{ color: '#000' }}
                                        >
                                            <div
                                                className={`font-black break-words leading-none w-full
                                                    ${!isLeaf ? 'uppercase tracking-wider opacity-60 mb-1 border-b' : 'opacity-90'}
                                                `}
                                                style={{
                                                    // Inverse global scale so CSS text stays roughly identical visually when zoomed in natively
                                                    fontSize: isLeaf
                                                        ? `clamp(6px, ${Math.min(14 / transformStyle.k, 18)}px, 14px)`
                                                        : `clamp(10px, ${Math.min(16 / transformStyle.k, 20)}px, 18px)`,
                                                    borderColor: 'rgba(0,0,0,0.1)',
                                                    lineHeight: 1.1
                                                }}
                                            >
                                                {isCurrentActiveHeader ? `← BACK: ${node.data.name}` : node.data.name}
                                            </div>

                                            {isLeaf && (w * transformStyle.k) > 60 && (h * transformStyle.k) > 40 && (
                                                <div
                                                    className="font-bold opacity-50 italic mt-1"
                                                    style={{
                                                        fontSize: `clamp(6px, ${Math.min(10 / transformStyle.k, 12)}px, 10px)`
                                                    }}
                                                >
                                                    {formatValue(node.data.value)}
                                                </div>
                                            )}
                                        </div>
                                    </foreignObject>
                                )}
                            </g>
                        );
                    })}
                </g>
            </svg >
        </div >
    );
};


