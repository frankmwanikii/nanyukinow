import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    CheckCheck,
    ChevronDown,
    LayoutDashboard,
    LogOut,
    Settings,
    Sparkles,
    Plus,
} from 'lucide-react';
import { useMemo, useState } from 'react';

function userInitials(name = '') {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'M';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function MemberAvatar({ user, size = 'md' }) {
    const initials = useMemo(() => userInitials(user?.name), [user?.name]);
    const box = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm';

    if (user?.avatar_url) {
        return (
            <img
                src={user.avatar_url}
                alt=""
                className={`${box} rounded-full object-cover ring-2 ring-white/25`}
            />
        );
    }

    return (
        <div
            className={`flex ${box} items-center justify-center rounded-full bg-mustard font-bold text-earth-dusk ring-2 ring-white/20`}
            aria-hidden
        >
            {initials}
        </div>
    );
}

export function MemberUserMenu({ user, compact = false }) {
    const [open, setOpen] = useState(false);

    if (!user) return null;

    const items = [
        {
            label: 'My account',
            href: route('account.index'),
            icon: LayoutDashboard,
        },
        {
            label: 'Add listing',
            href: route('account.listings.create'),
            icon: Plus,
        },
        {
            label: 'Upgrade plan',
            href: route('account.upgrade'),
            icon: Sparkles,
            hide: user.plan === 'premium',
        },
        {
            label: 'Notifications',
            href: route('account.notifications'),
            icon: Bell,
        },
        {
            label: 'Settings',
            href: route('profile.edit'),
            icon: Settings,
        },
    ].filter((item) => !item.hide);

    return (
        <div className="relative shrink-0">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label="Account menu"
                className={`flex items-center gap-2 rounded-full bg-white/10 text-left text-white ring-1 ring-inset ring-white/15 transition hover:bg-white/15 ${
                    compact ? 'p-0.5' : 'py-1 pl-1 pr-2.5'
                }`}
            >
                <MemberAvatar user={user} size={compact ? 'sm' : 'md'} />
                {!compact && (
                    <>
                        <div className="hidden min-w-0 xl:block">
                            <p className="max-w-[7.5rem] truncate text-sm font-semibold leading-tight">
                                {user.name?.split(' ')[0] || 'Member'}
                            </p>
                            <p className="truncate text-[11px] leading-tight text-white/65">
                                {user.plan_label || 'Free'} plan
                            </p>
                        </div>
                        <ChevronDown
                            className={`h-3.5 w-3.5 shrink-0 text-white/70 transition ${open ? 'rotate-180' : ''}`}
                        />
                    </>
                )}
            </button>

            {open && (
                <>
                    <button
                        type="button"
                        aria-label="Close menu"
                        className="fixed inset-0 z-[1300] cursor-default"
                        onClick={() => setOpen(false)}
                    />
                    <div
                        role="menu"
                        className="absolute right-0 z-[1301] mt-2 w-64 overflow-hidden rounded-2xl border border-olive-100 bg-white py-1 shadow-lift"
                    >
                        <div className="border-b border-olive-100 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <MemberAvatar user={user} />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-olive-950">
                                        {user.name}
                                    </p>
                                    <p className="truncate text-xs text-olive-500">{user.email}</p>
                                    <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-mustard">
                                        {user.plan_label || 'Free'} ·{' '}
                                        {user.listings_remaining ?? 0} slots left
                                    </p>
                                </div>
                            </div>
                        </div>

                        {items.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    role="menuitem"
                                    onClick={() => setOpen(false)}
                                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-olive-800 transition hover:bg-olive-50"
                                >
                                    <Icon className="h-4 w-4 text-olive-500" strokeWidth={1.9} />
                                    {item.label}
                                </Link>
                            );
                        })}

                        <div className="border-t border-olive-100 py-1">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                role="menuitem"
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                            >
                                <LogOut className="h-4 w-4" strokeWidth={1.9} />
                                Sign out
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function NotificationIcon({ type }) {
    if (type === 'check' || type === 'sparkles') {
        return <Sparkles className="h-4 w-4 text-mustard" strokeWidth={2} />;
    }
    return <Bell className="h-4 w-4 text-olive-500" strokeWidth={2} />;
}

export function MemberNotificationsBell() {
    const { notifications } = usePage().props;
    const [open, setOpen] = useState(false);
    const unread = notifications?.unread_count || 0;
    const recent = notifications?.recent || [];

    const openItem = (item) => {
        setOpen(false);
        router.post(route('account.notifications.read', item.id));
    };

    const markAll = () => {
        router.post(route('account.notifications.read-all'), {}, { preserveScroll: true });
    };

    return (
        <div className="relative shrink-0">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={unread ? `${unread} unread notifications` : 'Notifications'}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-inset ring-white/15 transition hover:bg-white/15"
            >
                <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
                {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mustard px-1 text-[10px] font-bold text-earth-dusk shadow-sm">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <button
                        type="button"
                        aria-label="Close notifications"
                        className="fixed inset-0 z-[1300] cursor-default"
                        onClick={() => setOpen(false)}
                    />
                    <div
                        role="menu"
                        className="absolute right-0 z-[1301] mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-olive-100 bg-white shadow-lift"
                    >
                        <div className="flex items-center justify-between border-b border-olive-100 px-4 py-3">
                            <div>
                                <p className="text-sm font-semibold text-olive-950">Notifications</p>
                                <p className="text-xs text-olive-500">
                                    {unread > 0 ? `${unread} unread` : 'You’re all caught up'}
                                </p>
                            </div>
                            {unread > 0 && (
                                <button
                                    type="button"
                                    onClick={markAll}
                                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-olive-700 transition hover:bg-olive-50"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Mark all
                                </button>
                            )}
                        </div>

                        <div className="max-h-[22rem] overflow-y-auto">
                            {recent.length === 0 ? (
                                <div className="px-4 py-10 text-center">
                                    <Bell className="mx-auto h-8 w-8 text-olive-300" />
                                    <p className="mt-3 text-sm font-medium text-olive-800">
                                        No notifications yet
                                    </p>
                                    <p className="mt-1 text-xs text-olive-500">
                                        Listing approvals and plan updates will show up here.
                                    </p>
                                </div>
                            ) : (
                                <ul>
                                    {recent.map((item) => (
                                        <li key={item.id}>
                                            <button
                                                type="button"
                                                onClick={() => openItem(item)}
                                                className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-olive-50 ${
                                                    !item.read_at ? 'bg-mustard/5' : ''
                                                }`}
                                            >
                                                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-olive-50">
                                                    <NotificationIcon type={item.icon} />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-start justify-between gap-2">
                                                        <span className="text-sm font-semibold text-olive-950">
                                                            {item.title}
                                                        </span>
                                                        {!item.read_at && (
                                                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-mustard" />
                                                        )}
                                                    </span>
                                                    <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-olive-600">
                                                        {item.body}
                                                    </span>
                                                    <span className="mt-1 block text-[11px] text-olive-400">
                                                        {item.created_ago}
                                                    </span>
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="border-t border-olive-100 p-2">
                            <Link
                                href={route('account.notifications')}
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-semibold text-olive-800 transition hover:bg-olive-50"
                            >
                                View all notifications
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
