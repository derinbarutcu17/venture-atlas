import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, TrendingUp, Target, Briefcase } from 'lucide-react';
import type { Sector } from '../types';
import logo from '/logo.png';

interface InvestorData {
    name: string;
    deals: number;
    volume: number; // in Millions
    description: string;
    sectors: Partial<Record<Sector, number>>; // 0 to 1 intensity
    topStartups: string[];
    velocity: number[]; // Sparkline data points
}

const INVESTOR_DATA: InvestorData[] = [
    {
        name: 'Index Ventures',
        deals: 48,
        volume: 3200,
        description: 'Multi-stage venture capital firm that helps the most ambitious entrepreneurs turn bold ideas into global businesses.',
        sectors: { 'Standard Tech': 0.9, 'Mobility & Logistics': 0.4, 'Health & Care': 0.3 },
        topStartups: ['Adyen', 'Deliveroo', 'Revolut'],
        velocity: [10, 25, 45, 30, 60, 85, 70]
    },
    {
        name: 'Accel Europe',
        deals: 42,
        volume: 2900,
        description: 'Venture capital firm that invests in people and their companies from the earliest days through all phases of private company growth.',
        sectors: { 'Standard Tech': 0.8, 'Industrial Tech': 0.7, 'SaaS': 0.9 } as any,
        topStartups: ['Celonis', 'UiPath', 'Monzo'],
        velocity: [20, 35, 30, 50, 45, 75, 90]
    },
    {
        name: 'HV Capital',
        deals: 52,
        volume: 2800,
        description: 'One of the leading early-stage and growth investors in Europe, supporting next-generation giants from the beginning.',
        sectors: { 'Standard Tech': 0.95, 'Mobility & Logistics': 0.6, 'Food & AgTech': 0.5 },
        topStartups: ['Zalando', 'HelloFresh', 'FlixBus'],
        velocity: [40, 50, 45, 60, 70, 65, 80]
    },
    {
        name: 'Earlybird',
        deals: 44,
        volume: 2100,
        description: 'European venture capital investor with over €2 billion under management, focusing on all phases of development.',
        sectors: { 'Health & Care': 0.9, 'Industrial Tech': 0.8, 'Standard Tech': 0.5 },
        topStartups: ['N26', 'Isar Aerospace', 'Fraugster'],
        velocity: [15, 20, 40, 35, 55, 60, 65]
    },
    {
        name: 'Lakestar',
        deals: 22,
        volume: 1500,
        description: 'Invests in technology companies led by exceptional entrepreneurs, with a focus on early and growth stage ventures.',
        sectors: { 'Standard Tech': 0.7, 'Built World': 0.6, 'Mobility & Logistics': 0.8 },
        topStartups: ['Sennder', 'GetYourGuide', 'Revolut'],
        velocity: [5, 15, 10, 25, 30, 45, 50]
    }
];

const SectorIntensity: React.FC<{ sectors: Partial<Record<Sector, number>> }> = ({ sectors }) => {
    const allSectors: Sector[] = [
        'Standard Tech', 'Creative Economy', 'Built World', 'Industrial Tech',
        'Food & AgTech', 'Health & Care', 'Mobility & Logistics', 'Social & Impact'
    ];

    return (
        <div className="flex gap-1 items-end h-8">
            {allSectors.map(s => {
                const intensity = sectors[s] || 0.05;
                return (
                    <div
                        key={s}
                        className="w-1.5 transition-all duration-500 bg-black/10 hover:bg-black relative group"
                        style={{ height: `${intensity * 100}%` }}
                    >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 pointer-events-none">
                            {s}: {(intensity * 100).toFixed(0)}%
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
    const width = 100;
    const height = 30;
    const max = Math.max(...data);
    const points = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - (d / max) * height}`).join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                fill="none"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    );
};

export const InvestorsView: React.FC = () => {
    const [sortBy, setSortBy] = useState<'volume' | 'deals'>('volume');
    const [expandedInvestor, setExpandedInvestor] = useState<string | null>(null);

    const sortedInvestors = useMemo(() => {
        return [...INVESTOR_DATA].sort((a, b) => b[sortBy] - a[sortBy]);
    }, [sortBy]);

    return (
        <div className="w-full text-[#0a0a0a] font-mono select-none pt-8 pb-32">
            {/* Typographic Header */}
            <header className="mb-16">
                <div className="flex items-baseline justify-between border-b-[3px] border-black pb-8">
                    <h1 className="text-[6rem] md:text-[8rem] lg:text-[10rem] font-black uppercase tracking-tighter leading-[0.8] m-0">
                        Capital<br />Deploy
                    </h1>
                    <div className="text-right hidden md:block">
                        <div className="text-xs font-bold tracking-[0.3em] uppercase opacity-40 mb-2">Market Data Feed</div>
                        <div className="text-xl font-black tabular-nums">LIVE: 2026.Q1</div>
                    </div>
                </div>

                {/* Filter / Sort Bar */}
                <div className="flex justify-between items-center mt-6">
                    <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest leading-none">
                        <button
                            onClick={() => setSortBy('volume')}
                            className={`${sortBy === 'volume' ? 'text-black' : 'text-black/30'} hover:text-black transition-colors flex items-center gap-2`}
                        >
                            <TrendingUp className="w-3 h-3" /> Area by Capital
                        </button>
                        <button
                            onClick={() => setSortBy('deals')}
                            className={`${sortBy === 'deals' ? 'text-black' : 'text-black/30'} hover:text-black transition-colors flex items-center gap-2`}
                        >
                            <Target className="w-3 h-3" /> Area by Velocity
                        </button>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-black/40">
                        {sortedInvestors.length} Active Entities Mapped
                    </div>
                </div>
            </header>

            {/* Smart Matrix Grid */}
            <div className="flex flex-col border-t border-black/10">
                {sortedInvestors.map((vc, idx) => {
                    const isExpanded = expandedInvestor === vc.name;
                    return (
                        <div
                            key={vc.name}
                            className="group flex flex-col border-b border-black/10 hover:bg-black/[0.02] transition-colors"
                        >
                            {/* Main Row */}
                            <div
                                className="flex items-center justify-between py-8 px-2 cursor-pointer"
                                onClick={() => setExpandedInvestor(isExpanded ? null : vc.name)}
                            >
                                <div className="flex items-center gap-12 flex-1">
                                    <span className="text-sm font-black opacity-20 w-8">{(idx + 1).toString().padStart(2, '0')}</span>

                                    <div className="flex flex-col w-64">
                                        <h3 className="text-2xl font-black uppercase tracking-tight leading-none mb-1 group-hover:text-black transition-colors">
                                            {vc.name}
                                        </h3>
                                        <div className="flex gap-3 text-[10px] font-black opacity-40 uppercase tracking-widest">
                                            <span>{vc.deals} Series A-C</span>
                                            <span>•</span>
                                            <span>Europe HQ</span>
                                        </div>
                                    </div>

                                    {/* Volume Metric */}
                                    <div className="w-40 hidden lg:block">
                                        <div className="text-[10px] uppercase font-bold text-black/30 mb-1">Deploy Vol.</div>
                                        <div className="text-2xl font-black tabular-nums">€{(vc.volume / 1000).toFixed(1)}B</div>
                                    </div>

                                    {/* Velocity Sparkline */}
                                    <div className="w-32 hidden xl:block">
                                        <div className="text-[10px] uppercase font-bold text-black/30 mb-2">Velocity</div>
                                        <Sparkline data={vc.velocity} />
                                    </div>

                                    {/* Sector Intensity Matrix */}
                                    <div className="flex-1 hidden md:block max-w-[200px]">
                                        <div className="text-[10px] uppercase font-bold text-black/30 mb-2">Sector Focus Intensity</div>
                                        <SectorIntensity sectors={vc.sectors} />
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    {isExpanded ? <ChevronUp className="w-5 h-5 opacity-30" /> : <ChevronDown className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-opacity" />}
                                </div>
                            </div>

                            {/* Expanded Detail Panel */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'circOut' }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-20 pb-12 grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-black/5 pt-8">
                                            <div className="flex flex-col space-y-6">
                                                <div className="space-y-2">
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-black/30 flex items-center gap-2">
                                                        <Briefcase className="w-3 h-3" /> Strategy Overview
                                                    </div>
                                                    <p className="text-sm font-medium leading-relaxed max-w-md italic opacity-80">
                                                        "{vc.description}"
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {Object.keys(vc.sectors).map(s => (
                                                        <span key={s} className="text-[9px] font-black uppercase tracking-tighter border border-black/20 px-2 py-1 bg-black text-white">
                                                            Top Focus: {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-black/30">Select Berlin Portfolio Excerpts</div>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {vc.topStartups.map(name => (
                                                        <div key={name} className="flex justify-between items-center py-2 border-b border-black/5 hover:bg-black/5 px-2 transition-colors cursor-pointer group/item">
                                                            <span className="text-sm font-bold uppercase">{name}</span>
                                                            <span className="text-[10px] font-black opacity-0 group-hover/item:opacity-100 transition-opacity border border-black px-1.5">VIEW CASE STUDY</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Brutalist Footer Background Mirror */}
            <div className="mt-32 pt-12 border-t-[3px] border-black flex flex-col md:flex-row justify-between items-end gap-12">
                <div className="flex flex-col gap-6">
                    <img src={logo} alt="Logo" className="w-20 h-20 grayscale" />
                    <div className="max-w-xs space-y-2">
                        <div className="text-2xl font-black uppercase leading-none tracking-tighter">Venture Intelligence Unit</div>
                        <div className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">Validated Research // Berlin 2026</div>
                    </div>
                </div>

                <div className="flex gap-20 text-[10px] font-bold uppercase tracking-widest">
                    <div className="flex flex-col gap-4">
                        <span className="text-black/30">Governance</span>
                        <a href="#" className="hover:underline">Methodology</a>
                        <a href="#" className="hover:underline">Capital Attribution</a>
                    </div>
                    <div className="flex flex-col gap-4">
                        <span className="text-black/30">Access</span>
                        <a href="#" className="hover:underline">Request API Key</a>
                        <a href="#" className="hover:underline">Data Partnership</a>
                    </div>
                </div>
            </div>
        </div>
    );
};
