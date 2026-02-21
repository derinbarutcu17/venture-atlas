import React from 'react';
import { Header, type ViewMode } from './Header'; // Adjust import if needed
import { Ticker } from './Ticker';

interface LayoutProps {
    children: React.ReactNode;
    currentMode: ViewMode;
    onModeChange: (mode: ViewMode) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentMode, onModeChange }) => {
    return (
        <div className="min-h-screen bg-background text-foreground font-mono selection:bg-accent-blue selection:text-black overflow-hidden flex flex-col">
            <Header currentMode={currentMode} onModeChange={onModeChange} />

            <main className="flex-1 pt-16 pb-10 relative overflow-hidden">
                {children}
            </main>

            <Ticker />
        </div>
    );
};
