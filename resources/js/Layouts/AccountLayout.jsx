import SiteLayout from '@/Layouts/SiteLayout';
import { MemberAvatar } from '@/Components/site/MemberAccountMenu';
import { Link, usePage } from '@inertiajs/react';
import {
    CreditCard,
    Home,
    LayoutDashboard,
    MessageSquare,
    PlusCircle,
    Settings,
    Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';

function navActive(patterns) {
    return patterns.some((pattern) => {
        try {
            return route().current(pattern);
        } catch {
            return false;
        }
    });
}

export default function AccountLayout({
    title = 'Account',
    children,
    wide = false,
}) {
    const { auth, messages, notifications } = usePage().props;
    const user = auth?.user;
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
                    tone: 'text-sky-700 bg-sky-100',
                },
                {
                    label: 'Add listing',
                    href: route('account.listings.create'),
                    icon: PlusCircle,
                    active: navActive(['account.listings.create', 'account.listings.edit']),
                    tone: 'text-emerald-700 bg-emerald-100',
                },
                {
                    label: 'Messages',
                    href: route('account.messages'),
                    icon: MessageSquare,
                    active: navActive(['account.messages', 'account.messages.show']),
                    tone: 'text-violet-700 bg-violet-100',
                    badge: unreadMessages,
                },
                {
                    label: 'Plans',
                    href: route('account.upgrade'),
                    icon: Sparkles,
                    active: navActive(['account.upgrade']),
                    tone: 'text-amber-700 bg-amber-100',
                    hide: user?.plan === 'premium',
                },
                {
                    label: 'Billing tips',
                    href: route('pricing'),
                    icon: CreditCard,
                    active: navActive(['pricing']),
                    tone: 'text-rose-700 bg-rose-100',
                },
                {
                    label: 'Personal info',
                    href: route('profile.edit'),
                    icon: Settings,
                    active: navActive(['profile.edit']),
                    tone: 'text-olive-700 bg-olive-100',
                },
                {
                    label: 'Browse site',
                    href: route('home'),
                    icon: Home,
                    active: false,
                    tone: 'text-olive-600 bg-olive-50',
                },
            ].filter((item) => !item.hide),
        [user?.plan, unreadMessages],
    );

    return (
        <SiteLayout>
            <div className="border-b border-olive-200/70 bg-gradient-to-b from-olive-900 to-olive-800">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 pb-5 pt-24 sm:px-6 sm:pt-28">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mustard">
                            Account
                        </p>
                        <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
                            {title}
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => setMobileNavOpen((v) => !v)}
                        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white lg:hidden"
                    >
                        Menu
                    </button>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                <div className={`flex flex-col gap-6 lg:flex-row ${wide ? '' : ''}`}>
                    <aside
                        className={`${
                            mobileNavOpen ? 'block' : 'hidden'
                        } w-full shrink-0 lg:block lg:w-64`}
                    >
                        <div className="overflow-hidden rounded-3xl border border-olive-200/80 bg-white shadow-soft">
                            {user && (
                                <div className="border-b border-olive-100 px-5 py-5 text-center">
                                    <div className="mx-auto mb-3 flex justify-center">
                                        <MemberAvatar user={user} className="!h-16 !w-16 !text-lg" />
                                    </div>
                                    <p className="truncate font-display text-lg font-bold text-olive-950">
                                        {user.name}
                                    </p>
                                    <p className="mt-0.5 truncate text-sm text-olive-500">
                                        {user.email}
                                    </p>
                                    {user.plan_label && (
                                        <span className="mt-3 inline-flex rounded-full bg-mustard/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-earth-dusk">
                                            {user.plan_label}
                                        </span>
                                    )}
                                </div>
                            )}

                            <nav className="space-y-1 p-3" aria-label="Account">
                                {items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            onClick={() => setMobileNavOpen(false)}
                                            className={`flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-semibold transition ${
                                                item.active
                                                    ? 'bg-olive-800 text-white shadow-sm'
                                                    : 'text-olive-700 hover:bg-olive-50'
                                            }`}
                                        >
                                            <span
                                                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                                    item.active
                                                        ? 'bg-white/15 text-mustard'
                                                        : item.tone
                                                }`}
                                            >
                                                <Icon className="h-4 w-4" strokeWidth={2} />
                                            </span>
                                            <span className="min-w-0 flex-1 truncate">{item.label}</span>
                                            {item.badge > 0 && (
                                                <span
                                                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                                        item.active
                                                            ? 'bg-mustard text-earth-dusk'
                                                            : 'bg-mustard/25 text-earth-dusk'
                                                    }`}
                                                >
                                                    {item.badge > 9 ? '9+' : item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    <div className="min-w-0 flex-1">{children}</div>
                </div>
            </div>
        </SiteLayout>
    );
}
