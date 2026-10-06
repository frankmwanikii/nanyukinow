import { CategoryPicker } from '@/Components/pricing/CategoryPricingBreakdown';
import SiteLayout from '@/Layouts/SiteLayout';
import {
    categoryInclusionsForPlan,
    getPricingCategoryBreakdown,
    normalizePlanKey,
} from '@/data/pricingCategoryBreakdown';
import { Head, Link, usePage } from '@inertiajs/react';
import { Check, ChevronDown, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

function amountForPeriod(plan, period) {
    if (period === 'year') {
        if (plan.yearly_price_amount != null && plan.yearly_price_amount !== '') {
            return Number(plan.yearly_price_amount) || 0;
        }
        return (Number(plan.price_amount) || 0) * 10;
    }
    return Number(plan.price_amount) || 0;
}

function formatAmountOnly(amount) {
    const n = Number(amount) || 0;
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

function periodShort(period) {
    if (period === 'year') return '/ year';
    if (period === 'one_time') return ' one-time';
    return '/ month';
}

function planRank(planKey) {
    const key = normalizePlanKey(planKey);
    if (key === 'premium') {
        return 2;
    }
    if (key === 'featured') {
        return 1;
    }
    return 0;
}

/**
 * Features accordion: open on desktop, collapsed on mobile.
 */
function PlanCardFeatures({
    planName,
    listingLimit = null,
    inclusions,
    categoryLabel,
}) {
    const [open, setOpen] = useState(false);
    const listingLine =
        listingLimit == null
            ? null
            : `${listingLimit} listing${listingLimit === 1 ? '' : 's'} included`;

    return (
        <div className="mt-6 flex-1 border-t border-olive-100 pt-5">
            <button
                type="button"
                className="flex w-full items-center justify-between gap-3 py-1 text-left md:pointer-events-none md:hidden"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
            >
                <span className="text-sm font-bold text-olive-950">Key features</span>
                <ChevronDown
                    className={`h-5 w-5 shrink-0 text-olive-400 transition ${
                        open ? 'rotate-180' : ''
                    }`}
                    strokeWidth={2}
                />
            </button>

            <div className={`${open ? 'mt-3 block' : 'hidden'} md:mt-0 md:block`}>
                <p className="mb-3 hidden text-sm font-semibold text-olive-900 md:block">
                    With {planName}, get:
                </p>
                {listingLine ? (
                    <p className="mb-4 text-sm font-semibold text-olive-800">
                        {listingLine}
                    </p>
                ) : null}
                <ul className="space-y-3">
                    {inclusions.length === 0 ? (
                        <li className="text-sm text-olive-600">
                            Core listing fields for {categoryLabel}.
                        </li>
                    ) : (
                        inclusions.map((item) => {
                            const isInherit = /^Everything in /i.test(item);
                            return (
                                <li
                                    key={item}
                                    className={`flex gap-3 text-sm leading-snug ${
                                        isInherit
                                            ? 'font-semibold text-olive-900'
                                            : 'text-olive-700'
                                    }`}
                                >
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-olive-100 text-olive-800">
                                        <Check className="h-3 w-3" strokeWidth={2.75} />
                                    </span>
                                    <span className="min-w-0 text-pretty pt-0.5">{item}</span>
                                </li>
                            );
                        })
                    )}
                </ul>
            </div>
        </div>
    );
}

function maxYearlySavings(plans = []) {
    let best = 0;
    plans.forEach((plan) => {
        const monthly = Number(plan.price_amount) || 0;
        if (monthly <= 0) return;
        const yearly = amountForPeriod(plan, 'year');
        if (yearly <= 0) return;
        const full = monthly * 12;
        if (yearly >= full) return;
        best = Math.max(best, Math.round(((full - yearly) / full) * 100));
    });
    return best;
}

function readCategoryFromUrl() {
    if (typeof window === 'undefined') return null;
    try {
        const value = new URLSearchParams(window.location.search).get('category');
        return getPricingCategoryBreakdown(value)?.key || null;
    } catch {
        return null;
    }
}

function writeCategoryToUrl(categoryKey) {
    if (typeof window === 'undefined') return;
    try {
        const url = new URL(window.location.href);
        if (categoryKey) {
            const breakdown = getPricingCategoryBreakdown(categoryKey);
            url.searchParams.set('category', breakdown?.slug || categoryKey);
        } else {
            url.searchParams.delete('category');
        }
        window.history.replaceState({}, '', url);
    } catch {
        // ignore
    }
}

function BillingSwitcher({ value, onChange, savingsPercent = 0 }) {
    const yearly = value === 'year';

    return (
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
                type="button"
                onClick={() => onChange('month')}
                className={`text-sm font-semibold transition ${
                    !yearly ? 'text-olive-950' : 'text-olive-400 hover:text-olive-700'
                }`}
            >
                Monthly
            </button>
            <button
                type="button"
                role="switch"
                aria-checked={yearly}
                aria-label="Billing period"
                onClick={() => onChange(yearly ? 'month' : 'year')}
                className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                    yearly ? 'bg-olive-800' : 'bg-olive-200'
                }`}
            >
                <span
                    className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${
                        yearly ? 'translate-x-6' : 'translate-x-0'
                    }`}
                />
            </button>
            <button
                type="button"
                onClick={() => onChange('year')}
                className={`inline-flex items-center gap-2 text-sm font-semibold transition ${
                    yearly ? 'text-olive-950' : 'text-olive-400 hover:text-olive-700'
                }`}
            >
                Yearly
                {savingsPercent > 0 ? (
                    <span className="rounded-full bg-mint/40 px-2 py-0.5 text-xs font-bold text-olive-800">
                        save {savingsPercent}%
                    </span>
                ) : null}
            </button>
        </div>
    );
}

export default function Pricing({
    plans = [],
    plansByCategory = {},
    categories = [],
    initialCategory = null,
    currentPlan = null,
    page = null,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const content = page?.content || {};
    const [billing, setBilling] = useState(() =>
        currentPlan?.billing_period === 'year' ? 'year' : 'month',
    );
    const [categoryKey, setCategoryKey] = useState(initialCategory);
    const breakdown = useMemo(
        () => getPricingCategoryBreakdown(categoryKey),
        [categoryKey],
    );
    const categoryPlans = useMemo(() => {
        if (categoryKey && plansByCategory?.[categoryKey]?.length) {
            return plansByCategory[categoryKey];
        }
        if (categoryKey && plans.length) {
            return plans.filter((p) => p.category_key === categoryKey);
        }
        return plans;
    }, [categoryKey, plansByCategory, plans]);
    const savings = useMemo(() => maxYearlySavings(categoryPlans), [categoryPlans]);
    const showSwitcher = categoryPlans.some(
        (p) => Number(p.price_amount) > 0 && p.yearly_price_amount != null,
    );

    useEffect(() => {
        const fromUrl = readCategoryFromUrl();
        if (fromUrl) {
            setCategoryKey(fromUrl);
            return;
        }
        if (initialCategory) {
            setCategoryKey(initialCategory);
        }
    }, [initialCategory]);

    const selectCategory = (key) => {
        setCategoryKey(key);
        writeCategoryToUrl(key);
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const clearCategory = () => {
        setCategoryKey(null);
        writeCategoryToUrl(null);
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

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
                            (breakdown
                                ? `${breakdown.label} plans — Free, Standard, and Premium with the fields that unlock on each.`
                                : 'Start free with one listing. Open a category to see its Free, Standard, and Premium plans.')}
                    </p>
                </div>
            </div>

            <div className="bg-earth-sand">
            <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 sm:px-6 sm:py-16">
                {!breakdown ? (
                    <CategoryPicker
                        onSelect={selectCategory}
                        title="Choose a listing category to see pricing"
                        description={null}
                    />
                ) : (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={clearCategory}
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-olive-700 transition hover:text-olive-950"
                            >
                                ← All categories
                            </button>
                        </div>

                        <div id="pricing-plans" className="space-y-8">
                            <div className="mx-auto max-w-2xl text-center">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-olive-400">
                                    {breakdown.label}
                                </p>
                                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-olive-950 sm:text-4xl">
                                    Plans & inclusions
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed text-olive-600 sm:text-base">
                                    Unlock advanced features and grow your visibility in
                                    Nanyuki.
                                </p>
                                {showSwitcher ? (
                                    <div className="mt-6">
                                        <BillingSwitcher
                                            value={billing}
                                            onChange={setBilling}
                                            savingsPercent={savings}
                                        />
                                    </div>
                                ) : null}
                            </div>

                            <div
                                className={`mx-auto grid max-w-6xl gap-5 lg:items-stretch ${
                                    categoryPlans.length === 3
                                        ? 'lg:grid-cols-3'
                                        : 'lg:grid-cols-2'
                                }`}
                            >
                                {categoryPlans.map((plan) => {
                                    const sameTier =
                                        normalizePlanKey(currentPlan?.key) ===
                                        normalizePlanKey(plan.key);
                                    const featured = Boolean(plan.is_highlighted);
                                    const period =
                                        plan.billing_period === 'one_time'
                                            ? 'one_time'
                                            : billing;
                                    const amount = amountForPeriod(plan, period);
                                    const inclusions = categoryInclusionsForPlan(
                                        breakdown.rows,
                                        plan.key,
                                    );
                                    const currentRank = user
                                        ? planRank(currentPlan?.key)
                                        : -1;
                                    const thisRank = planRank(plan.key);
                                    const isLowerThanCurrent =
                                        user && currentRank > thisRank;
                                    const ownedPeriod = currentPlan?.billing_period;
                                    const isFreeTier =
                                        normalizePlanKey(plan.key) === 'free';
                                    // Yearly covers monthly; monthly does not unlock yearly.
                                    const ownsThisPeriod =
                                        sameTier &&
                                        (isFreeTier ||
                                            ownedPeriod === 'year' ||
                                            (ownedPeriod === 'month' &&
                                                period === 'month'));
                                    const needsYearlyUpgrade =
                                        sameTier &&
                                        !isFreeTier &&
                                        ownedPeriod === 'month' &&
                                        period === 'year';
                                    const isCurrent = ownsThisPeriod;

                                    let ctaHref = '/register';
                                    let ctaLabel = plan.cta_label || 'Get started';
                                    let ctaDisabled = false;

                                    if (user) {
                                        if (isLowerThanCurrent) {
                                            ctaDisabled = true;
                                            ctaHref = null;
                                            ctaLabel = 'Add a listing';
                                        } else if (needsYearlyUpgrade) {
                                            ctaHref = route('account.upgrade', {
                                                billing: 'year',
                                                category: categoryKey,
                                            });
                                            ctaLabel = 'Switch to yearly';
                                        } else if (isCurrent) {
                                            ctaHref = route('account.listings.create');
                                            ctaLabel = currentPlan?.can_create
                                                ? 'Add a listing'
                                                : 'Upgrade plan';
                                            if (!currentPlan?.can_create) {
                                                ctaHref = route('account.upgrade', {
                                                    billing:
                                                        period === 'year' ? 'year' : 'month',
                                                    category: categoryKey,
                                                });
                                            }
                                        } else {
                                            ctaHref = route('account.upgrade', {
                                                billing:
                                                    period === 'year' ? 'year' : 'month',
                                                category: categoryKey,
                                            });
                                            ctaLabel = plan.cta_label || 'Upgrade';
                                        }
                                    }

                                    const ctaClass = ctaDisabled
                                        ? 'mt-6 inline-flex w-full cursor-not-allowed items-center justify-center rounded-full bg-olive-100/70 px-4 py-3 text-center text-sm font-bold text-olive-400'
                                        : featured
                                          ? 'mt-6 inline-flex w-full items-center justify-center rounded-full bg-olive-900 px-4 py-3 text-center text-sm font-bold text-white shadow-soft transition hover:bg-mustard hover:text-earth-dusk'
                                          : 'mt-6 inline-flex w-full items-center justify-center rounded-full bg-olive-100 px-4 py-3 text-center text-sm font-bold text-olive-900 transition hover:bg-mustard hover:text-earth-dusk';

                                    return (
                                        <article
                                            key={plan.id}
                                            className={`relative flex flex-col rounded-3xl bg-white p-6 shadow-soft sm:p-8 ${
                                                featured
                                                    ? 'ring-2 ring-olive-800 lg:scale-[1.02]'
                                                    : 'ring-1 ring-olive-100'
                                            }`}
                                        >
                                            {featured ? (
                                                <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-olive-800 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                                                    <Zap
                                                        className="h-3 w-3 fill-mustard text-mustard"
                                                        strokeWidth={0}
                                                    />
                                                    Popular
                                                </span>
                                            ) : null}

                                            <div className="flex items-baseline justify-between gap-3">
                                                <h3 className="font-display text-3xl font-bold tracking-tight text-olive-950">
                                                    {plan.name}
                                                </h3>
                                            </div>

                                            <div className="mt-4">
                                                {(() => {
                                                    const label = String(
                                                        plan.price_label || '',
                                                    ).trim();
                                                    const showZero =
                                                        amount === 0 ||
                                                        /^free$/i.test(label);
                                                    const customLabel =
                                                        label && !/^free$/i.test(label)
                                                            ? label
                                                            : null;

                                                    if (customLabel) {
                                                        return (
                                                            <p className="font-display text-4xl font-bold tracking-tight text-olive-950">
                                                                {customLabel}
                                                            </p>
                                                        );
                                                    }

                                                    return (
                                                        <p className="flex flex-wrap items-baseline gap-x-1.5 font-display tracking-tight text-olive-950">
                                                            <span className="text-4xl font-bold tabular-nums">
                                                                {plan.currency || 'KES'}{' '}
                                                                {showZero
                                                                    ? '0'
                                                                    : formatAmountOnly(
                                                                          amount,
                                                                      )}
                                                            </span>
                                                            <span className="text-base font-medium text-olive-500">
                                                                {periodShort(period)}
                                                            </span>
                                                        </p>
                                                    );
                                                })()}
                                            </div>

                                            {ctaDisabled ? (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className={ctaClass}
                                                >
                                                    {ctaLabel}
                                                </button>
                                            ) : (
                                                <Link href={ctaHref} className={ctaClass}>
                                                    {ctaLabel}
                                                </Link>
                                            )}

                                            <PlanCardFeatures
                                                planName={plan.name}
                                                listingLimit={plan.listing_limit}
                                                inclusions={inclusions}
                                                categoryLabel={breakdown.label}
                                            />
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
            </div>
        </SiteLayout>
    );
}
