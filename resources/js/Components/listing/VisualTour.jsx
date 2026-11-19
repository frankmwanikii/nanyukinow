import { Expand } from '@/Components/site/LucideCompat';
import { useEffect, useMemo, useState } from 'react';
import GalleryLightbox from './GalleryLightbox';
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
                    className={`min-w-0 overflow-hidden rounded-xl ${
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
                    <div className="mt-3 flex min-w-0 items-center justify-between gap-3 sm:hidden">
                        <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                />
            ) : null}
        </>
    );
}
