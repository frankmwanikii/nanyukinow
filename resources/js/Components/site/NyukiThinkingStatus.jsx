import { useEffect, useState } from 'react';

const STATUSES = [
    'Scanning the directory…',
    'Matching places nearby…',
    'Checking hours and contacts…',
    'Gathering the useful bits…',
    'Writing a clear answer…',
];

const SPINNER = ['◐', '◓', '◑', '◒'];

/**
 * Claude-style rotating status line while Nyuki is answering.
 */
export default function NyukiThinkingStatus() {
    const [statusIndex, setStatusIndex] = useState(0);
    const [spinIndex, setSpinIndex] = useState(0);

    useEffect(() => {
        const reduceMotion =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduceMotion) {
            return undefined;
        }

        const statusTimer = window.setInterval(() => {
            setStatusIndex((i) => (i + 1) % STATUSES.length);
        }, 1600);

        const spinTimer = window.setInterval(() => {
            setSpinIndex((i) => (i + 1) % SPINNER.length);
        }, 220);

        return () => {
            window.clearInterval(statusTimer);
            window.clearInterval(spinTimer);
        };
    }, []);

    return (
        <p
            className="flex items-center gap-2 font-mono text-[13px] leading-snug text-olive-600"
            aria-live="polite"
            aria-busy="true"
        >
            <span className="inline-block w-[1.1em] shrink-0 text-center text-mustard" aria-hidden="true">
                {SPINNER[spinIndex]}
            </span>
            <span key={statusIndex} className="min-w-0 animate-[nn-nyuki-status_320ms_ease-out]">
                {STATUSES[statusIndex]}
            </span>
        </p>
    );
}
