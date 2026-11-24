import AccountLayout from '@/Layouts/AccountLayout';
import {
    BookmarkMark,
    CloseMark,
    ListMark,
    UpgradePlansMark,
} from '@/Components/site/Mark';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    isAwaitingMpesaPrompt,
    memberFacingPaymentReference,
} from '@/utils/paymentReference';

function PendingPaymentSummary({ upgrade }) {
    const ref = memberFacingPaymentReference(upgrade.payment_reference);

    return (
        <>
            Pending payment for <strong>{upgrade.to_label}</strong>
            {ref ? ` (ref ${ref})` : ''}
        </>
    );
}

function MetricCard({ label, children, href }) {
    const inner = (
        <>
            <p className="text-sm font-medium text-olive-600 dark:text-olive-400">
                {label}
            </p>
            <div className="mt-2">{children}</div>
        </>
    );

    const shell =
        'border border-olive-900/15 bg-white p-4 transition dark:border-olive-800 dark:bg-olive-900 sm:p-5';

    if (href) {
        return (
            <Link
                href={href}
                className={`${shell} hover:border-olive-900/35 dark:hover:border-olive-600`}
            >
                {inner}
            </Link>
        );
    }

    return <div className={shell}>{inner}</div>;
}

export default function Index({
    plan,
    bookmarksCount = 0,
    pendingUpgrade = null,
}) {
    const [trialBannerHidden, setTrialBannerHidden] = useState(false);
    const [trialBusy, setTrialBusy] = useState(false);
    const trialBannerVisible =
        Boolean(plan?.show_trial_banner) && !trialBannerHidden;

    const usedPct = plan.listing_limit
        ? Math.min(100, (plan.listings_used / plan.listing_limit) * 100)
        : 0;

    const claimTrial = () => {
        if (trialBusy) {
            return;
        }
        setTrialBusy(true);
        setTrialBannerHidden(true);
        router.post(
            route('account.premium-trial.claim'),
            {},
            {
                preserveScroll: true,
                onFinish: () => setTrialBusy(false),
                onError: () => setTrialBannerHidden(false),
            },
        );
    };

    const dismissTrialBanner = () => {
        if (trialBusy) {
            return;
        }
        setTrialBannerHidden(true);
        setTrialBusy(true);
        router.post(
            route('account.premium-trial.dismiss'),
            {},
            {
                preserveScroll: true,
                onFinish: () => setTrialBusy(false),
                onError: () => setTrialBannerHidden(false),
            },
        );
    };

    return (
        <AccountLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-5">
                {trialBannerVisible ? (
                    <section className="relative overflow-hidden border border-mustard/40 bg-gradient-to-br from-mustard/90 via-mustard to-[#e0a41f] px-4 py-4 text-earth-dusk shadow-sm sm:px-5">
                        <button
                            type="button"
                            onClick={dismissTrialBanner}
                            disabled={trialBusy}
                            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-earth-dusk/70 transition hover:bg-earth-dusk/10 hover:text-earth-dusk disabled:opacity-60"
                            aria-label="Dismiss trial offer"
                        >
                            <CloseMark className="h-4 w-4" />
                        </button>
                        <div className="flex flex-col gap-3 pr-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <div className="min-w-0">
                                <p className="font-display text-lg font-semibold tracking-tight sm:text-xl">
                                    Get 3 months of Premium free
                                </p>
                                <p className="mt-1 max-w-xl text-sm leading-relaxed text-earth-dusk/80">
                                    You are on Free now. Start a Premium trial
                                    to list more places and unlock the full
                                    toolkit. No payment for three months.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={claimTrial}
                                disabled={trialBusy}
                                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-sm bg-olive-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-olive-800 disabled:opacity-60"
                            >
                                <UpgradePlansMark className="h-4 w-4" />
                                {trialBusy ? 'Starting…' : 'Start free trial'}
                            </button>
                        </div>
                    </section>
                ) : null}

                <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                    <MetricCard label="Plan">
                        <p className="font-display text-2xl font-semibold text-olive-950 dark:text-olive-50">
                            {plan.label}
                        </p>
                    </MetricCard>
                    <MetricCard label="Listings" href={route('account.listings.index')}>
                        <p className="inline-flex items-center gap-2 font-display text-2xl font-semibold tabular-nums text-olive-950 dark:text-olive-50">
                            <ListMark className="h-5 w-5 text-olive-700 dark:text-olive-300" />
                            {plan.listings_used}
                            <span className="text-base font-normal text-olive-500 dark:text-olive-500">
                                {plan.unlimited_listings
                                    ? ' · Unlimited'
                                    : `/${plan.listing_limit}`}
                            </span>
                        </p>
                    </MetricCard>
                    <MetricCard label="Bookmarks" href={route('account.bookmarks')}>
                        <p className="inline-flex items-center gap-2 font-display text-2xl font-semibold tabular-nums text-olive-950 dark:text-olive-50">
                            <BookmarkMark
                                className="h-5 w-5 text-olive-700 dark:text-olive-300"
                                filled
                            />
                            {bookmarksCount}
                        </p>
                    </MetricCard>
                </section>

                <section className="border border-olive-900/15 bg-white dark:border-olive-800 dark:bg-olive-900">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-olive-900/10 px-4 py-4 sm:px-5 dark:border-olive-800">
                        <div>
                            <h2 className="font-display text-base font-semibold text-olive-950 dark:text-olive-50">
                                Plan usage
                            </h2>
                            <p className="mt-0.5 text-sm text-olive-600 dark:text-olive-400">
                                {plan.is_expired
                                    ? `Plan expired. You’re on Free until you renew${plan.label ? ` ${plan.label}` : ''}. Listings stay saved and go live again after renewal.`
                                    : plan.is_trial && plan.scheduled_plan_label
                                      ? `${plan.days_remaining != null ? `${plan.days_remaining} day${plan.days_remaining === 1 ? '' : 's'} left on your Premium trial. ` : ''}${plan.scheduled_plan_label} starts ${plan.scheduled_plan_at ? new Date(plan.scheduled_plan_at).toLocaleDateString() : 'after the trial'}.`
                                      : plan.is_trial && plan.days_remaining != null
                                      ? `${plan.days_remaining} day${plan.days_remaining === 1 ? '' : 's'} left on your Premium trial. Upgrade anytime to keep Premium after it ends.`
                                      : plan.is_trial && plan.expires_at
                                        ? `Premium trial ends ${new Date(plan.expires_at).toLocaleDateString()}`
                                      : plan.status === 'expiring_soon' && plan.days_remaining != null
                                      ? `${plan.days_remaining} day${plan.days_remaining === 1 ? '' : 's'} left. Renew to keep listings visible.`
                                      : plan.expires_at
                                        ? `${plan.days_remaining != null ? `${plan.days_remaining} days left · ` : ''}Renews ${new Date(plan.expires_at).toLocaleDateString()}`
                                        : 'Free plan limits apply'}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {plan.can_renew && !pendingUpgrade ? (
                                <Link
                                    href={route('account.upgrade', {
                                        plan: plan.renew_plan,
                                        billing: plan.renew_billing_period || 'month',
                                        renew: 1,
                                    })}
                                    className="inline-flex items-center gap-1.5 rounded-sm border border-mustard bg-mustard px-4 py-2 text-sm font-semibold text-earth-dusk transition hover:bg-olive-900 hover:text-white dark:hover:bg-olive-100 dark:hover:text-earth-dusk"
                                >
                                    <UpgradePlansMark className="h-4 w-4" />
                                    Renew plan
                                </Link>
                            ) : null}
                            {(plan.key !== 'premium' || plan.is_trial) &&
                            !plan.is_expired &&
                            !pendingUpgrade ? (
                                <Link
                                    href={route('account.upgrade')}
                                    className={`inline-flex items-center gap-1.5 rounded-sm px-4 py-2 text-sm font-semibold transition ${
                                        plan.can_renew && !plan.is_trial
                                            ? 'border border-olive-900/20 bg-white text-olive-900 hover:border-olive-900/40 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-100'
                                            : 'border border-mustard bg-mustard text-earth-dusk hover:bg-olive-900 hover:text-white dark:hover:bg-olive-100 dark:hover:text-earth-dusk'
                                    }`}
                                >
                                    <UpgradePlansMark className="h-4 w-4" />
                                    {plan.is_trial
                                        ? 'Keep Premium'
                                        : plan.can_renew
                                          ? 'Change plan'
                                          : 'Upgrade plan'}
                                </Link>
                            ) : null}
                        </div>
                    </div>
                    <div className="px-4 py-4 sm:px-5">
                        <div className="h-1.5 overflow-hidden bg-olive-100 dark:bg-olive-800">
                            <div
                                className="h-full bg-olive-900 transition-all dark:bg-mustard"
                                style={{ width: `${usedPct}%` }}
                            />
                        </div>
                        {pendingUpgrade && (
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border border-olive-900/10 bg-earth-sand px-3 py-2.5 text-sm text-olive-800 dark:border-olive-800 dark:bg-olive-950 dark:text-olive-200">
                                <span>
                                    {isAwaitingMpesaPrompt(pendingUpgrade) ? (
                                        <>
                                            <strong>M-Pesa prompt sent</strong> for{' '}
                                            <strong>{pendingUpgrade.to_label}</strong>.
                                            Check your phone and enter your PIN.
                                        </>
                                    ) : (
                                        <PendingPaymentSummary upgrade={pendingUpgrade} />
                                    )}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.post(
                                            route('account.upgrade.cancel', pendingUpgrade.id),
                                        )
                                    }
                                    className="font-semibold text-rose-700 hover:underline dark:text-rose-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AccountLayout>
    );
}
