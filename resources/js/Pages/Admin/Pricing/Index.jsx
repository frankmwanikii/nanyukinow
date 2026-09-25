import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionMenu,
    DataCard,
    DataTable,
    EmptyState,
    PageHeader,
    Pagination,
    StatusBadge,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import { Head, router } from '@inertiajs/react';

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

function displayYearly(plan) {
    if (Number(plan.price_amount) === 0) return null;
    const yearly = plan.yearly_price_amount;
    if (yearly === null || yearly === undefined || yearly === '') return null;
    return formatMoney(yearly, plan.currency);
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
        yearly_price_amount:
            plan.yearly_price_amount === null || plan.yearly_price_amount === undefined
                ? null
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
        ...overrides,
    };
}

export default function Index({ plans = [], filters = {} }) {
    const { confirm, dialog } = useConfirm();
    const rows = plans?.data || plans || [];
    const total = plans?.meta?.total ?? rows.length;
    const perPage = filters.per_page || plans?.meta?.per_page || 15;

    const setPerPage = (n) => {
        router.get(
            route('admin.pricing.index'),
            { per_page: n },
            { preserveState: true, preserveScroll: true },
        );
    };

    const openEdit = (plan) => {
        router.visit(route('admin.pricing.edit', plan.id));
    };

    const updatePlan = (plan, overrides) => {
        router.put(route('admin.pricing.update', plan.id), planPayload(plan, overrides), {
            preserveScroll: true,
        });
    };

    const remove = async (plan) => {
        const ok = await confirm({
            title: 'Delete pricing tier?',
            message: `Delete tier “${plan.name}”? This cannot be undone.`,
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        router.delete(route('admin.pricing.destroy', plan.id), {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout>
            <Head title="Admin pricing" />
            {dialog}

            <PageHeader
                title="Pricing"
                description="Manage Free, Featured, and Premium listing packages that power visibility badges and paid upgrades."
            />

            {rows.length === 0 ? (
                <EmptyState
                    title="No pricing tiers"
                    description="Default plans will be created on the next visit."
                />
            ) : (
                <DataCard
                    title={`${total} tiers`}
                    footer={
                        <Pagination
                            links={plans.links}
                            meta={plans.meta || plans}
                            perPage={perPage}
                            onPerPageChange={setPerPage}
                        />
                    }
                >
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
                            {rows.map((plan) => (
                                <tr
                                    key={plan.id}
                                    role="link"
                                    tabIndex={0}
                                    onClick={() => openEdit(plan)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            openEdit(plan);
                                        }
                                    }}
                                    className="cursor-pointer transition hover:bg-olive-50/80 dark:hover:bg-olive-800/40"
                                >
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
                                        <div className="space-y-0.5">
                                            <span className="block tabular-nums text-sm font-medium text-olive-900 dark:text-olive-50">
                                                {displayPrice(plan)}
                                                {Number(plan.price_amount) > 0 && !plan.price_label
                                                    ? '/mo'
                                                    : ''}
                                            </span>
                                            {displayYearly(plan) ? (
                                                <span className="block tabular-nums text-xs text-olive-500 dark:text-olive-400">
                                                    {displayYearly(plan)}/yr
                                                </span>
                                            ) : null}
                                        </div>
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-olive-600 dark:text-olive-300">
                                            {Number(plan.price_amount) > 0 &&
                                            plan.yearly_price_amount != null
                                                ? 'Monthly + yearly'
                                                : periodLabel(plan.billing_period)}
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
                                    <Td
                                        align="right"
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => e.stopPropagation()}
                                    >
                                        <ActionMenu
                                            items={[
                                                {
                                                    label: 'Edit',
                                                    href: route('admin.pricing.edit', plan.id),
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
