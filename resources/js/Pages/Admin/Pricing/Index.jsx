import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminButton,
    AdminCheckbox,
    AdminInput,
    AdminSelect,
    AdminTextarea,
} from '@/Components/Admin/ui';
import { Head, useForm } from '@inertiajs/react';
import {
    Check,
    Pencil,
    Plus,
    Save,
    Sparkles,
    Trash2,
    X,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const TIER_ACCENT = {
    free: {
        badge: 'bg-olive-100 text-olive-700 dark:bg-olive-800 dark:text-olive-200',
        iconWrap: 'bg-olive-100 text-olive-600 dark:bg-olive-800 dark:text-olive-300',
        ring: 'ring-olive-200/80 dark:ring-olive-700',
        price: 'text-olive-950 dark:text-olive-50',
    },
    featured: {
        badge: 'bg-mint/30 text-olive-900 dark:bg-mint/20 dark:text-mint-soft',
        iconWrap: 'bg-mint/25 text-olive-800 dark:bg-mint/15 dark:text-mint',
        ring: 'ring-mint/50 dark:ring-mint/40',
        price: 'text-olive-950 dark:text-olive-50',
    },
    premium: {
        badge: 'bg-mustard/25 text-earth-dusk dark:bg-mustard/20 dark:text-mustard',
        iconWrap: 'bg-mustard/20 text-earth-dusk dark:bg-mustard/15 dark:text-mustard',
        ring: 'ring-mustard/45 dark:ring-mustard/35',
        price: 'text-olive-950 dark:text-olive-50',
    },
};

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

function PlanCard({ plan, billingPeriods, editing, onEdit, onCancel }) {
    const accent = TIER_ACCENT[plan.key] || TIER_ACCENT.free;
    const Icon = plan.key === 'premium' ? Zap : plan.key === 'featured' ? Sparkles : Check;

    const form = useForm({
        name: plan.name,
        tagline: plan.tagline || '',
        price_amount: plan.price_amount ?? 0,
        currency: plan.currency || 'KES',
        billing_period: plan.billing_period || 'month',
        price_label: plan.price_label || '',
        inclusions: [...(plan.inclusions || [])],
        cta_label: plan.cta_label || 'Get started',
        is_highlighted: Boolean(plan.is_highlighted),
        is_active: Boolean(plan.is_active),
        sort_order: plan.sort_order ?? 0,
    });

    useEffect(() => {
        if (!editing) return;
        form.setData({
            name: plan.name,
            tagline: plan.tagline || '',
            price_amount: plan.price_amount ?? 0,
            currency: plan.currency || 'KES',
            billing_period: plan.billing_period || 'month',
            price_label: plan.price_label || '',
            inclusions: [...(plan.inclusions || [])],
            cta_label: plan.cta_label || 'Get started',
            is_highlighted: Boolean(plan.is_highlighted),
            is_active: Boolean(plan.is_active),
            sort_order: plan.sort_order ?? 0,
        });
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editing, plan.id, plan.updated_at]);

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
        e.preventDefault();
        form.put(route('admin.pricing.update', plan.id), {
            preserveScroll: true,
            onSuccess: () => onCancel(),
        });
    };

    if (editing) {
        return (
            <form
                onSubmit={save}
                className={`relative flex h-full flex-col overflow-hidden rounded-2xl border border-olive-200/80 bg-white shadow-soft ring-2 ${accent.ring} dark:border-olive-800 dark:bg-olive-900`}
            >
                <div className="flex items-center justify-between gap-3 border-b border-olive-100 px-5 py-4 dark:border-olive-800">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-olive-500 dark:text-olive-400">
                            Editing · {plan.key}
                        </p>
                        <h3 className="mt-0.5 text-lg font-semibold text-olive-950 dark:text-olive-50">
                            {form.data.name || plan.name}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-full p-2 text-olive-500 transition hover:bg-olive-100 hover:text-olive-900 dark:hover:bg-olive-800 dark:hover:text-olive-100"
                        aria-label="Cancel editing"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex flex-1 flex-col gap-4 p-5">
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

                    <div className="grid gap-3 sm:grid-cols-3">
                        <AdminInput
                            label="Price amount"
                            type="number"
                            min="0"
                            step="1"
                            value={form.data.price_amount}
                            onChange={(e) => form.setData('price_amount', e.target.value)}
                            error={form.errors.price_amount}
                        />
                        <AdminInput
                            label="Currency"
                            value={form.data.currency}
                            onChange={(e) => form.setData('currency', e.target.value.toUpperCase())}
                            error={form.errors.currency}
                        />
                        <AdminSelect
                            label="Billing"
                            value={form.data.billing_period}
                            onChange={(e) => form.setData('billing_period', e.target.value)}
                            error={form.errors.billing_period}
                        >
                            {billingPeriods.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {p.label}
                                </option>
                            ))}
                        </AdminSelect>
                    </div>

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
                            <AdminButton type="button" variant="secondary" size="sm" onClick={addInclusion}>
                                <Plus className="h-3.5 w-3.5" />
                                Add
                            </AdminButton>
                        </div>
                        <div className="space-y-2">
                            {form.data.inclusions.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        value={item}
                                        onChange={(e) => setInclusion(index, e.target.value)}
                                        className="w-full rounded-xl border border-olive-200 bg-white px-3.5 py-2.5 text-base text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-mustard focus:ring-2 focus:ring-mustard/30 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50"
                                        placeholder={`Inclusion ${index + 1}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeInclusion(index)}
                                        className="inline-flex shrink-0 items-center justify-center rounded-xl border border-olive-200 px-3 text-olive-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-olive-700 dark:hover:border-rose-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                                        aria-label={`Remove inclusion ${index + 1}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {form.errors.inclusions && (
                            <p className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">
                                {form.errors.inclusions}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-5">
                        <AdminCheckbox
                            label="Highlight as recommended"
                            checked={form.data.is_highlighted}
                            onChange={(e) => form.setData('is_highlighted', e.target.checked)}
                        />
                        <AdminCheckbox
                            label="Active / visible"
                            checked={form.data.is_active}
                            onChange={(e) => form.setData('is_active', e.target.checked)}
                        />
                    </div>

                    <AdminInput
                        label="Sort order"
                        type="number"
                        min="0"
                        value={form.data.sort_order}
                        onChange={(e) => form.setData('sort_order', e.target.value)}
                        error={form.errors.sort_order}
                    />
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-olive-100 px-5 py-4 dark:border-olive-800">
                    <AdminButton type="button" variant="secondary" size="sm" onClick={onCancel}>
                        Cancel
                    </AdminButton>
                    <AdminButton type="submit" size="sm" disabled={form.processing}>
                        <Save className="h-3.5 w-3.5" />
                        {form.processing ? 'Saving…' : 'Save plan'}
                    </AdminButton>
                </div>
            </form>
        );
    }

    return (
        <article
            className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift dark:bg-olive-900 ${
                plan.is_highlighted
                    ? `border-transparent ring-2 ${accent.ring}`
                    : 'border-olive-200/80 dark:border-olive-800'
            } ${!plan.is_active ? 'opacity-70' : ''}`}
        >
            {plan.is_highlighted && (
                <div className="bg-gradient-to-r from-mustard via-mustard to-mint px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-earth-dusk">
                    Recommended
                </div>
            )}

            <div className="flex flex-1 flex-col p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent.iconWrap}`}>
                        <Icon className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${accent.badge}`}>
                        {plan.key}
                    </span>
                </div>

                <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-olive-950 dark:text-white">
                    {plan.name}
                </h3>
                {plan.tagline && (
                    <p className="mt-2 text-sm leading-relaxed text-olive-500 dark:text-olive-400">
                        {plan.tagline}
                    </p>
                )}

                <div className="mt-6 flex items-end gap-1.5">
                    <span className={`font-display text-4xl font-bold tracking-tight tabular-nums ${accent.price}`}>
                        {displayPrice(plan)}
                    </span>
                    {!plan.price_label && Number(plan.price_amount) > 0 && (
                        <span className="mb-1.5 text-sm font-medium text-olive-500 dark:text-olive-400">
                            {periodSuffix(plan.billing_period)}
                        </span>
                    )}
                </div>

                <ul className="mt-7 flex-1 space-y-3">
                    {(plan.inclusions || []).map((item) => (
                        <li key={item} className="flex gap-2.5 text-sm leading-snug text-olive-700 dark:text-olive-200">
                            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint/25 text-olive-800 dark:bg-mint/15 dark:text-mint">
                                <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>

                <div className="mt-8 flex items-center gap-2">
                    <div className="flex-1 rounded-full bg-olive-50 px-4 py-2.5 text-center text-sm font-semibold text-olive-700 dark:bg-olive-950/70 dark:text-olive-200">
                        {plan.cta_label}
                    </div>
                    <AdminButton type="button" variant="secondary" size="sm" onClick={onEdit}>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                    </AdminButton>
                </div>

                {!plan.is_active && (
                    <p className="mt-3 text-center text-xs font-medium uppercase tracking-wide text-olive-400">
                        Inactive — hidden from public pricing
                    </p>
                )}
            </div>
        </article>
    );
}

function ComparisonTable({ plans }) {
    const allFeatures = [];
    const seen = new Set();
    plans.forEach((plan) => {
        (plan.inclusions || []).forEach((item) => {
            if (!seen.has(item)) {
                seen.add(item);
                allFeatures.push(item);
            }
        });
    });

    if (allFeatures.length === 0 || plans.length === 0) return null;

    return (
        <div className="overflow-hidden rounded-2xl border border-olive-200/80 bg-white shadow-soft dark:border-olive-800 dark:bg-olive-900">
            <div className="border-b border-olive-100 px-5 py-4 dark:border-olive-800 sm:px-6">
                <h2 className="text-lg font-semibold tracking-tight text-olive-950 dark:text-olive-50">
                    Inclusion matrix
                </h2>
                <p className="mt-1 text-sm text-olive-500 dark:text-olive-400">
                    Quick compare of what each tier includes.
                </p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] text-left text-sm">
                    <thead>
                        <tr className="border-b border-olive-100 dark:border-olive-800">
                            <th className="px-5 py-3.5 font-semibold text-olive-500 dark:text-olive-400 sm:px-6">
                                Inclusion
                            </th>
                            {plans.map((plan) => (
                                <th
                                    key={plan.id}
                                    className="px-4 py-3.5 text-center font-semibold text-olive-900 dark:text-olive-50"
                                >
                                    {plan.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {allFeatures.map((feature, i) => (
                            <tr
                                key={feature}
                                className={
                                    i % 2 === 0
                                        ? 'bg-earth-sand/40 dark:bg-olive-950/40'
                                        : 'bg-white dark:bg-olive-900'
                                }
                            >
                                <td className="px-5 py-3 text-olive-700 dark:text-olive-200 sm:px-6">
                                    {feature}
                                </td>
                                {plans.map((plan) => {
                                    const has = (plan.inclusions || []).includes(feature);
                                    return (
                                        <td key={plan.id} className="px-4 py-3 text-center">
                                            {has ? (
                                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-mint/30 text-olive-800 dark:bg-mint/20 dark:text-mint">
                                                    <Check className="h-3.5 w-3.5" strokeWidth={2.75} />
                                                </span>
                                            ) : (
                                                <span className="text-olive-300 dark:text-olive-600">—</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function Index({ plans = [], billingPeriods = [] }) {
    const [editingId, setEditingId] = useState(null);

    return (
        <AdminLayout title="Pricing">
            <Head title="Admin pricing" />

            <div className="mb-8 max-w-2xl">
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Set prices and inclusions for Free, Featured, and Premium listing packages.
                    These tiers power listing visibility badges and paid upgrades.
                </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
                {plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        billingPeriods={billingPeriods}
                        editing={editingId === plan.id}
                        onEdit={() => setEditingId(plan.id)}
                        onCancel={() => setEditingId(null)}
                    />
                ))}
            </div>

            <div className="mt-8">
                <ComparisonTable plans={plans.filter((p) => p.is_active)} />
            </div>
        </AdminLayout>
    );
}
