import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Map, PieChart } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export type ViewMode = 'district' | 'sector' | 'burn';

interface HeaderProps {
    currentMode: ViewMode;
    onModeChange: (mode: ViewMode) => void;
}

const MODES: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'district', label: 'DISTRICT', icon: <Map className="w-4 h-4" /> },
    { id: 'sector', label: 'SECTOR', icon: <PieChart className="w-4 h-4" /> },
    { id: 'burn', label: 'BURN RATE', icon: <Activity className="w-4 h-4" /> },
];

export const Header: React.FC<HeaderProps> = ({ currentMode, onModeChange }) => {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-background/90 backdrop-blur-sm z-50 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Berlin Venture Atlas Logo" className="w-8 h-8 object-contain" />
                <h1 className="text-xl font-bold tracking-tighter">BERLIN VENTURE ATLAS</h1>
            </div>

            <nav className="flex items-center gap-2">
                {MODES.map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => onModeChange(mode.id)}
                        className={twMerge(
                            "relative px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors",
                            currentMode === mode.id ? "text-background" : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                        )}
                    >
                        {currentMode === mode.id && (
                            <motion.div
                                layoutId="active-pill"
                                className="absolute inset-0 bg-accent-blue"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {mode.icon}
                            {mode.label}
                        </span>
                    </button>
                ))}
            </nav>

            <div className="flex items-center gap-4 text-xs text-foreground/40 hidden md:flex">
                <span>STATUS: ONLINE</span>
                <span>v1.0.0</span>
            </div>
        </header>
    );
};
