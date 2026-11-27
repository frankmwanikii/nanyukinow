import { useEffect, useState } from 'react';

const FLIP_WORDS = [
    'Airbnbs',
    'Hotels',
    'Cafes',
    'Restaurants',
    'Bars',
    'Lodges',
    'Events',
    'Properties',
    'Shopping',
    'Things to do',
    'Services',
    'Spas',
];

/**
 * Rotating keyword for empty search fields — CSS only, no animation library.
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
            className={`pointer-events-none absolute inset-y-0 flex items-center gap-1.5 overflow-hidden text-base leading-none text-white/65 sm:text-[17px] ${
                className || 'left-7'
            }`}
            aria-hidden
        >
            <span className="shrink-0">{prefix}</span>
            <span className="relative inline-flex h-[1em] min-w-[9rem] items-center">
                <span
                    key={FLIP_WORDS[index]}
                    className="absolute left-0 top-1/2 -translate-y-1/2 font-semibold text-white/80"
                >
                    {FLIP_WORDS[index]}
                </span>
            </span>
        </span>
    );
}

export { FLIP_WORDS };
