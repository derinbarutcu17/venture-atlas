import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Startup } from '../types';
import { SectorBlock } from './SectorBlock';

interface TreemapGridProps {
    startups: Startup[];
    activeSector: string | null;
    onSectorClick: (sector: string) => void;
    onStartupHover: (s: Startup | null) => void;
    onStartupClick: (s: Startup) => void;
}

export const TreemapGrid: React.FC<TreemapGridProps> = ({
    startups, activeSector, onSectorClick, onStartupHover, onStartupClick
}) => {

    // Group by sector
    const sectors = React.useMemo(() => {
        const grouped: Record<string, { items: Startup[], total: number }> = {};
        startups.forEach(s => {
            if (!grouped[s.sector]) grouped[s.sector] = { items: [], total: 0 };
            grouped[s.sector].items.push(s);
            grouped[s.sector].total += s.funding;
        });
        return grouped;
    }, [startups]);

    // Layout Configuration
    // We mirror the static layout: Fintech (Big), AI (Medium), etc.
    const getGridClass = (sector: string) => {
        switch (sector) {
            case 'Fintech': return "col-span-12 md:col-span-6 row-span-4";
            case 'AI & Data': return "col-span-12 md:col-span-4 row-span-3";
            case 'BioTech': return "col-span-12 md:col-span-2 row-span-3";
            case 'SaaS': return "col-span-12 md:col-span-4 row-span-1";
            case 'Energy': return "col-span-12 md:col-span-2 row-span-1";
            case 'Climate Tech': return "col-span-12 md:col-span-6 row-span-2";
            case 'Foodtech': return "col-span-12 md:col-span-3 row-span-2";
            case 'Others': return "col-span-12 md:col-span-3 row-span-2";
            default: return "col-span-4";
        }
    };

    return (
        <div className="relative w-full">
            {/* Using grid layout only when NOT zoomed or for the non-zoomed items */}
            <motion.div
                layout
                className={`w-full grid grid-cols-12 auto-rows-min gap-8 uppercase text-[10px] font-bold pb-20 transition-all duration-500 ${activeSector ? 'pointer-events-none opacity-20 filter blur-sm' : ''}`}
            >
                {Object.entries(sectors).map(([name, data]) => {
                    // If this is the active sector, we might want to hide it here so the overlay takes over?
                    // Actually, let's keep it here for the background context or "blur" effect.
                    return (
                        <SectorBlock
                            key={name}
                            className={getGridClass(name)}
                            title={name}
                            startups={data.items}
                            totalFunding={data.total}
                            onStartupHover={onStartupHover}
                            onStartupClick={onStartupClick}
                            onSectorClick={() => onSectorClick(name)}
                        />
                    );
                })}
            </motion.div>

            {/* Overlay for Zoomed Sector */}
            <AnimatePresence>
                {activeSector && sectors[activeSector] && (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute inset-0 z-50 flex items-start justify-center bg-white/95 dark:bg-neutral-dark/95 backdrop-blur-xl p-4 md:p-8"
                    >
                        <div className="w-full h-full max-w-7xl relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); onSectorClick(''); }} // Clear selection
                                className="absolute top-0 right-0 z-50 brutalist-button bg-neutral-dark text-white text-sm py-3 px-8 hover:bg-violet-accent transition-colors"
                            >
                                CLOSE VIEW
                            </button>

                            <SectorBlock
                                className="w-full h-full"
                                title={activeSector}
                                startups={sectors[activeSector].items}
                                totalFunding={sectors[activeSector].total}
                                onStartupHover={onStartupHover}
                                onStartupClick={onStartupClick}
                                onSectorClick={() => { }}
                                isZoomed={true}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
