import {
    ChevronLeft,
    ChevronRight,
    List,
    Map as MapIcon,
    SlidersHorizontal,
    Star,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ExploreCategoryTabs from '@/Components/site/ExploreCategoryTabs';
import ExploreMap from '@/Components/site/ExploreMap';
import ExploreSidebar from '@/Components/site/ExploreSidebar';
import ListingCard from '@/Components/site/ListingCard';
import SiteLayout from '@/Layouts/SiteLayout';
import { explorePath } from '@/data/categories';
import {
    allListings,
    enrichListing,
    filterListings,
    LOOK_LOCATIONS,
} from '@/data/listings';

const PAGE_SIZE = 12;
const MAX_PAGE_BUTTONS = 12;

const catalogue = allListings.map((item, index) =>
    enrichListing(item, index),
);

function syncUrl({ category, subcategory, q, location }) {
    const next = explorePath({
        category,
        subcategory,
        q,
        location: location || undefined,
    });
    const current = `${window.location.pathname}${window.location.search}`;
    if (current !== next) {
        window.history.replaceState({}, '', next);
    }
}

function ExploreContent({
    initialCategory = null,
    initialSubcategory = null,
    initialQuery = '',
    initialLocation = null,
}) {
    const [query, setQuery] = useState(initialQuery);
    const [location, setLocation] = useState(initialLocation);
    const [categoryKey, setCategoryKey] = useState(initialCategory);
    const [subcategory, setSubcategory] = useState(initialSubcategory);
    const [minRating, setMinRating] = useState(0);
    const [openNow, setOpenNow] = useState(false);
    const [activeId, setActiveId] = useState(null);
    const [mapOpen, setMapOpen] = useState(false);
    const [mobilePanel, setMobilePanel] = useState('list');
    const [page, setPage] = useState(1);

    useEffect(() => {
        setCategoryKey(initialCategory);
        setSubcategory(initialSubcategory);
        setQuery(initialQuery);
        setLocation(initialLocation);
    }, [initialCategory, initialSubcategory, initialQuery, initialLocation]);

    useEffect(() => {
        const handle = window.setTimeout(() => {
            syncUrl({
                category: categoryKey,
                subcategory,
                q: query.trim() || null,
                location,
            });
        }, 220);
        return () => window.clearTimeout(handle);
    }, [categoryKey, subcategory, query, location]);

    useEffect(() => {
        setPage(1);
    }, [categoryKey, subcategory, query, location, minRating, openNow]);

    const filtered = useMemo(() => {
        const items = filterListings(catalogue, {
            categoryKey,
            subcategory,
            query,
            location,
            minRating,
            openNow,
        });

        return [...items].sort(
            (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
        );
    }, [categoryKey, subcategory, query, location, minRating, openNow]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const start = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
    const end = Math.min(safePage * PAGE_SIZE, filtered.length);
    const pageItems = filtered.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE,
    );

    const clearFilters = () => {
        setQuery('');
        setLocation(null);
        setCategoryKey(null);
        setSubcategory(null);
        setMinRating(0);
        setOpenNow(false);
    };

    const applySearch = () => {
        setMobilePanel('list');
    };

    const handleCategoryChange = (key) => {
        setCategoryKey(key);
        setSubcategory(null);
    };

    const openMap = () => {
        setMapOpen(true);
        setMobilePanel('map');
    };

    const closeMap = () => {
        setMapOpen(false);
        setMobilePanel('list');
    };

    const sidebarProps = {
        query,
        onQueryChange: setQuery,
        location,
        onLocationChange: setLocation,
        locations: LOOK_LOCATIONS,
        categoryKey,
        onCategoryChange: handleCategoryChange,
        subcategory,
        onSubcategoryChange: setSubcategory,
        minRating,
        onMinRatingChange: setMinRating,
        openNow,
        onOpenNowChange: setOpenNow,
        onSearch: applySearch,
        onClear: clearFilters,
    };

    return (
        <div className="flex h-svh flex-col bg-[#f3f1ec] pt-[4.75rem] lg:pt-[5.25rem]">
            <ExploreCategoryTabs
                categoryKey={categoryKey}
                onCategoryChange={handleCategoryChange}
            />

            {/* Mobile toolbar */}
            <div className="flex shrink-0 items-center gap-2 border-b border-olive-200 bg-white px-3 py-2.5 lg:hidden">
                <button
                    type="button"
                    onClick={() =>
                        setMobilePanel((p) =>
                            p === 'filters' ? 'list' : 'filters',
                        )
                    }
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        mobilePanel === 'filters'
                            ? 'bg-olive-600 text-white'
                            : 'bg-[#f3f1ec] text-olive-800'
                    }`}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setMobilePanel('list');
                        setMapOpen(false);
                    }}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        mobilePanel === 'list'
                            ? 'bg-olive-600 text-white'
                            : 'bg-[#f3f1ec] text-olive-800'
                    }`}
                >
                    <List className="h-4 w-4" />
                    List
                </button>
                <button
                    type="button"
                    onClick={openMap}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        mobilePanel === 'map'
                            ? 'bg-olive-600 text-white'
                            : 'bg-[#f3f1ec] text-olive-800'
                    }`}
                >
                    <MapIcon className="h-4 w-4" />
                    Map
                </button>
            </div>

            <div className="relative flex min-h-0 flex-1">
                <ExploreSidebar
                    {...sidebarProps}
                    className="hidden w-[300px] shrink-0 xl:w-[320px] lg:flex"
                />

                {mobilePanel === 'filters' ? (
                    <div className="absolute inset-0 z-20 lg:hidden">
                        <ExploreSidebar
                            {...sidebarProps}
                            className="w-full"
                        />
                    </div>
                ) : null}

                <section
                    className={`min-w-0 flex-1 flex-col overflow-hidden transition-[flex,width] duration-300 ${
                        mobilePanel === 'list' || mobilePanel === 'filters'
                            ? 'flex'
                            : 'hidden lg:flex'
                    }`}
                >
                    <div className="relative flex shrink-0 items-center px-3 py-2.5 sm:px-4">
                        <button
                            type="button"
                            disabled={safePage <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-olive-200/80 bg-transparent text-olive-700 transition hover:border-olive-400 disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label="Previous page"
                            title="Previous page"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        <p className="pointer-events-none absolute inset-x-12 top-1/2 -translate-y-1/2 truncate text-center text-sm text-olive-700">
                            Showing{' '}
                            <span className="font-semibold text-earth-dusk">
                                {filtered.length === 0
                                    ? '0'
                                    : `${start}–${end}`}
                            </span>{' '}
                            out of{' '}
                            <span className="font-semibold text-earth-dusk">
                                {filtered.length}
                            </span>{' '}
                            results
                        </p>

                        <div className="relative z-10 ml-auto flex shrink-0 items-center gap-1.5">
                            <button
                                type="button"
                                disabled={safePage >= totalPages}
                                onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-olive-200/80 bg-transparent text-olive-700 transition hover:border-olive-400 disabled:cursor-not-allowed disabled:opacity-35"
                                aria-label="Next page"
                                title="Next page"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    mapOpen ? closeMap() : openMap()
                                }
                                className={`ml-1 flex h-9 w-9 items-center justify-center rounded-full border transition ${
                                    mapOpen
                                        ? 'border-mustard bg-mustard text-olive-950'
                                        : 'border-olive-200/80 bg-transparent text-olive-700 hover:border-olive-400'
                                }`}
                                aria-label={
                                    mapOpen ? 'Hide map' : 'Show map'
                                }
                                title={
                                    mapOpen
                                        ? 'Hide map'
                                        : 'Show listings on map'
                                }
                            >
                                <MapIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4">
                        {pageItems.length === 0 ? (
                            <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-olive-300 bg-white/70 px-6 text-center">
                                <Star className="mb-3 h-8 w-8 text-olive-300" />
                                <p className="font-display text-lg font-semibold text-earth-dusk">
                                    No listings match
                                </p>
                                <p className="mt-1 max-w-sm text-sm text-olive-600">
                                    Try another category, clear a filter, or
                                    search a different keyword.
                                </p>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-5 rounded-full bg-[#4f5a3e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-olive-800"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div
                                    className={`grid gap-4 ${
                                        mapOpen
                                            ? 'grid-cols-1'
                                            : 'sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3'
                                    }`}
                                >
                                    {pageItems.map((listing) => (
                                        <div
                                            key={listing.id}
                                            onMouseEnter={() =>
                                                setActiveId(listing.id)
                                            }
                                        >
                                            <ListingCard listing={listing} />
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 flex flex-col items-center gap-3 pb-6">
                                    <nav
                                        className="inline-flex items-center gap-1 rounded-2xl border border-olive-200/80 bg-white p-1.5 shadow-soft"
                                        aria-label="Pagination"
                                    >
                                        <button
                                            type="button"
                                            disabled={safePage <= 1}
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.max(1, p - 1),
                                                )
                                            }
                                            className="inline-flex h-9 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-olive-700 transition hover:bg-olive-50 disabled:cursor-not-allowed disabled:opacity-35"
                                            aria-label="Previous page"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            <span className="hidden sm:inline">
                                                Prev
                                            </span>
                                        </button>

                                        <div className="mx-0.5 h-5 w-px bg-olive-200" />

                                        {Array.from(
                                            {
                                                length: Math.min(
                                                    totalPages,
                                                    MAX_PAGE_BUTTONS,
                                                ),
                                            },
                                            (_, i) => i + 1,
                                        ).map((n) => {
                                            const active = n === safePage;
                                            return (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    onClick={() => setPage(n)}
                                                    className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                                                        active
                                                            ? 'bg-[#4f5a3e] text-white shadow-sm'
                                                            : 'text-earth-dusk hover:bg-olive-50'
                                                    }`}
                                                    aria-current={
                                                        active
                                                            ? 'page'
                                                            : undefined
                                                    }
                                                >
                                                    {n}
                                                </button>
                                            );
                                        })}

                                        <div className="mx-0.5 h-5 w-px bg-olive-200" />

                                        <button
                                            type="button"
                                            disabled={safePage >= totalPages}
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.min(
                                                        totalPages,
                                                        p + 1,
                                                    ),
                                                )
                                            }
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
                                        Page {safePage} of {totalPages}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* Map panel — opened by left arrow / map icon */}
                <div
                    className={`min-w-0 overflow-hidden border-l border-olive-200 bg-olive-100 transition-all duration-300 ease-out ${
                        mapOpen || mobilePanel === 'map'
                            ? mobilePanel === 'map'
                                ? 'absolute inset-0 z-10 block w-full lg:static lg:z-0 lg:w-[46%] xl:w-[48%]'
                                : 'hidden w-[46%] xl:w-[48%] lg:block'
                            : 'hidden w-0 border-l-0'
                    }`}
                >
                    <ExploreMap
                        listings={filtered}
                        activeId={activeId}
                        visible={mapOpen || mobilePanel === 'map'}
                        onClose={closeMap}
                        onSelect={(id) => {
                            setActiveId(id);
                            setMobilePanel('list');
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default function Explore({ category, subcategory, q, location }) {
    return (
        <SiteLayout title="Explore Nanyuki" hideFooter compactNav>
            <ExploreContent
                initialCategory={category || null}
                initialSubcategory={subcategory || null}
                initialQuery={q || ''}
                initialLocation={location || null}
            />
        </SiteLayout>
    );
}
