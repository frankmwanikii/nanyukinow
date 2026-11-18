import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { SearchMark } from '@/Components/site/Mark';
import SearchSuggestions from '@/Components/site/SearchSuggestions';

const HERO_PHOTOS = [
    {
        id: 'wildlife',
        image: '/images/hero/slide-2.webp',
        imageMobile: '/images/hero/slide_2_mobile.webp',
        alt: 'Black rhinos on the Laikipia plains near Nanyuki',
        title: 'Laikipia plains',
        credit: 'Black rhinos near Nanyuki',
    },
    {
        id: 'stay',
        image: '/images/hero/bnb3.webp',
        alt: 'Warm stone-walled stay interior in Nanyuki',
        title: 'Stay in town',
        credit: 'Stone-walled guest interior',
    },
    {
        id: 'dining',
        image: '/images/hero/slide_4.webp',
        alt: 'Dining with a view of Mount Kenya at dusk',
        title: 'Mount Kenya at dusk',
        credit: 'Dining with a highland view',
    },
];

const PHOTO_INTERVAL_MS = 9000;

const HERO_PLACES = ['Nanyuki', 'Timau', 'Naromoru', 'Laikipia'];
const PLACE_INTERVAL_MS = 3200;

const OPEN_MOBILE_SEARCH = 'nn:open-mobile-search';

export default function HeroSlider() {
    const [photoIndex, setPhotoIndex] = useState(0);
    const [progressKey, setProgressKey] = useState(0);
    const [placeIndex, setPlaceIndex] = useState(0);
    const [query, setQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchFieldVisible, setSearchFieldVisible] = useState(false);
    const [desktopLayout, setDesktopLayout] = useState(() =>
        typeof window !== 'undefined'
            ? window.matchMedia('(min-width: 1024px)').matches
            : false,
    );
    const [reduceMotion, setReduceMotion] = useState(false);
    const searchRef = useRef(null);
    const suggestionsRef = useRef(null);
    const searchInputRef = useRef(null);
    const searchToggleRef = useRef(null);

    useEffect(() => {
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const desktop = window.matchMedia('(min-width: 1024px)');
        const syncMotion = () => setReduceMotion(motion.matches);
        const syncDesktop = () => {
            const isDesktop = desktop.matches;
            setDesktopLayout(isDesktop);
            if (!isDesktop) {
                setSearchFieldVisible(false);
                setSearchOpen(false);
            }
        };
        syncMotion();
        syncDesktop();
        motion.addEventListener?.('change', syncMotion);
        desktop.addEventListener?.('change', syncDesktop);
        return () => {
            motion.removeEventListener?.('change', syncMotion);
            desktop.removeEventListener?.('change', syncDesktop);
        };
    }, []);

    useEffect(() => {
        if (reduceMotion || HERO_PHOTOS.length < 2) {
            return undefined;
        }
        const id = window.setInterval(() => {
            setPhotoIndex((prev) => (prev + 1) % HERO_PHOTOS.length);
            setProgressKey((key) => key + 1);
        }, PHOTO_INTERVAL_MS);
        return () => window.clearInterval(id);
    }, [reduceMotion, progressKey]);

    useEffect(() => {
        if (reduceMotion || HERO_PLACES.length < 2) {
            return undefined;
        }
        const id = window.setInterval(() => {
            setPlaceIndex((prev) => (prev + 1) % HERO_PLACES.length);
        }, PLACE_INTERVAL_MS);
        return () => window.clearInterval(id);
    }, [reduceMotion]);

    useEffect(() => {
        if (!searchOpen && !searchFieldVisible) {
            return undefined;
        }
        const onPointerDown = (event) => {
            const target = event.target;
            if (
                searchRef.current?.contains(target) ||
                suggestionsRef.current?.contains(target) ||
                searchToggleRef.current?.contains(target)
            ) {
                return;
            }
            setSearchOpen(false);
            if (desktopLayout) {
                setSearchFieldVisible(false);
            }
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [searchOpen, searchFieldVisible, desktopLayout]);

    useEffect(() => {
        if (!desktopLayout || !searchFieldVisible) {
            return undefined;
        }
        const id = window.setTimeout(() => searchInputRef.current?.focus(), 40);
        return () => window.clearTimeout(id);
    }, [desktopLayout, searchFieldVisible]);

    const closeSearch = () => {
        setSearchOpen(false);
        if (desktopLayout) {
            setSearchFieldVisible(false);
        }
    };

    const revealSearch = () => {
        setSearchFieldVisible(true);
        setSearchOpen(false);
    };

    const openMobileSearch = () => {
        window.dispatchEvent(new CustomEvent(OPEN_MOBILE_SEARCH));
    };

    const goToPhoto = (index) => {
        setPhotoIndex(index);
        setProgressKey((key) => key + 1);
    };

    const submitSearch = (event) => {
        event.preventDefault();
        closeSearch();
        router.get(
            '/explore',
            query.trim() ? { q: query.trim() } : {},
            { preserveState: false },
        );
    };

    const activePhoto = HERO_PHOTOS[photoIndex] ?? HERO_PHOTOS[0];

    const searchForm = (
        <form
            ref={searchRef}
            role="search"
            onSubmit={submitSearch}
            className="relative w-full"
        >
            <label htmlFor="hero-search" className="sr-only">
                Search Nanyuki Now
            </label>
            <div className="flex min-h-12 border border-white/25 bg-white focus-within:border-mustard sm:min-h-[3.25rem] lg:min-h-14 lg:shadow-[0_8px_28px_-12px_rgba(0,0,0,0.55)]">
                <span className="flex items-center pl-3.5 text-olive-700 sm:pl-4 lg:pl-5">
                    <SearchMark className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" />
                </span>
                <input
                    ref={searchInputRef}
                    id="hero-search"
                    type="search"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    placeholder="Search places, stays, events…"
                    autoComplete="off"
                    aria-expanded={searchOpen}
                    aria-controls="hero-search-suggestions"
                    className="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-base text-olive-950 placeholder:text-olive-400 focus:outline-none focus:ring-0 sm:px-3.5 sm:text-[1.05rem] lg:text-lg"
                />
                <button
                    type="submit"
                    aria-label="Search"
                    className="shrink-0 border-l border-olive-900/10 bg-mustard px-4 text-sm font-semibold text-olive-950 transition hover:bg-olive-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-olive-900 sm:px-5 sm:text-base lg:px-7 lg:text-[1.05rem]"
                >
                    <span className="sm:hidden" aria-hidden="true">
                        Go
                    </span>
                    <span className="hidden sm:inline">Search</span>
                </button>
            </div>

            {searchOpen ? (
                <SearchSuggestions
                    query={query}
                    onSelect={closeSearch}
                    anchorRef={searchRef}
                    panelRef={suggestionsRef}
                    id="hero-search-suggestions"
                    placement="below"
                />
            ) : null}
        </form>
    );

    return (
        <section
            className="relative flex min-h-[72svh] flex-col overflow-hidden bg-earth-dusk pt-[4.75rem] sm:min-h-[78svh] sm:pt-20 lg:min-h-[100svh] lg:pt-[5.75rem]"
            aria-label="Find places in Nanyuki"
        >
            <div className="absolute inset-0" aria-hidden="true">
                {HERO_PHOTOS.map((photo, i) => {
                    const visible = i === photoIndex;
                    const kenBurnsClass =
                        i % 2 === 0
                            ? 'animate-ken-burns-slide'
                            : 'animate-ken-burns-slide-alt';
                    return (
                        <picture
                            key={photo.id}
                            className={`absolute inset-0 overflow-hidden transition-opacity duration-[1200ms] ease-out ${
                                visible ? 'opacity-100' : 'opacity-0'
                            } ${reduceMotion ? 'duration-0' : ''}`}
                        >
                            {photo.imageMobile ? (
                                <source
                                    media="(max-width: 639px)"
                                    srcSet={photo.imageMobile}
                                />
                            ) : null}
                            <img
                                src={photo.image}
                                alt=""
                                className={`h-full w-full object-cover object-center will-change-transform ${
                                    visible && !reduceMotion
                                        ? kenBurnsClass
                                        : 'scale-100'
                                }`}
                                fetchPriority={i === 0 ? 'high' : 'auto'}
                                loading={i === 0 ? 'eager' : 'lazy'}
                                decoding={i === 0 ? 'sync' : 'async'}
                            />
                        </picture>
                    );
                })}
                <div className="absolute inset-0 bg-earth-dusk/30 lg:bg-earth-dusk/25" />
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-earth-dusk/75 to-transparent lg:h-40" />
                <div className="absolute inset-x-0 bottom-0 h-[78%] bg-gradient-to-t from-earth-dusk via-earth-dusk/70 to-transparent sm:h-[68%] lg:h-[55%] lg:via-earth-dusk/55" />
            </div>

            <span className="sr-only">{activePhoto.alt}</span>

            {/* Desktop: centered vertical progress */}
            <div className="pointer-events-none absolute inset-y-0 left-8 z-20 hidden lg:flex lg:items-center xl:left-10">
                <div
                    className="pointer-events-auto flex flex-col items-center gap-3"
                    role="tablist"
                    aria-label="Hero photos"
                >
                    {HERO_PHOTOS.map((photo, i) => {
                        const active = i === photoIndex;
                        const completed = i < photoIndex;
                        return (
                            <button
                                key={photo.id}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                aria-label={`Show ${photo.title}`}
                                onClick={() => goToPhoto(i)}
                                className="relative block h-20 w-1 overflow-visible bg-white/35 transition hover:bg-white/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mustard"
                            >
                                {completed ? (
                                    <span className="absolute inset-0 bg-mustard" />
                                ) : null}
                                {active ? (
                                    <span
                                        key={progressKey}
                                        className={`absolute inset-x-0 top-0 w-full bg-mustard ${
                                            reduceMotion
                                                ? 'h-full'
                                                : 'animate-hero-progress-y'
                                        }`}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="absolute bottom-0 left-1/2 h-3.5 w-3.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-mustard"
                                        />
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Desktop: slide caption */}
            <div className="pointer-events-none absolute bottom-28 left-8 z-20 hidden max-w-[14rem] text-white lg:block xl:bottom-32 xl:left-10">
                <p className="text-[15px] font-semibold leading-snug">
                    {activePhoto.title}
                </p>
                <p className="mt-1 text-sm leading-snug text-white/70">
                    {activePhoto.credit}
                </p>
            </div>

            {/*
              Mobile: Find + place + search icon at bottom (opens bottom-nav search).
              Desktop: search reveals at top; big white icon beside headline.
            */}
            <div className="relative z-10 mx-auto flex w-full max-w-site flex-1 flex-col justify-end px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:justify-start lg:px-8 lg:pb-16 lg:pt-6 xl:px-10">
                {desktopLayout && searchFieldVisible ? (
                    <div
                        className={`relative order-1 mx-auto w-full max-w-3xl xl:max-w-4xl ${
                            reduceMotion ? '' : 'animate-hero-search-in'
                        }`}
                    >
                        {searchForm}
                    </div>
                ) : null}

                <div className="order-2 mx-auto mt-auto w-full max-w-xl text-center lg:max-w-3xl lg:pb-10 xl:max-w-4xl xl:pb-14">
                    <div className="flex flex-nowrap items-center justify-center gap-2.5 sm:gap-4 lg:gap-5">
                        <h1 className="min-w-0 shrink font-display text-[clamp(1.85rem,7.2vw,3.75rem)] font-semibold leading-[1.05] tracking-tight text-white sm:text-[clamp(2.25rem,9vw,3.75rem)] lg:text-[clamp(3rem,5vw,4.5rem)]">
                            {desktopLayout ? (
                                <span className="inline-flex flex-nowrap items-baseline gap-[0.28em] whitespace-nowrap">
                                    <span>Find</span>
                                    <span
                                        key={HERO_PLACES[placeIndex]}
                                        className={`inline-block whitespace-nowrap ${
                                            reduceMotion
                                                ? ''
                                                : 'animate-hero-place-in'
                                        }`}
                                        aria-live="polite"
                                    >
                                        {HERO_PLACES[placeIndex]}
                                    </span>
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={openMobileSearch}
                                    className="inline-flex flex-nowrap items-baseline gap-[0.28em] whitespace-nowrap text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mustard"
                                >
                                    <span>Find</span>
                                    <span
                                        key={HERO_PLACES[placeIndex]}
                                        className={`inline-block whitespace-nowrap ${
                                            reduceMotion
                                                ? ''
                                                : 'animate-hero-place-in'
                                        }`}
                                        aria-live="polite"
                                    >
                                        {HERO_PLACES[placeIndex]}
                                    </span>
                                </button>
                            )}
                        </h1>
                        <button
                            ref={searchToggleRef}
                            type="button"
                            onClick={() => {
                                if (!desktopLayout) {
                                    openMobileSearch();
                                    return;
                                }
                                if (searchFieldVisible) {
                                    closeSearch();
                                } else {
                                    revealSearch();
                                }
                            }}
                            aria-label={
                                desktopLayout && searchFieldVisible
                                    ? 'Close search'
                                    : 'Open search'
                            }
                            aria-expanded={
                                desktopLayout ? searchFieldVisible : undefined
                            }
                            title="Search"
                            className={`group inline-flex shrink-0 cursor-pointer text-white transition duration-200 hover:text-mustard focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mustard ${
                                !(desktopLayout && searchFieldVisible) &&
                                !reduceMotion
                                    ? 'animate-search-cue'
                                    : ''
                            } hover:animate-none`}
                        >
                            <SearchMark className="h-8 w-8 transition duration-200 group-hover:scale-110 sm:h-10 sm:w-10 lg:h-12 lg:w-12 xl:h-14 xl:w-14" />
                        </button>
                    </div>
                    <p className="mx-auto mt-3 max-w-full whitespace-nowrap text-[clamp(0.6875rem,3.55vw,0.8125rem)] leading-snug tracking-tight text-white/85 sm:mt-4 sm:text-base sm:tracking-normal lg:mt-5 lg:whitespace-normal lg:text-xl lg:leading-relaxed lg:tracking-normal lg:text-white/90">
                        Stay, eat, explore, and get things done right now.
                    </p>
                </div>
            </div>
        </section>
    );
}
