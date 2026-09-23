import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminButton,
    AdminCheckbox,
    AdminInput,
    AdminSelect,
    AdminTextarea,
    FormPanel,
    PageHeader,
    StatusBadge,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect } from 'react';

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

function displayPrice(plan) {
    if (plan.price_label) return plan.price_label;
    if (Number(plan.price_amount) === 0) return 'Free';
    return formatMoney(plan.price_amount, plan.currency);
}

function periodLabel(period) {
    if (period === 'year') return 'Per year';
    if (period === 'one_time') return 'One-time';
    return 'Per month';
}

export default function Edit({ plan, billingPeriods = [] }) {
    const { confirm, dialog } = useConfirm();

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
        listing_limit: plan.listing_limit ?? 1,
    });

    useEffect(() => {
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
        e.preventDefault();
        form.put(route('admin.pricing.update', plan.id), {
            preserveScroll: true,
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

    return (
        <AdminLayout>
            <Head title={`Edit · ${plan.name}`} />
            {dialog}

            <div className="mb-5">
                <Link
                    href={route('admin.pricing.index')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-olive-600 transition hover:text-olive-900 dark:text-olive-400 dark:hover:text-olive-100"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to pricing
                </Link>
            </div>

            <PageHeader
                title={plan.name}
                description="Tune price, inclusions, visibility, and listing limits for this membership tier."
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={plan.is_active ? 'active' : 'inactive'} />
                        {plan.is_highlighted ? (
                            <span className="rounded-full bg-mustard/25 px-2.5 py-1 text-xs font-semibold text-earth-dusk">
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
                    </div>
                }
            />

            <div className="grid gap-6 xl:grid-cols-12">
                <div className="xl:col-span-8">
                    <FormPanel
                        title={`Edit · ${plan.key}`}
                        description="Changes publish immediately to the public pricing page and upgrade flow."
                    >
                        <form onSubmit={save} className="space-y-5">
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
                                    onChange={(e) =>
                                        form.setData('price_amount', e.target.value)
                                    }
                                    error={form.errors.price_amount}
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
                                    label="Billing"
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

                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-olive-100 pt-5 dark:border-olive-800">
                                <AdminButton
                                    type="button"
                                    size="sm"
                                    variant="danger"
                                    onClick={remove}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete tier
                                </AdminButton>
                                <AdminButton type="submit" disabled={form.processing}>
                                    <Save className="h-4 w-4" />
                                    {form.processing ? 'Saving…' : 'Save plan'}
                                </AdminButton>
                            </div>
                        </form>
                    </FormPanel>
                </div>

                <aside className="xl:col-span-4">
                    <div className="sticky top-6 overflow-hidden rounded-2xl border border-olive-200/80 bg-white shadow-soft dark:border-olive-800 dark:bg-olive-900">
                        <div className="border-b border-olive-100 bg-gradient-to-br from-olive-50 to-mustard/10 px-5 py-4 dark:border-olive-800 dark:from-olive-950 dark:to-olive-900">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-olive-500">
                                Live preview
                            </p>
                            <h2 className="mt-1 font-display text-xl font-bold text-olive-950 dark:text-white">
                                {form.data.name || plan.name}
                            </h2>
                            <p className="mt-1 text-sm text-olive-600 dark:text-olive-300">
                                {form.data.tagline || '—'}
                            </p>
                        </div>
                        <div className="space-y-4 px-5 py-5">
                            <div>
                                <p className="font-display text-3xl font-bold tracking-tight text-olive-950 dark:text-white">
                                    {form.data.price_label ||
                                        displayPrice({
                                            ...form.data,
                                            price_label: form.data.price_label,
                                        })}
                                </p>
                                <p className="mt-1 text-sm text-olive-500">
                                    {periodLabel(form.data.billing_period)} ·{' '}
                                    {form.data.listing_limit} listing
                                    {Number(form.data.listing_limit) === 1 ? '' : 's'}
                                </p>
                            </div>
                            <ul className="space-y-2">
                                {(form.data.inclusions || [])
                                    .filter((i) => String(i || '').trim())
                                    .map((item, i) => (
                                        <li
                                            key={`${i}-${item}`}
                                            className="flex gap-2 text-sm text-olive-700 dark:text-olive-200"
                                        >
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mustard" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                            </ul>
                            <div className="rounded-xl bg-olive-50 px-3.5 py-3 text-center text-sm font-semibold text-olive-900 dark:bg-olive-950/60 dark:text-olive-50">
                                {form.data.cta_label || 'Get started'}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </AdminLayout>
    );
}
