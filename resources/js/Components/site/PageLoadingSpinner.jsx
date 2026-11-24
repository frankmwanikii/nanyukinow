import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

/**
 * Full-page Inertia visit overlay (soft scrim + branded logo pulse).
 * Card placeholders keep their shimmer for deferred / partial loads.
 */
export default function PageLoadingSpinner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let timeoutId = null;

        const show = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => setVisible(true), 120);
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

    if (!visible) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-olive-950/45 backdrop-blur-[2px] dark:bg-black/55"
            role="status"
            aria-live="polite"
            aria-label="Loading page"
            aria-busy="true"
        >
            <div className="nn-logo-loader relative">
                <span className="nn-logo-loader__ring pointer-events-none absolute -inset-2 rounded-2xl border-2 border-mustard" aria-hidden />
                <div className="relative flex items-center justify-center rounded-2xl bg-olive-950/95 px-5 py-3.5 shadow-soft ring-1 ring-white/15 dark:bg-olive-900/95">
                    <img
                        src="/images/logo.png"
                        alt=""
                        width={969}
                        height={542}
                        decoding="async"
                        className="nn-logo-loader__mark h-8 w-auto max-w-[9.5rem] object-contain object-center sm:h-9 sm:max-w-[11rem]"
                    />
                </div>
            </div>
            <span className="sr-only">Loading</span>
        </div>
    );
}
