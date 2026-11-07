import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    CloseMark,
    MenuMark,
    SearchMark,
} from '@/Components/site/Mark';
import FlippingSearchHint from './FlippingSearchHint';
import Logo from './Logo';
import {
    MemberAvatar,
    MemberNotificationsBell,
    MemberUserMenu,
} from './MemberAccountMenu';
import SearchSuggestions from './SearchSuggestions';
import { explorePath, getCategoryByKey, mainCategories } from '@/data/categories';

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

                            
                                {isOpen ? (
                                    <ul
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
                                                    
                                                        {childOpen ? (
                                                            <ul
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
                                                            </ul>
                                                        ) : null}
                                                    
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : null}
                            
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

export default function Navbar({ compact = false }) {
    const page = usePage();
    const { auth } = page.props;
    const user = auth?.user;
    const isHomeHeroSearch =
        page.component === 'Home' || page.url === '/' || page.url.startsWith('/?');
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(compact);
    const [activeMenu, setActiveMenu] = useState(null);
    const [activeFlyout, setActiveFlyout] = useState(null);
    const [mobileAccordion, setMobileAccordion] = useState(null);
    const [mobileMoreAccordion, setMobileMoreAccordion] = useState(null);
    const [query, setQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef(null);
    const headerRef = useRef(null);
    const suggestionsRef = useRef(null);
    const menuCloseTimerRef = useRef(null);

    const clearMenuCloseTimer = () => {
        if (menuCloseTimerRef.current) {
            window.clearTimeout(menuCloseTimerRef.current);
            menuCloseTimerRef.current = null;
        }
    };

    const openDesktopMenu = (menu) => {
        clearMenuCloseTimer();
        setActiveMenu(menu);
        setActiveFlyout(null);
    };

    const scheduleCloseDesktopMenu = () => {
        clearMenuCloseTimer();
        menuCloseTimerRef.current = window.setTimeout(() => {
            setActiveMenu(null);
            setActiveFlyout(null);
            menuCloseTimerRef.current = null;
        }, 220);
    };

    useEffect(() => () => clearMenuCloseTimer(), []);

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
        typeof document !== 'undefined' && open ? (
                    <>
                        <button
                            type="button"
                            key="mobile-nav-backdrop"
                            className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-[2px] lg:hidden"
                            aria-label="Close menu"
                            onClick={() => setOpen(false)}
                        />
                        <aside
                            key="mobile-nav-drawer"
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
                                    <CloseMark className="h-5 w-5" />
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
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link
                                            href={route('account.index')}
                                            className="inline-flex items-center justify-center border border-white/15 px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                                            onClick={() => setOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href={route('account.messages')}
                                            className="inline-flex items-center justify-center border border-white/15 px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                                            onClick={() => setOpen(false)}
                                        >
                                            Messages
                                        </Link>
                                    </div>
                                ) : (
                                    <Link
                                        href={route('register')}
                                        className="inline-flex w-full items-center justify-center border border-mustard bg-mustard px-4 py-3.5 text-base font-semibold text-earth-dusk transition hover:border-white hover:bg-white"
                                        onClick={() => setOpen(false)}
                                    >
                                        Get started
                                    </Link>
                                )}
                            </div>
                        </aside>
                    </>
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
            <div className="relative mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-3.5 sm:px-5 sm:py-5 lg:px-6 xl:gap-5">
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
                            <MenuMark className="h-6 w-6" />
                        </button>
                        <Logo className="min-w-0" />
                    </div>

                    <div className="flex shrink-0 items-center">
                        {user ? (
                            <div className="flex items-center gap-2.5">
                                <MemberNotificationsBell />
                                <MemberUserMenu user={user} compact />
                            </div>
                        ) : (
                            <Link
                                href={route('register')}
                                className="inline-flex items-center justify-center border border-mustard bg-mustard px-3 py-2 text-sm font-semibold text-earth-dusk transition hover:border-white hover:bg-white"
                            >
                                Get started
                            </Link>
                        )}
                    </div>
                </div>

                {/* Desktop / tablet bar */}
                <Logo className="relative z-10 hidden shrink-0 lg:inline-flex" />

                <form
                    ref={searchRef}
                    className={`relative z-10 ml-1 hidden min-w-0 max-w-xs flex-1 items-center xl:max-w-sm ${
                        isHomeHeroSearch ? 'lg:hidden' : 'lg:flex'
                    }`}
                    onSubmit={submitSearch}
                    role="search"
                >
                    <SearchMark className="pointer-events-none absolute left-0 z-10 h-4 w-4 text-white/80" />
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
                            <CloseMark className="h-4 w-4" />
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

                <nav className="absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 font-display lg:flex xl:gap-2">
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
                        const menuOpen =
                            Boolean(link.menu) && activeMenu === link.menu;

                        return (
                            <div
                                key={link.key}
                                className={`relative ${menuOpen ? 'z-30' : ''}`}
                                onMouseEnter={() => {
                                    if (link.menu) {
                                        openDesktopMenu(link.menu);
                                    } else {
                                        clearMenuCloseTimer();
                                        setActiveMenu(null);
                                        setActiveFlyout(null);
                                    }
                                }}
                                onMouseLeave={() => {
                                    if (link.menu) {
                                        scheduleCloseDesktopMenu();
                                    }
                                }}
                            >
                                <Link
                                    href={link.href}
                                    prefetch
                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-base font-semibold text-white/95 transition hover:bg-white/10 hover:text-white sm:text-[17px]"
                                >
                                    {link.label}
                                    {link.menu ? (
                                        <NavCaret
                                            open={activeMenu === link.menu}
                                        />
                                    ) : null}
                                </Link>

                                {menuOpen ? (
                                    <div
                                        className={`absolute top-full z-40 pt-2 ${
                                            isMore ? 'right-0' : 'left-0'
                                        }`}
                                    >
                                        <div className="relative min-w-[220px] border-t-[3px] border-mustard bg-white font-display shadow-lift">
                                            {items.map((item) => {
                                                const label =
                                                    typeof item === 'string'
                                                        ? item
                                                        : item.label;
                                                const children =
                                                    typeof item === 'string'
                                                        ? null
                                                        : item.children;
                                                const hasFlyout = Boolean(
                                                    children?.length,
                                                );
                                                const flyoutOpen =
                                                    hasFlyout &&
                                                    activeFlyout === label;
                                                const itemHref =
                                                    typeof item === 'string'
                                                        ? explorePath({
                                                              category:
                                                                  link.menu,
                                                              subcategory: item,
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
                                                            if (hasFlyout) {
                                                                setActiveFlyout(
                                                                    label,
                                                                );
                                                            } else {
                                                                setActiveFlyout(
                                                                    null,
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
                                                            <span>{label}</span>
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
                                                <div className="absolute right-full top-0 z-50 flex pr-1.5">
                                                    <div className="min-w-[240px] border-t-[3px] border-mustard bg-white font-display shadow-lift">
                                                        {flyoutItem.children.map(
                                                            (child) => (
                                                                <Link
                                                                    key={child}
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
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </nav>

                <div className="relative z-10 ml-auto hidden shrink-0 items-center font-display lg:flex">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <MemberNotificationsBell />
                            <MemberUserMenu user={user} />
                        </div>
                    ) : (
                        <Link
                            href={route('register')}
                            className="inline-flex items-center justify-center border border-mustard bg-mustard px-3.5 py-2.5 text-[15px] font-semibold text-earth-dusk transition hover:border-white hover:bg-white sm:px-4 sm:text-base"
                        >
                            Get started
                        </Link>
                    )}
                </div>
            </div>
        </header>
        {mobileMenu ? createPortal(mobileMenu, document.body) : null}
        </>
    );
}
