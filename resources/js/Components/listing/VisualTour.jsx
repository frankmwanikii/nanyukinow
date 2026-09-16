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

function MosaicTile({ src, alt, onClick, className = '', children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative block overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mustard ${className}`}
            aria-label={alt}
        >
            <img
                src={src}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
            {children}
        </button>
    );
}

export default function VisualTour({
    gallery = [],
    title = 'Visual tour',
    hideTabs = false,
}) {
    const spaces = useMemo(() => {
        const normalized = normalizeGallerySpaces(gallery);
        if (!hideTabs || normalized.length <= 1) return normalized;

        const images = [];
        const seen = new Set();
        for (const space of normalized) {
            for (const src of space.images) {
                if (!src || seen.has(src)) continue;
                seen.add(src);
                images.push(src);
            }
        }
        if (!images.length) return [];
        return [
            {
                label: title || 'Gallery',
                kind: 'gallery',
                images,
                cover: images[0],
            },
        ];
    }, [gallery, hideTabs, title]);
    const flat = useMemo(() => flattenSpaces(spaces), [spaces]);

    const [spaceIndex, setSpaceIndex] = useState(0);
    const [lightbox, setLightbox] = useState(null);

    useEffect(() => {
        setSpaceIndex(0);
    }, [gallery]);

    const safeSpaceIndex = Math.min(
        spaceIndex,
        Math.max(spaces.length - 1, 0),
    );
    const space = spaces[safeSpaceIndex];
    const images = space?.images || [];

    const mosaicSources = useMemo(() => {
        if (spaces.length <= 1) {
            return flat.map((item) => item.src);
        }
        return images;
    }, [spaces.length, flat, images]);

    const goSpace = (next) => {
        setSpaceIndex(next);
    };

    const openLightbox = (sIdx = safeSpaceIndex, iIdx = 0) => {
        const global = flat.findIndex(
            (item) => item.spaceIndex === sIdx && item.imageIndex === iIdx,
        );
        setLightbox(global >= 0 ? global : 0);
    };

    const openMosaicAt = (localIndex) => {
        if (spaces.length <= 1) {
            setLightbox(Math.min(localIndex, flat.length - 1));
            return;
        }
        openLightbox(safeSpaceIndex, localIndex);
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
    }, [lightbox, flat]);

    if (!spaces.length || !mosaicSources.length) return null;

    const lightboxItem =
        lightbox != null ? flat[Math.min(lightbox, flat.length - 1)] : null;
    const lightboxSpaceCount = lightboxItem
        ? flat.filter((f) => f.spaceIndex === lightboxItem.spaceIndex).length
        : 0;
    const lightboxSpacePos = lightboxItem
        ? lightboxItem.imageIndex + 1
        : 0;

    const primary = mosaicSources[0];
    const side = mosaicSources.slice(1, 5);
    const showSide = side.length > 0;

    return (
        <>
            <DetailSection id="gallery" title={title}>
                {spaces.length > 1 ? (
                    <div className="mb-3 flex gap-2 overflow-x-auto pb-0.5">
                        {spaces.map((item, index) => {
                            const selected = index === safeSpaceIndex;
                            return (
                                <button
                                    key={`${item.kind}-${item.label}`}
                                    type="button"
                                    onClick={() => goSpace(index)}
                                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition sm:text-sm ${
                                        selected
                                            ? 'bg-olive-800 text-white'
                                            : 'bg-olive-50 text-olive-800 hover:bg-olive-100'
                                    }`}
                                >
                                    {item.label}
                                    {item.images.length > 1 ? (
                                        <span className="ml-1.5 opacity-70">
                                            {item.images.length}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                ) : null}

                <div
                    className={`overflow-hidden rounded-xl ${
                        showSide
                            ? 'grid gap-1.5 sm:grid-cols-4 sm:grid-rows-2 sm:gap-2'
                            : ''
                    }`}
                >
                    <MosaicTile
                        src={primary}
                        alt={`Open ${space.label} gallery`}
                        onClick={() => openMosaicAt(0)}
                        className={
                            showSide
                                ? 'aspect-[4/3] sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:h-full sm:min-h-[260px] lg:min-h-[300px]'
                                : 'aspect-[16/10]'
                        }
                    >
                        {!showSide ? (
                            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-bold text-olive-900 shadow-soft">
                                <Expand className="h-3.5 w-3.5" />
                                View photo
                            </span>
                        ) : null}
                    </MosaicTile>

                    {showSide
                        ? side.map((src, index) => {
                              const isLast = index === side.length - 1;
                              return (
                                  <MosaicTile
                                      key={`${src}-${index}`}
                                      src={src}
                                      alt={`Open photo ${index + 2}`}
                                      onClick={() => openMosaicAt(index + 1)}
                                      className={`hidden aspect-[4/3] sm:block sm:aspect-auto sm:h-full sm:min-h-[126px] lg:min-h-[146px] ${
                                          side.length === 1
                                              ? 'sm:col-span-2 sm:row-span-2'
                                              : side.length === 2
                                                ? 'sm:col-span-2'
                                                : side.length === 3 && index === 2
                                                  ? 'sm:col-span-2'
                                                  : ''
                                      }`}
                                  >
                                      {isLast ? (
                                          <span className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-earth-dusk/50 via-transparent to-transparent p-3">
                                              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-bold text-olive-900 shadow-soft">
                                                  <Expand className="h-3.5 w-3.5" />
                                                  Show all {flat.length}
                                              </span>
                                          </span>
                                      ) : null}
                                  </MosaicTile>
                              );
                          })
                        : null}
                </div>

                {showSide ? (
                    <div className="mt-3 flex items-center justify-between gap-3 sm:hidden">
                        <div className="flex gap-1.5 overflow-x-auto">
                            {mosaicSources.slice(0, 6).map((src, index) => (
                                <button
                                    key={`${src}-m-${index}`}
                                    type="button"
                                    onClick={() => openMosaicAt(index)}
                                    className="h-14 w-16 shrink-0 overflow-hidden rounded-lg"
                                >
                                    <img
                                        src={src}
                                        alt=""
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => openMosaicAt(0)}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-olive-200 bg-white px-3 py-2 text-xs font-bold text-olive-900"
                        >
                            <Expand className="h-3.5 w-3.5" />
                            All {flat.length}
                        </button>
                    </div>
                ) : null}

                {showSide ? (
                    <div className="mt-3 hidden sm:block">
                        <button
                            type="button"
                            onClick={() => openMosaicAt(0)}
                            className="text-sm font-semibold text-olive-900 underline decoration-olive-300 underline-offset-4 transition hover:decoration-mustard"
                        >
                            Browse all {flat.length} photos
                        </button>
                    </div>
                ) : null}
            </DetailSection>

            <AnimatePresence>
                {lightboxItem ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1200] flex flex-col bg-[#0c0a08]/94 backdrop-blur-md"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Image lightbox"
                        onClick={closeLightbox}
                    >
                        <div
                            className="relative z-20 flex items-center justify-between gap-3 px-4 py-4 sm:px-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="min-w-0">
                                <p className="truncate font-display text-sm font-semibold text-white sm:text-base">
                                    {lightboxItem.label}
                                </p>
                                <p className="text-[11px] font-medium uppercase tracking-wider text-white/55">
                                    Photo {lightboxSpacePos} of {lightboxSpaceCount}
                                    {' · '}
                                    {lightbox + 1}/{flat.length} total
                                </p>
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
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div
                            className="relative z-20 border-t border-white/10 bg-black/25 px-4 py-4 backdrop-blur-md sm:px-8 sm:py-5"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto pb-1">
                                {flat.map((item, index) => {
                                    const active = index === lightbox;
                                    const multiSpace = spaces.length > 1;
                                    const showLabel =
                                        multiSpace &&
                                        (index === 0 ||
                                            flat[index - 1]?.spaceIndex !==
                                                item.spaceIndex);
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
