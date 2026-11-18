import AccountLayout from '@/Layouts/AccountLayout';
import Pagination, {
    useClientPagination,
} from '@/Components/site/Pagination';
import {
    CalendarMark,
    CardMark,
    ForwardMark,
} from '@/Components/site/Mark';
import { Head, Link, router } from '@inertiajs/react';
import {
    isAwaitingMpesaPrompt,
    memberFacingPaymentReference,
} from '@/utils/paymentReference';

const HISTORY_PAGE_SIZE = 10;

function PendingBillingNotice({ upgrade }) {
    const awaitingPrompt = isAwaitingMpesaPrompt(upgrade);
    const visibleRef = memberFacingPaymentReference(upgrade.payment_reference);

    return (
        <section className="border border-amber-300 bg-amber-50 px-4 py-4 sm:px-5 dark:border-amber-900/50 dark:bg-amber-950/30">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    {awaitingPrompt ? (
                        <>
                            <p className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                                M-Pesa prompt sent for {upgrade.to_label}
                            </p>
                            <p className="mt-1 text-sm text-olive-700 dark:text-olive-300">
                                {formatMoney(upgrade.amount, upgrade.currency)}.
                                Check your phone and enter your PIN. Your plan
                                updates when payment succeeds.
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                                Pending payment for {upgrade.to_label}
                            </p>
                            <p className="mt-1 text-sm text-olive-700 dark:text-olive-300">
                                {formatMoney(upgrade.amount, upgrade.currency)}
                                {visibleRef ? ` · Ref ${visibleRef}` : ''}
                                {' · '}
                                Submitted {formatDate(upgrade.created_at)}
                            </p>
                        </>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() =>
                        router.post(route('account.upgrade.cancel', upgrade.id))
                    }
                    className="text-sm font-semibold text-rose-700 hover:underline dark:text-rose-400"
                >
                    Cancel request
                </button>
            </div>
        </section>
    );
}

function HistoryPaymentRef({ reference }) {
    const visibleRef = memberFacingPaymentReference(reference);
    if (!visibleRef) {
        return null;
    }

    return (
        <span className="mt-0.5 block text-xs font-normal text-olive-500 dark:text-olive-500">
            Ref {visibleRef}
        </span>
    );
}

function formatMoney(amount, currency = 'KES') {
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

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function statusLabel(status) {
    return (
        {
            free: 'Free plan',
            active: 'Active',
            expiring_soon: 'Expiring soon',
            expired: 'Expired',
        }[status] || status
    );
}

function statusTone(status) {
    return (
        {
            free: 'border-olive-900/15 bg-olive-100 text-olive-800 dark:border-olive-700 dark:bg-olive-800 dark:text-olive-200',
            active: 'border-olive-900/15 bg-olive-900 text-white dark:border-mustard dark:bg-mustard dark:text-earth-dusk',
            expiring_soon:
                'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
            expired:
                'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
        }[status] ||
        'border-olive-900/15 bg-olive-100 text-olive-800 dark:border-olive-700 dark:bg-olive-800 dark:text-olive-200'
    );
}

function historyStatusTone(status) {
    return (
        {
            approved: 'text-emerald-700 dark:text-emerald-400',
            pending: 'text-amber-800 dark:text-amber-300',
            rejected: 'text-rose-700 dark:text-rose-400',
            cancelled: 'text-olive-500 dark:text-olive-400',
        }[status] || 'text-olive-600 dark:text-olive-300'
    );
}

export default function Billing({ plan, pendingUpgrade = null, history = [] }) {
    const {
        page: historyPage,
        totalPages: historyTotalPages,
        setPage: setHistoryPage,
        pageItems: historyPageItems,
    } = useClientPagination(history, HISTORY_PAGE_SIZE);

    const daysLeft = plan.days_remaining;
    const periodPct =
        plan.days_total && daysLeft != null
            ? Math.min(
                  100,
                  Math.max(0, ((plan.days_total - daysLeft) / plan.days_total) * 100),
              )
            : (plan.period_percent ?? 0);

    return (
        <AccountLayout title="Billing">
            <Head title="Billing" />

            <div className="space-y-5">
                <section className="border border-olive-900/15 bg-white dark:border-olive-800 dark:bg-olive-900">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-olive-900/10 px-4 py-4 sm:px-5 dark:border-olive-800">
                        <div>
                            <p className="text-sm font-medium text-olive-600 dark:text-olive-400">
                                Current plan
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <h2 className="font-display text-3xl font-semibold tracking-tight text-olive-950 dark:text-olive-50">
                                    {plan.label}
                                </h2>
                                {plan.status !== 'free' && (
                                    <span
                                        className={`inline-flex border px-2 py-0.5 text-[11px] font-semibold ${statusTone(plan.status)}`}
                                    >
                                        {statusLabel(plan.status)}
                                    </span>
                                )}
                            </div>
                            <p className="mt-2 max-w-lg text-sm text-olive-600 dark:text-olive-400">
                                {plan.is_expired
                                    ? 'Your paid period ended. You’re on Free until you renew. Listings stay saved and go live again after renewal.'
                                    : plan.is_paid
                                      ? `${plan.days_remaining != null ? `${plan.days_remaining} days left. ` : ''}Renews or expires on ${formatDate(plan.expires_at)}.`
                                      : 'Free includes limited listing slots. Upgrade for more reach and time-based placement.'}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {plan.can_renew ? (
                                <Link
                                    href={route('account.upgrade', {
                                        plan: plan.renew_plan,
                                        billing: plan.renew_billing_period || 'month',
                                        renew: 1,
                                    })}
                                    className="inline-flex items-center gap-1.5 rounded-sm bg-mustard px-3.5 py-2 text-sm font-semibold text-earth-dusk transition hover:bg-olive-900 hover:text-white dark:hover:bg-olive-100 dark:hover:text-earth-dusk"
                                >
                                    Renew plan
                                    <ForwardMark className="h-4 w-4" />
                                </Link>
                            ) : null}
                            {plan.key !== 'premium' && !plan.is_expired && (
                                <Link
                                    href={route('account.upgrade')}
                                    className="inline-flex items-center gap-1.5 rounded-sm bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-mustard hover:text-earth-dusk dark:bg-mustard dark:text-earth-dusk dark:hover:bg-olive-100"
                                >
                                    {plan.can_renew ? 'Change plan' : 'Upgrade plan'}
                                    <ForwardMark className="h-4 w-4" />
                                </Link>
                            )}
                            <Link
                                href={route('account.upgrade')}
                                className="inline-flex items-center gap-1.5 rounded-sm border border-olive-900/20 px-3.5 py-2 text-sm font-semibold text-olive-800 transition hover:bg-olive-50 dark:border-olive-700 dark:text-olive-200 dark:hover:bg-olive-800"
                            >
                                Compare plans
                            </Link>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-3">
                        <div className="border-b border-olive-900/10 px-4 py-5 sm:border-b-0 sm:border-r sm:px-5 dark:border-olive-800">
                            <div className="flex items-center gap-2 text-olive-700 dark:text-olive-300">
                                <CalendarMark className="h-4 w-4" />
                                <p className="text-sm font-medium">Days remaining</p>
                            </div>
                            <p className="mt-3 font-display text-3xl font-semibold tabular-nums text-olive-950 dark:text-olive-50">
                                {plan.is_paid ? daysLeft : '—'}
                            </p>
                            <p className="mt-1 text-xs text-olive-600 dark:text-olive-400">
                                {plan.is_paid
                                    ? plan.is_expired
                                        ? 'Expired'
                                        : daysLeft === 0
                                          ? 'Ends today'
                                          : daysLeft === 1
                                            ? '1 day left'
                                            : `${daysLeft} days left`
                                    : 'No expiry on Free'}
                            </p>
                        </div>

                        <div className="border-b border-olive-900/10 px-4 py-5 sm:border-b-0 sm:border-r sm:px-5 dark:border-olive-800">
                            <p className="text-sm font-medium text-olive-600 dark:text-olive-400">
                                Period
                            </p>
                            <p className="mt-3 text-sm font-semibold text-olive-950 dark:text-olive-50">
                                {plan.started_at ? formatDate(plan.started_at) : '—'}
                                <span className="mx-1.5 font-normal text-olive-400 dark:text-olive-600">
                                    →
                                </span>
                                {plan.expires_at ? formatDate(plan.expires_at) : 'Ongoing'}
                            </p>
                            {plan.is_paid && plan.days_total ? (
                                <div className="mt-3">
                                    <div className="h-1.5 overflow-hidden bg-olive-100 dark:bg-olive-800">
                                        <div
                                            className={`h-full transition-all ${
                                                plan.status === 'expired'
                                                    ? 'bg-rose-600'
                                                    : plan.status === 'expiring_soon'
                                                      ? 'bg-amber-600'
                                                      : 'bg-olive-900 dark:bg-mustard'
                                            }`}
                                            style={{ width: `${periodPct}%` }}
                                        />
                                    </div>
                                    <p className="mt-1.5 text-[11px] text-olive-600 dark:text-olive-400">
                                        {Math.round(periodPct)}% of billing period used
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-3 text-xs text-olive-600 dark:text-olive-400">
                                    Free plans don’t renew.
                                </p>
                            )}
                        </div>

                        <div className="px-4 py-5 sm:px-5">
                            <p className="text-sm font-medium text-olive-600 dark:text-olive-400">
                                Listings
                            </p>
                            <p className="mt-3 font-display text-3xl font-semibold tabular-nums text-olive-950 dark:text-olive-50">
                                {plan.listings_used}
                                <span className="text-base font-normal text-olive-500 dark:text-olive-500">
                                    /{plan.listing_limit}
                                </span>
                            </p>
                            <p className="mt-1 text-xs text-olive-600 dark:text-olive-400">
                                {plan.listings_remaining} slot
                                {plan.listings_remaining === 1 ? '' : 's'} remaining
                            </p>
                        </div>
                    </div>
                </section>

                {pendingUpgrade && (
                    <PendingBillingNotice upgrade={pendingUpgrade} />
                )}

                <section className="border border-olive-900/15 bg-white dark:border-olive-800 dark:bg-olive-900">
                    <div className="flex items-center justify-between gap-3 border-b border-olive-900/10 px-4 py-4 sm:px-5 dark:border-olive-800">
                        <div>
                            <h2 className="font-display text-base font-semibold text-olive-950 dark:text-olive-50">
                                Payment history
                            </h2>
                            <p className="mt-0.5 text-sm text-olive-600 dark:text-olive-400">
                                Upgrade requests and plan activations
                            </p>
                        </div>
                        <CardMark className="h-5 w-5 text-olive-700 dark:text-olive-300" />
                    </div>

                    {history.length === 0 ? (
                        <div className="px-4 py-10 text-center sm:px-5">
                            <p className="text-sm font-semibold text-olive-900 dark:text-olive-100">
                                No payments yet
                            </p>
                            <p className="mx-auto mt-1 max-w-sm text-sm text-olive-600 dark:text-olive-400">
                                When you upgrade, your payment reference and plan changes show up
                                here.
                            </p>
                            {plan.key !== 'premium' && (
                                <Link
                                    href={route('account.upgrade')}
                                    className="mt-5 inline-flex items-center gap-1.5 bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-mustard hover:text-earth-dusk dark:bg-mustard dark:text-earth-dusk"
                                >
                                    Upgrade plan
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[36rem] text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-olive-900/10 text-xs font-semibold text-olive-600 dark:border-olive-800 dark:text-olive-400">
                                            <th className="px-4 py-2.5 font-semibold sm:px-5">
                                                Date
                                            </th>
                                            <th className="px-4 py-2.5 font-semibold sm:px-5">
                                                Plan
                                            </th>
                                            <th className="px-4 py-2.5 font-semibold sm:px-5">
                                                Amount
                                            </th>
                                            <th className="px-4 py-2.5 font-semibold sm:px-5">
                                                Method
                                            </th>
                                            <th className="px-4 py-2.5 font-semibold sm:px-5">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-olive-900/10 dark:divide-olive-800">
                                        {historyPageItems.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="transition hover:bg-olive-50/70 dark:hover:bg-olive-800/40"
                                            >
                                                <td className="whitespace-nowrap px-4 py-3 text-olive-700 dark:text-olive-300 sm:px-5">
                                                    {formatDate(row.created_at)}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-olive-950 dark:text-olive-50 sm:px-5">
                                                    {row.from_label} → {row.to_label}
                                                    <HistoryPaymentRef
                                                        reference={row.payment_reference}
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-olive-800 dark:text-olive-200 sm:px-5">
                                                    {formatMoney(
                                                        row.amount,
                                                        row.currency,
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-olive-600 dark:text-olive-400 sm:px-5">
                                                    {row.payment_method_label || '—'}
                                                </td>
                                                <td
                                                    className={`whitespace-nowrap px-4 py-3 font-semibold capitalize sm:px-5 ${historyStatusTone(row.status)}`}
                                                >
                                                    {row.status}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                className="border-t border-olive-900/10 px-4 py-5 dark:border-olive-800"
                                page={historyPage}
                                totalPages={historyTotalPages}
                                onPageChange={setHistoryPage}
                                label="Payment history pagination"
                            />
                        </>
                    )}
                </section>
            </div>
        </AccountLayout>
    );
}
