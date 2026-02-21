import React from 'react';
import { motion } from 'framer-motion';
import type { Startup } from '../types';
import { clsx } from 'clsx';

interface StartupBlockProps {
    startup: Startup;
    onClick: (startup: Startup) => void;
    maxFunding: number; // For relative sizing context if needed
}

export const StartupBlock: React.FC<StartupBlockProps> = ({ startup, onClick }) => {
    // Simple size calculation: Funding maps to flex-grow or width weight
    // We use flex-grow to let it fill space, but we also set a min-width base


    return (
        <motion.div
            layoutId={`startup-${startup.id}`}
            className={clsx(
                "relative group flex-grow h-32 border border-border bg-background cursor-pointer overflow-hidden",
                "hover:z-10 hover:border-accent-blue/50 transition-colors duration-300"
            )}
            style={{
                flexGrow: startup.funding,
                flexBasis: `${Math.max(100, startup.funding * 0.5)}px` // Dynamic base width
            }}
            onClick={() => onClick(startup)}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {/* Background Status Indicator (Subtle) */}
            <div
                className={clsx(
                    "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                    startup.runway === 'Safe' && "bg-accent-green",
                    startup.runway === 'Danger' && "bg-accent-red",
                    startup.runway === 'Critical' && "bg-red-900 animate-pulse"
                )}
            />

            {/* Content */}
            <div className="absolute inset-0 p-3 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <span className="text-sm font-bold tracking-tight bg-background/80 px-1 border border-transparent group-hover:border-accent-blue group-hover:text-accent-blue transition-colors">
                        {startup.name}
                    </span>
                    <span className="text-xs text-foreground/50 font-mono">
                        €{startup.funding}M
                    </span>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-200">
                    <div className="text-[10px] uppercase tracking-wider text-foreground/70">
                        {startup.sector}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-foreground/40">
                        {startup.district}
                    </div>
                </div>
            </div>

            {/* Custom Glitch Tooltip Effect handled via AnimatePresence in parent or absolute here? 
          For "tooltip that follows mouse", usually done at app level, but here let's do a simple overlay.
      */}

        </motion.div>
    );
};
