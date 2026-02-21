import React, { useMemo, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap';
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
    const [zoomPath, setZoomPath] = useState<TreemapNode[]>([]);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

    const fullHierarchy = useMemo(() => transformStartupsToHierarchy(startups), [startups]);

    // V13: Global Layout
    const root = useMemo(() => {
        const h = d3.hierarchy(fullHierarchy)
            .sum(d => d.value || 0)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        const treemapLayout = d3.treemap<TreemapNode>()
            .size([VIEWBOX_W, VIEWBOX_H])
            .paddingInner(0)
            .paddingOuter(0)
            .paddingTop(node => (node.children && node.depth < 3 ? 30 : 0))
            .round(true)
            .tile(d3.treemapSquarify);

        treemapLayout(h);
        return h as d3.HierarchyRectangularNode<TreemapNode>;
    }, [fullHierarchy]);

    const allNodes = useMemo(() => {
        return root.descendants();
    }, [root]);

    const colorScale = useMemo(() => {
        const sectors = fullHierarchy.children?.map(d => d.name) || [];
        return d3.scaleOrdinal<string>()
            .domain(sectors)
            .range(['#E6F4FF', '#F6FFED', '#FFF0F6', '#FFF7E6', '#F9F0FF', '#FFF1F0', '#E6FFFB', '#F5F5F5', '#FEFFE6', '#FCFFE6']);
    }, [fullHierarchy]);

    // V13: GSAP Box Expansion + CSS Variables
    const animateViewBox = useCallback((x0: number, y0: number, w: number, h: number) => {
        if (!svgRef.current || !containerRef.current) return;

        // Container aspect
        const containerW = containerRef.current.clientWidth;
        const containerH = containerRef.current.clientHeight;
        const containerAspect = containerW / containerH;
        const targetAspect = w / h;

        let finalX = x0;
        let finalY = y0;
        let finalW = w;
        let finalH = h;

        // Pad the viewbox so it fits the container without stretching,
        // which leaves neighbors visible on the edges instead of white gaps.
        if (targetAspect > containerAspect) {
            finalH = w / containerAspect;
            finalY = y0 - (finalH - h) / 2;
        } else {
            finalW = h * containerAspect;
            finalX = x0 - (finalW - w) / 2;
        }

        gsap.killTweensOf(svgRef.current);
        const currentViewbox = svgRef.current.viewBox.baseVal;

        gsap.to(
            { x: currentViewbox.x, y: currentViewbox.y, w: currentViewbox.width, h: currentViewbox.height },
            {
                x: finalX, y: finalY, w: finalW, h: finalH,
                duration: 1.2,
                ease: 'power3.inOut',
                onUpdate: function () {
                    const v = this.targets()[0] as { x: number; y: number; w: number; h: number };
                    svgRef.current?.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
                    // Performance fix: Update CSS variable instead of React state for 60fps text scaling
                    svgRef.current?.style.setProperty('--svg-scale', (v.w / VIEWBOX_W).toString());
                }
            }
        );
    }, []);

    const navigateTo = useCallback((pathIndex: number) => {
        const newPath = zoomPath.slice(0, pathIndex + 1);
        setZoomPath(newPath);
        const targetData = newPath[newPath.length - 1];
        const targetNode = allNodes.find(n => n.data === targetData);
        if (targetNode) {
            animateViewBox(targetNode.x0, targetNode.y0, targetNode.x1 - targetNode.x0, targetNode.y1 - targetNode.y0);
        } else {
            setZoomPath([]);
            animateViewBox(0, 0, VIEWBOX_W, VIEWBOX_H);
        }
    }, [zoomPath, allNodes, animateViewBox]);

    const resetToTop = useCallback(() => {
        setZoomPath([]);
        animateViewBox(0, 0, VIEWBOX_W, VIEWBOX_H);
    }, [animateViewBox]);

    const handleNodeClick = useCallback((node: d3.HierarchyRectangularNode<TreemapNode>) => {
        const data = node.data;
        if (!data.children || data.children.length === 0) return;
        setZoomPath(prev => [...prev, data]);
        animateViewBox(node.x0, node.y0, node.x1 - node.x0, node.y1 - node.y0);
    }, [animateViewBox]);

    return (
        <div ref={containerRef} className="w-full h-full bg-white overflow-hidden flex flex-col relative">
            {/* STACKED BREADCRUMB HEADERS (Polymarket Style) */}
            <div className="flex flex-col w-full border-b border-black">
                <div
                    onClick={resetToTop}
                    className="h-10 px-4 flex items-center bg-white border-b border-black cursor-pointer hover:bg-neutral-50 transition-colors group"
                >
                    <span className="text-[11px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-black transition-colors">
                        Berlin Startup Atlas
                    </span>
                    <span className="ml-2 text-[11px] font-black text-neutral-300">/</span>
                </div>
                {zoomPath.map((item, idx) => (
                    <div
                        key={idx}
                        onClick={() => navigateTo(idx)}
                        className="h-10 px-4 flex items-center bg-white border-b border-black cursor-pointer hover:bg-neutral-50 transition-colors group last:border-b-0"
                    >
                        <span className="text-[11px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-black transition-colors">
                            {item.name}
                        </span>
                        {idx < zoomPath.length - 1 && <span className="ml-2 text-[11px] font-black text-neutral-300">/</span>}
                    </div>
                ))}
            </div>

            <svg
                ref={svgRef}
                viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
                preserveAspectRatio="xMidYMid meet"
                className="flex-1 w-full block cursor-crosshair select-none"
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
            >
                {/* BACKGROUND RECT */}
                <rect width={VIEWBOX_W} height={VIEWBOX_H} fill="#fff" />

                {allNodes.map((node) => {
                    // Don't render the root container itself, just its children
                    if (node.depth === 0) return null;

                    const isLeaf = !node.data.children || node.data.children.length === 0;
                    const w = node.x1 - node.x0;
                    const h = node.y1 - node.y0;
                    const nodeId = node.data.id || node.data.name;

                    // COLOR LOGIC - Restored hierarchical sector mapping
                    let sectorNode = node;
                    while (sectorNode.parent && sectorNode.parent.depth > 0) sectorNode = sectorNode.parent;
                    const baseColor = colorScale(sectorNode.data.name);

                    let fill = baseColor;
                    const isHovered = hoveredNodeId === nodeId;
                    if (isHovered) fill = d3.color(fill)?.darker(0.1).formatHex() || fill;

                    // FONT SIZING - V13 Hardware Accelerated (calc + CSS Variable)
                    // The CSS variable --svg-scale is updated 60fps by GSAP on the svg container.
                    // This creates text that always visually appears as exactly Xpx without causing React renders.
                    const TARGET_SIZE_NAME = isLeaf ? 14 : 12;
                    const TARGET_SIZE_STATS = 10;

                    const paddingStr = `calc(6px * var(--svg-scale, 1))`;
                    const nameFontSizeStr = `calc(${TARGET_SIZE_NAME}px * var(--svg-scale, 1))`;
                    const statsFontSizeStr = `calc(${TARGET_SIZE_STATS}px * var(--svg-scale, 1))`;
                    const marginStr = `calc(2px * var(--svg-scale, 1))`;

                    // LABEL VISIBILITY
                    const showLabel = w > 40 && h > 20;

                    return (
                        <g
                            key={nodeId} // React Key ensures smooth transition if node stays
                            className="transition-all duration-500 ease-in-out" // CSS transition for x/y/w/h
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
                                e.stopPropagation();
                                handleNodeClick(node);
                            }}
                        >
                            <rect
                                x={node.x0}
                                y={node.y0}
                                width={w}
                                height={h}
                                fill={fill}
                                stroke="#000"
                                strokeOpacity={0.1}
                                strokeWidth={1}
                                vectorEffect="non-scaling-stroke"
                                style={{ transition: 'all 0.5s ease-in-out' }} // Smooth layout change
                            />

                            {showLabel && (
                                <foreignObject
                                    x={node.x0}
                                    y={node.y0}
                                    width={w}
                                    height={h}
                                    style={{ pointerEvents: 'none' }}
                                >
                                    <div
                                        className={`w-full h-full flex flex-col items-start overflow-hidden leading-none origin-top-left ${isLeaf ? 'justify-start' : 'justify-start'}`}
                                        style={{ padding: paddingStr }}
                                    >
                                        <span
                                            style={{
                                                fontSize: nameFontSizeStr,
                                                fontWeight: isLeaf ? 600 : 900,
                                                opacity: isLeaf ? 1 : 0.8,
                                                color: '#000',
                                                marginBottom: isLeaf ? marginStr : '0px',
                                                lineHeight: 1.1
                                            }}
                                            className="uppercase w-full truncate block"
                                        >
                                            {node.data.name}
                                        </span>
                                        {isLeaf && w > 60 && h > 30 && (
                                            <span
                                                style={{ fontSize: statsFontSizeStr }}
                                                className="font-black opacity-40 italic block"
                                            >
                                                €{node.data.value! > 999 ? (node.data.value! / 1000).toFixed(1) + 'B' : node.data.value + 'M'}
                                            </span>
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


