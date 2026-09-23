import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionMenu,
    AdminButton,
    AdminCheckbox,
    AdminInput,
    AdminSelect,
    AdminTextarea,
    DataCard,
    DataTable,
    EmptyState,
    FormPanel,
    PageHeader,
    StatusBadge,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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

function planPayload(plan, overrides = {}) {
    return {
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
        ...overrides,
    };
}

function PlanEditForm({ plan, billingPeriods, onCancel }) {
    const form = useForm(planPayload(plan));

    useEffect(() => {
        form.setData(planPayload(plan));
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
            onSuccess: () => onCancel(),
        });
    };

    return (
        <FormPanel
            title={`Edit · ${plan.key}`}
            description="Update price, inclusions, and visibility for this listing tier."
            className="mb-6"
        >
            <form onSubmit={save} className="space-y-4">
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

                <div className="grid gap-3 sm:grid-cols-2">
                    <AdminInput
                        label="Listing limit"
                        type="number"
                        min="0"
                        value={form.data.listing_limit}
                        onChange={(e) => form.setData('listing_limit', e.target.value)}
                        error={form.errors.listing_limit}
                    />
                    <AdminInput
                        label="Sort order"
                        type="number"
                        min="0"
                        value={form.data.sort_order}
                        onChange={(e) => form.setData('sort_order', e.target.value)}
                        error={form.errors.sort_order}
                    />
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-olive-100 pt-4 dark:border-olive-800">
                    <AdminButton type="button" variant="secondary" size="sm" onClick={onCancel}>
                        <X className="h-3.5 w-3.5" />
                        Cancel
                    </AdminButton>
                    <AdminButton type="submit" size="sm" disabled={form.processing}>
                        <Save className="h-3.5 w-3.5" />
                        {form.processing ? 'Saving…' : 'Save plan'}
                    </AdminButton>
                </div>
            </form>
        </FormPanel>
    );
}

export default function Index({ plans = [], billingPeriods = [] }) {
    const [editingId, setEditingId] = useState(null);
    const editingPlan = plans.find((p) => p.id === editingId) || null;

    const updatePlan = (plan, overrides) => {
        router.put(route('admin.pricing.update', plan.id), planPayload(plan, overrides), {
            preserveScroll: true,
        });
    };

    const remove = (plan) => {
        if (!confirm(`Delete tier “${plan.name}”? This cannot be undone.`)) return;
        router.delete(route('admin.pricing.destroy', plan.id), {
            preserveScroll: true,
            onSuccess: () => {
                if (editingId === plan.id) setEditingId(null);
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Admin pricing" />

            <PageHeader
                title="Pricing"
                description="Manage Free, Featured, and Premium listing packages. These tiers power listing visibility badges and paid upgrades."
            />

            {editingPlan && (
                <PlanEditForm
                    key={`${editingPlan.id}-${editingPlan.updated_at}`}
                    plan={editingPlan}
                    billingPeriods={billingPeriods}
                    onCancel={() => setEditingId(null)}
                />
            )}

            {plans.length === 0 ? (
                <EmptyState
                    title="No pricing tiers"
                    description="Default plans will be created on the next visit."
                />
            ) : (
                <DataCard title={`${plans.length} tiers`}>
                    <DataTable>
                        <thead>
                            <tr>
                                <Th align="center">Order</Th>
                                <Th>Tier</Th>
                                <Th>Price</Th>
                                <Th>Billing</Th>
                                <Th align="center">Listings</Th>
                                <Th>Status</Th>
                                <Th align="right">Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map((plan) => (
                                <tr key={plan.id} className={editingId === plan.id ? 'is-selected' : ''}>
                                    <Td align="center">
                                        <span className="tabular-nums text-sm text-olive-500 dark:text-olive-400">
                                            {plan.sort_order}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="text-base font-medium text-olive-900 dark:text-olive-50">
                                            {plan.name}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="tabular-nums text-sm font-medium text-olive-900 dark:text-olive-50">
                                            {displayPrice(plan)}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-olive-600 dark:text-olive-300">
                                            {periodLabel(plan.billing_period)}
                                        </span>
                                    </Td>
                                    <Td align="center">
                                        <span className="tabular-nums text-sm font-medium text-olive-800 dark:text-olive-100">
                                            {plan.listing_limit}
                                        </span>
                                    </Td>
                                    <Td>
                                        <StatusBadge status={plan.is_active ? 'active' : 'inactive'} />
                                    </Td>
                                    <Td align="right">
                                        <ActionMenu
                                            items={[
                                                {
                                                    label: editingId === plan.id ? 'Close editor' : 'Edit',
                                                    onClick: () =>
                                                        setEditingId(
                                                            editingId === plan.id ? null : plan.id,
                                                        ),
                                                },
                                                {
                                                    label: plan.is_active ? 'Deactivate' : 'Activate',
                                                    onClick: () =>
                                                        updatePlan(plan, {
                                                            is_active: !plan.is_active,
                                                        }),
                                                },
                                                ...(!plan.is_highlighted
                                                    ? [
                                                          {
                                                              label: 'Mark recommended',
                                                              onClick: () =>
                                                                  updatePlan(plan, {
                                                                      is_highlighted: true,
                                                                  }),
                                                          },
                                                      ]
                                                    : []),
                                                {
                                                    label: 'View public page',
                                                    href: route('pricing'),
                                                    external: true,
                                                },
                                                {
                                                    label: 'Delete',
                                                    danger: true,
                                                    onClick: () => remove(plan),
                                                },
                                            ]}
                                        />
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </DataTable>
                </DataCard>
            )}
        </AdminLayout>
    );
}
