import AccountLayout from '@/Layouts/AccountLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowUpRight, CheckCircle2, Clock3, CreditCard } from 'lucide-react';

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
            free: 'bg-olive-100 text-olive-800',
            active: 'bg-emerald-50 text-emerald-800',
            expiring_soon: 'bg-amber-50 text-amber-900',
            expired: 'bg-rose-50 text-rose-800',
        }[status] || 'bg-olive-100 text-olive-800'
    );
}

function historyStatusTone(status) {
    return (
        {
            approved: 'text-emerald-700',
            pending: 'text-amber-800',
            rejected: 'text-rose-700',
            cancelled: 'text-olive-500',
        }[status] || 'text-olive-600'
    );
}

export default function Billing({ plan, pendingUpgrade = null, history = [] }) {
    const { flash } = usePage().props;

    const daysLeft = plan.days_remaining;
    const periodPct =
        plan.days_total && daysLeft != null
            ? Math.min(100, Math.max(0, ((plan.days_total - daysLeft) / plan.days_total) * 100))
            : (plan.period_percent ?? 0);

    return (
        <AccountLayout title="Billing">
            <Head title="Billing" />

            <div className="space-y-5">
                {(flash?.success || flash?.error) && (
                    <div
                        className={`border px-4 py-3 text-sm ${
                            flash.error
                                ? 'border-rose-200 bg-rose-50 text-rose-800'
                                : 'border-olive-200 bg-white text-olive-900'
                        }`}
                    >
                        {flash.error || flash.success}
                    </div>
                )}

                {/* Current subscription */}
                <section className="border border-olive-200 bg-white">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-olive-100 px-4 py-4 sm:px-5">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-olive-400">
                                Current plan
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <h2 className="font-display text-3xl font-semibold tracking-tight text-olive-950">
                                    {plan.label}
                                </h2>
                                {plan.status !== 'free' && (
                                    <span
                                        className={`inline-flex px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${statusTone(plan.status)}`}
                                    >
                                        {statusLabel(plan.status)}
                                    </span>
                                )}
                            </div>
                            <p className="mt-2 max-w-lg text-sm text-olive-600">
                                {plan.is_paid
                                    ? plan.is_expired
                                        ? 'Your paid period ended. You’re on Free until you renew.'
                                        : `Renews or expires on ${formatDate(plan.expires_at)}.`
                                    : 'Free includes limited listing slots. Upgrade for more reach and time-based placement.'}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {plan.key !== 'premium' && (
                                <Link
                                    href={route('account.upgrade')}
                                    className="inline-flex items-center gap-1.5 bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-mustard hover:text-earth-dusk"
                                >
                                    {plan.is_expired || plan.status === 'free'
                                        ? 'Upgrade plan'
                                        : 'Change plan'}
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            )}
                            <Link
                                href={route('pricing')}
                                className="inline-flex items-center gap-1.5 border border-olive-200 px-3.5 py-2 text-sm font-semibold text-olive-800 transition hover:bg-olive-50"
                            >
                                Compare plans
                            </Link>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-3">
                        <div className="border-b border-olive-100 px-4 py-5 sm:border-b-0 sm:border-r sm:px-5">
                            <div className="flex items-center gap-2 text-olive-500">
                                <Clock3 className="h-4 w-4" strokeWidth={1.75} />
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                                    Days remaining
                                </p>
                            </div>
                            <p className="mt-3 font-display text-3xl font-semibold tabular-nums text-olive-950">
                                {plan.is_paid ? daysLeft : '—'}
                            </p>
                            <p className="mt-1 text-xs text-olive-500">
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

                        <div className="border-b border-olive-100 px-4 py-5 sm:border-b-0 sm:border-r sm:px-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-olive-400">
                                Period
                            </p>
                            <p className="mt-3 text-sm font-semibold text-olive-950">
                                {plan.started_at ? formatDate(plan.started_at) : '—'}
                                <span className="mx-1.5 font-normal text-olive-300">→</span>
                                {plan.expires_at ? formatDate(plan.expires_at) : 'Ongoing'}
                            </p>
                            {plan.is_paid && plan.days_total ? (
                                <div className="mt-3">
                                    <div className="h-1.5 overflow-hidden bg-olive-100">
                                        <div
                                            className={`h-full transition-all ${
                                                plan.status === 'expired'
                                                    ? 'bg-rose-500'
                                                    : plan.status === 'expiring_soon'
                                                      ? 'bg-amber-500'
                                                      : 'bg-olive-800'
                                            }`}
                                            style={{ width: `${periodPct}%` }}
                                        />
                                    </div>
                                    <p className="mt-1.5 text-[11px] text-olive-500">
                                        {Math.round(periodPct)}% of billing period used
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-3 text-xs text-olive-500">Free plans don’t renew.</p>
                            )}
                        </div>

                        <div className="px-4 py-5 sm:px-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-olive-400">
                                Listings
                            </p>
                            <p className="mt-3 font-display text-3xl font-semibold tabular-nums text-olive-950">
                                {plan.listings_used}
                                <span className="text-base font-normal text-olive-400">
                                    /{plan.listing_limit}
                                </span>
                            </p>
                            <p className="mt-1 text-xs text-olive-500">
                                {plan.listings_remaining} slot
                                {plan.listings_remaining === 1 ? '' : 's'} remaining
                            </p>
                        </div>
                    </div>
                </section>

                {pendingUpgrade && (
                    <section className="border border-amber-200 bg-amber-50/60 px-4 py-4 sm:px-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-olive-950">
                                    Pending upgrade to {pendingUpgrade.to_label}
                                </p>
                                <p className="mt-1 text-sm text-olive-700">
                                    {formatMoney(pendingUpgrade.amount, pendingUpgrade.currency)}
                                    {pendingUpgrade.payment_reference
                                        ? ` · Ref ${pendingUpgrade.payment_reference}`
                                        : ''}
                                    {' · '}
                                    Submitted {formatDate(pendingUpgrade.created_at)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    router.post(route('account.upgrade.cancel', pendingUpgrade.id))
                                }
                                className="text-sm font-semibold text-rose-700 hover:underline"
                            >
                                Cancel request
                            </button>
                        </div>
                    </section>
                )}

                {/* Payment activity */}
                <section className="border border-olive-200 bg-white">
                    <div className="flex items-center justify-between gap-3 border-b border-olive-100 px-4 py-3 sm:px-5">
                        <div>
                            <h2 className="text-sm font-semibold text-olive-950">Payment history</h2>
                            <p className="mt-0.5 text-xs text-olive-500">
                                Upgrade requests and plan activations
                            </p>
                        </div>
                        <CreditCard className="h-4 w-4 text-olive-400" strokeWidth={1.75} />
                    </div>

                    {history.length === 0 ? (
                        <div className="px-4 py-10 text-center sm:px-5">
                            <CheckCircle2 className="mx-auto h-8 w-8 text-olive-300" strokeWidth={1.5} />
                            <p className="mt-3 text-sm font-semibold text-olive-900">No payments yet</p>
                            <p className="mx-auto mt-1 max-w-sm text-sm text-olive-500">
                                When you upgrade, your payment reference and plan changes show up here.
                            </p>
                            {plan.key !== 'premium' && (
                                <Link
                                    href={route('account.upgrade')}
                                    className="mt-5 inline-flex items-center gap-1.5 bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-mustard hover:text-earth-dusk"
                                >
                                    Upgrade plan
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[36rem] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-olive-100 text-[11px] font-semibold uppercase tracking-[0.1em] text-olive-400">
                                        <th className="px-4 py-2.5 font-semibold sm:px-5">Date</th>
                                        <th className="px-4 py-2.5 font-semibold sm:px-5">Plan</th>
                                        <th className="px-4 py-2.5 font-semibold sm:px-5">Amount</th>
                                        <th className="px-4 py-2.5 font-semibold sm:px-5">Method</th>
                                        <th className="px-4 py-2.5 font-semibold sm:px-5">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-olive-100">
                                    {history.map((row) => (
                                        <tr key={row.id}>
                                            <td className="whitespace-nowrap px-4 py-3 text-olive-700 sm:px-5">
                                                {formatDate(row.created_at)}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-olive-950 sm:px-5">
                                                {row.from_label} → {row.to_label}
                                                {row.payment_reference && (
                                                    <span className="mt-0.5 block text-xs font-normal text-olive-400">
                                                        Ref {row.payment_reference}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 tabular-nums text-olive-800 sm:px-5">
                                                {formatMoney(row.amount, row.currency)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-olive-600 sm:px-5">
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
                    )}
                </section>
            </div>
        </AccountLayout>
    );
}
