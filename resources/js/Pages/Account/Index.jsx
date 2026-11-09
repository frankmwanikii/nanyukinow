import AccountLayout from '@/Layouts/AccountLayout';
import {
    BookmarkMark,
    ListMark,
    UpgradePlansMark,
} from '@/Components/site/Mark';
import { Head, Link, router, usePage } from '@inertiajs/react';

function MetricCard({ label, children, href }) {
    const inner = (
        <>
            <p className="text-sm font-medium text-olive-600 dark:text-olive-400">
                {label}
            </p>
            <div className="mt-2">{children}</div>
        </>
    );

    const shell =
        'border border-olive-900/15 bg-white p-4 transition dark:border-olive-800 dark:bg-olive-900 sm:p-5';

    if (href) {
        return (
            <Link
                href={href}
                className={`${shell} hover:border-olive-900/35 dark:hover:border-olive-600`}
            >
                {inner}
            </Link>
        );
    }

    return <div className={shell}>{inner}</div>;
}

export default function Index({
    plan,
    bookmarksCount = 0,
    pendingUpgrade = null,
}) {
    const { flash } = usePage().props;

    const usedPct = plan.listing_limit
        ? Math.min(100, (plan.listings_used / plan.listing_limit) * 100)
        : 0;

    return (
        <AccountLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-5">
                {(flash?.success || flash?.error) && (
                    <div
                        className={`border px-4 py-3 text-sm ${
                            flash.error
                                ? 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
                                : 'border-olive-900/15 bg-white text-olive-900 dark:border-olive-800 dark:bg-olive-900 dark:text-olive-100'
                        }`}
                    >
                        {flash.error || flash.success}
                    </div>
                )}

                <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                    <MetricCard label="Plan">
                        <p className="font-display text-2xl font-semibold text-olive-950 dark:text-olive-50">
                            {plan.label}
                        </p>
                    </MetricCard>
                    <MetricCard label="Listings" href={route('account.listings.index')}>
                        <p className="inline-flex items-center gap-2 font-display text-2xl font-semibold tabular-nums text-olive-950 dark:text-olive-50">
                            <ListMark className="h-5 w-5 text-olive-700 dark:text-olive-300" />
                            {plan.listings_used}
                            <span className="text-base font-normal text-olive-500 dark:text-olive-500">
                                /{plan.listing_limit}
                            </span>
                        </p>
                    </MetricCard>
                    <MetricCard label="Bookmarks" href={route('account.bookmarks')}>
                        <p className="inline-flex items-center gap-2 font-display text-2xl font-semibold tabular-nums text-olive-950 dark:text-olive-50">
                            <BookmarkMark
                                className="h-5 w-5 text-olive-700 dark:text-olive-300"
                                filled
                            />
                            {bookmarksCount}
                        </p>
                    </MetricCard>
                </section>

                <section className="border border-olive-900/15 bg-white dark:border-olive-800 dark:bg-olive-900">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-olive-900/10 px-4 py-4 sm:px-5 dark:border-olive-800">
                        <div>
                            <h2 className="font-display text-base font-semibold text-olive-950 dark:text-olive-50">
                                Plan usage
                            </h2>
                            <p className="mt-0.5 text-sm text-olive-600 dark:text-olive-400">
                                {plan.is_expired
                                    ? 'Plan expired. You’re on Free until renewed.'
                                    : plan.expires_at
                                      ? `Renews ${new Date(plan.expires_at).toLocaleDateString()}`
                                      : 'Free plan limits apply'}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {plan.key !== 'premium' && !pendingUpgrade ? (
                                <Link
                                    href={route('account.upgrade')}
                                    className="inline-flex items-center gap-1.5 rounded-sm border border-mustard bg-mustard px-4 py-2 text-sm font-semibold text-earth-dusk transition hover:bg-olive-900 hover:text-white dark:hover:bg-olive-100 dark:hover:text-earth-dusk"
                                >
                                    <UpgradePlansMark className="h-4 w-4" />
                                    Upgrade plan
                                </Link>
                            ) : null}
                        </div>
                    </div>
                    <div className="px-4 py-4 sm:px-5">
                        <div className="h-1.5 overflow-hidden bg-olive-100 dark:bg-olive-800">
                            <div
                                className="h-full bg-olive-900 transition-all dark:bg-mustard"
                                style={{ width: `${usedPct}%` }}
                            />
                        </div>
                        {pendingUpgrade && (
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border border-olive-900/10 bg-earth-sand px-3 py-2.5 text-sm text-olive-800 dark:border-olive-800 dark:bg-olive-950 dark:text-olive-200">
                                <span>
                                    Pending upgrade to <strong>{pendingUpgrade.to_label}</strong>
                                    {pendingUpgrade.payment_reference
                                        ? ` · ${pendingUpgrade.payment_reference}`
                                        : ''}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.post(
                                            route('account.upgrade.cancel', pendingUpgrade.id),
                                        )
                                    }
                                    className="font-semibold text-rose-700 hover:underline dark:text-rose-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AccountLayout>
    );
}
