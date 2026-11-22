import { Expand } from '@/Components/site/LucideCompat';
import { useEffect, useMemo, useRef, useState } from 'react';
import GalleryLightbox from './GalleryLightbox';
import DetailSection, { useDetailSectionTone } from './DetailSection';
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

function MosaicTile({
    src,
    alt,
    onClick,
    className = '',
    contain = false,
    children,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative block min-h-0 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mustard ${
                contain ? 'bg-olive-950' : ''
            } ${className}`}
            aria-label={alt}
        >
            {contain ? (
                <>
                    <img
                        src={src}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
                        loading="lazy"
                    />
                    <img
                        src={src}
                        alt=""
                        className="relative z-[1] h-full w-full object-contain transition duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                    />
                </>
            ) : (
                <img
                    src={src}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                />
            )}
            <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
            {children}
        </button>
    );
}

function TabScrollChevron({ direction }) {
    const isLeft = direction === 'left';
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            aria-hidden="true"
        >
            <path
                d={isLeft ? 'M14.5 6.5 9 12l5.5 5.5' : 'M9.5 6.5 15 12l-5.5 5.5'}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function SpaceTabs({
    spaces,
    safeSpaceIndex,
    openSurface,
    onSelect,
}) {
    const scrollerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollHints = () => {
        const el = scrollerRef.current;
        if (!el) {
            return;
        }
        const max = el.scrollWidth - el.clientWidth;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(max > 4 && el.scrollLeft < max - 4);
    };

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) {
            return undefined;
        }

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
    }, [spaces]);

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) {
            return;
        }
        const active = el.querySelector('[data-space-tab="active"]');
        if (active && typeof active.scrollIntoView === 'function') {
            active.scrollIntoView({
                behavior: 'smooth',
                inline: 'nearest',
                block: 'nearest',
            });
        }
        updateScrollHints();
    }, [safeSpaceIndex]);

    if (spaces.length <= 1) return null;

    const scrollBy = (direction) => {
        const el = scrollerRef.current;
        if (!el) {
            return;
        }
        el.scrollBy({
            left: direction * Math.min(220, el.clientWidth * 0.6),
            behavior: 'smooth',
        });
    };

    return (
        <div className="relative mb-3">
            <div
                ref={scrollerRef}
                className={`flex overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
                    openSurface ? 'gap-4 border-b border-olive-900/10' : 'gap-2'
                }`}
            >
                {spaces.map((item, index) => {
                    const selected = index === safeSpaceIndex;
                    return (
                        <button
                            key={`${item.kind}-${item.label}`}
                            type="button"
                            data-space-tab={selected ? 'active' : undefined}
                            onClick={() => onSelect(index)}
                            className={`shrink-0 text-xs font-semibold transition sm:text-sm ${
                                openSurface
                                    ? `border-b-2 px-0.5 pb-2.5 ${
                                          selected
                                              ? 'border-earth-dusk text-earth-dusk'
                                              : 'border-transparent text-olive-600 hover:text-olive-900'
                                      }`
                                    : `rounded-full px-3.5 py-1.5 ${
                                          selected
                                              ? 'bg-olive-800 text-white'
                                              : 'bg-olive-50 text-olive-800 hover:bg-olive-100'
                                      }`
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

            <div
                className={`pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center bg-gradient-to-r from-white via-white/90 to-transparent transition-opacity duration-200 dark:from-olive-950 dark:via-olive-950/90 ${
                    canScrollLeft ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <button
                    type="button"
                    tabIndex={canScrollLeft ? 0 : -1}
                    aria-label="Scroll room tabs left"
                    aria-hidden={!canScrollLeft}
                    onClick={() => scrollBy(-1)}
                    className={`pointer-events-auto ml-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-olive-900/10 bg-white text-olive-800 shadow-sm transition hover:border-olive-900/25 hover:text-earth-dusk dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100 ${
                        canScrollLeft ? '' : 'pointer-events-none'
                    }`}
                >
                    <TabScrollChevron direction="left" />
                </button>
            </div>

            <div
                className={`pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-end bg-gradient-to-l from-white via-white/90 to-transparent transition-opacity duration-200 dark:from-olive-950 dark:via-olive-950/90 ${
                    canScrollRight ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <button
                    type="button"
                    tabIndex={canScrollRight ? 0 : -1}
                    aria-label="Scroll room tabs right"
                    aria-hidden={!canScrollRight}
                    onClick={() => scrollBy(1)}
                    className={`pointer-events-auto mr-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-olive-900/10 bg-white text-olive-800 shadow-sm transition hover:border-olive-900/25 hover:text-earth-dusk dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100 ${
                        canScrollRight ? '' : 'pointer-events-none'
                    }`}
                >
                    <TabScrollChevron direction="right" />
                </button>
            </div>
        </div>
    );
}

/**
 * Mobile: Airbnb-style swipe hero + counter + Show all.
 * Desktop (sm+): existing mosaic grid.
 */
export default function VisualTour({
    gallery = [],
    title = 'Visual tour',
    hideTabs = false,
    containImages = false,
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
    const [mobileIndex, setMobileIndex] = useState(0);
    const scrollerRef = useRef(null);

    useEffect(() => {
        setSpaceIndex(0);
        setMobileIndex(0);
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

    useEffect(() => {
        setMobileIndex(0);
        const el = scrollerRef.current;
        if (el) {
            el.scrollLeft = 0;
        }
    }, [safeSpaceIndex, mosaicSources]);

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

    useEffect(() => {
        if (lightbox == null || !flat[lightbox]) return;
        const item = flat[lightbox];
        setSpaceIndex(item.spaceIndex);
    }, [lightbox, flat]);

    const lightboxItems = useMemo(
        () =>
            flat.map((item) => ({
                src: item.src,
                label: item.label,
                alt: item.label,
            })),
        [flat],
    );

    const onMobileScroll = () => {
        const el = scrollerRef.current;
        if (!el) return;
        const width = el.clientWidth;
        if (!width) return;
        const next = Math.round(el.scrollLeft / width);
        setMobileIndex(
            Math.min(Math.max(next, 0), Math.max(mosaicSources.length - 1, 0)),
        );
    };

    if (!spaces.length || !mosaicSources.length) return null;

    const lightboxItem =
        lightbox != null ? flat[Math.min(lightbox, flat.length - 1)] : null;
    const lightboxSpaceCount = lightboxItem
        ? flat.filter((f) => f.spaceIndex === lightboxItem.spaceIndex).length
        : 0;
    const lightboxSpacePos = lightboxItem ? lightboxItem.imageIndex + 1 : 0;

    const primary = mosaicSources[0];
    const side = mosaicSources.slice(1, 5);
    const showSide = side.length > 0;
    const tone = useDetailSectionTone();
    const openSurface = tone === 'open';
    const mobileCount = mosaicSources.length;
    const safeMobileIndex = Math.min(mobileIndex, Math.max(mobileCount - 1, 0));

    return (
        <>
            <DetailSection id="gallery" title={title}>
                <SpaceTabs
                    spaces={spaces}
                    safeSpaceIndex={safeSpaceIndex}
                    openSurface={openSurface}
                    onSelect={goSpace}
                />

                {/* Mobile: swipe hero */}
                <div className="sm:hidden">
                    <div
                        ref={scrollerRef}
                        onScroll={onMobileScroll}
                        className={`flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
                            openSurface ? 'rounded-sm' : 'rounded-xl'
                        } ${containImages ? 'bg-olive-950' : 'bg-olive-100'}`}
                        style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                        {mosaicSources.map((src, index) => (
                            <button
                                key={`${src}-slide-${index}`}
                                type="button"
                                onClick={() => openMosaicAt(index)}
                                className="relative aspect-[4/3] w-full min-w-full shrink-0 snap-center snap-always overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mustard"
                                aria-label={`Open photo ${index + 1} of ${mobileCount}`}
                            >
                                {containImages ? (
                                    <>
                                        <img
                                            src={src}
                                            alt=""
                                            aria-hidden="true"
                                            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
                                            loading={index === 0 ? 'eager' : 'lazy'}
                                        />
                                        <img
                                            src={src}
                                            alt=""
                                            className="relative z-[1] h-full w-full object-contain"
                                            loading={index === 0 ? 'eager' : 'lazy'}
                                        />
                                    </>
                                ) : (
                                    <img
                                        src={src}
                                        alt=""
                                        className="h-full w-full object-cover"
                                        loading={index === 0 ? 'eager' : 'lazy'}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {mobileCount > 1 ? (
                        <div className="mt-3 flex items-center justify-between gap-3">
                            <p className="text-sm font-medium tabular-nums text-olive-600">
                                {safeMobileIndex + 1} / {mobileCount}
                            </p>
                            <button
                                type="button"
                                onClick={() => openMosaicAt(safeMobileIndex)}
                                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-olive-900 underline decoration-olive-300 underline-offset-4 transition hover:decoration-mustard"
                            >
                                <Expand className="h-3.5 w-3.5" />
                                Show all {flat.length} photos
                            </button>
                        </div>
                    ) : (
                        <div className="mt-3">
                            <button
                                type="button"
                                onClick={() => openMosaicAt(0)}
                                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-olive-900 underline decoration-olive-300 underline-offset-4 transition hover:decoration-mustard"
                            >
                                <Expand className="h-3.5 w-3.5" />
                                View full size
                            </button>
                        </div>
                    )}
                </div>

                {/* Desktop: mosaic */}
                <div className="hidden sm:block">
                    <div
                        className={`min-w-0 overflow-hidden ${
                            openSurface ? 'rounded-sm' : 'rounded-xl'
                        } ${
                            showSide
                                ? 'grid h-[280px] gap-1.5 sm:h-[320px] sm:grid-cols-4 sm:grid-rows-2 sm:gap-2 lg:h-[380px]'
                                : ''
                        }`}
                    >
                        <MosaicTile
                            src={primary}
                            alt={`Open ${space.label} gallery`}
                            onClick={() => openMosaicAt(0)}
                            contain={containImages}
                            className={
                                showSide
                                    ? 'col-span-1 row-span-1 h-full min-h-0 sm:col-span-2 sm:row-span-2'
                                    : containImages
                                      ? 'mx-auto aspect-[3/4] max-h-[70vh] w-full max-w-md sm:max-w-lg'
                                      : 'aspect-[16/10]'
                            }
                        >
                            {!showSide ? (
                                <span className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-[2px] bg-white/95 px-3.5 py-2 text-xs font-bold text-olive-900 shadow-soft">
                                    <Expand className="h-3.5 w-3.5" />
                                    View full size
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
                                          onClick={() =>
                                              openMosaicAt(index + 1)
                                          }
                                          contain={containImages}
                                          className={`h-full min-h-0 ${
                                              side.length === 1
                                                  ? 'sm:col-span-2 sm:row-span-2'
                                                  : side.length === 2
                                                    ? 'sm:col-span-2'
                                                    : side.length === 3 &&
                                                        index === 2
                                                      ? 'sm:col-span-2'
                                                      : ''
                                          }`}
                                      >
                                          {isLast ? (
                                              <span className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-earth-dusk/50 via-transparent to-transparent p-3">
                                                  <span className="inline-flex items-center gap-1.5 rounded-[2px] bg-white px-3 py-2 text-xs font-bold text-olive-900 shadow-soft">
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
                        <div className="mt-3">
                            <button
                                type="button"
                                onClick={() => openMosaicAt(0)}
                                className="text-sm font-semibold text-olive-900 underline decoration-olive-300 underline-offset-4 transition hover:decoration-mustard"
                            >
                                Browse all {flat.length} photos
                            </button>
                        </div>
                    ) : null}
                </div>
            </DetailSection>

            {lightboxItem ? (
                <GalleryLightbox
                    items={lightboxItems}
                    index={lightbox}
                    onClose={() => setLightbox(null)}
                    onIndexChange={setLightbox}
                    title={lightboxItem.label}
                    meta={
                        spaces.length > 1
                            ? `Photo ${lightboxSpacePos} of ${lightboxSpaceCount} · ${lightbox + 1}/${flat.length}`
                            : `${lightbox + 1} / ${flat.length}`
                    }
                    padBlur
                />
            ) : null}
        </>
    );
}
