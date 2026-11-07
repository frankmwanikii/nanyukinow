import { Link, router, usePage } from '@inertiajs/react';
import { tryOpenAccountMenu } from '@/lib/accountMenuBridge';
import {
    BellMark,
    CheckMark,
    DashboardMark,
    DisclosureMark,
    GearMark,
    MessageMark,
    PlusMark,
    SignOutMark,
    UpgradePlansMark,
} from '@/Components/site/Mark';
import { useEffect, useMemo, useState } from 'react';

function userInitials(name = '') {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'M';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function MemberAvatar({ user, size = 'md', className = '' }) {
    const initials = useMemo(() => userInitials(user?.name), [user?.name]);
    const [failed, setFailed] = useState(false);
    const box = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm';

    useEffect(() => {
        setFailed(false);
    }, [user?.avatar_url]);

    if (user?.avatar_url && !failed) {
        return (
            <img
                src={user.avatar_url}
                alt=""
                onError={() => setFailed(true)}
                className={`${box} rounded-full object-cover ${className}`}
            />
        );
    }

    return (
        <div
            className={`flex ${box} items-center justify-center rounded-full bg-mustard font-semibold text-earth-dusk ${className}`}
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
            label: 'Dashboard',
            href: route('account.index'),
            icon: DashboardMark,
        },
        {
            label: 'Add listing',
            href: route('account.listings.create'),
            icon: PlusMark,
        },
        {
            label: 'Upgrade plan',
            href: route('account.upgrade'),
            icon: UpgradePlansMark,
            hide: user.plan === 'premium',
        },
        {
            label: 'Messages',
            href: route('account.messages'),
            icon: MessageMark,
        },
        {
            label: 'Settings',
            href: route('profile.edit'),
            icon: GearMark,
        },
    ].filter((item) => !item.hide);

    return (
        <div className="relative shrink-0">
            <button
                type="button"
                onClick={() => {
                    if (tryOpenAccountMenu()) {
                        return;
                    }
                    setOpen((v) => !v);
                }}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label="Account menu"
                className={`group flex items-center text-left text-white transition ${
                    compact ? '' : 'gap-1.5'
                }`}
            >
                <MemberAvatar user={user} size={compact ? 'sm' : 'md'} />
                {!compact && (
                    <DisclosureMark
                        className={`h-3.5 w-3.5 shrink-0 text-white/55 transition group-hover:text-white ${
                            open ? 'rotate-180 text-white' : ''
                        }`}
                    />
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
                        className="absolute right-0 z-[1301] mt-2.5 w-64 border border-olive-900/15 bg-white py-1"
                    >
                        <div className="border-b border-olive-900/10 px-4 py-3.5">
                            <div className="flex items-center gap-3">
                                <MemberAvatar user={user} />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-olive-950">
                                        {user.name}
                                    </p>
                                    <p className="truncate text-xs text-olive-500">
                                        {user.email}
                                    </p>
                                    <p className="mt-1 text-[11px] font-semibold text-olive-700">
                                        {user.plan_label || 'Free'} plan
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
                                    <Icon className="h-4 w-4 text-olive-500" />
                                    {item.label}
                                </Link>
                            );
                        })}

                        <div className="border-t border-olive-900/10 py-1">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                role="menuitem"
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                            >
                                <SignOutMark className="h-4 w-4" />
                                Sign out
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export function MemberNotificationsBell() {
    const { notifications, messages } = usePage().props;
    const [open, setOpen] = useState(false);
    const alertUnread = notifications?.unread_count || 0;
    const chatUnread = messages?.unread_count || 0;
    const unread = alertUnread + chatUnread;
    const recentAlerts = notifications?.recent || [];
    const recentChats = messages?.recent || [];

    const openAlert = (item) => {
        setOpen(false);
        router.post(route('account.notifications.read', item.id));
    };

    const markAll = () => {
        router.post(route('account.messages.read-all'), {}, { preserveScroll: true });
    };

    return (
        <div className="relative shrink-0">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={unread ? `${unread} unread` : 'Messages'}
                title="Messages"
                className="relative inline-flex h-9 w-9 items-center justify-center text-white/85 transition hover:text-white"
            >
                <BellMark className="h-5 w-5" />
                {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mustard px-1 text-[10px] font-bold leading-none text-earth-dusk">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <button
                        type="button"
                        aria-label="Close messages"
                        className="fixed inset-0 z-[1300] cursor-default"
                        onClick={() => setOpen(false)}
                    />
                    <div
                        role="menu"
                        className="absolute right-0 z-[1301] mt-2 w-[min(22rem,calc(100vw-1.5rem))] border border-olive-900/15 bg-white"
                    >
                        <div className="flex items-center justify-between border-b border-olive-900/10 px-4 py-3">
                            <div>
                                <p className="text-sm font-semibold text-olive-950">
                                    Messages
                                </p>
                                <p className="text-xs text-olive-500">
                                    {unread > 0
                                        ? `${unread} unread`
                                        : 'You’re all caught up'}
                                </p>
                            </div>
                            {unread > 0 && (
                                <button
                                    type="button"
                                    onClick={markAll}
                                    className="inline-flex items-center gap-1 border border-olive-900/15 px-2.5 py-1 text-xs font-semibold text-olive-700 transition hover:bg-olive-50"
                                >
                                    <CheckMark className="h-3.5 w-3.5" />
                                    Mark all
                                </button>
                            )}
                        </div>

                        <div className="max-h-[22rem] overflow-y-auto">
                            {recentChats.length === 0 && recentAlerts.length === 0 ? (
                                <div className="px-4 py-10 text-center">
                                    <BellMark className="mx-auto h-8 w-8 text-olive-300" />
                                    <p className="mt-3 text-sm font-medium text-olive-800">
                                        No messages yet
                                    </p>
                                    <p className="mt-1 text-xs text-olive-500">
                                        Listing chats and account alerts show up here.
                                    </p>
                                </div>
                            ) : (
                                <ul>
                                    {recentChats.slice(0, 4).map((item) => (
                                        <li key={`c-${item.id}`}>
                                            <Link
                                                href={item.url}
                                                onClick={() => setOpen(false)}
                                                className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-olive-50 ${
                                                    item.unread ? 'bg-mustard/5' : ''
                                                }`}
                                            >
                                                <MemberAvatar
                                                    user={{
                                                        name: item.from,
                                                        avatar_url: item.avatar_url,
                                                    }}
                                                    size="sm"
                                                    className="mt-0.5 shrink-0"
                                                />
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-start justify-between gap-2">
                                                        <span className="truncate text-sm font-semibold text-olive-950">
                                                            {item.from}
                                                        </span>
                                                        {item.unread && (
                                                            <span className="mt-1 h-2 w-2 shrink-0 bg-mustard" />
                                                        )}
                                                    </span>
                                                    <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-olive-600">
                                                        {item.body}
                                                    </span>
                                                    <span className="mt-1 block text-[11px] text-olive-400">
                                                        {item.created_ago}
                                                    </span>
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                    {recentAlerts.slice(0, 4).map((item) => (
                                        <li key={`a-${item.id}`}>
                                            <button
                                                type="button"
                                                onClick={() => openAlert(item)}
                                                className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-olive-50 ${
                                                    !item.read_at ? 'bg-mustard/5' : ''
                                                }`}
                                            >
                                                <img
                                                    src={
                                                        item.sender_avatar ||
                                                        '/images/logo.png'
                                                    }
                                                    alt=""
                                                    className="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover"
                                                />
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-start justify-between gap-2">
                                                        <span className="text-sm font-semibold text-olive-950">
                                                            {item.sender_name ||
                                                                'Nanyuki Now'}
                                                        </span>
                                                        {!item.read_at && (
                                                            <span className="mt-1 h-2 w-2 shrink-0 bg-mustard" />
                                                        )}
                                                    </span>
                                                    <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-olive-600">
                                                        {item.title}
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

                        <div className="border-t border-olive-900/10 p-2">
                            <Link
                                href={route('account.messages')}
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center justify-center border border-olive-900/15 px-3 py-2.5 text-sm font-semibold text-olive-800 transition hover:bg-olive-50"
                            >
                                View all messages
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
