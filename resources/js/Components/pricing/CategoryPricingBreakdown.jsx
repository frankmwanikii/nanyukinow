import {
    PRICING_CATEGORY_OPTIONS,
    cellIncluded,
    formatCellValue,
    getPricingCategoryBreakdown,
    normalizePlanKey,
} from '@/data/pricingCategoryBreakdown';
import {
    CheckMark,
    CloseMark,
    EatMark,
    EventMark,
    ExploreMark,
    PropertyMark,
    ServicesMark,
    ShopMark,
    StayMark,
} from '@/Components/site/Mark';
import { useMemo, useState } from 'react';

const CATEGORY_ICONS = {
    eatDrink: EatMark,
    stay: StayMark,
    thingsToDo: ExploreMark,
    services: ServicesMark,
    shopping: ShopMark,
    properties: PropertyMark,
    events: EventMark,
};

function planRank(plan) {
    const key = normalizePlanKey(plan?.key);
    if (key === 'free') return 0;
    if (key === 'featured') return 1;
    if (key === 'premium') return 2;
    return 99;
}

export function sortedPricingPlans(plans = []) {
    return [...plans].sort((a, b) => {
        const byRank = planRank(a) - planRank(b);
        if (byRank !== 0) return byRank;
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });
}

function MatrixCheck({ value }) {
    const included = cellIncluded(value);
    const label = formatCellValue(value);

    if (!included) {
        return (
            <span
                className="inline-flex items-center justify-center text-olive-300 dark:text-olive-600"
                aria-label="Not included"
            >
                <CloseMark className="h-4 w-4" />
            </span>
        );
    }

    if (value === true) {
        return (
            <span
                className="inline-flex items-center justify-center text-olive-900 dark:text-mustard"
                aria-label="Included"
            >
                <CheckMark className="h-4 w-4" />
            </span>
        );
    }

    return (
        <span className="text-sm font-medium leading-snug text-olive-800 dark:text-olive-200">
            {label}
        </span>
    );
}

/**
 * Site-style category cards (matches homepage CategoryGrid).
 * Clicking a card should open that category — not expand content under the grid.
 */
export function CategoryPicker({
    onSelect,
    title = 'Choose a listing category',
    description = 'Pick a category to open its Free, Standard, and Premium pricing.',
    stepLabel = null,
    options = PRICING_CATEGORY_OPTIONS,
}) {
    return (
        <section>
            <div className="mx-auto max-w-2xl text-center sm:text-left">
                {stepLabel ? (
                    <p className="text-sm font-medium text-olive-500 dark:text-olive-400">
                        {stepLabel}
                    </p>
                ) : null}
                <h2
                    className={`font-display text-2xl font-semibold tracking-tight text-olive-950 dark:text-olive-50 sm:text-3xl ${
                        stepLabel ? 'mt-1.5' : ''
                    }`}
                >
                    {title}
                </h2>
                {description ? (
                    <p className="mt-2 text-sm leading-relaxed text-olive-600 dark:text-olive-400 sm:text-base">
                        {description}
                    </p>
                ) : null}
            </div>

            <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                {options.map((category) => {
                    const Icon = CATEGORY_ICONS[category.key] || EatMark;
                    return (
                        <button
                            key={category.key}
                            type="button"
                            onClick={() => onSelect(category.key)}
                            className="group flex min-h-[7.5rem] flex-col items-center justify-center gap-3.5 border border-olive-200/70 bg-white px-3 py-6 text-center transition hover:border-olive-500 hover:bg-olive-600 dark:border-olive-700 dark:bg-olive-900 dark:hover:border-mustard dark:hover:bg-olive-800 sm:py-8"
                        >
                            <Icon className="h-8 w-8 text-olive-700 transition group-hover:text-mustard dark:text-olive-200 sm:h-9 sm:w-9" />
                            <span className="font-display text-sm font-semibold text-earth-dusk transition group-hover:text-white dark:text-olive-50 sm:text-base">
                                {category.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

export function CategoryInclusionMatrix({
    breakdown,
    plans,
    currentKey = null,
    stepLabel = null,
}) {
    const ordered = useMemo(() => sortedPricingPlans(plans), [plans]);
    const rows = breakdown?.rows || [];

    if (!breakdown || ordered.length === 0 || rows.length === 0) return null;

    return (
        <div className="overflow-hidden border border-olive-900/15 bg-white dark:border-olive-800 dark:bg-olive-900">
            <div className="border-b border-olive-900/10 px-5 py-5 sm:px-6 dark:border-olive-800">
                {stepLabel ? (
                    <p className="text-sm font-medium text-olive-500 dark:text-olive-400">
                        {stepLabel}
                    </p>
                ) : null}
                <h2
                    className={`font-display text-xl font-semibold tracking-tight text-olive-950 dark:text-olive-50 ${
                        stepLabel ? 'mt-1.5' : ''
                    }`}
                >
                    {breakdown.label} feature breakdown
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-olive-500 dark:text-olive-400">
                    {breakdown.blurb} Higher plans keep everything below them.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-olive-100 dark:border-olive-800">
                            <th
                                scope="col"
                                className="sticky left-0 z-10 bg-white px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-olive-400 dark:bg-olive-900 dark:text-olive-500 sm:px-6"
                            >
                                Feature
                            </th>
                            {ordered.map((plan) => {
                                const isYours = currentKey && plan.key === currentKey;
                                return (
                                    <th
                                        key={plan.id || plan.key}
                                        scope="col"
                                        className={`min-w-[8.5rem] px-4 py-3.5 text-center ${
                                            isYours
                                                ? 'bg-mustard/10 dark:bg-mustard/10'
                                                : ''
                                        }`}
                                    >
                                        <span className="block font-display text-sm font-semibold text-olive-950 dark:text-olive-50">
                                            {plan.name}
                                        </span>
                                        {isYours ? (
                                            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-mustard">
                                                Your plan
                                            </span>
                                        ) : null}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-olive-100 dark:border-olive-800">
                            <th
                                scope="row"
                                className="sticky left-0 z-10 bg-earth-sand/50 px-5 py-3.5 text-left text-sm font-medium text-olive-800 dark:bg-olive-950/60 dark:text-olive-200 sm:px-6"
                            >
                                Listings included
                            </th>
                            {ordered.map((plan) => {
                                const isYours = currentKey && plan.key === currentKey;
                                return (
                                    <td
                                        key={`limit-${plan.id || plan.key}`}
                                        className={`px-4 py-3.5 text-center ${
                                            isYours
                                                ? 'bg-mustard/10 dark:bg-mustard/10'
                                                : 'bg-earth-sand/50 dark:bg-olive-950/60'
                                        }`}
                                    >
                                        <span className="font-display text-base font-semibold tabular-nums text-olive-950 dark:text-olive-50">
                                            {plan.listing_limit ?? '—'}
                                        </span>
                                    </td>
                                );
                            })}
                        </tr>

                        {rows.map((row, index) => {
                            const zebra = index % 2 === 0;
                            return (
                                <tr
                                    key={row.id}
                                    className="border-b border-olive-100 last:border-b-0 dark:border-olive-800"
                                >
                                    <th
                                        scope="row"
                                        className={`sticky left-0 z-10 px-5 py-3.5 text-left text-sm font-medium text-olive-800 dark:text-olive-200 sm:px-6 ${
                                            zebra
                                                ? 'bg-white dark:bg-olive-900'
                                                : 'bg-earth-sand/30 dark:bg-olive-950/40'
                                        }`}
                                    >
                                        {row.label}
                                    </th>
                                    {ordered.map((plan) => {
                                        const tier = normalizePlanKey(plan.key);
                                        const isYours =
                                            currentKey && plan.key === currentKey;
                                        return (
                                            <td
                                                key={`${row.id}-${plan.id || plan.key}`}
                                                className={`px-4 py-3.5 text-center ${
                                                    isYours
                                                        ? 'bg-mustard/10 dark:bg-mustard/10'
                                                        : zebra
                                                          ? 'bg-white dark:bg-olive-900'
                                                          : 'bg-earth-sand/30 dark:bg-olive-950/40'
                                                }`}
                                            >
                                                <div className="flex justify-center">
                                                    <MatrixCheck value={row.values[tier]} />
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/**
 * Full flow: pick a category (opens it), then show the feature matrix.
 */
export default function CategoryPricingBreakdown({
    plans = [],
    currentKey = null,
    initialCategory = null,
    showSteps = true,
    emptyTitle = 'Select a category above',
    emptyDescription = 'Pricing is the same across the site — the inclusions and field breakdown change by listing type.',
}) {
    const [categoryKey, setCategoryKey] = useState(initialCategory);
    const breakdown = useMemo(
        () => getPricingCategoryBreakdown(categoryKey),
        [categoryKey],
    );

    if (!breakdown) {
        return (
            <div className="space-y-6">
                <CategoryPicker
                    onSelect={setCategoryKey}
                    stepLabel={showSteps ? 'Step 1' : null}
                    title="Choose a listing category"
                    description="Each category unlocks different listing fields. Pick one to open its Free, Standard, and Premium pricing."
                />
                <div className="rounded-2xl border border-dashed border-olive-300 bg-earth-sand/40 px-6 py-10 text-center dark:border-olive-700 dark:bg-olive-950/40">
                    <p className="font-display text-lg font-semibold text-olive-900 dark:text-olive-50">
                        {emptyTitle}
                    </p>
                    <p className="mx-auto mt-2 max-w-md text-sm text-olive-600 dark:text-olive-400">
                        {emptyDescription}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-olive-400 dark:text-olive-500">
                        {breakdown.label}
                    </p>
                    <h2 className="mt-1 font-display text-xl font-semibold text-olive-950 dark:text-olive-50">
                        Plans for this category
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={() => setCategoryKey(null)}
                    className="inline-flex items-center rounded-xl border border-olive-200 bg-white px-3.5 py-2 text-sm font-semibold text-olive-800 transition hover:bg-olive-50 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100 dark:hover:bg-olive-800"
                >
                    Change category
                </button>
            </div>
            <CategoryInclusionMatrix
                breakdown={breakdown}
                plans={plans}
                currentKey={currentKey}
                stepLabel={showSteps ? `${breakdown.label} fields` : null}
            />
        </div>
    );
}
