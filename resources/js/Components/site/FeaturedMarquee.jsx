import { useEffect, useMemo, useRef, useState } from 'react';
import ListingCard from '@/Components/site/ListingCard';

const DRAG_THRESHOLD = 8;

export default function FeaturedMarquee({ items = [] }) {
    const viewportRef = useRef(null);
    const measureRef = useRef(null);
    const dragRef = useRef({
        active: false,
        moved: false,
        suppressClick: false,
        startX: 0,
        startScroll: 0,
        pointerId: null,
    });
    const [setsPerSegment, setSetsPerSegment] = useState(2);
    const [paused, setPaused] = useState(false);
    const [allowClick, setAllowClick] = useState(true);

    useEffect(() => {
        if (items.length === 0) return undefined;

        const update = () => {
            const setWidth = measureRef.current?.scrollWidth ?? 0;
            const viewWidth =
                viewportRef.current?.clientWidth ?? window.innerWidth;
            if (setWidth <= 0) return;
            const needed = Math.max(2, Math.ceil(viewWidth / setWidth) + 1);
            setSetsPerSegment(needed);
        };

        update();
        const ro = new ResizeObserver(update);
        if (viewportRef.current) ro.observe(viewportRef.current);
        if (measureRef.current) ro.observe(measureRef.current);
        window.addEventListener('resize', update);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', update);
        };
    }, [items.length]);

    const segment = useMemo(() => {
        const out = [];
        for (let s = 0; s < setsPerSegment; s += 1) {
            items.forEach((item) => out.push(item));
        }
        return out;
    }, [items, setsPerSegment]);

    const loop = useMemo(() => [...segment, ...segment], [segment]);

    const wrapScroll = (track) => {
        const half = track.scrollWidth / 2;
        if (half <= 0) return;
        if (track.scrollLeft >= half) {
            track.scrollLeft -= half;
        } else if (track.scrollLeft <= 0) {
            track.scrollLeft += half;
        }
    };

    useEffect(() => {
        const track = viewportRef.current;
        if (!track || items.length === 0) return undefined;

        const half = track.scrollWidth / 2;
        if (half > 0) track.scrollLeft = half * 0.25;

        let rafId = 0;
        const tick = () => {
            if (!paused && !dragRef.current.active && track) {
                track.scrollLeft += 0.55;
                wrapScroll(track);
            }
            rafId = window.requestAnimationFrame(tick);
        };
        rafId = window.requestAnimationFrame(tick);
        return () => window.cancelAnimationFrame(rafId);
    }, [paused, items.length, setsPerSegment]);

    const onPointerDown = (e) => {
        const track = viewportRef.current;
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
        const track = viewportRef.current;
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
        wrapScroll(track);
    };

    const endDrag = () => {
        const drag = dragRef.current;
        if (!drag.active) return;
        const track = viewportRef.current;

        if (track && drag.moved && drag.pointerId != null) {
            try {
                track.releasePointerCapture?.(drag.pointerId);
            } catch {
                // already released
            }
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

    const cardClass =
        'w-[min(78vw,20rem)] shrink-0 sm:w-[22rem] lg:w-[24rem]';

    return (
        <section
            className="relative z-10 -mt-8 bg-transparent pb-4 sm:-mt-12"
            aria-label="Featured highlights"
        >
            <div
                ref={measureRef}
                className="pointer-events-none absolute -left-[9999px] top-0 flex w-max gap-4 opacity-0"
                aria-hidden
            >
                {items.map((item) => (
                    <ListingCard
                        key={`m-${item.id}`}
                        listing={item}
                        className={cardClass}
                        footerTone="olive"
                        inert
                    />
                ))}
            </div>

            <div
                ref={viewportRef}
                className="flex cursor-grab gap-4 overflow-x-auto active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => {
                    setPaused(false);
                    endDrag();
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onScroll={(e) => wrapScroll(e.currentTarget)}
            >
                {loop.map((item, i) => (
                    <ListingCard
                        key={`${item.id}-${i}`}
                        listing={item}
                        className={cardClass}
                        footerTone="olive"
                        allowClick={allowClick}
                        inert={i >= segment.length}
                    />
                ))}
            </div>
        </section>
    );
}
