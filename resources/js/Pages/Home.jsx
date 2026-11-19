import { Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';
import Reveal from '@/Components/site/Reveal';
import ListingCard from '@/Components/site/ListingCard';
import SectionHeading from '@/Components/site/SectionHeading';
import CategoryGrid from '@/Components/site/CategoryGrid';
import Newsletter from '@/Components/site/Newsletter';
import HeroSlider from '@/Components/site/HeroSlider';
import FeaturedMarquee from '@/Components/site/FeaturedMarquee';
import TrendingCarousel from '@/Components/site/TrendingCarousel';
import StoriesSection from '@/Components/site/StoriesSection';
import { EmptyListingsMark, SendArrowMark } from '@/Components/site/Mark';
import { explorePath } from '@/data/categories';

const CTA_IMAGE = '/images/designed-for-you.webp';
/** Mobile / laptop (1–3 cols): 6 cards. XL desktop (4 cols): 2 full rows = 8. */
const GOLD_LIST_MOBILE_PAGE_SIZE = 6;
const GOLD_LIST_DESKTOP_PAGE_SIZE = 8;

/**
 * Two full rows for the shared listing grid:
 * 1 / 2 / 3 / 4 cols → 2 / 4 / 6 / 8 cards.
 */
function twoRowPageSizeForWidth() {
    if (window.matchMedia('(min-width: 1280px)').matches) {
        return 8;
    }
    if (window.matchMedia('(min-width: 1024px)').matches) {
        return 6;
    }
    if (window.matchMedia('(min-width: 640px)').matches) {
        return 4;
    }

    return 2;
}

function useGoldListPageSize() {
    const [pageSize, setPageSize] = useState(GOLD_LIST_MOBILE_PAGE_SIZE);

    useEffect(() => {
        const media = window.matchMedia('(min-width: 1280px)');
        const sync = () =>
            setPageSize(
                media.matches
                    ? GOLD_LIST_DESKTOP_PAGE_SIZE
                    : GOLD_LIST_MOBILE_PAGE_SIZE,
            );

        sync();
        media.addEventListener('change', sync);

        return () => media.removeEventListener('change', sync);
    }, []);

    return pageSize;
}

function useTwoRowPageSize() {
    const [pageSize, setPageSize] = useState(2);

    useEffect(() => {
        const sync = () => setPageSize(twoRowPageSizeForWidth());
        const queries = [
            window.matchMedia('(min-width: 640px)'),
            window.matchMedia('(min-width: 1024px)'),
            window.matchMedia('(min-width: 1280px)'),
        ];

        sync();
        queries.forEach((media) => media.addEventListener('change', sync));

        return () =>
            queries.forEach((media) =>
                media.removeEventListener('change', sync),
            );
    }, []);

    return pageSize;
}

function ListingsSoonPlaceholder({ light = false }) {
    return (
        <div className="mx-auto max-w-md py-10 text-center sm:py-14">
            <EmptyListingsMark
                className={`mx-auto h-12 w-12 sm:h-14 sm:w-14 ${
                    light ? 'text-white/85' : 'text-earth-dusk'
                }`}
            />
            <p
                className={`mt-3 font-display text-xl font-semibold tracking-tight sm:text-2xl ${
                    light ? 'text-white' : 'text-earth-dusk'
                }`}
            >
                Nothing here yet!
            </p>
        </div>
    );
}

function ListingGridSkeleton({ light = false }) {
    const tone = light ? 'bg-white/10' : 'bg-olive-900/10';

    return (
        <div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            aria-hidden="true"
        >
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className={`overflow-hidden rounded-xl ${tone} animate-pulse`}
                >
                    <div className="aspect-[4/3]" />
                    <div className="h-14" />
                </div>
            ))}
        </div>
    );
}

function ListingSeeMore({ onClick, light = false }) {
    return (
        <div className="mt-10 flex justify-center">
            <button
                type="button"
                onClick={onClick}
                className={
                    light
                        ? 'inline-flex min-h-11 items-center rounded-md bg-mustard px-8 py-3 text-sm font-semibold text-olive-950 transition hover:bg-white hover:text-mustard sm:px-10 sm:text-base'
                        : 'inline-flex min-h-11 items-center rounded-md bg-olive-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950 sm:px-10 sm:text-base'
                }
            >
                See more
            </button>
        </div>
    );
}

function ListingSeeAll({ href, light = false }) {
    return (
        <div className="mt-10 flex justify-center">
            <Link
                href={href}
                prefetch
                className={
                    light
                        ? 'inline-flex min-h-11 items-center gap-2 rounded-md border border-white/25 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition hover:border-mustard hover:bg-mustard hover:text-olive-950 sm:px-8'
                        : 'inline-flex min-h-11 items-center gap-2 rounded-md border border-olive-900/15 bg-olive-600 px-7 py-3 text-sm font-semibold text-white transition hover:border-mustard hover:bg-mustard hover:text-olive-950 sm:px-8'
                }
            >
                See all
                <SendArrowMark className="h-4 w-4" />
            </Link>
        </div>
    );
}

function GoldListSection({ items = [], title, subtitle }) {
    const pageSize = useGoldListPageSize();
    const [visible, setVisible] = useState(pageSize);
    const shown = useMemo(() => items.slice(0, visible), [items, visible]);
    const hasMore = visible < items.length;

    useEffect(() => {
        setVisible((current) => Math.max(current, pageSize));
    }, [pageSize]);

    return (
        <section id="listings" className="bg-olive-600 py-14 sm:py-20">
            <div className="mx-auto max-w-site px-4 sm:px-6">
                <Reveal>
                    <SectionHeading
                        light
                        title={title || 'The Nanyuki Gold List'}
                        subtitle={
                            subtitle ||
                            "We've done the groundwork so you don't have to"
                        }
                    />
                </Reveal>
                {items.length === 0 ? (
                    <ListingsSoonPlaceholder light />
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                            {shown.map((listing) => (
                                <div key={listing.id} className="min-w-0">
                                    <ListingCard
                                        listing={listing}
                                        featured
                                    />
                                </div>
                            ))}
                        </div>
                        {hasMore ? (
                            <ListingSeeMore
                                light
                                onClick={() =>
                                    setVisible((n) =>
                                        Math.min(n + pageSize, items.length),
                                    )
                                }
                            />
                        ) : null}
                    </>
                )}
            </div>
        </section>
    );
}

function PlacesToEatSection({ items = [] }) {
    const pageSize = useTwoRowPageSize();
    const shown = useMemo(
        () => items.slice(0, pageSize),
        [items, pageSize],
    );

    return (
        <section
            id="eat"
            className="relative z-10 bg-earth-sand py-14 sm:py-20"
        >
            <div className="mx-auto max-w-site px-4 sm:px-6">
                <Reveal>
                    <SectionHeading
                        title="Places to Eat"
                        subtitle="Cafés, restaurants, and bars across Nanyuki and nearby."
                    />
                </Reveal>
                {items.length === 0 ? (
                    <ListingsSoonPlaceholder />
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                            {shown.map((listing) => (
                                <div key={listing.id} className="min-w-0">
                                    <ListingCard listing={listing} />
                                </div>
                            ))}
                        </div>
                        <ListingSeeAll
                            href={explorePath({ category: 'eatDrink' })}
                        />
                    </>
                )}
            </div>
        </section>
    );
}

function AirbnbsSection({ items = [], title, subtitle }) {
    const pageSize = useTwoRowPageSize();
    const shown = useMemo(
        () => items.slice(0, pageSize),
        [items, pageSize],
    );

    return (
        <section
            id="airbnbs"
            className="relative z-10 bg-olive-700 py-14 sm:py-20"
        >
            <div className="mx-auto max-w-site px-4 sm:px-6">
                <Reveal>
                    <SectionHeading
                        light
                        title={title || 'Highland Stays'}
                        subtitle={
                            subtitle ||
                            'Homes with character across Nanyuki, Timau, and Naromoru.'
                        }
                    />
                </Reveal>
                {items.length === 0 ? (
                    <ListingsSoonPlaceholder light />
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                            {shown.map((listing) => (
                                <div key={listing.id} className="min-w-0">
                                    <ListingCard listing={listing} />
                                </div>
                            ))}
                        </div>
                        <ListingSeeAll
                            light
                            href={explorePath({ category: 'stay' })}
                        />
                    </>
                )}
            </div>
        </section>
    );
}

function WildlifeSafarisSection({ items = [] }) {
    const pageSize = useTwoRowPageSize();
    const shown = useMemo(
        () => items.slice(0, pageSize),
        [items, pageSize],
    );

    return (
        <section
            id="wildlife"
            className="relative z-10 bg-earth-sand py-14 sm:py-20"
        >
            <div className="mx-auto max-w-site px-4 sm:px-6">
                <Reveal>
                    <SectionHeading
                        title="Wildlife Safaris"
                        subtitle="Seeking untamed adventures?"
                    />
                </Reveal>
                {items.length === 0 ? (
                    <ListingsSoonPlaceholder />
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                            {shown.map((listing) => (
                                <div key={listing.id} className="min-w-0">
                                    <ListingCard listing={listing} />
                                </div>
                            ))}
                        </div>
                        <ListingSeeAll
                            href={explorePath({ category: 'thingsToDo' })}
                        />
                    </>
                )}
            </div>
        </section>
    );
}

function EventsSection({ items = [] }) {
    const pageSize = useTwoRowPageSize();
    const shown = useMemo(
        () => items.slice(0, pageSize),
        [items, pageSize],
    );

    return (
        <section
            id="events"
            className="relative z-10 bg-olive-700 py-14 sm:py-20"
        >
            <div className="mx-auto max-w-site px-4 sm:px-6">
                <Reveal>
                    <SectionHeading
                        light
                        title="Events"
                        subtitle="Concerts, dinners, and days out around Nanyuki."
                    />
                </Reveal>
                {items.length === 0 ? (
                    <ListingsSoonPlaceholder light />
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                            {shown.map((listing) => (
                                <div key={listing.id} className="min-w-0">
                                    <ListingCard listing={listing} />
                                </div>
                            ))}
                        </div>
                        <ListingSeeAll
                            light
                            href={explorePath({ category: 'events' })}
                        />
                    </>
                )}
            </div>
        </section>
    );
}

function HomeContent({
    featured = [],
    trending,
    goldList,
    placesToEat,
    airbnbs,
    wildlifeSafaris,
    events,
    pageContent = {},
}) {
    const hasPromoted = featured.length > 0;

    return (
        <>
            <HeroSlider />

            <FeaturedMarquee items={featured} />

            <section
                id="about"
                className={
                    hasPromoted
                        ? 'relative z-10 bg-earth-sand py-10 sm:py-16 md:py-24'
                        : 'relative z-10 -mt-10 bg-earth-sand pb-10 pt-20 sm:-mt-14 sm:pb-16 sm:pt-28 md:pb-24 md:pt-32'
                }
            >
                <div className="mx-auto max-w-site px-4 sm:px-6">
                    <Reveal>
                        <div className="mx-auto max-w-xl text-center sm:max-w-2xl md:max-w-3xl">
                            <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-earth-dusk sm:text-4xl md:text-[2.75rem] md:leading-tight">
                                Nanyuki Now
                            </h2>
                            <div
                                className="mx-auto mt-4 h-1 w-12 rounded-full bg-mustard sm:mt-5"
                                aria-hidden
                            />
                            <p className="mx-auto mt-5 max-w-md text-pretty text-base leading-relaxed text-olive-700/90 sm:mt-7 sm:max-w-xl sm:text-lg sm:leading-8 md:max-w-2xl md:text-xl md:leading-9">
                                The best of Nanyuki and nearby towns. Places to
                                eat and stay, experiences, services, and events,
                                all in one trusted space.
                            </p>
                            <Link
                                href="/explore"
                                prefetch
                                className="mt-7 inline-flex min-h-11 items-center rounded-md bg-olive-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950 sm:mt-8 sm:px-8 sm:text-base"
                            >
                                Explore Nanyuki
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>

            {goldList === undefined ? (
                <section className="bg-olive-600 py-14 sm:py-20">
                    <div className="mx-auto max-w-site px-4 sm:px-6">
                        <SectionHeading
                            light
                            title="The Nanyuki Gold List"
                            subtitle="We've done the groundwork so you don't have to"
                        />
                        <ListingGridSkeleton light />
                    </div>
                </section>
            ) : (
                <GoldListSection
                    items={goldList}
                    title={pageContent.gold_list_title}
                    subtitle={pageContent.gold_list_subtitle}
                />
            )}

            <CategoryGrid />

            <section id="trending" className="bg-olive-800 py-14 sm:py-20">
                <div className="mx-auto max-w-site px-4 sm:px-6">
                    <Reveal>
                        <SectionHeading
                            light
                            title="Trending now"
                            subtitle="What people are saving and sharing this week."
                        />
                    </Reveal>
                    {trending === undefined ? (
                        <ListingGridSkeleton light />
                    ) : trending.length === 0 ? (
                        <ListingsSoonPlaceholder light />
                    ) : (
                        <TrendingCarousel items={trending} />
                    )}
                </div>
            </section>

            <section className="sticky top-0 z-0 flex h-[100svh] items-center justify-center overflow-hidden">
                <img
                    src={CTA_IMAGE}
                    alt="Highland stone home at dusk"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                />
                <div className="absolute inset-0 bg-earth-dusk/65" />
                <div className="relative z-10 px-4 text-center sm:px-6">
                    <Reveal>
                        <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
                            Designed for you
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-sm text-white/80 sm:text-base">
                            Whether you are planning a weekend or growing a
                            local business, Nanyuki Now keeps the city at your
                            fingertips.
                        </p>
                        <Link
                            href="/explore"
                            prefetch
                            className="mt-8 inline-flex min-h-11 items-center rounded-md bg-mint px-10 py-3.5 text-base font-semibold text-olive-950 transition hover:bg-mint-soft sm:px-12 sm:text-lg"
                        >
                            Explore
                        </Link>
                    </Reveal>
                </div>
            </section>

            {placesToEat === undefined ? (
                <section className="relative z-10 bg-earth-sand py-14 sm:py-20">
                    <div className="mx-auto max-w-site px-4 sm:px-6">
                        <SectionHeading
                            title="Places to Eat"
                            subtitle="Cafés, restaurants, and bars across Nanyuki and nearby."
                        />
                        <ListingGridSkeleton />
                    </div>
                </section>
            ) : (
                <PlacesToEatSection items={placesToEat} />
            )}

            {airbnbs === undefined ? (
                <section className="relative z-10 bg-olive-700 py-14 sm:py-20">
                    <div className="mx-auto max-w-site px-4 sm:px-6">
                        <SectionHeading
                            light
                            title="Highland Stays"
                            subtitle="Homes with character across Nanyuki, Timau, and Naromoru."
                        />
                        <ListingGridSkeleton light />
                    </div>
                </section>
            ) : (
                <AirbnbsSection
                    items={airbnbs}
                    title={pageContent.airbnbs_title}
                    subtitle={pageContent.airbnbs_subtitle}
                />
            )}

            {wildlifeSafaris === undefined ? (
                <section className="relative z-10 bg-earth-sand py-14 sm:py-20">
                    <div className="mx-auto max-w-site px-4 sm:px-6">
                        <SectionHeading
                            title="Wildlife Safaris"
                            subtitle="Seeking untamed adventures?"
                        />
                        <ListingGridSkeleton />
                    </div>
                </section>
            ) : (
                <WildlifeSafarisSection items={wildlifeSafaris} />
            )}

            {events === undefined ? (
                <section className="relative z-10 bg-olive-700 py-14 sm:py-20">
                    <div className="mx-auto max-w-site px-4 sm:px-6">
                        <SectionHeading
                            light
                            title="Events"
                            subtitle="Concerts, dinners, and days out around Nanyuki."
                        />
                        <ListingGridSkeleton light />
                    </div>
                </section>
            ) : (
                <EventsSection items={events} />
            )}

            <StoriesSection />

            <Newsletter />
        </>
    );
}

export default function Home({
    featured = [],
    trending,
    goldList,
    placesToEat,
    airbnbs,
    wildlifeSafaris,
    events,
    page = null,
}) {
    return (
        <SiteLayout title={page?.meta_title || 'Your city, right now'}>
            <HomeContent
                featured={featured}
                trending={trending}
                goldList={goldList}
                placesToEat={placesToEat}
                airbnbs={airbnbs}
                wildlifeSafaris={wildlifeSafaris}
                events={events}
                pageContent={page?.content || {}}
            />
        </SiteLayout>
    );
}
