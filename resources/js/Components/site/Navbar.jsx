import { Link } from '@inertiajs/react';
import {
    ChevronDown,
    Menu,
    Plus,
    Search,
    ShoppingCart,
    User,
    X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import { useLocale } from '@/i18n/LocaleContext';

const dropdownItems = {
    eatDrink: [
        'Restaurants',
        'Cafes',
        'Bars & Lounges',
        'Pork Joint & BBQ',
        'Outdoor Dining',
        'Fast Food & Takeaways',
        'Bakery & Deserts',
        'Garden Restaurant',
    ],
    stay: [
        'Airbnbs',
        'Hotels',
        'Boutique Hotels',
        'Conference Hotels',
        'Luxury Camps',
        'Private Villa',
        'Resorts',
        'Safari Lodges',
        'Serviced Apartments',
        'Lodges & Camps',
    ],
    thingsToDo: [
        'Outdoor & Adventure',
        'Wildlife & Nature',
        'Gym & Fitness',
        'Nightlife',
        'Spas & Wellness',
    ],
    more: ['Services', 'Shopping', 'Properties', 'Events'],
};

export default function Navbar() {
    const { t } = useLocale();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [query, setQuery] = useState('');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    const navLinks = [
        { key: 'home', label: t.nav.home, href: '/', menu: null },
        { key: 'eatDrink', label: t.nav.eatDrink, href: '#eat', menu: 'eatDrink' },
        { key: 'stay', label: t.nav.stay, href: '#stay', menu: 'stay' },
        {
            key: 'thingsToDo',
            label: t.nav.thingsToDo,
            href: '#activities',
            menu: 'thingsToDo',
        },
        { key: 'more', label: t.nav.more, href: '#categories', menu: 'more' },
    ];

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-olive-600/95 shadow-lg shadow-earth-dusk/20 backdrop-blur-md'
                    : 'bg-transparent'
            }`}
        >
            <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-3.5 sm:px-5 sm:py-4 lg:px-6 xl:gap-5">
                <Logo className="shrink-0" />

                <form
                    className="relative ml-1 hidden min-w-0 flex-1 items-center md:flex"
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
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
                    {navLinks.map((link) => (
                        <div
                            key={link.key}
                            className="relative"
                            onMouseEnter={() => setActiveMenu(link.menu)}
                            onMouseLeave={() => setActiveMenu(null)}
                        >
                            <a
                                href={link.href}
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-[15px] font-medium text-white/95 transition hover:bg-white/10 hover:text-white sm:text-base"
                            >
                                {link.label}
                                {link.menu ? (
                                    <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                                ) : null}
                            </a>
                            <AnimatePresence>
                                {link.menu && activeMenu === link.menu ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 4 }}
                                        transition={{ duration: 0.16 }}
                                        className="absolute left-0 top-full z-50 mt-1 min-w-[220px] border-t-[3px] border-mustard bg-white shadow-lift"
                                    >
                                        {dropdownItems[link.menu].map((item) => (
                                            <a
                                                key={item}
                                                href={link.href}
                                                className="block border-b border-olive-100/80 px-5 py-3.5 text-[15px] text-earth-dusk transition last:border-b-0 hover:bg-olive-50 hover:text-olive-800"
                                            >
                                                {item}
                                            </a>
                                        ))}
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </div>
                    ))}
                </nav>

                <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2.5">
                    <Link
                        href="/login"
                        className="hidden items-center gap-1.5 rounded-lg px-2 py-2 text-[15px] text-white/95 transition hover:bg-white/10 sm:text-base xl:inline-flex"
                    >
                        <User className="h-4 w-4" />
                        <span className="max-w-[9rem] truncate">{t.nav.signIn}</span>
                    </Link>

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
                        className="overflow-hidden border-t border-white/10 bg-olive-700 lg:hidden"
                    >
                        <div className="space-y-4 px-4 py-4">
                            <form
                                className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2"
                                onSubmit={(e) => e.preventDefault()}
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
                                    <a
                                        key={link.key}
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                        className="rounded-lg px-3 py-3 text-base font-medium text-white hover:bg-white/10"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                            <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-white hover:bg-white/10"
                                    onClick={() => setOpen(false)}
                                >
                                    <User className="h-4 w-4" />
                                    {t.nav.signIn}
                                </Link>
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
        </header>
    );
}
