import SiteLayout from '@/Layouts/SiteLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';

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
    if (period === 'year') return '/year';
    if (period === 'one_time') return ' one-time';
    return '/mo';
}

function displayPrice(plan) {
    if (plan.price_label) return plan.price_label;
    if (Number(plan.price_amount) === 0) return 'Free';
    return formatMoney(plan.price_amount, plan.currency);
}

export default function Pricing({
    plans = [],
    currentPlan = null,
    upgradeContact = {},
    page = null,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const content = page?.content || {};

    return (
        <SiteLayout>
            <Head title={page?.meta_title || 'Pricing'} />

            <div className="border-b border-olive-800 bg-olive-900">
                <div className="mx-auto max-w-5xl px-4 pb-14 pt-28 sm:px-6 sm:pt-32">
                    <p className="text-sm font-medium text-mustard">Pricing</p>
                    <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                        {content.headline || 'Plans for getting found in Nanyuki'}
                    </h1>
                    <p className="mt-4 max-w-xl text-base leading-relaxed text-white/65">
                        {content.subtext ||
                            'Start free with one listing. Upgrade when you need more slots and stronger placement.'}
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
                <div className="overflow-hidden rounded-xl border border-olive-200 bg-white">
                    <div
                        className={`grid divide-olive-100 lg:divide-x ${
                            plans.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
                        }`}
                    >
                        {plans.map((plan) => {
                            const isCurrent = currentPlan?.key === plan.key;
                            const featured = Boolean(plan.is_highlighted);
                            let ctaHref = '/register';
                            let ctaLabel = plan.cta_label || 'Get started';

                            if (user) {
                                if (plan.key === 'free' || isCurrent) {
                                    ctaHref = route('account.listings.create');
                                    ctaLabel =
                                        isCurrent && !currentPlan.can_create
                                            ? 'Upgrade plan'
                                            : 'Add a listing';
                                    if (isCurrent && !currentPlan.can_create) {
                                        ctaHref = route('account.upgrade');
                                    }
                                } else {
                                    ctaHref = route('account.upgrade');
                                    ctaLabel = plan.cta_label || 'Upgrade';
                                }
                            }

                            return (
                                <article
                                    key={plan.id}
                                    className={`relative flex flex-col border-b border-olive-100 p-6 last:border-b-0 lg:border-b-0 sm:p-8 ${
                                        featured
                                            ? 'bg-olive-950 text-white'
                                            : 'bg-white'
                                    }`}
                                >
                                    <div className="flex items-baseline justify-between gap-3">
                                        <h2
                                            className={`font-display text-lg font-semibold tracking-tight ${
                                                featured ? 'text-white' : 'text-olive-950'
                                            }`}
                                        >
                                            {plan.name}
                                        </h2>
                                        {featured ? (
                                            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mustard">
                                                Popular
                                            </span>
                                        ) : isCurrent ? (
                                            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-olive-400">
                                                Yours
                                            </span>
                                        ) : null}
                                    </div>

                                    {plan.tagline && (
                                        <p
                                            className={`mt-2 text-sm leading-relaxed ${
                                                featured ? 'text-white/65' : 'text-olive-500'
                                            }`}
                                        >
                                            {plan.tagline}
                                        </p>
                                    )}

                                    <div className="mt-8">
                                        <div className="flex items-baseline gap-1.5">
                                            <span
                                                className={`font-display text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl ${
                                                    featured ? 'text-white' : 'text-olive-950'
                                                }`}
                                            >
                                                {displayPrice(plan)}
                                            </span>
                                            {!plan.price_label && Number(plan.price_amount) > 0 && (
                                                <span
                                                    className={`text-sm ${
                                                        featured ? 'text-white/55' : 'text-olive-400'
                                                    }`}
                                                >
                                                    {periodSuffix(plan.billing_period)}
                                                </span>
                                            )}
                                        </div>
                                        <p
                                            className={`mt-2 text-sm font-medium ${
                                                featured ? 'text-mustard' : 'text-olive-700'
                                            }`}
                                        >
                                            {plan.listing_limit} listing
                                            {plan.listing_limit === 1 ? '' : 's'} included
                                        </p>
                                    </div>

                                    <ul className="mt-8 flex-1 space-y-2.5 border-t border-dashed border-olive-200/70 pt-6">
                                        {(plan.inclusions || []).map((item) => (
                                            <li
                                                key={item}
                                                className={`flex gap-2.5 text-sm leading-snug ${
                                                    featured ? 'text-white/80' : 'text-olive-700'
                                                }`}
                                            >
                                                <Check
                                                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                                                        featured ? 'text-mustard' : 'text-olive-800'
                                                    }`}
                                                    strokeWidth={2.25}
                                                />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href={ctaHref}
                                        className={`mt-8 inline-flex w-full items-center justify-center px-4 py-2.5 text-center text-sm font-semibold transition ${
                                            featured
                                                ? 'bg-mustard text-earth-dusk hover:bg-white'
                                                : 'bg-olive-900 text-white hover:bg-mustard hover:text-earth-dusk'
                                        }`}
                                    >
                                        {ctaLabel}
                                    </Link>
                                </article>
                            );
                        })}
                    </div>
                </div>

                {(upgradeContact.mpesa_paybill || upgradeContact.instructions) && (
                    <div className="mt-10 border border-olive-200 bg-white p-6 sm:p-8">
                        <h3 className="font-display text-xl font-semibold text-olive-950">
                            How upgrades work
                        </h3>
                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-olive-600">
                            {upgradeContact.instructions}
                        </p>
                        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                            {upgradeContact.mpesa_paybill && (
                                <div className="border border-olive-100 bg-earth-sand/50 px-4 py-3">
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                        M-Pesa Paybill / Till
                                    </dt>
                                    <dd className="mt-1 font-semibold text-olive-950">
                                        {upgradeContact.mpesa_paybill}
                                    </dd>
                                </div>
                            )}
                            {upgradeContact.mpesa_account && (
                                <div className="border border-olive-100 bg-earth-sand/50 px-4 py-3">
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                        Account
                                    </dt>
                                    <dd className="mt-1 font-semibold text-olive-950">
                                        {upgradeContact.mpesa_account}
                                    </dd>
                                </div>
                            )}
                            {upgradeContact.whatsapp && (
                                <div className="border border-olive-100 bg-earth-sand/50 px-4 py-3">
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
