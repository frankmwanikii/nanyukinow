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

function ArrowButton({ direction, onClick, className = '', label }) {
    const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            aria-label={label}
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-olive-900 shadow-lift transition hover:bg-mustard ${className}`}
        >
            <Icon className="h-5 w-5" />
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

    // Keep room strip in sync when browsing lightbox
    useEffect(() => {
        if (lightbox == null || !flat[lightbox]) return;
        const item = flat[lightbox];
        setSpaceIndex(item.spaceIndex);
        setImageIndex(item.imageIndex);
    }, [lightbox, flat]);

    if (!spaces.length || !currentSrc) return null;

    const lightboxItem =
        lightbox != null ? flat[Math.min(lightbox, flat.length - 1)] : null;

    return (
        <>
            <DetailSection id="gallery" title={title}>
                <div className="overflow-hidden rounded-xl bg-olive-100">
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
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-earth-dusk/35 via-transparent to-transparent" />
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
                            className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-olive-900 shadow-soft transition hover:bg-mustard"
                        >
                            <Expand className="h-3.5 w-3.5" />
                            View
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
                                    className={`group relative w-[7.5rem] shrink-0 overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard sm:w-32 ${
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
                        className="fixed inset-0 z-[90] flex flex-col bg-earth-dusk/92 backdrop-blur-sm"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Image lightbox"
                        onClick={closeLightbox}
                    >
                        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
                            <div className="min-w-0 text-white">
                                <p className="truncate font-display text-base font-semibold sm:text-lg">
                                    {lightboxItem.label}
                                </p>
                                <p className="text-xs text-white/70 sm:text-sm">
                                    {lightbox + 1} / {flat.length}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeLightbox}
                                className="rounded-full bg-white/15 p-2 text-white transition hover:bg-white hover:text-olive-950"
                                aria-label="Close lightbox"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div
                            className="relative flex min-h-0 flex-1 items-center justify-center px-12 sm:px-16"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {flat.length > 1 ? (
                                <>
                                    <ArrowButton
                                        direction="prev"
                                        label="Previous photo"
                                        onClick={lightboxPrev}
                                        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 sm:left-5"
                                    />
                                    <ArrowButton
                                        direction="next"
                                        label="Next photo"
                                        onClick={lightboxNext}
                                        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 sm:right-5"
                                    />
                                </>
                            ) : null}

                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={lightboxItem.src}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.25 }}
                                    src={lightboxItem.src}
                                    alt={lightboxItem.label}
                                    className="max-h-full max-w-full rounded-lg object-contain shadow-lift"
                                />
                            </AnimatePresence>
                        </div>

                        <div
                            className="overflow-x-auto px-4 py-3 sm:px-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mx-auto flex w-max gap-2">
                                {flat.map((item, index) => {
                                    const active = index === lightbox;
                                    return (
                                        <button
                                            key={`${item.src}-${index}`}
                                            type="button"
                                            onClick={() => setLightbox(index)}
                                            className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md sm:h-16 sm:w-24 ${
                                                active
                                                    ? 'ring-2 ring-mustard'
                                                    : 'opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            <img
                                                src={item.src}
                                                alt=""
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </>
    );
}
