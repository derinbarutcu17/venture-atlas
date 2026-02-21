export type District = 'Mitte' | 'Kreuzberg' | 'Neukölln' | 'Prenzlauer Berg' | 'Friedrichshain' | 'Charlottenburg' | 'Tempelhof';
export type Sector = 'Industrial Tech' | 'Standard Tech' | 'Mobility & Logistics' | 'Built World' | 'Creative Economy' | 'Health & Care' | 'Food & AgTech' | 'Social & Impact';
export type RunwayStatus = 'Safe' | 'Danger' | 'Critical';

export interface FundingRound {
    date: string; // ISO YYYY-MM-DD
    amount: number; // Millions
    series: 'Seed' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'IPO' | 'Late VC' | 'Late Stage' | 'Strategic' | 'Fund' | 'Exit';
    valuation?: number;
}

export interface Startup {
    id: string;
    name: string;
    funding: number; // Total Funding in Millions EUR
    district: District;
    sector: Sector;
    vertical: string; // e.g. "Neo-Banks", "DeFi"
    runway: RunwayStatus;
    burnRate: number; // in Thousands EUR/month
    description: string;
    founded: number; // Year
    rounds: FundingRound[];
    url?: string; // Official website
}
