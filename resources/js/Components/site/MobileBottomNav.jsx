import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, Plus, Search, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { explorePath } from '@/data/categories';
import FlippingSearchHint, { FLIP_WORDS } from './FlippingSearchHint';
import SearchSuggestions from './SearchSuggestions';

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
            icon: Compass,
        },
        {
            key: 'add',
            label: 'Add',
            href: user ? route('account.listings.create') : route('register'),
            onClick: null,
            icon: Plus,
            circled: true,
        },
        {
            key: 'account',
            label: user ? 'Account' : 'Sign in',
            href: user ? route('account.index') : '/login',
            icon: User,
        },
    ];

    const searchOverlay =
        typeof document !== 'undefined' ? (
            <AnimatePresence>
                {searchOpen ? (
                    <>
                        <motion.button
                            key="mobile-search-backdrop"
                            type="button"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="fixed inset-0 z-[1096] bg-black/45 backdrop-blur-[1px] lg:hidden"
                            aria-label="Close search"
                            onClick={closeSearch}
                        />
                        <motion.div
                            key="mobile-search-panel"
                            ref={searchPanelRef}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="fixed inset-x-0 top-[4.25rem] z-[1098] border-b border-white/10 bg-[#4f5a3e]/98 px-3 py-2.5 shadow-lg backdrop-blur-md sm:top-[4.75rem] sm:px-5 lg:hidden"
                            role="search"
                        >
                            <form
                                ref={searchFormRef}
                                onSubmit={submitSearch}
                                className="relative mx-auto flex max-w-[1400px] items-center"
                            >
                                <Search className="pointer-events-none absolute left-3 z-10 h-4 w-4 text-white/80" />
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
                                <button
                                    type="button"
                                    onClick={closeSearch}
                                    className="absolute right-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
                                    aria-label="Close search"
                                >
                                    <X className="h-4 w-4" strokeWidth={2.25} />
                                </button>
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
                        </motion.div>
                    </>
                ) : null}
            </AnimatePresence>
        ) : null;

    return (
        <>
            {typeof document !== 'undefined'
                ? createPortal(searchOverlay, document.body)
                : null}

            <nav
                className="fixed inset-x-0 bottom-0 z-[1095] border-t border-white/10 bg-gradient-to-b from-[#5a6648] to-[#3f4734] pb-[env(safe-area-inset-bottom)] lg:hidden"
                aria-label="Mobile toolbar"
            >
                <ul className="mx-auto grid max-w-lg grid-cols-4 px-1 pt-2 pb-2.5">
                    <li>
                        <button
                            type="button"
                            onClick={openSearch}
                            className={`flex w-full flex-col items-center gap-1 px-1 py-1 text-white transition ${
                                searchActive ? 'opacity-100' : 'opacity-90'
                            }`}
                            aria-label={`Search ${flipWord}`}
                            aria-expanded={searchOpen}
                            aria-controls="mobile-nav-search-suggestions"
                        >
                            <Search className="h-6 w-6" strokeWidth={1.75} />
                            <span className="relative block h-[1em] w-full max-w-[4.75rem] overflow-hidden text-center">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={flipWord}
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -10, opacity: 0 }}
                                        transition={{
                                            duration: 0.28,
                                            ease: 'easeOut',
                                        }}
                                        className="absolute inset-x-0 top-0 truncate font-display text-[11px] font-semibold leading-none tracking-wide"
                                    >
                                        {flipWord}
                                    </motion.span>
                                </AnimatePresence>
                                <span
                                    className="invisible font-display text-[11px] font-semibold leading-none tracking-wide"
                                    aria-hidden
                                >
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
                                  : item.key === 'account'
                                    ? path.startsWith('/account') ||
                                      path.startsWith('/login')
                                    : false;

                        const className = `flex w-full flex-col items-center gap-1 px-1 py-1 text-white transition ${
                            active ? 'opacity-100' : 'opacity-90'
                        }`;

                        const content = (
                            <>
                                {item.circled ? (
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] border-white">
                                        <Icon
                                            className="h-4 w-4"
                                            strokeWidth={2.25}
                                        />
                                    </span>
                                ) : (
                                    <Icon
                                        className="h-6 w-6"
                                        strokeWidth={1.75}
                                    />
                                )}
                                <span className="font-display text-[11px] font-semibold leading-none tracking-wide">
                                    {item.label}
                                </span>
                            </>
                        );

                        return (
                            <li key={item.key}>
                                {item.onClick ? (
                                    <button
                                        type="button"
                                        onClick={item.onClick}
                                        className={className}
                                    >
                                        {content}
                                    </button>
                                ) : (
                                    <Link href={item.href} className={className}>
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
