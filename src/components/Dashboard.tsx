import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Startup } from '../types';
import { D3Treemap } from './D3Treemap';
import { MouseOverlay } from './MouseOverlay';
import { CompaniesView } from './CompaniesView';
import { InvestorsView } from './InvestorsView';
import { supabase } from '../lib/supabaseClient';
import { startupsMaster } from '../data/startups_master';

export const Dashboard: React.FC = () => {
    // ---- STATE ----
    const [view, setView] = useState<'ecosystem' | 'companies' | 'investors'>('ecosystem');
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredData, setHoveredData] = useState<{ startup: Startup | null; isCategory: boolean; categoryName?: string }>({
        startup: null,
        isCategory: false
    });
    const [startupsData, setStartupsData] = useState<Startup[]>(startupsMaster);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    // ---- EFFECTS ----
    useEffect(() => {
        document.documentElement.classList.remove('dark');
        document.body.style.backgroundColor = '#ffffff';
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const isConfigured = !!supabase && !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
            if (!isConfigured) return;

            setLoading(true);
            try {
                const { data: startups, error: sError } = await supabase!
                    .from('startups')
                    .select('*, funding_rounds(*)');

                if (sError) throw sError;

                if (startups && startups.length > 0) {
                    const mappedData: Startup[] = startups.map((s: any) => ({
                        id: s.id,
                        name: s.name,
                        sector: s.sector,
                        vertical: s.vertical,
                        district: s.district,
                        description: s.description,
                        founded: s.founded_year,
                        rounds: s.funding_rounds.map((r: any) => ({
                            date: r.funding_date,
                            amount: r.amount_eur / 1000000,
                            series: r.series as any
                        })),
                        funding: s.funding_rounds.reduce((sum: number, r: any) => sum + (r.amount_eur / 1000000), 0),
                        runway: 'Safe',
                        burnRate: 0
                    }));
                    setStartupsData(mappedData);
                }
            } catch (err: any) {
                console.warn("Supabase fetch failed:", err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredStartups = useMemo(() => {
        return startupsData.filter(s => {
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return s.name.toLowerCase().includes(term) ||
                    s.sector.toLowerCase().includes(term) ||
                    s.vertical.toLowerCase().includes(term);
            }
            return true;
        });
    }, [startupsData, searchTerm]);

    const totalVolume = useMemo(() => {
        return filteredStartups.reduce((acc, s) => acc + s.funding, 0);
    }, [filteredStartups]);

    return (
        <div className="h-screen w-screen bg-white text-black transition-colors duration-300 overflow-hidden flex flex-col font-mono selection:bg-black selection:text-white">
            {/* Header / Nav - Simplified No Black Bars */}
            <nav className="h-20 flex items-center justify-between px-10 bg-white z-[100] flex-shrink-0">
                <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setView('ecosystem')}>
                    <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                    <div className="flex flex-col">
                        <span className="font-bold text-base uppercase tracking-tight leading-none">Berlin Venture Atlas</span>
                        <span className="text-[9px] text-neutral-mid uppercase tracking-[0.3em] mt-1.5 opacity-40">2026 RESEARCH EDITION</span>
                    </div>
                </div>

                <div className="flex items-center space-x-10 text-xs font-bold uppercase tracking-widest text-neutral-mid">
                    <button onClick={() => setView('ecosystem')} className={`hover:text-black transition-all ${view === 'ecosystem' ? 'text-black underline underline-offset-8 decoration-2' : ''}`}>Ecosystem</button>
                    <button onClick={() => setView('companies')} className={`hover:text-black transition-all ${view === 'companies' ? 'text-black underline underline-offset-8 decoration-2' : ''}`}>Companies</button>
                    <button onClick={() => setView('investors')} className={`hover:text-black transition-all ${view === 'investors' ? 'text-black underline underline-offset-8 decoration-2' : ''}`}>Investors</button>

                    <div className="relative ml-6">
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="SEARCH TERMINAL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') searchRef.current?.blur(); }}
                            className="bg-transparent border-b border-black/10 px-0 py-1 pr-6 text-[11px] focus:ring-0 focus:border-black uppercase placeholder-black/10 w-52 font-bold tracking-widest outline-none transition-colors"
                        />
                    </div>
                </div>
            </nav>

            {/* Main Content Area - Clean Edge-to-Edge with minimal padding */}
            <main className="flex-1 w-full overflow-hidden relative">
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-12 h-[2px] bg-black/10">
                            <div className="w-1/2 h-full bg-black animate-[loading_1.5s_infinite]"></div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full p-8 bg-[#F8F9FA]">
                        {view === 'ecosystem' && (
                            <div className="w-full h-full overflow-hidden bg-white shadow-[0_0_40px_rgba(0,0,0,0.03)] rounded-xl relative">
                                <D3Treemap
                                    startups={filteredStartups}
                                    onStartupHover={(s: Startup | null, isCat?: boolean, name?: string) => setHoveredData({ startup: s, isCategory: !!isCat, categoryName: name })}
                                />
                            </div>
                        )}

                        {view === 'companies' && (
                            <div className="w-full h-full overflow-y-auto border border-black/10 rounded-sm">
                                <CompaniesView
                                    startups={filteredStartups}
                                    onStartupClick={() => { }}
                                    searchTerm={searchTerm}
                                />
                            </div>
                        )}

                        {view === 'investors' && (
                            <div className="w-full h-full overflow-y-auto border border-black/10 rounded-sm px-6">
                                <InvestorsView />
                            </div>
                        )}
                    </div>
                )}

                {/* Status Bar - Simplified */}
                <div className="absolute bottom-4 left-10 text-[9px] font-black uppercase tracking-widest text-black/30 pointer-events-none flex items-center space-x-6">
                    <span className="flex items-center"><span className="w-1.5 h-1.5 bg-black rounded-full mr-2 animate-pulse"></span>System Active</span>
                    <span>Total Vol: €{(totalVolume / 1000).toFixed(2)}B</span>
                    <span>Lat: 52.5200° N, Lon: 13.4050° E</span>
                </div>
            </main>

            <MouseOverlay
                startup={hoveredData.startup}
                isCategory={hoveredData.isCategory}
                categoryName={hoveredData.categoryName}
            />
        </div>
    );
};
