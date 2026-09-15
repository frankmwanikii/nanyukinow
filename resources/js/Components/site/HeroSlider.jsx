import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const SLIDES = [
    {
        id: 1,
        image: '/images/hero/slide_1.jpeg',
        alt: 'Nanyuki Now — Mount Kenya, wildlife, and town life',
        layout: 'image',
        overlay: 'from-earth-dusk/20 via-transparent to-earth-dusk/45',
    },
    {
        id: 2,
        image: '/images/hero/slide-2.webp',
        alt: 'Black rhinos on the Laikipia plains near Nanyuki',
        layout: 'safari',
        overlay: 'from-earth-dusk/50 via-earth-dusk/35 to-earth-dusk/65',
        eyebrow: 'Your Ultimate Safari guide',
        titleLead: "Discover Nanyuki's",
        titleAccent: 'Wild side',
        cta: 'Start exploring',
        ctaHref: '#activities',
    },
    {
        id: 3,
        image: '/images/hero/bnb3.webp',
        alt: 'A-frame cabin stay in Nanyuki at dusk',
        layout: 'safari',
        overlay: 'from-earth-dusk/55 via-earth-dusk/35 to-earth-dusk/70',
        eyebrow: 'Your Home Away From Home',
        titleLead: 'Unwind in the Heart Of Nanyuki',
        titleAccent: 'Stay. Relax. Explore',
        cta: 'Check in',
        ctaHref: '#stay',
    },
];

const INTERVAL_MS = 6500;

export default function HeroSlider() {
    const reduce = useReducedMotion();
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    const step = useCallback((delta) => {
        setIndex((prev) => (prev + delta + SLIDES.length) % SLIDES.length);
    }, []);

    useEffect(() => {
        if (reduce || paused) return undefined;
        const id = window.setInterval(() => step(1), INTERVAL_MS);
        return () => window.clearInterval(id);
    }, [step, paused, reduce, index]);

    const slide = SLIDES[index];

    return (
        <section
            className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pt-16"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            aria-roledescription="carousel"
            aria-label="Nanyuki Now highlights"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={slide.id}
                    className="absolute inset-0 overflow-hidden"
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduce ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.9, ease: 'easeInOut' }}
                >
                    <img
                        src={slide.image}
                        alt={slide.alt}
                        className={`h-full w-full object-cover will-change-transform ${
                            reduce ? '' : 'animate-ken-burns-slide'
                        }`}
                        fetchPriority={index === 0 ? 'high' : 'auto'}
                    />
                    <div
                        className={`absolute inset-0 bg-gradient-to-b ${slide.overlay}`}
                    />
                </motion.div>
            </AnimatePresence>

            {slide.layout === 'safari' ? (
                <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-20 pt-10 text-center sm:px-6">
                    <motion.p
                        key={`eyebrow-${slide.id}`}
                        initial={reduce ? false : { opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-sm font-medium tracking-wide text-white/90 sm:text-base"
                    >
                        {slide.eyebrow}
                    </motion.p>

                    <motion.h1
                        key={`title-${slide.id}`}
                        initial={reduce ? false : { opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.7 }}
                        className="mt-3 max-w-none font-display text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
                    >
                        <span className="block whitespace-nowrap">
                            {slide.titleLead}
                        </span>
                        <span className="mt-1 block whitespace-nowrap text-mint">
                            {slide.titleAccent}
                        </span>
                    </motion.h1>

                    <motion.div
                        key={`cta-${slide.id}`}
                        initial={reduce ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.22, duration: 0.6 }}
                        className="mt-8"
                    >
                        <a
                            href={slide.ctaHref}
                            className="inline-flex items-center gap-3 rounded-full bg-mustard px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-olive-950 shadow-lg transition hover:bg-mustard-soft sm:text-base"
                        >
                            {slide.cta}
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-olive-950/10">
                                <ArrowRight className="h-4 w-4" />
                            </span>
                        </a>
                    </motion.div>
                </div>
            ) : null}

            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-2 sm:px-4">
                <button
                    type="button"
                    onClick={() => step(-1)}
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur transition hover:bg-black/40 sm:h-12 sm:w-12"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => step(1)}
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur transition hover:bg-black/40 sm:h-12 sm:w-12"
                    aria-label="Next slide"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </section>
    );
}
