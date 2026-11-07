import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
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
import { EmptyListingsMark } from '@/Components/site/Mark';
import { testimonials } from '@/data/listings';

const CTA_IMAGE = '/images/designed-for-you.webp';
const PAGE_SIZE = 9;

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
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
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

function ListingLoadMore({ onClick, light = false }) {
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
                Load more
            </button>
        </div>
    );
}

function GoldListSection({ items = [], title, subtitle }) {
    const [visible, setVisible] = useState(PAGE_SIZE);
    const shown = useMemo(() => items.slice(0, visible), [items, visible]);
    const hasMore = visible < items.length;

    return (
        <section id="listings" className="bg-olive-600 py-14 sm:py-20">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
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
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {shown.map((listing) => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    featured
                                />
                            ))}
                        </div>
                        {hasMore ? (
                            <ListingLoadMore
                                light
                                onClick={() =>
                                    setVisible((n) =>
                                        Math.min(n + PAGE_SIZE, items.length),
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

function AirbnbsSection({ items = [], title, subtitle }) {
    const [visible, setVisible] = useState(PAGE_SIZE);
    const shown = useMemo(() => items.slice(0, visible), [items, visible]);
    const hasMore = visible < items.length;

    return (
        <section
            id="airbnbs"
            className="relative z-10 bg-olive-700 py-14 sm:py-20"
        >
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                <Reveal>
                    <SectionHeading
                        light
                        title={title || 'Highland Airbnbs'}
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
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {shown.map((listing) => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                />
                            ))}
                        </div>
                        {hasMore ? (
                            <ListingLoadMore
                                light
                                onClick={() =>
                                    setVisible((n) =>
                                        Math.min(n + PAGE_SIZE, items.length),
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

function WildlifeSafarisSection({ items = [] }) {
    const [visible, setVisible] = useState(PAGE_SIZE);
    const shown = useMemo(() => items.slice(0, visible), [items, visible]);
    const hasMore = visible < items.length;

    return (
        <section
            id="wildlife"
            className="relative z-10 bg-earth-sand py-14 sm:py-20"
        >
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
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
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {shown.map((listing) => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                />
                            ))}
                        </div>
                        {hasMore ? (
                            <ListingLoadMore
                                onClick={() =>
                                    setVisible((n) =>
                                        Math.min(n + PAGE_SIZE, items.length),
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

function HomeContent({
    featured = [],
    trending,
    goldList,
    airbnbs,
    wildlifeSafaris,
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
                        ? 'relative z-10 bg-earth-sand py-16 sm:py-20 md:py-24'
                        : 'relative z-10 -mt-10 bg-earth-sand pb-16 pt-24 sm:-mt-14 sm:pb-20 sm:pt-28 md:pb-24 md:pt-32'
                }
            >
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                    <Reveal>
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="font-display text-3xl font-semibold tracking-tight text-earth-dusk sm:text-4xl md:text-[2.75rem] md:leading-tight">
                                Nanyuki Now
                            </h2>
                            <div
                                className="mx-auto mt-5 h-1 w-12 rounded-full bg-mustard"
                                aria-hidden
                            />
                            <p className="mt-6 text-base leading-relaxed text-olive-700/90 sm:mt-8 sm:text-lg sm:leading-8 md:text-xl md:leading-9">
                                Nanyuki Now is a local discovery platform
                                designed to showcase the very best of Nanyuki
                                and the surrounding towns. From great places to
                                eat and stay, to unique experiences, services,
                                and events worth knowing about, we bring
                                everything in one trusted space.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {goldList === undefined ? (
                <section className="bg-olive-600 py-14 sm:py-20">
                    <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
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

            <section id="eat" className="bg-olive-800 py-14 sm:py-20">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
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

            {wildlifeSafaris === undefined ? (
                <section className="relative z-10 bg-earth-sand py-14 sm:py-20">
                    <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
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

            <StoriesSection />

            {airbnbs === undefined ? (
                <section className="relative z-10 bg-olive-700 py-14 sm:py-20">
                    <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                        <SectionHeading
                            light
                            title="Highland Airbnbs"
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

            <section className="relative z-10 bg-earth-clay py-14 sm:py-20">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                    <Reveal>
                        <SectionHeading
                            light
                            title="Loved by the community"
                        />
                    </Reveal>
                    <div className="grid gap-5 md:grid-cols-3">
                        {testimonials.map((item) => (
                            <blockquote
                                key={item.id}
                                className="flex h-full flex-col border border-white/15 bg-white/95 p-6"
                            >
                                <p className="flex-1 text-sm leading-relaxed text-olive-800 sm:text-base">
                                    “{item.quote}”
                                </p>
                                <footer className="mt-6 flex items-center gap-3">
                                    <img
                                        src={item.avatar}
                                        alt=""
                                        className="h-11 w-11 rounded-full object-cover"
                                        loading="lazy"
                                        decoding="async"
                                        width={44}
                                        height={44}
                                    />
                                    <div>
                                        <cite className="not-italic font-display text-sm font-semibold text-earth-dusk">
                                            {item.name}
                                        </cite>
                                        <p className="text-xs text-olive-600">
                                            {item.role}
                                        </p>
                                    </div>
                                </footer>
                            </blockquote>
                        ))}
                    </div>
                </div>
            </section>

            <Newsletter />
        </>
    );
}

export default function Home({
    featured = [],
    trending,
    goldList,
    airbnbs,
    wildlifeSafaris,
    page = null,
}) {
    return (
        <SiteLayout title={page?.meta_title || 'Your city, right now'}>
            <HomeContent
                featured={featured}
                trending={trending}
                goldList={goldList}
                airbnbs={airbnbs}
                wildlifeSafaris={wildlifeSafaris}
                pageContent={page?.content || {}}
            />
        </SiteLayout>
    );
}
