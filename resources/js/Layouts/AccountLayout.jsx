import SiteLayout from '@/Layouts/SiteLayout';
import { MemberAvatar } from '@/Components/site/MemberAccountMenu';
import {
    BookmarkMark,
    CardMark,
    CloseMark,
    DashboardMark,
    GearMark,
    MenuMark,
    MessageMark,
    PlusMark,
    PropertyMark,
    UpgradePlansMark,
} from '@/Components/site/Mark';
import ThemeToggle from '@/Components/ThemeToggle';
import { ThemeProvider, useTheme } from '@/hooks/useUiTheme';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { registerAccountMenuOpener } from '@/lib/accountMenuBridge';

/** Fallback until the real site nav is measured (logo h-14 + py-5 ≈ 96px) */
const NAV_H_FALLBACK = 96;

function navActive(patterns) {
    return patterns.some((pattern) => {
        try {
            return route().current(pattern);
        } catch {
            return false;
        }
    });
}

function useSiteNavHeight() {
    const [navH, setNavH] = useState(NAV_H_FALLBACK);

    useEffect(() => {
        const el = document.querySelector('[data-site-nav]');
        if (!el) return undefined;

        const update = () => {
            const h = Math.ceil(el.getBoundingClientRect().height);
            if (h > 0) setNavH(h);
        };

        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        window.addEventListener('resize', update);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', update);
        };
    }, []);

    return navH;
}

function NavLink({ item, onNavigate }) {
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            className={`group relative flex items-center gap-3 px-3 py-2.5 text-[15px] font-semibold transition ${
                item.active
                    ? 'bg-olive-900 text-white dark:bg-mustard dark:text-earth-dusk'
                    : 'text-olive-800 hover:bg-olive-100 hover:text-olive-950 dark:text-olive-200 dark:hover:bg-olive-900 dark:hover:text-white'
            }`}
        >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.badge > 0 ? (
                <span
                    className={`min-w-[1.35rem] px-1.5 py-0.5 text-center text-[11px] font-bold leading-none ${
                        item.active
                            ? 'bg-mustard text-earth-dusk dark:bg-olive-950 dark:text-mustard'
                            : 'bg-mustard text-earth-dusk'
                    }`}
                >
                    {item.badge > 9 ? '9+' : item.badge}
                </span>
            ) : null}
        </Link>
    );
}

function AccountShell({ title = 'Account', children }) {
    const { auth, messages, notifications } = usePage().props;
    const { isDark, setTheme } = useTheme();
    const user = auth?.user;
    const [mobileOpen, setMobileOpen] = useState(false);
    const navH = useSiteNavHeight();
    const navPx = `${navH}px`;

    const unreadMessages =
        (messages?.unread_count || 0) + (notifications?.unread_count || 0);

    const items = useMemo(
        () =>
            [
                {
                    label: 'Home',
                    href: route('account.index'),
                    icon: DashboardMark,
                    active: navActive(['account.index']),
                },
                {
                    label: 'Bookmarks',
                    href: route('account.bookmarks'),
                    icon: BookmarkMark,
                    active: navActive(['account.bookmarks']),
                },
                {
                    label: 'Add listing',
                    href: route('account.listings.create'),
                    icon: PlusMark,
                    active: navActive([
                        'account.listings.create',
                        'account.listings.edit',
                    ]),
                },
                {
                    label: 'Messages',
                    href: route('account.messages'),
                    icon: MessageMark,
                    active: navActive([
                        'account.messages',
                        'account.messages.show',
                    ]),
                    badge: unreadMessages,
                },
                {
                    label: 'Plans',
                    href: route('account.upgrade'),
                    icon: UpgradePlansMark,
                    active: navActive(['account.upgrade']),
                    hide: user?.plan === 'premium',
                },
                {
                    label: 'Billing',
                    href: route('account.billing'),
                    icon: CardMark,
                    active: navActive(['account.billing']),
                },
                {
                    label: 'Settings',
                    href: route('profile.edit'),
                    icon: GearMark,
                    active: navActive(['profile.edit']),
                },
            ].filter((item) => !item.hide),
        [user?.plan, unreadMessages],
    );

    useEffect(() => {
        return registerAccountMenuOpener(() => setMobileOpen(true));
    }, []);

    useEffect(() => {
        if (!mobileOpen) return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => {
            if (e.key === 'Escape') setMobileOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            document.removeEventListener('keydown', onKey);
        };
    }, [mobileOpen]);

    const DesktopSidebar = () => (
        <div className="flex h-full flex-col overflow-y-auto">
            {user ? (
                <div className="flex shrink-0 items-center gap-3 border-b border-olive-900/15 px-4 py-5 dark:border-olive-800">
                    <MemberAvatar user={user} size="md" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-[15px] font-semibold leading-snug text-olive-950 dark:text-olive-50">
                            {user.name}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-olive-600 dark:text-olive-400">
                            {user.plan_label || 'Free'}
                        </p>
                    </div>
                </div>
            ) : null}

            <nav className="flex-1 space-y-0.5 px-2 py-3" aria-label="Account">
                {items.map((item) => (
                    <NavLink key={item.label} item={item} />
                ))}
            </nav>

            <div className="shrink-0 border-t border-olive-900/15 px-2 py-3 dark:border-olive-800">
                <Link
                    href={route('home')}
                    className="flex items-center gap-3 px-3 py-2.5 text-[15px] font-semibold text-olive-800 transition hover:bg-olive-100 hover:text-olive-950 dark:text-olive-200 dark:hover:bg-olive-900 dark:hover:text-white"
                >
                    <PropertyMark className="h-5 w-5 shrink-0" />
                    Browse site
                </Link>
            </div>
        </div>
    );

    const mobileMenu =
        typeof document !== 'undefined' && mobileOpen
            ? createPortal(
                  <div className={isDark ? 'dark' : ''}>
                      <button
                          type="button"
                          aria-label="Close menu"
                          className="fixed inset-0 z-[2000] bg-olive-950/50 lg:hidden"
                          onClick={() => setMobileOpen(false)}
                      />
                      <aside
                          className="fixed inset-y-0 left-0 z-[2001] flex h-[100dvh] w-[min(19rem,88vw)] flex-col border-r border-olive-900/20 bg-white dark:border-olive-800 dark:bg-olive-950 dark:text-olive-50 lg:hidden"
                          role="dialog"
                          aria-modal="true"
                          aria-label="Account menu"
                      >
                          <div className="flex shrink-0 items-start gap-3 border-b border-olive-900/15 bg-earth-sand px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] dark:border-olive-800 dark:bg-olive-900">
                              {user ? (
                                  <>
                                      <MemberAvatar user={user} size="md" />
                                      <div className="min-w-0 flex-1 pt-0.5">
                                          <p className="truncate font-display text-base font-semibold leading-snug text-olive-950 dark:text-olive-50">
                                              {user.name}
                                          </p>
                                          <p className="mt-0.5 truncate text-sm text-olive-600 dark:text-olive-400">
                                              {user.plan_label || 'Free'} plan
                                          </p>
                                      </div>
                                  </>
                              ) : (
                                  <p className="flex-1 pt-1 font-display text-base font-semibold text-olive-950 dark:text-olive-50">
                                      Account
                                  </p>
                              )}
                              <button
                                  type="button"
                                  onClick={() => setMobileOpen(false)}
                                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-olive-700 transition hover:bg-olive-100 hover:text-olive-950 dark:text-olive-300 dark:hover:bg-olive-800 dark:hover:text-olive-50"
                                  aria-label="Close menu"
                              >
                                  <CloseMark className="h-5 w-5" />
                              </button>
                          </div>

                          <nav
                              className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 py-4"
                              aria-label="Account"
                          >
                              {items.map((item) => (
                                  <NavLink
                                      key={item.label}
                                      item={item}
                                      onNavigate={() => setMobileOpen(false)}
                                  />
                              ))}
                          </nav>

                          <div className="shrink-0 space-y-2 border-t border-olive-900/15 px-2 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-olive-800">
                              <div className="flex items-center justify-between px-3 py-1">
                                  <span className="text-sm font-semibold text-olive-600 dark:text-olive-400">
                                      Appearance
                                  </span>
                                  <ThemeToggle isDark={isDark} setTheme={setTheme} />
                              </div>
                              <Link
                                  href={route('home')}
                                  onClick={() => setMobileOpen(false)}
                                  className="flex items-center gap-3 px-3 py-2.5 text-[15px] font-semibold text-olive-800 transition hover:bg-olive-100 hover:text-olive-950 dark:text-olive-200 dark:hover:bg-olive-900 dark:hover:text-white"
                              >
                                  <PropertyMark className="h-5 w-5 shrink-0" />
                                  Browse site
                              </Link>
                          </div>
                      </aside>
                  </div>,
                  document.body,
              )
            : null;

    return (
        <div className={isDark ? 'dark' : ''}>
            <div
                style={{ paddingTop: navPx }}
                className="min-h-svh bg-earth-sand text-earth-dusk dark:bg-olive-950 dark:text-olive-50"
            >
                <aside
                    className="fixed bottom-0 left-0 z-30 hidden w-60 border-r border-olive-900/15 bg-white dark:border-olive-800 dark:bg-olive-950 lg:block xl:w-64"
                    style={{ top: navPx }}
                >
                    <DesktopSidebar />
                </aside>

                {mobileMenu}

                <div className="min-w-0 lg:pl-60 xl:pl-64">
                    <header
                        className="sticky z-20 flex items-center gap-3 border-b border-olive-900/15 bg-earth-sand px-4 py-3 dark:border-olive-800 dark:bg-olive-950 sm:px-6"
                        style={{ top: navPx }}
                    >
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="inline-flex h-10 w-10 items-center justify-center text-olive-800 transition hover:bg-olive-100 dark:text-olive-200 dark:hover:bg-olive-800 lg:hidden"
                            aria-label="Open account menu"
                            aria-expanded={mobileOpen}
                        >
                            <MenuMark className="h-5 w-5" />
                        </button>
                        <h1 className="min-w-0 flex-1 truncate font-display text-xl font-semibold tracking-tight text-olive-950 dark:text-olive-50 sm:text-2xl">
                            {title}
                        </h1>
                        <ThemeToggle isDark={isDark} setTheme={setTheme} />
                    </header>

                    <div className="px-4 py-5 pb-8 sm:px-6 sm:py-6 lg:px-8 lg:pb-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AccountLayout({ title = 'Account', children }) {
    return (
        <SiteLayout hideFooter compactNav>
            <ThemeProvider>
                <AccountShell title={title}>{children}</AccountShell>
            </ThemeProvider>
        </SiteLayout>
    );
}
