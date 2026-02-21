import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';
import type { Startup } from '../types';
import { clsx } from 'clsx';

interface DetailModalProps {
    startup: Startup | null;
    onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ startup, onClose }) => {
    if (!startup) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                layout
                layoutId={`startup-${startup.id}`} // Shared layout ID for seamless expansion? 
                // Note: Sharing layoutId between a list item and a modal is tricky if both exist.
                // Usually we unmount list item or use a different ID scheme, but Framer Motion handles it if properly keyed.
                // For simplicity and robustness, I won't share layoutId here to avoid "disappearing" from grid issues, 
                // using standard modal animation instead for now.
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-2xl glass-panel p-8 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <motion.h2
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="text-4xl font-bold tracking-tighter mb-2"
                        >
                            {startup.name}
                        </motion.h2>
                        <div className="flex items-center gap-2 mb-6 text-sm font-mono text-foreground/60">
                            <span className="px-2 py-1 border border-border">{startup.district}</span>
                            <span className="px-2 py-1 border border-border">{startup.sector}</span>
                        </div>

                        <p className="text-lg leading-relaxed text-foreground/90 mb-8">
                            {startup.description}
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-border pb-2">
                                <span className="text-foreground/50">FOUNDED</span>
                                <span className="font-mono">{startup.founded}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-border pb-2">
                                <span className="text-foreground/50">TOTAL FUNDING</span>
                                <span className="font-mono text-accent-green">€{startup.funding}M</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 border border-border bg-white/5">
                            <h3 className="text-xs uppercase tracking-widest text-foreground/50 mb-4">Runway Analysis</h3>
                            <div className="flex items-center gap-4 mb-2">
                                {startup.runway === 'Safe' && <CheckCircle className="text-accent-green w-8 h-8" />}
                                {startup.runway === 'Danger' && <AlertTriangle className="text-accent-red w-8 h-8" />}
                                {startup.runway === 'Critical' && <XCircle className="text-red-600 w-8 h-8" />}

                                <div>
                                    <div className="text-2xl font-bold">{startup.runway.toUpperCase()}</div>
                                    <div className="text-xs text-foreground/50">Based on standard burn metrics</div>
                                </div>
                            </div>
                            <div className="w-full bg-border h-1 mt-4">
                                <div
                                    className={clsx(
                                        "h-full transition-all duration-500",
                                        startup.runway === 'Safe' ? "bg-accent-green w-3/4" :
                                            startup.runway === 'Danger' ? "bg-accent-red w-1/3" : "bg-red-600 w-1/12"
                                    )}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-xs font-mono">
                                <span>BURN RATE</span>
                                <span>€{startup.burnRate}k / mo</span>
                            </div>
                        </div>

                        <div className="h-32 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 border border-border" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
