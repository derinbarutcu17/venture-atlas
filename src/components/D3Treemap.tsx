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
            .paddingTop(node => node.depth > 0 && node.children ? 24 : 0)
            .paddingInner(2)
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




    if (!dimensions.w || !dimensions.h) return <div ref={containerRef} className="w-full h-full bg-white" />;

    return (
        <div ref={containerRef} className="w-full h-full bg-white overflow-hidden relative">
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                className="w-full h-full block cursor-crosshair select-none"
            >
                {sortedNodes.map(node => {
                    if (node.depth === 0) return null;

                    const x0 = dx(node.x0), x1 = dx(node.x1), y0 = dy(node.y0), y1 = dy(node.y1);
                    const w = Math.max(0, x1 - x0);
                    const h = Math.max(0, y1 - y0);
                    const isLeaf = !node.children;

                    if (w <= 0 || h <= 0) return null;

                    // --- RENDER PARENT CONTAINERS (Headers & Colored Backgrounds) ---
                    if (!isLeaf) {
                        return (
                            <g key={node.data.name} style={{ transform: `translate(${x0}px, ${y0}px)` }} onClick={(e) => { e.stopPropagation(); zoomTo(node.data.name); }}>
                                <rect width={w} height={h} fill={colorScale(node.data.name)} stroke="rgba(0,0,0,0.1)" />
                                {w > 30 && h > 20 && (
                                    <foreignObject width={w} height={24} className="pointer-events-none">
                                        <div className="w-full h-full flex items-center px-1.5 text-[9px] font-mono font-bold uppercase tracking-widest text-black/40 truncate">
                                            {node.data.name}
                                        </div>
                                    </foreignObject>
                                )}
                            </g>
                        );
                    }

                    // --- RENDER LEAF NODES (Startups) ---
                    if (isLeaf) {
                        return (
                            <g key={node.data.id} style={{ transform: `translate(${x0}px, ${y0}px)` }}
                                onMouseEnter={() => { setHoveredNodeId(node.data.id || node.data.name); const s = startups.find(x => x.id === node.data.id); onStartupHover(s || null); }}
                                onMouseLeave={() => { setHoveredNodeId(null); onStartupHover(null); }}
                            >
                                <rect
                                    width={w} height={h}
                                    fill={hoveredNodeId === (node.data.id || node.data.name) ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.55)'}
                                    stroke="rgba(0,0,0,0.15)"
                                />
                                {w > 40 && h > 25 && (
                                    <foreignObject width={w} height={h} className="pointer-events-none">
                                        <div className="w-full h-full flex flex-col p-1.5 overflow-hidden">
                                            <div className="truncate font-sans font-bold text-[11px] text-black leading-tight">
                                                {node.data.name}
                                            </div>
                                            {w > 50 && h > 35 && (
                                                <div className="truncate font-mono text-[9px] font-bold text-black/50 mt-0.5">
                                                    {formatValue(node.data.value)}
                                                </div>
                                            )}
                                        </div>
                                    </foreignObject>
                                )}
                            </g>
                        );
                    }
                })}
            </svg>
        </div>
    );
};
