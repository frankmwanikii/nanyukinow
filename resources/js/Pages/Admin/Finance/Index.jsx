import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionMenu,
    AdminButton,
    AdminInput,
    AdminNotice,
    AdminSelect,
    AdminTabs,
    AdminTextarea,
    DataCard,
    DataTable,
    EmptyState,
    FilterBar,
    PageHeader,
    Pagination,
    StatusBadge,
    SummaryCard,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { Head, Link, router } from '@inertiajs/react';
import {
    Banknote,
    CheckCircle2,
    CircleDollarSign,
    ClipboardCheck,
    LayoutList,
    Sparkles,
    Users,
    Wallet,
    X,
} from '@/Components/site/LucideCompat';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';

function money(amount, currency = 'KES') {
    return `${currency} ${Number(amount || 0).toLocaleString()}`;
}

function methodLabel(method, methods = []) {
    const key = String(method || '').toLowerCase();
    const fromList = methods.find((m) => m.value === key);
    if (fromList?.label) return fromList.label;
    const map = {
        mpesa: 'M-Pesa',
        paypal: 'PayPal',
        intasend: 'IntaSend',
        card: 'Card',
        bank: 'Bank transfer',
        unknown: 'Unknown',
    };
    if (map[key]) return map[key];
    if (!key) return '—';
    return key.charAt(0).toUpperCase() + key.slice(1);
}

function periodLabel(period) {
    const map = { month: 'Monthly', year: 'Yearly', one_time: 'One-time' };
    return map[period] || period || '—';
}

function formatDate(iso, withTime = false) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString(undefined, {
            dateStyle: 'medium',
            ...(withTime ? { timeStyle: 'short' } : {}),
        });
    } catch {
        return '—';
    }
}

function SectionTabs({ tab, pendingCount }) {
    return (
        <AdminTabs
            label="Finance sections"
            value={tab}
            onChange={(id) =>
                router.get(
                    route('admin.finance.index'),
                    id === 'payments'
                        ? {
                              tab: 'payments',
                              ...(pendingCount > 0 ? { status: 'pending' } : {}),
                          }
                        : { tab: id },
                    { preserveState: true },
                )
            }
            items={[
                { id: 'overview', label: 'Overview' },
                {
                    id: 'payments',
                    label: 'Payments',
                    badge: pendingCount > 0 ? pendingCount : null,
                },
            ]}
        />
    );
}

function ReviewPaymentDialog({ payment, methods, onClose }) {
    const titleId = useId();
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && !busy) onClose?.();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose, busy]);

    const finish = {
        preserveScroll: true,
        onError: (errors) => {
            setError(
                errors?.admin_notes ||
                    errors?.duration_days ||
                    'Could not update this payment. Try again.',
            );
        },
        onSuccess: () => onClose?.(),
        onFinish: () => setBusy(false),
    };

    const approve = () => {
        setError(null);
        setBusy(true);
        router.post(
            route('admin.finance.approve', payment.id),
            { admin_notes: note },
            finish,
        );
    };

    const reject = () => {
        if (!note.trim()) {
            setError('Add a short rejection note first.');
            return;
        }
        setError(null);
        setBusy(true);
        router.post(
            route('admin.finance.reject', payment.id),
            { admin_notes: note },
            finish,
        );
    };

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
            <button
                type="button"
                aria-label="Dismiss"
                className="absolute inset-0 bg-olive-950/55 backdrop-blur-[2px]"
                onClick={() => !busy && onClose?.()}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="relative flex max-h-[min(92vh,44rem)] w-full max-w-lg flex-col overflow-hidden border border-olive-200 bg-white dark:border-olive-700 dark:bg-olive-900"
            >
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-olive-100 px-5 py-4 dark:border-olive-800">
                    <div className="min-w-0">
                        <h2
                            id={titleId}
                            className="font-display text-lg font-semibold tracking-tight text-olive-950 dark:text-white"
                        >
                            Review payment
                        </h2>
                        <p className="mt-0.5 text-sm text-olive-500 dark:text-olive-400">
                            Verify method & reference, then approve listing plan access.
                            {payment.user?.id ? (
                                <>
                                    {' '}
                                    <Link
                                        href={route(
                                            'admin.users.show',
                                            payment.user.username || payment.user.id,
                                        )}
                                        className="font-semibold text-earth-clay hover:text-earth-dusk dark:text-mustard"
                                    >
                                        Open {payment.user.name || 'member'} profile
                                    </Link>
                                </>
                            ) : null}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => !busy && onClose?.()}
                        className="rounded-lg p-1.5 text-olive-400 transition hover:bg-olive-100 hover:text-olive-800 dark:hover:bg-olive-800"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
                    <dl className="grid gap-3 rounded-xl border border-olive-100 bg-olive-50/60 p-4 text-sm dark:border-olive-800 dark:bg-olive-950/40 sm:grid-cols-2">
                        <div>
                            <dt className="text-olive-500">Member</dt>
                            <dd className="mt-0.5 font-semibold text-olive-950 dark:text-olive-50">
                                {payment.user?.name || '—'}
                            </dd>
                            <dd className="text-olive-500">{payment.user?.email}</dd>
                        </div>
                        <div>
                            <dt className="text-olive-500">Product</dt>
                            <dd className="mt-0.5 font-semibold text-olive-950 dark:text-olive-50">
                                {payment.product || 'Listing membership'}
                            </dd>
                            <dd className="text-olive-500">
                                {payment.from_label} → {payment.to_label} ·{' '}
                                {periodLabel(payment.billing_period)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-olive-500">Method</dt>
                            <dd className="mt-0.5 font-semibold text-olive-950 dark:text-olive-50">
                                {methodLabel(payment.payment_method, methods)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-olive-500">Reference</dt>
                            <dd className="mt-0.5 font-mono text-sm font-semibold text-olive-950 dark:text-olive-50">
                                {payment.payment_reference || '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-olive-500">Amount paid</dt>
                            <dd className="mt-0.5 text-lg font-bold tabular-nums text-olive-950 dark:text-white">
                                {money(payment.amount, payment.currency)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-olive-500">Member listings</dt>
                            <dd className="mt-0.5 font-semibold text-olive-950 dark:text-olive-50">
                                {payment.listings_count ?? 0} total
                                {payment.paid_listings_count
                                    ? `, ${payment.paid_listings_count} paid tier`
                                    : ''}
                            </dd>
                        </div>
                        {payment.member_notes ? (
                            <div className="sm:col-span-2">
                                <dt className="text-olive-500">Member note</dt>
                                <dd className="mt-0.5 text-olive-800 dark:text-olive-200">
                                    {payment.member_notes}
                                </dd>
                            </div>
                        ) : null}
                    </dl>

                    {(payment.listings || []).length > 0 ? (
                        <div>
                            <p className="mb-2 text-xs font-medium text-olive-500">
                                Linked listings
                            </p>
                            <ul className="divide-y divide-olive-100 overflow-hidden rounded-xl border border-olive-100 dark:divide-olive-800 dark:border-olive-800">
                                {payment.listings.map((listing) => (
                                    <li key={listing.id}>
                                        <Link
                                            href={listing.edit_href}
                                            className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-olive-50 dark:hover:bg-olive-800/50"
                                        >
                                            <span className="min-w-0 truncate font-medium text-olive-900 dark:text-olive-50">
                                                {listing.title}
                                            </span>
                                            <StatusBadge status={listing.tier || listing.status} />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    <AdminTextarea
                        label="Admin note"
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Optional for approve; required to reject"
                        error={error}
                    />
                </div>

                <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-olive-100 bg-olive-50/70 px-5 py-3 sm:flex-row sm:justify-end dark:border-olive-800 dark:bg-olive-950/40">
                    <AdminButton
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={busy}
                        onClick={onClose}
                    >
                        Cancel
                    </AdminButton>
                    <AdminButton
                        type="button"
                        size="sm"
                        variant="danger"
                        disabled={busy}
                        onClick={reject}
                    >
                        {busy ? 'Working…' : 'Reject'}
                    </AdminButton>
                    <AdminButton type="button" size="sm" disabled={busy} onClick={approve}>
                        {busy ? 'Working…' : 'Approve payment'}
                    </AdminButton>
                </div>
            </div>
        </div>,
        document.body,
    );
}

function PaymentsTable({
    payments,
    methods,
    onReview,
    emptyTitle,
    emptyDescription,
    perPage,
    onPerPageChange,
}) {
    const rows = payments?.data || [];

    if (rows.length === 0) {
        return <EmptyState title={emptyTitle} description={emptyDescription} />;
    }

    return (
        <DataCard
            title={`${payments.meta?.total ?? rows.length} payment${
                (payments.meta?.total ?? rows.length) === 1 ? '' : 's'
            }`}
            footer={
                <Pagination
                    links={payments.links}
                    meta={payments.meta || payments}
                    perPage={perPage}
                    onPerPageChange={onPerPageChange}
                />
            }
        >
            <DataTable>
                <thead>
                    <tr>
                        <Th>Date</Th>
                        <Th>Member</Th>
                        <Th>Product</Th>
                        <Th>Method</Th>
                        <Th>Reference</Th>
                        <Th align="right">Amount paid</Th>
                        <Th>Status</Th>
                        <Th align="right">Action</Th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((payment) => {
                        const memberKey = payment.user?.username || payment.user?.id;
                        const memberUrl = memberKey
                            ? route('admin.users.show', memberKey)
                            : null;
                        return (
                        <tr
                            key={payment.id}
                            role={memberUrl ? 'link' : undefined}
                            tabIndex={memberUrl ? 0 : undefined}
                            onClick={() => {
                                if (memberUrl) router.visit(memberUrl);
                            }}
                            onKeyDown={(e) => {
                                if (!memberUrl) return;
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    router.visit(memberUrl);
                                }
                            }}
                            className={
                                memberUrl
                                    ? 'cursor-pointer transition hover:bg-olive-50/80 dark:hover:bg-olive-800/40'
                                    : undefined
                            }
                        >
                            <Td>
                                <span className="whitespace-nowrap text-sm text-olive-600 dark:text-olive-300">
                                    {formatDate(payment.created_at)}
                                </span>
                            </Td>
                            <Td>
                                <p className="font-medium text-olive-900 dark:text-olive-50">
                                    {payment.user?.name || '—'}
                                </p>
                            </Td>
                            <Td>
                                <p className="text-sm font-medium text-olive-900 dark:text-olive-50">
                                    {payment.to_label}
                                </p>
                            </Td>
                            <Td>
                                <span className="inline-flex whitespace-nowrap items-center rounded-full bg-olive-100 px-2.5 py-1 text-xs font-semibold text-olive-800 dark:bg-olive-800 dark:text-olive-100">
                                    {methodLabel(payment.payment_method, methods)}
                                </span>
                            </Td>
                            <Td>
                                <code className="rounded bg-olive-100 px-2 py-1 font-mono text-sm text-olive-900 dark:bg-olive-800 dark:text-olive-100">
                                    {payment.payment_reference || '—'}
                                </code>
                            </Td>
                            <Td align="right">
                                <span className="tabular-nums text-sm font-semibold text-olive-950 dark:text-olive-50">
                                    {money(payment.amount, payment.currency)}
                                </span>
                            </Td>
                            <Td>
                                <StatusBadge status={payment.status} />
                            </Td>
                            <Td
                                align="right"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            >
                                {payment.status === 'pending' ? (
                                    <AdminButton
                                        size="sm"
                                        type="button"
                                        onClick={() => onReview(payment)}
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Review
                                    </AdminButton>
                                ) : (
                                    <ActionMenu
                                        items={[
                                            memberUrl
                                                ? {
                                                      label: 'Open member profile',
                                                      href: memberUrl,
                                                  }
                                                : null,
                                            {
                                                label: 'View member listings',
                                                href: memberUrl
                                                    ? route('admin.users.show', {
                                                          user: memberKey,
                                                          tab: 'listings',
                                                      })
                                                    : route('admin.listings.index', {
                                                          q: payment.user?.name,
                                                      }),
                                            },
                                            {
                                                label: 'Payment history',
                                                href: memberUrl
                                                    ? route('admin.users.show', {
                                                          user: memberKey,
                                                          tab: 'payments',
                                                      })
                                                    : route('admin.users.index', {
                                                          q: payment.user?.email,
                                                      }),
                                            },
                                        ].filter(Boolean)}
                                    />
                                )}
                            </Td>
                        </tr>
                        );
                    })}
                </tbody>
            </DataTable>
        </DataCard>
    );
}

function Overview({ stats, counts, breakdowns, methods, onGoPending, onGoPayments }) {
    const currency = stats.currency || 'KES';
    const byMethod = breakdowns?.by_method || [];
    const byPlan = breakdowns?.by_plan || [];
    const recent = breakdowns?.recent || [];
    const methodMax = Math.max(...byMethod.map((r) => r.total), 1);
    const planMax = Math.max(...byPlan.map((r) => r.total), 1);

    return (
        <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Awaiting approval"
                    value={stats.pending_count ?? 0}
                    hint={money(stats.pending_amount, currency)}
                    icon={ClipboardCheck}
                    iconTone="amber"
                    actionLabel="Review payments"
                    onAction={onGoPending}
                />
                <SummaryCard
                    title="All-time revenue"
                    value={money(stats.approved_amount, currency)}
                    hint={`${stats.approved_count ?? 0} approved, avg ${money(stats.avg_ticket, currency)}`}
                    icon={CircleDollarSign}
                    iconTone="mint"
                    actionLabel="All payments"
                    onAction={onGoPayments}
                />
                <SummaryCard
                    title="This month"
                    value={money(stats.month_revenue, currency)}
                    hint={`This week ${money(stats.week_revenue, currency)}`}
                    icon={Banknote}
                    iconTone="mustard"
                />
                <SummaryCard
                    title="Paid listing reach"
                    value={stats.published_paid_listings ?? 0}
                    hint={`${stats.featured_listings ?? 0} featured, ${stats.premium_listings ?? 0} premium, ${stats.paid_members ?? 0} paid members`}
                    icon={Sparkles}
                    iconTone="slate"
                    actionLabel="View listings"
                    actionHref={route('admin.listings.index', { tier: 'premium' })}
                />
            </div>

            {counts.pending > 0 ? (
                <AdminNotice
                    tone="decreasing"
                    href={route('admin.finance.index', {
                        tab: 'payments',
                        status: 'pending',
                    })}
                >
                    {counts.pending} payment{counts.pending === 1 ? '' : 's'} need approval before
                    listing plan access is activated.
                </AdminNotice>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-2">
                <DataCard title="Revenue by method">
                    {byMethod.length === 0 ? (
                        <p className="px-5 py-10 text-center text-sm text-olive-500">
                            No approved payments yet.
                        </p>
                    ) : (
                        <ul className="space-y-3 px-5 py-4">
                            {byMethod.map((row) => (
                                <li key={row.method}>
                                    <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                                        <span className="font-medium text-olive-900 dark:text-olive-50">
                                            {row.label}
                                        </span>
                                        <span className="tabular-nums text-olive-600 dark:text-olive-300">
                                            {money(row.total, currency)}, {row.count}
                                        </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-olive-100 dark:bg-olive-800">
                                        <div
                                            className="h-full bg-mustard"
                                            style={{
                                                width: `${Math.max(6, (row.total / methodMax) * 100)}%`,
                                            }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </DataCard>

                <DataCard title="Revenue by listing plan">
                    {byPlan.length === 0 ? (
                        <p className="px-5 py-10 text-center text-sm text-olive-500">
                            No approved plan payments yet.
                        </p>
                    ) : (
                        <ul className="space-y-3 px-5 py-4">
                            {byPlan.map((row) => (
                                <li key={row.plan}>
                                    <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                                        <span className="font-medium text-olive-900 dark:text-olive-50">
                                            {row.label}
                                        </span>
                                        <span className="tabular-nums text-olive-600 dark:text-olive-300">
                                            {money(row.total, currency)}, {row.count}
                                        </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-olive-100 dark:bg-olive-800">
                                        <div
                                            className="h-full rounded-full bg-olive-800 dark:bg-mustard"
                                            style={{
                                                width: `${Math.max(6, (row.total / planMax) * 100)}%`,
                                            }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </DataCard>
            </div>

            <DataCard
                title="Recent activity"
                tools={
                    <button
                        type="button"
                        onClick={onGoPayments}
                        className="text-sm font-semibold text-earth-clay hover:text-earth-dusk dark:text-mustard"
                    >
                        View all
                    </button>
                }
            >
                {recent.length === 0 ? (
                    <p className="px-5 py-10 text-center text-sm text-olive-500">
                        Payments will appear here as members pay for listing plans.
                    </p>
                ) : (
                    <DataTable>
                        <thead>
                            <tr>
                                <Th>Date</Th>
                                <Th>Member</Th>
                                <Th>Plan</Th>
                                <Th>Method</Th>
                                <Th>Reference</Th>
                                <Th align="right">Amount</Th>
                                <Th>Status</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent.map((row) => (
                                <tr key={row.id}>
                                    <Td>
                                        <span className="text-sm text-olive-600 dark:text-olive-300">
                                            {formatDate(row.created_at)}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="font-medium text-olive-900 dark:text-olive-50">
                                            {row.member || '—'}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-olive-800 dark:text-olive-100">
                                            {row.to_label}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-olive-600">
                                            {methodLabel(row.method, methods)}
                                        </span>
                                    </Td>
                                    <Td>
                                        <code className="rounded bg-olive-100 px-1.5 py-0.5 font-mono text-xs dark:bg-olive-800">
                                            {row.reference || '—'}
                                        </code>
                                    </Td>
                                    <Td align="right">
                                        <span className="tabular-nums text-sm font-semibold">
                                            {money(row.amount, row.currency)}
                                        </span>
                                    </Td>
                                    <Td>
                                        <StatusBadge status={row.status} />
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </DataTable>
                )}
            </DataCard>

            <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-olive-200/70 bg-white p-4 dark:border-olive-800 dark:bg-olive-900">
                    <div className="flex items-center gap-2 text-olive-500">
                        <Users className="h-4 w-4" />
                        <span className="text-xs font-medium">
                            Paid members
                        </span>
                    </div>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-olive-950 dark:text-white">
                        {stats.paid_members ?? 0}
                    </p>
                </div>
                <div className="rounded-xl border border-olive-200/70 bg-white p-4 dark:border-olive-800 dark:bg-olive-900">
                    <div className="flex items-center gap-2 text-olive-500">
                        <LayoutList className="h-4 w-4" />
                        <span className="text-xs font-medium">
                            Featured listings
                        </span>
                    </div>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-olive-950 dark:text-white">
                        {stats.featured_listings ?? 0}
                    </p>
                </div>
                <div className="rounded-xl border border-olive-200/70 bg-white p-4 dark:border-olive-800 dark:bg-olive-900">
                    <div className="flex items-center gap-2 text-olive-500">
                        <Wallet className="h-4 w-4" />
                        <span className="text-xs font-medium">
                            Premium listings
                        </span>
                    </div>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-olive-950 dark:text-white">
                        {stats.premium_listings ?? 0}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function Index({
    tab = 'overview',
    payments,
    filters,
    counts,
    stats = {},
    breakdowns = {},
    methods = [],
}) {
    const [reviewing, setReviewing] = useState(null);
    const [q, setQ] = useState(filters.q || '');

    const pushFilters = (next) => {
        router.get(
            route('admin.finance.index'),
            {
                tab: 'payments',
                status: next.status ?? filters.status,
                method: next.method ?? filters.method,
                q: next.q ?? q,
                per_page: next.per_page ?? filters.per_page ?? 20,
            },
            { preserveState: true, replace: true },
        );
    };

    useEffect(() => {
        setQ(filters.q || '');
    }, [filters.q]);

    useEffect(() => {
        if (tab !== 'payments') return undefined;
        const t = setTimeout(() => {
            if ((filters.q || '') === q) return;
            pushFilters({ q });
        }, 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, tab]);

    return (
        <AdminLayout>
            <Head title="Finance" />

            <PageHeader
                title="Finance"
                description="Membership payments that unlock listing plans."
            />

            <SectionTabs tab={tab} pendingCount={counts.pending} />

            {tab === 'overview' ? (
                <Overview
                    stats={stats}
                    counts={counts}
                    breakdowns={breakdowns}
                    methods={methods}
                    onGoPending={() =>
                        router.get(route('admin.finance.index'), {
                            tab: 'payments',
                            status: 'pending',
                        })
                    }
                    onGoPayments={() =>
                        router.get(route('admin.finance.index'), {
                            tab: 'payments',
                            status: 'all',
                        })
                    }
                />
            ) : null}

            {tab === 'payments' ? (
                <div className="space-y-4">
                    {counts.pending > 0 && filters.status === 'pending' ? (
                        <AdminNotice tone="decreasing">
                            {counts.pending} payment
                            {counts.pending === 1 ? '' : 's'} awaiting approval — match each
                            reference, then review.
                        </AdminNotice>
                    ) : null}

                    <FilterBar>
                        <AdminInput
                            label="Search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Member, email, reference…"
                            className="min-w-[200px] flex-1"
                        />
                        <AdminSelect
                            label="Status"
                            value={filters.status || 'all'}
                            onChange={(e) => pushFilters({ status: e.target.value })}
                            className="w-40"
                        >
                            <option value="all">All</option>
                            <option value="pending">
                                Pending{counts.pending ? ` (${counts.pending})` : ''}
                            </option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                        </AdminSelect>
                        <AdminSelect
                            label="Method"
                            value={filters.method || ''}
                            onChange={(e) => pushFilters({ method: e.target.value })}
                            className="w-40"
                        >
                            <option value="">All methods</option>
                            {methods.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </AdminSelect>
                    </FilterBar>

                    <PaymentsTable
                        payments={payments}
                        methods={methods}
                        onReview={setReviewing}
                        emptyTitle={
                            filters.status === 'pending'
                                ? 'No payments awaiting approval'
                                : 'No payments match'
                        }
                        emptyDescription={
                            filters.status === 'pending'
                                ? 'When members submit a payment for a listing plan, it lands here.'
                                : 'Try another status, method, or search term.'
                        }
                        perPage={filters.per_page || 20}
                        onPerPageChange={(n) => pushFilters({ per_page: n })}
                    />
                </div>
            ) : null}

            {reviewing ? (
                <ReviewPaymentDialog
                    payment={reviewing}
                    methods={methods}
                    onClose={() => setReviewing(null)}
                />
            ) : null}
        </AdminLayout>
    );
}
