import { Link } from '@inertiajs/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const ALL_SLIDES = [
    {
        id: 1,
        image: '/images/hero/slide_1.webp',
        imageMobile: '/images/hero/slide_1_mobile.webp',
        alt: 'Nanyuki Now — Mount Kenya, wildlife, and town life',
        layout: 'brand',
        overlay: 'from-earth-dusk/15 via-transparent to-earth-dusk/40',
        kicker: 'Nanyuki Now',
    },
    {
        id: 2,
        image: '/images/hero/slide-2.webp',
        imageMobile: '/images/hero/slide_2_mobile.webp',
        alt: 'Black rhinos on the Laikipia plains near Nanyuki',
        layout: 'safari',
        overlay: 'from-black/65 via-black/45 to-black/55',
        kicker: 'Things to do',
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
        overlay: 'from-black/65 via-black/45 to-black/55',
        kicker: 'Stay',
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
        kicker: 'Eat & Drink',
        titleLead: "Nanyuki's Finest Flavors",
        titleAccent: 'Redefined',
        cta: 'See more',
        ctaHref: '/explore?category=eatDrink',
    },
];

const INTERVAL_MS = 6500;
const REVEAL_MS = 0.95;
const SWIPE_THRESHOLD = 48;

export default function HeroSlider() {
    const reduce = useReducedMotion();
    const slides = ALL_SLIDES;
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const directionRef = useRef(1);
    const touchStartX = useRef(null);

    const step = useCallback(
        (delta) => {
            directionRef.current = delta >= 0 ? 1 : -1;
            setIndex((prev) => (prev + delta + slides.length) % slides.length);
        },
        [slides.length],
    );

    useEffect(() => {
        if (reduce || paused || slides.length < 2) return undefined;
        const id = window.setInterval(() => step(1), INTERVAL_MS);
        return () => window.clearInterval(id);
    }, [step, paused, reduce, index, slides.length]);

    const slide = slides[index] ?? slides[0];
    const isBrand = slide?.layout === 'brand';

    const onTouchStart = (event) => {
        touchStartX.current = event.changedTouches[0]?.clientX ?? null;
    };

    const onTouchEnd = (event) => {
        if (touchStartX.current == null) return;
        const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
        const delta = endX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(delta) < SWIPE_THRESHOLD) return;
        step(delta < 0 ? 1 : -1);
    };

    if (!slide) return null;

    return (
        <section
            className="relative flex min-h-[78svh] items-end justify-center overflow-hidden bg-[#1c1712] pt-[4.5rem] sm:min-h-[90svh] sm:pt-16 lg:min-h-[100svh]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            aria-roledescription="carousel"
            aria-label="Nanyuki Now highlights"
        >
            <AnimatePresence initial={false} mode="sync">
                <motion.div
                    key={slide.id}
                    className="absolute -inset-px overflow-hidden bg-[#1c1712] [backface-visibility:hidden]"
                    initial={
                        reduce
                            ? false
                            : {
                                  opacity: 0,
                                  scale: 1.04,
                              }
                    }
                    animate={{
                        opacity: 1,
                        scale: 1,
                    }}
                    exit={{
                        opacity: 0,
                        scale: 1,
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
                        <>
                            <div className="absolute inset-0 bg-black/40" />
                            <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/80 via-black/40 to-transparent sm:h-[55%]" />
                        </>
                    ) : null}
                </motion.div>
            </AnimatePresence>

            {slide.layout === 'safari' ? (
                <Link
                    href={slide.ctaHref}
                    className="absolute inset-0 z-[2]"
                    tabIndex={-1}
                    aria-hidden="true"
                />
            ) : null}

            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-5 pb-6 pt-6 text-left sm:px-8 sm:pb-24 lg:px-10">
                {slide.layout === 'safari' ? (
                    <>
                        <Link
                            href={slide.ctaHref}
                            className="block"
                            aria-label={`${slide.cta} — ${slide.titleLead} ${slide.titleAccent}`}
                        >
                            <motion.p
                                key={`kicker-${slide.id}`}
                                initial={reduce ? false : { opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.55, delay: 0.1 }}
                                className="text-[0.95rem] font-bold leading-snug text-white sm:text-lg"
                            >
                                {slide.kicker}
                            </motion.p>

                            <motion.h1
                                key={`title-${slide.id}`}
                                initial={reduce ? false : { opacity: 0, y: 22 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.18, duration: 0.65 }}
                                className="mt-2 w-full max-w-[22rem] font-display font-bold tracking-tight text-white sm:mt-3 sm:max-w-3xl"
                            >
                                <span className="block text-balance text-[clamp(1.7rem,8vw,2.3rem)] leading-[1.08] sm:text-5xl sm:leading-[1.05] lg:text-6xl">
                                    {slide.titleLead}
                                </span>
                                <span className="mt-1 block text-balance text-[clamp(1.7rem,8vw,2.3rem)] leading-[1.08] text-mint sm:mt-2 sm:text-5xl sm:leading-[1.05] lg:text-6xl">
                                    {slide.titleAccent}
                                </span>
                            </motion.h1>

                            <motion.span
                                key={`cta-${slide.id}`}
                                initial={reduce ? false : { opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="mt-3.5 inline-flex min-h-6 items-center gap-1.5 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-mustard sm:hidden"
                            >
                                {slide.cta}
                                <ArrowRight className="h-3.5 w-3.5" />
                            </motion.span>
                        </Link>

                        <motion.div
                            key={`cta-pill-${slide.id}`}
                            initial={reduce ? false : { opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.55 }}
                            className="hidden sm:mt-7 sm:block"
                        >
                            <Link
                                href={slide.ctaHref}
                                className="group inline-flex min-h-11 items-center gap-3 rounded-full bg-mustard px-8 py-3.5 text-base font-bold uppercase tracking-wide text-olive-950 shadow-lg transition hover:bg-white hover:text-mustard hover:shadow-md"
                            >
                                {slide.cta}
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-olive-950/10 transition group-hover:bg-mustard/15">
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            </Link>
                        </motion.div>
                    </>
                ) : null}

                <div
                    className="mt-4 flex items-start gap-2.5 sm:mt-9 sm:gap-6"
                    aria-label="Hero slides"
                >
                    {slides.map((item, i) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                directionRef.current = i > index ? 1 : -1;
                                setIndex(i);
                            }}
                            aria-label={`Go to slide ${i + 1}: ${item.kicker}`}
                            aria-current={i === index ? 'true' : undefined}
                            className="group flex h-8 flex-1 flex-col justify-center gap-2.5 sm:h-auto sm:justify-start"
                        >
                            <span className="h-[3px] w-full overflow-hidden rounded-full bg-white/30 transition group-hover:bg-white/50">
                                {i === index ? (
                                    <motion.span
                                        key={`progress-${slide.id}`}
                                        className="block h-full w-full origin-left rounded-full bg-mustard"
                                        initial={{
                                            scaleX: reduce || paused ? 1 : 0,
                                        }}
                                        animate={{ scaleX: 1 }}
                                        transition={{
                                            duration:
                                                reduce || paused
                                                    ? 0
                                                    : INTERVAL_MS / 1000,
                                            ease: 'linear',
                                        }}
                                    />
                                ) : null}
                            </span>
                            <span
                                className={`hidden text-left text-sm font-semibold leading-snug transition sm:block ${
                                    i === index
                                        ? 'text-white'
                                        : 'text-white/65 group-hover:text-white/90'
                                }`}
                            >
                                {item.kicker}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
