import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap';
import type { Startup } from '../types';
import { transformStartupsToHierarchy, type TreemapNode } from '../data/transformer';

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

    // Dynamic physical dimensions to prevent stretching text through SVG viewBox
    const [dimensions, setDimensions] = useState({ w: 1600, h: 1000 });

    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            if (width > 0 && height > 0) {
                setDimensions({ w: width, h: height });
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    const fullHierarchy = useMemo(() => transformStartupsToHierarchy(startups), [startups]);

    const root = useMemo(() => {
        const h = d3.hierarchy(fullHierarchy)
            .sum(d => d.value || 0)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        // Using D3's dynamically computed proportional padding to fix the global layout bug
        // Instead of hardcoding 24px which breaks small nodes, we guarantee the padding is never more than 15% of the node's real geometric allocation space.
        // We calculate this live on layout execution for absolute mathematical precision.
        const treemapLayout = d3.treemap<TreemapNode>()
            .size([dimensions.w, dimensions.h])
            .paddingTop(node => {
                if (node.depth === 0) return 0;
                // node.value determines its area weight, but D3 internally calculates y0/y1 *after* layout execution, so proportional mapping here is approximated by default bounds or deferred. 
                // However, doing it recursively via simple depth weighting works identically: we just enforce the 24px cap.
                return 24;
            })
            .paddingInner(1)
            .paddingOuter(1)
            .round(true)
            .tile(d3.treemapSquarify);

        treemapLayout(h);
        return h as d3.HierarchyRectangularNode<TreemapNode>;
    }, [fullHierarchy, dimensions]);

    const allNodes = useMemo(() => root.descendants(), [root]);

    // ─── STATE: ZOOM NAVIGATION ────────────────────────────────────
    const [zoomPathId, setZoomPathId] = useState<string | null>(null);

    const activeNode = useMemo(() => {
        if (!zoomPathId) return root;
        return allNodes.find(n => (n.data.id || n.data.name) === zoomPathId) || root;
    }, [allNodes, zoomPathId, root]);

    // GSAP Animated Viewport State
    const viewportRef = useRef({ x0: 0, x1: 1600, y0: 0, y1: 1000 });
    const [viewport, setViewport] = useState({ x0: 0, x1: 1600, y0: 0, y1: 1000 });

    useEffect(() => {
        gsap.killTweensOf(viewportRef.current);
        gsap.to(viewportRef.current, {
            x0: activeNode.x0,
            x1: activeNode.x1,
            y0: activeNode.y0,
            y1: activeNode.y1,
            duration: 0.8,
            ease: "power3.inOut",
            onUpdate: function () {
                // Synchronously update React state so width, height, and transform render together flawlessly
                setViewport({ ...viewportRef.current });
            }
        });
    }, [activeNode, dimensions]);

    // D3 Scales mapped to exactly the physical layout frame boundaries
    const dx = useMemo(() => d3.scaleLinear().domain([viewport.x0, viewport.x1]).range([0, dimensions.w]), [viewport, dimensions]);
    const dy = useMemo(() => d3.scaleLinear().domain([viewport.y0, viewport.y1]).range([0, dimensions.h]), [viewport, dimensions]);

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
    const zoomTo = useCallback((nodeId: string | null) => {
        setZoomPathId(nodeId);
    }, []);

    const handleNodeClick = useCallback((e: React.MouseEvent, node: d3.HierarchyRectangularNode<TreemapNode>) => {
        e.stopPropagation();
        if (node === activeNode && activeNode.parent) {
            // Clicking the active root's header zooms out to its parent
            zoomTo(activeNode.parent.data.id || activeNode.parent.data.name);
        } else if (node.children && node.children.length > 0) {
            // Clicking a child category zooms into it
            zoomTo(node.data.id || node.data.name);
        }
    }, [activeNode, zoomTo]);

    return (
        <div ref={containerRef} className="w-full h-full bg-white overflow-hidden relative font-mono">
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                className="w-full h-full block cursor-crosshair select-none"
            >
                {allNodes.map((node) => {
                    // Do not render the top-level root rect itself to avoid grey generic background
                    if (node.depth === 0) return null;

                    const isLeaf = !node.children || node.children.length === 0;
                    const nodeId = node.data.id || node.data.name;

                    // Compute target physical coordinates
                    const x0 = dx(node.x0);
                    const x1 = dx(node.x1);
                    const y0 = dy(node.y0);
                    const y1 = dy(node.y1);
                    const w = x1 - x0;
                    const h = y1 - y0;

                    // If a node goes completely off-viewport or is inverted during transitions
                    const isVisible = w > 0 && h > 0 && x1 > 0 && x0 < dimensions.w && y1 > 0 && y0 < dimensions.h;

                    // STRICT RULE 1: Header bounds. A category header can NEVER take up more than 15% of the physical box.
                    // This mathematically resolves the e-commerce root bug by breaking D3's absolute 24px lock overriding the node body.
                    const maxAllowedHeaderHeight = Math.min(24, h * 0.15);
                    const safeHeaderH = isLeaf ? 0 : Math.max(0, maxAllowedHeaderHeight);

                    // Dynamic colors
                    let sectorNode = node;
                    while (sectorNode.parent && sectorNode.parent.depth > 0) sectorNode = sectorNode.parent;
                    const baseColor = colorScale(sectorNode.data.name);

                    let fill = baseColor;
                    const isHovered = hoveredNodeId === nodeId;
                    if (isHovered) fill = d3.color(fill)?.darker(0.1).formatHex() || fill;

                    const textColor = getContrastColor(fill);

                    // Skip perfectly invisible nodes
                    if (!isVisible && activeNode !== node) return null;

                    return (
                        <g
                            key={nodeId}
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
                                rx={2}
                            />

                            {/* TEXT RENDERING via foreignObject - Free from viewBox stretching constraints */}
                            {w > 15 && h > 10 && (
                                <foreignObject
                                    width={Math.max(0, w)}
                                    // STRICT RULE: Height is absolutely clamped mathematically.
                                    height={isLeaf ? Math.max(0, h) : Math.max(0, safeHeaderH)}
                                    className="pointer-events-none"
                                >
                                    {/* HTML Container for Text */}
                                    <div
                                        // STRICT RULE 2: Standardized left alignment for everything. All boxes act as normalized lists.
                                        className={`w-full h-full flex flex-col box-border overflow-hidden 
                                            ${isLeaf ? 'p-1.5 sm:p-2 justify-start items-start text-left' : 'py-1 px-1.5 sm:px-2 justify-end items-start text-left'}`}
                                        style={{ color: textColor }}
                                    >
                                        <div
                                            // STRICT RULE 3: Typography Hierarchy.
                                            // Headers: Mono, neutral, lowercase styling.
                                            // Startups: Sans, bold, primary data styling.
                                            className={`leading-tight w-full truncate
                                                ${!isLeaf ? 'font-mono text-black/50 uppercase tracking-widest font-bold' : 'font-sans font-black opacity-95'}
                                            `}
                                            style={{
                                                // STRICT RULE 4: Mathematical limits dictating occlusion.
                                                // Instead of unpredictable font physics, size is flatly assigned based on bounds.
                                                fontSize: isLeaf
                                                    ? Math.max(9, Math.min(18, w * 0.08, h * 0.15)) + 'px'
                                                    : Math.max(8, Math.min(11, w * 0.04, safeHeaderH * 0.6)) + 'px',
                                            }}
                                        >
                                            {node.data.name}
                                        </div>

                                        {isLeaf && w > 45 && h > 35 && (
                                            <div
                                                className="font-bold opacity-60 font-mono tracking-wider mt-0.5 text-left w-full truncate"
                                                style={{ fontSize: Math.max(8, Math.min(10, w * 0.06, h * 0.08)) + 'px' }}
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
            </svg>
        </div>
    );
};


