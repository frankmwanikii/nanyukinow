import { useEffect, useMemo, useRef, useState } from 'react';
import { resolveAmenityItem } from '@/utils/amenityIcons';
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
            const amenities = Array.isArray(item.amenities)
                ? item.amenities
                      .map((entry) => resolveAmenityItem(entry))
                      .filter(Boolean)
                : [];

            if (
                !title &&
                !price &&
                !description &&
                !images.length &&
                !amenities.length
            ) {
                return null;
            }

            return {
                id: item.id || `room-${index}`,
                title: title || `Room ${index + 1}`,
                price,
                description: description || null,
                images,
                amenities,
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
    const amenities = room.amenities || [];
    const description = (room.description || '').trim();
    const aboutPreview = description.replace(/\s+/g, ' ').trim();
    const descRef = useRef(null);
    const [descExpanded, setDescExpanded] = useState(false);
    const [descNeedsClamp, setDescNeedsClamp] = useState(false);
    const [amenitiesOpen, setAmenitiesOpen] = useState(false);

    useEffect(() => {
        const el = descRef.current;
        if (!el || !aboutPreview) {
            setDescNeedsClamp(false);
            return undefined;
        }

        const measure = () => {
            if (descExpanded) {
                return;
            }
            setDescNeedsClamp(el.scrollHeight > el.clientHeight + 1);
        };

        // Wait a frame so line-clamp height is applied before measuring.
        const frame = window.requestAnimationFrame(measure);
        const observer =
            typeof ResizeObserver !== 'undefined'
                ? new ResizeObserver(measure)
                : null;
        observer?.observe(el);
        window.addEventListener('resize', measure);

        return () => {
            window.cancelAnimationFrame(frame);
            observer?.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [aboutPreview, description, descExpanded]);

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

            <div className="flex flex-1 flex-col gap-3 px-4 py-4">
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

                <div>
                    {aboutPreview ? (
                        <p
                            ref={descRef}
                            className={`text-sm leading-relaxed text-olive-700 ${
                                descExpanded
                                    ? 'whitespace-pre-wrap'
                                    : 'line-clamp-3 min-h-[4.5rem]'
                            }`}
                        >
                            {descExpanded ? description : aboutPreview}
                        </p>
                    ) : (
                        <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-relaxed text-olive-400">
                            No description yet.
                        </p>
                    )}
                    {aboutPreview && (descNeedsClamp || descExpanded) ? (
                        <button
                            type="button"
                            className="mt-1.5 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-olive-900/20 bg-white px-4 py-2 text-sm font-semibold text-olive-900 transition hover:border-olive-900/40 hover:bg-olive-50"
                            aria-expanded={descExpanded}
                            onClick={() => setDescExpanded((open) => !open)}
                        >
                            {descExpanded ? 'View less' : 'View more'}
                            <svg
                                viewBox="0 0 24 24"
                                className={`h-4 w-4 shrink-0 transition ${
                                    descExpanded ? 'rotate-180' : ''
                                }`}
                                aria-hidden="true"
                            >
                                <path
                                    d="M8 10l4 4 4-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    ) : aboutPreview ? (
                        <span
                            className="mt-1.5 block min-h-11"
                            aria-hidden="true"
                        />
                    ) : (
                        <span
                            className="mt-1.5 block min-h-11"
                            aria-hidden="true"
                        />
                    )}
                </div>

                <div className="mt-auto border-t border-olive-900/10 pt-3">
                    {amenities.length ? (
                        <>
                            <button
                                type="button"
                                className="inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-sm border border-olive-900/15 bg-olive-50/70 px-3 text-left text-sm font-semibold text-olive-900 transition hover:border-olive-900/30 hover:bg-olive-50"
                                aria-expanded={amenitiesOpen}
                                onClick={() =>
                                    setAmenitiesOpen((open) => !open)
                                }
                            >
                                <span>
                                    {amenitiesOpen
                                        ? 'Hide amenities'
                                        : 'View amenities'}
                                </span>
                                <span className="tabular-nums text-olive-500">
                                    {amenities.length}
                                </span>
                            </button>
                            {amenitiesOpen ? (
                                <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                                    {amenities.map((amenity) => (
                                        <li
                                            key={
                                                amenity.slug || amenity.name
                                            }
                                            className="flex min-w-0 items-start gap-2 text-sm font-medium leading-snug text-olive-800"
                                        >
                                            <span
                                                className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-olive-700"
                                                aria-hidden="true"
                                            />
                                            <span className="min-w-0">
                                                {amenity.name}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </>
                    ) : (
                        <p className="text-sm text-olive-400">
                            No room amenities listed.
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function RoomTypesGallery({
    roomTypes,
    title = 'Room types',
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
                                    className="w-[calc(100%-1.25rem)] shrink-0 snap-start sm:w-[calc(50%-0.375rem)]"
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
