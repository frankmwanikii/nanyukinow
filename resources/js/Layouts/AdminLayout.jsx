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
import { useEffect, useState } from 'react';
import { AdminThemeProvider, useAdminTheme } from '@/hooks/useAdminTheme';

const nav = [
    { label: 'Overview', href: 'admin.dashboard', icon: LayoutDashboard },
    { label: 'Listings', href: 'admin.listings.index', icon: LayoutList },
    { label: 'Categories', href: 'admin.categories.index', icon: FolderTree },
    { label: 'Stories', href: 'admin.stories.index', icon: Newspaper },
    { label: 'Users', href: 'admin.users.index', icon: Users },
    { label: 'Site & pages', href: 'admin.settings.index', icon: Settings2 },
];

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
        : 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200';

    return (
        <div className={`mb-4 rounded-md border px-3 py-2 text-sm ${tone}`}>
            {message}
        </div>
    );
}

function AdminShell({ title, children, actions }) {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const { isDark, toggleTheme } = useAdminTheme();

    return (
        <div className={isDark ? 'dark' : ''}>
            <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
                <div className="flex min-h-screen">
                    <aside
                        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-800 bg-slate-900 text-slate-100 transition-transform dark:border-slate-800 dark:bg-slate-950 lg:static lg:translate-x-0 ${
                            open ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    >
                        <div className="border-b border-white/10 px-5 py-4">
                            <Link href={route('admin.dashboard')} className="block">
                                <p className="text-base font-semibold tracking-tight text-white">
                                    Nanyuki Now
                                </p>
                                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                    Admin
                                </p>
                            </Link>
                        </div>

                        <nav className="flex-1 space-y-0.5 px-2.5 py-3">
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
                                        className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition ${
                                            active
                                                ? 'bg-white/10 text-white'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4 shrink-0 opacity-80" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="border-t border-white/10 p-3">
                            <a
                                href={route('home')}
                                target="_blank"
                                rel="noreferrer"
                                className="mb-2 flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-slate-400 hover:bg-white/5 hover:text-white"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                View live site
                            </a>
                            <div className="rounded-md bg-white/5 px-2.5 py-2">
                                <p className="truncate text-xs font-medium text-white">
                                    {auth?.user?.name}
                                </p>
                                <p className="truncate text-[11px] text-slate-400">
                                    {auth?.user?.email}
                                </p>
                                <Link
                                    href={route('admin.logout')}
                                    method="post"
                                    as="button"
                                    className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-300 hover:text-white"
                                >
                                    <LogOut className="h-3 w-3" />
                                    Sign out
                                </Link>
                            </div>
                        </div>
                    </aside>

                    {open && (
                        <button
                            type="button"
                            aria-label="Close menu"
                            className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
                            onClick={() => setOpen(false)}
                        />
                    )}

                    <div className="flex min-w-0 flex-1 flex-col">
                        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
                            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 lg:hidden"
                                        onClick={() => setOpen(true)}
                                    >
                                        {open ? (
                                            <X className="h-4 w-4" />
                                        ) : (
                                            <Menu className="h-4 w-4" />
                                        )}
                                    </button>
                                    <div>
                                        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                                            {title}
                                        </h1>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={toggleTheme}
                                        aria-label={
                                            isDark ? 'Switch to light mode' : 'Switch to dark mode'
                                        }
                                        title={isDark ? 'Light mode' : 'Dark mode'}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                    >
                                        {isDark ? (
                                            <Sun className="h-4 w-4" />
                                        ) : (
                                            <Moon className="h-4 w-4" />
                                        )}
                                    </button>
                                    {actions}
                                </div>
                            </div>
                        </header>

                        <main className="flex-1 px-4 py-5 sm:px-6">
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
