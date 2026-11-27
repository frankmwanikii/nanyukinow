import MediaNavButton from '@/Components/site/MediaNavButton';
import { useEffect, useRef, useState } from 'react';

/**
 * Snap-swipe image rail with small hide/show MediaNavButtons.
 * Click/tap a slide opens at that index; drag/swipe does not.
 */
export default function SwipeImageRail({
    images = [],
    alt = '',
    onOpen,
    className = '',
    aspectClass = 'aspect-[4/5]',
    objectClass = 'object-cover object-bottom',
    contain = false,
}) {
    const scrollerRef = useRef(null);
    const hideTimerRef = useRef(null);
    const dragRef = useRef({ moved: false, startX: 0, startY: 0 });
    const [index, setIndex] = useState(0);
    const [controlsVisible, setControlsVisible] = useState(false);

    const count = images.length;
    const hasNav = count > 1;
    const safeIndex = Math.min(index, Math.max(count - 1, 0));

    useEffect(() => {
        setIndex(0);
        const el = scrollerRef.current;
        if (el) {
            el.scrollLeft = 0;
        }
    }, [images]);

    useEffect(() => {
        return () => {
            if (hideTimerRef.current) {
                window.clearTimeout(hideTimerRef.current);
            }
        };
    }, []);

    const revealControls = () => {
        if (!hasNav) return;
        setControlsVisible(true);
        if (hideTimerRef.current) {
            window.clearTimeout(hideTimerRef.current);
        }
        hideTimerRef.current = window.setTimeout(() => {
            setControlsVisible(false);
        }, 2200);
    };

    const onScroll = () => {
        const el = scrollerRef.current;
        if (!el) return;
        const width = el.clientWidth;
        if (!width) return;
        const next = Math.round(el.scrollLeft / width);
        setIndex(Math.min(Math.max(next, 0), Math.max(count - 1, 0)));
        revealControls();
    };

    const goTo = (nextIndex) => {
        const el = scrollerRef.current;
        if (!el) return;
        const clamped = Math.min(Math.max(nextIndex, 0), count - 1);
        el.scrollTo({
            left: clamped * el.clientWidth,
            behavior: 'smooth',
        });
        setIndex(clamped);
        revealControls();
    };

    if (!count) return null;

    const showArrows = hasNav && controlsVisible;

    return (
        <div
            className={`group/rail relative overflow-hidden bg-olive-100 ${className}`}
            onMouseEnter={() => {
                if (hasNav) setControlsVisible(true);
            }}
            onMouseLeave={() => setControlsVisible(false)}
            onPointerDown={revealControls}
            onFocusCapture={revealControls}
        >
            <div
                ref={scrollerRef}
                onScroll={onScroll}
                className={`flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
                    contain ? 'bg-olive-950' : ''
                }`}
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {images.map((src, imageIndex) => (
                    <button
                        key={`${src}-${imageIndex}`}
                        type="button"
                        className={`relative ${aspectClass} w-full min-w-full shrink-0 snap-center snap-always overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mustard`}
                        aria-label={
                            hasNav
                                ? `View photo ${imageIndex + 1} of ${count}`
                                : `View ${alt || 'photo'}`
                        }
                        onPointerDown={(e) => {
                            dragRef.current = {
                                moved: false,
                                startX: e.clientX,
                                startY: e.clientY,
                            };
                        }}
                        onPointerMove={(e) => {
                            const drag = dragRef.current;
                            if (
                                Math.abs(e.clientX - drag.startX) > 8 ||
                                Math.abs(e.clientY - drag.startY) > 8
                            ) {
                                drag.moved = true;
                            }
                        }}
                        onClick={() => {
                            if (dragRef.current.moved) return;
                            onOpen?.(imageIndex);
                        }}
                    >
                        {contain ? (
                            <>
                                <img
                                    src={src}
                                    alt=""
                                    aria-hidden="true"
                                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
                                    loading={imageIndex === 0 ? 'eager' : 'lazy'}
                                    draggable={false}
                                />
                                <img
                                    src={src}
                                    alt=""
                                    className="relative z-[1] h-full w-full object-contain"
                                    loading={imageIndex === 0 ? 'eager' : 'lazy'}
                                    draggable={false}
                                />
                            </>
                        ) : (
                            <img
                                src={src}
                                alt=""
                                className={`h-full w-full transition duration-500 group-hover/rail:scale-[1.03] ${objectClass}`}
                                loading={imageIndex === 0 ? 'eager' : 'lazy'}
                                draggable={false}
                            />
                        )}
                    </button>
                ))}
            </div>

            {hasNav ? (
                <>
                    <div
                        className={`pointer-events-none absolute inset-y-0 left-0 z-[2] flex items-center pl-2 transition duration-200 ${
                            showArrows
                                ? 'opacity-100'
                                : 'opacity-0 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100'
                        }`}
                    >
                        <MediaNavButton
                            direction="prev"
                            label="Previous photo"
                            disabled={safeIndex <= 0}
                            className="pointer-events-auto"
                            onClick={(e) => {
                                e.stopPropagation();
                                goTo(safeIndex - 1);
                            }}
                        />
                    </div>
                    <div
                        className={`pointer-events-none absolute inset-y-0 right-0 z-[2] flex items-center pr-2 transition duration-200 ${
                            showArrows
                                ? 'opacity-100'
                                : 'opacity-0 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100'
                        }`}
                    >
                        <MediaNavButton
                            direction="next"
                            label="Next photo"
                            disabled={safeIndex >= count - 1}
                            className="pointer-events-auto"
                            onClick={(e) => {
                                e.stopPropagation();
                                goTo(safeIndex + 1);
                            }}
                        />
                    </div>
                    <span className="pointer-events-none absolute bottom-3 left-3 z-[2] rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-olive-800 shadow-soft">
                        {safeIndex + 1} / {count}
                    </span>
                </>
            ) : null}
        </div>
    );
}
