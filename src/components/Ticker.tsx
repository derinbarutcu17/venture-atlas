import { motion } from 'framer-motion';

const TICKER_ITEMS = [
    "N26 raises €900M Series E",
    "Gorillas expands to NYC",
    "Trade Republic hits 1M users",
    "Tier acquires Nextbike",
    "Lilium goes public via SPAC",
    "GetYourGuide secures €80M debt financing",
    "Forto valued at $2.1B",
    "Pitch adds presentation analytics",
];

export const Ticker = () => {
    return (
        <div className="fixed bottom-0 left-0 right-0 h-8 border-t border-neutral-dark dark:border-neutral-mid bg-white dark:bg-neutral-dark flex items-center overflow-hidden z-40">
            <div className="flex whitespace-nowrap w-full">
                <motion.div
                    className="flex gap-12 px-4 w-max"
                    animate={{ x: "-50%" }}
                    transition={{
                        repeat: Infinity,
                        duration: 30, // Slower for readability
                        ease: "linear",
                    }}
                >
                    {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                        <span key={i} className="text-[10px] font-black font-display text-violet-accent uppercase tracking-widest flex items-center">
                            <span className="w-2 h-2 bg-violet-accent mr-3 animate-pulse"></span>
                            LIVE /// {item}
                        </span>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};
