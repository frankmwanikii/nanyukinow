import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    LayoutList,
    FolderTree,
    MapPin,
    Users,
    Newspaper,
    Settings2,
    CircleDollarSign,
    Wallet,
    FileText,
    Images,
    BadgeCheck,
    Menu,
    X,
    Search,
    Bell,
    ExternalLink,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AdminThemeProvider, useAdminTheme } from '@/hooks/useAdminTheme';
import { AdminFlashToast } from '@/Components/Admin/ui';
import ThemeToggle from '@/Components/ThemeToggle';

const nav = [
    { label: 'Overview', href: 'admin.dashboard', icon: LayoutDashboard },
    { label: 'Listings', href: 'admin.listings.index', icon: LayoutList },
    { label: 'Pages', href: 'admin.pages.index', icon: FileText },
    { label: 'Categories', href: 'admin.categories.index', icon: FolderTree },
    { label: 'Locations', href: 'admin.locations.index', icon: MapPin },
    { label: 'Stories', href: 'admin.stories.index', icon: Newspaper },
    { label: 'Gallery', href: 'admin.gallery.index', icon: Images },
    { label: 'Users', href: 'admin.users.index', icon: Users },
    { label: 'Pricing', href: 'admin.pricing.index', icon: CircleDollarSign },
    { label: 'Finance', href: 'admin.finance.index', icon: Wallet },
    { label: 'Claims', href: 'admin.claims.index', icon: BadgeCheck, badgeKey: 'pendingClaims' },
    { label: 'Settings', href: 'admin.settings.index', icon: Settings2 },
];

function userInitials(name = '') {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'A';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function FlashBanner() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(true);
    const message = flash?.success || flash?.error || flash?.status;
    const isError = Boolean(flash?.error);
    // Remount toast when the flash text changes so the progress bar restarts.
    const toastKey = `${isError ? 'e' : 's'}:${message || ''}`;

    useEffect(() => {
        setVisible(Boolean(message));
    }, [message]);

    if (!message || !visible) return null;

    return (
        <AdminFlashToast
            key={toastKey}
            message={message}
            tone={isError ? 'error' : 'success'}
            onDismiss={() => setVisible(false)}
        />
    );
}

function UserAvatar({ user, size = 'md' }) {
    const initials = useMemo(() => userInitials(user?.name), [user?.name]);
    const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm';

    if (user?.avatar_url) {
        return (
            <img
                src={user.avatar_url}
                alt=""
                className={`${sizeClass} rounded-full object-cover`}
            />
        );
    }

    return (
        <div
            className={`flex items-center justify-center rounded-full bg-mustard font-bold text-earth-dusk ${sizeClass}`}
            aria-hidden
        >
            {initials}
        </div>
    );
}

function TopbarSearch() {
    const [term, setTerm] = useState('');
    const inputRef = useRef(null);
    const isMac =
        typeof navigator !== 'undefined' &&
        /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '');

    useEffect(() => {
        const onKey = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        router.get(
            route('admin.listings.index'),
            { q: term.trim() || undefined },
            { preserveState: false },
        );
    };

    return (
        <form onSubmit={submit} role="search" className="w-full max-w-xl">
            <label className="relative flex items-center">
                <span className="sr-only">Search listings</span>
                <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-olive-400 dark:text-olive-500" />
                <input
                    ref={inputRef}
                    type="search"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="Search..."
                    className="h-10 w-full rounded-full border-0 bg-olive-100/80 pl-10 pr-14 text-sm text-olive-900 outline-none ring-1 ring-inset ring-olive-200/80 placeholder:text-olive-400 focus:bg-white focus:ring-2 focus:ring-mustard/50 dark:bg-olive-950/70 dark:text-olive-50 dark:ring-olive-700 dark:placeholder:text-olive-500 dark:focus:bg-olive-950 dark:focus:ring-mustard/40"
                />
                <kbd className="pointer-events-none absolute right-3 hidden select-none rounded-md bg-white px-1.5 py-0.5 font-sans text-[10px] font-semibold tracking-wide text-olive-400 ring-1 ring-olive-200 sm:inline-block dark:bg-olive-900 dark:text-olive-500 dark:ring-olive-700">
                    {isMac ? '⌘K' : 'Ctrl K'}
                </kbd>
            </label>
        </form>
    );
}

function ThemeToggleControl() {
    const { isDark, setTheme } = useAdminTheme();
    return <ThemeToggle isDark={isDark} setTheme={setTheme} />;
}

function SignOutIcon({ className = 'h-4 w-4' }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.5 3.2c0-.39.31-.7.7-.7h5.05c.17 0 .34.06.47.18l4.08 3.7c.2.18.31.44.31.71v13.41c0 .39-.31.7-.7.7H4.2a.7.7 0 0 1-.7-.7V3.2ZM7.35 10.65a1.35 1.35 0 1 0 0 2.7 1.35 1.35 0 0 0 0-2.7Z"
            />
            <path d="M15 5h5.75c.41 0 .75.34.75.75v12.5c0 .41-.34.75-.75.75H15a.75.75 0 0 1 0-1.5h5V6.5H15A.75.75 0 0 1 15 5Z" />
            <path d="M11.25 11.1h5.55l-1.55-1.55a.75.75 0 0 1 1.06-1.06l3.05 3.05c.3.3.3.77 0 1.06l-3.05 3.05a.75.75 0 1 1-1.06-1.06l1.55-1.55h-5.55a.75.75 0 0 1 0-1.5Z" />
        </svg>
    );
}

function UserMenu({ user }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative shrink-0">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label="Account menu"
                className="rounded-full ring-2 ring-transparent transition hover:ring-mustard/40 focus:outline-none focus-visible:ring-mustard"
            >
                <UserAvatar user={user} />
            </button>

            {open && (
                <>
                    <button
                        type="button"
                        aria-label="Close menu"
                        className="fixed inset-0 z-30 cursor-default"
                        onClick={() => setOpen(false)}
                    />
                    <div
                        role="menu"
                        className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-olive-200/80 bg-white py-1 shadow-lift dark:border-olive-700 dark:bg-olive-900"
                    >
                        <div className="border-b border-olive-100 px-3 py-2.5 dark:border-olive-800">
                            <p className="truncate text-sm font-semibold text-olive-950 dark:text-olive-50">
                                {user?.name || 'Admin'}
                            </p>
                            <p className="truncate text-xs text-olive-500 dark:text-olive-400">
                                {user?.email}
                            </p>
                        </div>
                        <Link
                            href={route('admin.profile.edit')}
                            role="menuitem"
                            onClick={() => setOpen(false)}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-olive-800 transition hover:bg-olive-50 dark:text-olive-100 dark:hover:bg-olive-800"
                        >
                            Edit profile
                        </Link>
                        <Link
                            href={`${route('admin.profile.edit')}#password`}
                            role="menuitem"
                            onClick={() => setOpen(false)}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-olive-800 transition hover:bg-olive-50 dark:text-olive-100 dark:hover:bg-olive-800"
                        >
                            Change password
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

function BrandMark({ className = '' }) {
    return (
        <Link
            href={route('admin.dashboard')}
            className={`inline-flex min-w-0 items-center ${className}`}
            aria-label="Nanyuki Now admin home"
        >
            <img
                src="/images/logo.png"
                alt="Nanyuki Now"
                width={969}
                height={542}
                decoding="async"
                className="h-9 w-auto max-w-[10rem] object-contain object-left mix-blend-multiply dark:mix-blend-lighten sm:h-10 sm:max-w-[12rem]"
            />
        </Link>
    );
}

function AdminShell({ children }) {
    const { auth, pendingClaims = 0 } = usePage().props;
    const [open, setOpen] = useState(false);
    const { isDark } = useAdminTheme();
    const user = auth?.user;

    // Keep document from scrolling past the shell (empty beige void under sidebar).
    useEffect(() => {
        const html = document.documentElement;
        const { body } = document;
        const prev = {
            htmlOverflow: html.style.overflow,
            bodyOverflow: body.style.overflow,
            htmlOverscroll: html.style.overscrollBehavior,
            bodyOverscroll: body.style.overscrollBehavior,
        };
        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
        html.style.overscrollBehavior = 'none';
        body.style.overscrollBehavior = 'none';
        return () => {
            html.style.overflow = prev.htmlOverflow;
            body.style.overflow = prev.bodyOverflow;
            html.style.overscrollBehavior = prev.htmlOverscroll;
            body.style.overscrollBehavior = prev.bodyOverscroll;
        };
    }, []);

    return (
        <div className={isDark ? 'dark' : ''}>
            <div className="fixed inset-0 flex flex-col overflow-hidden bg-earth-sand text-earth-dusk dark:bg-olive-950 dark:text-olive-50">
                {/* Full-width top bar: logo · centered search · utilities */}
                <header className="z-30 shrink-0 border-b border-olive-200/70 bg-white dark:border-olive-800 dark:bg-olive-900">
                    <div className="grid h-16 grid-cols-[minmax(0,1fr)_minmax(0,28rem)_minmax(0,1fr)] items-center gap-3 px-3 sm:gap-4 sm:px-5">
                        <div className="flex min-w-0 items-center gap-2.5 justify-self-start">
                            <button
                                type="button"
                                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-olive-700 transition hover:bg-olive-100 dark:text-olive-200 dark:hover:bg-olive-800 lg:hidden"
                                onClick={() => setOpen(true)}
                                aria-label="Open navigation"
                            >
                                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                            <BrandMark />
                        </div>

                        <div className="hidden w-full justify-self-center sm:flex">
                            <TopbarSearch />
                        </div>

                        <div className="flex items-center justify-end gap-2 justify-self-end sm:gap-2.5">
                            <a
                                href={route('home')}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Open public website"
                                title="View website"
                                className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-olive-700 transition hover:bg-olive-100 hover:text-olive-950 dark:text-olive-200 dark:hover:bg-olive-800 dark:hover:text-mustard"
                            >
                                <ExternalLink className="h-[18px] w-[18px]" />
                            </a>

                            <ThemeToggleControl />

                            <Link
                                href={route('admin.listings.index', { status: 'pending' })}
                                aria-label="Listings awaiting review"
                                title="Listings awaiting review"
                                className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-olive-700 transition hover:bg-olive-100 hover:text-olive-950 dark:text-olive-200 dark:hover:bg-olive-800 dark:hover:text-mustard"
                            >
                                <Bell className="h-[18px] w-[18px]" />
                            </Link>

                            <UserMenu user={user} />
                        </div>
                    </div>

                    {/* Compact search under logo row on very small screens */}
                    <div className="border-t border-olive-100 px-3 pb-3 pt-0 sm:hidden dark:border-olive-800">
                        <TopbarSearch />
                    </div>
                </header>

                <div className="flex min-h-0 flex-1">
                    <aside
                        className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r border-olive-200/80 bg-white text-olive-900 transition-transform dark:border-olive-900 dark:bg-olive-950 dark:text-olive-50 lg:static lg:h-full lg:translate-x-0 ${
                            open ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    >
                        <div className="flex h-16 shrink-0 items-center border-b border-olive-100 px-4 dark:border-white/10 lg:hidden">
                            <BrandMark className="dark:[&_img]:!mix-blend-lighten" />
                        </div>

                        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                            {nav.map((item) => {
                                const Icon = item.icon;
                                const badge =
                                    item.badgeKey === 'pendingClaims'
                                        ? Number(pendingClaims) || 0
                                        : 0;
                                const active =
                                    route().current(item.href) ||
                                    (item.href === 'admin.listings.index' &&
                                        route().current('admin.listings.*')) ||
                                    (item.href === 'admin.claims.index' &&
                                        route().current('admin.claims.*')) ||
                                    (item.href === 'admin.stories.index' &&
                                        route().current('admin.stories.*')) ||
                                    (item.href === 'admin.categories.index' &&
                                        route().current('admin.categories.*')) ||
                                    (item.href === 'admin.locations.index' &&
                                        route().current('admin.locations.*')) ||
                                    (item.href === 'admin.users.index' &&
                                        route().current('admin.users.*')) ||
                                    (item.href === 'admin.pricing.index' &&
                                        route().current('admin.pricing.*')) ||
                                    (item.href === 'admin.finance.index' &&
                                        (route().current('admin.finance.*') ||
                                            route().current('admin.upgrades.*'))) ||
                                    (item.href === 'admin.pages.index' &&
                                        route().current('admin.pages.*')) ||
                                    (item.href === 'admin.settings.index' &&
                                        route().current('admin.settings.*'));
                                return (
                                    <Link
                                        key={item.href}
                                        href={route(item.href)}
                                        onClick={() => setOpen(false)}
                                        className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium transition ${
                                            active
                                                ? 'bg-mustard/20 text-earth-dusk dark:bg-mustard/15 dark:text-mustard'
                                                : 'text-olive-600 hover:bg-olive-50 hover:text-olive-950 dark:text-olive-300 dark:hover:bg-white/5 dark:hover:text-white'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5 shrink-0 opacity-80" />
                                        <span className="min-w-0 flex-1">{item.label}</span>
                                        {badge > 0 ? (
                                            <span className="rounded-full bg-mustard px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-earth-dusk">
                                                {badge > 99 ? '99+' : badge}
                                            </span>
                                        ) : null}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="shrink-0 border-t border-olive-100 p-3 dark:border-white/[0.08]">
                            <Link
                                href={route('admin.logout')}
                                method="post"
                                as="button"
                                className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-olive-50 px-3 py-2.5 text-sm font-medium text-olive-700 ring-1 ring-inset ring-olive-200 transition hover:bg-rose-50 hover:text-rose-700 hover:ring-rose-200 dark:bg-white/[0.04] dark:text-olive-300 dark:ring-white/10 dark:hover:bg-rose-500/10 dark:hover:text-rose-300 dark:hover:ring-rose-400/20"
                            >
                                <SignOutIcon className="h-4 w-4 shrink-0 opacity-90" />
                                <span>Sign out</span>
                            </Link>
                        </div>
                    </aside>

                    {open && (
                        <button
                            type="button"
                            aria-label="Close menu"
                            className="fixed inset-0 z-30 bg-olive-950/50 lg:hidden"
                            onClick={() => setOpen(false)}
                        />
                    )}

                    <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 text-base sm:px-6">
                        <FlashBanner />
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default function AdminLayout(props) {
    return (
        <AdminThemeProvider>
            <AdminShell {...props} />
        </AdminThemeProvider>
    );
}
