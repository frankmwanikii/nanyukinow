import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    LayoutList,
    FolderTree,
    Users,
    Newspaper,
    Settings2,
    Menu,
    X,
    Moon,
    Sun,
    Search,
    Bell,
    ChevronDown,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AdminThemeProvider, useAdminTheme } from '@/hooks/useAdminTheme';

const nav = [
    { label: 'Overview', href: 'admin.dashboard', icon: LayoutDashboard },
    { label: 'Listings', href: 'admin.listings.index', icon: LayoutList },
    { label: 'Categories', href: 'admin.categories.index', icon: FolderTree },
    { label: 'Stories', href: 'admin.stories.index', icon: Newspaper },
    { label: 'Users', href: 'admin.users.index', icon: Users },
    { label: 'Site & pages', href: 'admin.settings.index', icon: Settings2 },
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

    useEffect(() => {
        setVisible(true);
        if (!message) return undefined;
        const t = setTimeout(() => setVisible(false), 4500);
        return () => clearTimeout(t);
    }, [message]);

    if (!message || !visible) return null;

    const tone = flash?.error
        ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200'
        : 'border-mint/40 bg-mint/20 text-olive-900 dark:border-mint/30 dark:bg-mint/10 dark:text-mint-soft';

    return (
        <div className={`mb-4 rounded-md border px-4 py-2.5 text-base ${tone}`}>
            {message}
        </div>
    );
}

function UserAvatar({ user }) {
    const initials = useMemo(() => userInitials(user?.name), [user?.name]);

    if (user?.avatar_url) {
        return (
            <img
                src={user.avatar_url}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
            />
        );
    }

    return (
        <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-mustard text-sm font-bold text-earth-dusk"
            aria-hidden
        >
            {initials}
        </div>
    );
}

function TopbarSearch() {
    const [term, setTerm] = useState('');

    const submit = (e) => {
        e.preventDefault();
        router.get(route('admin.listings.index'), { q: term.trim() || undefined }, {
            preserveState: false,
        });
    };

    return (
        <form
            onSubmit={submit}
            role="search"
            className="hidden min-w-0 md:block md:w-64 lg:w-80 xl:w-96"
        >
            <label className="relative flex items-center">
                <span className="sr-only">Search listings</span>
                <Search className="pointer-events-none absolute left-4 h-4 w-4 text-olive-500 dark:text-olive-400" />
                <input
                    type="search"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="Search"
                    className="h-11 w-full rounded-full border border-olive-200 bg-white pl-11 pr-4 text-sm text-olive-900 shadow-soft placeholder:text-olive-500 focus:border-mustard focus:ring-2 focus:ring-mustard/40 dark:border-olive-700 dark:bg-olive-950/80 dark:text-olive-50 dark:placeholder:text-olive-400 dark:focus:border-mustard"
                />
            </label>
        </form>
    );
}

function ThemeToggle() {
    const { isDark, setTheme } = useAdminTheme();

    return (
        <div
            role="group"
            aria-label="Color theme"
            className="relative inline-grid h-8 grid-cols-2 items-center rounded-full bg-white/[0.06] p-0.5 ring-1 ring-inset ring-white/10"
        >
            <span
                aria-hidden
                className="pointer-events-none absolute top-0.5 left-0.5 h-7 w-7 rounded-full bg-mustard shadow-[0_1px_6px_rgba(242,184,46,0.35)] transition-transform duration-300 ease-out"
                style={{ transform: isDark ? 'translateX(1.75rem)' : 'translateX(0)' }}
            />
            <button
                type="button"
                onClick={() => setTheme('light')}
                aria-label="Light mode"
                aria-pressed={!isDark}
                className={
                    'relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 ' +
                    (!isDark ? 'text-earth-dusk' : 'text-olive-400 hover:text-olive-200')
                }
            >
                <Sun className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
            <button
                type="button"
                onClick={() => setTheme('dark')}
                aria-label="Dark mode"
                aria-pressed={isDark}
                className={
                    'relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 ' +
                    (isDark ? 'text-earth-dusk' : 'text-olive-400 hover:text-olive-200')
                }
            >
                <Moon className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
        </div>
    );
}


function SignOutIcon({ className = 'h-4 w-4' }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
            className={className}
        >
            {/* Open door with knob hole */}
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.5 3.2c0-.39.31-.7.7-.7h5.05c.17 0 .34.06.47.18l4.08 3.7c.2.18.31.44.31.71v13.41c0 .39-.31.7-.7.7H4.2a.7.7 0 0 1-.7-.7V3.2ZM7.35 10.65a1.35 1.35 0 1 0 0 2.7 1.35 1.35 0 0 0 0-2.7Z"
            />
            {/* Doorway frame */}
            <path d="M15 5h5.75c.41 0 .75.34.75.75v12.5c0 .41-.34.75-.75.75H15a.75.75 0 0 1 0-1.5h5V6.5H15A.75.75 0 0 1 15 5Z" />
            {/* Exit arrow */}
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
                className="flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-2.5 text-left transition hover:bg-olive-50 dark:bg-olive-950/60 dark:hover:bg-olive-950"
            >
                <UserAvatar user={user} />
                <div className="hidden min-w-0 sm:block">
                    <p className="truncate text-sm font-semibold leading-tight text-olive-950 dark:text-olive-50">
                        {user?.name || 'Admin'}
                    </p>
                    <p className="truncate text-xs leading-tight text-olive-500 dark:text-olive-400">
                        {user?.is_admin ? 'Administrator' : 'Team member'}
                    </p>
                </div>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-olive-400 transition ${open ? 'rotate-180' : ''}`}
                />
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
                        className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-xl bg-white py-1 shadow-lift dark:bg-olive-900"
                    >
                        <Link
                            href={route('admin.logout')}
                            method="post"
                            as="button"
                            role="menuitem"
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-olive-800 transition hover:bg-rose-50 hover:text-rose-700 dark:text-olive-100 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                        >
                            <SignOutIcon className="h-4 w-4" />
                            Sign out
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

function AdminShell({ title, children, actions }) {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const { isDark } = useAdminTheme();
    const user = auth?.user;

    return (
        <div className={isDark ? 'dark' : ''}>
            <div className="h-screen overflow-hidden bg-earth-sand text-earth-dusk dark:bg-olive-950 dark:text-olive-50">
                <div className="flex h-full">
                    <aside
                        className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r border-olive-900 bg-olive-950 text-olive-50 transition-transform dark:border-olive-900 dark:bg-earth-dusk lg:static lg:translate-x-0 ${
                            open ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    >
                        <div className="flex shrink-0 items-end justify-between gap-3 border-b border-white/10 px-4 py-4">
                            <Link
                                href={route('admin.dashboard')}
                                className="min-w-0 block"
                                aria-label="Nanyuki Now admin home"
                            >
                                <img
                                    src="/images/logo.png"
                                    alt="Nanyuki Now"
                                    width={969}
                                    height={542}
                                    decoding="async"
                                    className="h-12 w-auto max-w-full object-contain object-left mix-blend-lighten sm:h-14"
                                />
                            </Link>
                            <div className="mb-0.5 shrink-0">
                                <ThemeToggle />
                            </div>
                        </div>

                        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                            {nav.map((item) => {
                                const Icon = item.icon;
                                const active =
                                    route().current(item.href) ||
                                    (item.href === 'admin.listings.index' &&
                                        route().current('admin.listings.*')) ||
                                    (item.href === 'admin.stories.index' &&
                                        route().current('admin.stories.*')) ||
                                    (item.href === 'admin.categories.index' &&
                                        route().current('admin.categories.*')) ||
                                    (item.href === 'admin.users.index' &&
                                        route().current('admin.users.*')) ||
                                    (item.href === 'admin.settings.index' &&
                                        route().current('admin.settings.*'));
                                return (
                                    <Link
                                        key={item.href}
                                        href={route(item.href)}
                                        onClick={() => setOpen(false)}
                                        className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium transition ${
                                            active
                                                ? 'bg-mustard/15 text-mustard'
                                                : 'text-olive-300 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5 shrink-0 opacity-80" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="shrink-0 border-t border-white/[0.08] p-3">
                            <Link
                                href={route('admin.logout')}
                                method="post"
                                as="button"
                                className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-olive-300 ring-1 ring-inset ring-white/10 transition hover:bg-rose-500/10 hover:text-rose-300 hover:ring-rose-400/20"
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

                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                        <header className="z-20 shrink-0 bg-[#f9f6f1] dark:bg-olive-900">
                            <div className="flex items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <button
                                        type="button"
                                        className="shrink-0 rounded-full bg-white p-2 text-olive-800 dark:bg-olive-950/60 dark:text-olive-100 lg:hidden"
                                        onClick={() => setOpen(true)}
                                    >
                                        {open ? (
                                            <X className="h-5 w-5" />
                                        ) : (
                                            <Menu className="h-5 w-5" />
                                        )}
                                    </button>

                                    <h1 className="min-w-0 truncate font-display text-2xl font-bold tracking-tight text-olive-950 dark:text-white">
                                        {title}
                                    </h1>
                                </div>

                                <TopbarSearch />

                                <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
                                    {actions && (
                                        <div className="flex shrink-0 items-center gap-2 [&_a]:rounded-full [&_button]:rounded-full">
                                            {actions}
                                        </div>
                                    )}

                                    <Link
                                        href={route('admin.listings.index', { status: 'pending' })}
                                        aria-label="Listings awaiting review"
                                        title="Listings awaiting review"
                                        className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-olive-800 transition hover:bg-olive-50 hover:text-olive-950 dark:bg-olive-950/60 dark:text-olive-200 dark:hover:text-mustard"
                                    >
                                        <Bell className="h-[18px] w-[18px]" />
                                    </Link>

                                    <UserMenu user={user} />
                                </div>
                            </div>
                        </header>

                        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 text-base sm:px-6">
                            <FlashBanner />
                            {children}
                        </main>
                    </div>
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
