import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

const STATUS_LINES = [
    'Fetching page',
    'Warming up',
    'Lacing boots',
    'Checking the map',
    'Gathering places',
    'Brewing the view',
    'Almost there',
    'Smoothing edges',
    'Polishing details',
    'Opening the gate',
];

/**
 * Full-page Inertia visit preloader.
 * Solid brand surface (no page blur), logo pulse, mustard orbit,
 * and rotating status lines in the Cursor style.
 */
export default function PageLoadingSpinner() {
    const [visible, setVisible] = useState(false);
    const [statusIndex, setStatusIndex] = useState(0);

    useEffect(() => {
        let timeoutId = null;

        const show = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setStatusIndex(0);
                setVisible(true);
            }, 80);
        };

        const hide = () => {
            clearTimeout(timeoutId);
            timeoutId = null;
            setVisible(false);
        };

        const offStart = router.on('start', (event) => {
            if (event.detail?.visit?.showProgress === false) {
                return;
            }
            show();
        });

        const offFinish = router.on('finish', hide);
        const offCancel = router.on('cancel', hide);

        return () => {
            clearTimeout(timeoutId);
            offStart();
            offFinish();
            offCancel();
        };
    }, []);

    useEffect(() => {
        if (!visible) {
            return undefined;
        }

        const intervalId = window.setInterval(() => {
            setStatusIndex((prev) => (prev + 1) % STATUS_LINES.length);
        }, 1400);

        return () => window.clearInterval(intervalId);
    }, [visible]);

    if (!visible) {
        return null;
    }

    const status = STATUS_LINES[statusIndex] || STATUS_LINES[0];

    return (
        <div
            className="nn-page-preloader fixed inset-0 z-[1100] flex flex-col items-center justify-center bg-earth-dusk"
            role="status"
            aria-live="polite"
            aria-label={status}
            aria-busy="true"
        >
            <div
                className="nn-page-preloader__glow pointer-events-none absolute left-1/2 top-[42%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mustard/20 blur-3xl sm:h-80 sm:w-80"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute inset-0 bg-grain opacity-40 mix-blend-overlay"
                aria-hidden="true"
            />

            <div className="nn-page-preloader__stage relative flex flex-col items-center gap-6 px-6">
                <div className="nn-logo-loader relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
                    <span
                        className="nn-logo-loader__orbit pointer-events-none absolute inset-0 rounded-full"
                        aria-hidden="true"
                    />
                    <span
                        className="nn-logo-loader__spin pointer-events-none absolute inset-0"
                        aria-hidden="true"
                    >
                        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mustard shadow-[0_0_12px_rgba(242,184,46,0.85)]" />
                    </span>
                    <div className="relative flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-full bg-earth-dusk ring-1 ring-white/10 sm:h-[5.25rem] sm:w-[5.25rem]">
                        <img
                            src="/images/logo.png"
                            alt=""
                            width={969}
                            height={542}
                            decoding="async"
                            className="nn-logo-loader__mark h-8 w-auto max-w-[4.25rem] object-contain object-center sm:h-9 sm:max-w-[4.75rem]"
                        />
                    </div>
                </div>

                <div className="nn-page-preloader__copy text-center">
                    <p className="font-display text-lg font-semibold tracking-tight text-white sm:text-xl">
                        Nanyuki Now
                    </p>
                    <p
                        key={status}
                        className="nn-page-preloader__status mt-1.5 text-xs font-medium tracking-wide text-white/55 sm:text-sm"
                    >
                        {status}
                        <span
                            className="nn-page-preloader__dots"
                            aria-hidden="true"
                        >
                            …
                        </span>
                    </p>
                </div>
            </div>

            <span className="sr-only">{status}</span>
        </div>
    );
}
