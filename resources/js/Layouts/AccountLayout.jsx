import SiteLayout from '@/Layouts/SiteLayout';
import { MemberAvatar } from '@/Components/site/MemberAccountMenu';
import { Link, usePage } from '@inertiajs/react';
import {
    CreditCard,
    Home,
    LayoutDashboard,
    Menu,
    MessageSquare,
    PlusCircle,
    Settings,
    Sparkles,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

/** Matches fixed site navbar height (compact) */
const NAV_H = '4.75rem';

function navActive(patterns) {
    return patterns.some((pattern) => {
        try {
            return route().current(pattern);
        } catch {
            return false;
        }
    });
}

export default function AccountLayout({ title = 'Account', children }) {
    const { auth, messages, notifications } = usePage().props;
    const user = auth?.user;
    const [mobileOpen, setMobileOpen] = useState(false);

    const unreadMessages =
        (messages?.unread_count || 0) + (notifications?.unread_count || 0);

    const items = useMemo(
        () =>
            [
                {
                    label: 'Home',
                    href: route('account.index'),
                    icon: LayoutDashboard,
                    active: navActive(['account.index']),
                },
                {
                    label: 'Add listing',
                    href: route('account.listings.create'),
                    icon: PlusCircle,
                    active: navActive(['account.listings.create', 'account.listings.edit']),
                },
                {
                    label: 'Messages',
                    href: route('account.messages'),
                    icon: MessageSquare,
                    active: navActive(['account.messages', 'account.messages.show']),
                    badge: unreadMessages,
                },
                {
                    label: 'Plans',
                    href: route('account.upgrade'),
                    icon: Sparkles,
                    active: navActive(['account.upgrade']),
                    hide: user?.plan === 'premium',
                },
                {
                    label: 'Billing',
                    href: route('pricing'),
                    icon: CreditCard,
                    active: navActive(['pricing']),
                },
                {
                    label: 'Settings',
                    href: route('profile.edit'),
                    icon: Settings,
                    active: navActive(['profile.edit']),
                },
            ].filter((item) => !item.hide),
        [user?.plan, unreadMessages],
    );

    const Sidebar = ({ onNavigate }) => (
        <div className="flex h-full flex-col">
            {user && (
                <div className="flex items-center gap-3 border-b border-olive-100 px-3 py-4">
                    <MemberAvatar user={user} size="sm" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold leading-tight text-olive-950">
                            {user.name}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-olive-500">
                            {user.plan_label || 'Free'}
                        </p>
                    </div>
                </div>
            )}

            <nav className="flex-1 space-y-px px-1.5 py-2" aria-label="Account">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={onNavigate}
                            className={`group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition ${
                                item.active
                                    ? 'bg-olive-100/80 text-olive-950'
                                    : 'text-olive-600 hover:bg-olive-50 hover:text-olive-900'
                            }`}
                        >
                            {item.active && (
                                <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-mustard" />
                            )}
                            <Icon
                                className={`h-[18px] w-[18px] shrink-0 ${
                                    item.active
                                        ? 'text-olive-900'
                                        : 'text-olive-400 group-hover:text-olive-700'
                                }`}
                                strokeWidth={1.75}
                            />
                            <span className="min-w-0 flex-1 truncate">{item.label}</span>
                            {item.badge > 0 && (
                                <span className="min-w-[1.25rem] rounded bg-mustard px-1 py-0.5 text-center text-[10px] font-bold leading-none text-earth-dusk">
                                    {item.badge > 9 ? '9+' : item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-olive-100 px-1.5 py-2">
                <Link
                    href={route('home')}
                    onClick={onNavigate}
                    className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-olive-600 transition hover:bg-olive-50 hover:text-olive-900"
                >
                    <Home className="h-[18px] w-[18px] text-olive-400" strokeWidth={1.75} />
                    Browse site
                </Link>
            </div>
        </div>
    );

    return (
        <SiteLayout hideFooter compactNav>
            {/* Full-bleed shell under fixed site navbar */}
            <div style={{ paddingTop: NAV_H }} className="min-h-svh">
                {/* Desktop: extreme-left fixed sidebar */}
                <aside
                    className="fixed bottom-0 left-0 z-30 hidden w-[15rem] border-r border-olive-200 bg-white lg:block xl:w-[15.5rem]"
                    style={{ top: NAV_H }}
                >
                    <Sidebar />
                </aside>

                {/* Mobile drawer — also flush left */}
                {mobileOpen && (
                    <>
                        <button
                            type="button"
                            aria-label="Close menu"
                            className="fixed inset-0 z-[1150] bg-olive-950/40 lg:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                        <aside
                            className="fixed bottom-0 left-0 z-[1160] flex w-[min(15.5rem,88vw)] flex-col border-r border-olive-200 bg-white shadow-lift lg:hidden"
                            style={{ top: 0, paddingTop: NAV_H }}
                        >
                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                className="absolute right-2 top-3 inline-flex h-9 w-9 items-center justify-center text-olive-700"
                                aria-label="Close menu"
                                style={{ top: `calc(${NAV_H} + 0.25rem)` }}
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <Sidebar onNavigate={() => setMobileOpen(false)} />
                        </aside>
                    </>
                )}

                <div className="min-w-0 bg-[#f4f2ec] lg:pl-[15rem] xl:pl-[15.5rem]">
                    <header
                        className="sticky z-20 flex items-center gap-3 border-b border-olive-200/80 bg-[#f4f2ec]/95 px-4 py-3 backdrop-blur sm:px-6"
                        style={{ top: NAV_H }}
                    >
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="inline-flex h-9 w-9 items-center justify-center text-olive-700 lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <h1 className="truncate font-display text-xl font-semibold tracking-tight text-olive-950 sm:text-2xl">
                            {title}
                        </h1>
                    </header>

                    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</div>
                </div>
            </div>
        </SiteLayout>
    );
}
