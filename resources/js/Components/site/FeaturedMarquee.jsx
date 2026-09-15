import { Link } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

function MarqueeCard({ item, inert = false, allowClick = true }) {
    return (
        <Link
            href={item.href}
            onClick={(e) => {
                if (!allowClick) e.preventDefault();
            }}
            className="group w-[min(82vw,22rem)] shrink-0 overflow-hidden rounded-2xl shadow-lift sm:w-[24rem]"
            tabIndex={inert ? -1 : undefined}
            aria-hidden={inert ? true : undefined}
            draggable={false}
        >
            <div className="relative aspect-[16/10] overflow-hidden">
                <img
                    src={item.image}
                    alt={inert ? '' : item.title}
                    className="pointer-events-none h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    loading="lazy"
                    draggable={false}
                />
            </div>
            <div className="flex items-center justify-between gap-3 bg-olive-600 px-4 py-4 text-white">
                <h3 className="font-display text-sm font-semibold sm:text-base">
                    {item.title}
                </h3>
                <span className="shrink-0 rounded-full bg-mustard px-3 py-1 text-xs font-bold text-olive-950">
                    View
                </span>
            </div>
        </Link>
    );
}

export default function FeaturedMarquee({ items = [] }) {
    const viewportRef = useRef(null);
    const measureRef = useRef(null);
    const dragRef = useRef({
        active: false,
        moved: false,
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

    // Keep scroll inside the seamless half-loop
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

        // Start mid-segment so left drag has room
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
        dragRef.current = {
            active: true,
            moved: false,
            startX: e.clientX,
            startScroll: track.scrollLeft,
            pointerId: e.pointerId,
        };
        setAllowClick(true);
        track.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
        const track = viewportRef.current;
        const drag = dragRef.current;
        if (!track || !drag.active) return;
        const dx = e.clientX - drag.startX;
        if (Math.abs(dx) > 6) {
            drag.moved = true;
            setAllowClick(false);
        }
        track.scrollLeft = drag.startScroll - dx;
        wrapScroll(track);
    };

    const endDrag = (e) => {
        const drag = dragRef.current;
        if (!drag.active) return;
        const track = viewportRef.current;
        if (track && drag.pointerId != null) {
            try {
                track.releasePointerCapture?.(drag.pointerId);
            } catch {
                // already released
            }
        }
        drag.active = false;
        drag.pointerId = null;
        if (drag.moved) {
            // Re-enable clicks after the click event from this gesture
            window.setTimeout(() => setAllowClick(true), 0);
        }
    };

    if (items.length === 0) return null;

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
                    <MarqueeCard key={`m-${item.id}`} item={item} inert />
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
                    <MarqueeCard
                        key={`${item.id}-${i}`}
                        item={item}
                        inert={i >= segment.length}
                        allowClick={allowClick}
                    />
                ))}
            </div>
        </section>
    );
}
