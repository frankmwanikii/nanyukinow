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
    Flag,
    Menu,
    X,
    Search,
    LogOut,
    MessagesSquare,
} from '@/Components/site/LucideCompat';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AdminThemeProvider, useAdminTheme } from '@/hooks/useAdminTheme';
import AdminNotificationsBell from '@/Components/Admin/AdminNotificationsBell';
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
    { label: 'Messages', href: 'admin.messages.index', icon: MessagesSquare, badgeKey: 'inboxMessages' },
    { label: 'Pricing', href: 'admin.pricing.index', icon: CircleDollarSign },
    { label: 'Finance', href: 'admin.finance.index', icon: Wallet },
    { label: 'Claims', href: 'admin.claims.index', icon: BadgeCheck, badgeKey: 'pendingClaims' },
    { label: 'Reports', href: 'admin.reports.index', icon: Flag, badgeKey: 'pendingReports' },
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
    const [failed, setFailed] = useState(false);
    const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm';

    useEffect(() => {
        setFailed(false);
    }, [user?.avatar_url]);

    if (user?.avatar_url && !failed) {
        return (
            <img
                src={user.avatar_url}
                alt=""
                onError={() => setFailed(true)}
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
    const [groups, setGroups] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const wrapRef = useRef(null);
    const abortRef = useRef(null);
    const isMac =
        typeof navigator !== 'undefined' &&
        /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '');

    useEffect(() => {
        const onKey = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setOpen(true);
            }
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        const onPointer = (e) => {
            if (!wrapRef.current?.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onPointer);
        return () => document.removeEventListener('mousedown', onPointer);
    }, []);

    useEffect(() => {
        const q = term.trim();
        if (q.length < 2) {
            setGroups([]);
            setLoading(false);
            abortRef.current?.abort();
            return undefined;
        }

        const timer = setTimeout(async () => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;
            setLoading(true);
            try {
                const url = route('admin.search.suggest', { q });
                const response = await fetch(url, {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error('Search failed');
                }
                const data = await response.json();
                setGroups(Array.isArray(data.groups) ? data.groups : []);
                setOpen(true);
            } catch (error) {
                if (error?.name !== 'AbortError') {
                    setGroups([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }, 220);

        return () => {
            clearTimeout(timer);
            abortRef.current?.abort();
        };
    }, [term]);

    const submit = (e) => {
        e.preventDefault();
        setOpen(false);
        router.get(
            route('admin.search'),
            { q: term.trim() || undefined },
            { preserveState: false },
        );
    };

    const total = groups.reduce((sum, group) => sum + (group.items?.length || 0), 0);

    return (
        <form
            ref={wrapRef}
            onSubmit={submit}
            role="search"
            className="relative w-full max-w-xl"
        >
            <label className="relative flex items-center">
                <span className="sr-only">Search admin</span>
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-olive-400 dark:text-olive-500" />
                <input
                    ref={inputRef}
                    type="search"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    onFocus={() => {
                        if (term.trim().length >= 2) {
                            setOpen(true);
                        }
                    }}
                    placeholder="Search admin"
                    autoComplete="off"
                    className="h-9 w-full rounded-md border border-white/20 bg-white/95 pl-9 pr-14 text-sm text-olive-900 outline-none placeholder:text-olive-500 focus:border-mustard focus:ring-1 focus:ring-mustard/40 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50 dark:placeholder:text-olive-500 dark:focus:border-mustard dark:focus:ring-mustard/30"
                />
                <kbd className="pointer-events-none absolute right-2.5 hidden select-none rounded-sm border border-olive-200/80 bg-olive-50/90 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-olive-500 sm:inline-block dark:border-olive-700 dark:bg-olive-900 dark:text-olive-500">
                    {isMac ? '⌘K' : 'Ctrl K'}
                </kbd>
            </label>

            {open && term.trim().length >= 2 ? (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[min(28rem,70vh)] overflow-y-auto border border-olive-200 bg-white dark:border-olive-700 dark:bg-olive-950">
                    {loading && total === 0 ? (
                        <p className="px-3 py-3 text-sm text-olive-500">Searching…</p>
                    ) : total === 0 ? (
                        <p className="px-3 py-3 text-sm text-olive-500">
                            No matches. Press Enter for full search.
                        </p>
                    ) : (
                        <>
                            {groups.map((group) => (
                                <div key={group.key}>
                                    <p className="border-b border-olive-100 px-3 py-1.5 text-xs font-medium text-olive-500 dark:border-olive-800 dark:text-olive-400">
                                        {group.label}
                                    </p>
                                    <ul>
                                        {group.items.map((item) => (
                                            <li key={`${group.key}-${item.id}`}>
                                                <Link
                                                    href={item.href}
                                                    onClick={() => setOpen(false)}
                                                    className="block px-3 py-2.5 transition hover:bg-olive-50 dark:hover:bg-olive-900"
                                                >
                                                    <span className="block text-sm font-medium text-olive-950 dark:text-olive-50">
                                                        {item.title}
                                                    </span>
                                                    {item.subtitle ? (
                                                        <span className="mt-0.5 block text-xs text-olive-500 dark:text-olive-400">
                                                            {item.subtitle}
                                                        </span>
                                                    ) : null}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                            <button
                                type="submit"
                                className="w-full border-t border-olive-100 px-3 py-2.5 text-left text-sm font-medium text-olive-700 transition hover:bg-olive-50 dark:border-olive-800 dark:text-olive-200 dark:hover:bg-olive-900"
                            >
                                View all results for "{term.trim()}"
                            </button>
                        </>
                    )}
                </div>
            ) : null}
        </form>
    );
}

function ThemeToggleControl() {
    const { isDark, setTheme } = useAdminTheme();
    return (
        <ThemeToggle
            isDark={isDark}
            setTheme={setTheme}
            className="border-white/25 bg-white/10 dark:border-olive-700 dark:bg-olive-950"
        />
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
                className="rounded-md ring-2 ring-transparent transition hover:ring-white/40 focus:outline-none focus-visible:ring-mustard dark:hover:ring-olive-600 dark:focus-visible:ring-mustard"
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
                        className="absolute right-0 z-40 mt-2 w-56 overflow-hidden border border-olive-200 bg-white py-1 dark:border-olive-700 dark:bg-olive-900"
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
    const {
        auth,
        pendingClaims = 0,
        pendingReports = 0,
        inboxMessages = 0,
    } = usePage().props;
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
            <div className="fixed inset-0 flex flex-col overflow-hidden bg-olive-50 text-earth-dusk dark:bg-olive-950 dark:text-olive-50">
                <header className="z-30 shrink-0 border-b border-white/10 bg-[#4f5a3e] dark:border-olive-800 dark:bg-olive-900">
                    <div className="grid h-16 grid-cols-[minmax(0,1fr)_minmax(0,28rem)_minmax(0,1fr)] items-center gap-3 px-3 sm:gap-4 sm:px-5">
                        <div className="flex min-w-0 items-center gap-2.5 justify-self-start">
                            <button
                                type="button"
                                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white transition hover:bg-white/10 dark:text-olive-200 dark:hover:bg-olive-800 lg:hidden"
                                onClick={() => setOpen(true)}
                                aria-label="Open navigation"
                            >
                                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                            <BrandMark className="[&_img]:!mix-blend-lighten" />
                        </div>

                        <div className="hidden w-full justify-self-center sm:flex">
                            <TopbarSearch />
                        </div>

                        <div className="flex items-center justify-end gap-1.5 justify-self-end sm:gap-2">
                            <ThemeToggleControl />

                            <AdminNotificationsBell tone="onGreen" />

                            <UserMenu user={user} />
                        </div>
                    </div>

                    <div className="border-t border-white/10 px-3 pb-3 pt-0 sm:hidden dark:border-olive-800">
                        <TopbarSearch />
                    </div>
                </header>

                <div className="flex min-h-0 flex-1">
                    <aside
                        className={`fixed inset-y-0 left-0 z-40 flex h-full w-60 flex-col border-r border-olive-200 bg-white text-olive-900 transition-transform dark:border-olive-800 dark:bg-olive-950 dark:text-olive-50 lg:static lg:h-full lg:translate-x-0 ${
                            open ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    >
                        <div className="flex h-14 shrink-0 items-center border-b border-olive-200 px-4 dark:border-olive-800 lg:hidden">
                            <BrandMark className="dark:[&_img]:!mix-blend-lighten" />
                        </div>

                        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
                            {nav.map((item) => {
                                const Icon = item.icon;
                                const badge =
                                    item.badgeKey === 'pendingClaims'
                                        ? Number(pendingClaims) || 0
                                        : item.badgeKey === 'pendingReports'
                                          ? Number(pendingReports) || 0
                                          : item.badgeKey === 'inboxMessages'
                                            ? Number(inboxMessages) || 0
                                          : 0;
                                const active =
                                    route().current(item.href) ||
                                    (item.href === 'admin.listings.index' &&
                                        route().current('admin.listings.*')) ||
                                    (item.href === 'admin.claims.index' &&
                                        route().current('admin.claims.*')) ||
                                    (item.href === 'admin.reports.index' &&
                                        route().current('admin.reports.*')) ||
                                    (item.href === 'admin.stories.index' &&
                                        route().current('admin.stories.*')) ||
                                    (item.href === 'admin.categories.index' &&
                                        route().current('admin.categories.*')) ||
                                    (item.href === 'admin.locations.index' &&
                                        route().current('admin.locations.*')) ||
                                    (item.href === 'admin.users.index' &&
                                        route().current('admin.users.*')) ||
                                    (item.href === 'admin.messages.index' &&
                                        route().current('admin.messages.*')) ||
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
                                        className={`relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition ${
                                            active
                                                ? 'bg-olive-100 font-semibold text-olive-950 dark:bg-olive-900 dark:text-white'
                                                : 'text-olive-600 hover:bg-olive-50 hover:text-olive-950 dark:text-olive-300 dark:hover:bg-olive-900/60 dark:hover:text-white'
                                        }`}
                                    >
                                        {active ? (
                                            <span
                                                className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-mustard"
                                                aria-hidden
                                            />
                                        ) : null}
                                        <Icon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.5} />
                                        <span className="min-w-0 flex-1">{item.label}</span>
                                        {badge > 0 ? (
                                            <span className="rounded-sm bg-mustard px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-earth-dusk">
                                                {badge > 99 ? '99+' : badge}
                                            </span>
                                        ) : null}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="shrink-0 border-t border-olive-200 p-2 dark:border-olive-800">
                            <Link
                                href={route('admin.logout')}
                                method="post"
                                as="button"
                                className="inline-flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-olive-600 transition hover:bg-olive-50 hover:text-olive-950 dark:text-olive-300 dark:hover:bg-olive-900 dark:hover:text-olive-50"
                            >
                                <LogOut
                                    className="h-4 w-4 shrink-0"
                                    strokeWidth={1.5}
                                />
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

                    <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 text-base sm:px-6">
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
