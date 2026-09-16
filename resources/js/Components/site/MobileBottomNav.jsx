import { Link, usePage } from '@inertiajs/react';
import { Compass, MessageCircle, Plus, Search } from 'lucide-react';
import { explorePath } from '@/data/categories';

const items = [
    {
        key: 'nightlife',
        label: 'Nightlife',
        href: explorePath({ category: 'thingsToDo', subcategory: 'Nightlife' }),
        icon: Search,
    },
    {
        key: 'explore',
        label: 'Explore',
        href: explorePath(),
        icon: Compass,
    },
    {
        key: 'add',
        label: 'Add',
        href: '/register',
        icon: Plus,
        circled: true,
    },
    {
        key: 'messages',
        label: 'Messages',
        href: '/explore',
        icon: MessageCircle,
    },
];

export default function MobileBottomNav() {
    const { url } = usePage();
    const path = typeof url === 'string' ? url.split('?')[0] : '/';

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-[1095] border-t border-white/10 bg-gradient-to-b from-[#5a6648] to-[#3f4734] pb-[env(safe-area-inset-bottom)] lg:hidden"
            aria-label="Mobile toolbar"
        >
            <ul className="mx-auto grid max-w-lg grid-cols-4 px-1 pt-2 pb-2.5">
                {items.map((item) => {
                    const Icon = item.icon;
                    const active =
                        item.key === 'explore'
                            ? path.startsWith('/explore')
                            : item.key === 'add'
                              ? path.startsWith('/register')
                              : item.key === 'nightlife'
                                ? path.includes('nightlife') ||
                                  path.includes('Nightlife')
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
