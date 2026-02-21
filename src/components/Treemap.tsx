import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Startup } from '../types';
import { StartupBlock } from './StartupBlock';

interface TreemapProps {
    startups: Startup[];
    mode: 'district' | 'sector' | 'burn';
    onStartupClick: (startup: Startup) => void;
}

export const Treemap: React.FC<TreemapProps> = ({ startups, mode, onStartupClick }) => {
    // grouping logic
    const groups = React.useMemo(() => {
        const grouped: Record<string, Startup[]> = {};

        startups.forEach(startup => {
            let key = '';
            if (mode === 'district') key = startup.district;
            else if (mode === 'sector') key = startup.sector;
            else if (mode === 'burn') key = startup.runway;

            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(startup);
        });

        // Sort groups? Maybe alphabetical or by total funding.
        // Let's sort keys alphabetically for stability.
        // Special case for 'Runway': Safe > Danger > Critical order?
        let keys = Object.keys(grouped);
        if (mode === 'burn') {
            const order = ['Safe', 'Danger', 'Critical'];
            keys.sort((a, b) => order.indexOf(a) - order.indexOf(b));
        } else {
            keys.sort();
        }

        return keys.map(key => ({
            title: key,
            items: grouped[key].sort((a, b) => b.funding - a.funding) // Sort by funding desc inside groups
        }));
    }, [startups, mode]);

    const totalFunding = startups.reduce((acc, s) => acc + s.funding, 0);

    return (
        <div className="w-full h-full p-6 overflow-y-auto">
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20"
            >
                <AnimatePresence mode='popLayout'>
                    {groups.map((group) => (
                        <motion.div
                            layout
                            key={group.title}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4, type: "spring" }}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex items-baseline justify-between border-b border-border pb-2 mb-2">
                                <h2 className="text-xl font-bold uppercase tracking-widest text-foreground">
                                    {group.title}
                                </h2>
                                <span className="text-xs font-mono text-foreground/50">
                                    {group.items.length} ENTITIES /// €{group.items.reduce((a, b) => a + b.funding, 0)}M
                                </span>
                            </div>

                            <div className="flex flex-wrap content-start gap-1 min-h-[200px]">
                                {group.items.map(startup => (
                                    <StartupBlock
                                        key={startup.id}
                                        startup={startup}
                                        maxFunding={totalFunding} // Not strictly used yet but good for context
                                        onClick={onStartupClick}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
