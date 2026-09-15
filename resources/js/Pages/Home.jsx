import { Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SiteLayout from '@/Layouts/SiteLayout';
import Logo from '@/Components/site/Logo';
import Reveal from '@/Components/site/Reveal';
import ListingCard from '@/Components/site/ListingCard';
import SectionHeading from '@/Components/site/SectionHeading';
import CategoryGrid from '@/Components/site/CategoryGrid';
import Newsletter from '@/Components/site/Newsletter';
import { useLocale } from '@/i18n/LocaleContext';
import {
    activities,
    featured,
    listings,
    recent,
    testimonials,
    trending,
} from '@/data/listings';

const HERO_IMAGE =
    'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?auto=format&fit=crop&w=2000&q=80';

const CTA_IMAGE =
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1800&q=80';

function HomeContent() {
    const { t } = useLocale();
    const reduce = useReducedMotion();

    return (
        <>
            {/* Hero — brand first, full-bleed */}
            <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pt-16">
                <div className="absolute inset-0">
                    <img
                        src={HERO_IMAGE}
                        alt="Mount Kenya highland landscape near Nanyuki"
                        className={`h-full w-full object-cover ${reduce ? '' : 'animate-ken-burns'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-earth-dusk/55 via-earth-dusk/35 to-earth-dusk/70" />
                    <div className="absolute inset-0 bg-grain opacity-40 mix-blend-overlay" />
                </div>

                <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-20 pt-10 text-center sm:px-6">
                    <motion.div
                        initial={reduce ? false : { opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <Logo variant="hero" className="justify-center" />
                    </motion.div>

                    <motion.p
                        initial={reduce ? false : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18, duration: 0.7 }}
                        className="mt-6 max-w-xl text-base text-white/85 sm:text-lg"
                    >
                        {t.hero.subtitle}
                    </motion.p>

                    <motion.div
                        initial={reduce ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.32, duration: 0.65 }}
                        className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
                    >
                        <a
                            href="#listings"
                            className="inline-flex items-center gap-2 rounded-full bg-mustard px-6 py-3 text-sm font-semibold text-olive-950 shadow-lg transition hover:bg-mustard-soft"
                        >
                            {t.hero.ctaExplore}
                            <ArrowRight className="h-4 w-4" />
                        </a>
                        <Link
                            href="/register"
                            className="inline-flex rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                        >
                            {t.hero.ctaAdd}
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    aria-hidden
                    className="absolute bottom-6 left-1/2 h-10 w-6 -translate-x-1/2 rounded-full border border-white/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <motion.span
                        className="mx-auto mt-2 block h-1.5 w-1.5 rounded-full bg-white"
                        animate={reduce ? {} : { y: [0, 12, 0], opacity: [1, 0.4, 1] }}
                        transition={{ repeat: Infinity, duration: 1.6 }}
                    />
                </motion.div>
            </section>

            {/* Featured trio */}
            <section className="relative z-10 -mt-8 bg-transparent pb-4 sm:-mt-12">
                <div className="mx-auto grid max-w-[1400px] gap-4 px-4 sm:grid-cols-3 sm:px-6">
                    {featured.map((item, i) => (
                        <Reveal key={item.id} delay={i * 0.08}>
                            <a
                                href={item.href}
                                className="group block overflow-hidden rounded-2xl shadow-lift"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-3 bg-olive-600 px-4 py-4 text-white">
                                    <h3 className="font-display text-sm font-semibold sm:text-base">
                                        {item.title}
                                    </h3>
                                    <span className="shrink-0 rounded-full bg-mustard px-3 py-1 text-xs font-bold text-olive-950">
                                        {t.featured.view}
                                    </span>
                                </div>
                            </a>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* Top rated */}
            <section id="listings" className="bg-olive-600 py-14 sm:py-20">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                    <Reveal>
                        <SectionHeading
                            light
                            eyebrow={t.topRated.eyebrow}
                            title={t.topRated.title}
                            subtitle={t.topRated.subtitle}
                        />
                    </Reveal>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {listings.map((listing, i) => (
                            <Reveal key={listing.id} delay={i * 0.05}>
                                <ListingCard listing={listing} featured />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <CategoryGrid />

            {/* Trending */}
            <section id="eat" className="bg-olive-800 py-14 sm:py-20">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                    <Reveal>
                        <SectionHeading
                            light
                            eyebrow={t.trending.eyebrow}
                            title={t.trending.title}
                            subtitle={t.trending.subtitle}
                        />
                    </Reveal>
                    <div className="grid gap-5 md:grid-cols-3">
                        {trending.map((listing, i) => (
                            <Reveal key={listing.id} delay={i * 0.08}>
                                <ListingCard listing={listing} featured />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA banner */}
            <section className="relative overflow-hidden py-20 sm:py-28">
                <img
                    src={CTA_IMAGE}
                    alt="Lodge terrace at night"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-earth-dusk/65" />
                <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
                    <Reveal>
                        <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
                            {t.cta.title}
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-sm text-white/80 sm:text-base">
                            {t.cta.body}
                        </p>
                        <a
                            href="#contact"
                            className="mt-8 inline-flex rounded-full bg-mint px-6 py-3 text-sm font-semibold text-olive-950 transition hover:bg-mint-soft"
                        >
                            {t.cta.button}
                        </a>
                    </Reveal>
                </div>
            </section>

            {/* Activities */}
            <section id="activities" className="bg-earth-sand py-14 sm:py-20">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                    <Reveal>
                        <SectionHeading
                            eyebrow={t.activities.eyebrow}
                            title={t.activities.title}
                            subtitle={t.activities.subtitle}
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
            <section id="stay" className="bg-white py-14 sm:py-20">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                    <Reveal>
                        <SectionHeading
                            eyebrow={t.recent.eyebrow}
                            title={t.recent.title}
                            subtitle={t.recent.subtitle}
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
            <section className="bg-earth-clay py-14 sm:py-20">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                    <Reveal>
                        <SectionHeading
                            light
                            eyebrow={t.testimonials.eyebrow}
                            title={t.testimonials.title}
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
                                            <p className="text-xs text-olive-600">{item.role}</p>
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
