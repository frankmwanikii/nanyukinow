import { router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SearchMark } from '@/Components/site/Mark';
import SearchSuggestions from '@/Components/site/SearchSuggestions';

const DEFAULT_HERO_PHOTOS = [
    {
        id: 'brand',
        image: '/images/hero/slide_1.webp',
        imageMobile: '/images/hero/slide_1_mobile.webp',
        alt: 'Mount Kenya, wildlife, and town life around Nanyuki',
        title: 'Nanyuki Now',
        credit: 'Mount Kenya, wildlife, and town life',
        showOnDesktop: true,
        showOnMobile: true,
    },
    {
        id: 'wildlife',
        image: '/images/hero/slide-2.webp',
        imageMobile: '/images/hero/slide_2_mobile.webp',
        alt: 'Black rhinos on the Laikipia plains near Nanyuki',
        title: "Discover Nanyuki's wild side",
        credit: 'Black rhinos on the Laikipia plains',
        showOnDesktop: true,
        showOnMobile: true,
    },
    {
        id: 'cabin',
        image: '/images/hero/slide-3.webp',
        alt: 'A-frame cabin stay in Nanyuki at dusk',
        title: 'Unwind in the heart of Nanyuki',
        credit: 'Stay. Relax. Explore',
        showOnDesktop: true,
        showOnMobile: true,
    },
    {
        id: 'stay',
        image: '/images/hero/bnb3.webp',
        alt: 'Warm stone-walled stay interior in Nanyuki',
        title: 'Your home away from home',
        credit: 'Stone-walled guest stays in town',
        showOnDesktop: true,
        showOnMobile: true,
    },
    {
        id: 'dining',
        image: '/images/hero/slide_4.webp',
        alt: 'Dining with a view of Mount Kenya at dusk',
        title: "Nanyuki's finest flavors",
        credit: 'Dining with a Mount Kenya view',
        showOnDesktop: true,
        showOnMobile: true,
    },
];

const PHOTO_INTERVAL_MS = 9000;

function normalizeHeroPhotos(photos) {
    if (!Array.isArray(photos) || photos.length === 0) {
        return DEFAULT_HERO_PHOTOS;
    }

    const cleaned = photos
        .map((photo, index) => {
            const image =
                typeof photo?.image === 'string' ? photo.image.trim() : '';
            if (!image) {
                return null;
            }

            return {
                id: photo.id || `slide-${index + 1}`,
                image,
                imageMobile:
                    typeof photo.imageMobile === 'string' &&
                    photo.imageMobile.trim() !== ''
                        ? photo.imageMobile.trim()
                        : null,
                alt: photo.alt || photo.title || 'Homepage hero photo',
                title: photo.title || '',
                credit: photo.credit || '',
                showOnDesktop: photo.showOnDesktop !== false,
                showOnMobile: photo.showOnMobile !== false,
            };
        })
        .filter(Boolean);

    return cleaned.length > 0 ? cleaned : DEFAULT_HERO_PHOTOS;
}

function visibleHeroPhotos(photos, isDesktop) {
    const filtered = photos.filter((photo) =>
        isDesktop ? photo.showOnDesktop !== false : photo.showOnMobile !== false,
    );

    return filtered.length > 0 ? filtered : photos;
}

const HERO_PLACES = ['Nanyuki', 'Timau', 'Naromoru', 'Laikipia'];
const PLACE_INTERVAL_MS = 3200;
const TYPEWRITER_MS = 72;
const TYPEWRITER_SETTLE_MS = 480;

const OPEN_MOBILE_SEARCH = 'nn:open-mobile-search';

export default function HeroSlider({ photos = null }) {
    const allHeroPhotos = useMemo(() => normalizeHeroPhotos(photos), [photos]);
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
    const [typedPlace, setTypedPlace] = useState('');
    const [placeSettled, setPlaceSettled] = useState(false);
    const searchRef = useRef(null);
    const suggestionsRef = useRef(null);
    const searchInputRef = useRef(null);
    const searchToggleRef = useRef(null);
    const hasTypedRef = useRef(false);

    const heroPhotos = useMemo(
        () => visibleHeroPhotos(allHeroPhotos, desktopLayout),
        [allHeroPhotos, desktopLayout],
    );

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
        setPhotoIndex(0);
        setProgressKey((key) => key + 1);
    }, [desktopLayout, heroPhotos.length]);

    useEffect(() => {
        if (photoIndex >= heroPhotos.length) {
            setPhotoIndex(0);
        }
    }, [heroPhotos.length, photoIndex]);

    useEffect(() => {
        if (reduceMotion || heroPhotos.length < 2) {
            return undefined;
        }
        const id = window.setInterval(() => {
            setPhotoIndex((prev) => (prev + 1) % heroPhotos.length);
            setProgressKey((key) => key + 1);
        }, PHOTO_INTERVAL_MS);
        return () => window.clearInterval(id);
    }, [reduceMotion, progressKey, heroPhotos.length]);

    // Desktop: one-shot typewriter for the first place, then settle into rotation.
    useEffect(() => {
        if (reduceMotion || !desktopLayout) {
            setTypedPlace(HERO_PLACES[0]);
            setPlaceSettled(true);
            return undefined;
        }

        if (hasTypedRef.current) {
            setPlaceSettled(true);
            return undefined;
        }

        hasTypedRef.current = true;
        setPlaceSettled(false);
        setPlaceIndex(0);
        setTypedPlace('');

        const full = HERO_PLACES[0];
        let i = 0;
        let settleTimer = 0;
        const typeTimer = window.setInterval(() => {
            i += 1;
            setTypedPlace(full.slice(0, i));
            if (i >= full.length) {
                window.clearInterval(typeTimer);
                settleTimer = window.setTimeout(() => {
                    setPlaceSettled(true);
                }, TYPEWRITER_SETTLE_MS);
            }
        }, TYPEWRITER_MS);

        return () => {
            window.clearInterval(typeTimer);
            window.clearTimeout(settleTimer);
        };
    }, [desktopLayout, reduceMotion]);

    useEffect(() => {
        if (reduceMotion || HERO_PLACES.length < 2) {
            return undefined;
        }
        // Desktop waits until typewriter settles; mobile rotates immediately.
        if (desktopLayout && !placeSettled) {
            return undefined;
        }
        const id = window.setInterval(() => {
            setPlaceIndex((prev) => (prev + 1) % HERO_PLACES.length);
        }, PLACE_INTERVAL_MS);
        return () => window.clearInterval(id);
    }, [reduceMotion, desktopLayout, placeSettled]);

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

    const activePhoto = heroPhotos[photoIndex] ?? heroPhotos[0];

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
                {heroPhotos.map((photo, i) => {
                    const visible = i === photoIndex;
                    const kenBurnsClass =
                        i % 2 === 0
                            ? 'animate-ken-burns-slide'
                            : 'animate-ken-burns-slide-alt';
                    return (
                        <picture
                            key={photo.id}
                            className={`absolute inset-0 overflow-hidden transition-opacity duration-[750ms] ease-out ${
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
                <div className="absolute inset-0 bg-earth-dusk/10 lg:bg-earth-dusk/20" />
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-earth-dusk/55 to-transparent lg:h-40 lg:from-earth-dusk/70" />
                <div className="absolute inset-x-0 bottom-0 h-[36%] bg-gradient-to-t from-earth-dusk/90 via-earth-dusk/40 to-transparent sm:h-[48%] sm:via-earth-dusk/50 lg:h-[55%] lg:from-earth-dusk lg:via-earth-dusk/55" />
            </div>

            <span className="sr-only">{activePhoto.alt}</span>

            {/* Desktop side rail: progress + caption */}
            <div className="pointer-events-none absolute bottom-28 left-8 z-20 hidden w-[min(14rem,calc(100vw-5.5rem))] flex-col gap-8 lg:flex xl:bottom-32 xl:left-10">
                {heroPhotos.length > 1 ? (
                    <div
                        className="pointer-events-auto flex flex-col gap-3"
                        role="tablist"
                        aria-label="Hero photos"
                    >
                        {heroPhotos.map((photo, i) => {
                            const active = i === photoIndex;
                            const completed = i < photoIndex;
                            return (
                                <button
                                    key={photo.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    aria-label={`Show ${photo.title || `photo ${i + 1}`}`}
                                    onClick={() => goToPhoto(i)}
                                    className="relative block h-16 w-1 shrink-0 overflow-visible bg-white/35 transition hover:bg-white/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mustard"
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
                                                className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-mustard"
                                            />
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                ) : null}

                {(activePhoto.title || activePhoto.credit) && (
                    <div className="text-white">
                        {activePhoto.title ? (
                            <p className="font-display text-base font-semibold leading-snug">
                                {activePhoto.title}
                            </p>
                        ) : null}
                        {activePhoto.credit ? (
                            <p className="mt-1.5 text-sm leading-snug text-white/70">
                                {activePhoto.credit}
                            </p>
                        ) : null}
                    </div>
                )}
            </div>

            {/*
              Mobile: glowing search pill (opens bottom-nav search).
              Desktop: Find + place + search icon; field reveals at top.
            */}
            <div className="relative z-10 mx-auto flex w-full max-w-site flex-1 flex-col justify-end px-4 pb-20 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:justify-start lg:px-8 lg:pb-16 lg:pt-6 xl:px-10">
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
                    {heroPhotos.length > 1 ? (
                        <div
                            className="mb-4 flex items-center justify-center gap-2 lg:hidden"
                            role="tablist"
                            aria-label="Hero photos"
                        >
                            {heroPhotos.map((photo, i) => {
                                const active = i === photoIndex;
                                return (
                                    <button
                                        key={photo.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        aria-label={`Show ${photo.title || `photo ${i + 1}`}`}
                                        onClick={() => goToPhoto(i)}
                                        className={`h-1.5 rounded-full transition-[width,background-color] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mustard ${
                                            active
                                                ? 'w-5 bg-mustard'
                                                : 'w-1.5 bg-white/45 hover:bg-white/70'
                                        }`}
                                    />
                                );
                            })}
                        </div>
                    ) : null}

                    {!desktopLayout ? (
                        <button
                            type="button"
                            onClick={openMobileSearch}
                            aria-label={`Search ${HERO_PLACES[placeIndex]}`}
                            className={`nn-hero-search-glow mx-auto w-full max-w-md text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mustard ${
                                reduceMotion ? 'nn-hero-search-glow--static' : ''
                            }`}
                        >
                            <span
                                className="nn-hero-search-glow__spin"
                                aria-hidden="true"
                            />
                            <span className="relative flex min-h-[3.25rem] items-center gap-3 rounded-full bg-earth-dusk/85 px-4 backdrop-blur-md sm:min-h-14 sm:gap-3.5 sm:px-5">
                                <SearchMark className="h-5 w-5 shrink-0 text-mustard sm:h-[1.35rem] sm:w-[1.35rem]" />
                                <span className="min-w-0 truncate text-[15px] leading-none text-white/90 sm:text-base">
                                    Search{' '}
                                    <span
                                        key={HERO_PLACES[placeIndex]}
                                        className={`inline-block font-semibold text-mustard ${
                                            reduceMotion
                                                ? ''
                                                : 'animate-hero-place-in'
                                        }`}
                                        aria-live="polite"
                                    >
                                        {HERO_PLACES[placeIndex]}
                                    </span>
                                    …
                                </span>
                            </span>
                        </button>
                    ) : (
                        <>
                            <div className="flex flex-nowrap items-center justify-center gap-4 lg:gap-5">
                                <h1 className="min-w-0 shrink font-display text-[clamp(3rem,5vw,4.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
                                    <span className="inline-flex flex-nowrap items-baseline gap-[0.28em] whitespace-nowrap">
                                        <span>Find</span>
                                        {!placeSettled ? (
                                            <span
                                                className="inline-flex items-baseline whitespace-nowrap text-mustard"
                                                aria-live="polite"
                                            >
                                                <span>{typedPlace}</span>
                                                <span
                                                    aria-hidden="true"
                                                    className="ml-[0.06em] inline-block h-[0.85em] w-[0.08em] translate-y-[0.06em] bg-mustard animate-pulse"
                                                />
                                            </span>
                                        ) : (
                                            <span
                                                key={HERO_PLACES[placeIndex]}
                                                className={`inline-block whitespace-nowrap text-mustard ${
                                                    reduceMotion
                                                        ? ''
                                                        : 'animate-hero-place-in'
                                                }`}
                                                aria-live="polite"
                                            >
                                                {HERO_PLACES[placeIndex]}
                                            </span>
                                        )}
                                    </span>
                                </h1>
                                <button
                                    ref={searchToggleRef}
                                    type="button"
                                    onClick={() => {
                                        if (searchFieldVisible) {
                                            closeSearch();
                                        } else {
                                            revealSearch();
                                        }
                                    }}
                                    aria-label={
                                        searchFieldVisible
                                            ? 'Close search'
                                            : 'Open search'
                                    }
                                    aria-expanded={searchFieldVisible}
                                    title="Search"
                                    className={`group inline-flex shrink-0 cursor-pointer text-white transition duration-200 hover:text-mustard focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mustard ${
                                        !searchFieldVisible && !reduceMotion
                                            ? 'animate-search-cue'
                                            : ''
                                    } hover:animate-none`}
                                >
                                    <SearchMark className="h-12 w-12 transition duration-200 group-hover:scale-110 xl:h-14 xl:w-14" />
                                </button>
                            </div>
                            <p className="mx-auto mt-5 max-w-full text-xl leading-relaxed text-white/90">
                                Stay, eat, explore, and get things done right
                                now.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
