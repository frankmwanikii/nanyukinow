import SiteLayout from '@/Layouts/SiteLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    BadgeCheck,
    Pencil,
    Plus,
    Sparkles,
    Trash2,
} from 'lucide-react';

function statusTone(status, published) {
    if (status === 'pending') return 'bg-mustard/20 text-earth-dusk';
    if (status === 'published' && published) return 'bg-mint/30 text-olive-900';
    if (status === 'draft') return 'bg-olive-100 text-olive-700';
    return 'bg-olive-100 text-olive-600';
}

export default function Index({ plan, listings = [], pendingUpgrade = null }) {
    const { flash } = usePage().props;

    const remove = (listing) => {
        if (!confirm(`Delete “${listing.title}”?`)) return;
        router.delete(route('account.listings.destroy', listing.id));
    };

    return (
        <SiteLayout>
            <Head title="My account" />

            <div className="bg-gradient-to-b from-olive-900 to-olive-800">
                <div className="mx-auto max-w-[1100px] px-4 pb-10 pt-28 sm:px-6 sm:pt-32">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-mustard">
                        Your space
                    </p>
                    <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
                        Account
                    </h1>
                    <p className="mt-2 max-w-xl text-sm text-white/70">
                        Manage your plan and listings without leaving the site.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-[1100px] space-y-6 px-4 py-8 sm:px-6 sm:py-10">
                {(flash?.success || flash?.error) && (
                    <div
                        className={`rounded-xl border px-4 py-3 text-sm ${
                            flash.error
                                ? 'border-rose-200 bg-rose-50 text-rose-800'
                                : 'border-mint/40 bg-mint/20 text-olive-900'
                        }`}
                    >
                        {flash.error || flash.success}
                    </div>
                )}

                <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-olive-200/80 bg-white p-5 shadow-soft md:col-span-2">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                    Current plan
                                </p>
                                <h2 className="mt-1 font-display text-2xl font-bold text-olive-950">
                                    {plan.label}
                                </h2>
                                <p className="mt-1 text-sm text-olive-600">
                                    Listing badge on cards:{' '}
                                    <span className="font-semibold">{plan.badge_label}</span>
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-50 px-3 py-1.5 text-sm font-semibold text-olive-800">
                                <BadgeCheck className="h-4 w-4 text-mint-deep" />
                                {plan.listings_used}/{plan.listing_limit} used
                            </span>
                        </div>

                        <div className="mt-5 h-2 overflow-hidden rounded-full bg-olive-100">
                            <div
                                className="h-full rounded-full bg-mustard transition-all"
                                style={{
                                    width: `${Math.min(
                                        100,
                                        plan.listing_limit
                                            ? (plan.listings_used / plan.listing_limit) * 100
                                            : 0,
                                    )}%`,
                                }}
                            />
                        </div>

                        {plan.expires_at && (
                            <p className="mt-3 text-sm text-olive-500">
                                {plan.is_expired
                                    ? 'Plan expired — you are on Free entitlements until renewed.'
                                    : `Renews / expires ${new Date(plan.expires_at).toLocaleDateString()}`}
                            </p>
                        )}

                        <div className="mt-5 flex flex-wrap gap-2">
                            {plan.can_create ? (
                                <Link
                                    href={route('account.listings.create')}
                                    className="inline-flex items-center gap-2 rounded-xl bg-mustard px-4 py-2.5 text-sm font-bold text-earth-dusk transition hover:bg-olive-800 hover:text-white"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add listing
                                </Link>
                            ) : (
                                <Link
                                    href={route('account.upgrade')}
                                    className="inline-flex items-center gap-2 rounded-xl bg-mustard px-4 py-2.5 text-sm font-bold text-earth-dusk transition hover:bg-olive-800 hover:text-white"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Upgrade for more listings
                                </Link>
                            )}
                            {plan.key !== 'premium' && (
                                <Link
                                    href={route('account.upgrade')}
                                    className="inline-flex items-center gap-2 rounded-xl border border-olive-200 bg-white px-4 py-2.5 text-sm font-semibold text-olive-800 transition hover:border-mustard/50 hover:bg-mustard/10"
                                >
                                    View plans
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            )}
                            <Link
                                href={route('profile.edit')}
                                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-olive-600 transition hover:bg-olive-50 hover:text-olive-950"
                            >
                                Profile settings
                            </Link>
                            <Link
                                href={route('account.notifications')}
                                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-olive-600 transition hover:bg-olive-50 hover:text-olive-950"
                            >
                                Notifications
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-olive-200/80 bg-white p-5 shadow-soft">
                        <p className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                            Upgrade status
                        </p>
                        {pendingUpgrade ? (
                            <div className="mt-3 space-y-3">
                                <p className="text-sm text-olive-700">
                                    Pending: <strong>{pendingUpgrade.to_label}</strong>
                                </p>
                                <p className="text-xs text-olive-500">
                                    Ref: {pendingUpgrade.payment_reference}
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.post(
                                            route('account.upgrade.cancel', pendingUpgrade.id),
                                        )
                                    }
                                    className="text-sm font-semibold text-rose-600 hover:underline"
                                >
                                    Cancel request
                                </button>
                            </div>
                        ) : (
                            <div className="mt-3">
                                <p className="text-sm text-olive-600">
                                    No pending upgrade. Standard unlocks Featured badges; Premium
                                    unlocks Premium placement.
                                </p>
                                <Link
                                    href={route('pricing')}
                                    className="mt-4 inline-flex text-sm font-semibold text-olive-800 underline-offset-2 hover:underline"
                                >
                                    Compare pricing
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-olive-200/80 bg-white shadow-soft">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-olive-100 px-5 py-4">
                        <h2 className="font-display text-lg font-bold text-olive-950">
                            Your listings
                        </h2>
                        {plan.can_create && (
                            <Link
                                href={route('account.listings.create')}
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-olive-700 hover:text-olive-950"
                            >
                                <Plus className="h-4 w-4" />
                                New
                            </Link>
                        )}
                    </div>

                    {listings.length === 0 ? (
                        <div className="px-5 py-14 text-center">
                            <p className="font-display text-lg font-semibold text-olive-900">
                                No listings yet
                            </p>
                            <p className="mx-auto mt-2 max-w-md text-sm text-olive-500">
                                Your Free plan includes one listing. Submit it for review and it
                                will appear once approved.
                            </p>
                            {plan.can_create && (
                                <Link
                                    href={route('account.listings.create')}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-mustard px-4 py-2.5 text-sm font-bold text-earth-dusk"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create your first listing
                                </Link>
                            )}
                        </div>
                    ) : (
                        <ul className="divide-y divide-olive-100">
                            {listings.map((listing) => (
                                <li
                                    key={listing.id}
                                    className="flex flex-wrap items-center gap-4 px-5 py-4"
                                >
                                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-olive-100">
                                        {listing.image_url ? (
                                            <img
                                                src={listing.image_url}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-xs font-semibold text-olive-400">
                                                N/A
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold text-olive-950">
                                            {listing.title}
                                        </p>
                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                            <span
                                                className={`rounded-full px-2 py-0.5 font-semibold capitalize ${statusTone(listing.status, listing.is_published)}`}
                                            >
                                                {listing.status}
                                            </span>
                                            <span className="text-olive-500">
                                                {listing.tier_label} · {listing.category || 'Uncategorized'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {listing.is_published && listing.status === 'published' && (
                                            <Link
                                                href={route('listings.show', listing.slug)}
                                                className="rounded-lg px-2.5 py-2 text-sm font-medium text-olive-600 hover:bg-olive-50"
                                            >
                                                View
                                            </Link>
                                        )}
                                        <Link
                                            href={route('account.listings.edit', listing.id)}
                                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium text-olive-700 hover:bg-olive-50"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => remove(listing)}
                                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
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
        </SiteLayout>
    );
}
