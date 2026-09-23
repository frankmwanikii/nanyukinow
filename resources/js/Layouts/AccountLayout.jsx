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
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

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
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold transition ${
                item.active
                    ? 'bg-olive-100 text-olive-950'
                    : 'text-olive-700 hover:bg-olive-50 hover:text-olive-950'
            }`}
        >
            {item.active ? (
                <span
                    aria-hidden
                    className="absolute inset-y-2.5 left-0 w-[3px] rounded-r-full bg-mustard"
                />
            ) : null}
            <Icon
                className={`h-5 w-5 shrink-0 ${
                    item.active
                        ? 'text-olive-900'
                        : 'text-olive-500 group-hover:text-olive-800'
                }`}
                strokeWidth={1.85}
            />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.badge > 0 ? (
                <span className="min-w-[1.35rem] rounded-md bg-mustard px-1.5 py-0.5 text-center text-[11px] font-bold leading-none text-earth-dusk">
                    {item.badge > 9 ? '9+' : item.badge}
                </span>
            ) : null}
        </Link>
    );
}

export default function AccountLayout({ title = 'Account', children }) {
    const { auth, messages, notifications } = usePage().props;
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
                    icon: LayoutDashboard,
                    active: navActive(['account.index']),
                },
                {
                    label: 'Add listing',
                    href: route('account.listings.create'),
                    icon: PlusCircle,
                    active: navActive([
                        'account.listings.create',
                        'account.listings.edit',
                    ]),
                },
                {
                    label: 'Messages',
                    href: route('account.messages'),
                    icon: MessageSquare,
                    active: navActive([
                        'account.messages',
                        'account.messages.show',
                    ]),
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
                    href: route('account.billing'),
                    icon: CreditCard,
                    active: navActive(['account.billing']),
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
                <div className="flex shrink-0 items-center gap-3 border-b border-olive-100 px-4 py-5">
                    <MemberAvatar user={user} size="md" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold leading-snug text-olive-950">
                            {user.name}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-olive-500">
                            {user.plan_label || 'Free'}
                        </p>
                    </div>
                </div>
            ) : null}

            <nav className="flex-1 space-y-1 px-2.5 py-3" aria-label="Account">
                {items.map((item) => (
                    <NavLink key={item.label} item={item} />
                ))}
            </nav>

            <div className="shrink-0 border-t border-olive-100 px-2.5 py-3">
                <Link
                    href={route('home')}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold text-olive-700 transition hover:bg-olive-50 hover:text-olive-950"
                >
                    <Home
                        className="h-5 w-5 text-olive-500"
                        strokeWidth={1.85}
                    />
                    Browse site
                </Link>
            </div>
        </div>
    );

    const mobileMenu =
        typeof document !== 'undefined' && mobileOpen
            ? createPortal(
                  <>
                      <button
                          type="button"
                          aria-label="Close menu"
                          className="fixed inset-0 z-[2000] bg-olive-950/45 backdrop-blur-[2px] lg:hidden"
                          onClick={() => setMobileOpen(false)}
                      />
                      <aside
                          className="fixed inset-y-0 left-0 z-[2001] flex h-[100dvh] w-[min(19rem,88vw)] flex-col bg-white shadow-2xl lg:hidden"
                          role="dialog"
                          aria-modal="true"
                          aria-label="Account menu"
                      >
                          <div className="flex shrink-0 items-start gap-3 border-b border-olive-100 bg-[#f7f5f0] px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
                              {user ? (
                                  <>
                                      <MemberAvatar user={user} size="md" />
                                      <div className="min-w-0 flex-1 pt-0.5">
                                          <p className="truncate font-display text-base font-semibold leading-snug text-olive-950">
                                              {user.name}
                                          </p>
                                          <p className="mt-0.5 truncate text-sm text-olive-500">
                                              {user.plan_label || 'Free'} plan
                                          </p>
                                      </div>
                                  </>
                              ) : (
                                  <p className="flex-1 pt-1 font-display text-base font-semibold text-olive-950">
                                      Account
                                  </p>
                              )}
                              <button
                                  type="button"
                                  onClick={() => setMobileOpen(false)}
                                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-olive-600 transition hover:bg-olive-100 hover:text-olive-950"
                                  aria-label="Close menu"
                              >
                                  <X className="h-5 w-5" strokeWidth={2} />
                              </button>
                          </div>

                          <nav
                              className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4"
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

                          <div className="shrink-0 border-t border-olive-100 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                              <Link
                                  href={route('home')}
                                  onClick={() => setMobileOpen(false)}
                                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold text-olive-700 transition hover:bg-olive-50 hover:text-olive-950"
                              >
                                  <Home
                                      className="h-5 w-5 text-olive-500"
                                      strokeWidth={1.85}
                                  />
                                  Browse site
                              </Link>
                          </div>
                      </aside>
                  </>,
                  document.body,
              )
            : null;

    return (
        <SiteLayout hideFooter compactNav>
            <div style={{ paddingTop: navPx }} className="min-h-svh">
                <aside
                    className="fixed bottom-0 left-0 z-30 hidden w-60 border-r border-olive-200 bg-white lg:block xl:w-64"
                    style={{ top: navPx }}
                >
                    <DesktopSidebar />
                </aside>

                {mobileMenu}

                <div className="min-w-0 bg-[#f4f2ec] lg:pl-60 xl:pl-64">
                    <header
                        className="sticky z-20 flex items-center gap-3 border-b border-olive-200/80 bg-[#f4f2ec]/95 px-4 py-3 backdrop-blur sm:px-6"
                        style={{ top: navPx }}
                    >
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-olive-700 transition hover:bg-olive-100 lg:hidden"
                            aria-label="Open menu"
                            aria-expanded={mobileOpen}
                        >
                            <Menu className="h-5 w-5" strokeWidth={1.85} />
                        </button>
                        <h1 className="truncate font-display text-xl font-semibold tracking-tight text-olive-950 sm:text-2xl">
                            {title}
                        </h1>
                    </header>

                    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                        {children}
                    </div>
                </div>
            </div>
        </SiteLayout>
    );
}
