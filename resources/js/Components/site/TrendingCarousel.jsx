import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ListingCard from '@/Components/site/ListingCard';

const DRAG_THRESHOLD = 8;

export default function TrendingCarousel({ items = [] }) {
    const trackRef = useRef(null);
    const pauseUntilRef = useRef(0);
    const wrappingRef = useRef(false);
    const dragRef = useRef({
        active: false,
        moved: false,
        suppressClick: false,
        startX: 0,
        startScroll: 0,
        pointerId: null,
    });
    const [paused, setPaused] = useState(false);
    const [allowClick, setAllowClick] = useState(true);
    const loop = [...items, ...items];

    const wrapScroll = (track, drag = null) => {
        if (wrappingRef.current) return;
        const half = track.scrollWidth / 2;
        if (half <= 0) return;

        if (track.scrollLeft >= half) {
            wrappingRef.current = true;
            track.scrollLeft -= half;
            if (drag) {
                drag.startScroll -= half;
            }
            wrappingRef.current = false;
        } else if (track.scrollLeft <= 0) {
            wrappingRef.current = true;
            track.scrollLeft += half;
            if (drag) {
                drag.startScroll += half;
            }
            wrappingRef.current = false;
        }
    };

    useEffect(() => {
        const track = trackRef.current;
        if (!track || items.length === 0) return undefined;

        // Start away from the wrap edges so the loop never oscillates at 0/half.
        const half = track.scrollWidth / 2;
        if (half > 0) {
            wrappingRef.current = true;
            track.scrollLeft = half * 0.25;
            wrappingRef.current = false;
        }

        let rafId = 0;

        const tick = () => {
            const hold =
                paused ||
                dragRef.current.active ||
                Date.now() < pauseUntilRef.current;
            if (!hold && track) {
                track.scrollLeft += 0.6;
                wrapScroll(track);
            }
            rafId = window.requestAnimationFrame(tick);
        };

        rafId = window.requestAnimationFrame(tick);
        return () => window.cancelAnimationFrame(rafId);
    }, [paused, items.length]);

    const scrollByCard = (direction) => {
        const track = trackRef.current;
        if (!track) return;
        const card = track.querySelector('[data-trending-card]');
        const amount = card
            ? card.getBoundingClientRect().width + 20
            : 320;
        pauseUntilRef.current = Date.now() + 900;
        track.scrollBy({ left: direction * amount, behavior: 'smooth' });
    };

    const onPointerDown = (e) => {
        const track = trackRef.current;
        if (!track || e.button === 2) return;
        if (e.target.closest('button')) return;

        dragRef.current = {
            active: true,
            moved: false,
            suppressClick: false,
            startX: e.clientX,
            startScroll: track.scrollLeft,
            pointerId: e.pointerId,
        };
        setAllowClick(true);
    };

    const onPointerMove = (e) => {
        const track = trackRef.current;
        const drag = dragRef.current;
        if (!track || !drag.active) return;

        const dx = e.clientX - drag.startX;
        if (Math.abs(dx) <= DRAG_THRESHOLD) return;

        if (!drag.moved) {
            drag.moved = true;
            drag.suppressClick = true;
            setAllowClick(false);
            track.setPointerCapture?.(e.pointerId);
        }

        track.scrollLeft = drag.startScroll - dx;
        wrapScroll(track, drag);
    };

    const endDrag = () => {
        const drag = dragRef.current;
        if (!drag.active) return;
        const track = trackRef.current;

        if (track && drag.moved && drag.pointerId != null) {
            try {
                track.releasePointerCapture?.(drag.pointerId);
            } catch {
                // already released
            }
            pauseUntilRef.current = Date.now() + 1200;
        }

        const didDrag = drag.moved;
        drag.active = false;
        drag.pointerId = null;
        drag.moved = false;

        if (didDrag) {
            window.setTimeout(() => {
                drag.suppressClick = false;
                setAllowClick(true);
            }, 80);
        } else {
            drag.suppressClick = false;
            setAllowClick(true);
        }
    };

    if (items.length === 0) return null;

    return (
        <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => {
                setPaused(false);
                endDrag();
            }}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    setPaused(false);
                }
            }}
        >
            <div
                ref={trackRef}
                className="flex cursor-grab gap-5 overflow-x-auto pb-2 select-none active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
            >
                {loop.map((listing, i) => (
                    <div
                        key={`${listing.id}-${i}`}
                        data-trending-card
                        className="w-[min(85vw,22rem)] shrink-0 sm:w-[24rem]"
                        aria-hidden={i >= items.length ? true : undefined}
                    >
                        <ListingCard
                            listing={listing}
                            featured
                            allowClick={allowClick}
                            inert={i >= items.length}
                        />
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={() => scrollByCard(-1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:border-mustard hover:bg-mustard hover:text-olive-950"
                    aria-label="Scroll trending left"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => scrollByCard(1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:border-mustard hover:bg-mustard hover:text-olive-950"
                    aria-label="Scroll trending right"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
