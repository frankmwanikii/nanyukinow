import { Link, router, usePage } from '@inertiajs/react';
import {
    Menu,
    Plus,
    Search,
    User,
    X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import AuthModal from './AuthModal';
import FlippingSearchHint from './FlippingSearchHint';
import Logo from './Logo';
import {
    MemberAvatar,
    MemberNotificationsBell,
    MemberUserMenu,
} from './MemberAccountMenu';
import SearchSuggestions from './SearchSuggestions';
import { explorePath, getCategoryByKey, mainCategories } from '@/data/categories';
import { AUTH_MODAL_EVENT } from '@/utils/authModal';

const MORE_KEYS = ['services', 'shopping', 'properties', 'events'];

const moreLabelToKey = Object.fromEntries(
    MORE_KEYS.map((key) => [getCategoryByKey(key).label, key]),
);

function buildDropdownItems() {
    const byKey = Object.fromEntries(
        mainCategories.map((cat) => [cat.key, cat.children]),
    );

    return {
        eatDrink: byKey.eatDrink,
        stay: byKey.stay,
        thingsToDo: byKey.thingsToDo,
        more: MORE_KEYS.map((key) => {
            const cat = getCategoryByKey(key);
            return { label: cat.label, key: cat.key, children: cat.children };
        }),
    };
}

const dropdownItems = buildDropdownItems();

function NavCaret({ open = false }) {
    return (
        <svg
            viewBox="0 0 12 8"
            className={`ml-0.5 h-2.5 w-3 shrink-0 text-white transition-transform duration-200 ${
                open ? 'rotate-180' : ''
            }`}
            aria-hidden
        >
            <path
                d="M1.2 1.4 L6 6.2 L10.8 1.4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function MobileDrawerNav({
    navLinks,
    accordion,
    setAccordion,
    moreAccordion,
    setMoreAccordion,
    onNavigate,
}) {
    return (
        <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="flex flex-col gap-0.5">
                {navLinks.map((link) => {
                    const items = link.menu ? dropdownItems[link.menu] : [];
                    const hasMenu = Boolean(link.menu && items?.length);
                    const isOpen = accordion === link.menu;

                    if (!hasMenu) {
                        return (
                            <li key={link.key}>
                                <Link
                                    href={link.href}
                                    onClick={onNavigate}
                                    className="block rounded-xl px-3 py-3.5 text-lg font-semibold text-white transition hover:bg-white/10"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        );
                    }

                    return (
                        <li key={link.key}>
                            <button
                                type="button"
                                onClick={() => {
                                    setAccordion(isOpen ? null : link.menu);
                                    setMoreAccordion(null);
                                }}
                                className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3.5 text-left text-lg font-semibold text-white transition hover:bg-white/10"
                                aria-expanded={isOpen}
                            >
                                <span>{link.label}</span>
                                <NavCaret open={isOpen} />
                            </button>

                            <AnimatePresence initial={false}>
                                {isOpen ? (
                                    <motion.ul
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.22 }}
                                        className="ml-3 overflow-hidden border-l-2 border-mustard/70"
                                    >
                                        {items.map((item) => {
                                            const label =
                                                typeof item === 'string'
                                                    ? item
                                                    : item.label;
                                            const children =
                                                typeof item === 'string'
                                                    ? null
                                                    : item.children;
                                            const hasChildren = Boolean(
                                                children?.length,
                                            );
                                            const childOpen =
                                                hasChildren &&
                                                moreAccordion === label;
                                            const categoryKey =
                                                typeof item === 'string'
                                                    ? link.menu
                                                    : item.key ||
                                                      moreLabelToKey[label];
                                            const itemHref =
                                                typeof item === 'string'
                                                    ? explorePath({
                                                          category: link.menu,
                                                          subcategory: item,
                                                      })
                                                    : explorePath({
                                                          category: categoryKey,
                                                      });

                                            if (!hasChildren) {
                                                return (
                                                    <li key={label}>
                                                        <Link
                                                            href={itemHref}
                                                            onClick={onNavigate}
                                                            className="block px-3 py-2.5 text-[15px] font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
                                                        >
                                                            {label}
                                                        </Link>
                                                    </li>
                                                );
                                            }

                                            return (
                                                <li key={label}>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setMoreAccordion(
                                                                childOpen
                                                                    ? null
                                                                    : label,
                                                            )
                                                        }
                                                        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-[15px] font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
                                                        aria-expanded={childOpen}
                                                    >
                                                        <span>{label}</span>
                                                        <NavCaret
                                                            open={childOpen}
                                                        />
                                                    </button>
                                                    <AnimatePresence
                                                        initial={false}
                                                    >
                                                        {childOpen ? (
                                                            <motion.ul
                                                                initial={{
                                                                    height: 0,
                                                                    opacity: 0,
                                                                }}
                                                                animate={{
                                                                    height: 'auto',
                                                                    opacity: 1,
                                                                }}
                                                                exit={{
                                                                    height: 0,
                                                                    opacity: 0,
                                                                }}
                                                                transition={{
                                                                    duration: 0.2,
                                                                }}
                                                                className="overflow-hidden bg-black/15"
                                                            >
                                                                <li>
                                                                    <Link
                                                                        href={
                                                                            itemHref
                                                                        }
                                                                        onClick={
                                                                            onNavigate
                                                                        }
                                                                        className="block px-4 py-2 text-sm font-semibold text-mustard transition hover:bg-white/10"
                                                                    >
                                                                        All{' '}
                                                                        {label}
                                                                    </Link>
                                                                </li>
                                                                {children.map(
                                                                    (child) => (
                                                                        <li
                                                                            key={
                                                                                child
                                                                            }
                                                                        >
                                                                            <Link
                                                                                href={explorePath(
                                                                                    {
                                                                                        category:
                                                                                            categoryKey,
                                                                                        subcategory:
                                                                                            child,
                                                                                    },
                                                                                )}
                                                                                onClick={
                                                                                    onNavigate
                                                                                }
                                                                                className="block px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
                                                                            >
                                                                                {
                                                                                    child
                                                                                }
                                                                            </Link>
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </motion.ul>
                                                        ) : null}
                                                    </AnimatePresence>
                                                </li>
                                            );
                                        })}
                                    </motion.ul>
                                ) : null}
                            </AnimatePresence>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

export default function Navbar({ compact = false }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(compact);
    const [activeMenu, setActiveMenu] = useState(null);
    const [activeFlyout, setActiveFlyout] = useState(null);
    const [mobileAccordion, setMobileAccordion] = useState(null);
    const [mobileMoreAccordion, setMobileMoreAccordion] = useState(null);
    const [query, setQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [authTab, setAuthTab] = useState('login');
    const searchRef = useRef(null);
    const headerRef = useRef(null);
    const suggestionsRef = useRef(null);

    const openAuth = (tab = 'login') => {
        setAuthTab(tab);
        setAuthOpen(true);
        setOpen(false);
    };

    useEffect(() => {
        const onOpenAuth = (event) => {
            openAuth(event.detail?.tab || 'login');
        };
        window.addEventListener(AUTH_MODAL_EVENT, onOpenAuth);
        return () => window.removeEventListener(AUTH_MODAL_EVENT, onOpenAuth);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const params = new URLSearchParams(window.location.search);
        const authTab = params.get('auth');
        if (authTab !== 'login' && authTab !== 'register') return undefined;

        openAuth(authTab);
        params.delete('auth');
        const next = `${window.location.pathname}${
            params.toString() ? `?${params}` : ''
        }${window.location.hash}`;
        window.history.replaceState({}, '', next);
        return undefined;
    }, []);

    useEffect(() => {
        if (!searchOpen) return undefined;
        const onPointerDown = (e) => {
            const inSearch = searchRef.current?.contains(e.target);
            const inPanel = suggestionsRef.current?.contains(e.target);
            if (!inSearch && !inPanel) {
                setSearchOpen(false);
            }
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setSearchOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [searchOpen]);

    useEffect(() => {
        if (compact) {
            setScrolled(true);
            return undefined;
        }
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [compact]);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        if (!open) {
            setMobileAccordion(null);
            setMobileMoreAccordion(null);
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    const navLinks = useMemo(
        () => [
            { key: 'home', label: 'Home', href: '/', menu: null },
            {
                key: 'eatDrink',
                label: 'Eat & Drink',
                href: explorePath({ category: 'eatDrink' }),
                menu: 'eatDrink',
            },
            {
                key: 'stay',
                label: 'Stay',
                href: explorePath({ category: 'stay' }),
                menu: 'stay',
            },
            {
                key: 'thingsToDo',
                label: 'Things to do',
                href: explorePath({ category: 'thingsToDo' }),
                menu: 'thingsToDo',
            },
            {
                key: 'more',
                label: 'More',
                href: explorePath(),
                menu: 'more',
            },
        ],
        [],
    );

    const closeSearch = () => setSearchOpen(false);

    const submitSearch = (e) => {
        e.preventDefault();
        closeSearch();
        router.get(
            '/explore',
            query.trim() ? { q: query.trim() } : {},
            { preserveState: false },
        );
        setOpen(false);
    };

    const mobileMenu =
        typeof document !== 'undefined' ? (
            <AnimatePresence>
                {open ? (
                    <>
                        <motion.button
                            type="button"
                            key="mobile-nav-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-[2px] lg:hidden"
                            aria-label="Close menu"
                            onClick={() => setOpen(false)}
                        />
                        <motion.aside
                            key="mobile-nav-drawer"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{
                                type: 'spring',
                                stiffness: 380,
                                damping: 34,
                            }}
                            className="fixed inset-y-0 left-0 z-[2001] flex h-[100dvh] w-[min(20rem,86vw)] flex-col bg-[#4f5a3e] font-display shadow-lift lg:hidden"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Main menu"
                        >
                            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3.5">
                                <Logo className="min-w-0" />
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="inline-flex rounded-lg p-2 text-white transition hover:bg-white/10"
                                    aria-label="Close menu"
                                >
                                    <X className="h-5 w-5" strokeWidth={2} />
                                </button>
                            </div>

                            <MobileDrawerNav
                                navLinks={navLinks}
                                accordion={mobileAccordion}
                                setAccordion={setMobileAccordion}
                                moreAccordion={mobileMoreAccordion}
                                setMoreAccordion={setMobileMoreAccordion}
                                onNavigate={() => setOpen(false)}
                            />

                            <div className="shrink-0 border-t border-white/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                                {user ? (
                                    <Link
                                        href={route('account.index')}
                                        onClick={() => setOpen(false)}
                                        className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10 transition hover:bg-white/10"
                                    >
                                        <MemberAvatar user={user} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-white">
                                                {user.name}
                                            </p>
                                            <p className="truncate text-xs text-white/60">
                                                {user.plan_label || 'Free'} plan
                                            </p>
                                        </div>
                                    </Link>
                                ) : null}
                                {user ? (
                                    <Link
                                        href={route('account.listings.create')}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-mustard px-4 py-3.5 text-base font-bold text-olive-950 transition hover:bg-white hover:text-mustard"
                                        onClick={() => setOpen(false)}
                                    >
                                        <Plus className="h-4 w-4 stroke-[2.5]" />
                                        Add Business
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-mustard px-4 py-3.5 text-base font-bold text-olive-950 transition hover:bg-white hover:text-mustard"
                                        onClick={() => openAuth('register')}
                                    >
                                        <Plus className="h-4 w-4 stroke-[2.5]" />
                                        Add Business
                                    </button>
                                )}
                                {user ? (
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        <Link
                                            href={route('account.index')}
                                            className="inline-flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                                            onClick={() => setOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href={route('account.messages')}
                                            className="inline-flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                                            onClick={() => setOpen(false)}
                                        >
                                            Messages
                                        </Link>
                                    </div>
                                ) : null}
                            </div>
                        </motion.aside>
                    </>
                ) : null}
            </AnimatePresence>
        ) : null;

    return (
        <>
        <header
            ref={headerRef}
            data-site-nav
            className={`fixed inset-x-0 top-0 z-[1100] transition-all duration-300 ${
                scrolled || compact
                    ? 'bg-[#4f5a3e]/95 shadow-lg shadow-earth-dusk/20 backdrop-blur-md'
                    : 'bg-[#4f5a3e] lg:bg-transparent'
            }`}
        >
            <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-3.5 sm:px-5 sm:py-5 lg:px-6 xl:gap-5">
                {/* Mobile: menu + logo · account/cart */}
                <div className="flex w-full items-center justify-between lg:hidden">
                    <div className="flex min-w-0 items-center gap-1.5">
                        <button
                            type="button"
                            className="inline-flex shrink-0 rounded-lg p-2 text-white transition hover:bg-white/10"
                            onClick={() => setOpen(true)}
                            aria-expanded={open}
                            aria-label="Open menu"
                        >
                            <Menu className="h-6 w-6" strokeWidth={1.85} />
                        </button>
                        <Logo className="min-w-0" />
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                        {user ? (
                            <>
                                <MemberNotificationsBell />
                                <MemberUserMenu user={user} compact />
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => openAuth('login')}
                                className="inline-flex rounded-lg p-2 text-white transition hover:bg-white/10"
                                aria-label="Sign in or register"
                            >
                                <User className="h-5 w-5" strokeWidth={1.85} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Desktop / tablet bar */}
                <Logo className="hidden shrink-0 lg:inline-flex" />

                <form
                    ref={searchRef}
                    className="relative ml-1 hidden min-w-0 flex-1 items-center lg:flex"
                    onSubmit={submitSearch}
                    role="search"
                >
                    <Search className="pointer-events-none absolute left-0 z-10 h-4 w-4 text-white/80" />
                    <FlippingSearchHint visible={!query.trim() && !searchOpen} />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSearchOpen(true);
                            setActiveMenu(null);
                        }}
                        onFocus={() => {
                            setSearchOpen(true);
                            setActiveMenu(null);
                        }}
                        placeholder={
                            query.trim() || searchOpen
                                ? 'What are you looking for?'
                                : ''
                        }
                        aria-label="Search"
                        aria-expanded={searchOpen}
                        aria-controls="nav-search-suggestions"
                        autoComplete="off"
                        className={`site-nav-search w-full border-0 bg-transparent py-2 pl-7 text-[15px] text-white placeholder:text-white/65 focus:outline-none focus:ring-0 sm:text-base ${
                            query.trim() ? 'pr-9' : 'pr-2'
                        }`}
                    />
                    {query.trim() ? (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                                setSearchOpen(false);
                            }}
                            className="absolute right-0 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4" strokeWidth={2.25} />
                        </button>
                    ) : null}
                    {searchOpen ? (
                        <SearchSuggestions
                            query={query}
                            onSelect={closeSearch}
                            anchorRef={searchRef}
                            headerRef={headerRef}
                            panelRef={suggestionsRef}
                            id="nav-search-suggestions"
                        />
                    ) : null}
                </form>

                <nav className="hidden items-center gap-1 font-display lg:flex xl:gap-2">
                    {navLinks.map((link) => {
                        const isMore = link.menu === 'more';
                        const items = link.menu
                            ? dropdownItems[link.menu]
                            : [];
                        const flyoutItem = isMore
                            ? items.find(
                                  (item) =>
                                      typeof item !== 'string' &&
                                      item.label === activeFlyout,
                              )
                            : null;

                        return (
                            <div
                                key={link.key}
                                className="relative"
                                onMouseEnter={() => {
                                    setActiveMenu(link.menu);
                                    setActiveFlyout(null);
                                }}
                                onMouseLeave={() => {
                                    setActiveMenu(null);
                                    setActiveFlyout(null);
                                }}
                            >
                                <Link
                                    href={link.href}
                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-base font-semibold text-white/95 transition hover:bg-white/10 hover:text-white sm:text-[17px]"
                                >
                                    {link.label}
                                    {link.menu ? (
                                        <NavCaret
                                            open={activeMenu === link.menu}
                                        />
                                    ) : null}
                                </Link>
                                <AnimatePresence>
                                    {link.menu &&
                                    activeMenu === link.menu ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 4 }}
                                            transition={{ duration: 0.16 }}
                                            className={`absolute top-full z-[60] mt-1 ${
                                                isMore
                                                    ? 'right-0'
                                                    : 'left-0'
                                            }`}
                                        >
                                            <div className="relative min-w-[220px] border-t-[3px] border-mustard bg-white font-display shadow-lift">
                                                {items.map((item) => {
                                                    const label =
                                                        typeof item ===
                                                        'string'
                                                            ? item
                                                            : item.label;
                                                    const children =
                                                        typeof item ===
                                                        'string'
                                                            ? null
                                                            : item.children;
                                                    const hasFlyout =
                                                        Boolean(
                                                            children?.length,
                                                        );
                                                    const flyoutOpen =
                                                        hasFlyout &&
                                                        activeFlyout ===
                                                            label;
                                                    const itemHref =
                                                        typeof item ===
                                                        'string'
                                                            ? explorePath({
                                                                  category:
                                                                      link.menu,
                                                                  subcategory:
                                                                      item,
                                                              })
                                                            : explorePath({
                                                                  category:
                                                                      item.key ||
                                                                      moreLabelToKey[
                                                                          label
                                                                      ],
                                                              });

                                                    return (
                                                        <div
                                                            key={label}
                                                            onMouseEnter={() => {
                                                                if (
                                                                    hasFlyout
                                                                ) {
                                                                    setActiveFlyout(
                                                                        label,
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <Link
                                                                href={itemHref}
                                                                className={`flex items-center justify-between border-b border-olive-100/80 px-5 py-3.5 text-base font-semibold text-earth-dusk transition last:border-b-0 hover:bg-olive-50 hover:text-olive-800 ${
                                                                    flyoutOpen
                                                                        ? 'bg-olive-50 text-olive-800'
                                                                        : ''
                                                                }`}
                                                            >
                                                                <span>
                                                                    {label}
                                                                </span>
                                                                {hasFlyout ? (
                                                                    <svg
                                                                        viewBox="0 0 8 12"
                                                                        className="ml-3 h-3 w-2.5 shrink-0 text-earth-dusk/50"
                                                                        aria-hidden
                                                                    >
                                                                        <path
                                                                            d="M1.4 1.2 L6.2 6 L1.4 10.8"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="2.4"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                        />
                                                                    </svg>
                                                                ) : null}
                                                            </Link>
                                                        </div>
                                                    );
                                                })}

                                                {isMore &&
                                                flyoutItem?.children ? (
                                                    <div className="absolute left-full top-0 z-[70] min-w-[240px] border-t-[3px] border-mustard bg-white font-display shadow-lift">
                                                        {flyoutItem.children.map(
                                                            (child) => (
                                                                <Link
                                                                    key={
                                                                        child
                                                                    }
                                                                    href={explorePath(
                                                                        {
                                                                            category:
                                                                                flyoutItem.key ||
                                                                                moreLabelToKey[
                                                                                    flyoutItem
                                                                                        .label
                                                                                ],
                                                                            subcategory:
                                                                                child,
                                                                        },
                                                                    )}
                                                                    className="block border-b border-olive-100/80 px-5 py-3.5 text-base font-semibold text-earth-dusk transition last:border-b-0 hover:bg-olive-50 hover:text-olive-800"
                                                                >
                                                                    {child}
                                                                </Link>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </nav>

                <div className="ml-auto hidden shrink-0 items-center gap-1.5 font-display sm:gap-2 lg:flex">
                    {user ? (
                        <>
                            <MemberNotificationsBell />
                            <MemberUserMenu user={user} />
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => openAuth('login')}
                            className="inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-base font-semibold text-white/95 transition hover:bg-white/10 hover:text-white sm:text-[17px]"
                        >
                            <User className="h-4 w-4" strokeWidth={1.85} />
                            <span className="max-w-[10rem] truncate">
                                Sign in or register
                            </span>
                        </button>
                    )}

                    {user ? (
                        <Link
                            href={route('account.listings.create')}
                            className="inline-flex items-center gap-2 rounded-xl bg-mustard px-3.5 py-2.5 text-[15px] font-bold text-olive-950 shadow-[0_8px_20px_-8px_rgba(242,184,46,0.7)] transition hover:bg-white hover:text-mustard hover:shadow-md sm:px-4 sm:text-base"
                        >
                            <Plus className="h-4 w-4 stroke-[2.5]" />
                            Add Business
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={() => openAuth('register')}
                            className="inline-flex items-center gap-2 rounded-xl bg-mustard px-3.5 py-2.5 text-[15px] font-bold text-olive-950 shadow-[0_8px_20px_-8px_rgba(242,184,46,0.7)] transition hover:bg-white hover:text-mustard hover:shadow-md sm:px-4 sm:text-base"
                        >
                            <Plus className="h-4 w-4 stroke-[2.5]" />
                            Add Business
                        </button>
                    )}
                </div>
            </div>

            <AuthModal
                open={authOpen}
                initialTab={authTab}
                onClose={() => setAuthOpen(false)}
            />
        </header>
        {mobileMenu ? createPortal(mobileMenu, document.body) : null}
        </>
    );
}
