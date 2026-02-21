import React, { useMemo } from 'react';


// interface InvestorsViewProps {
//     startups: Startup[];
// }

export const InvestorsView: React.FC<any> = () => {
    // Mock investor data derivation since we don't have a direct investors table yet
    const investors = useMemo(() => {
        const fakeVCs = [
            { name: 'HV Capital', deals: 52, volume: 2800 },
            { name: 'Earlybird', deals: 44, volume: 2100 },
            { name: 'Cherry Ventures', deals: 38, volume: 1200 },
            { name: 'Point Nine', deals: 35, volume: 850 },
            { name: 'Project A', deals: 29, volume: 720 },
            { name: 'Lakestar', deals: 22, volume: 1500 },
            { name: 'Visionaries Club', deals: 18, volume: 450 },
            { name: 'Index Ventures', deals: 48, volume: 3200 },
            { name: 'Accel Europe', deals: 42, volume: 2900 },
            { name: 'Redalpine', deals: 14, volume: 400 }
        ];
        return fakeVCs.sort((a, b) => b.volume - a.volume);
    }, []);

    return (
        <div className="w-full text-neutral-dark font-mono">
            <header className="mb-12 border-b-[3px] border-black pb-8">
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-[-0.05em] leading-[0.85] mb-4">INVESTORS</h1>
                <p className="text-neutral-mid uppercase tracking-widest text-sm font-bold">
                    MOST ACTIVE FUNDS BY CAPITAL DEPLOYED
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                {investors.map((vc, i) => (
                    <div key={vc.name} className="border-[2px] border-black p-6 hover:bg-black/[0.04] transition-colors group bg-white">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-black uppercase group-hover:text-violet-accent leading-none">{vc.name}</h3>
                            <span className="text-4xl font-black text-black/5 leading-none">{i + 1}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-8 pt-4 border-t-[2px] border-black">
                            <div>
                                <div className="text-[10px] uppercase text-neutral-mid font-bold tracking-widest">Est. Volume</div>
                                <div className="text-xl mono-data font-bold text-violet-accent">€{(vc.volume / 1000).toFixed(1)}B</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-neutral-mid font-bold tracking-widest">Activity</div>
                                <div className="text-xl mono-data font-bold text-neutral-dark">{vc.deals} DEALS</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
