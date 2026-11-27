import {
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Images,
} from '@/Components/site/LucideCompat';
import { portfolioItemImages } from '@/data/servicesTierFeatures';
import { useEffect, useMemo, useState } from 'react';
import GalleryLightbox from './GalleryLightbox';
import SwipeImageRail from './SwipeImageRail';

const PAGE_SIZE = 12;

function normalizePortfolio(items = []) {
    if (!Array.isArray(items)) return [];
    return items
        .map((item, index) => {
            if (!item || typeof item !== 'object') return null;
            const title = item.title || item.name || item.label || '';
            const images = portfolioItemImages(item);
            const description = item.description || item.note || '';
            const url = typeof item.url === 'string' ? item.url.trim() : '';
            if (!title && !images.length && !description && !url) {
                return null;
            }
            return {
                id: item.id || `portfolio-${index}`,
                title: title || 'Untitled work',
                images,
                image: images[0] || null,
                description: description || null,
                url: url || null,
            };
        })
        .filter(Boolean);
}

export default function PortfolioPage({ listing }) {
    const items = useMemo(
        () => normalizePortfolio(listing?.portfolio),
        [listing?.portfolio],
    );
    const [page, setPage] = useState(1);
    const [lightbox, setLightbox] = useState(null);

    const lightboxItems = useMemo(
        () =>
            items.flatMap((piece) =>
                piece.images.map((src, imageIndex) => ({
                    ...piece,
                    image: src,
                    slideKey: `${piece.id}-${imageIndex}`,
                    imageIndex,
                })),
            ),
        [items],
    );

    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageItems = items.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE,
    );

    useEffect(() => {
        setPage(1);
        setLightbox(null);
    }, [listing?.id]);

    const goTo = (next) => {
        const clamped = Math.min(totalPages, Math.max(1, next));
        setPage(clamped);
        document
            .getElementById('portfolio-list')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const openLightbox = (piece, imageIndex = 0) => {
        if (!piece?.images?.length) return;
        const index = lightboxItems.findIndex(
            (slide) =>
                slide.id === piece.id && slide.imageIndex === imageIndex,
        );
        if (index >= 0) setLightbox(index);
    };

    const active =
        lightbox != null
            ? lightboxItems[Math.min(lightbox, lightboxItems.length - 1)]
            : null;
    const gallerySlides = useMemo(
        () =>
            lightboxItems.map((slide) => ({
                src: slide.image,
                label: slide.title,
                alt: slide.title,
            })),
        [lightboxItems],
    );

    return (
        <div className="mx-auto max-w-site px-4 sm:px-6">
            <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="font-display text-2xl font-semibold text-earth-dusk sm:text-3xl">
                        Portfolio
                    </h2>
                    <p className="mt-1 text-sm text-olive-600">
                        {items.length
                            ? `Past work and projects from ${listing?.title || 'this provider'}.`
                            : `Portfolio pieces from ${listing?.title || 'this provider'} will appear here.`}
                    </p>
                </div>
                {items.length ? (
                    <p className="text-sm font-semibold text-olive-700">
                        {items.length} piece{items.length === 1 ? '' : 's'}
                    </p>
                ) : null}
            </div>

            {!items.length ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-olive-300 bg-white px-6 py-16 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-olive-50 text-olive-700">
                        <Images className="h-7 w-7" strokeWidth={1.75} />
                    </span>
                    <p className="mt-4 font-display text-lg font-semibold text-earth-dusk">
                        No portfolio yet
                    </p>
                    <p className="mt-1 max-w-sm text-sm text-olive-600">
                        This provider has not published portfolio work yet.
                        Check back soon or reach out via Contact info.
                    </p>
                </div>
            ) : (
                <>
                    <ul
                        id="portfolio-list"
                        className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {pageItems.map((piece) => (
                            <li
                                key={piece.id}
                                className="group flex w-full flex-col overflow-hidden rounded-2xl border border-olive-200/70 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
                            >
                                <div className="relative overflow-hidden bg-olive-100">
                                    {piece.images.length ? (
                                        <SwipeImageRail
                                            images={piece.images}
                                            alt={piece.title}
                                            onOpen={(imageIndex) =>
                                                openLightbox(piece, imageIndex)
                                            }
                                        />
                                    ) : (
                                        <div className="flex aspect-[4/3] items-center justify-center text-olive-400">
                                            <Images
                                                className="h-10 w-10"
                                                strokeWidth={1.5}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col gap-1.5 px-3.5 py-3.5">
                                    <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-earth-dusk sm:text-base">
                                        {piece.title}
                                    </h3>
                                    {piece.description ? (
                                        <p className="line-clamp-3 text-xs leading-relaxed text-olive-600 sm:text-sm">
                                            {piece.description}
                                        </p>
                                    ) : null}
                                    {piece.url ? (
                                        <a
                                            href={piece.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-olive-900 underline-offset-2 hover:underline dark:text-mustard"
                                        >
                                            View work
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    ) : null}
                                </div>
                            </li>
                        ))}
                    </ul>

                    {totalPages > 1 ? (
                        <div className="mt-8 flex flex-col items-center gap-3">
                            <nav
                                className="inline-flex items-center gap-1 rounded-xl border border-olive-200/80 bg-white p-1.5"
                                aria-label="Portfolio pagination"
                            >
                                <button
                                    type="button"
                                    disabled={safePage <= 1}
                                    onClick={() => goTo(safePage - 1)}
                                    className="inline-flex h-9 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-olive-700 transition hover:bg-olive-50 disabled:cursor-not-allowed disabled:opacity-35"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Prev
                                    </span>
                                </button>

                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1,
                                ).map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => goTo(n)}
                                        className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-semibold transition ${
                                            n === safePage
                                                ? 'bg-olive-800 text-white'
                                                : 'text-olive-700 hover:bg-olive-50'
                                        }`}
                                        aria-current={
                                            n === safePage ? 'page' : undefined
                                        }
                                    >
                                        {n}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    disabled={safePage >= totalPages}
                                    onClick={() => goTo(safePage + 1)}
                                    className="inline-flex h-9 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-olive-700 transition hover:bg-olive-50 disabled:cursor-not-allowed disabled:opacity-35"
                                    aria-label="Next page"
                                >
                                    <span className="hidden sm:inline">
                                        Next
                                    </span>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </nav>
                            <p className="text-xs font-medium text-olive-500">
                                Page {safePage} of {totalPages} · showing{' '}
                                {pageItems.length} of {items.length}
                            </p>
                        </div>
                    ) : null}
                </>
            )}

            {active ? (
                <GalleryLightbox
                    items={gallerySlides}
                    index={lightbox}
                    onClose={() => setLightbox(null)}
                    onIndexChange={setLightbox}
                    title={active.title}
                    meta={active.description || undefined}
                />
            ) : null}
        </div>
    );
}
