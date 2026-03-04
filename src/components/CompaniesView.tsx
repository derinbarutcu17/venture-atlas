import React, { useMemo, useState, useRef } from 'react';
import type { Startup, Sector } from '../types';
import logo from '/logo.png';

interface CompaniesViewProps {
    startups: Startup[];
    searchTerm: string;
    onStartupClick: (startup: Startup) => void;
}

interface VerticalData {
    name: string;
    count: number;
    startups: Startup[];
}

interface SectorData {
    name: Sector;
    count: number;
    verticals: VerticalData[];
}

const SECTOR_ORDER: Sector[] = [
    'Standard Tech',
    'Creative Economy',
    'Built World',
    'Industrial Tech',
    'Food & AgTech',
    'Health & Care',
    'Mobility & Logistics',
    'Social & Impact'
];

const METHODOLOGY_TEXT = `Berlin Venture Atlas maps Berlin's startup ecosystem through a multi-source research process. Company data is cross-referenced against Crunchbase, PitchBook, EU-Startups, Sifted, and official press releases. Funding figures reflect EUR-converted totals at time of announcement. Sectors and verticals are assigned using a proprietary taxonomy aligned with European VC classification standards. The dataset covers ventures with at least one recorded funding round or significant media presence. Updates are conducted on a quarterly basis. All data is indicative and should be independently verified before investment decisions.`;

export const CompaniesView: React.FC<CompaniesViewProps> = ({ startups, searchTerm, onStartupClick }) => {
    const [expandedVertical, setExpandedVertical] = useState<string | null>(null);
    const [showMethodology, setShowMethodology] = useState(false);
    const topRef = useRef<HTMLDivElement>(null);

    const groupedData = useMemo(() => {
        const filtered = startups.filter(s => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return s.name.toLowerCase().includes(term) ||
                s.sector.toLowerCase().includes(term) ||
                s.vertical.toLowerCase().includes(term);
        });

        const sectorMap = new Map<Sector, SectorData>();

        SECTOR_ORDER.forEach(sector => {
            sectorMap.set(sector, { name: sector, count: 0, verticals: [] });
        });

        filtered.forEach(s => {
            let sectorGroup = sectorMap.get(s.sector);
            if (!sectorGroup) {
                sectorGroup = { name: s.sector, count: 0, verticals: [] };
                sectorMap.set(s.sector, sectorGroup);
            }
            sectorGroup.count++;
            let verticalGroup = sectorGroup.verticals.find(v => v.name === s.vertical);
            if (!verticalGroup) {
                verticalGroup = { name: s.vertical, count: 0, startups: [] };
                sectorGroup.verticals.push(verticalGroup);
            }
            verticalGroup.count++;
            verticalGroup.startups.push(s);
        });

        sectorMap.forEach(group => {
            group.verticals.sort((a, b) => b.count - a.count);
            group.verticals.forEach(v => v.startups.sort((a, b) => a.name.localeCompare(b.name)));
        });

        return Array.from(sectorMap.values());
    }, [startups, searchTerm]);

    const toggleVertical = (id: string) => {
        setExpandedVertical(prev => prev === id ? null : id);
    };

    const scrollToTop = () => {
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div ref={topRef} className="w-full min-h-full bg-[#f8fafc] text-[#0a0a0a] font-mono flex flex-col pt-8 px-12 select-none">

            {/* Header Section */}
            <header className="mb-10 flex-shrink-0">
                <h1 className="text-[4.5vw] md:text-6xl lg:text-7xl leading-[0.85] font-black tracking-tighter uppercase m-0 max-w-2xl">
                    Berlin<br />Ecosystem
                </h1>
            </header>

            {/* Main Typographic Grid */}
            <div className="w-full columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-x-12 pb-24">
                {groupedData.map((sector, index) => {
                    const idx = (index + 1).toString().padStart(2, '0');
                    return (
                        <div key={sector.name} className="flex flex-col relative break-inside-avoid mb-12">
                            <div className="flex items-center space-x-3 mb-2 opacity-50">
                                <span className="h-0.5 w-6 bg-black"></span>
                                <span className="text-[10px] font-bold tracking-widest uppercase">Sector {idx}</span>
                            </div>

                            <h2 className="text-2xl font-black uppercase tracking-tight leading-tight mb-2 h-14">
                                {sector.name}
                            </h2>

                            <div className="text-[5.5rem] leading-none font-black tracking-tighter mb-8 tabular-nums">
                                {sector.count.toString().padStart(3, '0')}
                            </div>

                            <div className="flex flex-col space-y-3 w-full border-t border-black/10 pt-4 relative z-10">
                                {sector.verticals.map(vertical => {
                                    const vId = `${sector.name}|${vertical.name}`;
                                    const isExpanded = expandedVertical === vId;

                                    return (
                                        <div key={vertical.name} className="flex flex-col text-sm font-bold uppercase tracking-widest">
                                            <div
                                                className="flex justify-between items-center w-full cursor-pointer hover:bg-black/5 p-1 -mx-1 transition-colors"
                                                onClick={() => toggleVertical(vId)}
                                            >
                                                <span className="truncate pr-2">{vertical.name}</span>
                                                <span className="tabular-nums font-black">{vertical.count.toString().padStart(2, '0')}</span>
                                            </div>

                                            {isExpanded && (
                                                <div className="mt-2 mb-4 pl-3 border-l-2 border-black/10 flex flex-col space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar">
                                                    {vertical.startups.map(s => (
                                                        <div key={s.id}
                                                            className="text-xs font-medium opacity-80 hover:opacity-100 hover:text-black cursor-pointer truncate transition-opacity flex justify-between items-baseline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onStartupClick(s);
                                                            }}
                                                        >
                                                            <span className="truncate pr-4">{s.name}</span>
                                                            <span className="tabular-nums opacity-60 font-bold whitespace-nowrap">
                                                                €{s.funding >= 1000 ? (s.funding / 1000).toFixed(1) + 'B' : s.funding + 'M'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <footer className="w-full flex justify-between items-end pb-8 pt-10 border-t-[3px] border-black uppercase text-[11px] font-bold tracking-widest text-[#0a0a0a]/60 bg-[#f8fafc] mt-auto gap-12">
                {/* Left: Branding */}
                <div className="flex flex-col gap-4">
                    <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
                    <div>
                        <div className="text-xl font-black uppercase leading-none tracking-tighter text-[#0a0a0a]">Berlin Venture Atlas</div>
                        <div className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">Validated Research // Q1 2026</div>
                    </div>
                    <div className="text-[9px] font-bold opacity-30 uppercase tracking-[0.1em] max-w-xs leading-relaxed normal-case">
                        Data sourced from PitchBook, Sifted, EU-Startups, TechCrunch Europe and fund disclosures.
                    </div>
                </div>

                {/* Center: Links */}
                <div className="flex gap-16 pb-1">
                    <div className="flex flex-col gap-4">
                        <span className="text-black">Research</span>
                        {/* Methodology with hover tooltip */}
                        <div className="relative">
                            <span
                                className="cursor-pointer hover:text-black transition-colors"
                                onMouseEnter={() => setShowMethodology(true)}
                                onMouseLeave={() => setShowMethodology(false)}
                            >
                                Methodology
                            </span>
                            {showMethodology && (
                                <div className="absolute bottom-full left-0 mb-3 z-50 w-80 bg-white border border-black shadow-[4px_4px_0px_black] p-4 pointer-events-none">
                                    <span className="text-[9px] font-black uppercase opacity-30 tracking-widest block mb-2">Research Methodology</span>
                                    <p className="text-[10px] leading-relaxed text-black/80 font-medium normal-case tracking-normal">
                                        {METHODOLOGY_TEXT}
                                    </p>
                                </div>
                            )}
                        </div>
                        <a href="#" className="hover:text-black transition-colors">Data Sources</a>
                    </div>

                    <div className="flex flex-col gap-4">
                        <span className="text-black">Connect</span>
                        <a href="https://x.com/derinbarutcu_" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">Twitter / X</a>
                    </div>
                </div>

                {/* Right: Back to Top + Credit */}
                <div className="flex flex-col items-end gap-4 pb-1">
                    <button
                        onClick={scrollToTop}
                        className="cursor-pointer hover:text-black transition-colors text-[11px] font-bold uppercase tracking-widest"
                    >
                        Back to Top ↑
                    </button>
                    <span className="text-[9px] opacity-50 normal-case tracking-normal">Made by Derin ❤️</span>
                </div>
            </footer>
        </div>
    );
};
