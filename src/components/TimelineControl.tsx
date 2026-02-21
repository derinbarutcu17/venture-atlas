import React from 'react';

interface TimelineControlProps {
    startDate: string;
    endDate: string;
    onChange: (start: string, end: string) => void;
}

export const TimelineControl: React.FC<TimelineControlProps> = () => {
    const [handlePosition, setHandlePosition] = React.useState(80); // percentage

    const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        setHandlePosition(percentage);
    };

    return (
        <section className="space-y-8 pt-12">
            <div className="flex items-center justify-between border-b-[3px] border-black pb-4">
                <div className="flex items-center space-x-6">
                    <span className="text-sm font-black uppercase tracking-[0.2em] text-neutral-dark">TIMEFRAME</span>
                    <div className="flex space-x-2">
                        <button className="px-5 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors border border-black">LATEST</button>
                        <button className="brutalist-button text-[10px] border border-black h-fit">1W</button>
                        <button className="brutalist-button text-[10px] border border-black h-fit">1M</button>
                        <button className="brutalist-button text-[10px] border border-black h-fit">6M</button>
                        <button className="brutalist-button text-[10px] border border-black h-fit">1Y</button>
                        <button className="brutalist-button text-[10px] border border-black h-fit">ALL</button>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="border border-black px-4 py-2 flex items-center space-x-4 bg-white font-mono">
                        <span className="mono-data text-xs font-bold text-neutral-dark">FEB 14 2026</span>
                        <span className="material-symbols-outlined text-sm text-neutral-mid">calendar_today</span>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="relative h-64 w-full bg-white border-[3px] border-black group cursor-crosshair">
                <svg
                    className="w-full h-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 100"
                    onClick={handleClick}
                >
                    <path d="M0,100 L0,70 L10,65 L20,60 L30,55 L40,62 L50,50 L60,58 L70,55 L80,52 L90,45 L100,40 L100,100 Z" fill="#404040" fillOpacity="0.05" stroke="#404040" strokeWidth="0.2"></path>
                    <path className="transition-all duration-300 group-hover:stroke-violet-accent group-hover:fill-violet-accent/10" d="M0,70 L10,65 L20,60 L30,55 L40,62 L50,50 L60,58 L70,55 L80,52 L90,45 L100,40 L100,30 L90,35 L80,42 L70,45 L60,48 L50,40 L40,52 L30,45 L20,50 L10,55 L0,60 Z" fill="#5B21B6" fillOpacity="0.08" stroke="#5B21B6" strokeWidth="1.5"></path>

                    {/* Dynamic Lines based on handle */}
                    <rect className="fill-violet-accent/5" x={handlePosition - 10} y="0" width="20" height="100" />
                    <line x1={handlePosition} y1="0" x2={handlePosition} y2="100" stroke="#5B21B6" strokeWidth="2" strokeDasharray="4" />
                </svg>
                <div className="absolute bottom-4 left-6 flex space-x-8 text-[9px] font-black uppercase tracking-[0.2em]">
                    <div className="flex items-center text-neutral-mid"><div className="w-2 h-2 bg-neutral-mid mr-2"></div> FUNDING FLOW</div>
                    <div className="flex items-center text-violet-accent"><div className="w-2 h-2 bg-violet-accent mr-2"></div> DEAL VOLUME</div>
                </div>
            </div>
        </section>
    );
};
