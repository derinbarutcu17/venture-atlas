import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Startup } from '../types';

interface MouseOverlayProps {
    startup: Startup | null;
    isCategory?: boolean;
    categoryName?: string;
}

export const MouseOverlay: React.FC<MouseOverlayProps> = ({ startup, isCategory, categoryName }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // We use a high-frequency listener but smooth it with framer-motion's dynamic positioning
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const isActive = startup || isCategory;



    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        // X AXIS: Flip right if close to right edge, flip left if close to left edge
                        x: mousePos.x > (window.innerWidth - 320) ? mousePos.x - 300 : mousePos.x + 20,
                        // Y AXIS: Shift up if close to bottom
                        y: mousePos.y > (window.innerHeight - 300) ? mousePos.y - 280 : mousePos.y + 20
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                        type: "spring",
                        stiffness: 800, // Boosted for instant feel
                        damping: 40,
                        restDelta: 0.001
                    }}
                    className="fixed z-[300] pointer-events-none font-mono"
                >
                    <div className="bg-white border border-black p-4 w-72 text-black select-none shadow-[4px_4px_0px_black]">
                        {isCategory ? (
                            <div className="py-2">
                                <span className="text-[9px] font-black uppercase opacity-30 tracking-widest block mb-2">SPECTRUM ANALYSIS</span>
                                <h3 className="text-lg font-black uppercase leading-tight tracking-tight">
                                    {categoryName}
                                </h3>
                                <div className="mt-4 pt-2 border-t border-black/10 text-[10px] uppercase font-bold opacity-50 italic">
                                    Dive into {categoryName} verticals
                                </div>
                            </div>
                        ) : startup && (
                            <>
                                <div className="flex justify-between items-start mb-2 text-[9px] font-black uppercase opacity-50 tracking-widest">
                                    <span className="truncate max-w-[140px]">{startup.sector}</span>
                                    <span>Founded {startup.founded}</span>
                                </div>

                                <h3 className="text-base font-black uppercase mb-1 leading-tight tracking-tight">{startup.name}</h3>
                                <p className="text-[10px] font-bold text-neutral-mid lowercase mb-3 italic">
                                    {startup.vertical}
                                </p>

                                <div className="text-[10px] leading-relaxed mb-4 text-black/80 font-medium">
                                    {startup.description || "Leading innovator in the " + startup.sector + " ecosystem."}
                                </div>

                                <div className="mt-4 pt-3 border-t border-black flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase tracking-tighter opacity-30">Total Funding</span>
                                        <span className="text-sm font-black italic">
                                            {startup.funding >= 1000
                                                ? `€${(startup.funding / 1000).toFixed(1)}B`
                                                : `€${startup.funding.toFixed(1)}M`}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] font-black uppercase tracking-tighter opacity-30">Status</span>
                                        <span className="text-[9px] font-black uppercase bg-black text-white px-1.5 py-0.5 mt-1 tracking-widest">
                                            {startup.rounds.length > 0 ? startup.rounds[startup.rounds.length - 1].series.toUpperCase() : 'Live'}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
