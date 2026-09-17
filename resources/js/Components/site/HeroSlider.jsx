import { Link } from '@inertiajs/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const SLIDES = [
    {
        id: 1,
        image: '/images/hero/slide_1.jpeg',
        imageMobile: '/images/hero/slide_1_mobile.jpg',
        alt: 'Nanyuki Now — Mount Kenya, wildlife, and town life',
        layout: 'brand',
        overlay: 'from-earth-dusk/15 via-transparent to-earth-dusk/40',
    },
    {
        id: 2,
        image: '/images/hero/slide-2.webp',
        imageMobile: '/images/hero/slide_2_mobile.jpg',
        alt: 'Black rhinos on the Laikipia plains near Nanyuki',
        layout: 'safari',
        overlay: 'from-black/65 via-black/45 to-black/55',
        eyebrow: 'Your Ultimate Safari guide',
        titleLead: "Discover Nanyuki's",
        titleAccent: 'Wild side',
        cta: 'Start exploring',
        ctaHref: '/explore?category=thingsToDo',
    },
    {
        id: 3,
        image: '/images/hero/bnb3.webp',
        alt: 'A-frame cabin stay in Nanyuki at dusk',
        layout: 'safari',
        contentVariant: 'stay',
        overlay: 'from-black/65 via-black/45 to-black/55',
        eyebrow: 'Your Home Away From Home',
        titleLead: 'Unwind in the Heart Of Nanyuki',
        titleAccent: 'Stay. Relax. Explore',
        cta: 'Check in',
        ctaHref: '/explore?category=stay',
    },
    {
        id: 4,
        image: '/images/hero/slide_4.webp',
        alt: 'Dining with a view of Mount Kenya at dusk',
        layout: 'safari',
        overlay: 'from-black/65 via-black/45 to-black/60',
        eyebrow: 'A Taste of the Equator',
        eyebrowClass: 'uppercase tracking-[0.14em] sm:tracking-[0.18em]',
        titleLead: "Nanyuki's Finest Flavors",
        titleAccent: 'Redefined',
        cta: 'See more',
        ctaHref: '/explore?category=eatDrink',
    },
];

const INTERVAL_MS = 6500;
const REVEAL_MS = 0.95;

export default function HeroSlider() {
    const reduce = useReducedMotion();
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const directionRef = useRef(1);

    const step = useCallback((delta) => {
        directionRef.current = delta >= 0 ? 1 : -1;
        setIndex((prev) => (prev + delta + SLIDES.length) % SLIDES.length);
    }, []);

    useEffect(() => {
        if (reduce || paused) return undefined;
        const id = window.setInterval(() => step(1), INTERVAL_MS);
        return () => window.clearInterval(id);
    }, [step, paused, reduce, index]);

    const slide = SLIDES[index];
    const isBrand = slide.layout === 'brand';
    const direction = directionRef.current;

    return (
        <section
            className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#1c1712] pt-20 sm:pt-16"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            aria-roledescription="carousel"
            aria-label="Nanyuki Now highlights"
        >
            {/* Incoming slide fades in over a still current slide — no exit fade. */}
            <AnimatePresence initial={false}>
                <motion.div
                    key={slide.id}
                    className="absolute inset-0 overflow-hidden bg-[#1c1712]"
                    initial={
                        reduce
                            ? false
                            : {
                                  opacity: 0,
                                  scale: 1.045,
                                  x: direction * 28,
                              }
                    }
                    animate={{
                        opacity: 1,
                        scale: 1,
                        x: 0,
                    }}
                    exit={{
                        opacity: 1,
                        scale: 1,
                        x: 0,
                    }}
                    transition={
                        reduce
                            ? { duration: 0 }
                            : {
                                  opacity: {
                                      duration: REVEAL_MS,
                                      ease: [0.22, 1, 0.36, 1],
                                  },
                                  scale: {
                                      duration: REVEAL_MS,
                                      ease: [0.22, 1, 0.36, 1],
                                  },
                                  x: {
                                      duration: REVEAL_MS,
                                      ease: [0.22, 1, 0.36, 1],
                                  },
                              }
                    }
                    style={{ zIndex: 1 }}
                >
                    <picture>
                        {slide.imageMobile ? (
                            <source
                                media="(max-width: 639px)"
                                srcSet={slide.imageMobile}
                            />
                        ) : null}
                        <img
                            src={slide.image}
                            alt={slide.alt}
                            className={`h-full w-full object-cover object-center will-change-transform ${
                                reduce || isBrand
                                    ? ''
                                    : 'animate-ken-burns-slide'
                            }`}
                            fetchPriority={index === 0 ? 'high' : 'auto'}
                        />
                    </picture>
                    <div
                        className={`absolute inset-0 bg-gradient-to-b ${slide.overlay}`}
                    />
                    {slide.layout !== 'brand' ? (
                        <div className="absolute inset-0 bg-black/40" />
                    ) : null}
                </motion.div>
            </AnimatePresence>

            {slide.layout === 'safari' ? (
                <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-5 pb-28 pt-6 text-center sm:px-6 sm:pb-20 sm:pt-10">
                    {slide.contentVariant === 'stay' ? (
                        <>
                            <motion.p
                                key={`eyebrow-${slide.id}`}
                                initial={reduce ? false : { opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.55, delay: 0.12 }}
                                className="max-w-xl text-sm font-medium tracking-wide text-white sm:text-base md:text-lg lg:text-xl"
                            >
                                {slide.eyebrow}
                            </motion.p>

                            <motion.h1
                                key={`title-${slide.id}`}
                                initial={reduce ? false : { opacity: 0, y: 22 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.65 }}
                                className="mt-4 w-full max-w-[min(94vw,58rem)] text-center font-display font-bold leading-none tracking-tight text-white sm:mt-5"
                            >
                                <span className="block whitespace-nowrap text-[clamp(0.95rem,3.9vw,3.65rem)]">
                                    {slide.titleLead}
                                </span>
                                <span className="mt-2 block whitespace-nowrap text-[clamp(0.95rem,3.9vw,3.65rem)] text-mint sm:mt-2.5">
                                    {slide.titleAccent}
                                </span>
                            </motion.h1>

                            <motion.div
                                key={`cta-${slide.id}`}
                                initial={reduce ? false : { opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.32, duration: 0.55 }}
                                className="mt-7 sm:mt-9"
                            >
                                <Link
                                    href={slide.ctaHref}
                                    className="group inline-flex items-center gap-2.5 rounded-full bg-mustard px-5 py-3 text-xs font-bold uppercase tracking-wide text-olive-950 shadow-lg transition hover:bg-white hover:text-mustard hover:shadow-md sm:gap-3 sm:px-8 sm:py-3.5 sm:text-sm md:text-base"
                                >
                                    {slide.cta}
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-olive-950/10 transition group-hover:bg-mustard/15 sm:h-7 sm:w-7">
                                        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </span>
                                </Link>
                            </motion.div>
                        </>
                    ) : (
                        <>
                            <motion.p
                                key={`eyebrow-${slide.id}`}
                                initial={reduce ? false : { opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.55, delay: 0.12 }}
                                className={`max-w-[18rem] text-[11px] font-semibold leading-snug text-white/90 sm:max-w-none sm:text-sm sm:font-medium md:text-base ${
                                    slide.eyebrowClass || 'tracking-wide'
                                }`}
                            >
                                {slide.eyebrow}
                            </motion.p>

                            <motion.h1
                                key={`title-${slide.id}`}
                                initial={reduce ? false : { opacity: 0, y: 22 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.65 }}
                                className="mt-3 w-full max-w-[20rem] font-display text-[1.55rem] font-bold leading-[1.18] tracking-tight text-white sm:mt-3 sm:max-w-3xl sm:text-5xl md:text-6xl lg:text-7xl"
                            >
                                <span className="block text-balance">
                                    {slide.titleLead}
                                </span>
                                <span className="mt-1.5 block text-balance text-[1.25rem] leading-snug text-mint sm:mt-1 sm:text-[length:inherit] sm:leading-[inherit]">
                                    {slide.titleAccent}
                                </span>
                            </motion.h1>

                            <motion.div
                                key={`cta-${slide.id}`}
                                initial={reduce ? false : { opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.32, duration: 0.55 }}
                                className="mt-5 sm:mt-8"
                            >
                                <Link
                                    href={slide.ctaHref}
                                    className="group inline-flex items-center gap-2 rounded-full bg-mustard px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-olive-950 shadow-lg transition hover:bg-white hover:text-mustard hover:shadow-md sm:gap-3 sm:px-7 sm:py-3.5 sm:text-sm md:text-base"
                                >
                                    {slide.cta}
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-olive-950/10 transition group-hover:bg-mustard/15 sm:h-7 sm:w-7">
                                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </span>
                                </Link>
                            </motion.div>
                        </>
                    )}
                </div>
            ) : null}

            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-1.5 sm:px-4">
                <button
                    type="button"
                    onClick={() => step(-1)}
                    className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-mustard hover:text-olive-950 sm:h-12 sm:w-12"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => step(1)}
                    className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-mustard hover:text-olive-950 sm:h-12 sm:w-12"
                    aria-label="Next slide"
                >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
            </div>

            <div className="absolute bottom-[5.25rem] left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:hidden">
                {SLIDES.map((item, i) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                            directionRef.current = i > index ? 1 : -1;
                            setIndex(i);
                        }}
                        aria-label={`Go to slide ${i + 1}`}
                        aria-current={i === index}
                        className={`h-1.5 rounded-full transition-all ${
                            i === index
                                ? 'w-5 bg-mustard sm:w-6'
                                : 'w-1.5 bg-white/50 hover:bg-white/80'
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}
