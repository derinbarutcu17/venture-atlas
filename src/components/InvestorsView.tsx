import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, TrendingUp, Target, Briefcase, ExternalLink } from 'lucide-react';
import type { Sector } from '../types';
import logo from '/logo.png';

interface InvestorData {
    name: string;
    type: string; // e.g. "Early-Stage VC" | "Growth VC" | "Multi-Stage VC"
    founded: number;
    aum: string; // Real AUM string e.g. "€2.8B"
    aumValue: number; // Numeric for sorting (Millions)
    latestFund: string; // e.g. "Fund IX — €710M (2023)"
    deals: number;
    activeSince: number;
    hq: string;
    website: string;
    description: string;
    thesis: string;
    stages: string[];
    sectors: Partial<Record<Sector | string, number>>; // 0 to 1 intensity
    berlinPortfolio: { name: string; raised: string; sector: string; status: string }[];
    recentActivity: string;
    unicorns: number;
    velocity: number[];
}

// ─── REAL DATA: Sourced Feb 2026 ──────────────────────────────────────────────
// Sources: PitchBook, Sifted, TechCrunch Europe, EU-Startups, firm websites
const INVESTOR_DATA: InvestorData[] = [
    {
        name: 'HV Capital',
        type: 'Multi-Stage VC',
        founded: 2000,
        aum: '€2.8B',
        aumValue: 2800,
        latestFund: 'Fund IX — €710M (2023)',
        deals: 225,
        activeSince: 2000,
        hq: 'Berlin / Munich',
        website: 'hvcapital.com',
        description: 'One of Europe\'s leading all-stage investors, formerly Holtzbrinck Ventures. Known for building generational companies across consumer, SaaS, and logistics.',
        thesis: 'Stage-agnostic. Seed to Series D. €500K–€60M tickets. Focus on operationally high-complexity businesses.',
        stages: ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'],
        sectors: { 'Standard Tech': 0.9, 'Mobility & Logistics': 0.7, 'Food & AgTech': 0.5, 'Health & Care': 0.4, 'Built World': 0.3 },
        berlinPortfolio: [
            { name: 'Zalando', raised: 'IPO (2014)', sector: 'E-Commerce', status: 'Public' },
            { name: 'HelloFresh', raised: 'IPO (2017)', sector: 'Food Tech', status: 'Public' },
            { name: 'SumUp', raised: '€750M', sector: 'Fintech', status: 'Unicorn' },
            { name: 'FlixBus', raised: '$650M+', sector: 'Mobility', status: 'Unicorn' },
            { name: 'Polyteia', raised: 'Seed', sector: 'GovTech', status: 'Active' },
        ],
        recentActivity: 'Fund IX investing actively in 30–40 Ventures + 10–15 Growth targets. Invested in SPREAD and Polyteia (2024).',
        unicorns: 18,
        velocity: [30, 45, 38, 50, 60, 55, 70]
    },
    {
        name: 'Cherry Ventures',
        type: 'Early-Stage VC',
        founded: 2012,
        aum: '€900M+',
        aumValue: 900,
        latestFund: 'Cherry V — $500M (Feb 2025)',
        deals: 130,
        activeSince: 2012,
        hq: 'Berlin',
        website: 'cherry.vc',
        description: "Pre-seed and seed specialist run by experienced founders. Aims to build Europe's 'first trillion-dollar company'. 47 exits to date.",
        thesis: 'Pre-seed & Seed. €1–5M initial tickets. Hands-on founding partner access. Strong focus on climate and industrials.',
        stages: ['Pre-Seed', 'Seed', 'Series B (Opportunity)'],
        sectors: { 'Standard Tech': 0.7, 'Mobility & Logistics': 0.8, 'Industrial Tech': 0.6, 'Food & AgTech': 0.7, 'Built World': 0.5 },
        berlinPortfolio: [
            { name: 'FlixBus', raised: 'Unicorn Exit', sector: 'Mobility', status: 'Unicorn' },
            { name: 'Auto1 Group', raised: 'IPO (2021)', sector: 'Automotive', status: 'Public' },
            { name: 'Mondu', raised: '€43M Series B', sector: 'B2B Payments', status: 'Active' },
            { name: 'Forto', raised: '$240M+', sector: 'Logistics', status: 'Unicorn' },
            { name: 'Planet A Foods', raised: 'Seed+', sector: 'FoodTech', status: 'Active' },
        ],
        recentActivity: 'Cherry V closed $500M in Feb 2025. Invested in Flinn and Heywa Labs in February 2026. 47 exits achieved.',
        unicorns: 11,
        velocity: [15, 20, 25, 30, 38, 45, 55]
    },
    {
        name: 'Earlybird',
        type: 'Early & Growth VC',
        founded: 1997,
        aum: '€2.5B',
        aumValue: 2500,
        latestFund: 'Digital West VII — €350M (2022)',
        deals: 251,
        activeSince: 1997,
        hq: 'Berlin',
        website: 'earlybird.com',
        description: 'One of Europe\'s most experienced VCs with €2.5B under management across multiple fund streams. Deep-tech and innovation focus since 1997.',
        thesis: 'Series A specialist. €3–25M initial tickets. Deep tech, enterprise software, fintech, sustainability.',
        stages: ['Seed', 'Series A', 'Series B'],
        sectors: { 'Health & Care': 0.8, 'Industrial Tech': 0.9, 'Standard Tech': 0.7, 'Social & Impact': 0.5, 'Built World': 0.4 },
        berlinPortfolio: [
            { name: 'N26', raised: '$900M+', sector: 'Neobanking', status: 'Unicorn' },
            { name: 'Isar Aerospace', raised: '€300M+', sector: 'Deep Tech', status: 'ScaleUp' },
            { name: 'Aleph Alpha', raised: '€500M', sector: 'AI/LLM', status: 'Unicorn' },
            { name: 'Onefootball', raised: '€100M+', sector: 'Sports Media', status: 'Active' },
            { name: 'Fraugster', raised: 'Acquired', sector: 'Fraud AI', status: 'Exit' },
        ],
        recentActivity: 'Active as of Jan 2026. 251 companies backed. Primary focus Series A in Germany. Active in AI and defense tech.',
        unicorns: 22,
        velocity: [20, 28, 35, 30, 42, 48, 52]
    },
    {
        name: 'Project A',
        type: 'Operational VC',
        founded: 2012,
        aum: '€1.2B',
        aumValue: 1200,
        latestFund: 'Fund V — €325M (Jun 2025)',
        deals: 130,
        activeSince: 2012,
        hq: 'Berlin',
        website: 'project-a.vc',
        description: 'Berlin\'s operational VC model — 140+ functional experts embedded in portfolio companies. Seed to Series B with active board seats and PMO support.',
        thesis: 'Pre-seed to Seed. €1–8M initial tickets. Defense, Fintech, AI, Supply Chain. Operational intensity is the differentiator.',
        stages: ['Pre-Seed', 'Seed', 'Series A'],
        sectors: { 'Standard Tech': 0.8, 'Mobility & Logistics': 0.9, 'Industrial Tech': 0.7, 'Health & Care': 0.5, 'Creative Economy': 0.3 },
        berlinPortfolio: [
            { name: 'Trade Republic', raised: '$900M Series C', sector: 'Neobroker', status: 'Unicorn' },
            { name: 'sennder', raised: '$160M Series D', sector: 'Digital Freight', status: 'Unicorn' },
            { name: 'Spryker', raised: 'Series C', sector: 'Commerce OS', status: 'Active' },
            { name: 'Quantum Systems', raised: 'Series B', sector: 'Defense Drones', status: 'Active' },
            { name: 'Andercore', raised: 'Pre-Seed', sector: 'AI Infra', status: 'Active (Feb 2026)' },
        ],
        recentActivity: 'Fund V closed oversubscribed at €325M (Jun 2025). Latest investment: Andercore (Feb 11, 2026). Exits: Priceloop, Bene Bono (Q4 2025).',
        unicorns: 8,
        velocity: [18, 22, 28, 32, 38, 42, 50]
    },
    {
        name: 'Lakestar',
        type: 'Multi-Stage VC',
        founded: 2012,
        aum: '€2.0B',
        aumValue: 2000,
        latestFund: 'Early IV + Growth II — $600M (Apr 2024)',
        deals: 254,
        activeSince: 2012,
        hq: 'Berlin / Zürich / London',
        website: 'lakestar.com',
        description: 'Invests in disruptive tech businesses across Europe. 24 unicorns in portfolio. Seeking $300M defense fund (Jun 2025). Recent bets in defense and AI.',
        thesis: 'Early and growth stage. Deep tech, AI, healthcare, fintech, and now defense technology.',
        stages: ['Seed', 'Series A', 'Series B', 'Growth'],
        sectors: { 'Standard Tech': 0.7, 'Mobility & Logistics': 0.8, 'Health & Care': 0.6, 'Industrial Tech': 0.5, 'Built World': 0.7 },
        berlinPortfolio: [
            { name: 'GetYourGuide', raised: '$590M+', sector: 'Travel Tech', status: 'Unicorn' },
            { name: 'sennder', raised: '$160M Series D', sector: 'Digital Freight', status: 'Unicorn' },
            { name: 'HomeToGo', raised: 'IPO (2021)', sector: 'Travel Tech', status: 'Public' },
            { name: 'Antidote Ltd.', raised: 'Round (Jan 2026)', sector: 'HealthTech', status: 'Active' },
            { name: 'Matta Labs', raised: 'Round (Dec 2025)', sector: 'AI Infra', status: 'Active' },
        ],
        recentActivity: 'Raising $300M dedicated defense fund (Jun 2025). Invested in Antidote (Jan 2026), Matta Labs (Dec 2025). 24 unicorns.',
        unicorns: 24,
        velocity: [10, 18, 22, 30, 35, 40, 45]
    },
    {
        name: 'Point Nine',
        type: 'B2B SaaS VC',
        founded: 2008,
        aum: '€180M+',
        aumValue: 180,
        latestFund: 'Fund VI — €180M (Sep 2022), Fund VII open (May 2025)',
        deals: 180,
        activeSince: 2008,
        hq: 'Berlin',
        website: 'pointnine.com',
        description: 'Berlin\'s specialized SaaS and marketplace VC. Geo-agnostic seed bets with €0.5–5M tickets. Deep thesis on data-driven niche leaders.',
        thesis: 'Seed. €500K–€5M initial tickets. B2B SaaS, online marketplaces, mobile. Geo-agnostic with Europe + US focus.',
        stages: ['Pre-Seed', 'Seed'],
        sectors: { 'Standard Tech': 0.95, 'Creative Economy': 0.5, 'Social & Impact': 0.4, 'Health & Care': 0.3 },
        berlinPortfolio: [
            { name: 'Delivery Hero', raised: 'IPO (2017)', sector: 'Food Delivery', status: 'Public' },
            { name: 'Contentful', raised: '$175M Series F', sector: 'CMS Infra', status: 'Unicorn' },
            { name: 'ChartMogul', raised: 'Bootstrapped+', sector: 'Analytics SaaS', status: 'Active' },
            { name: 'Candis', raised: 'Series B', sector: 'Finance SaaS', status: 'Active' },
            { name: 'Back', raised: 'Acquired by Personio', sector: 'HR Tech', status: 'Exit (2022)' },
        ],
        recentActivity: 'Fund VII opened May 2025 (size undisclosed). Active in Berlin SaaS with Candis, Bitbond, ChartMogul and BlueLayer.',
        unicorns: 5,
        velocity: [8, 12, 15, 12, 18, 22, 28]
    },
];

type SortKey = 'aumValue' | 'deals' | 'unicorns';

// Stage pill
const StagePill: React.FC<{ stage: string }> = ({ stage }) => (
    <span className="inline-block text-[9px] font-black uppercase tracking-wider border border-black/20 px-2 py-0.5 mr-1 mb-1">{stage}</span>
);

export const InvestorsView: React.FC = () => {
    const [sortBy, setSortBy] = useState<SortKey>('aumValue');
    const [expandedInvestor, setExpandedInvestor] = useState<string | null>(null);

    const sortedInvestors = useMemo(() => {
        return [...INVESTOR_DATA].sort((a, b) => b[sortBy] - a[sortBy]);
    }, [sortBy]);

    return (
        <div className="w-full text-[#0a0a0a] font-mono select-none pt-8 pb-32">
            {/* Header */}
            <header className="mb-12">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b-[3px] border-black pb-8 gap-4">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-4">Berlin Capital Intelligence // Q1 2026</div>
                        <h1 className="text-[5rem] md:text-[7rem] lg:text-[8rem] font-black uppercase tracking-tighter leading-[0.85] m-0">
                            Active<br />Capital
                        </h1>
                    </div>
                    <div className="flex flex-col text-right gap-2 pb-2">
                        <div className="text-3xl font-black tabular-nums">€{sortedInvestors.reduce((s, v) => s + v.aumValue, 0).toLocaleString()}M+</div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Total AUM across {sortedInvestors.length} mapped funds</div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">{sortedInvestors.reduce((s, v) => s + v.unicorns, 0)} unicorns backed</div>
                    </div>
                </div>

                {/* Sort Bar */}
                <div className="flex flex-wrap gap-6 items-center mt-5 text-[11px] font-black uppercase tracking-widest">
                    <span className="text-black/30">Sort by</span>
                    {([['aumValue', 'Capital AUM'], ['deals', 'Total Deals'], ['unicorns', 'Unicorns']] as [SortKey, string][]).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setSortBy(key)}
                            className={`flex items-center gap-1.5 pb-0.5 border-b-2 transition-colors ${sortBy === key ? 'border-black text-black' : 'border-transparent text-black/30 hover:text-black'}`}
                        >
                            {key === 'aumValue' && <TrendingUp className="w-3 h-3" />}
                            {key === 'deals' && <Target className="w-3 h-3" />}
                            {key === 'unicorns' && <Briefcase className="w-3 h-3" />}
                            {label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Matrix */}
            <div className="flex flex-col border-t border-black/10">
                {sortedInvestors.map((vc, idx) => {
                    const isExpanded = expandedInvestor === vc.name;
                    return (
                        <div key={vc.name} className="group flex flex-col border-b border-black/10 hover:bg-black/[0.015] transition-colors">
                            {/* Main Row */}
                            <div
                                className="flex items-center justify-between py-7 px-2 cursor-pointer gap-4"
                                onClick={() => setExpandedInvestor(isExpanded ? null : vc.name)}
                            >
                                <div className="flex items-center gap-8 md:gap-12 flex-1 min-w-0">
                                    <span className="text-sm font-black opacity-15 w-8 flex-shrink-0">{(idx + 1).toString().padStart(2, '0')}</span>

                                    {/* Name + Type */}
                                    <div className="flex flex-col min-w-0 w-56 flex-shrink-0">
                                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none mb-1 truncate">{vc.name}</h3>
                                        <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest truncate">{vc.type} · Est. {vc.founded}</div>
                                    </div>

                                    {/* AUM */}
                                    <div className="hidden md:flex flex-col w-32 flex-shrink-0">
                                        <div className="text-[9px] uppercase font-bold text-black/30 mb-0.5 tracking-widest">Total AUM</div>
                                        <div className="text-xl font-black tabular-nums">{vc.aum}</div>
                                        <div className="text-[9px] opacity-40 font-bold mt-0.5">{vc.latestFund.split('—')[0].trim()}</div>
                                    </div>

                                    {/* Deals + Unicorns */}
                                    <div className="hidden lg:flex gap-8 flex-shrink-0">
                                        <div className="flex flex-col">
                                            <div className="text-[9px] uppercase font-bold text-black/30 mb-0.5 tracking-widest">Cos. Backed</div>
                                            <div className="text-xl font-black tabular-nums">{vc.deals}</div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="text-[9px] uppercase font-bold text-black/30 mb-0.5 tracking-widest">Unicorns</div>
                                            <div className="text-xl font-black tabular-nums text-black/70">{vc.unicorns}</div>
                                        </div>
                                    </div>

                                </div>

                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="text-[9px] uppercase font-black tracking-widest opacity-0 group-hover:opacity-40 transition-opacity hidden sm:block">
                                        {isExpanded ? 'Collapse' : 'Deep Dive'}
                                    </span>
                                    {isExpanded
                                        ? <ChevronUp className="w-4 h-4 opacity-40" />
                                        : <ChevronDown className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" />
                                    }
                                </div>
                            </div>

                            {/* Expanded Panel */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden border-t border-black/8"
                                    >
                                        <div className="px-6 md:px-16 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10 bg-[#fafafa]">

                                            {/* ── Col 1: Fund Identity ── */}
                                            <div className="flex flex-col gap-8">

                                                <div className="flex flex-col gap-2">
                                                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/50">Fund Overview</div>
                                                    <p className="text-[15px] leading-[1.65] text-black/75 font-normal">{vc.description}</p>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/50">Investment Thesis</div>
                                                    <p className="text-[14px] leading-[1.6] text-black/60 italic border-l-2 border-black/15 pl-3">{vc.thesis}</p>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/50">Stage Focus</div>
                                                    <div className="flex flex-wrap gap-1.5">{vc.stages.map(s => <StagePill key={s} stage={s} />)}</div>
                                                </div>

                                                <div className="flex flex-col gap-1.5 pt-2 border-t border-black/8">
                                                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/50">Latest Fund</div>
                                                    <div className="text-[15px] font-bold text-black/80">{vc.latestFund}</div>
                                                </div>

                                                <a
                                                    href={`https://${vc.website}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider border border-black/30 px-4 py-2.5 hover:bg-black hover:text-white hover:border-black transition-all duration-200 w-fit rounded-sm"
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    {vc.website}
                                                </a>
                                            </div>

                                            {/* ── Col 2: Berlin Portfolio ── */}
                                            <div className="flex flex-col gap-3">
                                                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/50 mb-1">Select Berlin Portfolio</div>
                                                {vc.berlinPortfolio.map(co => (
                                                    <div key={co.name} className="flex justify-between items-center gap-4 py-3.5 px-1 border-b border-black/8 hover:bg-black/[0.02] transition-colors rounded-sm">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[15px] font-bold text-black/85 leading-snug">{co.name}</span>
                                                            <span className="text-[12px] font-medium text-black/45 uppercase tracking-wide">{co.sector}</span>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                            <span className="text-[13px] font-bold text-black/65">{co.raised}</span>
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${co.status === 'Unicorn' ? 'bg-black text-white' :
                                                                    co.status === 'Public' ? 'bg-black/10 text-black/60' :
                                                                        co.status === 'Exit' || co.status.startsWith('Exit') ? 'bg-black/5 text-black/35' :
                                                                            'border border-black/20 text-black/50'
                                                                }`}>
                                                                {co.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* ── Col 3: Activity & Stats ── */}
                                            <div className="flex flex-col gap-8">

                                                <div className="flex flex-col gap-2">
                                                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/50">Recent Activity (2025–2026)</div>
                                                    <p className="text-[14px] leading-[1.65] text-black/70">{vc.recentActivity}</p>
                                                </div>

                                                {/* Key Stats */}
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/50 mb-2">Key Stats</div>
                                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 border border-black/10 rounded-sm p-5 bg-white">
                                                        {[
                                                            { label: 'Est. AUM', val: vc.aum },
                                                            { label: 'Active Since', val: vc.activeSince.toString() },
                                                            { label: 'HQ', val: vc.hq },
                                                            { label: 'Unicorns', val: `${vc.unicorns}` },
                                                            { label: 'Portfolio Cos.', val: `${vc.deals}+` },
                                                        ].map(stat => (
                                                            <div key={stat.label} className="flex flex-col gap-0.5">
                                                                <div className="text-[10px] font-bold uppercase tracking-wider text-black/40">{stat.label}</div>
                                                                <div className="text-[16px] font-black tabular-nums text-black/85">{stat.val}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Sector Focus Bars */}
                                                <div className="flex flex-col gap-2">
                                                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/50 mb-1">Sector Allocation</div>
                                                    {Object.entries(vc.sectors)
                                                        .sort(([, a], [, b]) => (b as number) - (a as number))
                                                        .map(([sector, val]) => (
                                                            <div key={sector} className="flex items-center gap-3">
                                                                <div className="text-[12px] font-medium text-black/55 w-36 flex-shrink-0 truncate">{sector}</div>
                                                                <div className="flex-1 h-1.5 bg-black/8 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-black/60 rounded-full transition-all duration-500"
                                                                        style={{ width: `${(val as number) * 100}%` }}
                                                                    />
                                                                </div>
                                                                <div className="text-[12px] font-bold tabular-nums text-black/45 w-9 text-right">{((val as number) * 100).toFixed(0)}%</div>
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

            {/* Footer */}
            <div className="mt-24 pt-10 border-t-[3px] border-black flex flex-col md:flex-row justify-between items-end gap-12">
                <div className="flex flex-col gap-4">
                    <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
                    <div>
                        <div className="text-xl font-black uppercase leading-none tracking-tighter">Venture Intelligence Unit</div>
                        <div className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">Validated Research // Berlin Q1 2026</div>
                    </div>
                    <div className="text-[9px] font-bold opacity-30 uppercase tracking-[0.1em] max-w-xs leading-relaxed">
                        Data sourced from PitchBook, Sifted, EU-Startups, TechCrunch Europe and fund disclosures. AUM figures represent latest known estimates.
                    </div>
                </div>
                <div className="flex gap-16 text-[10px] font-bold uppercase tracking-widest pb-1">
                    <div className="flex flex-col gap-4">
                        <span className="text-black/30">Research</span>
                        <a href="#" className="hover:underline">Methodology</a>
                        <a href="#" className="hover:underline">Data Sources</a>
                    </div>
                    <div className="flex flex-col gap-4">
                        <span className="text-black/30">Access</span>
                        <a href="#" className="hover:underline">Request Data</a>
                        <a href="#" className="hover:underline">Partner Program</a>
                    </div>
                </div>
            </div>
        </div>
    );
};
