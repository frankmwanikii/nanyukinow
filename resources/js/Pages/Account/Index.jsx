import AccountLayout from '@/Layouts/AccountLayout';
import {
    ActionMenu,
    DataTable,
    ExpiryCell,
    StatusBadge,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Bookmark,
    LayoutList,
    Plus,
    Sparkles,
} from 'lucide-react';

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function MetricCard({ label, children, href }) {
    const inner = (
        <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-olive-400 dark:text-olive-500">
                {label}
            </p>
            <div className="mt-2">{children}</div>
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                className="rounded-2xl border border-olive-200/80 bg-white p-4 shadow-soft transition hover:border-olive-300 hover:shadow-lift dark:border-olive-800 dark:bg-olive-900 dark:shadow-none dark:hover:border-olive-700 sm:p-5"
            >
                {inner}
            </Link>
        );
    }

    return (
        <div className="rounded-2xl border border-olive-200/80 bg-white p-4 shadow-soft dark:border-olive-800 dark:bg-olive-900 dark:shadow-none sm:p-5">
            {inner}
        </div>
    );
}

export default function Index({
    plan,
    listings = [],
    bookmarksCount = 0,
    pendingUpgrade = null,
}) {
    const { flash } = usePage().props;
    const { confirm, dialog } = useConfirm();

    const remove = async (listing) => {
        const ok = await confirm({
            title: 'Delete listing?',
            message: `Delete “${listing.title || 'Untitled'}”? This cannot be undone.`,
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        router.delete(route('account.listings.destroy', listing.slug || listing.id));
    };

    const usedPct = plan.listing_limit
        ? Math.min(100, (plan.listings_used / plan.listing_limit) * 100)
        : 0;

    return (
        <AccountLayout title="Dashboard">
            {dialog}
            <Head title="Dashboard" />

            <div className="space-y-5">
                {(flash?.success || flash?.error) && (
                    <div
                        className={`rounded-2xl border px-4 py-3 text-sm ${
                            flash.error
                                ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
                                : 'border-olive-200 bg-white text-olive-900 dark:border-olive-800 dark:bg-olive-900 dark:text-olive-100'
                        }`}
                    >
                        {flash.error || flash.success}
                    </div>
                )}

                {/* Metric cards */}
                <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                    <MetricCard label="Plan">
                        <p className="font-display text-2xl font-semibold text-olive-950 dark:text-olive-50">
                            {plan.label}
                        </p>
                    </MetricCard>
                    <MetricCard label="Listings">
                        <p className="font-display text-2xl font-semibold tabular-nums text-olive-950 dark:text-olive-50">
                            {plan.listings_used}
                            <span className="text-base font-normal text-olive-400 dark:text-olive-500">
                                /{plan.listing_limit}
                            </span>
                        </p>
                    </MetricCard>
                    <MetricCard label="Bookmarks" href={route('account.bookmarks')}>
                        <p className="inline-flex items-center gap-2 font-display text-2xl font-semibold tabular-nums text-olive-950 dark:text-olive-50">
                            <Bookmark
                                className="h-5 w-5 text-olive-500 dark:text-olive-400"
                                strokeWidth={1.85}
                            />
                            {bookmarksCount}
                        </p>
                    </MetricCard>
                </section>

                {/* Plan usage */}
                <section className="overflow-hidden rounded-2xl border border-olive-200/80 bg-white shadow-soft dark:border-olive-800 dark:bg-olive-900 dark:shadow-none">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-olive-100 px-4 py-4 sm:px-5 dark:border-olive-800">
                        <div className="flex min-w-0 items-start gap-3">
                            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-olive-50 text-olive-700 dark:bg-olive-950 dark:text-olive-300">
                                <Sparkles className="h-4 w-4" strokeWidth={1.85} />
                            </span>
                            <div>
                                <h2 className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                                    Plan usage
                                </h2>
                                <p className="mt-0.5 text-xs text-olive-500 dark:text-olive-400">
                                    {plan.is_expired
                                        ? 'Plan expired — you’re on Free until renewed.'
                                        : plan.expires_at
                                          ? `Renews ${new Date(plan.expires_at).toLocaleDateString()}`
                                          : 'Free plan limits apply'}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {plan.key !== 'premium' && !pendingUpgrade ? (
                                <Link
                                    href={route('account.upgrade')}
                                    className="nn-upgrade-glow inline-flex items-center gap-1.5 rounded-full border border-mustard/70 bg-mustard px-4 py-2 text-sm font-semibold text-earth-dusk transition hover:bg-olive-900 hover:text-white dark:border-mustard dark:bg-mustard dark:text-earth-dusk dark:hover:bg-olive-100"
                                >
                                    <Sparkles className="h-4 w-4" strokeWidth={1.85} />
                                    Upgrade plan
                                </Link>
                            ) : null}
                        </div>
                    </div>
                    <div className="px-4 py-4 sm:px-5">
                        <div className="h-2 overflow-hidden rounded-full bg-olive-100 dark:bg-olive-800">
                            <div
                                className="h-full rounded-full bg-olive-800 transition-all dark:bg-mustard"
                                style={{ width: `${usedPct}%` }}
                            />
                        </div>
                        {pendingUpgrade && (
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-olive-100 bg-earth-sand px-3 py-2.5 text-sm text-olive-800 dark:border-olive-800 dark:bg-olive-950 dark:text-olive-200">
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
                                    className="font-semibold text-rose-600 hover:underline dark:text-rose-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Listings */}
                <section className="overflow-hidden rounded-2xl border border-olive-200/80 bg-white shadow-soft dark:border-olive-800 dark:bg-olive-900 dark:shadow-none">
                    <div className="flex items-center justify-between gap-3 border-b border-olive-100 px-4 py-4 sm:px-5 dark:border-olive-800">
                        <div className="flex items-center gap-2.5">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-olive-50 text-olive-700 dark:bg-olive-950 dark:text-olive-300">
                                <LayoutList className="h-4 w-4" strokeWidth={1.85} />
                            </span>
                            <h2 className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                                Your listings
                            </h2>
                        </div>
                        {plan.can_create ? (
                            <Link
                                href={route('account.listings.create')}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-mustard hover:text-earth-dusk dark:bg-mustard dark:text-earth-dusk dark:hover:bg-olive-100"
                            >
                                <Plus className="h-4 w-4" />
                                Add listing
                            </Link>
                        ) : plan.key !== 'premium' ? (
                            <Link
                                href={route('account.upgrade')}
                                className="nn-upgrade-glow inline-flex items-center gap-1.5 rounded-full border border-mustard/70 bg-mustard px-4 py-2 text-sm font-semibold text-earth-dusk transition hover:bg-olive-900 hover:text-white"
                            >
                                <Sparkles className="h-4 w-4" strokeWidth={1.85} />
                                Upgrade plan
                            </Link>
                        ) : null}
                    </div>

                    {listings.length === 0 ? (
                        <div className="px-4 py-12 text-center sm:px-5">
                            <p className="text-sm font-semibold text-olive-900 dark:text-olive-100">
                                No listings yet
                            </p>
                            <p className="mx-auto mt-1 max-w-sm text-sm text-olive-500 dark:text-olive-400">
                                Your plan includes {plan.listing_limit} listing
                                {plan.listing_limit === 1 ? '' : 's'}. Submit one for review to go
                                live.
                            </p>
                            {plan.can_create && (
                                <Link
                                    href={route('account.listings.create')}
                                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-mustard hover:text-earth-dusk dark:bg-mustard dark:text-earth-dusk"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create listing
                                </Link>
                            )}
                        </div>
                    ) : (
                        <DataTable>
                            <thead>
                                <tr>
                                    <Th>Title</Th>
                                    <Th>Category</Th>
                                    <Th>Last modified</Th>
                                    <Th>Expiry date</Th>
                                    <Th>Date published</Th>
                                    <Th>Status</Th>
                                    <Th align="right">Actions</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {listings.map((listing) => (
                                    <tr
                                        key={listing.id}
                                        className="transition hover:bg-olive-50/60 dark:hover:bg-olive-800/40"
                                    >
                                        <Td>
                                            <Link
                                                href={route(
                                                    'account.listings.edit',
                                                    listing.slug || listing.id,
                                                )}
                                                className="flex min-w-[12rem] items-center gap-3 rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-mustard/60"
                                            >
                                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-olive-100 dark:bg-olive-800">
                                                    {listing.image_url ? (
                                                        <img
                                                            src={listing.image_url}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center text-[9px] font-semibold text-olive-400 dark:text-olive-500">
                                                            N/A
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="truncate text-sm font-semibold text-olive-950 underline-offset-2 hover:underline dark:text-olive-50">
                                                    {listing.title || 'Untitled'}
                                                </p>
                                            </Link>
                                        </Td>
                                        <Td>
                                            <span className="text-sm text-olive-700 dark:text-olive-200">
                                                {listing.category || '—'}
                                            </span>
                                        </Td>
                                        <Td>
                                            <span className="whitespace-nowrap text-sm text-olive-600 dark:text-olive-300">
                                                {formatDate(listing.updated_at)}
                                            </span>
                                        </Td>
                                        <Td>
                                            <ExpiryCell
                                                expiresAt={listing.expires_at}
                                                isExpired={listing.is_expired}
                                            />
                                        </Td>
                                        <Td>
                                            <span className="whitespace-nowrap text-sm text-olive-600 dark:text-olive-300">
                                                {formatDate(listing.published_at)}
                                            </span>
                                        </Td>
                                        <Td>
                                            <StatusBadge status={listing.status} />
                                        </Td>
                                        <Td align="right">
                                            <ActionMenu
                                                label="Actions"
                                                items={[
                                                    ...(listing.is_published &&
                                                    listing.status === 'published'
                                                        ? [
                                                              {
                                                                  label: 'View',
                                                                  href: route(
                                                                      'listings.show',
                                                                      listing.slug,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    {
                                                        label: 'Edit',
                                                        href: route(
                                                            'account.listings.edit',
                                                            listing.slug || listing.id,
                                                        ),
                                                    },
                                                    {
                                                        label: 'Delete',
                                                        danger: true,
                                                        onClick: () => remove(listing),
                                                    },
                                                ]}
                                            />
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </DataTable>
                    )}
                </section>
            </div>
        </AccountLayout>
    );
}
