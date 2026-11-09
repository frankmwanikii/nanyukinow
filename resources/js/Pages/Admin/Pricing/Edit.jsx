import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminButton,
    AdminCheckbox,
    AdminInput,
    AdminSelect,
    AdminTabs,
    AdminTextarea,
    FormPanel,
    PageHeader,
    StatusBadge,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import {
    CategoryInclusionMatrix,
    CategoryPicker,
} from '@/Components/pricing/CategoryPricingBreakdown';
import {
    categoryInclusionsForPlan,
    getPricingCategoryBreakdown,
} from '@/data/pricingCategoryBreakdown';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    Eye,
    Plus,
    Save,
    Settings2,
    Tag,
    Trash2,
    Wallet,
    Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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

function formatAmountOnly(amount) {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
        Number(amount) || 0,
    );
}

function amountForPeriod(data, period) {
    if (period === 'year') {
        if (data.yearly_price_amount !== '' && data.yearly_price_amount != null) {
            return Number(data.yearly_price_amount) || 0;
        }
        return (Number(data.price_amount) || 0) * 10;
    }
    return Number(data.price_amount) || 0;
}

function displayPrice(data, period = 'month') {
    if (data.price_label) return data.price_label;
    const amount = amountForPeriod(data, period);
    if (amount === 0) return 'Free';
    return formatMoney(amount, data.currency);
}

function periodShort(period) {
    if (period === 'year') return '/ year';
    if (period === 'one_time') return ' one-time';
    return '/ month';
}

/**
 * Public-pricing-page plan card (desktop sticky preview).
 */
function WebsitePlanCard({
    name,
    tagline,
    ctaLabel,
    currency,
    priceLabel,
    amount,
    period,
    listingLimit,
    inclusions = [],
    categoryLabel,
    featured = false,
}) {
    const label = String(priceLabel || '').trim();
    const showZero = amount === 0 || /^free$/i.test(label);
    const customLabel = label && !/^free$/i.test(label) ? label : null;
    const listingLine =
        listingLimit == null || listingLimit === ''
            ? null
            : `${listingLimit} listing${Number(listingLimit) === 1 ? '' : 's'} included`;

    return (
        <article
            className={`relative flex flex-col border bg-white p-5 sm:p-6 ${
                featured
                    ? 'border-olive-800'
                    : 'border-olive-200 dark:border-olive-700'
            } dark:bg-olive-900`}
        >
            {featured ? (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-sm bg-olive-800 px-2 py-0.5 text-[11px] font-bold text-white">
                    <Zap
                        className="h-3 w-3 fill-mustard text-mustard"
                        strokeWidth={0}
                    />
                    Popular
                </span>
            ) : null}

            {categoryLabel ? (
                <p className="mb-2 text-xs font-medium text-olive-500">
                    {categoryLabel}
                </p>
            ) : null}

            <h3 className="font-display text-3xl font-bold tracking-tight text-olive-950 dark:text-olive-50">
                {name || 'Plan'}
            </h3>

            {tagline ? (
                <p className="mt-2 text-sm leading-relaxed text-olive-500 dark:text-olive-400">
                    {tagline}
                </p>
            ) : null}

            <div className="mt-5">
                {customLabel ? (
                    <p className="font-display text-4xl font-bold tracking-tight text-olive-950 dark:text-olive-50">
                        {customLabel}
                    </p>
                ) : (
                    <p className="flex flex-wrap items-baseline gap-x-1.5 font-display tracking-tight text-olive-950 dark:text-olive-50">
                        <span className="text-4xl font-bold tabular-nums">
                            {currency || 'KES'} {showZero ? '0' : formatAmountOnly(amount)}
                        </span>
                        <span className="text-base font-medium text-olive-500">
                            {periodShort(period)}
                        </span>
                    </p>
                )}
            </div>

            <div
                className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-center text-sm font-bold ${
                    featured
                        ? 'bg-olive-900 text-white'
                        : 'bg-olive-100 text-olive-900 dark:bg-olive-800 dark:text-olive-50'
                }`}
            >
                {ctaLabel || 'Get started'}
            </div>

            <div className="mt-6 flex-1 border-t border-olive-100 pt-5 dark:border-olive-800">
                <p className="mb-3 text-sm font-semibold text-olive-900 dark:text-olive-100">
                    With {name || 'this plan'}, get:
                </p>
                {listingLine ? (
                    <p className="mb-4 text-sm font-semibold text-olive-800 dark:text-olive-200">
                        {listingLine}
                    </p>
                ) : null}
                <ul className="space-y-3">
                    {inclusions.length === 0 ? (
                        <li className="text-sm text-olive-600 dark:text-olive-400">
                            {categoryLabel
                                ? `Core listing fields for ${categoryLabel}.`
                                : 'No inclusions yet.'}
                        </li>
                    ) : (
                        inclusions.map((item) => {
                            const isInherit = /^Everything in /i.test(item);
                            return (
                                <li
                                    key={item}
                                    className={`flex gap-3 text-sm leading-snug ${
                                        isInherit
                                            ? 'font-semibold text-olive-900 dark:text-olive-50'
                                            : 'text-olive-700 dark:text-olive-300'
                                    }`}
                                >
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-olive-100 text-olive-800 dark:bg-olive-800 dark:text-olive-100">
                                        <Check className="h-3 w-3" strokeWidth={2.75} />
                                    </span>
                                    <span className="min-w-0 text-pretty pt-0.5">{item}</span>
                                </li>
                            );
                        })
                    )}
                </ul>
            </div>
        </article>
    );
}

function BillingSwitcher({ value, onChange, disabled = false }) {
    return (
        <div
            role="radiogroup"
            aria-label="Billing period preview"
            className="relative inline-grid grid-cols-2 rounded-full bg-olive-100/90 p-1 dark:bg-olive-800/80"
        >
            <span
                aria-hidden
                className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-sm ring-1 ring-olive-200/80 transition-transform duration-300 ease-out dark:bg-olive-950 dark:ring-olive-700 ${
                    value === 'year' ? 'translate-x-full' : 'translate-x-0'
                }`}
            />
            {[
                { id: 'month', label: 'Monthly' },
                { id: 'year', label: 'Yearly' },
            ].map((opt) => {
                const active = value === opt.id;
                return (
                    <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={disabled}
                        onClick={() => onChange(opt.id)}
                        className={`relative z-10 min-w-[6.5rem] rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            active
                                ? 'text-olive-950 dark:text-white'
                                : 'text-olive-500 hover:text-olive-800 dark:text-olive-400'
                        }`}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

const TABS = [
    { id: 'general', label: 'General', icon: Tag },
    { id: 'pricing', label: 'Pricing', icon: Wallet },
    { id: 'advanced', label: 'Advanced', icon: Settings2 },
    { id: 'preview', label: 'Preview', icon: Eye },
];

export default function Edit({ plan, allPlans = [], categories = [], billingPeriods = [] }) {
    const { confirm, dialog } = useConfirm();
    const [tab, setTab] = useState('general');
    const [previewBilling, setPreviewBilling] = useState('month');
    const [previewCategory, setPreviewCategory] = useState(plan.category_key || null);

    const form = useForm({
        name: plan.name,
        tagline: plan.tagline || '',
        price_amount: plan.price_amount ?? 0,
        yearly_price_amount:
            plan.yearly_price_amount === null || plan.yearly_price_amount === undefined
                ? ''
                : plan.yearly_price_amount,
        currency: plan.currency || 'KES',
        billing_period: plan.billing_period || 'month',
        price_label: plan.price_label || '',
        inclusions: [...(plan.inclusions || [])],
        cta_label: plan.cta_label || 'Get started',
        is_highlighted: Boolean(plan.is_highlighted),
        is_active: Boolean(plan.is_active),
        sort_order: plan.sort_order ?? 0,
        listing_limit: plan.listing_limit ?? 1,
    });

    useEffect(() => {
        form.setData({
            name: plan.name,
            tagline: plan.tagline || '',
            price_amount: plan.price_amount ?? 0,
            yearly_price_amount:
                plan.yearly_price_amount === null || plan.yearly_price_amount === undefined
                    ? ''
                    : plan.yearly_price_amount,
            currency: plan.currency || 'KES',
            billing_period: plan.billing_period || 'month',
            price_label: plan.price_label || '',
            inclusions: [...(plan.inclusions || [])],
            cta_label: plan.cta_label || 'Get started',
            is_highlighted: Boolean(plan.is_highlighted),
            is_active: Boolean(plan.is_active),
            sort_order: plan.sort_order ?? 0,
            listing_limit: plan.listing_limit ?? 1,
        });
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [plan.id, plan.updated_at]);

    const setInclusion = (index, value) => {
        const next = [...form.data.inclusions];
        next[index] = value;
        form.setData('inclusions', next);
    };

    const addInclusion = () => {
        form.setData('inclusions', [...form.data.inclusions, '']);
    };

    const removeInclusion = (index) => {
        form.setData(
            'inclusions',
            form.data.inclusions.filter((_, i) => i !== index),
        );
    };

    const save = (e) => {
        e?.preventDefault?.();

        const inclusions = (form.data.inclusions || [])
            .map((item) => String(item || '').trim())
            .filter(Boolean);

        if (inclusions.length === 0) {
            form.setError('inclusions', 'Add at least one inclusion.');
            setTab('general');
            return;
        }

        const payload = {
            name: form.data.name,
            tagline: form.data.tagline || null,
            price_amount: Number(form.data.price_amount) || 0,
            yearly_price_amount:
                form.data.yearly_price_amount === '' ||
                form.data.yearly_price_amount === null ||
                form.data.yearly_price_amount === undefined
                    ? null
                    : Number(form.data.yearly_price_amount),
            currency: (form.data.currency || 'KES').toUpperCase(),
            billing_period: form.data.billing_period || 'month',
            price_label: form.data.price_label || null,
            inclusions,
            cta_label: form.data.cta_label || 'Get started',
            is_highlighted: Boolean(form.data.is_highlighted),
            is_active: Boolean(form.data.is_active),
            sort_order: Number(form.data.sort_order) || 0,
            listing_limit: Number(form.data.listing_limit) || 0,
        };

        form.transform(() => payload);
        form.put(route('admin.pricing.update', plan.id), {
            preserveScroll: true,
            onSuccess: () => {
                form.setDefaults({
                    ...form.data,
                    ...payload,
                    tagline: payload.tagline || '',
                    price_label: payload.price_label || '',
                    yearly_price_amount:
                        payload.yearly_price_amount === null
                            ? ''
                            : payload.yearly_price_amount,
                });
            },
            onError: (errors) => {
                if (
                    errors.price_amount ||
                    errors.yearly_price_amount ||
                    errors.currency ||
                    errors.billing_period
                ) {
                    setTab('pricing');
                } else if (
                    errors.listing_limit ||
                    errors.sort_order ||
                    errors.is_highlighted ||
                    errors.is_active
                ) {
                    setTab('advanced');
                } else {
                    setTab('general');
                }
            },
            onFinish: () => {
                form.transform((data) => data);
            },
        });
    };

    const remove = async () => {
        const ok = await confirm({
            title: 'Delete pricing tier?',
            message: `Delete tier “${plan.name}”? This cannot be undone.`,
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        router.delete(route('admin.pricing.destroy', plan.id), {
            onSuccess: () => router.visit(route('admin.pricing.index')),
        });
    };

    const hasYearly =
        form.data.yearly_price_amount !== '' &&
        form.data.yearly_price_amount != null &&
        Number(form.data.price_amount) > 0;
    const previewPeriod =
        form.data.billing_period === 'one_time'
            ? 'one_time'
            : hasYearly
              ? previewBilling
              : 'month';
    const previewAmount = amountForPeriod(form.data, previewPeriod);
    const errorCount = Object.keys(form.errors || {}).length;
    const previewBreakdown = useMemo(
        () => getPricingCategoryBreakdown(previewCategory),
        [previewCategory],
    );
    const matrixPlans =
        allPlans.length > 0
            ? allPlans
            : [
                  {
                      id: plan.id,
                      key: plan.key,
                      name: form.data.name || plan.name,
                      listing_limit: form.data.listing_limit,
                      sort_order: form.data.sort_order,
                  },
              ];
    const categoryInclusions = previewBreakdown
        ? categoryInclusionsForPlan(previewBreakdown.rows, plan.key)
        : (form.data.inclusions || []).filter((i) => String(i || '').trim());

    const actionBar = (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <AdminButton type="button" size="sm" variant="danger" onClick={remove}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete tier
            </AdminButton>
            <div className="flex flex-wrap items-center gap-2">
                {form.isDirty ? (
                    <span className="text-sm text-olive-500">Unsaved changes</span>
                ) : null}
                {errorCount > 0 ? (
                    <span className="text-sm font-medium text-rose-600">
                        Fix {errorCount} error{errorCount === 1 ? '' : 's'} to save
                    </span>
                ) : null}
                <AdminButton type="submit" disabled={form.processing}>
                    <Save className="h-4 w-4" />
                    {form.processing ? 'Saving…' : 'Save plan'}
                </AdminButton>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <Head title={`Edit · ${plan.name}`} />
            {dialog}

            <div className="mb-5">
                <Link
                    href={route('admin.pricing.index', {
                        category: plan.category_key
                            ? categories.find((c) => c.key === plan.category_key)?.slug ||
                              plan.category_key
                            : undefined,
                    })}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-olive-600 transition hover:text-olive-900 dark:text-olive-400 dark:hover:text-olive-100"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to {plan.category_label || 'pricing'}
                </Link>
            </div>

            <PageHeader
                title={plan.name}
                description={`${plan.category_label || 'Category'} · set monthly/yearly charges, listing limits, and how this tier appears on the public pricing page.`}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        {plan.category_label ? (
                            <span className="rounded-full border border-olive-200 bg-white px-2.5 py-1 text-xs font-semibold text-olive-700 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-200">
                                {plan.category_label}
                            </span>
                        ) : null}
                        <StatusBadge status={plan.is_active ? 'active' : 'inactive'} />
                        {plan.is_highlighted ? (
                            <span className="rounded-sm bg-mustard/25 px-2 py-0.5 text-xs font-semibold text-earth-dusk">
                                Recommended
                            </span>
                        ) : null}
                        <AdminButton
                            size="sm"
                            variant="secondary"
                            type="button"
                            onClick={() =>
                                window.open(route('pricing'), '_blank', 'noopener,noreferrer')
                            }
                        >
                            View public page
                        </AdminButton>
                        <AdminButton
                            size="sm"
                            type="button"
                            disabled={form.processing}
                            onClick={save}
                        >
                            <Save className="h-3.5 w-3.5" />
                            {form.processing ? 'Saving…' : 'Save plan'}
                        </AdminButton>
                    </div>
                }
            />

            <AdminTabs
                items={TABS}
                value={tab}
                onChange={setTab}
                label="Pricing sections"
            />

            <form onSubmit={save} className="w-full space-y-5 pb-24">
                {errorCount > 0 ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
                        Couldn’t save — check the highlighted fields
                        {form.errors.inclusions
                            ? ` (${form.errors.inclusions})`
                            : ''}
                        .
                    </div>
                ) : null}
                {tab === 'general' ? (
                    <FormPanel
                        title="General"
                        description="Name, tagline, CTA, and what’s included in this tier."
                    >
                        <div className="space-y-5">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <AdminInput
                                    label="Display name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    error={form.errors.name}
                                    required
                                />
                                <AdminInput
                                    label="CTA label"
                                    value={form.data.cta_label}
                                    onChange={(e) => form.setData('cta_label', e.target.value)}
                                    error={form.errors.cta_label}
                                />
                            </div>

                            <AdminTextarea
                                label="Tagline"
                                rows={2}
                                value={form.data.tagline}
                                onChange={(e) => form.setData('tagline', e.target.value)}
                                error={form.errors.tagline}
                                placeholder="Short line under the tier name"
                            />

                            <AdminInput
                                label="Custom price label"
                                value={form.data.price_label}
                                onChange={(e) => form.setData('price_label', e.target.value)}
                                error={form.errors.price_label}
                                placeholder='Optional override, e.g. "Free" or "Contact us"'
                            />

                            <div>
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <span className="text-sm font-semibold text-olive-600 dark:text-olive-400">
                                        Inclusions
                                    </span>
                                    <AdminButton
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={addInclusion}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Add
                                    </AdminButton>
                                </div>
                                <div className="space-y-2">
                                    {form.data.inclusions.map((item, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                value={item}
                                                onChange={(e) =>
                                                    setInclusion(index, e.target.value)
                                                }
                                                className="w-full rounded-xl border border-olive-200 bg-white px-3.5 py-2.5 text-base text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-mustard focus:ring-2 focus:ring-mustard/30 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50"
                                                placeholder={`Inclusion ${index + 1}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeInclusion(index)}
                                                className="inline-flex shrink-0 items-center justify-center rounded-xl border border-olive-200 px-3 text-olive-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-olive-700"
                                                aria-label={`Remove inclusion ${index + 1}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {form.errors.inclusions && (
                                    <p className="mt-1.5 text-sm text-rose-600">
                                        {form.errors.inclusions}
                                    </p>
                                )}
                            </div>
                        </div>
                    </FormPanel>
                ) : null}

                {tab === 'pricing' ? (
                    <FormPanel
                        title="Pricing"
                        description="Monthly and yearly amounts power the public billing switcher."
                    >
                        <div className="space-y-5">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <AdminInput
                                    label="Monthly price"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.data.price_amount}
                                    onChange={(e) =>
                                        form.setData('price_amount', e.target.value)
                                    }
                                    error={form.errors.price_amount}
                                />
                                <AdminInput
                                    label="Yearly price"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.data.yearly_price_amount}
                                    onChange={(e) =>
                                        form.setData('yearly_price_amount', e.target.value)
                                    }
                                    error={form.errors.yearly_price_amount}
                                    placeholder="Optional"
                                />
                                <AdminInput
                                    label="Currency"
                                    value={form.data.currency}
                                    onChange={(e) =>
                                        form.setData('currency', e.target.value.toUpperCase())
                                    }
                                    error={form.errors.currency}
                                />
                                <AdminSelect
                                    label="Default period"
                                    value={form.data.billing_period}
                                    onChange={(e) =>
                                        form.setData('billing_period', e.target.value)
                                    }
                                    error={form.errors.billing_period}
                                >
                                    {billingPeriods.map((p) => (
                                        <option key={p.value} value={p.value}>
                                            {p.label}
                                        </option>
                                    ))}
                                </AdminSelect>
                            </div>
                            <p className="text-xs text-olive-500">
                                Leave yearly blank to hide yearly billing for this tier on the
                                public pricing and upgrade pages.
                            </p>
                            {hasYearly ? (
                                <div className="rounded-xl border border-olive-100 bg-olive-50/70 px-4 py-3 dark:border-olive-800 dark:bg-olive-950/40">
                                    <p className="text-xs font-medium text-olive-500">
                                        Quick check
                                    </p>
                                    <p className="mt-1 text-sm text-olive-800 dark:text-olive-200">
                                        {displayPrice(form.data, 'month')}
                                        /mo · {displayPrice(form.data, 'year')}/yr
                                        {Number(form.data.price_amount) > 0
                                            ? ` (${formatMoney(
                                                  Math.round(
                                                      amountForPeriod(form.data, 'year') / 12,
                                                  ),
                                                  form.data.currency,
                                              )}/mo billed yearly)`
                                            : ''}
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    </FormPanel>
                ) : null}

                {tab === 'advanced' ? (
                    <FormPanel
                        title="Advanced"
                        description="Visibility, listing limits, and sort order."
                    >
                        <div className="space-y-5">
                            <div className="flex flex-wrap gap-5">
                                <AdminCheckbox
                                    label="Highlight as recommended"
                                    checked={form.data.is_highlighted}
                                    onChange={(e) =>
                                        form.setData('is_highlighted', e.target.checked)
                                    }
                                />
                                <AdminCheckbox
                                    label="Active / visible"
                                    checked={form.data.is_active}
                                    onChange={(e) =>
                                        form.setData('is_active', e.target.checked)
                                    }
                                />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <AdminInput
                                    label="Listing limit"
                                    type="number"
                                    min="0"
                                    value={form.data.listing_limit}
                                    onChange={(e) =>
                                        form.setData('listing_limit', e.target.value)
                                    }
                                    error={form.errors.listing_limit}
                                />
                                <AdminInput
                                    label="Sort order"
                                    type="number"
                                    min="0"
                                    value={form.data.sort_order}
                                    onChange={(e) =>
                                        form.setData('sort_order', e.target.value)
                                    }
                                    error={form.errors.sort_order}
                                />
                            </div>
                        </div>
                    </FormPanel>
                ) : null}

                {tab === 'preview' ? (
                    <div className="space-y-6">
                        <FormPanel
                            title="Preview"
                            description="How this tier appears on the public pricing page for a chosen listing category."
                        >
                            <div className="space-y-5">
                                {!previewBreakdown ? (
                                    <CategoryPicker
                                        onSelect={setPreviewCategory}
                                        title="Preview for category"
                                        description="Tap a card to open how this tier looks for that listing type."
                                    />
                                ) : (
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-olive-800 dark:text-olive-200">
                                            Previewing · {previewBreakdown.label}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewCategory(null)}
                                            className="text-sm font-semibold text-olive-600 transition hover:text-olive-950 dark:text-olive-300 dark:hover:text-olive-50"
                                        >
                                            ← Change category
                                        </button>
                                    </div>
                                )}

                                {previewBreakdown &&
                                hasYearly &&
                                form.data.billing_period !== 'one_time' ? (
                                    <div className="flex justify-center">
                                        <BillingSwitcher
                                            value={previewBilling}
                                            onChange={setPreviewBilling}
                                        />
                                    </div>
                                ) : null}

                                {previewBreakdown ? (
                                    <WebsitePlanCard
                                        name={form.data.name || plan.name}
                                        tagline={form.data.tagline}
                                        ctaLabel={form.data.cta_label}
                                        currency={form.data.currency}
                                        priceLabel={form.data.price_label}
                                        amount={previewAmount}
                                        period={previewPeriod}
                                        listingLimit={form.data.listing_limit}
                                        inclusions={categoryInclusions}
                                        categoryLabel={previewBreakdown.label}
                                        featured={Boolean(form.data.is_highlighted)}
                                    />
                                ) : null}
                            </div>
                        </FormPanel>

                        {previewBreakdown ? (
                            <CategoryInclusionMatrix
                                breakdown={previewBreakdown}
                                plans={matrixPlans}
                                currentKey={plan.key}
                                stepLabel={`${previewBreakdown.label} · all tiers`}
                            />
                        ) : null}
                    </div>
                ) : null}

                <div className="sticky bottom-0 z-20 -mx-4 border-t border-olive-200 bg-olive-50/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 dark:border-olive-800 dark:bg-olive-950/95">
                    {actionBar}
                </div>
            </form>
        </AdminLayout>
    );
}
