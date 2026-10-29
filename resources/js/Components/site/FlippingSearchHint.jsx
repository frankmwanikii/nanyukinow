import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const FLIP_WORDS = [
    'Hotels',
    'Events',
    'Cafes',
    'Properties',
    'Shopping',
    'Restaurants',
];

/**
 * Animated rotating keyword for search placeholders.
 * Renders as an overlay when the input is empty.
 */
export default function FlippingSearchHint({
    visible = true,
    prefix = 'Search',
    className = '',
}) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!visible) return undefined;
        const id = window.setInterval(() => {
            setIndex((i) => (i + 1) % FLIP_WORDS.length);
        }, 2200);
        return () => window.clearInterval(id);
    }, [visible]);

    if (!visible) return null;

    return (
        <span
            className={`pointer-events-none absolute inset-y-0 flex items-center gap-1.5 overflow-hidden text-[15px] text-white/65 sm:text-base ${
                className || 'left-7'
            }`}
            aria-hidden
        >
            <span className="shrink-0">{prefix}</span>
            <span className="relative inline-flex h-[1.25em] min-w-[7.5rem] items-center">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={FLIP_WORDS[index]}
                        initial={{ y: 12, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -12, opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="absolute left-0 font-semibold text-white/80"
                    >
                        {FLIP_WORDS[index]}
                    </motion.span>
                </AnimatePresence>
            </span>
        </span>
    );
}

export { FLIP_WORDS };
