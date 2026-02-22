import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import * as d3 from 'd3';
import type { Startup } from '../types';
import { transformStartupsToHierarchy, type TreemapNode } from '../data/transformer';

interface D3TreemapProps {
    startups: Startup[];
    onStartupHover: (s: Startup | null, isCategory?: boolean, categoryName?: string) => void;
}

type D3Node = d3.HierarchyRectangularNode<TreemapNode> & { uid: string };

export const D3Treemap: React.FC<D3TreemapProps> = ({ startups, onStartupHover }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [dimensions, setDimensions] = useState({ w: 1600, h: 1000 });
    const [zoomUid, setZoomUid] = useState<string>('root');

    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            if (width > 0 && height > 0) setDimensions({ w: width, h: height });
        });
        const target = containerRef.current.querySelector('.map-container') || containerRef.current;
        resizeObserver.observe(target);
        return () => resizeObserver.disconnect();
    }, []);

    const fullHierarchy = useMemo(() => transformStartupsToHierarchy(startups), [startups]);

    const { activeNode, nodesToRender, breadcrumbs } = useMemo(() => {
        // Build the tree and apply floor math ONLY to the startups (leaf nodes)
        const h = d3.hierarchy(fullHierarchy)
            .sum(d => (d.children && d.children.length > 0) ? 0 : Math.max(d.value || 0, 40))
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        // Assign stable UIDs based on path
        h.each((node) => {
            const d3Node = node as unknown as D3Node;
            d3Node.uid = d3Node.parent ? `${d3Node.parent.uid}/${d3Node.data.id || d3Node.data.name}` : 'root';
            // Store a reference inside .data so it survives the .copy() clone
            (d3Node.data as any)._uid = d3Node.uid;
        });

        const rootNode = h as D3Node;
        const active = (rootNode.descendants().find(n => n.uid === zoomUid) || rootNode) as D3Node;

        const crumbs = [];
        let current: D3Node | null = active;
        while (current) {
            crumbs.unshift({ uid: current.uid, name: current.data.name });
            current = current.parent as D3Node | null;
        }

        // REDRAW AS ROOT FIX: D3 treemap mathematically crashes if the input node's depth > 0 (NaN bug).
        // To fix this, we create a strict .copy() proxy to reset depth, compute the dimensions, and map them back.
        const isolatedSubtree = active.copy();
        isolatedSubtree.sum(d => (d.children && d.children.length > 0) ? 0 : Math.max(d.value || 0, 40));

        const treemapLayout = d3.treemap<TreemapNode>()
            .size([dimensions.w, dimensions.h])
            .paddingOuter(0)
            .paddingTop(node => (node.depth > 0 && node.children) ? 24 : 0)
            .paddingInner(1)
            .round(false)
            .tile(d3.treemapSquarify);

        treemapLayout(isolatedSubtree as d3.HierarchyRectangularNode<TreemapNode>);

        // Match the perfectly calculated dimensions back to the original permanent React state nodes
        isolatedSubtree.each((isoNode: any) => {
            const origNode = active.descendants().find(n => n.uid === isoNode.data._uid);
            if (origNode) {
                origNode.x0 = isoNode.x0;
                origNode.x1 = isoNode.x1;
                origNode.y0 = isoNode.y0;
                origNode.y1 = isoNode.y1;
            }
        });

        const renderNodes = active.descendants().sort((a, b) => a.depth - b.depth);

        return { activeNode: active, nodesToRender: renderNodes, breadcrumbs: crumbs };
    }, [fullHierarchy, dimensions, zoomUid]);

    const colorScale = useMemo(() => {
        const sectors = fullHierarchy.children?.map(d => d.name) || [];
        return d3.scaleOrdinal<string>()
            .domain(sectors)
            .range(['#EAFBDE', '#F9F0FF', '#F0F5FA', '#FFF0F6', '#FEFFE6', '#E6FFFB', '#FFF1F0', '#F5F5F5', '#E6F4FF', '#FCFFE6']);
    }, [fullHierarchy]);

    const getSectorColor = useCallback((node: D3Node) => {
        if (!node) return '#fcfdfc';
        let n = node;
        while (n.depth > 1 && n.parent) n = n.parent as D3Node;
        return n.depth === 1 ? colorScale(n.data.name) : '#fcfdfc';
    }, [colorScale]);

    const formatValue = (value?: number) => {
        if (!value) return '';
        return value > 999 ? `€${(value / 1000).toFixed(1)}B` : `€${value}M`;
    };

    const zoomTo = useCallback((uid: string) => {
        setZoomUid(uid);
    }, []);

    if (!dimensions.w || !dimensions.h) return <div ref={containerRef} className="w-full h-full bg-white" />;

    return (
        <div ref={containerRef} className="w-full h-full bg-white flex flex-col overflow-hidden relative font-mono text-[#333]">

            {/* --- TOP BREADCRUMB NAVIGATION --- */}
            <div className="flex-shrink-0 h-10 border-b border-black/20 flex items-center px-6 bg-[#f8fafc] text-[11px] font-bold uppercase tracking-widest text-black/40 select-none z-10">
                {breadcrumbs.map((crumb, i) => (
                    <React.Fragment key={crumb.uid}>
                        <span
                            className={`cursor-pointer hover:text-violet-accent hover:underline transition-colors ${i === breadcrumbs.length - 1 ? 'text-black font-black pointer-events-none' : ''}`}
                            onClick={() => zoomTo(crumb.uid)}
                        >
                            {crumb.name}
                        </span>
                        {i < breadcrumbs.length - 1 && <span className="mx-3 text-black/20">/</span>}
                    </React.Fragment>
                ))}
            </div>

            {/* --- D3 MAP RENDERER --- */}
            <div className="flex-1 w-full relative map-container bg-[#fcfdfc] pointer-events-none">
                <svg
                    width="100%" height="100%" className="w-full h-full block select-none cursor-pointer pointer-events-auto"
                    onClick={() => { if (activeNode.parent) zoomTo((activeNode.parent as D3Node).uid); }}
                >
                    {nodesToRender.map((node) => {
                        // We skip depth 0 entirely. The SVG background handles the outermost fill.
                        if (node.depth === 0) return null;

                        const isLeaf = !node.children || node.children.length === 0;
                        const isActiveRoot = node.uid === activeNode.uid;
                        const x0 = node.x0, y0 = node.y0, w = node.x1 - node.x0, h = node.y1 - node.y0;

                        if (isNaN(w) || isNaN(h) || w <= 0.5 || h <= 0.5) return null;

                        // Dynamic Layering: Ensure the active zoom container always paints the true background
                        let fillColor = 'transparent';
                        if (isActiveRoot || node.depth === 1) {
                            fillColor = getSectorColor(node);
                        } else if (isLeaf) {
                            fillColor = hoveredNodeId === node.uid ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)';
                        }

                        const transitionStyle = { transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' };

                        return (
                            <g key={node.uid} transform={`translate(${x0},${y0})`}
                                style={{ ...transitionStyle, cursor: isLeaf ? 'crosshair' : 'pointer' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isLeaf) return; // Leaf nodes do not trigger zoom
                                    if (isActiveRoot && activeNode.parent) {
                                        zoomTo((activeNode.parent as D3Node).uid); // Smart Toggle: Zoom out
                                    } else {
                                        zoomTo(node.uid); // Zoom in
                                    }
                                }}
                                onMouseEnter={() => { if (isLeaf) { setHoveredNodeId(node.uid); onStartupHover(startups.find(x => x.id === node.data.id) || null); } }}
                                onMouseLeave={() => { if (isLeaf) { setHoveredNodeId(null); onStartupHover(null); } }}
                            >
                                <rect
                                    width={w} height={h}
                                    fill={fillColor}
                                    stroke="#000" strokeWidth="1" strokeOpacity={isLeaf ? "0.2" : "0.1"}
                                    shapeRendering="crispEdges"
                                    style={transitionStyle}
                                />
                                {/* Headers for Parents (Includes the active node so it never disappears) */}
                                {!isLeaf && w > 30 && h > 15 && (
                                    <foreignObject width={w} height={24} className="pointer-events-none" style={transitionStyle}>
                                        <div className="w-full h-full flex items-center px-2 text-[10px] font-mono font-bold uppercase tracking-widest text-black/60 truncate border-b border-black/10">
                                            {node.data.name}
                                        </div>
                                    </foreignObject>
                                )}
                                {/* Startup Details for Leaves */}
                                {isLeaf && w > 35 && h > 20 && (
                                    <foreignObject width={w} height={h} className="pointer-events-none" style={transitionStyle}>
                                        <div className="w-full h-full flex flex-col p-1.5 overflow-hidden">
                                            <div className="truncate font-sans font-bold text-[11px] text-black/90 leading-tight">
                                                {node.data.name}
                                            </div>
                                            {w > 45 && h > 30 && (
                                                <div className="truncate font-mono text-[9px] font-bold text-black/40 mt-0.5">
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
        </div>
    );
};