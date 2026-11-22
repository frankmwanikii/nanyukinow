import { createPortal } from 'react-dom';
import { useEffect, useId } from 'react';
import CloseButton from '@/Components/site/CloseButton';

function Chevron({ direction }) {
    const isPrev = direction === 'prev';
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {isPrev ? (
                <path d="M15 5 8 12l7 7" />
            ) : (
                <path d="m9 5 7 7-7 7" />
            )}
        </svg>
    );
}

/**
 * Full-viewport photo viewer. Image fills the screen; chrome sits as overlays.
 *
 * items: [{ src, label?, alt? }]
 */
export default function GalleryLightbox({
    items = [],
    index = 0,
    onClose,
    onIndexChange,
    title,
    meta,
    footer = null,
    /** Desktop only: blurred cover of the current image behind portrait frames. */
    padBlur = false,
}) {
    const titleId = useId();
    const safeIndex =
        items.length > 0
            ? Math.min(Math.max(index, 0), items.length - 1)
            : 0;
    const item = items[safeIndex] || null;
    const hasNav = items.length > 1;

    useEffect(() => {
        if (!item) return undefined;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKey = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose?.();
            } else if (e.key === 'ArrowLeft' && hasNav) {
                e.preventDefault();
                onIndexChange?.(
                    (safeIndex - 1 + items.length) % items.length,
                );
            } else if (e.key === 'ArrowRight' && hasNav) {
                e.preventDefault();
                onIndexChange?.((safeIndex + 1) % items.length);
            }
        };

        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [item, hasNav, items.length, onClose, onIndexChange, safeIndex]);

    if (!item || typeof document === 'undefined') return null;

    const heading = title || item.label || 'Photo';
    const subtitle =
        meta ||
        (items.length > 1 ? `${safeIndex + 1} / ${items.length}` : null);

    return createPortal(
        <div
            className="fixed inset-0 z-[1200] bg-black"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={onClose}
        >
            {padBlur ? (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                    <img
                        key={`blur-${item.src}`}
                        src={item.src}
                        alt=""
                        className="h-full w-full scale-125 object-cover blur-3xl brightness-75 saturate-125"
                        draggable={false}
                    />
                    <div className="absolute inset-0 bg-black/35" />
                </div>
            ) : null}

            <div
                className="absolute inset-0 flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    key={item.src}
                    src={item.src}
                    alt={item.alt || item.label || heading}
                    className="relative z-10 max-h-[100dvh] max-w-[100vw] object-contain"
                    draggable={false}
                />
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/75 via-black/35 to-transparent pb-16 pt-[max(0.75rem,env(safe-area-inset-top))]">
                <div
                    className="pointer-events-auto flex items-start justify-between gap-3 px-4 sm:px-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="min-w-0 pt-0.5">
                        <p
                            id={titleId}
                            className="truncate font-sans text-sm font-semibold text-white sm:text-base"
                        >
                            {heading}
                        </p>
                        {subtitle ? (
                            <p className="mt-0.5 text-xs font-medium text-white/60">
                                {subtitle}
                            </p>
                        ) : null}
                    </div>
                    <CloseButton
                        onClick={onClose}
                        size="md"
                        tone="onDark"
                        label="Close gallery"
                        className="rounded-[2px] bg-white/10 ring-1 ring-white/20 hover:bg-white/20"
                    />
                </div>
            </div>

            {hasNav ? (
                <>
                    <button
                        type="button"
                        aria-label="Previous photo"
                        onClick={(e) => {
                            e.stopPropagation();
                            onIndexChange?.(
                                (safeIndex - 1 + items.length) % items.length,
                            );
                        }}
                        className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[2px] bg-black/55 text-white ring-1 ring-white/25 transition hover:bg-black/75 sm:left-5 sm:h-11 sm:w-11"
                    >
                        <Chevron direction="prev" />
                    </button>
                    <button
                        type="button"
                        aria-label="Next photo"
                        onClick={(e) => {
                            e.stopPropagation();
                            onIndexChange?.(
                                (safeIndex + 1) % items.length,
                            );
                        }}
                        className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[2px] bg-black/55 text-white ring-1 ring-white/25 transition hover:bg-black/75 sm:right-5 sm:h-11 sm:w-11"
                    >
                        <Chevron direction="next" />
                    </button>
                </>
            ) : null}

            {footer ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                    <div
                        className="pointer-events-auto px-4 sm:px-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {footer}
                    </div>
                </div>
            ) : null}
        </div>,
        document.body,
    );
}
