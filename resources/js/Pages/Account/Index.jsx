import AccountLayout from '@/Layouts/AccountLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    BadgeCheck,
    Pencil,
    Plus,
    Search,
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
    const { auth, flash } = usePage().props;
    const user = auth?.user;

    const remove = (listing) => {
        if (!confirm(`Delete “${listing.title}”?`)) return;
        router.delete(route('account.listings.destroy', listing.id));
    };

    const chips = [
        plan.can_create
            ? { href: route('account.listings.create'), label: 'Add listing' }
            : { href: route('account.upgrade'), label: 'Upgrade plan' },
        { href: route('account.messages'), label: 'Messages' },
        { href: route('profile.edit'), label: 'Personal info' },
        plan.key !== 'premium'
            ? { href: route('account.upgrade'), label: 'View plans' }
            : null,
    ].filter(Boolean);

    return (
        <AccountLayout title="Home">
            <Head title="Dashboard" />

            <div className="space-y-6">
                {(flash?.success || flash?.error) && (
                    <div
                        className={`rounded-2xl border px-4 py-3 text-sm ${
                            flash.error
                                ? 'border-rose-200 bg-rose-50 text-rose-800'
                                : 'border-mint/40 bg-mint/20 text-olive-900'
                        }`}
                    >
                        {flash.error || flash.success}
                    </div>
                )}

                <section className="rounded-3xl border border-olive-200/80 bg-white px-5 py-8 text-center shadow-soft sm:px-8">
                    <p className="text-sm text-olive-500">Welcome back</p>
                    <h2 className="mt-1 font-display text-3xl font-bold text-olive-950 sm:text-4xl">
                        {user?.name?.split(' ')[0] || 'Member'}
                    </h2>
                    <p className="mt-2 text-sm text-olive-600">
                        Manage your plan, listings, and messages in one place.
                    </p>

                    <form
                        action={route('explore')}
                        method="get"
                        className="relative mx-auto mt-6 max-w-xl"
                        role="search"
                    >
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-400" />
                        <input
                            name="q"
                            placeholder="Search your next listing idea…"
                            className="w-full rounded-full border border-olive-200 bg-olive-50/70 py-3.5 pl-11 pr-4 text-sm text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-mustard focus:bg-white focus:ring-2 focus:ring-mustard/25"
                        />
                    </form>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                        {chips.map((chip) => (
                            <Link
                                key={chip.label}
                                href={chip.href}
                                className="rounded-full border border-olive-200 bg-white px-3.5 py-2 text-sm font-semibold text-olive-800 transition hover:border-mustard/50 hover:bg-mustard/10"
                            >
                                {chip.label}
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-olive-200/80 bg-white p-5 shadow-soft md:col-span-2">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                    Current plan
                                </p>
                                <h3 className="mt-1 font-display text-2xl font-bold text-olive-950">
                                    {plan.label}
                                </h3>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-50 px-3 py-1.5 text-sm font-semibold text-olive-800">
                                <BadgeCheck className="h-4 w-4 text-mint-deep" />
                                {plan.listings_used}/{plan.listing_limit} listings
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
                                    ? 'Plan expired — you’re back on Free until you renew.'
                                    : `Renews / expires ${new Date(plan.expires_at).toLocaleDateString()}`}
                            </p>
                        )}

                        <div className="mt-5 flex flex-wrap gap-2">
                            {plan.can_create ? (
                                <Link
                                    href={route('account.listings.create')}
                                    className="inline-flex items-center gap-2 rounded-full bg-mustard px-4 py-2.5 text-sm font-bold text-earth-dusk transition hover:bg-olive-800 hover:text-white"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add listing
                                </Link>
                            ) : (
                                <Link
                                    href={route('account.upgrade')}
                                    className="inline-flex items-center gap-2 rounded-full bg-mustard px-4 py-2.5 text-sm font-bold text-earth-dusk transition hover:bg-olive-800 hover:text-white"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Upgrade for more listings
                                </Link>
                            )}
                            {plan.key !== 'premium' && (
                                <Link
                                    href={route('account.upgrade')}
                                    className="inline-flex items-center gap-2 rounded-full border border-olive-200 bg-white px-4 py-2.5 text-sm font-semibold text-olive-800 transition hover:border-mustard/50 hover:bg-mustard/10"
                                >
                                    View plans
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-olive-200/80 bg-white p-5 shadow-soft">
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
                                    Want better placement? Compare plans and upgrade when you’re
                                    ready.
                                </p>
                                <Link
                                    href={route('account.upgrade')}
                                    className="mt-4 inline-flex text-sm font-semibold text-olive-800 underline-offset-2 hover:underline"
                                >
                                    View plans
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                <section className="overflow-hidden rounded-3xl border border-olive-200/80 bg-white shadow-soft">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-olive-100 px-5 py-4">
                        <h3 className="font-display text-lg font-bold text-olive-950">
                            Your listings
                        </h3>
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
                                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-mustard px-4 py-2.5 text-sm font-bold text-earth-dusk"
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
                                                {listing.tier_label} ·{' '}
                                                {listing.category || 'Uncategorized'}
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
        </AccountLayout>
    );
}
