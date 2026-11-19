import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { UNICONS } from '@/Components/site/uniconsPaths';

/**
 * Full-page Inertia visit overlay (soft scrim + Unicons spinner-alt).
 * Card placeholders keep their shimmer.
 */
function SpinnerAlt({ className = 'h-5 w-5' }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={className}
            aria-hidden="true"
            fill="currentColor"
            dangerouslySetInnerHTML={{ __html: UNICONS['spinner-alt'] }}
        />
    );
}

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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-olive-950/90 text-mustard shadow-soft ring-1 ring-white/20 dark:bg-olive-900/95">
                <SpinnerAlt className="h-5 w-5 animate-spin" />
            </div>
            <span className="sr-only">Loading</span>
        </div>
    );
}
