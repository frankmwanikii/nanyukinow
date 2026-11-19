import { useEffect, useMemo, useState } from 'react';
import ExploreCategoryTabs from '@/Components/site/ExploreCategoryTabs';
import ExploreMap from '@/Components/site/ExploreMap';
import ExploreSidebar from '@/Components/site/ExploreSidebar';
import ListingCard from '@/Components/site/ListingCard';
import {
    BackMark,
    EmptyListingsMark,
    FiltersMark,
    ForwardMark,
    MapMark,
} from '@/Components/site/Mark';
import Pagination from '@/Components/site/Pagination';
import SiteLayout from '@/Layouts/SiteLayout';
import { explorePath } from '@/data/categories';
import {
    enrichListing,
    filterListings,
    LOOK_LOCATIONS,
} from '@/data/listings';

const PAGE_SIZE = 12;

function syncUrl({ category, subcategory, propertyType, q, location }) {
    const next = explorePath({
        category,
        subcategory,
        propertyType,
        q,
        location: location || undefined,
    });
    const current = `${window.location.pathname}${window.location.search}`;
    if (current !== next) {
        window.history.replaceState({}, '', next);
    }
}

function ExploreContent({
    catalogue = [],
    initialCategory = null,
    initialSubcategory = null,
    initialPropertyType = null,
    initialQuery = '',
    initialLocation = null,
    locations = LOOK_LOCATIONS,
    sitePage = null,
}) {
    const [query, setQuery] = useState(initialQuery);
    const [location, setLocation] = useState(initialLocation);
    const [categoryKey, setCategoryKey] = useState(initialCategory);
    const [subcategory, setSubcategory] = useState(initialSubcategory);
    const [propertyType, setPropertyType] = useState(initialPropertyType);
    const [minRating, setMinRating] = useState(0);
    const [openNow, setOpenNow] = useState(false);
    const [activeId, setActiveId] = useState(null);
    const [mapOpen, setMapOpen] = useState(false);
    const [mobilePanel, setMobilePanel] = useState('list');
    const [page, setPage] = useState(1);

    useEffect(() => {
        setCategoryKey(initialCategory);
        setSubcategory(initialSubcategory);
        setPropertyType(initialPropertyType);
        setQuery(initialQuery);
        setLocation(initialLocation);
    }, [
        initialCategory,
        initialSubcategory,
        initialPropertyType,
        initialQuery,
        initialLocation,
    ]);

    useEffect(() => {
        syncUrl({
            category: categoryKey,
            subcategory,
            propertyType,
            q: query.trim() || null,
            location,
        });
    }, [categoryKey, subcategory, propertyType, location]);

    useEffect(() => {
        const handle = window.setTimeout(() => {
            syncUrl({
                category: categoryKey,
                subcategory,
                propertyType,
                q: query.trim() || null,
                location,
            });
        }, 220);
        return () => window.clearTimeout(handle);
    }, [query]);

    useEffect(() => {
        setPage(1);
    }, [categoryKey, subcategory, propertyType, query, location, minRating, openNow]);

    const filtered = useMemo(() => {
        const items = filterListings(catalogue, {
            categoryKey,
            subcategory,
            propertyType,
            query,
            location,
            minRating,
            openNow,
        }).map((item, index) => enrichListing(item, index));

        return [...items].sort(
            (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
        );
    }, [catalogue, categoryKey, subcategory, propertyType, query, location, minRating, openNow]);

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
        setPropertyType(null);
        setMinRating(0);
        setOpenNow(false);
    };

    const applySearch = () => {
        setMobilePanel('list');
    };

    const handleCategoryChange = (key) => {
        setCategoryKey(key);
        setSubcategory(null);
        setPropertyType(null);
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
        locations: locations?.length ? locations : LOOK_LOCATIONS,
        categoryKey,
        onCategoryChange: handleCategoryChange,
        subcategory,
        onSubcategoryChange: setSubcategory,
        propertyType,
        onPropertyTypeChange: setPropertyType,
        minRating,
        onMinRatingChange: setMinRating,
        openNow,
        onOpenNowChange: setOpenNow,
        onSearch: applySearch,
        onClear: clearFilters,
    };

    return (
        <div className="flex h-svh flex-col bg-[#f3f1ec] pb-[5.25rem] lg:pb-0">
            <div className="shrink-0 bg-white pt-[5.75rem] sm:pt-[6.25rem] lg:pt-[6.75rem]">
                <ExploreCategoryTabs
                    categoryKey={categoryKey}
                    onCategoryChange={handleCategoryChange}
                />
            </div>

            {/* Mobile toolbar — filters only; map lives top-right on the results bar */}
            <div className="flex shrink-0 items-center border-b border-olive-200 bg-white px-3 py-2.5 lg:hidden">
                <button
                    type="button"
                    onClick={() =>
                        setMobilePanel((p) =>
                            p === 'filters' ? 'list' : 'filters',
                        )
                    }
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                        mobilePanel === 'filters'
                            ? 'bg-olive-600 text-white'
                            : 'bg-[#f3f1ec] text-olive-800'
                    }`}
                >
                    <FiltersMark className="h-4 w-4" />
                    Filters
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
                    <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2.5 sm:px-4">
                        <div className="flex justify-start">
                            <button
                                type="button"
                                disabled={safePage <= 1}
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-olive-200/80 bg-transparent text-olive-700 transition hover:border-olive-400 disabled:cursor-not-allowed disabled:opacity-35"
                                aria-label="Previous page"
                                title="Previous page"
                            >
                                <BackMark className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="truncate text-center text-sm text-olive-700">
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

                        <div className="flex items-center justify-end gap-1.5">
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
                                <ForwardMark className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    mapOpen ? closeMap() : openMap()
                                }
                                className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
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
                                <MapMark className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4">
                        {pageItems.length === 0 ? (
                            <div className="flex h-full min-h-[240px] flex-col items-center justify-center border border-dashed border-olive-300 bg-white/70 px-6 text-center">
                                <EmptyListingsMark className="mx-auto h-12 w-12 text-earth-dusk sm:h-14 sm:w-14" />
                                <p className="mt-3 font-display text-xl font-semibold tracking-tight text-earth-dusk sm:text-2xl">
                                    {sitePage?.content?.empty_title ||
                                        'Nothing here yet!'}
                                </p>
                                <p className="mt-2 max-w-sm text-sm leading-relaxed text-olive-600 sm:text-base">
                                    {sitePage?.content?.empty_body ||
                                        'Try another category, clear filters, or check back soon for new listings.'}
                                </p>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-5 min-h-11 rounded-md bg-olive-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950"
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
                                            : 'sm:grid-cols-2 lg:grid-cols-3'
                                    }`}
                                >
                                    {pageItems.map((listing) => (
                                        <div
                                            key={listing.id}
                                            className="min-w-0"
                                            onMouseEnter={() =>
                                                setActiveId(listing.id)
                                            }
                                        >
                                            <ListingCard listing={listing} />
                                        </div>
                                    ))}
                                </div>

                                <Pagination
                                    className="mt-8 pb-6"
                                    page={safePage}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                />
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

function ExploreListingsSkeleton() {
    return (
        <div
            className="flex h-svh flex-col bg-[#f3f1ec] pb-[5.25rem] lg:pb-0"
            aria-busy="true"
            aria-label="Loading listings"
        >
            <div className="shrink-0 bg-white pt-[5.75rem] sm:pt-[6.25rem] lg:pt-[6.75rem]">
                <div className="flex gap-2 overflow-hidden px-4 py-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-9 w-24 shrink-0 animate-pulse bg-olive-900/10"
                        />
                    ))}
                </div>
            </div>
            <div className="relative flex min-h-0 flex-1">
                <div className="hidden w-[300px] shrink-0 border-r border-olive-200 bg-white p-4 xl:w-[320px] lg:block">
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-10 animate-pulse bg-olive-900/10"
                            />
                        ))}
                    </div>
                </div>
                <div className="min-w-0 flex-1 overflow-hidden p-4">
                    <div className="mb-4 h-5 w-48 animate-pulse bg-olive-900/10" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="overflow-hidden border border-olive-900/10 bg-white"
                            >
                                <div className="aspect-[4/3] animate-pulse bg-olive-900/10" />
                                <div className="space-y-2 p-3">
                                    <div className="h-4 w-3/4 animate-pulse bg-olive-900/10" />
                                    <div className="h-3 w-1/2 animate-pulse bg-olive-900/10" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Explore({
    listings,
    locations = LOOK_LOCATIONS,
    category,
    subcategory,
    propertyType,
    q,
    location,
    page = null,
}) {
    const loading = listings === undefined;
    const catalogue = useMemo(
        () =>
            loading
                ? []
                : (listings || []).map((item, index) =>
                      enrichListing(item, index),
                  ),
        [listings, loading],
    );

    return (
        <SiteLayout
            title={page?.meta_title || 'Explore Nanyuki'}
            hideFooter
            compactNav
            lockViewport
        >
            {loading ? (
                <ExploreListingsSkeleton />
            ) : (
                <ExploreContent
                    catalogue={catalogue}
                    initialCategory={category || null}
                    initialSubcategory={subcategory || null}
                    initialPropertyType={propertyType || null}
                    initialQuery={q || ''}
                    initialLocation={location || null}
                    locations={locations}
                    sitePage={page}
                />
            )}
        </SiteLayout>
    );
}
