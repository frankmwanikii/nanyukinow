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
            className={`pointer-events-none absolute inset-y-0 flex items-center gap-1.5 overflow-hidden text-[15px] text-white/65 sm:text-base ${
                className || 'left-7'
            }`}
            aria-hidden
        >
            <span className="shrink-0">{prefix}</span>
            <span className="relative inline-flex h-[1.25em] min-w-[7.5rem] items-center">
                <span
                    key={FLIP_WORDS[index]}
                    className="absolute left-0 font-semibold text-white/80"
                >
                    {FLIP_WORDS[index]}
                </span>
            </span>
        </span>
    );
}

export { FLIP_WORDS };
