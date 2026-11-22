import { useEffect, useId, useRef, useState } from 'react';
import { useDetailSectionTone } from './DetailSection';

/**
 * Mobile-only clamp with bottom fade + View more / View less.
 * Desktop (sm+) always shows full content. Measures overflow so short
 * blocks never show a useless control.
 */
export default function MobileFadeExpand({
    children,
    maxHeight = 168,
    moreLabel = 'View more',
    lessLabel = 'View less',
    className = '',
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
            const isMobile = window.matchMedia('(max-width: 639px)').matches;
            if (!isMobile) {
                setNeedsClamp(false);
                return;
            }
            // Temporarily clear clamp to measure natural height.
            const prevMax = el.style.maxHeight;
            const prevOverflow = el.style.overflow;
            el.style.maxHeight = 'none';
            el.style.overflow = 'visible';
            const tall = el.scrollHeight > maxHeight + 12;
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
    }, [children, maxHeight]);

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
                        className={`pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t ${fadeFrom} to-transparent sm:hidden`}
                    />
                ) : null}
            </div>
            {needsClamp ? (
                <button
                    type="button"
                    className="relative z-[1] mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-olive-900 underline decoration-olive-300 underline-offset-4 transition hover:decoration-mustard sm:hidden"
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
