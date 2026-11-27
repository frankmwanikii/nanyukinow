import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CloseButton from '@/Components/site/CloseButton';
import {
    MapMark,
    NyukiMark,
    PlusMark,
    SearchMark,
} from '@/Components/site/Mark';
import { explorePath } from '@/data/categories';
import FlippingSearchHint, { FLIP_WORDS } from './FlippingSearchHint';
import SearchSuggestions from './SearchSuggestions';

const ICON = 'h-6 w-6';
/** Shared icon slot so labels share one baseline (Add circle is taller than glyphs). */
const ICON_WELL = 'flex h-8 w-full items-center justify-center';

export default function MobileBottomNav() {
    const page = usePage();
    const { auth } = page.props;
    const user = auth?.user;
    const path =
        typeof page?.url === 'string' ? page.url.split('?')[0] : '/';
    const [flipIndex, setFlipIndex] = useState(0);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const searchFormRef = useRef(null);
    const searchPanelRef = useRef(null);
    const suggestionsRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const id = window.setInterval(() => {
            setFlipIndex((i) => (i + 1) % FLIP_WORDS.length);
        }, 2200);
        return () => window.clearInterval(id);
    }, []);

    const flipWord = FLIP_WORDS[flipIndex];
    const searchActive = searchOpen;

    const closeSearch = () => {
        setSearchOpen(false);
        setSuggestionsOpen(false);
    };

    const openSearch = () => {
        setSearchOpen(true);
        setSuggestionsOpen(true);
    };

    useEffect(() => {
        const onOpen = () => openSearch();
        window.addEventListener('nn:open-mobile-search', onOpen);
        return () =>
            window.removeEventListener('nn:open-mobile-search', onOpen);
    }, []);

    useEffect(() => {
        if (!searchOpen) return undefined;

        const focusTimer = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 40);

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKey = (e) => {
            if (e.key === 'Escape') closeSearch();
        };
        document.addEventListener('keydown', onKey);

        return () => {
            window.clearTimeout(focusTimer);
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('keydown', onKey);
        };
    }, [searchOpen]);

    const submitSearch = (e) => {
        e.preventDefault();
        const q = query.trim();
        closeSearch();
        router.get('/explore', q ? { q } : {}, { preserveState: false });
    };

    const staticItems = [
        {
            key: 'explore',
            label: 'Explore',
            href: explorePath(),
            icon: MapMark,
            prefetch: true,
        },
        {
            key: 'add',
            label: 'Add',
            href: user ? route('account.listings.create') : route('register'),
            icon: PlusMark,
            accent: true,
        },
        {
            key: 'nyuki',
            label: 'Nyuki AI',
            href: route('nyuki'),
            icon: NyukiMark,
            // Bee glyph is narrower than Unicons; scale up to match optical weight.
            iconClass: 'h-8 w-8',
            prefetch: true,
        },
    ];

    const itemClass = (active) =>
        `relative flex min-h-11 w-full flex-col items-center justify-center gap-0.5 px-1 py-1 text-[10px] font-medium leading-none tracking-[0.04em] transition-colors ${
            active ? 'text-mustard' : 'text-white/80 hover:text-white'
        }`;

    const searchOverlay =
        typeof document !== 'undefined' && searchOpen ? (
            <>
                <button
                    key="mobile-search-backdrop"
                    type="button"
                    className="fixed inset-0 z-[1096] bg-black/45 backdrop-blur-[1px] lg:hidden"
                    aria-label="Close search"
                    onClick={closeSearch}
                />
                <div
                    key="mobile-search-panel"
                    ref={searchPanelRef}
                    className="fixed inset-x-0 top-[4.25rem] z-[1098] border-b border-white/10 bg-olive-900/98 px-3 py-2.5 shadow-lg backdrop-blur-md sm:top-[4.75rem] sm:px-5 lg:hidden"
                    role="search"
                >
                    <form
                        ref={searchFormRef}
                        onSubmit={submitSearch}
                        className="relative mx-auto flex max-w-site items-center"
                    >
                        <SearchMark className="pointer-events-none absolute left-3.5 z-10 h-4 w-4 text-white/75" />
                        <FlippingSearchHint
                            visible={!query.trim() && !suggestionsOpen}
                            className="left-10"
                        />
                        <input
                            ref={inputRef}
                            type="search"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSuggestionsOpen(true);
                            }}
                            onFocus={() => setSuggestionsOpen(true)}
                            placeholder={
                                query.trim() || suggestionsOpen
                                    ? 'What are you looking for?'
                                    : ''
                            }
                            aria-label="Search"
                            aria-expanded={suggestionsOpen}
                            aria-controls="mobile-nav-search-suggestions"
                            autoComplete="off"
                            className="site-nav-search w-full rounded-full border-0 bg-white/10 py-2.5 pl-10 pr-12 text-[15px] text-white placeholder:text-white/65 ring-1 ring-white/20 focus:outline-none focus:ring-2 focus:ring-mustard"
                        />
                        <CloseButton
                            onClick={closeSearch}
                            size="sm"
                            tone="onDark"
                            label="Close search"
                            className="absolute right-2 z-10"
                        />
                    </form>

                    {suggestionsOpen ? (
                        <SearchSuggestions
                            query={query}
                            onSelect={closeSearch}
                            anchorRef={searchFormRef}
                            headerRef={searchPanelRef}
                            panelRef={suggestionsRef}
                            id="mobile-nav-search-suggestions"
                        />
                    ) : null}
                </div>
            </>
        ) : null;

    return (
        <>
            {typeof document !== 'undefined'
                ? createPortal(searchOverlay, document.body)
                : null}

            <nav
                className="fixed inset-x-0 bottom-0 z-[1095] border-t border-white/10 bg-olive-900 pb-[env(safe-area-inset-bottom)] lg:hidden"
                aria-label="Mobile toolbar"
            >
                <ul className="mx-auto grid h-[3.75rem] max-w-lg grid-cols-4 px-1 sm:h-16">
                    <li className="min-w-0">
                        <button
                            type="button"
                            onClick={openSearch}
                            className={itemClass(searchActive)}
                            aria-label={`Search ${flipWord}`}
                            aria-expanded={searchOpen}
                            aria-controls="mobile-nav-search-suggestions"
                        >
                            {searchActive ? (
                                <span
                                    className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-mustard"
                                    aria-hidden
                                />
                            ) : null}
                            <span className={ICON_WELL}>
                                <SearchMark className={ICON} />
                            </span>
                            <span className="relative block h-[1em] w-full max-w-[4.5rem] overflow-hidden text-center">
                                <span
                                    key={flipWord}
                                    className="absolute inset-x-0 top-0 animate-[nn-flip-in_320ms_ease-out] truncate"
                                >
                                    {flipWord}
                                </span>
                                <span className="invisible" aria-hidden>
                                    Restaurants
                                </span>
                            </span>
                        </button>
                    </li>

                    {staticItems.map((item) => {
                        const Icon = item.icon;
                        const active =
                            item.key === 'explore'
                                ? path.startsWith('/explore') && !searchActive
                                : item.key === 'add'
                                  ? path.startsWith('/account/listings') ||
                                    path.startsWith('/register')
                                  : item.key === 'nyuki'
                                    ? path.startsWith('/nyuki')
                                    : false;

                        const content = (
                            <>
                                {active ? (
                                    <span
                                        className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-mustard"
                                        aria-hidden
                                    />
                                ) : null}
                                <span className={ICON_WELL}>
                                    {item.accent ? (
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mustard text-olive-950 shadow-sm">
                                            <Icon className="h-4 w-4" />
                                        </span>
                                    ) : (
                                        <Icon
                                            className={item.iconClass || ICON}
                                        />
                                    )}
                                </span>
                                <span className="truncate">{item.label}</span>
                            </>
                        );

                        return (
                            <li key={item.key} className="min-w-0">
                                {item.onClick ? (
                                    <button
                                        type="button"
                                        onClick={item.onClick}
                                        className={itemClass(active)}
                                    >
                                        {content}
                                    </button>
                                ) : (
                                    <Link
                                        href={item.href}
                                        prefetch={item.prefetch || false}
                                        className={itemClass(active)}
                                    >
                                        {content}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </>
    );
}
