import { useEffect, useMemo, useRef, useState } from 'react';
import GalleryLightbox from './GalleryLightbox';
import DetailSection from './DetailSection';

function formatPrice(price) {
    if (price == null || price === '') return null;
    if (typeof price === 'number') {
        return `KES ${price.toLocaleString('en-KE')}`;
    }
    const raw = String(price).trim();
    if (!raw) return null;
    if (/^(kes|ksh|\$|€|£)/i.test(raw)) return raw;
    if (/^\d/.test(raw)) return `KES ${raw}`;
    return raw;
}

/**
 * Normalize Stay room_types into cards with title, price, and photos.
 * Supports legacy string tags and single `image` fields.
 */
export function normalizeRoomTypes(roomTypes) {
    if (!Array.isArray(roomTypes)) {
        if (typeof roomTypes === 'string' && roomTypes.trim()) {
            return roomTypes
                .split(/[,|]+/)
                .map((part) => part.trim())
                .filter(Boolean)
                .map((title, index) => ({
                    id: `room-${index}`,
                    title,
                    price: null,
                    images: [],
                }));
        }
        return [];
    }

    return roomTypes
        .map((item, index) => {
            if (!item) return null;

            if (typeof item === 'string') {
                const title = item.trim();
                if (!title) return null;
                return {
                    id: `room-${index}`,
                    title,
                    price: null,
                    description: null,
                    images: [],
                };
            }

            const title = String(
                item.title || item.name || item.label || '',
            ).trim();
            const price = formatPrice(
                item.price ?? item.rate ?? item.amount ?? null,
            );
            const description = String(
                item.description || item.note || item.summary || '',
            ).trim();
            const images = Array.isArray(item.images)
                ? item.images.filter((u) => typeof u === 'string' && u.trim())
                : item.image || item.src || item.photo
                  ? [item.image || item.src || item.photo]
                  : [];

            if (!title && !price && !description && !images.length) return null;

            return {
                id: item.id || `room-${index}`,
                title: title || `Room ${index + 1}`,
                price,
                description: description || null,
                images,
            };
        })
        .filter(Boolean);
}

function StripChevron({ direction }) {
    const isLeft = direction === 'left';
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path
                d={
                    isLeft
                        ? 'M14.5 6.5 9 12l5.5 5.5'
                        : 'M9.5 6.5 15 12l-5.5 5.5'
                }
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function RoomTypePanel({ room, onOpenImage, compact = false }) {
    const hasImages = room.images.length > 0;
    const hero = hasImages ? room.images[0] : null;

    return (
        <article
            className={`flex h-full min-w-0 flex-col overflow-hidden border border-olive-900/10 bg-white ${
                compact ? '' : 'max-w-xl'
            }`}
        >
            {hasImages ? (
                <button
                    type="button"
                    onClick={() => onOpenImage(room, 0)}
                    className="group relative block w-full overflow-hidden bg-olive-100 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mustard"
                    aria-label={`View photos of ${room.title}`}
                >
                    <img
                        src={hero}
                        alt={room.title}
                        className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-earth-dusk/50 via-transparent to-transparent" />
                    {room.images.length > 1 ? (
                        <span className="absolute bottom-2.5 right-2.5 inline-flex items-center rounded-[2px] bg-white/95 px-2 py-1 text-[11px] font-bold tabular-nums text-olive-900 shadow-soft">
                            {room.images.length} photos
                        </span>
                    ) : null}
                </button>
            ) : (
                <div className="flex aspect-[4/3] items-end bg-olive-50 px-4 py-4">
                    <p className="text-sm text-olive-500">No photos yet</p>
                </div>
            )}

            <div className="flex flex-1 flex-col gap-2 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 font-display text-lg font-semibold tracking-tight text-earth-dusk">
                        {room.title}
                    </h3>
                    {room.price ? (
                        <p className="shrink-0 pt-0.5 font-display text-sm font-bold tabular-nums tracking-tight text-earth-dusk sm:text-base">
                            {room.price}
                        </p>
                    ) : null}
                </div>
                {room.description ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-olive-700">
                        {room.description}
                    </p>
                ) : null}
            </div>
        </article>
    );
}

export default function RoomTypesGallery({
    roomTypes,
    title = 'Rooms',
}) {
    const rooms = useMemo(
        () => normalizeRoomTypes(roomTypes),
        [roomTypes],
    );
    const [lightbox, setLightbox] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const scrollerRef = useRef(null);
    const multi = rooms.length > 1;

    const slides = useMemo(() => {
        if (!lightbox) return [];
        const room = rooms.find((item) => item.id === lightbox.roomId);
        if (!room?.images?.length) return [];
        return room.images.map((src, index) => ({
            src,
            label:
                room.images.length > 1
                    ? `${room.title} · ${index + 1}`
                    : room.title,
            alt: room.title,
        }));
    }, [lightbox, rooms]);

    const updateScrollHints = () => {
        const el = scrollerRef.current;
        if (!el) return;

        const max = el.scrollWidth - el.clientWidth;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(max > 4 && el.scrollLeft < max - 4);

        const first = el.querySelector('[data-room-panel]');
        if (!first) return;
        const step = first.getBoundingClientRect().width + 12;
        if (step <= 0) return;
        const next = Math.round(el.scrollLeft / step);
        setActiveIndex(
            Math.min(Math.max(next, 0), Math.max(rooms.length - 1, 0)),
        );
    };

    useEffect(() => {
        if (!multi) return undefined;
        const el = scrollerRef.current;
        if (!el) return undefined;

        updateScrollHints();
        el.addEventListener('scroll', updateScrollHints, { passive: true });
        const observer =
            typeof ResizeObserver !== 'undefined'
                ? new ResizeObserver(updateScrollHints)
                : null;
        observer?.observe(el);

        return () => {
            el.removeEventListener('scroll', updateScrollHints);
            observer?.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [multi, rooms.length]);

    if (!rooms.length) return null;

    const openImage = (room, imageIndex = 0) => {
        if (!room.images.length) return;
        setLightbox({ roomId: room.id, index: imageIndex });
    };

    const scrollBy = (direction) => {
        const el = scrollerRef.current;
        if (!el) return;
        const first = el.querySelector('[data-room-panel]');
        const step = first
            ? first.getBoundingClientRect().width + 12
            : Math.min(320, el.clientWidth * 0.85);
        el.scrollBy({
            left: direction * step,
            behavior: 'smooth',
        });
    };

    return (
        <>
            <DetailSection id="rooms" title={title}>
                <p className="mb-4 max-w-prose text-sm leading-relaxed text-olive-600 sm:mb-5">
                    {multi
                        ? 'Swipe to compare room types. Tap a photo for a closer look.'
                        : 'Tap a photo for a closer look.'}
                </p>

                {multi ? (
                    <div className="relative">
                        <ul
                            ref={scrollerRef}
                            className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                            style={{ WebkitOverflowScrolling: 'touch' }}
                        >
                            {rooms.map((room) => (
                                <li
                                    key={room.id}
                                    data-room-panel
                                    className="w-[min(85%,22rem)] shrink-0 snap-start sm:w-[min(48%,24rem)] lg:w-[min(40%,26rem)]"
                                >
                                    <RoomTypePanel
                                        room={room}
                                        onOpenImage={openImage}
                                        compact
                                    />
                                </li>
                            ))}
                        </ul>

                        <div className="mt-3 flex items-center justify-between gap-3">
                            <p className="text-sm font-medium tabular-nums text-olive-600">
                                {activeIndex + 1} / {rooms.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={!canScrollLeft}
                                    aria-label="Previous room type"
                                    onClick={() => scrollBy(-1)}
                                    className="inline-flex h-10 w-10 items-center justify-center border border-olive-900/10 bg-white text-olive-800 transition hover:border-olive-900/25 hover:text-earth-dusk disabled:pointer-events-none disabled:opacity-35"
                                >
                                    <StripChevron direction="left" />
                                </button>
                                <button
                                    type="button"
                                    disabled={!canScrollRight}
                                    aria-label="Next room type"
                                    onClick={() => scrollBy(1)}
                                    className="inline-flex h-10 w-10 items-center justify-center border border-olive-900/10 bg-white text-olive-800 transition hover:border-olive-900/25 hover:text-earth-dusk disabled:pointer-events-none disabled:opacity-35"
                                >
                                    <StripChevron direction="right" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <RoomTypePanel
                        room={rooms[0]}
                        onOpenImage={openImage}
                    />
                )}
            </DetailSection>

            {lightbox != null && slides.length ? (
                <GalleryLightbox
                    items={slides}
                    index={Math.min(lightbox.index, slides.length - 1)}
                    onClose={() => setLightbox(null)}
                    onIndexChange={(next) =>
                        setLightbox((current) =>
                            current
                                ? { ...current, index: next }
                                : current,
                        )
                    }
                    padBlur
                />
            ) : null}
        </>
    );
}
