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
import {
    activities,
    featured,
    goldList,
    recent,
    testimonials,
    trending,
} from '@/data/listings';

const CTA_IMAGE = '/images/designed-for-you.webp';
const GOLD_PAGE_SIZE = 9;

function GoldListSection() {
    const [visible, setVisible] = useState(GOLD_PAGE_SIZE);
    const shown = useMemo(() => goldList.slice(0, visible), [visible]);
    const hasMore = visible < goldList.length;

    return (
        <section id="listings" className="bg-olive-600 py-14 sm:py-20">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                <Reveal>
                    <SectionHeading
                        light
                        eyebrow="Handpicked"
                        title="The Nanyuki Gold List"
                        subtitle="We've done the groundwork so you don't have to"
                    />
                </Reveal>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {shown.map((listing, i) => (
                        <Reveal key={listing.id} delay={(i % GOLD_PAGE_SIZE) * 0.04}>
                            <ListingCard listing={listing} featured />
                        </Reveal>
                    ))}
                </div>
                {hasMore ? (
                    <div className="mt-10 flex justify-center">
                        <button
                            type="button"
                            onClick={() =>
                                setVisible((n) =>
                                    Math.min(
                                        n + GOLD_PAGE_SIZE,
                                        goldList.length,
                                    ),
                                )
                            }
                            className="inline-flex rounded-full bg-mustard px-8 py-3.5 text-sm font-bold text-olive-950 shadow-lift transition hover:bg-white hover:text-mustard sm:px-10 sm:text-base"
                        >
                            Load more
                        </button>
                    </div>
                ) : null}
            </div>
        </section>
    );
}

function HomeContent() {
    return (
        <>
            <HeroSlider />

            <FeaturedMarquee items={featured} />

            <GoldListSection />

            <CategoryGrid />

            {/* Trending */}
            <section id="eat" className="bg-olive-800 py-14 sm:py-20">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                    <Reveal>
                        <SectionHeading
                            light
                            eyebrow="Buzz"
                            title="Trending now"
                            subtitle="What people are saving and sharing this week."
                        />
                    </Reveal>
                    <TrendingCarousel items={trending} />
                </div>
            </section>

            {/* CTA — pins in place; sections below scroll over it */}
            <section className="sticky top-0 z-0 flex h-[100svh] items-center justify-center overflow-hidden">
                <img
                    src={CTA_IMAGE}
                    alt="Highland stone home at dusk"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
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
                            className="mt-8 inline-flex rounded-full bg-mint px-10 py-4 text-base font-bold text-olive-950 shadow-lift transition hover:bg-mint-soft sm:px-12 sm:py-5 sm:text-lg"
                        >
                            Explore
                        </Link>
                    </Reveal>
                </div>
            </section>

            {/* Activities */}
            <section
                id="activities"
                className="relative z-10 bg-earth-sand py-14 sm:py-20"
            >
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                    <Reveal>
                        <SectionHeading
                            eyebrow="Outdoors"
                            title="Activities & adventures"
                            subtitle="Mount Kenya trails, ranch days, and sky-high views."
                        />
                    </Reveal>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {activities.map((listing, i) => (
                            <Reveal key={listing.id} delay={i * 0.06}>
                                <ListingCard listing={listing} />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recent */}
            <section
                id="stay"
                className="relative z-10 bg-white py-14 sm:py-20"
            >
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                    <Reveal>
                        <SectionHeading
                            eyebrow="Fresh"
                            title="Recently added"
                            subtitle="New spots joining the map."
                        />
                    </Reveal>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {recent.map((listing, i) => (
                            <Reveal key={listing.id} delay={i * 0.06}>
                                <ListingCard listing={listing} />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="relative z-10 bg-earth-clay py-14 sm:py-20">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                    <Reveal>
                        <SectionHeading
                            light
                            eyebrow="Voices"
                            title="Loved by the community"
                        />
                    </Reveal>
                    <div className="grid gap-5 md:grid-cols-3">
                        {testimonials.map((item, i) => (
                            <Reveal key={item.id} delay={i * 0.08}>
                                <blockquote className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-soft">
                                    <p className="flex-1 text-sm leading-relaxed text-olive-800 sm:text-base">
                                        “{item.quote}”
                                    </p>
                                    <footer className="mt-6 flex items-center gap-3">
                                        <img
                                            src={item.avatar}
                                            alt=""
                                            className="h-11 w-11 rounded-full object-cover"
                                            loading="lazy"
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
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <Newsletter />
        </>
    );
}

export default function Home() {
    return (
        <SiteLayout title="Your city, right now">
            <HomeContent />
        </SiteLayout>
    );
}
