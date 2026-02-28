import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    Easing
} from 'remotion';
import * as d3 from 'd3';

// Simplified types for the video
interface TreemapNode {
    name: string;
    value?: number;
    children?: TreemapNode[];
    color?: string;
    id?: string;
}

// Data from startups_master.ts (subset for performance and clarity)
const RAW_DATA = [
    {
        name: 'Industrial Tech', children: [
            { name: 'Defense AI', children: [{ name: 'Helsing', value: 4500 }] },
            { name: 'Robotics', children: [{ name: 'Agile Robots', value: 1200 }] },
            { name: 'Space', children: [{ name: 'Isar Aerospace', value: 800 }, { name: 'RFA', value: 200 }] },
        ]
    },
    {
        name: 'Standard Tech', children: [
            {
                name: 'Fintech', children: [
                    { name: 'N26', value: 8500 },
                    { name: 'Trade Republic', value: 6000 },
                    { name: 'Raisin', value: 2000 },
                    { name: 'Taxfix', value: 1000 }
                ]
            },
            { name: 'HR Tech', children: [{ name: 'Personio', value: 8000 }] },
            { name: 'Payments', children: [{ name: 'SumUp', value: 8000 }] },
        ]
    },
    {
        name: 'Mobility & Logistics', children: [
            { name: 'Transport', children: [{ name: 'Flix', value: 3000 }] },
            { name: 'Digital Freight', children: [{ name: 'Forto', value: 2100 }, { name: 'Sennder', value: 1800 }] },
        ]
    },
    {
        name: 'Built World', children: [
            { name: 'Energy Tech', children: [{ name: 'Enpal', value: 4200 }, { name: '1Komma5°', value: 1500 }] },
        ]
    }
];

const SECTOR_COLORS: Record<string, string> = {
    'Industrial Tech': '#EAFBDE',
    'Standard Tech': '#F9F0FF',
    'Mobility & Logistics': '#F0F5FA',
    'Built World': '#FFF0F6',
    'Creative Economy': '#FEFFE6',
    'Health & Care': '#E6FFFB',
    'Food & AgTech': '#FFF1F0',
    'Social & Impact': '#F5F5F5'
};
const DEFAULT_COLOR = '#F9FAFB';

export const Showcase: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // 1. Layout Math (Static)
    const root = useMemo(() => {
        const h = d3.hierarchy<TreemapNode>({ name: 'Root', children: RAW_DATA })
            .sum(d => Math.pow(Math.max(d.value || 0, 300), 0.5))
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        d3.treemap<TreemapNode>()
            .size([width, height])
            .paddingTop(40)
            .paddingInner(4)
            (h);

        return h;
    }, [width, height]);

    const getSectorColor = (d: d3.HierarchyRectangularNode<TreemapNode>) => {
        let n = d;
        while (n.depth > 1 && n.parent) n = n.parent;
        if (n.depth === 1) return SECTOR_COLORS[n.data.name] || DEFAULT_COLOR;
        return DEFAULT_COLOR;
    };

    // 2. Camera Animation (interpolating ViewBox)
    // Full Map: [0, 0, 1920, 1080]
    // Fintech Zoom Target: We need the coords for Fintech
    const fintechNode = root.children?.find(d => d.data.name === 'Standard Tech')
        ?.children?.find(d => d.data.name === 'Fintech') as d3.HierarchyRectangularNode<TreemapNode> | undefined;

    const zoomX = fintechNode?.x0 || 0;
    const zoomY = fintechNode?.y0 || 0;
    const zoomW = (fintechNode?.x1 || width) - zoomX;
    const zoomH = (fintechNode?.y1 || height) - zoomY;

    // Timeline Interpolations
    const progress = interpolate(frame, [30, 90, 150, 210, 270], [0, 1, 1, 0, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.42, 0, 0.58, 1)
    });

    const vbx = interpolate(progress, [0, 1], [0, zoomX]);
    const vby = interpolate(progress, [0, 1], [0, zoomY]);
    const vbw = interpolate(progress, [0, 1], [width, zoomW]);
    const vbh = interpolate(progress, [0, 1], [height, zoomH]);

    // Tooltip Animation (3-5s)
    const tooltipOpacity = interpolate(frame, [100, 110, 140, 150], [0, 1, 1, 0]);
    const tooltipX = zoomX + zoomW * 0.4;
    const tooltipY = zoomY + zoomH * 0.3;

    // Text Overlays
    const text1Opacity = interpolate(frame, [30, 45, 80, 90], [0, 1, 1, 0]);
    const text2Opacity = interpolate(frame, [100, 115, 140, 150], [0, 1, 1, 0]);
    const text3Opacity = interpolate(frame, [170, 185, 230, 250], [0, 1, 1, 0]);
    const finalLogoOpacity = interpolate(frame, [270, 285], [0, 1]);

    const globalOpacity = interpolate(frame, [0, 20, 280, 300], [0, 1, 1, 0]);

    return (
        <AbsoluteFill style={{ backgroundColor: '#fff', opacity: globalOpacity }}>
            {/* The Map Layer */}
            <svg
                width={width}
                height={height}
                viewBox={`${vbx} ${vby} ${vbw} ${vbh}`}
                style={{ shapeRendering: 'crispEdges' }}
            >
                {root.descendants().map((d, i) => {
                    const node = d as d3.HierarchyRectangularNode<TreemapNode>;
                    const isLeaf = !node.children;
                    const isSector = node.depth === 1;
                    const isVertical = node.depth === 2;

                    if (node.depth === 0) return null;

                    return (
                        <g key={i}>
                            <rect
                                x={node.x0}
                                y={node.y0}
                                width={node.x1 - node.x0}
                                height={node.y1 - node.y0}
                                fill={isSector ? getSectorColor(node) : isLeaf ? 'rgba(255,255,255,0.4)' : 'transparent'}
                                stroke="#000"
                                strokeWidth={isSector ? 2 : 0.5}
                            />
                            {(node.x1 - node.x0 > 40 && node.y1 - node.y0 > 20) && (
                                <text
                                    x={node.x0 + 8}
                                    y={node.y0 + (isSector ? 28 : 18)}
                                    fontSize={isSector ? 24 : 12}
                                    fontWeight={isSector ? '900' : '500'}
                                    fontFamily="JetBrains Mono, monospace"
                                    fill="#000"
                                    style={{ textTransform: 'uppercase', letterSpacing: '-0.5px' }}
                                >
                                    {node.data.name}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* Simulated Tooltip */}
                <g style={{ opacity: tooltipOpacity }}>
                    <rect
                        x={tooltipX}
                        y={tooltipY}
                        width={300}
                        height={120}
                        fill="black"
                        rx={4}
                    />
                    <text x={tooltipX + 20} y={tooltipY + 40} fill="white" fontSize={20} fontWeight="bold" fontFamily="JetBrains Mono">N26</text>
                    <text x={tooltipX + 20} y={tooltipY + 70} fill="#888" fontSize={14} fontFamily="JetBrains Mono">VALUATION: €8.5B</text>
                    <text x={tooltipX + 20} y={tooltipY + 95} fill="#4facfe" fontSize={12} fontWeight="bold" fontFamily="JetBrains Mono">STATUS: LIVE</text>
                </g>
            </svg>

            {/* Cinematic Overlays */}
            <AbsoluteFill style={{ pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ opacity: text1Opacity, color: 'black', fontSize: 60, fontWeight: 900, fontFamily: 'JetBrains Mono', textAlign: 'center', textTransform: 'uppercase', backgroundColor: 'white', padding: '20px 40px', border: '4px solid black' }}>
                    Berlin's startup ecosystem.
                </div>
            </AbsoluteFill>

            <AbsoluteFill style={{ pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ opacity: text2Opacity, color: 'black', fontSize: 60, fontWeight: 900, fontFamily: 'JetBrains Mono', textAlign: 'center', textTransform: 'uppercase', backgroundColor: 'white', padding: '20px 40px', border: '4px solid black' }}>
                    Every company. Every vertical.
                </div>
            </AbsoluteFill>

            <AbsoluteFill style={{ pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ opacity: text3Opacity, color: 'black', fontSize: 60, fontWeight: 900, fontFamily: 'JetBrains Mono', textAlign: 'center', textTransform: 'uppercase', backgroundColor: 'white', padding: '20px 40px', border: '4px solid black' }}>
                    Mapped. Filterable. Alive.
                </div>
            </AbsoluteFill>

            {/* Final Branding */}
            <AbsoluteFill style={{ backgroundColor: 'black', opacity: finalLogoOpacity, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ color: 'white', fontSize: 100, fontWeight: 900, fontFamily: 'JetBrains Mono', letterSpacing: '-4px' }}>
                    VENTURE ATLAS
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
