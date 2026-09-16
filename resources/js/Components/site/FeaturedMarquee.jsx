import { Link, router } from '@inertiajs/react';
import { Heart, MapPin, Star } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { listingHref } from '@/data/listings';

const DRAG_THRESHOLD = 8;

function MarqueeCard({ item, inert = false, shouldSuppressClick }) {
    const [saved, setSaved] = useState(false);
    const href = item.href || listingHref(item);

    return (
        <Link
            href={href}
            onClick={(e) => {
                if (shouldSuppressClick?.()) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                // Ensure navigation even when drag handlers interfere with the link.
                e.preventDefault();
                router.visit(href);
            }}
            className="group w-[min(82vw,22rem)] shrink-0 overflow-hidden rounded-2xl bg-olive-600 shadow-soft sm:w-[24rem]"
            tabIndex={inert ? -1 : undefined}
            aria-hidden={inert ? true : undefined}
            draggable={false}
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={item.image}
                    alt={inert ? '' : item.title}
                    className="pointer-events-none h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                    draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-earth-dusk/35 via-transparent to-transparent" />
                {item.logo ? (
                    <img
                        src={item.logo}
                        alt=""
                        className="pointer-events-none absolute bottom-3 left-3 h-11 w-11 rounded-full border-2 border-white object-cover shadow-md"
                        loading="lazy"
                        draggable={false}
                    />
                ) : null}
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSaved((v) => !v);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-olive-800 shadow-sm backdrop-blur transition hover:bg-white"
                    aria-label={saved ? 'Remove from saved' : 'Save listing'}
                    tabIndex={inert ? -1 : undefined}
                >
                    <Heart
                        className={`h-4 w-4 ${saved ? 'fill-mustard text-mustard' : ''}`}
                    />
                </button>
            </div>
            <div className="space-y-2 bg-olive-600 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-base font-semibold text-white sm:text-lg">
                        {item.title}
                    </h3>
                    {item.rating ? (
                        <span className="inline-flex shrink-0 items-center gap-1 text-sm text-white/90">
                            <Star className="h-3.5 w-3.5 fill-mustard text-mustard" />
                            {item.rating}
                        </span>
                    ) : null}
                </div>
                <p className="flex items-center gap-1.5 text-sm text-white/75">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {item.location}
                    {item.subcategory || item.category ? (
                        <span className="text-white/55">
                            · {item.subcategory || item.category}
                        </span>
                    ) : null}
                </p>
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
        suppressClick: false,
        startX: 0,
        startScroll: 0,
        pointerId: null,
    });
    const [setsPerSegment, setSetsPerSegment] = useState(2);
    const [paused, setPaused] = useState(false);

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
            }, 80);
        } else {
            drag.suppressClick = false;
        }
    };

    const shouldSuppressClick = () => dragRef.current.suppressClick;

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
                        shouldSuppressClick={shouldSuppressClick}
                    />
                ))}
            </div>
        </section>
    );
}
