import React, { useMemo, useState } from 'react';
import type { Startup } from '../types';

interface CompaniesViewProps {
    startups: Startup[];
    onStartupClick: (s: Startup) => void;
    searchTerm: string;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({ startups, onStartupClick, searchTerm }) => {
    const [sortKey, setSortKey] = useState<'name' | 'funding' | 'founded'>('funding');

    const filtered = useMemo(() => {
        let result = startups.filter(s => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return s.name.toLowerCase().includes(term) ||
                s.sector.toLowerCase().includes(term) ||
                s.vertical.toLowerCase().includes(term);
        });

        return result.sort((a, b) => {
            if (sortKey === 'name') return a.name.localeCompare(b.name);
            if (sortKey === 'funding') return b.funding - a.funding;
            if (sortKey === 'founded') return (b.founded || 0) - (a.founded || 0);
            return 0;
        });
    }, [startups, searchTerm, sortKey]);

    return (
        <div className="w-full min-h-full bg-white text-black font-mono">
            {/* Header / Column Labels */}
            <div className="grid grid-cols-12 gap-0 border-b border-black text-[10px] font-black uppercase tracking-[0.2em] bg-neutral-50 px-6 py-3 sticky top-0 z-10 select-none">
                <div className="col-span-4 cursor-pointer hover:text-neutral-mid" onClick={() => setSortKey('name')}>Entity Name</div>
                <div className="col-span-2">Sector</div>
                <div className="col-span-2">Vertical</div>
                <div className="col-span-1 text-right cursor-pointer hover:text-neutral-mid" onClick={() => setSortKey('founded')}>Est.</div>
                <div className="col-span-2 text-right cursor-pointer hover:text-neutral-mid" onClick={() => setSortKey('funding')}>Funding (EUR)</div>
                <div className="col-span-1 text-right">Round</div>
            </div>

            {/* List Body */}
            <div className="flex flex-col">
                {filtered.map(s => (
                    <div
                        key={s.id}
                        onClick={() => onStartupClick(s)}
                        className="grid grid-cols-12 gap-0 px-6 py-4 border-b border-black/5 hover:bg-black/5 cursor-pointer items-center transition-colors group"
                    >
                        <div className="col-span-4 flex items-center space-x-3">
                            <span className="font-black text-sm uppercase tracking-tight group-hover:underline decoration-1 underline-offset-4">{s.name}</span>
                        </div>
                        <div className="col-span-2 text-[10px] font-bold uppercase opacity-40 italic">{s.sector}</div>
                        <div className="col-span-2 text-[10px] font-bold uppercase tracking-wide">{s.vertical}</div>
                        <div className="col-span-1 text-right text-[10px] font-bold opacity-60 tabular-nums">{s.founded}</div>
                        <div className="col-span-2 text-right text-sm font-black tabular-nums">
                            €{s.funding > 999 ? (s.funding / 1000).toFixed(1) + 'B' : s.funding + 'M'}
                        </div>
                        <div className="col-span-1 text-right">
                            <span className="text-[9px] font-black border border-black px-2 py-0.5 inline-block">
                                {s.rounds.length > 0 ? s.rounds[s.rounds.length - 1].series.toUpperCase() : '-'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
