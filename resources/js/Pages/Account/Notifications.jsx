import SiteLayout from '@/Layouts/SiteLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Bell, CheckCheck } from 'lucide-react';

export default function Notifications({ notifications, unreadCount = 0 }) {
    const rows = notifications?.data || [];
    const { flash } = usePage().props;

    const openItem = (item) => {
        router.post(route('account.notifications.read', item.id));
    };

    const markAll = () => {
        router.post(route('account.notifications.read-all'));
    };

    return (
        <SiteLayout>
            <Head title="Notifications" />

            <div className="bg-olive-900">
                <div className="mx-auto max-w-2xl px-4 pb-8 pt-28 sm:px-6 sm:pt-32">
                    <Link
                        href={route('account.index')}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-mustard"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to account
                    </Link>
                    <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h1 className="font-display text-3xl font-bold text-white">
                                Notifications
                            </h1>
                            <p className="mt-1 text-sm text-white/65">
                                {unreadCount > 0
                                    ? `${unreadCount} unread`
                                    : 'You’re all caught up'}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAll}
                                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
                            >
                                <CheckCheck className="h-4 w-4" />
                                Mark all read
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
                {flash?.success && (
                    <div className="mb-4 rounded-xl border border-mint/40 bg-mint/20 px-4 py-3 text-sm text-olive-900">
                        {flash.success}
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-olive-200/80 bg-white shadow-soft">
                    {rows.length === 0 ? (
                        <div className="px-5 py-16 text-center">
                            <Bell className="mx-auto h-10 w-10 text-olive-300" />
                            <p className="mt-4 font-display text-lg font-semibold text-olive-900">
                                No notifications yet
                            </p>
                            <p className="mx-auto mt-2 max-w-sm text-sm text-olive-500">
                                When your listings are reviewed or your plan is upgraded, you’ll see
                                it here.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-olive-100">
                            {rows.map((item) => (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        onClick={() => openItem(item)}
                                        className={`flex w-full gap-3 px-5 py-4 text-left transition hover:bg-olive-50 ${
                                            !item.read_at ? 'bg-mustard/[0.06]' : ''
                                        }`}
                                    >
                                        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-olive-50 text-olive-600">
                                            <Bell className="h-4 w-4" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-start justify-between gap-2">
                                                <span className="font-semibold text-olive-950">
                                                    {item.title}
                                                </span>
                                                {!item.read_at && (
                                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-mustard" />
                                                )}
                                            </span>
                                            <span className="mt-1 block text-sm leading-relaxed text-olive-600">
                                                {item.body}
                                            </span>
                                            <span className="mt-2 block text-xs text-olive-400">
                                                {item.created_ago}
                                            </span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </SiteLayout>
    );
}
