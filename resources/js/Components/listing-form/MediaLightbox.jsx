import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useId } from 'react';

/**
 * Full-screen image lightbox with keyboard + optional prev/next.
 */
export default function MediaLightbox({
    items = [],
    index = 0,
    onClose,
    onIndexChange,
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

    return createPortal(
        <div
            className="fixed inset-0 z-[1200] flex flex-col bg-[#0c0a08]/92 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={onClose}
        >
            <div
                className="relative z-20 flex items-center justify-between gap-3 px-4 py-4 sm:px-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="min-w-0">
                    <p
                        id={titleId}
                        className="truncate text-sm font-semibold text-white sm:text-base"
                    >
                        {item.label || 'Photo'}
                    </p>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-white/55">
                        {safeIndex + 1} of {items.length}
                        {item.hint ? ` · ${item.hint}` : ''}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mustard text-olive-950 shadow-lift ring-2 ring-white/90 transition hover:scale-105 hover:bg-white"
                    aria-label="Close lightbox"
                >
                    <X className="h-5 w-5" strokeWidth={2.75} />
                </button>
            </div>

            <div
                className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-2 sm:px-20"
                onClick={(e) => e.stopPropagation()}
            >
                {hasNav ? (
                    <>
                        <button
                            type="button"
                            onClick={() =>
                                onIndexChange?.(
                                    (safeIndex - 1 + items.length) %
                                        items.length,
                                )
                            }
                            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/20 sm:left-6"
                            aria-label="Previous photo"
                        >
                            <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                onIndexChange?.(
                                    (safeIndex + 1) % items.length,
                                )
                            }
                            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/20 sm:right-6"
                            aria-label="Next photo"
                        >
                            <ChevronRight
                                className="h-6 w-6"
                                strokeWidth={2.25}
                            />
                        </button>
                    </>
                ) : null}

                <img
                    key={item.src}
                    src={item.src}
                    alt={item.label || 'Photo'}
                    className="max-h-[min(72vh,820px)] w-auto max-w-full rounded-2xl object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,0.65)] ring-1 ring-white/10"
                />
            </div>

            {hasNav ? (
                <div
                    className="relative z-20 border-t border-white/10 bg-black/25 px-4 py-4 backdrop-blur-md sm:px-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="mx-auto flex max-w-5xl items-center gap-2.5 overflow-x-auto pb-1">
                        {items.map((thumb, i) => {
                            const active = i === safeIndex;
                            return (
                                <button
                                    key={`${thumb.src}-${i}`}
                                    type="button"
                                    onClick={() => onIndexChange?.(i)}
                                    aria-label={`View ${thumb.label || `photo ${i + 1}`}`}
                                    aria-current={active ? 'true' : undefined}
                                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl transition ${
                                        active
                                            ? 'ring-2 ring-mustard ring-offset-2 ring-offset-[#0c0a08]'
                                            : 'opacity-60 ring-1 ring-white/15 hover:opacity-100'
                                    }`}
                                >
                                    <img
                                        src={thumb.src}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </div>,
        document.body,
    );
}
