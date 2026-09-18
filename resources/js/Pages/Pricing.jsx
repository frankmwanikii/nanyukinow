import SiteLayout from '@/Layouts/SiteLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Check, Sparkles, Zap } from 'lucide-react';

function formatMoney(amount, currency) {
    const n = Number(amount) || 0;
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency || 'KES',
            maximumFractionDigits: 0,
        }).format(n);
    } catch {
        return `${currency || 'KES'} ${n.toLocaleString()}`;
    }
}

function periodSuffix(period) {
    if (period === 'year') return '/ year';
    if (period === 'one_time') return ' one-time';
    return '/ month';
}

function displayPrice(plan) {
    if (plan.price_label) return plan.price_label;
    if (Number(plan.price_amount) === 0) return 'Free';
    return formatMoney(plan.price_amount, plan.currency);
}

const accent = {
    free: {
        icon: Check,
        wrap: 'bg-olive-100 text-olive-700',
        ring: 'ring-olive-200',
    },
    featured: {
        icon: Sparkles,
        wrap: 'bg-mint/30 text-olive-800',
        ring: 'ring-mint/50',
    },
    premium: {
        icon: Zap,
        wrap: 'bg-mustard/25 text-earth-dusk',
        ring: 'ring-mustard/45',
    },
};

export default function Pricing({ plans = [], currentPlan = null, upgradeContact = {} }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <SiteLayout>
            <Head title="Pricing" />

            <div className="relative overflow-hidden bg-gradient-to-b from-olive-900 via-olive-800 to-earth-dusk">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(242,184,46,0.18),_transparent_55%)]" />
                <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-28 text-center sm:px-6 sm:pt-32">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mustard">
                        Listing packages
                    </p>
                    <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Get found in Nanyuki
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                        Start free with one listing. Upgrade to Standard or Premium when you are
                        ready for Featured or Premium placement.
                    </p>
                    {currentPlan && (
                        <p className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-mint">
                            Your plan: {currentPlan.label} · {currentPlan.listings_used}/
                            {currentPlan.listing_limit} listings used
                        </p>
                    )}
                </div>
            </div>

            <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16">
                <div className="grid gap-6 lg:grid-cols-3">
                    {plans.map((plan) => {
                        const meta = accent[plan.key] || accent.free;
                        const Icon = meta.icon;
                        const isCurrent = currentPlan?.key === plan.key;
                        const isUpgrade =
                            user &&
                            currentPlan &&
                            plan.key !== 'free' &&
                            plan.key !== currentPlan.key &&
                            !(currentPlan.key === 'premium');

                        let ctaHref = '/register';
                        let ctaLabel = plan.cta_label || 'Get started';

                        if (user) {
                            if (plan.key === 'free' || isCurrent) {
                                ctaHref = route('account.listings.create');
                                ctaLabel = plan.key === 'free' || isCurrent ? 'Add a listing' : ctaLabel;
                                if (isCurrent && !currentPlan.can_create) {
                                    ctaHref = route('account.upgrade');
                                    ctaLabel = 'Upgrade for more slots';
                                }
                            } else if (isUpgrade || plan.key === 'premium' || plan.key === 'featured') {
                                ctaHref = route('account.upgrade');
                                ctaLabel = plan.cta_label || 'Upgrade';
                            }
                        }

                        return (
                            <article
                                key={plan.id}
                                className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-soft ${
                                    plan.is_highlighted
                                        ? `border-transparent ring-2 ${meta.ring}`
                                        : 'border-olive-200/80'
                                }`}
                            >
                                {plan.is_highlighted && (
                                    <div className="bg-gradient-to-r from-mustard via-mustard to-mint px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-earth-dusk">
                                        Most popular
                                    </div>
                                )}
                                <div className="flex flex-1 flex-col p-6 sm:p-7">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${meta.wrap}`}>
                                            <Icon className="h-5 w-5" strokeWidth={2.2} />
                                        </div>
                                        <span className="rounded-full bg-olive-50 px-2.5 py-1 text-xs font-semibold text-olive-700">
                                            Badge: {plan.badge_label}
                                        </span>
                                    </div>

                                    <h2 className="mt-5 font-display text-2xl font-bold text-olive-950">
                                        {plan.name}
                                    </h2>
                                    {plan.tagline && (
                                        <p className="mt-2 text-sm leading-relaxed text-olive-500">
                                            {plan.tagline}
                                        </p>
                                    )}

                                    <div className="mt-6 flex items-end gap-1.5">
                                        <span className="font-display text-4xl font-bold tracking-tight text-olive-950">
                                            {displayPrice(plan)}
                                        </span>
                                        {!plan.price_label && Number(plan.price_amount) > 0 && (
                                            <span className="mb-1.5 text-sm font-medium text-olive-500">
                                                {periodSuffix(plan.billing_period)}
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-2 text-sm font-medium text-olive-600">
                                        Up to {plan.listing_limit} listing
                                        {plan.listing_limit === 1 ? '' : 's'}
                                    </p>

                                    <ul className="mt-7 flex-1 space-y-3">
                                        {(plan.inclusions || []).map((item) => (
                                            <li
                                                key={item}
                                                className="flex gap-2.5 text-sm leading-snug text-olive-700"
                                            >
                                                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint/25 text-olive-800">
                                                    <Check className="h-3 w-3" strokeWidth={3} />
                                                </span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href={ctaHref}
                                        className={`mt-8 inline-flex items-center justify-center rounded-xl px-4 py-3 text-center text-sm font-bold transition ${
                                            plan.is_highlighted
                                                ? 'bg-mustard text-earth-dusk hover:bg-olive-800 hover:text-white'
                                                : 'bg-olive-800 text-white hover:bg-mustard hover:text-earth-dusk'
                                        }`}
                                    >
                                        {isCurrent ? (currentPlan.can_create ? 'Add a listing' : ctaLabel) : ctaLabel}
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {(upgradeContact.mpesa_paybill || upgradeContact.instructions) && (
                    <div className="mt-12 rounded-2xl border border-olive-200/80 bg-white p-6 shadow-soft sm:p-8">
                        <h3 className="font-display text-xl font-bold text-olive-950">
                            How upgrades work
                        </h3>
                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-olive-600">
                            {upgradeContact.instructions}
                        </p>
                        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                            {upgradeContact.mpesa_paybill && (
                                <div className="rounded-xl bg-earth-sand/70 px-4 py-3">
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                        M-Pesa Paybill / Till
                                    </dt>
                                    <dd className="mt-1 font-semibold text-olive-950">
                                        {upgradeContact.mpesa_paybill}
                                    </dd>
                                </div>
                            )}
                            {upgradeContact.mpesa_account && (
                                <div className="rounded-xl bg-earth-sand/70 px-4 py-3">
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                        Account
                                    </dt>
                                    <dd className="mt-1 font-semibold text-olive-950">
                                        {upgradeContact.mpesa_account}
                                    </dd>
                                </div>
                            )}
                            {upgradeContact.whatsapp && (
                                <div className="rounded-xl bg-earth-sand/70 px-4 py-3">
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                        WhatsApp
                                    </dt>
                                    <dd className="mt-1 font-semibold text-olive-950">
                                        {upgradeContact.whatsapp}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                )}
            </div>
        </SiteLayout>
    );
}
