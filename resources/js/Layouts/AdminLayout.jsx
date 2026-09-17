import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    LayoutList,
    FolderTree,
    Users,
    Newspaper,
    Settings2,
    LogOut,
    Menu,
    X,
    ExternalLink,
    Moon,
    Sun,
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
                className="h-10 w-10 rounded-full object-cover ring-2 ring-mustard/40"
            />
        );
    }

    return (
        <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-mustard text-sm font-bold text-earth-dusk ring-2 ring-mustard/30"
            aria-hidden
        >
            {initials}
        </div>
    );
}

function AdminShell({ title, children, actions }) {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const { isDark, toggleTheme } = useAdminTheme();
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
                        <div className="shrink-0 border-b border-white/10 px-4 py-4">
                            <Link
                                href={route('admin.dashboard')}
                                className="block"
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

                        <div className="shrink-0 border-t border-white/10 p-3">
                            <a
                                href={route('home')}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-olive-400 hover:bg-white/5 hover:text-white"
                            >
                                <ExternalLink className="h-4 w-4" />
                                View live site
                            </a>
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
                        <header className="z-20 shrink-0 border-b border-olive-200/80 bg-white/95 backdrop-blur dark:border-olive-800 dark:bg-olive-900/95">
                            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
                                <div className="flex min-w-0 items-center gap-3">
                                    <button
                                        type="button"
                                        className="rounded-md border border-olive-200 bg-white p-2 text-olive-800 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100 lg:hidden"
                                        onClick={() => setOpen(true)}
                                    >
                                        {open ? (
                                            <X className="h-5 w-5" />
                                        ) : (
                                            <Menu className="h-5 w-5" />
                                        )}
                                    </button>
                                    <h1 className="truncate font-display text-2xl font-semibold tracking-tight text-olive-950 dark:text-white">
                                        {title}
                                    </h1>
                                </div>

                                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                                    {actions}

                                    <button
                                        type="button"
                                        onClick={toggleTheme}
                                        aria-label={
                                            isDark ? 'Switch to light mode' : 'Switch to dark mode'
                                        }
                                        title={isDark ? 'Light mode' : 'Dark mode'}
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-olive-200 bg-white text-olive-700 transition hover:bg-olive-50 hover:text-olive-950 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-200 dark:hover:bg-olive-800 dark:hover:text-mustard"
                                    >
                                        {isDark ? (
                                            <Sun className="h-5 w-5" />
                                        ) : (
                                            <Moon className="h-5 w-5" />
                                        )}
                                    </button>

                                    <div className="hidden h-8 w-px bg-olive-200 dark:bg-olive-700 sm:block" />

                                    <div className="flex items-center gap-2.5 rounded-lg border border-olive-200 bg-olive-50/80 py-1.5 pl-1.5 pr-2 dark:border-olive-700 dark:bg-olive-950/60 sm:pr-3">
                                        <div className="relative">
                                            <UserAvatar user={user} />
                                            <span
                                                className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-mint-deep dark:border-olive-900"
                                                title="Online"
                                            />
                                        </div>
                                        <div className="hidden min-w-0 sm:block">
                                            <p className="truncate text-sm font-semibold text-olive-900 dark:text-olive-50">
                                                {user?.name || 'Admin'}
                                            </p>
                                            <p className="flex items-center gap-1.5 text-xs text-olive-500 dark:text-olive-400">
                                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-mint-deep" />
                                                {user?.is_admin ? 'Admin · Online' : 'Online'}
                                            </p>
                                        </div>
                                        <Link
                                            href={route('admin.logout')}
                                            method="post"
                                            as="button"
                                            title="Sign out"
                                            aria-label="Sign out"
                                            className="ml-0.5 inline-flex h-9 w-9 items-center justify-center rounded-md text-olive-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-olive-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                                        >
                                            <LogOut className="h-5 w-5" />
                                        </Link>
                                    </div>
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
