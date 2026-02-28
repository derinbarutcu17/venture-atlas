import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import type { Startup } from '../types';
import { transformStartupsToHierarchy, type TreemapNode } from '../data/transformer';

interface D3TreemapProps {
    startups: Startup[];
    onStartupHover: (s: Startup | null, isCategory?: boolean, categoryName?: string) => void;
}

type D3Node = d3.HierarchyRectangularNode<TreemapNode> & { uid: string };

const PALETTE = ['#EAFBDE', '#F9F0FF', '#F0F5FA', '#FFF0F6', '#FEFFE6', '#E6FFFB', '#FFF1F0', '#F5F5F5', '#E6F4FF', '#FCFFE6'];
const DUR = 480;
const MAX_EXPANSION = 8;

export const D3Treemap: React.FC<D3TreemapProps> = ({ startups, onStartupHover }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
    const [zoomUid, setZoomUid] = useState('root');
    const [breadcrumbs, setBreadcrumbs] = useState<{ uid: string; name: string }[]>([]);
    const [expansion, setExpansion] = useState(1); // 1 = 100% height, 4 = 400% height

    // Mutable refs so D3 handlers always read the latest values
    const zoomUidRef = useRef('root');
    const parentUidRef = useRef<string | null>(null);
    const onHoverRef = useRef(onStartupHover);
    const startupMapRef = useRef<Map<string, Startup>>(new Map());
    const colorScaleRef = useRef<d3.ScaleOrdinal<string, string>>(d3.scaleOrdinal<string>());
    const isScrollingRef = useRef(false);

    useEffect(() => { onHoverRef.current = onStartupHover; }, [onStartupHover]);
    useEffect(() => { startupMapRef.current = new Map(startups.map(s => [s.id, s])); }, [startups]);

    const fullHierarchy = useMemo(() => transformStartupsToHierarchy(startups), [startups]);

    const colorScale = useMemo(() => {
        const sectors = fullHierarchy.children?.map(d => d.name) || [];
        return d3.scaleOrdinal<string>().domain(sectors).range(PALETTE);
    }, [fullHierarchy]);

    useEffect(() => { colorScaleRef.current = colorScale; }, [colorScale]);

    // Resize observer
    useEffect(() => {
        if (!containerRef.current) return;
        const target = containerRef.current.querySelector('.map-container') as HTMLElement || containerRef.current;
        const ro = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            if (width > 0 && height > 0)
                setDimensions(prev => prev.w === width && prev.h === height ? prev : { w: width, h: height });
        });
        ro.observe(target);
        return () => ro.disconnect();
    }, []);

    // Wheel event interceptor for vertical expansion
    const handleWheel = useCallback((e: React.WheelEvent) => {
        const scrollTop = containerRef.current?.scrollTop || 0;

        if (e.deltaY > 0) {
            // Scrolling down: Expand map if not maxed out
            setExpansion(prev => {
                const next = Math.min(prev + 0.15, MAX_EXPANSION);
                if (next !== prev) isScrollingRef.current = true;
                return next;
            });
        } else if (e.deltaY < 0 && scrollTop <= 10) {
            // Scrolling up while at the top: Shrink map back
            setExpansion(prev => {
                const next = Math.max(prev - 0.15, 1);
                if (next !== prev) isScrollingRef.current = true;
                return next;
            });
        }
    }, []);

    // ─── Main D3 rendering effect ───────────────────────────────────────────────
    useEffect(() => {
        if (!dimensions.w || !dimensions.h || !svgRef.current) return;

        // Build full hierarchy with stable UIDs
        const h = d3.hierarchy<TreemapNode>(fullHierarchy)
            // SQUARE ROOT SCALING: Puffs up small values so they are visible.
            // Math.max(v, 300) ensures a readable minimum floor after root scaling.
            .sum(d => (!d.children?.length) ? Math.pow(Math.max(d.value || 0, 300), 0.5) : 0)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        h.each(node => {
            const n = node as unknown as D3Node;
            n.uid = n.parent ? `${(n.parent as D3Node).uid}/${n.data.id || n.data.name}` : 'root';
            (n.data as any)._uid = n.uid;
        });

        const fullRoot = h as D3Node;
        const activeFullNode = (fullRoot.descendants().find(n => n.uid === zoomUidRef.current) || fullRoot) as D3Node;
        parentUidRef.current = activeFullNode.parent ? (activeFullNode.parent as D3Node).uid : null;

        // Breadcrumbs from full hierarchy
        const crumbs: { uid: string; name: string }[] = [];
        let cur: D3Node | null = activeFullNode;
        while (cur) { crumbs.unshift({ uid: cur.uid, name: cur.data.name }); cur = cur.parent as D3Node | null; }
        setBreadcrumbs(crumbs);

        // Compute layout on isolated subtree
        const subtree = activeFullNode.copy();
        subtree.sum(d => (!d.children?.length) ? Math.pow(Math.max(d.value || 0, 300), 0.5) : 0);

        const layoutHeight = dimensions.h * expansion;

        d3.treemap<TreemapNode>()
            .size([dimensions.w, layoutHeight])
            .paddingOuter(0)
            .paddingTop(node => (node.depth > 0 && node.children) ? 24 : 0)
            .paddingInner(1)
            .round(false)
            .tile(d3.treemapSquarify)(subtree as d3.HierarchyRectangularNode<TreemapNode>);

        // Restore UIDs on isolated copy
        const isoRoot = subtree as D3Node;
        isoRoot.each((node: any) => { node.uid = node.data._uid; });

        // ─── Helpers ────────────────────────────────────────────────────────────
        const getSectorColor = (node: D3Node): string => {
            let n = node;
            while (n.depth > 1 && n.parent) n = n.parent as D3Node;
            return n.depth === 1 ? colorScaleRef.current(n.data.name) : '#fcfdfc';
        };

        const baseFill = (d: D3Node) => {
            if (d.depth === 1 || d.depth === 2) return getSectorColor(d);
            if (!d.children) return 'rgba(255,255,255,0.6)';
            return 'transparent';
        };

        const fmtVal = (v?: number) => !v ? '' : v > 999 ? `€${(v / 1000).toFixed(1)}B` : `€${v}M`;

        const paintFO = (gEl: Element, d: D3Node) => {
            const g = d3.select(gEl);
            const w = d.x1 - d.x0, hh = d.y1 - d.y0;
            const isLeaf = !d.children;
            const isRoot = d.uid === zoomUidRef.current;

            const foH = g.select<SVGForeignObjectElement>('foreignObject.fo-h');
            if (!isLeaf && !isRoot && w > 30 && hh > 15) {
                foH.attr('width', w).attr('height', 24).style('display', null);
                const el = foH.node();
                if (el) el.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;align-items:center;padding:0 8px;font-size:10px;font-family:ui-monospace,monospace;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(0,0,0,.6);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;border-bottom:1px solid rgba(0,0,0,.1)">${d.data.name}</div>`;
            } else {
                foH.style('display', 'none');
            }

            const foL = g.select<SVGForeignObjectElement>('foreignObject.fo-l');
            if (isLeaf && w > 35 && hh > 20) {
                foL.attr('width', w).attr('height', hh).style('display', null);
                const el = foL.node();
                if (el) el.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;flex-direction:column;padding:6px;overflow:hidden"><div style="font-size:11px;font-family:sans-serif;font-weight:700;color:rgba(0,0,0,.9);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;line-height:1.2">${d.data.name}</div>${(w > 45 && hh > 30 && d.data.value) ? `<div style="font-size:9px;font-family:ui-monospace,monospace;font-weight:700;color:rgba(0,0,0,.4);margin-top:2px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${fmtVal(d.data.value)}</div>` : ''}</div>`;
            } else {
                foL.style('display', 'none');
            }
        };

        // ─── Data join ──────────────────────────────────────────────────────────
        const renderNodes = (isoRoot.descendants() as D3Node[]).filter(n => {
            const nw = n.x1 - n.x0, nh = n.y1 - n.y0;
            return n.depth > 0 && !isNaN(nw) && !isNaN(nh) && nw > 0.5 && nh > 0.5;
        });

        const svg = d3.select(svgRef.current);
        const sel = svg.selectAll<SVGGElement, D3Node>('g.node').data(renderNodes, (d: D3Node) => d.uid);

        // Determine duration
        const currentDur = isScrollingRef.current ? 0 : DUR;
        isScrollingRef.current = false;

        // EXIT
        sel.exit().transition().duration(currentDur / 2).style('opacity', 0).remove();

        // ENTER
        const entered = sel.enter()
            .append('g').attr('class', 'node')
            .style('opacity', 0)
            .attr('transform', (d: D3Node) => `translate(${d.x0},${d.y0})`);

        entered.append('rect')
            .attr('stroke', '#000').attr('stroke-width', '1')
            .attr('shape-rendering', 'crispEdges')
            .attr('vector-effect', 'non-scaling-stroke');
        entered.append('foreignObject').attr('class', 'fo-h').style('pointer-events', 'none');
        entered.append('foreignObject').attr('class', 'fo-l').style('pointer-events', 'none');

        const merged = entered.merge(sel as any);

        // Event handlers
        merged
            .style('cursor', (d: D3Node) => (!d.children ? 'crosshair' : 'pointer'))
            .on('click', function (event: MouseEvent, d: D3Node) {
                event.stopPropagation();
                if (!d.children) return;
                const target = d.uid === zoomUidRef.current
                    ? (parentUidRef.current ?? 'root')
                    : d.uid;
                zoomUidRef.current = target;
                setZoomUid(target);
            })
            .on('mouseenter', function (_ev: MouseEvent, d: D3Node) {
                const bf = baseFill(d);
                d3.select(this).select('rect').attr('fill',
                    !d.children ? 'rgba(255,255,255,0.95)' : (d3.color(bf)?.darker(0.15).toString() || bf));
                if (!d.children) {
                    onHoverRef.current(startupMapRef.current.get(d.data.id || '') || null);
                } else {
                    onHoverRef.current(null, true, d.data.name);
                }
            })
            .on('mouseleave', function (_ev: MouseEvent, d: D3Node) {
                d3.select(this).select('rect').attr('fill', baseFill(d));
                onHoverRef.current(null);
            });

        merged.select('rect')
            .attr('fill', baseFill)
            .attr('stroke-opacity', (d: D3Node) => (!d.children ? '0.2' : '0.1'));

        if (currentDur > 0) {
            merged.selectAll('foreignObject').style('opacity', 0);
        }

        // TRANSITION
        merged.transition().duration(currentDur).ease(d3.easeCubicInOut)
            .style('opacity', 1)
            .attr('transform', (d: D3Node) => `translate(${d.x0},${d.y0})`)
            .on('end', function (d: D3Node) {
                paintFO(this, d);
                if (currentDur > 0) d3.select(this).selectAll('foreignObject').style('opacity', 1);
            });

        if (currentDur === 0) {
            merged.each(function (d) { paintFO(this, d); });
            merged.selectAll('foreignObject').style('opacity', 1);
        }

        merged.select('rect').transition().duration(currentDur).ease(d3.easeCubicInOut)
            .attr('width', (d: D3Node) => Math.max(0, d.x1 - d.x0))
            .attr('height', (d: D3Node) => Math.max(0, d.y1 - d.y0));

        // SVG background click
        svg.on('click.bg', (event: MouseEvent) => {
            if (event.target === svgRef.current && parentUidRef.current !== null) {
                zoomUidRef.current = parentUidRef.current;
                setZoomUid(parentUidRef.current);
            }
        });

    }, [zoomUid, expansion, dimensions.w, dimensions.h, fullHierarchy, colorScale]);

    // Skeleton
    if (!dimensions.w || !dimensions.h) {
        return (
            <div ref={containerRef} className="w-full h-full bg-white flex flex-col">
                <div className="flex-shrink-0 h-10 border-b border-black/20 bg-[#f8fafc]" />
                <div className="flex-1 map-container" />
            </div>
        );
    }

    return (
        <div
            className="w-full h-full bg-white flex flex-col overflow-hidden relative font-mono text-[#333]"
            onWheel={handleWheel}
        >
            {/* Breadcrumb */}
            <div className="flex-shrink-0 h-10 border-b border-black/20 flex items-center px-6 bg-[#f8fafc] text-[11px] font-bold uppercase tracking-widest text-black/40 select-none z-10">
                {breadcrumbs.map((crumb, i) => (
                    <React.Fragment key={crumb.uid}>
                        <span
                            className={`transition-colors ${i === breadcrumbs.length - 1 ? 'text-black font-black pointer-events-none' : 'cursor-pointer hover:text-black hover:underline'}`}
                            onClick={() => { zoomUidRef.current = crumb.uid; setZoomUid(crumb.uid); }}
                        >
                            {crumb.name}
                        </span>
                        {i < breadcrumbs.length - 1 && <span className="mx-3 text-black/20">/</span>}
                    </React.Fragment>
                ))}
            </div>

            {/* Scrollable Map Container */}
            <div
                ref={containerRef}
                className="flex-1 w-full overflow-y-auto overflow-x-hidden relative bg-[#fcfdfc] custom-scrollbar"
            >
                <svg
                    ref={svgRef}
                    width="100%"
                    style={{ height: `${expansion * 100}%`, minHeight: '100%' }}
                    className="w-full block select-none"
                />
            </div>
        </div>
    );
};