import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap';
import type { Startup } from '../types';
import { transformStartupsToHierarchy, type TreemapNode } from '../data/transformer';

interface D3TreemapProps {
    startups: Startup[];
    onStartupHover: (s: Startup | null, isCategory?: boolean, categoryName?: string) => void;
}


export const D3Treemap: React.FC<D3TreemapProps> = ({ startups, onStartupHover }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

    // Track real container pixel dimensions to avoid viewBox stretching
    const [dimensions, setDimensions] = useState({ w: 1600, h: 1000 });
    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            if (width > 0 && height > 0) setDimensions({ w: width, h: height });
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    const fullHierarchy = useMemo(() => transformStartupsToHierarchy(startups), [startups]);

    // MANDATE 3: Visual floor so tiny startups remain clickable
    // MANDATE 2: Native D3 paddingTop carves physical header space during layout math, preventing all overlaps
    const root = useMemo(() => {
        const h = d3.hierarchy(fullHierarchy)
            .sum(d => Math.max(d.value || 0, 100))   // MANDATE 3: floor at 100
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        const treemapLayout = d3.treemap<TreemapNode>()
            .size([dimensions.w, dimensions.h])
            .paddingTop(node => node.children ? 24 : 0)  // Reserve 24px for every parent header
            .paddingInner(2)
            .paddingOuter(1)
            .round(true)
            .tile(d3.treemapSquarify);

        treemapLayout(h);
        return h as d3.HierarchyRectangularNode<TreemapNode>;
    }, [fullHierarchy, dimensions]);

    // MANDATE 4: Sort by depth so parents paint behind children (SVG is back-to-front)
    const sortedNodes = useMemo(
        () => [...root.descendants()].sort((a, b) => a.depth - b.depth),
        [root]
    );

    // ─── ZOOM STATE ─────────────────────────────────────────────────
    const [zoomPathId, setZoomPathId] = useState<string | null>(null);

    const activeNode = useMemo(() => {
        if (!zoomPathId) return root;
        return root.descendants().find(n => (n.data.id || n.data.name) === zoomPathId) || root;
    }, [root, zoomPathId]);

    // MANDATE 5: GSAP tweens the viewport domain, D3 scales map everything else
    const viewportRef = useRef({ x0: 0, x1: dimensions.w, y0: 0, y1: dimensions.h });
    const [viewport, setViewport] = useState(viewportRef.current);

    useEffect(() => {
        gsap.killTweensOf(viewportRef.current);
        gsap.to(viewportRef.current, {
            x0: activeNode.x0,
            x1: activeNode.x1,
            y0: activeNode.y0,
            y1: activeNode.y1,
            duration: 0.75,
            ease: 'power3.inOut',
            onUpdate() { setViewport({ ...viewportRef.current }); }
        });
    }, [activeNode]);

    // MANDATE 5: D3 linear scales — the *only* coordinate mapping
    const dx = useMemo(() => d3.scaleLinear().domain([viewport.x0, viewport.x1]).range([0, dimensions.w]), [viewport, dimensions]);
    const dy = useMemo(() => d3.scaleLinear().domain([viewport.y0, viewport.y1]).range([0, dimensions.h]), [viewport, dimensions]);

    const colorScale = useMemo(() => {
        const sectors = fullHierarchy.children?.map(d => d.name) || [];
        return d3.scaleOrdinal<string>()
            .domain(sectors)
            .range(['#E6F4FF', '#F6FFED', '#FFF0F6', '#FFF7E6', '#F9F0FF',
                '#FFF1F0', '#E6FFFB', '#F5F5F5', '#FEFFE6', '#FCFFE6']);
    }, [fullHierarchy]);

    const formatValue = (value?: number) => {
        if (!value) return '';
        return value > 999 ? `€${(value / 1000).toFixed(1)}B` : `€${value}M`;
    };

    // MANDATE 7: Navigation handlers
    const zoomTo = useCallback((id: string | null) => setZoomPathId(id), []);

    const handleNodeClick = useCallback((e: React.MouseEvent, node: d3.HierarchyRectangularNode<TreemapNode>) => {
        e.stopPropagation();
        if (node === activeNode && activeNode.parent) {
            // Re-click active node → zoom out
            zoomTo(activeNode.parent.data.id || activeNode.parent.data.name || null);
        } else if (node.children && node.children.length > 0) {
            // Click parent category → zoom in
            zoomTo(node.data.id || node.data.name);
        }
    }, [activeNode, zoomTo]);

    if (!dimensions.w || !dimensions.h) return <div ref={containerRef} className="w-full h-full bg-white" />;

    return (
        <div ref={containerRef} className="w-full h-full bg-white overflow-hidden relative">
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                className="w-full h-full block cursor-crosshair select-none"
            >
                {/* MANDATE 4: sortedNodes guarantees parents paint before children */}
                {sortedNodes.map((node) => {
                    if (node.depth === 0) return null;

                    const isLeaf = !node.children || node.children.length === 0;
                    const nodeId = node.data.id || node.data.name;

                    // MANDATE 5: Pure scale-based coordinates — no custom math
                    const x0 = dx(node.x0);
                    const x1 = dx(node.x1);
                    const y0 = dy(node.y0);
                    const y1 = dy(node.y1);
                    const w = x1 - x0;
                    const h = y1 - y0;

                    if (w <= 0 || h <= 0) return null;

                    // Cull nodes fully outside viewport
                    if (x1 < 0 || x0 > dimensions.w || y1 < 0 || y0 > dimensions.h) return null;

                    // Color logic: PARENT nodes carry the sector color; LEAF nodes are transparent wireframes.
                    let sectorNode = node;
                    while (sectorNode.parent && sectorNode.parent.depth > 0) sectorNode = sectorNode.parent;
                    const sectorColor = colorScale(sectorNode.data.name);
                    const isHovered = hoveredNodeId === nodeId;
                    // Parents get the pastel sector fill; leaves get a near-transparent white over the parent's color
                    const fill = isLeaf
                        ? (isHovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)')
                        : (isHovered ? (d3.color(sectorColor)?.darker(0.12).formatHex() || sectorColor) : sectorColor);


                    return (
                        <g
                            key={nodeId}
                            transform={`translate(${x0},${y0})`}
                            onMouseEnter={() => {
                                setHoveredNodeId(nodeId);
                                if (isLeaf) {
                                    const s = startups.find(x => x.id === node.data.id);
                                    onStartupHover(s || null);
                                } else {
                                    onStartupHover(null, true, node.data.name);
                                }
                            }}
                            onMouseLeave={() => { setHoveredNodeId(null); onStartupHover(null); }}
                            onClick={(e) => handleNodeClick(e, node)}
                            style={{ cursor: isLeaf ? 'default' : 'pointer' }}
                        >
                            <rect
                                width={Math.max(0, w)}
                                height={Math.max(0, h)}
                                fill={fill}
                                stroke="rgba(0,0,0,0.08)"
                                strokeWidth={isHovered ? 2 : 1}
                                rx={1}
                            />

                            {/* PARENT HEADER: rendered in the 24px D3 reserved space at the top of the node */}
                            {!isLeaf && w > 30 && (
                                <foreignObject
                                    x={0}
                                    y={0}
                                    width={Math.max(0, w)}
                                    height={24}
                                    className="pointer-events-none overflow-hidden"
                                >
                                    <div className="w-full h-full flex items-center px-2 overflow-hidden">
                                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest truncate text-[#444444] opacity-70">
                                            {node.data.name}
                                        </span>
                                    </div>
                                </foreignObject>
                            )}

                            {/* LEAF NODE TEXT: company name + funding value */}
                            {isLeaf && w > 40 && h > 25 && (
                                <foreignObject
                                    width={Math.max(0, w)}
                                    height={Math.max(0, h)}
                                    className="pointer-events-none overflow-hidden"
                                >
                                    <div className="w-full h-full flex flex-col overflow-hidden p-1.5 box-border justify-start">
                                        <div className="font-sans font-black text-xs leading-tight truncate w-full text-[#111111]">
                                            {node.data.name}
                                        </div>
                                        {h > 38 && (
                                            <div className="font-mono text-[9px] opacity-55 truncate w-full mt-0.5 text-[#333333]">
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
