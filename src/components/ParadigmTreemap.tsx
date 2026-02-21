import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { gsap } from 'gsap';
import type { Startup } from '../types';
import { transformStartupsToHierarchy } from '../data/transformer';
import type { TreemapNode } from '../data/transformer';

interface ParadigmTreemapProps {
    startups: Startup[];
    onStartupHover: (startup: Startup | null, isCategory?: boolean, categoryName?: string) => void;
}

export const ParadigmTreemap: React.FC<ParadigmTreemapProps> = ({ startups, onStartupHover }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

    // ─── ZOOM & PAN STATE (Exactly mirroring D3Treemap) ───────────
    const [zoomPathId, setZoomPathId] = useState<string | null>(null);
    const [viewport, setViewport] = useState({ x0: 0, x1: 1, y0: 0, y1: 1 });
    const viewportRef = useRef(viewport);

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setDimensions({
                    w: containerRef.current.clientWidth,
                    h: containerRef.current.clientHeight
                });
            }
        };
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // ─── DATA & LAYOUT ──────────────────────────────────────────────
    const fullHierarchy = useMemo(() => transformStartupsToHierarchy(startups), [startups]);

    const { root, allNodes } = useMemo(() => {
        if (!dimensions.w || !dimensions.h) return { root: null, allNodes: [] };

        const h = d3.hierarchy<TreemapNode>(fullHierarchy)
            .sum(d => d.value || 0)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        const treemapLayout = d3.treemap<TreemapNode>()
            .size([dimensions.w, dimensions.h])
            // PARADIGM SPECIFIC PHYSICS:
            // Force strict 22px physical margins at the top of every single parent structural node
            // This is what creates the "Header Bar" block above nested children, rather than floating labels.
            .paddingTop(node => node.depth === 0 ? 0 : 22)
            // Add explicit 1px physical gaps between all blocks to create the wireframe aesthetic
            .paddingInner(1)
            .paddingOuter(2)
            .round(true)
            .tile(d3.treemapSquarify);

        treemapLayout(h);
        const rectNodeRoot = h as d3.HierarchyRectangularNode<TreemapNode>;
        return { root: rectNodeRoot, allNodes: rectNodeRoot.descendants() };
    }, [fullHierarchy, dimensions]);

    // ─── GSAP ZOOM LOGIC ────────────────────────────────────────────
    const activeNode = useMemo(() => {
        if (!root) return null;
        if (!zoomPathId) return root;

        let found: d3.HierarchyRectangularNode<TreemapNode> | null = null;
        root.each((n) => {
            if ((n.data.id === zoomPathId || n.data.name === zoomPathId) && !found) {
                found = n;
            }
        });
        return found || root;
    }, [root, zoomPathId]);

    useEffect(() => {
        if (!activeNode || !dimensions.w || !dimensions.h) return;

        gsap.to(viewportRef.current, {
            x0: activeNode.x0,
            x1: activeNode.x1,
            y0: activeNode.y0,
            y1: activeNode.y1,
            duration: 0.8,
            ease: "power3.inOut",
            onUpdate: function () {
                setViewport({ ...viewportRef.current });
            }
        });
    }, [activeNode, dimensions]);

    const dx = useMemo(() => d3.scaleLinear().domain([viewport.x0, viewport.x1]).range([0, dimensions.w]), [viewport, dimensions]);
    const dy = useMemo(() => d3.scaleLinear().domain([viewport.y0, viewport.y1]).range([0, dimensions.h]), [viewport, dimensions]);

    // Format utility
    const formatValue = (value?: number) => {
        if (!value) return '';
        return value > 999 ? `$${(value / 1000).toFixed(1)}B` : `$${value}M`;
    };

    // ─── INTERACTION ────────────────────────────────────────────────
    const zoomTo = useCallback((nodeId: string | null) => {
        setZoomPathId(nodeId);
    }, []);

    const handleNodeClick = useCallback((e: React.MouseEvent, node: d3.HierarchyRectangularNode<TreemapNode>) => {
        e.stopPropagation();
        if (node === activeNode && activeNode.parent) {
            zoomTo(activeNode.parent.data.id || activeNode.parent.data.name);
        } else if (node.children && node.children.length > 0) {
            zoomTo(node.data.id || node.data.name);
        }
    }, [activeNode, zoomTo]);

    // ─── COLORS ─────────────────────────────────────────────────────
    const getParadigmSectorColor = (sectorName: string) => {
        // Mocking the specific pastel background fills seen in Paradigm grids mapping to Venture Atlas data
        const hash = sectorName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const palettes = ['#EAFBDE', '#F9F0FF', '#F0F5FA', '#FFF0F6', '#FEFFE6'];
        return palettes[hash % palettes.length];
    };

    if (!dimensions.w || !dimensions.h) return <div ref={containerRef} className="w-full h-full bg-white" />;

    return (
        <div ref={containerRef} className="w-full h-full bg-[#FCFDFC] overflow-hidden flex justify-center items-center py-4">
            {/* The outer structural wrapper forcing the exact layout look of Paradigm */}
            <div className="w-[98%] h-[98%] bg-white border border-black relative overflow-hidden font-mono text-[#333333]">
                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    className="w-full h-full block cursor-crosshair select-none"
                    onClick={() => { if (activeNode && activeNode.depth > 0) zoomTo(null); }}
                >
                    {allNodes.map((node) => {
                        if (node.depth === 0) return null; // Root box is handled by CSS wrapper

                        const isLeaf = !node.children || node.children.length === 0;
                        const nodeId = node.data.id || node.data.name;

                        // Calculate visual coordinates via GSAP viewbox scales
                        const x0 = dx(node.x0);
                        const x1 = dx(node.x1);
                        const y0 = dy(node.y0);
                        const y1 = dy(node.y1);
                        const w = x1 - x0;
                        const h = y1 - y0;

                        // Skip drawing boxes violently pushed off screen by zooming
                        const isVisible = w > 0 && h > 0 && x1 > 0 && x0 < dimensions.w && y1 > 0 && y0 < dimensions.h;
                        if (!isVisible && activeNode !== node) return null;

                        // Paradigm aesthetics: Nested depth sets color fill, leaves are green/transparent
                        let bgFill = "transparent";
                        if (node.depth === 1) {
                            bgFill = getParadigmSectorColor(node.data.name);
                        } else if (isLeaf) {
                            bgFill = "#EAFBDE"; // Solid payload color
                        }

                        const isHovered = hoveredNodeId === nodeId;
                        if (isHovered && isLeaf) bgFill = d3.color(bgFill)?.darker(0.1).formatHex() || bgFill;

                        return (
                            <g
                                key={nodeId}
                                style={{ transform: `translate(${x0}px, ${y0}px)` }}
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
                                {/* WIREFRAME RECTANGLE */}
                                <rect
                                    width={Math.max(0, w)}
                                    height={Math.max(0, h)}
                                    fill={bgFill}
                                    stroke="#333"
                                    strokeWidth={isLeaf ? 0.5 : 1}
                                    className="transition-colors duration-150"
                                />

                                {/* 
                                    ABSOLUTE TOP-LEFT SVG TEXT:
                                    Replaces complex foreignObject HTML layout math with raw, native SVG absolute positioning mapping.
                                */}
                                {w > 25 && h > 18 && (
                                    <text
                                        x={6}
                                        y={14}
                                        fill="#333"
                                        fontFamily="monospace"
                                        fontSize={isLeaf ? "10px" : "11px"}
                                        fontWeight={node.depth <= 2 ? "bold" : "normal"}
                                        style={{ pointerEvents: 'none' }}
                                    >
                                        {node.data.name} {node.data.value && !isLeaf ? formatValue(node.data.value) : ''}
                                    </text>
                                )}

                                {/* Dedicated Leaf Value Tag dropped below name */}
                                {isLeaf && w > 40 && h > 30 && node.data.value && (
                                    <text
                                        x={6}
                                        y={28}
                                        fill="#333"
                                        fontFamily="monospace"
                                        fontSize="9px"
                                        style={{ pointerEvents: 'none', opacity: 0.7 }}
                                    >
                                        {formatValue(node.data.value)}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};
