import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import type { Startup } from '../types';
import { type TreemapNode } from '../data/transformer';

interface D3TreemapProps {
    data: TreemapNode;
    startups: Startup[];
    onStartupHover: (s: Startup | null, isCategory?: boolean, categoryName?: string) => void;
}

// Helper to determine text color based on background luminance
export function getContrastColor(hexcolor: string) {
    if (!hexcolor) return '#000000';
    hexcolor = hexcolor.replace('#', '');
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
}

export const D3Treemap: React.FC<D3TreemapProps> = ({ data, startups, onStartupHover }) => {
    const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
    const [activePath, setActivePath] = useState<TreemapNode[]>([data]);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

    const activeNode = activePath[activePath.length - 1];

    // Responsive container
    const containerRef = React.useCallback((node: HTMLDivElement | null) => {
        if (node) {
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    setDimensions({
                        w: entry.contentRect.width,
                        h: entry.contentRect.height
                    });
                }
            });
            resizeObserver.observe(node);
            setDimensions({ w: node.clientWidth, h: node.clientHeight });
            return () => resizeObserver.disconnect();
        }
    }, []);

    // Layout configuration
    const PADDING_TOP = 22; // Static physical height for headers matching Paradigm
    const PADDING_INNER = 2;

    const colorScale = useMemo(() => {
        const sectors = data.children?.map(d => d.name) || [];
        return d3.scaleOrdinal<string>()
            .domain(sectors)
            .range(['#E6F4FF', '#F6FFED', '#FFF0F6', '#FFF7E6', '#F9F0FF', '#FFF1F0', '#E6FFFB', '#F5F5F5', '#FEFFE6', '#FCFFE6']);
    }, [data]);

    // Live D3 Hierarchy & Layout Generation targeted EXACTLY at the activeNode root
    const layoutNodes = useMemo(() => {
        if (!dimensions.w || !dimensions.h || !activeNode) return [];

        // 1. Create a fresh D3 hierarchy starting from the active node as root
        const root = d3.hierarchy<TreemapNode>(activeNode)
            .sum(d => d.value || 0)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        // 2. Configure a true native layout mapped exactly to physical screen pixels
        const treemapLayout = d3.treemap<TreemapNode>()
            .size([dimensions.w, dimensions.h])
            .paddingTop(node => node.depth === 0 ? 0 : PADDING_TOP)
            .paddingInner(PADDING_INNER)
            .paddingOuter(0)
            .round(true);

        treemapLayout(root);

        return root.descendants();
    }, [activeNode, dimensions]);

    // Format utility
    const formatValue = (value?: number) => {
        if (!value) return '';
        return value > 999 ? `€${(value / 1000).toFixed(1)}B` : `€${value}M`;
    };

    const getContrastColor = (hexcolor: string) => {
        const hex = hexcolor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000000' : '#ffffff';
    };

    // Interaction handling
    const handleNodeClick = (e: React.MouseEvent, node: d3.HierarchyNode<TreemapNode>) => {
        e.stopPropagation();
        const isLeaf = !node.children || node.children.length === 0;

        // If clicking a category (not a leaf), zoom into it
        if (!isLeaf) {
            setActivePath(prev => [...prev, node.data]);
        }
    };

    const handleBreadcrumbClick = (index: number) => {
        setActivePath(prev => prev.slice(0, index + 1));
    };

    if (!dimensions.w || !dimensions.h) return <div ref={containerRef} className="w-full h-full bg-white" />;

    return (
        <div className="w-full h-full flex flex-col bg-white overflow-hidden relative font-mono">
            {/* Paradigm Style Breadcrumbs */}
            {activePath.length > 1 && (
                <div className="w-full bg-[#f9f9f9] border-b border-gray-200 px-4 py-2 flex items-center gap-2 text-sm text-gray-600 font-mono z-10 shrink-0 shadow-sm overflow-x-auto whitespace-nowrap">
                    <span className="text-gray-400">Path:</span>
                    {activePath.map((node, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && <span className="text-gray-300">/</span>}
                            <button
                                onClick={() => handleBreadcrumbClick(index)}
                                className={`hover:text-black transition-colors ${index === activePath.length - 1 ? 'font-bold text-black' : ''}`}
                            >
                                {node.name}
                            </button>
                        </React.Fragment>
                    ))}
                </div>
            )}

            <div ref={containerRef} className="w-full flex-grow relative">
                <AnimatePresence>
                    {layoutNodes.map((node) => {
                        // Skip rendering the root block completely to avoid visual background stacking
                        if (node.depth === 0) return null;

                        const isLeaf = !node.children || node.children.length === 0;
                        const nodeId = node.data.id || node.data.name;

                        // Physical geometry calculations natively pulled from D3's processed squarify output
                        const typedNode = node as d3.HierarchyRectangularNode<TreemapNode>;
                        const x0 = typedNode.x0;
                        const y0 = typedNode.y0;
                        const w = Math.max(0, typedNode.x1 - typedNode.x0);
                        const h = Math.max(0, typedNode.y1 - typedNode.y0);

                        // E-commerce nested category fix: Ensure we never draw if mathematically invisible
                        if (w <= 0 || h <= 0) return null;

                        // Paradigm Styling Rules: Categories are transparent borders, Startups have colored fills
                        let sectorNode = node;
                        while (sectorNode.parent && sectorNode.parent.depth > 0) sectorNode = sectorNode.parent;
                        const baseColor = colorScale(sectorNode.data.name);

                        let fill = isLeaf ? baseColor : 'transparent';
                        const isHovered = hoveredNodeId === nodeId;
                        if (isLeaf && isHovered) fill = d3.color(fill)?.darker(0.1).formatHex() || fill;

                        const textColor = isLeaf ? getContrastColor(fill) : '#333333';

                        return (
                            <motion.div
                                key={`${activeNode.name}-${node.depth}-${nodeId}`} // Force fresh dom elements strictly mapped to rendering root context and depth to prevent E-commerce key overlap
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    x: x0,
                                    y: y0,
                                    width: w,
                                    height: h
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                style={{ position: 'absolute', left: 0, top: 0, originX: 0, originY: 0 }}
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
                                className={`box-border flex flex-col cursor-crosshair
                                    ${!isLeaf ? 'border border-gray-400 bg-transparent hover:bg-gray-50/30 transition-colors' : 'shadow-sm'}
                                `}
                            >
                                {/* Startups: Fills completely. Categories: Gets a transparent bounding box */}
                                {isLeaf && (
                                    <div
                                        className="absolute inset-0 z-0 rounded-[1px] shadow-sm ring-1 ring-inset ring-black/5"
                                        style={{ backgroundColor: fill }}
                                    />
                                )}

                                {/* Header text isolation for Categories */}
                                {!isLeaf && w > 30 && h > PADDING_TOP && (
                                    <div
                                        className="w-full border-b border-gray-300 flex items-center shrink-0 px-2 overflow-hidden bg-[#f0f0f0]/30"
                                        style={{ height: PADDING_TOP }}
                                    >
                                        <span className="font-mono text-[11px] font-bold text-gray-500 uppercase tracking-widest truncate leading-none pt-0.5">
                                            {node.data.name}
                                        </span>
                                    </div>
                                )}

                                {/* Startup Body Data OR Empty Space for Category Children */}
                                {isLeaf && (
                                    <div
                                        className="w-full h-full flex flex-col p-1.5 sm:p-2 justify-start items-start text-left z-10 overflow-hidden"
                                        style={{ color: textColor }}
                                    >
                                        {w > 15 && h > 10 && (
                                            <span
                                                className="font-sans font-black opacity-95 leading-tight w-full truncate"
                                                style={{ fontSize: Math.max(10, Math.min(18, w * 0.1, h * 0.2)) + 'px' }}
                                            >
                                                {node.data.name}
                                            </span>
                                        )}
                                        {w > 45 && h > 35 && (
                                            <span
                                                className="font-mono font-bold opacity-60 tracking-wider mt-0.5 text-left w-full truncate"
                                                style={{ fontSize: Math.max(9, Math.min(11, w * 0.08, h * 0.1)) + 'px' }}
                                            >
                                                {formatValue(node.data.value)}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default D3Treemap;
