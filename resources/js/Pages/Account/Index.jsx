import AccountLayout from '@/Layouts/AccountLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';

function statusTone(status, published) {
    if (status === 'pending') return 'text-earth-dusk';
    if (status === 'published' && published) return 'text-olive-800';
    if (status === 'draft') return 'text-olive-500';
    return 'text-olive-500';
}

export default function Index({ plan, listings = [], pendingUpgrade = null }) {
    const { flash } = usePage().props;

    const remove = (listing) => {
        if (!confirm(`Delete “${listing.title}”?`)) return;
        router.delete(route('account.listings.destroy', listing.id));
    };

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
                                ? 'border-rose-200 bg-rose-50 text-rose-800'
                                : 'border-olive-200 bg-white text-olive-900'
                        }`}
                    >
                        {flash.error || flash.success}
                    </div>
                )}

                {/* Metric strip */}
                <section className="grid grid-cols-2 border border-olive-200 bg-white lg:grid-cols-4">
                    <div className="border-b border-olive-100 px-4 py-4 sm:px-5 lg:border-b-0 lg:border-r">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-olive-400">
                            Plan
                        </p>
                        <p className="mt-2 font-display text-2xl font-semibold text-olive-950">
                            {plan.label}
                        </p>
                    </div>
                    <div className="border-b border-l border-olive-100 px-4 py-4 sm:px-5 lg:border-b-0 lg:border-l-0 lg:border-r">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-olive-400">
                            Listings
                        </p>
                        <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-olive-950">
                            {plan.listings_used}
                            <span className="text-base font-normal text-olive-400">
                                /{plan.listing_limit}
                            </span>
                        </p>
                    </div>
                    <div className="border-olive-100 px-4 py-4 sm:px-5 lg:border-r">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-olive-400">
                            Slots left
                        </p>
                        <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-olive-950">
                            {Math.max(0, (plan.listing_limit || 0) - (plan.listings_used || 0))}
                        </p>
                    </div>
                    <div className="border-l border-olive-100 px-4 py-4 sm:px-5 lg:border-l-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-olive-400">
                            Upgrade
                        </p>
                        <p className="mt-2 text-sm font-medium text-olive-800">
                            {pendingUpgrade ? (
                                <>Pending {pendingUpgrade.to_label}</>
                            ) : plan.key === 'premium' ? (
                                'You’re on Premium'
                            ) : (
                                <Link
                                    href={route('account.upgrade')}
                                    className="inline-flex items-center gap-1 font-semibold text-olive-900 underline-offset-2 hover:underline"
                                >
                                    View plans
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                            )}
                        </p>
                    </div>
                </section>

                {/* Plan usage + actions */}
                <section className="border border-olive-200 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-olive-100 px-4 py-3 sm:px-5">
                        <div>
                            <h2 className="text-sm font-semibold text-olive-950">Plan usage</h2>
                            <p className="mt-0.5 text-xs text-olive-500">
                                {plan.is_expired
                                    ? 'Plan expired — you’re on Free until renewed.'
                                    : plan.expires_at
                                      ? `Renews ${new Date(plan.expires_at).toLocaleDateString()}`
                                      : 'Free plan limits apply'}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {plan.can_create ? (
                                <Link
                                    href={route('account.listings.create')}
                                    className="inline-flex items-center gap-1.5 bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-mustard hover:text-earth-dusk"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add listing
                                </Link>
                            ) : (
                                <Link
                                    href={route('account.upgrade')}
                                    className="inline-flex items-center gap-1.5 bg-mustard px-3.5 py-2 text-sm font-semibold text-earth-dusk transition hover:bg-olive-900 hover:text-white"
                                >
                                    Upgrade
                                </Link>
                            )}
                            {plan.key !== 'premium' && (
                                <Link
                                    href={route('account.upgrade')}
                                    className="inline-flex items-center gap-1.5 border border-olive-200 px-3.5 py-2 text-sm font-semibold text-olive-800 transition hover:bg-olive-50"
                                >
                                    Compare plans
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="px-4 py-4 sm:px-5">
                        <div className="h-1.5 overflow-hidden bg-olive-100">
                            <div
                                className="h-full bg-olive-800 transition-all"
                                style={{ width: `${usedPct}%` }}
                            />
                        </div>
                        {pendingUpgrade && (
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border border-olive-100 bg-[#f4f2ec] px-3 py-2.5 text-sm text-olive-800">
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
                                    className="font-semibold text-rose-600 hover:underline"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Listings */}
                <section className="border border-olive-200 bg-white">
                    <div className="flex items-center justify-between gap-3 border-b border-olive-100 px-4 py-3 sm:px-5">
                        <h2 className="text-sm font-semibold text-olive-950">Your listings</h2>
                        {plan.can_create && (
                            <Link
                                href={route('account.listings.create')}
                                className="inline-flex items-center gap-1 text-sm font-semibold text-olive-800 hover:text-olive-950"
                            >
                                <Plus className="h-4 w-4" />
                                New
                            </Link>
                        )}
                    </div>

                    {listings.length === 0 ? (
                        <div className="px-4 py-12 text-center sm:px-5">
                            <p className="text-sm font-semibold text-olive-900">No listings yet</p>
                            <p className="mx-auto mt-1 max-w-sm text-sm text-olive-500">
                                Your plan includes {plan.listing_limit} listing
                                {plan.listing_limit === 1 ? '' : 's'}. Submit one for review to go
                                live.
                            </p>
                            {plan.can_create && (
                                <Link
                                    href={route('account.listings.create')}
                                    className="mt-5 inline-flex items-center gap-1.5 bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-mustard hover:text-earth-dusk"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create listing
                                </Link>
                            )}
                        </div>
                    ) : (
                        <ul className="divide-y divide-olive-100">
                            {listings.map((listing) => (
                                <li
                                    key={listing.id}
                                    className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5"
                                >
                                    <div className="h-12 w-12 shrink-0 overflow-hidden bg-olive-100">
                                        {listing.image_url ? (
                                            <img
                                                src={listing.image_url}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-[10px] font-semibold text-olive-400">
                                                N/A
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-olive-950">
                                            {listing.title}
                                        </p>
                                        <p className="mt-0.5 text-xs text-olive-500">
                                            <span
                                                className={`font-medium capitalize ${statusTone(listing.status, listing.is_published)}`}
                                            >
                                                {listing.status}
                                            </span>
                                            <span className="text-olive-300"> · </span>
                                            {listing.tier_label}
                                            <span className="text-olive-300"> · </span>
                                            {listing.category || 'Uncategorized'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {listing.is_published && listing.status === 'published' && (
                                            <Link
                                                href={route('listings.show', listing.slug)}
                                                className="px-2.5 py-1.5 text-sm font-medium text-olive-600 hover:bg-olive-50 hover:text-olive-950"
                                            >
                                                View
                                            </Link>
                                        )}
                                        <Link
                                            href={route('account.listings.edit', listing.id)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-olive-700 hover:bg-olive-50"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => remove(listing)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </AccountLayout>
    );
}
