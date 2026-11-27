import { useEffect, useId, useRef, useState } from 'react';
import { useDetailSectionTone } from './DetailSection';

/**
 * Clamp tall content with bottom fade + View more / View less.
 * By default mobile-only (desktop shows full). Pass mobileOnly={false}
 * to clamp on every breakpoint when content overflows.
 */
export default function MobileFadeExpand({
    children,
    maxHeight = 480,
    moreLabel = 'View more',
    lessLabel = 'View less',
    className = '',
    mobileOnly = true,
}) {
    const tone = useDetailSectionTone();
    const contentId = useId();
    const contentRef = useRef(null);
    const [expanded, setExpanded] = useState(false);
    const [needsClamp, setNeedsClamp] = useState(false);

    useEffect(() => {
        const el = contentRef.current;
        if (!el || typeof window === 'undefined') return undefined;

        const measure = () => {
            if (mobileOnly) {
                const isMobile = window.matchMedia('(max-width: 639px)').matches;
                if (!isMobile) {
                    setNeedsClamp(false);
                    return;
                }
            }
            // Temporarily clear clamp to measure natural height.
            const prevMax = el.style.maxHeight;
            const prevOverflow = el.style.overflow;
            el.style.maxHeight = 'none';
            el.style.overflow = 'visible';
            // Only clamp when content is clearly overflowing the limit.
            const tall = el.scrollHeight > maxHeight + 48;
            el.style.maxHeight = prevMax;
            el.style.overflow = prevOverflow;
            setNeedsClamp(tall);
            if (!tall) {
                setExpanded(false);
            }
        };

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        window.addEventListener('resize', measure);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [children, maxHeight, mobileOnly]);

    const clamped = needsClamp && !expanded;
    const fadeFrom =
        tone === 'open' || tone === 'rail'
            ? 'from-white'
            : 'from-earth-sand';

    return (
        <div className={className}>
            <div className="relative">
                <div
                    id={contentId}
                    ref={contentRef}
                    className={clamped ? 'overflow-hidden' : undefined}
                    style={clamped ? { maxHeight } : undefined}
                >
                    {children}
                </div>
                {clamped ? (
                    <div
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t ${fadeFrom} to-transparent${
                            mobileOnly ? ' sm:hidden' : ''
                        }`}
                    />
                ) : null}
            </div>
            {needsClamp ? (
                <button
                    type="button"
                    className={`relative z-[1] mt-3 inline-flex min-h-11 items-center justify-center rounded-sm border border-olive-900/20 bg-white px-3.5 py-2 text-sm font-semibold text-olive-900 transition hover:border-olive-900/40 hover:bg-olive-50 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-100 dark:hover:bg-olive-900${
                        mobileOnly ? ' sm:hidden' : ''
                    }`}
                    aria-expanded={expanded}
                    aria-controls={contentId}
                    onClick={() => setExpanded((value) => !value)}
                >
                    {expanded ? lessLabel : moreLabel}
                </button>
            ) : null}
        </div>
    );
}
