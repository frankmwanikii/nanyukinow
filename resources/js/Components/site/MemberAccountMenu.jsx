import { Link, router, usePage } from '@inertiajs/react';
import { tryOpenAccountMenu } from '@/lib/accountMenuBridge';
import {
    BellMark,
    BookmarkMark,
    CheckMark,
    DashboardMark,
    DisclosureMark,
    GearMark,
    ListMark,
    MailMark,
    MessageMark,
    SignOutMark,
    UpgradePlansMark,
} from '@/Components/site/Mark';
import { plainText } from '@/utils/plainText';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Position a fixed menu under a trigger, right-aligned, without overflowing
 * the viewport (common on mobile when the panel is nearly full-width).
 *
 * @param {boolean} open
 * @param {{ maxWidth?: number, edgeGap?: number }} [options]
 */
function useAnchoredMenu(open, { maxWidth = 256, edgeGap = 12 } = {}) {
    const triggerRef = useRef(null);
    const [coords, setCoords] = useState(null);

    useEffect(() => {
        if (!open) {
            setCoords(null);
            return undefined;
        }

        const update = () => {
            const el = triggerRef.current;
            if (!el) {
                return;
            }
            const rect = el.getBoundingClientRect();
            const preferredRight = Math.round(window.innerWidth - rect.right);
            const width = Math.min(maxWidth, window.innerWidth - edgeGap * 2);
            const maxRight = Math.max(
                edgeGap,
                Math.round(window.innerWidth - width - edgeGap),
            );
            const right = Math.min(
                Math.max(preferredRight, edgeGap),
                maxRight,
            );

            setCoords({
                top: Math.round(rect.bottom + 8),
                right,
            });
        };

        update();
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [open, maxWidth, edgeGap]);

    return { triggerRef, coords };
}

function userInitials(name = '') {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'M';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

const AVATAR_SIZES = {
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-9 w-9 text-xs',
    lg: 'h-10 w-10 text-sm',
    xl: 'h-14 w-14 text-base',
};

/** Tier ring — Free olive, Standard mint, Premium mustard (matches listing badges). */
const PLAN_RING = {
    free: 'bg-olive-400/55',
    featured: 'bg-mint',
    premium: 'bg-mustard',
};

function planRingClass(plan) {
    if (!plan) {
        return 'bg-olive-900/15';
    }

    return PLAN_RING[plan] || PLAN_RING.free;
}

export function MemberAvatar({
    user,
    size = 'md',
    className = '',
    showPlanRing = true,
}) {
    const initials = useMemo(() => userInitials(user?.name), [user?.name]);
    const [failed, setFailed] = useState(false);
    const box = AVATAR_SIZES[size] ?? AVATAR_SIZES.md;
    const plan = showPlanRing ? user?.plan : null;
    const ring = planRingClass(plan);
    const label = user?.plan_label
        ? `${user.plan_label} plan`
        : plan
          ? `${plan} plan`
          : undefined;

    useEffect(() => {
        setFailed(false);
    }, [user?.avatar_url]);

    const shell = `inline-flex shrink-0 rounded-full p-[2px] ${ring} ${className}`;

    if (user?.avatar_url && !failed) {
        return (
            <span className={shell} title={label}>
                <img
                    src={user.avatar_url}
                    alt=""
                    onError={() => setFailed(true)}
                    className={`${box} rounded-full object-cover`}
                />
            </span>
        );
    }

    return (
        <span className={shell} title={label} aria-hidden>
            <span
                className={`flex ${box} items-center justify-center rounded-full bg-mustard font-semibold leading-none text-earth-dusk`}
            >
                {initials}
            </span>
        </span>
    );
}

export function MemberUserMenu({ user, compact = false }) {
    const [open, setOpen] = useState(false);
    const { triggerRef, coords } = useAnchoredMenu(open, { maxWidth: 256 });

    if (!user) return null;

    const items = [
        {
            label: 'Dashboard',
            href: route('account.index'),
            icon: DashboardMark,
        },
        {
            label: 'Bookmarks',
            href: route('account.bookmarks'),
            icon: BookmarkMark,
        },
        {
            label: 'Listings',
            href: route('account.listings.index'),
            icon: ListMark,
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
            label: 'Concerns',
            href: route('account.tickets.index'),
            icon: MailMark,
        },
        {
            label: 'Settings',
            href: route('profile.edit'),
            icon: GearMark,
        },
    ].filter((item) => !item.hide);

    const menu =
        open && coords && typeof document !== 'undefined'
            ? createPortal(
                  <>
                      <button
                          type="button"
                          aria-label="Close menu"
                          className="fixed inset-0 z-[1300] cursor-default"
                          onClick={() => setOpen(false)}
                      />
                      <div
                          role="menu"
                          style={{ top: coords.top, right: coords.right }}
                          className="fixed z-[1301] w-64 border border-olive-900/15 bg-white py-1 shadow-lift"
                      >
                          <div className="border-b border-olive-900/10 px-3 py-3">
                              <div className="flex flex-col items-center rounded-2xl bg-earth-dusk px-4 py-4 text-center">
                                  <MemberAvatar user={user} size="xl" />
                                  <p className="mt-2.5 max-w-full truncate text-sm font-semibold text-white">
                                      {user.name}
                                  </p>
                                  <p className="mt-0.5 max-w-full truncate text-xs text-white/70">
                                      {user.email}
                                  </p>
                                  <p className="mt-1.5 text-[11px] font-semibold text-mustard">
                                      {user.plan_label || 'Free'} plan
                                  </p>
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
                  </>,
                  document.body,
              )
            : null;

    return (
        <div className="relative inline-flex shrink-0">
            <button
                ref={triggerRef}
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
                className="group inline-flex h-9 items-center gap-1.5 text-left text-white transition hover:opacity-95"
            >
                <MemberAvatar user={user} size="md" />
                {!compact ? (
                    <DisclosureMark
                        className={`h-3.5 w-3.5 shrink-0 text-white/70 transition group-hover:text-white ${
                            open ? 'rotate-180 text-white' : ''
                        }`}
                    />
                ) : null}
            </button>
            {menu}
        </div>
    );
}

export function MemberNotificationsBell() {
    const { notifications, messages } = usePage().props;
    const [open, setOpen] = useState(false);
    // Match CSS: w-[min(22rem,calc(100vw-1.5rem))] → 22rem = 352px, 1.5rem gap total
    const { triggerRef, coords } = useAnchoredMenu(open, {
        maxWidth: 352,
        edgeGap: 12,
    });
    const alertUnread = notifications?.unread_count || 0;
    const chatUnread = messages?.unread_count || 0;
    const unread = alertUnread + chatUnread;
    const recentChats = (messages?.recent || [])
        .filter((item) => item.unread)
        .slice(0, 4);
    const recentAlerts = (notifications?.recent || [])
        .filter((item) => !item.read_at)
        .slice(0, 4);
    const hasLatest = recentChats.length > 0 || recentAlerts.length > 0;

    const openAlert = (item) => {
        setOpen(false);
        router.post(route('account.notifications.read', item.id));
    };

    const markAll = () => {
        router.post(route('account.messages.read-all'), {}, { preserveScroll: true });
    };

    const menu =
        open && coords && typeof document !== 'undefined'
            ? createPortal(
                  <>
                      <button
                          type="button"
                          aria-label="Close messages"
                          className="fixed inset-0 z-[1300] cursor-default"
                          onClick={() => setOpen(false)}
                      />
                      <div
                          role="menu"
                          style={{ top: coords.top, right: coords.right }}
                          className="fixed z-[1301] w-[min(22rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] overflow-hidden border border-olive-900/15 bg-white shadow-lift"
                      >
                          <div className="flex items-center justify-between gap-3 border-b border-olive-900/10 px-4 py-3.5">
                              <div className="min-w-0">
                                  <p className="text-sm font-semibold text-olive-950">
                                      Messages
                                  </p>
                                  {unread > 0 ? (
                                      <p className="mt-0.5 text-xs text-olive-500">
                                          {unread} unread
                                      </p>
                                  ) : null}
                              </div>
                              {unread > 0 ? (
                                  <button
                                      type="button"
                                      onClick={markAll}
                                      className="inline-flex shrink-0 items-center gap-1 border border-olive-900/15 px-2.5 py-1.5 text-xs font-semibold text-olive-700 transition hover:bg-olive-50"
                                  >
                                      <CheckMark className="h-3.5 w-3.5" />
                                      Mark all
                                  </button>
                              ) : null}
                          </div>

                          <div className="max-h-[min(22rem,calc(100vh-6rem))] overflow-y-auto">
                              {!hasLatest ? (
                                  <div className="px-4 py-10 text-center">
                                      <BellMark className="mx-auto h-8 w-8 text-olive-300" />
                                      <p className="mt-3 text-sm font-medium text-olive-800">
                                          You’re all caught up
                                      </p>
                                      <p className="mt-1 text-xs text-olive-500">
                                          New messages will show up here.
                                      </p>
                                  </div>
                              ) : (
                                  <ul className="divide-y divide-olive-900/8">
                                      {recentChats.map((item) => (
                                          <li key={`c-${item.id}`}>
                                              <Link
                                                  href={item.url}
                                                  onClick={() => setOpen(false)}
                                                  className="flex w-full items-start gap-3 bg-mustard/5 px-4 py-3.5 text-left transition hover:bg-olive-50"
                                              >
                                                  <MemberAvatar
                                                      user={{
                                                          name: item.from,
                                                          avatar_url:
                                                              item.avatar_url,
                                                      }}
                                                      size="sm"
                                                      showPlanRing={false}
                                                      className="shrink-0"
                                                  />
                                                  <span className="min-w-0 flex-1">
                                                      <span className="flex items-center justify-between gap-2">
                                                          <span className="truncate text-sm font-semibold text-olive-950">
                                                              {item.from}
                                                          </span>
                                                          <span className="h-2 w-2 shrink-0 bg-mustard" />
                                                      </span>
                                                      <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-olive-600">
                                                          {plainText(item.body)}
                                                      </span>
                                                      <span className="mt-1.5 block text-[11px] text-olive-400">
                                                          {item.created_ago}
                                                      </span>
                                                  </span>
                                              </Link>
                                          </li>
                                      ))}
                                      {recentAlerts.map((item) => (
                                          <li key={`a-${item.id}`}>
                                              <button
                                                  type="button"
                                                  onClick={() => openAlert(item)}
                                                  className="flex w-full items-start gap-3 bg-mustard/5 px-4 py-3.5 text-left transition hover:bg-olive-50"
                                              >
                                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-olive-50 ring-1 ring-olive-900/10">
                                                      <img
                                                          src={
                                                              item.sender_avatar ||
                                                              '/images/logo-on-light.png'
                                                          }
                                                          alt=""
                                                          className="h-5 w-5 object-contain"
                                                      />
                                                  </span>
                                                  <span className="min-w-0 flex-1">
                                                      <span className="flex items-center justify-between gap-2">
                                                          <span className="truncate text-sm font-semibold text-olive-950">
                                                              {item.sender_name ||
                                                                  'Nanyuki Now'}
                                                          </span>
                                                          <span className="h-2 w-2 shrink-0 bg-mustard" />
                                                      </span>
                                                      <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-olive-600">
                                                          {plainText(
                                                              item.title ||
                                                                  item.body,
                                                          )}
                                                      </span>
                                                      <span className="mt-1.5 block text-[11px] text-olive-400">
                                                          {item.created_ago}
                                                      </span>
                                                  </span>
                                              </button>
                                          </li>
                                      ))}
                                  </ul>
                              )}
                          </div>

                          <div className="border-t border-olive-900/10 p-2.5">
                              <Link
                                  href={route('account.messages')}
                                  onClick={() => setOpen(false)}
                                  className="flex w-full items-center justify-center border border-olive-900/15 px-3 py-2.5 text-sm font-semibold text-olive-800 transition hover:border-mustard hover:bg-mustard hover:text-olive-950"
                              >
                                  View all messages
                              </Link>
                          </div>
                      </div>
                  </>,
                  document.body,
              )
            : null;

    return (
        <div className="relative inline-flex shrink-0">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={unread ? `${unread} unread` : 'Messages'}
                title="Messages"
                className="relative inline-flex h-9 w-9 items-center justify-center text-white transition hover:text-mustard"
            >
                <BellMark className="h-8 w-8 translate-y-px" />
                {unread > 0 ? (
                    <span className="absolute right-0 top-0 flex h-4 min-w-4 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full bg-mustard px-1 text-[10px] font-bold leading-none text-earth-dusk ring-2 ring-earth-dusk">
                        {unread > 9 ? '9+' : unread}
                    </span>
                ) : null}
            </button>
            {menu}
        </div>
    );
}
