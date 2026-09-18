import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, Plus, Search, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { explorePath } from '@/data/categories';
import { FLIP_WORDS } from './FlippingSearchHint';

const FLIP_HREFS = {
    hotels: explorePath({ category: 'stay', subcategory: 'Hotels' }),
    events: explorePath({ category: 'events' }),
    cafes: explorePath({ category: 'eatDrink', subcategory: 'Cafes' }),
    properties: explorePath({ category: 'properties' }),
    shopping: explorePath({ category: 'shopping' }),
    Restaurants: explorePath({
        category: 'eatDrink',
        subcategory: 'Restaurants',
    }),
};

export default function MobileBottomNav() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [flipIndex, setFlipIndex] = useState(0);

    useEffect(() => {
        const id = window.setInterval(() => {
            setFlipIndex((i) => (i + 1) % FLIP_WORDS.length);
        }, 2200);
        return () => window.clearInterval(id);
    }, []);

    const flipWord = FLIP_WORDS[flipIndex];
    const flipHref = FLIP_HREFS[flipWord] || explorePath();

    let path = '/';
    try {
        const page = usePage();
        path = typeof page?.url === 'string' ? page.url.split('?')[0] : '/';
    } catch {
        path = '/';
    }

    const searchActive = useMemo(() => {
        const q = flipWord.toLowerCase();
        return (
            path.startsWith('/explore') &&
            (path.includes(q) ||
                (typeof window !== 'undefined' &&
                    window.location.search.toLowerCase().includes(q)))
        );
    }, [path, flipWord]);

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
            href: user ? route('account.listings.create') : '/register',
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

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-[1095] border-t border-white/10 bg-gradient-to-b from-[#5a6648] to-[#3f4734] pb-[env(safe-area-inset-bottom)] lg:hidden"
            aria-label="Mobile toolbar"
        >
            <ul className="mx-auto grid max-w-lg grid-cols-4 px-1 pt-2 pb-2.5">
                <li>
                    <Link
                        href={flipHref}
                        className={`flex flex-col items-center gap-1 px-1 py-1 text-white transition ${
                            searchActive ? 'opacity-100' : 'opacity-90'
                        }`}
                        aria-label={`Search ${flipWord}`}
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
                    </Link>
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
                                ? path.startsWith('/account') || path.startsWith('/login')
                                : false;

                    return (
                        <li key={item.key}>
                            <Link
                                href={item.href}
                                className={`flex flex-col items-center gap-1 px-1 py-1 text-white transition ${
                                    active ? 'opacity-100' : 'opacity-90'
                                }`}
                            >
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
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
