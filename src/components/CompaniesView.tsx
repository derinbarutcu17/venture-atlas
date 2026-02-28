import React, { useMemo, useState } from 'react';
import type { Startup, Sector } from '../types';

interface CompaniesViewProps {
    startups: Startup[];
    searchTerm: string;
}

// Grouping logic for the specific design layout
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

// Pre-defined sector order based on the mockup grid
const SECTOR_ORDER: Sector[] = [
    'Standard Tech', // FinTech & Banking, Commerce & Retail
    'Creative Economy',
    'Built World',
    'Industrial Tech', // AI & Deep Tech
    'Food & AgTech',
    'Health & Care',
    'Mobility & Logistics',
    'Social & Impact'
];

export const CompaniesView: React.FC<CompaniesViewProps> = ({ startups, searchTerm }) => {
    // Accordion state: track which vertical is expanded. Format: "SectorName|VerticalName"
    const [expandedVertical, setExpandedVertical] = useState<string | null>(null);

    const groupedData = useMemo(() => {
        const filtered = startups.filter(s => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return s.name.toLowerCase().includes(term) ||
                s.sector.toLowerCase().includes(term) ||
                s.vertical.toLowerCase().includes(term);
        });

        const sectorMap = new Map<Sector, SectorData>();

        // Initialize map with all sectors to ensure grid is stable
        SECTOR_ORDER.forEach(sector => {
            sectorMap.set(sector, { name: sector, count: 0, verticals: [] });
        });

        filtered.forEach(s => {
            let sectorGroup = sectorMap.get(s.sector);
            if (!sectorGroup) {
                // Fallback for sectors not in SECTOR_ORDER (shouldn't happen with our typed data)
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

        // Sort verticals within sectors by count descending
        sectorMap.forEach(group => {
            group.verticals.sort((a, b) => b.count - a.count);
            // Sort startups alphabetically
            group.verticals.forEach(v => v.startups.sort((a, b) => a.name.localeCompare(b.name)));
        });

        return Array.from(sectorMap.values());
    }, [startups, searchTerm]);

    const toggleVertical = (id: string) => {
        setExpandedVertical(prev => prev === id ? null : id);
    };

    return (
        <div className="w-full min-h-full bg-[#f8fafc] text-[#0a0a0a] font-mono flex flex-col pt-8 px-12 select-none">

            {/* Header Section */}
            <header className="mb-10 flex-shrink-0">
                <h1 className="text-[4.5vw] md:text-6xl lg:text-7xl leading-[0.85] font-black tracking-tighter uppercase m-0 max-w-2xl">
                    Berlin<br />Ecosystem
                </h1>
            </header>

            {/* Main Typographic Grid (Masonry Smart Layout) */}
            <div className="w-full columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-x-12 pb-24">
                {groupedData.map((sector, index) => {
                    const idx = (index + 1).toString().padStart(2, '0');
                    return (
                        <div key={sector.name} className="flex flex-col relative break-inside-avoid mb-12">
                            {/* Sector Number & Line Indicator */}
                            <div className="flex items-center space-x-3 mb-2 opacity-50">
                                <span className={`h-0.5 w-6 bg-black`}></span>
                                <span className="text-[10px] font-bold tracking-widest uppercase">Sector {idx}</span>
                            </div>

                            {/* Sector Name */}
                            <h2 className="text-2xl font-black uppercase tracking-tight leading-tight mb-2 h-14">
                                {sector.name}
                            </h2>

                            {/* Total Count */}
                            <div className="text-[5.5rem] leading-none font-black tracking-tighter mb-8 tabular-nums">
                                {sector.count.toString().padStart(3, '0')}
                            </div>

                            {/* Verticals List / Accordions */}
                            <div className="flex flex-col space-y-3 w-full border-t border-black/10 pt-4 relative z-10">
                                {sector.verticals.map(vertical => {
                                    const vId = `${sector.name}|${vertical.name}`;
                                    const isExpanded = expandedVertical === vId;

                                    return (
                                        <div key={vertical.name} className="flex flex-col text-sm font-bold uppercase tracking-widest">
                                            {/* Vertical Header - Clickable */}
                                            <div
                                                className="flex justify-between items-center w-full cursor-pointer hover:bg-black/5 p-1 -mx-1 transition-colors"
                                                onClick={() => toggleVertical(vId)}
                                            >
                                                <span className="truncate pr-2">{vertical.name}</span>
                                                <span className="tabular-nums font-black">{vertical.count.toString().padStart(2, '0')}</span>
                                            </div>

                                            {/* Accordion Content (Startups) */}
                                            {isExpanded && (
                                                <div className="mt-2 mb-4 pl-3 border-l-2 border-black/10 flex flex-col space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar">
                                                    {vertical.startups.map(s => (
                                                        <div key={s.id} className="text-xs font-medium opacity-80 hover:opacity-100 hover:text-black cursor-pointer truncate transition-opacity flex justify-between items-baseline">
                                                            <span className="truncate pr-4">{s.name}</span>
                                                            <span className="tabular-nums opacity-60 font-bold whitespace-nowrap">€{s.funding >= 1000 ? (s.funding / 1000).toFixed(1) + 'B' : s.funding + 'M'}</span>
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

            {/* Brutalist Footer */}
            <footer className="w-full flex justify-between items-end pb-8 pt-6 border-t border-black/10 uppercase text-[11px] font-bold tracking-widest text-[#0a0a0a]/60 bg-[#f8fafc] mt-auto">
                <div className="flex flex-col space-y-4">
                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-xl italic tracking-tighter font-black">B</div>
                    <div className="flex flex-col space-y-1.5">
                        <span>© 2026 Berlin Venture Atlas.</span>
                        <span>All rights reserved.</span>
                        <span>Made in Kreuzberg.</span>
                    </div>
                </div>

                <div className="flex space-x-32 pb-1">
                    <div className="flex flex-col space-y-4">
                        <span className="text-black mb-1">Database</span>
                        <a href="#" className="hover:text-black transition-colors">Methodology</a>
                        <a href="#" className="hover:text-black transition-colors">API Access</a>
                        <a href="#" className="hover:text-black transition-colors">Contribute Data</a>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <span className="text-black mb-1">Connect</span>
                        <a href="#" className="hover:text-black transition-colors">Twitter / X</a>
                        <a href="#" className="hover:text-black transition-colors">LinkedIn</a>
                        <a href="#" className="hover:text-black transition-colors">Substack</a>
                    </div>
                </div>

                <div className="pb-1 cursor-pointer hover:text-black transition-colors h-full flex flex-col justify-end">
                    BACK TO TOP
                </div>
            </footer>
        </div>
    );
};
