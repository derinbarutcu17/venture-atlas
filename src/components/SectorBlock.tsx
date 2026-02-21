import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Startup } from '../types';

interface SectorBlockProps {
    title: string;
    startups: Startup[];
    totalFunding: number;
    className?: string; // For grid positioning
    onStartupHover: (s: Startup | null) => void;
    onStartupClick: (s: Startup) => void;
    onSectorClick: () => void;
    isZoomed?: boolean;
}

export const SectorBlock: React.FC<SectorBlockProps> = ({
    title, startups, totalFunding, className, onStartupHover, onStartupClick, onSectorClick, isZoomed = false
}) => {
    const [activeVertical, setActiveVertical] = useState<string | null>(null);

    // Group items by vertical if zoomed
    const groupedVerticals = useMemo(() => {
        if (!isZoomed) return {};
        const groups: Record<string, Startup[]> = {};
        startups.forEach(s => {
            if (!groups[s.vertical]) groups[s.vertical] = [];
            groups[s.vertical].push(s);
        });
        return groups;
    }, [isZoomed, startups]);

    // Derived sorted verticals
    const verticalKeys = useMemo(() => {
        return Object.keys(groupedVerticals).sort((a, b) => {
            const sumA = groupedVerticals[a].reduce((sum, s) => sum + s.funding, 0);
            const sumB = groupedVerticals[b].reduce((sum, s) => sum + s.funding, 0);
            return sumB - sumA;
        });
    }, [groupedVerticals]);


    // RENDER: DEFAULT VIEW (Not Zoomed) -> Show top startups
    if (!isZoomed) {
        const sorted = [...startups].sort((a, b) => b.funding - a.funding).slice(0, 5); // Pick top 5 for preview

        return (
            <motion.div
                layoutId={`sector-${title}`}
                className={`sector-block flex flex-col ${className} bg-white dark:bg-neutral-dark border border-neutral-mid/20 p-4 transition-all hover:bg-neutral-50 dark:hover:bg-white/5 cursor-pointer`}
                onClick={(e) => { e.stopPropagation(); onSectorClick(); }}
            >
                <div className="flex justify-between items-baseline mb-4 border-b border-neutral-dark/10 dark:border-white/10 pb-2">
                    <span className="text-xl md:text-2xl font-black tracking-tighter uppercase dark:text-white">
                        {title}
                    </span>
                    <span className="mono-data text-neutral-mid ml-2">€{(totalFunding > 999 ? (totalFunding / 1000).toFixed(1) + 'B' : totalFunding.toFixed(0) + 'M')}</span>
                </div>

                <div className="flex-grow grid grid-cols-2 gap-2 content-start">
                    {sorted.map((startup) => (
                        <div key={startup.id} className="text-[10px] uppercase font-bold text-neutral-mid truncate">
                            {startup.name}
                        </div>
                    ))}
                    {startups.length > 5 && (
                        <div className="text-[10px] uppercase font-bold text-violet-accent">+ {startups.length - 5} MORE</div>
                    )}
                </div>
            </motion.div>
        );
    }

    // RENDER: ZOOMED VIEW (3-Level: Sector -> Verticals -> Startups)
    return (
        <div className="w-full h-full flex flex-col">
            <header className="flex items-baseline justify-between mb-8 border-b border-neutral-dark dark:border-white pb-4">
                <div>
                    <h2 className="text-4xl md:text-6xl font-black uppercase dark:text-white">{title}</h2>
                    <div className="text-sm font-bold tracking-widest text-violet-accent mt-2">
                        {activeVertical ? <span className="text-neutral-mid cursor-pointer hover:text-white transition-colors" onClick={() => setActiveVertical(null)}>ALL VERTICALS</span> : 'ECOSYSTEM OVERVIEW'}
                        {activeVertical && <span className="text-white"> / {activeVertical}</span>}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-black mono-data dark:text-white">€{(totalFunding > 999 ? (totalFunding / 1000).toFixed(1) + 'B' : totalFunding.toFixed(0) + 'M')}</div>
                    <div className="text-xs font-bold tracking-widest text-neutral-mid uppercase">Total Sector Volume</div>
                </div>
            </header>

            {/* Level 2: VERTICAL GRID */}
            <AnimatePresence mode="wait">
                {!activeVertical ? (
                    <motion.div
                        key="verticals-grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
                    >
                        {verticalKeys.map(vTitle => {
                            const vStartups = groupedVerticals[vTitle];
                            const vTotal = vStartups.reduce((sum, s) => sum + s.funding, 0);

                            return (
                                <motion.div
                                    key={vTitle}
                                    layoutId={`vertical-${vTitle}`}
                                    onClick={() => setActiveVertical(vTitle)}
                                    className="border border-neutral-dark/20 dark:border-white/20 p-6 hover:border-violet-accent cursor-pointer group bg-neutral-50 dark:bg-white/5"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold uppercase dark:text-white group-hover:text-violet-accent transition-colors">{vTitle}</h3>
                                        <span className="mono-data text-xs text-neutral-mid">€{(vTotal > 999 ? (vTotal / 1000).toFixed(1) + 'B' : vTotal.toFixed(0) + 'M')}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {vStartups.slice(0, 6).map(s => (
                                            <span key={s.id} className="text-[10px] border border-neutral-mid/30 px-2 py-1 rounded-full text-neutral-mid uppercase">{s.name}</span>
                                        ))}
                                        {vStartups.length > 6 && <span className="text-[10px] text-violet-accent self-center">+{vStartups.length - 6}</span>}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    // Level 3: STARTUP GRID (Inside Vertical)
                    <motion.div
                        key="startups-grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
                    >
                        {groupedVerticals[activeVertical].sort((a, b) => b.funding - a.funding).map(startup => (
                            <motion.div
                                key={startup.id}
                                layoutId={`startup-${startup.id}`}
                                className="aspect-square border border-neutral-dark/10 dark:border-white/10 p-4 flex flex-col justify-between hover:bg-violet-accent hover:border-transparent group cursor-pointer bg-white dark:bg-neutral-dark"
                                onMouseEnter={() => onStartupHover(startup)}
                                onMouseLeave={() => onStartupHover(null)}
                                onClick={(e) => { e.stopPropagation(); onStartupClick(startup); }}
                            >
                                <div>
                                    <div className="text-xs font-bold uppercase text-neutral-mid group-hover:text-white/80 mb-1">{startup.founded}</div>
                                    <div className="text-lg font-black uppercase leading-tight dark:text-white group-hover:text-white">{startup.name}</div>
                                </div>
                                <div className="mono-data text-xl dark:text-white group-hover:text-white">
                                    €{startup.funding > 999 ? (startup.funding / 1000).toFixed(1) + 'B' : startup.funding + 'M'}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
