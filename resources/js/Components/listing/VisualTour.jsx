import {
    ChevronLeft,
    ChevronRight,
    Expand,
    X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import DetailSection from './DetailSection';
import { normalizeGallerySpaces } from '@/data/listingDetails';

function flattenSpaces(spaces) {
    const flat = [];
    spaces.forEach((space, spaceIndex) => {
        space.images.forEach((src, imageIndex) => {
            flat.push({
                src,
                label: space.label,
                kind: space.kind,
                spaceIndex,
                imageIndex,
            });
        });
    });
    return flat;
}

function ArrowButton({ direction, onClick, className = '', label, size = 'md' }) {
    const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
    const sizeClass =
        size === 'lg'
            ? 'h-12 w-12 sm:h-14 sm:w-14'
            : 'h-10 w-10';
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            aria-label={label}
            className={`flex items-center justify-center rounded-full bg-white/95 text-olive-900 shadow-lift backdrop-blur transition hover:scale-105 hover:bg-mustard ${sizeClass} ${className}`}
        >
            <Icon className={size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} strokeWidth={2} />
        </button>
    );
}

export default function VisualTour({ gallery = [], title = 'Visual tour' }) {
    const spaces = useMemo(
        () => normalizeGallerySpaces(gallery),
        [gallery],
    );
    const flat = useMemo(() => flattenSpaces(spaces), [spaces]);

    const [spaceIndex, setSpaceIndex] = useState(0);
    const [imageIndex, setImageIndex] = useState(0);
    const [lightbox, setLightbox] = useState(null);

    useEffect(() => {
        setSpaceIndex(0);
        setImageIndex(0);
    }, [gallery]);

    const safeSpaceIndex = Math.min(
        spaceIndex,
        Math.max(spaces.length - 1, 0),
    );
    const space = spaces[safeSpaceIndex];
    const images = space?.images || [];
    const safeImageIndex = Math.min(
        imageIndex,
        Math.max(images.length - 1, 0),
    );
    const currentSrc = images[safeImageIndex];

    const goSpace = (next) => {
        setSpaceIndex(next);
        setImageIndex(0);
    };

    const prevImage = () => {
        if (images.length <= 1) return;
        setImageIndex((i) => (i - 1 + images.length) % images.length);
    };

    const nextImage = () => {
        if (images.length <= 1) return;
        setImageIndex((i) => (i + 1) % images.length);
    };

    const openLightbox = (sIdx = safeSpaceIndex, iIdx = safeImageIndex) => {
        const global = flat.findIndex(
            (item) => item.spaceIndex === sIdx && item.imageIndex === iIdx,
        );
        setLightbox(global >= 0 ? global : 0);
    };

    const closeLightbox = () => setLightbox(null);

    const lightboxPrev = () => {
        if (!flat.length) return;
        setLightbox((i) => (i - 1 + flat.length) % flat.length);
    };

    const lightboxNext = () => {
        if (!flat.length) return;
        setLightbox((i) => (i + 1) % flat.length);
    };

    useEffect(() => {
        if (lightbox == null) return undefined;

        const onKey = (e) => {
            if (e.key === 'Escape') setLightbox(null);
            if (e.key === 'ArrowLeft') {
                setLightbox((i) =>
                    flat.length ? (i - 1 + flat.length) % flat.length : i,
                );
            }
            if (e.key === 'ArrowRight') {
                setLightbox((i) =>
                    flat.length ? (i + 1) % flat.length : i,
                );
            }
        };

        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [lightbox, flat.length]);

    useEffect(() => {
        if (lightbox == null || !flat[lightbox]) return;
        const item = flat[lightbox];
        setSpaceIndex(item.spaceIndex);
        setImageIndex(item.imageIndex);
    }, [lightbox, flat]);

    if (!spaces.length || !currentSrc) return null;

    const lightboxItem =
        lightbox != null ? flat[Math.min(lightbox, flat.length - 1)] : null;
    const lightboxSpaceCount = lightboxItem
        ? flat.filter((f) => f.spaceIndex === lightboxItem.spaceIndex).length
        : 0;
    const lightboxSpacePos = lightboxItem
        ? lightboxItem.imageIndex + 1
        : 0;

    return (
        <>
            <DetailSection id="gallery" title={title}>
                <div className="overflow-hidden rounded-2xl bg-olive-100 shadow-soft">
                    <div className="relative aspect-[16/10]">
                        <button
                            type="button"
                            onClick={() => openLightbox()}
                            className="group absolute inset-0 block w-full text-left"
                            aria-label="Open image gallery"
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={`${space.kind}-${currentSrc}`}
                                    initial={{ opacity: 0.35 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    src={currentSrc}
                                    alt={`${space.label} photo ${safeImageIndex + 1}`}
                                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                                />
                            </AnimatePresence>
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-earth-dusk/40 via-transparent to-transparent" />
                        </button>

                        <span className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-full bg-earth-dusk/85 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                            {space.label}
                            {images.length > 1
                                ? ` · ${safeImageIndex + 1}/${images.length}`
                                : ''}
                        </span>

                        <button
                            type="button"
                            onClick={() => openLightbox()}
                            className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-bold text-olive-900 shadow-soft transition hover:bg-mustard"
                        >
                            <Expand className="h-3.5 w-3.5" />
                            View all {flat.length}
                        </button>

                        {images.length > 1 ? (
                            <>
                                <ArrowButton
                                    direction="prev"
                                    label={`Previous ${space.label} photo`}
                                    onClick={prevImage}
                                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2"
                                />
                                <ArrowButton
                                    direction="next"
                                    label={`Next ${space.label} photo`}
                                    onClick={nextImage}
                                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2"
                                />
                            </>
                        ) : null}

                        {images.length > 1 ? (
                            <div className="pointer-events-none absolute inset-x-0 bottom-12 z-10 flex justify-center gap-1.5">
                                {images.map((_, i) => (
                                    <span
                                        key={i}
                                        className={`h-1.5 rounded-full transition ${
                                            i === safeImageIndex
                                                ? 'w-5 bg-mustard'
                                                : 'w-1.5 bg-white/70'
                                        }`}
                                    />
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>

                {spaces.length > 1 ? (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {spaces.map((item, index) => {
                            const selected = index === safeSpaceIndex;
                            return (
                                <button
                                    key={`${item.kind}-${item.label}`}
                                    type="button"
                                    onClick={() => goSpace(index)}
                                    className={`group relative w-[7.5rem] shrink-0 overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard sm:w-32 ${
                                        selected
                                            ? 'ring-2 ring-mustard ring-offset-2 ring-offset-white'
                                            : ''
                                    }`}
                                >
                                    <img
                                        src={item.cover || item.images[0]}
                                        alt=""
                                        className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-earth-dusk/85 to-transparent px-1.5 pb-1.5 pt-5 text-left text-[10px] font-semibold leading-tight text-white sm:text-xs">
                                        {item.label}
                                        {item.images.length > 1 ? (
                                            <span className="mt-0.5 block font-normal text-white/80">
                                                {item.images.length} photos
                                            </span>
                                        ) : null}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                ) : null}
            </DetailSection>

            <AnimatePresence>
                {lightboxItem ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[90] flex flex-col bg-[#0c0a08]/94 backdrop-blur-md"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Image lightbox"
                        onClick={closeLightbox}
                    >
                        {/* Top chrome */}
                        <div
                            className="relative z-20 flex items-center justify-between gap-3 px-4 py-4 sm:px-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="rounded-2xl bg-white/10 px-4 py-2.5 ring-1 ring-white/15 backdrop-blur-md">
                                    <p className="truncate font-display text-sm font-semibold text-white sm:text-base">
                                        {lightboxItem.label}
                                    </p>
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-white/55">
                                        Photo {lightboxSpacePos} of{' '}
                                        {lightboxSpaceCount} · {lightbox + 1}/
                                        {flat.length} total
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeLightbox}
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-mustard text-olive-950 shadow-lift ring-2 ring-white/90 transition hover:scale-105 hover:bg-white"
                                aria-label="Close lightbox"
                            >
                                <X className="h-5 w-5" strokeWidth={2.75} />
                            </button>
                        </div>

                        {/* Stage */}
                        <div
                            className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-2 sm:px-20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {flat.length > 1 ? (
                                <>
                                    <ArrowButton
                                        direction="prev"
                                        size="lg"
                                        label="Previous photo"
                                        onClick={lightboxPrev}
                                        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 sm:left-6"
                                    />
                                    <ArrowButton
                                        direction="next"
                                        size="lg"
                                        label="Next photo"
                                        onClick={lightboxNext}
                                        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 sm:right-6"
                                    />
                                </>
                            ) : null}

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={lightboxItem.src}
                                    initial={{ opacity: 0, y: 12, scale: 0.985 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.985 }}
                                    transition={{ duration: 0.28, ease: 'easeOut' }}
                                    className="relative max-h-full max-w-6xl"
                                >
                                    <img
                                        src={lightboxItem.src}
                                        alt={lightboxItem.label}
                                        className="max-h-[min(72vh,820px)] w-auto max-w-full rounded-2xl object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,0.65)] ring-1 ring-white/10"
                                    />
                                    <span className="absolute left-4 top-4 rounded-full bg-earth-dusk/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                                        {lightboxItem.label}
                                    </span>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Filmstrip */}
                        <div
                            className="relative z-20 border-t border-white/10 bg-black/25 px-4 py-4 backdrop-blur-md sm:px-8 sm:py-5"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto pb-1">
                                {flat.map((item, index) => {
                                    const active = index === lightbox;
                                    const showLabel =
                                        index === 0 ||
                                        flat[index - 1]?.spaceIndex !==
                                            item.spaceIndex;
                                    return (
                                        <button
                                            key={`${item.src}-${index}`}
                                            type="button"
                                            onClick={() => setLightbox(index)}
                                            className={`group relative shrink-0 overflow-hidden rounded-xl transition ${
                                                active
                                                    ? 'ring-2 ring-mustard ring-offset-2 ring-offset-[#0c0a08]'
                                                    : 'opacity-65 hover:opacity-100'
                                            }`}
                                        >
                                            <img
                                                src={item.src}
                                                alt=""
                                                className="h-16 w-24 object-cover sm:h-[4.5rem] sm:w-28"
                                                loading="lazy"
                                            />
                                            {showLabel ? (
                                                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 pb-1 pt-4 text-left text-[9px] font-semibold text-white sm:text-[10px]">
                                                    {item.label}
                                                </span>
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="mt-3 text-center text-[11px] font-medium tracking-wide text-white/40">
                                Use ← → to browse · Esc to close
                            </p>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </>
    );
}
