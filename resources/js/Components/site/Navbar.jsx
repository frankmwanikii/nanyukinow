import { Link, router } from '@inertiajs/react';
import {
    Menu,
    Plus,
    Search,
    ShoppingCart,
    User,
    X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import AuthModal from './AuthModal';
import Logo from './Logo';
import { explorePath, getCategoryByKey, mainCategories } from '@/data/categories';
import { useLocale } from '@/i18n/LocaleContext';

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

export default function Navbar({ compact = false }) {
    const { t } = useLocale();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(compact);
    const [activeMenu, setActiveMenu] = useState(null);
    const [activeFlyout, setActiveFlyout] = useState(null);
    const [query, setQuery] = useState('');
    const [authOpen, setAuthOpen] = useState(false);
    const [authTab, setAuthTab] = useState('login');

    const openAuth = (tab = 'login') => {
        setAuthTab(tab);
        setAuthOpen(true);
        setOpen(false);
    };

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
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    const navLinks = useMemo(
        () => [
            { key: 'home', label: t.nav.home, href: '/', menu: null },
            {
                key: 'eatDrink',
                label: t.nav.eatDrink,
                href: explorePath({ category: 'eatDrink' }),
                menu: 'eatDrink',
            },
            {
                key: 'stay',
                label: t.nav.stay,
                href: explorePath({ category: 'stay' }),
                menu: 'stay',
            },
            {
                key: 'thingsToDo',
                label: t.nav.thingsToDo,
                href: explorePath({ category: 'thingsToDo' }),
                menu: 'thingsToDo',
            },
            {
                key: 'more',
                label: t.nav.more,
                href: explorePath(),
                menu: 'more',
            },
        ],
        [t],
    );

    const submitSearch = (e) => {
        e.preventDefault();
        router.get(
            '/explore',
            query.trim() ? { q: query.trim() } : {},
            { preserveState: false },
        );
        setOpen(false);
    };

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
                scrolled || compact
                    ? 'bg-[#4f5a3e]/95 shadow-lg shadow-earth-dusk/20 backdrop-blur-md'
                    : 'bg-transparent'
            }`}
        >
            <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-3.5 sm:px-5 sm:py-4 lg:px-6 xl:gap-5">
                <Logo className="shrink-0" />

                <form
                    className="relative ml-1 hidden min-w-0 flex-1 items-center md:flex"
                    onSubmit={submitSearch}
                    role="search"
                >
                    <Search className="pointer-events-none absolute left-0 h-4 w-4 text-white/80" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t.nav.searchPlaceholder}
                        className="w-full border-0 bg-transparent py-2 pl-7 pr-2 text-[15px] text-white placeholder:text-white/65 focus:outline-none focus:ring-0 sm:text-base"
                    />
                </form>

                <nav className="hidden items-center gap-1 lg:flex xl:gap-2">
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
                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-[15px] font-medium text-white/95 transition hover:bg-white/10 hover:text-white sm:text-base"
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
                                            <div className="relative min-w-[220px] border-t-[3px] border-mustard bg-white shadow-lift">
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
                                                                className={`flex items-center justify-between border-b border-olive-100/80 px-5 py-3.5 text-[15px] text-earth-dusk transition last:border-b-0 hover:bg-olive-50 hover:text-olive-800 ${
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
                                                    <div className="absolute left-full top-0 z-[70] min-w-[240px] border-t-[3px] border-mustard bg-white shadow-lift">
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
                                                                    className="block border-b border-olive-100/80 px-5 py-3.5 text-[15px] text-earth-dusk transition last:border-b-0 hover:bg-olive-50 hover:text-olive-800"
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

                <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2.5">
                    <button
                        type="button"
                        onClick={() => openAuth('login')}
                        className="hidden items-center gap-2 rounded-lg px-2.5 py-2 text-[15px] font-medium text-white/95 transition hover:bg-white/10 hover:text-white sm:text-base lg:inline-flex"
                    >
                        <User className="h-4 w-4" strokeWidth={1.85} />
                        <span className="max-w-[10rem] truncate">{t.nav.signIn}</span>
                    </button>

                    <button
                        type="button"
                        className="hidden rounded-lg p-2 text-white transition hover:bg-white/10 sm:inline-flex"
                        aria-label="Cart"
                    >
                        <ShoppingCart className="h-5 w-5" strokeWidth={1.75} />
                    </button>

                    <button
                        type="button"
                        className="inline-flex rounded-lg p-2 text-white transition hover:bg-white/10 lg:hidden"
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-label={open ? 'Close menu' : 'Open menu'}
                    >
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>

                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 rounded-xl bg-mustard px-3.5 py-2.5 text-sm font-bold text-olive-950 shadow-[0_8px_20px_-8px_rgba(242,184,46,0.7)] transition hover:bg-white hover:text-mustard hover:shadow-md sm:px-4 sm:text-[15px]"
                    >
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                        {t.nav.addBusiness}
                    </Link>
                </div>
            </div>

            <AnimatePresence>
                {open ? (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-white/10 bg-[#4f5a3e] lg:hidden"
                    >
                        <div className="space-y-4 px-4 py-4">
                            <form
                                className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2"
                                onSubmit={submitSearch}
                            >
                                <Search className="h-4 w-4 text-white/80" />
                                <input
                                    type="search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={t.nav.searchPlaceholder}
                                    className="w-full border-0 bg-transparent text-sm text-white placeholder:text-white/65 focus:outline-none focus:ring-0"
                                />
                            </form>
                            <div className="flex flex-col gap-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.key}
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                        className="rounded-lg px-3 py-3 text-base font-medium text-white hover:bg-white/10"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                            <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
                                <button
                                    type="button"
                                    onClick={() => openAuth('login')}
                                    className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-left text-white transition hover:bg-white/10"
                                >
                                    <User className="h-4 w-4" />
                                    {t.nav.signIn}
                                </button>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-mustard px-4 py-3 font-bold text-olive-950 transition hover:bg-white hover:text-mustard"
                                    onClick={() => setOpen(false)}
                                >
                                    <Plus className="h-4 w-4 stroke-[2.5]" />
                                    {t.nav.addBusiness}
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <AuthModal
                open={authOpen}
                initialTab={authTab}
                onClose={() => setAuthOpen(false)}
            />
        </header>
    );
}
