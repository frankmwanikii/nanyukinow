import { CategoryPicker } from '@/Components/pricing/CategoryPricingBreakdown';
import AccountLayout, { stashAccountFlash } from '@/Layouts/AccountLayout';
import {
    categoryInclusionsForPlan,
    getPricingCategoryBreakdown,
    normalizePlanKey,
} from '@/data/pricingCategoryBreakdown';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import CloseButton from '@/Components/site/CloseButton';
import { Check, ChevronDown, RefreshCw, Send } from '@/Components/site/LucideCompat';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    isAwaitingMpesaPrompt,
    memberFacingPaymentReference,
} from '@/utils/paymentReference';
import { openPaystackCardCheckout } from '@/utils/paystackInline';

const PENDING_WAIT_SECONDS = 5;
const PENDING_PAY_SECONDS = 30;

function httpClient() {
    return window.axios || axios;
}

function isLivePendingPayment(upgrade, emphasizeStk = false) {
    if (!upgrade) {
        return false;
    }

    const method = upgrade.payment_method || 'mpesa';
    if (method === 'paypal' || method === 'paystack') {
        return true;
    }

    return emphasizeStk || isAwaitingMpesaPrompt(upgrade);
}

function PendingPaymentBanner({ upgrade, emphasizeStk = false }) {
    const live = isLivePendingPayment(upgrade, emphasizeStk);
    const visibleRef = memberFacingPaymentReference(upgrade.payment_reference);
    const method = upgrade.payment_method || 'mpesa';
    const isPaypal = method === 'paypal';
    const isPaystack = method === 'paystack';
    const [phase, setPhase] = useState(live ? 'wait' : 'review');
    const [waitLeft, setWaitLeft] = useState(PENDING_WAIT_SECONDS);
    const [payLeft, setPayLeft] = useState(PENDING_PAY_SECONDS);
    const [timingOut, setTimingOut] = useState(false);
    const stoppedRef = useRef(false);

    useEffect(() => {
        stoppedRef.current = false;
        if (live) {
            setPhase('wait');
            setWaitLeft(PENDING_WAIT_SECONDS);
            setPayLeft(PENDING_PAY_SECONDS);
            setTimingOut(false);
        } else {
            setPhase('review');
        }

        return () => {
            stoppedRef.current = true;
        };
    }, [upgrade?.id, live]);

    useEffect(() => {
        if (!live || phase !== 'wait') {
            return undefined;
        }

        const tick = window.setInterval(() => {
            setWaitLeft((seconds) => {
                if (seconds <= 1) {
                    window.clearInterval(tick);
                    setPhase('pay');
                    return 0;
                }

                return seconds - 1;
            });
        }, 1000);

        return () => window.clearInterval(tick);
    }, [live, phase, upgrade?.id]);

    useEffect(() => {
        if (!live || phase !== 'pay') {
            return undefined;
        }

        setPayLeft(PENDING_PAY_SECONDS);

        const checkStatus = async () => {
            if (stoppedRef.current) {
                return;
            }

            try {
                const { data } = await httpClient().get(
                    route('account.upgrade.status'),
                );
                if (stoppedRef.current) {
                    return;
                }
                if (data?.status === 'pending' || data?.status === 'none') {
                    return;
                }

                stoppedRef.current = true;
                if (data.status === 'approved') {
                    stashAccountFlash(
                        data.message ||
                            'Payment approved. Your plan is now active.',
                    );
                    window.location.assign(route('account.billing'));
                    return;
                }

                stashAccountFlash(
                    data.message ||
                        (data.status === 'cancelled'
                            ? 'The payment was cancelled or timed out. You can try again.'
                            : 'Your upgrade request was not approved. You can try again.'),
                    'error',
                );
                window.location.assign(route('account.upgrade'));
            } catch {
                // Keep waiting until the pay window ends.
            }
        };

        checkStatus();
        const poll = window.setInterval(checkStatus, 3000);
        const tick = window.setInterval(() => {
            setPayLeft((seconds) => {
                if (seconds <= 1) {
                    window.clearInterval(tick);
                    window.clearInterval(poll);
                    return 0;
                }

                return seconds - 1;
            });
        }, 1000);

        return () => {
            window.clearInterval(poll);
            window.clearInterval(tick);
        };
    }, [live, phase, upgrade?.id]);

    useEffect(() => {
        if (!live || phase !== 'pay' || payLeft > 0 || timingOut) {
            return undefined;
        }

        let cancelled = false;

        const timeoutPayment = async () => {
            setTimingOut(true);
            try {
                await httpClient().post(
                    route('account.upgrade.cancel', upgrade.id),
                );
            } catch {
                // Still send the member back to retry.
            }
            if (cancelled || stoppedRef.current) {
                return;
            }
            stoppedRef.current = true;
            stashAccountFlash(
                'Payment timed out. Start the payment again to continue.',
                'error',
            );
            window.location.assign(route('account.upgrade'));
        };

        timeoutPayment();

        return () => {
            cancelled = true;
        };
    }, [live, phase, payLeft, timingOut, upgrade?.id]);

    if (!live) {
        return (
            <div className="border border-mustard/40 bg-mustard/15 px-4 py-3 text-sm text-earth-dusk dark:border-mustard/30 dark:bg-mustard/10 dark:text-mustard">
                Pending payment for <strong>{upgrade.to_label}</strong> via{' '}
                <strong className="capitalize">
                    {upgrade.payment_method || 'mpesa'}
                </strong>
                {visibleRef ? <> (ref {visibleRef})</> : null}. Cancel it from
                your dashboard if you need to submit a new one.
            </div>
        );
    }

    const countdown = phase === 'wait' ? waitLeft : payLeft;
    const total = phase === 'wait' ? PENDING_WAIT_SECONDS : PENDING_PAY_SECONDS;
    const progress = Math.max(0, Math.min(100, (countdown / total) * 100));
    const title = isPaypal
        ? 'Complete PayPal checkout'
        : isPaystack
          ? 'Paystack prompt sent'
          : 'M-Pesa prompt sent';
    const body = isPaypal
        ? `Finish checkout for ${upgrade.to_label} in the PayPal window.`
        : `Check your phone and enter your PIN to finish paying for ${upgrade.to_label}.`;
    const statusLine =
        phase === 'wait'
            ? `Waiting ${countdown} second${countdown === 1 ? '' : 's'} before we check payment status.`
            : timingOut
              ? 'Time is up. Cancelling this attempt…'
              : `Approve within ${countdown} second${countdown === 1 ? '' : 's'} or you will need to start again.`;

    return (
        <div
            className="overflow-hidden border border-mustard/50 bg-gradient-to-br from-mustard/20 via-mustard/10 to-olive-50 px-4 py-4 text-earth-dusk shadow-soft dark:border-mustard/30 dark:from-mustard/15 dark:via-olive-950 dark:to-olive-950 dark:text-mustard dark:shadow-none sm:px-5"
            role="status"
            aria-live="polite"
        >
            <div className="flex items-start gap-4">
                <div
                    className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border-2 border-mustard/70 bg-white/90 dark:border-mustard/50 dark:bg-olive-900"
                    aria-hidden
                >
                    <span className="font-display text-xl font-semibold tabular-nums text-olive-950 dark:text-mustard">
                        {String(Math.max(0, countdown)).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-olive-500 dark:text-olive-400">
                        sec
                    </span>
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-semibold tracking-tight text-olive-950 dark:text-mustard sm:text-lg">
                        {title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-olive-800 dark:text-olive-200">
                        {body}
                    </p>
                    <p className="mt-2 text-sm font-medium text-olive-700 dark:text-olive-300">
                        {statusLine}
                    </p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-olive-900/10 dark:bg-olive-800">
                        <div
                            className="h-full rounded-full bg-mustard transition-[width] duration-1000 ease-linear motion-reduce:transition-none"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

const field =
    'w-full rounded-lg border border-olive-200 bg-white px-3.5 py-3 text-base text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-mustard focus:ring-2 focus:ring-mustard/30 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50 dark:placeholder:text-olive-500 dark:focus:border-mustard dark:focus:ring-mustard/30';
const labelCls = 'mb-1.5 block text-sm font-semibold text-olive-600 dark:text-olive-400';

function planRank(planKey) {
    const key = normalizePlanKey(planKey);
    if (key === 'premium') {
        return 2;
    }
    if (key === 'featured') {
        return 1;
    }
    return 0;
}

function formatMoney(amount, currency) {
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency || 'KES',
            maximumFractionDigits: 0,
        }).format(Number(amount) || 0);
    } catch {
        return `${currency || 'KES'} ${Number(amount || 0).toLocaleString()}`;
    }
}

function periodSuffix(period) {
    if (period === 'year') return '/year';
    if (period === 'one_time') return ' one-time';
    return '/mo';
}

function amountForPeriod(plan, period = 'month') {
    if (period === 'year') {
        if (plan.yearly_price_amount != null && plan.yearly_price_amount !== '') {
            return Number(plan.yearly_price_amount) || 0;
        }
        return (Number(plan.price_amount) || 0) * 10;
    }
    return Number(plan.price_amount) || 0;
}

function displayPrice(plan, period = 'month') {
    if (plan.price_label) return plan.price_label;
    const amount = amountForPeriod(plan, period);
    if (amount === 0) return 'Free';
    return formatMoney(amount, plan.currency);
}

function maxYearlySavings(plans = []) {
    let best = 0;
    plans.forEach((plan) => {
        const monthly = Number(plan.price_amount) || 0;
        if (monthly <= 0) return;
        const yearly = amountForPeriod(plan, 'year');
        if (yearly <= 0) return;
        const full = monthly * 12;
        if (yearly >= full) return;
        best = Math.max(best, Math.round(((full - yearly) / full) * 100));
    });
    return best;
}

function formatAmountOnly(amount) {
    const n = Number(amount) || 0;
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

function periodShort(period) {
    if (period === 'year') return '/ year';
    if (period === 'one_time') return ' one-time';
    return '/ month';
}

function MpesaIcon({ className = 'h-10 w-auto max-w-[9rem]' }) {
    return (
        <img
            src="/images/payments/mpesa-on-white.png"
            alt="M-Pesa"
            className={`object-contain ${className}`}
        />
    );
}

function PaypalIcon({ className = 'h-8 w-auto max-w-[9rem]' }) {
    return (
        <img
            src="/images/payments/paypal-on-white.png"
            alt="PayPal"
            className={`object-contain ${className}`}
        />
    );
}

function PaystackIcon({ className = 'h-7 w-auto' }) {
    return (
        <span
            className={`inline-flex items-center font-semibold tracking-tight text-[#0BA4DB] ${className}`}
        >
            Paystack
        </span>
    );
}

function MethodIcon({ method, className }) {
    if (method === 'paypal') {
        return <PaypalIcon className={className || 'h-8 w-auto max-w-[9rem]'} />;
    }
    if (method === 'paystack') {
        return <PaystackIcon className={className || 'text-base'} />;
    }
    return <MpesaIcon className={className || 'h-10 w-auto max-w-[9rem]'} />;
}

function BillingSwitcher({ value, onChange, savingsPercent = 0 }) {
    const yearly = value === 'year';

    return (
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
                type="button"
                onClick={() => onChange('month')}
                className={`text-sm font-semibold transition ${
                    !yearly
                        ? 'text-olive-950 dark:text-olive-50'
                        : 'text-olive-400 hover:text-olive-700 dark:text-olive-500 dark:hover:text-olive-300'
                }`}
            >
                Monthly
            </button>
            <button
                type="button"
                role="switch"
                aria-checked={yearly}
                aria-label="Billing period"
                onClick={() => onChange(yearly ? 'month' : 'year')}
                className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                    yearly ? 'bg-olive-800' : 'bg-olive-200 dark:bg-olive-700'
                }`}
            >
                <span
                    className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${
                        yearly ? 'translate-x-6' : 'translate-x-0'
                    }`}
                />
            </button>
            <button
                type="button"
                onClick={() => onChange('year')}
                className={`inline-flex items-center gap-2 text-sm font-semibold transition ${
                    yearly
                        ? 'text-olive-950 dark:text-olive-50'
                        : 'text-olive-400 hover:text-olive-700 dark:text-olive-500 dark:hover:text-olive-300'
                }`}
            >
                Yearly
                {savingsPercent > 0 ? (
                    <span className="rounded-full bg-mint/40 px-2 py-0.5 text-xs font-bold text-olive-800 dark:bg-mint/20 dark:text-mint">
                        save {savingsPercent}%
                    </span>
                ) : null}
            </button>
        </div>
    );
}

/**
 * Features accordion: open on desktop, collapsed on mobile.
 */
function PlanCardFeatures({ planName, listingLimit = null, inclusions, categoryLabel }) {
    const [open, setOpen] = useState(false);
    const listingLine =
        listingLimit == null
            ? null
            : `${listingLimit} listing${listingLimit === 1 ? '' : 's'} included`;

    return (
        <div className="mt-6 flex-1 border-t border-olive-100 pt-5 dark:border-olive-800">
            <button
                type="button"
                className="flex w-full items-center justify-between gap-3 py-1 text-left md:pointer-events-none md:hidden"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
            >
                <span className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                    Key features
                </span>
                <ChevronDown
                    className={`h-5 w-5 shrink-0 text-olive-400 transition ${
                        open ? 'rotate-180' : ''
                    }`}
                    strokeWidth={2}
                />
            </button>

            <div className={`${open ? 'mt-3 block' : 'hidden'} md:mt-0 md:block`}>
                <p className="mb-3 hidden text-sm font-semibold text-olive-900 dark:text-olive-100 md:block">
                    With {planName}, get:
                </p>
                {listingLine ? (
                    <p className="mb-4 text-sm font-semibold text-olive-800 dark:text-olive-200">
                        {listingLine}
                    </p>
                ) : null}
                <ul className="space-y-3">
                    {inclusions.length === 0 ? (
                        <li className="text-sm text-olive-600 dark:text-olive-400">
                            Core listing fields for {categoryLabel}.
                        </li>
                    ) : (
                        inclusions.map((item) => {
                            const isInherit = /^Everything in /i.test(item);
                            return (
                                <li
                                    key={item}
                                    className={`flex gap-3 text-sm leading-snug ${
                                        isInherit
                                            ? 'font-semibold text-olive-900 dark:text-olive-100'
                                            : 'text-olive-700 dark:text-olive-300'
                                    }`}
                                >
                                    <Check
                                        className="mt-0.5 h-4 w-4 shrink-0 text-olive-700 dark:text-olive-300"
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    />
                                    <span className="min-w-0 text-pretty pt-0.5">{item}</span>
                                </li>
                            );
                        })
                    )}
                </ul>
            </div>
        </div>
    );
}

function normalizeBillingPeriod(period) {
    if (period === 'year' || period === 'yearly' || period === 'annual') {
        return 'year';
    }
    if (period === 'month' || period === 'monthly') {
        return 'month';
    }
    return period || null;
}

function planCtaState(
    plan,
    currentPlan,
    pendingPlanKey,
    pendingBillingPeriod,
    viewingPeriod,
) {
    const sameTier =
        normalizePlanKey(currentPlan?.key) === normalizePlanKey(plan.key);
    const isFreeTier = normalizePlanKey(plan.key) === 'free';
    const ownedPeriod = currentPlan?.billing_period;
    const currentRank = planRank(currentPlan?.key);
    const thisRank = planRank(plan.key);
    const isLowerThanCurrent = currentRank > thisRank;
    const ownsThisPeriod =
        sameTier &&
        (isFreeTier ||
            ownedPeriod === 'year' ||
            (ownedPeriod === 'month' && viewingPeriod === 'month'));
    const needsYearlyUpgrade =
        sameTier &&
        !isFreeTier &&
        ownedPeriod === 'month' &&
        viewingPeriod === 'year';
    const pendingPeriod = normalizeBillingPeriod(pendingBillingPeriod);
    const viewPeriod = normalizeBillingPeriod(viewingPeriod);
    const isPendingTarget =
        pendingPlanKey != null &&
        normalizePlanKey(pendingPlanKey) === normalizePlanKey(plan.key) &&
        pendingPeriod != null &&
        viewPeriod != null &&
        pendingPeriod === viewPeriod;

    const onTrial = Boolean(currentPlan?.is_trial);
    let ctaLabel = plan.cta_label || 'Upgrade';
    let ctaDisabled = false;
    let canCheckout = false;

    if (isPendingTarget) {
        ctaLabel = 'Pending';
        ctaDisabled = true;
    } else if (onTrial && !isFreeTier) {
        ctaLabel = sameTier ? 'Subscribe' : (plan.cta_label || 'Choose plan');
        canCheckout = true;
    } else if (isLowerThanCurrent || isFreeTier) {
        ctaLabel = 'Included';
        ctaDisabled = true;
    } else if (needsYearlyUpgrade) {
        ctaLabel = 'Switch to yearly';
        canCheckout = true;
    } else if (ownsThisPeriod) {
        ctaLabel = 'Renew';
        canCheckout = true;
    } else {
        ctaLabel = plan.cta_label || 'Upgrade';
        canCheckout = true;
    }

    return {
        ctaLabel,
        ctaDisabled,
        canCheckout,
    };
}

function PlanCards({
    plans,
    currentPlan,
    pendingPlanKey = null,
    pendingBillingPeriod = null,
    onUpgrade,
    billing = 'month',
    inclusionsByPlan,
    categoryLabel,
}) {
    return (
        <div
            className={`mx-auto grid max-w-6xl gap-5 lg:items-stretch ${
                plans.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
            }`}
        >
            {plans.map((plan) => {
                const featured = Boolean(plan.is_highlighted);
                const period =
                    plan.billing_period === 'one_time' ? 'one_time' : billing;
                const amount = amountForPeriod(plan, period);
                const inclusions = inclusionsByPlan?.[normalizePlanKey(plan.key)] || [];
                const { ctaLabel, ctaDisabled, canCheckout } = planCtaState(
                    plan,
                    currentPlan,
                    pendingPlanKey,
                    pendingBillingPeriod,
                    period,
                );

                const ctaClass = ctaDisabled
                    ? 'mt-6 inline-flex w-full cursor-not-allowed items-center justify-center rounded-sm border border-olive-900/10 bg-olive-50 px-4 py-2.5 text-center text-sm font-semibold text-olive-400 dark:border-olive-800 dark:bg-olive-950/50 dark:text-olive-500'
                    : featured
                      ? 'mt-6 inline-flex w-full items-center justify-center rounded-sm bg-olive-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-mustard hover:text-earth-dusk dark:bg-mustard dark:text-earth-dusk dark:hover:bg-olive-100'
                      : 'mt-6 inline-flex w-full items-center justify-center rounded-sm border border-olive-900/20 bg-white px-4 py-2.5 text-center text-sm font-semibold text-olive-900 transition hover:border-olive-900/40 hover:bg-olive-50 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50 dark:hover:bg-olive-800';

                return (
                    <article
                        key={plan.id}
                        className={`relative flex flex-col border bg-white p-5 sm:p-6 dark:bg-olive-900 ${
                            featured
                                ? 'border-olive-900 dark:border-mustard'
                                : 'border-olive-900/15 dark:border-olive-800'
                        }`}
                    >
                        {featured ? (
                            <span className="absolute right-4 top-4 rounded-sm bg-mustard px-2 py-0.5 text-xs font-semibold text-earth-dusk">
                                Popular
                            </span>
                        ) : null}

                        <div className="flex items-baseline justify-between gap-3 pr-16">
                            <h3 className="font-display text-2xl font-semibold tracking-tight text-olive-950 dark:text-olive-50">
                                {plan.name}
                            </h3>
                        </div>

                        <div className="mt-3">
                            {(() => {
                                const label = String(plan.price_label || '').trim();
                                const showZero = amount === 0 || /^free$/i.test(label);
                                const customLabel =
                                    label && !/^free$/i.test(label) ? label : null;

                                if (customLabel) {
                                    return (
                                        <p className="text-2xl font-semibold tracking-tight text-olive-950 dark:text-olive-50">
                                            {customLabel}
                                        </p>
                                    );
                                }

                                return (
                                    <p className="flex flex-wrap items-baseline gap-x-1.5 tracking-tight text-olive-950 dark:text-olive-50">
                                        <span className="text-2xl font-semibold tabular-nums">
                                            {plan.currency || 'KES'}{' '}
                                            {showZero ? '0' : formatAmountOnly(amount)}
                                        </span>
                                        <span className="text-sm font-medium text-olive-500 dark:text-olive-400">
                                            {periodShort(period)}
                                        </span>
                                    </p>
                                );
                            })()}
                        </div>

                        <button
                            type="button"
                            disabled={ctaDisabled || !canCheckout}
                            onClick={() => canCheckout && onUpgrade(plan)}
                            className={ctaClass}
                        >
                            {ctaLabel}
                        </button>

                        <PlanCardFeatures
                            planName={plan.name}
                            listingLimit={plan.listing_limit}
                            inclusions={inclusions}
                            categoryLabel={categoryLabel}
                        />
                    </article>
                );
            })}
        </div>
    );
}

function CopyButton({ value, label = 'Copy' }) {
    const [copied, setCopied] = useState(false);
    if (!value) return null;

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(String(value));
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {
            /* ignore */
        }
    };

    return (
        <button
            type="button"
            onClick={copy}
            className="text-xs font-semibold text-olive-700 underline-offset-2 hover:underline dark:text-olive-300"
        >
            {copied ? 'Copied' : label}
        </button>
    );
}

/**
 * Checkout modal — live pay hits /account/upgrade/pay (PaymentGateway).
 * Offline path still submits a pending upgrade for admin review.
 */
function PaymentCheckout({
    plan,
    paymentMethods,
    upgradeContact,
    onClose,
    form,
    billing = 'month',
    isPeriodUpgrade = false,
}) {
    const method = form.data.payment_method;
    const [phone, setPhone] = useState('');
    const [paypalEmail, setPaypalEmail] = useState('');
    const [paystackPhone, setPaystackPhone] = useState('');
    const [paystackMode, setPaystackMode] = useState('mpesa');
    const [paypalMode, setPaypalMode] = useState('wallet');
    const [offlinePayment, setOfflinePayment] = useState(false);
    const [paying, setPaying] = useState(false);
    const [payError, setPayError] = useState(null);
    const [phoneError, setPhoneError] = useState('');
    const [emailError, setEmailError] = useState('');
    const period = plan.billing_period === 'one_time' ? 'one_time' : billing;
    const amount = amountForPeriod(plan, period);
    const amountLabel = `${displayPrice(plan, period)}${
        !plan.price_label && amount > 0 ? ` ${periodSuffix(period)}` : ''
    }`;
    const methodCount = Math.max(paymentMethods?.length || 2, 1);

    const referenceLabel =
        method === 'paypal'
            ? 'PayPal transaction ID'
            : method === 'paystack'
              ? 'Paystack reference'
              : 'M-Pesa confirmation code';
    const referenceHint =
        method === 'paypal'
            ? 'e.g. 8AB12345XY678901A'
            : method === 'paystack'
              ? 'e.g. nnup_12_ab12cd'
              : 'e.g. QJX7ABC123';

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const selectMethod = (value) => {
        form.setData('payment_method', value);
        form.setData('payment_reference', '');
        form.clearErrors('payment_method', 'payment_reference');
        setOfflinePayment(false);
        setPayError(null);
        setPhoneError('');
        setEmailError('');
        if (value !== 'paypal') {
            setPaypalMode('wallet');
        }
        if (value !== 'paystack') {
            setPaystackPhone('');
            setPaystackMode('mpesa');
        }
    };

    const buildNotes = () => {
        const bits = [];
        if (method === 'mpesa' && phone.trim()) {
            bits.push(`Phone: ${phone.trim()}`);
        }
        if (method === 'paypal' && paypalEmail.trim()) {
            bits.push(`PayPal email: ${paypalEmail.trim()}`);
        }
        if (method === 'paystack') {
            bits.push(
                paystackMode === 'card'
                    ? 'Paystack: card'
                    : 'Paystack: M-Pesa',
            );
            if (paystackMode !== 'card' && paystackPhone.trim()) {
                bits.push(`Paystack phone: ${paystackPhone.trim()}`);
            }
        }
        if (form.data.member_notes?.trim()) {
            bits.push(form.data.member_notes.trim());
        }
        return bits.join('\n');
    };

    const submitManualReview = (e) => {
        e.preventDefault();

        form.transform((data) => ({
            ...data,
            to_plan: plan.key,
            billing_period: data.billing_period || period,
            member_notes: buildNotes(),
        }));

        form.post(route('account.upgrade.store'), {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onFinish: () => {
                form.transform((data) => data);
            },
        });
    };

    const paymentPayload = () => ({
        // Always use the checkout card plan. Form state can lag on Renew auto-open.
        to_plan: plan.key,
        category: form.data.category || undefined,
        billing_period: form.data.billing_period || period,
        payment_method: method,
        amount,
        currency: plan.currency || 'KES',
        phone:
            method === 'mpesa'
                ? phone.trim()
                : method === 'paystack' && paystackMode !== 'card'
                  ? paystackPhone.trim()
                  : undefined,
        email:
            method === 'paypal' && paypalEmail.trim()
                ? paypalEmail.trim()
                : undefined,
        paypal_mode: method === 'paypal' ? paypalMode : undefined,
        paystack_mode: method === 'paystack' ? paystackMode : undefined,
        return_url:
            typeof window !== 'undefined'
                ? `${window.location.origin}/account/billing`
                : '/account/billing',
        cancel_url:
            typeof window !== 'undefined'
                ? `${window.location.origin}/account/upgrade`
                : '/account/upgrade',
    });

    const initiateLivePay = async () => {
        setPayError(null);
        setPhoneError('');
        setEmailError('');

        if (method === 'mpesa' && !phone.trim()) {
            setPhoneError('Enter the M-Pesa phone number to pay from.');
            return;
        }

        if (method === 'paypal' && paypalMode === 'wallet' && !paypalEmail.trim()) {
            setEmailError('Enter your PayPal email address.');
            return;
        }

        if (
            method === 'paystack' &&
            paystackMode !== 'card' &&
            !paystackPhone.trim()
        ) {
            setPhoneError('Enter the phone number to receive the Paystack prompt.');
            return;
        }

        setPaying(true);
        try {
            const client = window.axios || axios;
            const { data } = await client.post(
                route('account.upgrade.pay'),
                paymentPayload(),
            );
            if (
                method === 'paystack' &&
                paystackMode === 'card' &&
                data?.ok &&
                data?.access_code
            ) {
                try {
                    const paid = await openPaystackCardCheckout(data.access_code);
                    const reference =
                        paid.reference || data.provider_ref || '';
                    const returnUrl = new URL(
                        route('account.upgrade.paystack.return'),
                        window.location.origin,
                    );
                    if (reference) {
                        returnUrl.searchParams.set('reference', reference);
                    }
                    window.location.assign(returnUrl.toString());
                    return;
                } catch (popupErr) {
                    const cancelled =
                        popupErr?.message === 'Payment cancelled.';
                    setPayError(
                        cancelled
                            ? null
                            : popupErr?.message ||
                              'Card payment failed. Please try again.',
                    );
                    return;
                }
            }
            if (data?.checkout_url) {
                window.location.href = data.checkout_url;
                return;
            }
            if (data?.ok) {
                const url = new URL(
                    route('account.upgrade'),
                    window.location.origin,
                );
                url.searchParams.set('stk', '1');
                window.location.assign(url.toString());
                return;
            }
            setPayError(
                data?.message || 'Payment failed. Please try again.',
            );
        } catch (err) {
            const payload = err?.response?.data;
            const fieldError =
                payload?.errors?.phone?.[0] || payload?.errors?.email?.[0];
            setPayError(
                fieldError ||
                    payload?.message ||
                    'Payment failed. Please try again.',
            );
        } finally {
            setPaying(false);
        }
    };

    const handlePrimaryPay = (e) => {
        e.preventDefault();
        if (offlinePayment) {
            submitManualReview(e);
            return;
        }
        initiateLivePay();
    };

    return (
        <div className="fixed inset-0 z-[1400] flex items-end justify-center sm:items-center">
            <button
                type="button"
                aria-label="Close checkout"
                className="absolute inset-0 bg-olive-950/50 backdrop-blur-[3px]"
                onClick={onClose}
            />

            <div className="relative z-10 w-full max-w-xl sm:mx-8">
                <CloseButton
                    onClick={onClose}
                    size="lg"
                    className="absolute right-3 top-3 z-20 bg-white shadow-sm dark:bg-olive-900 sm:-right-12 sm:top-0"
                />

                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="checkout-title"
                    className="flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-olive-900 dark:shadow-none dark:ring-1 dark:ring-olive-800 sm:rounded-2xl"
                >
                    {/* Header */}
                    <div className="shrink-0 border-b border-olive-100 px-5 py-4 pr-14 dark:border-olive-800 sm:px-6 sm:pr-6">
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-olive-400 dark:text-olive-500">
                                Secure checkout
                            </p>
                            <h2
                                id="checkout-title"
                                className="mt-1 font-display text-xl font-semibold tracking-tight text-olive-950 dark:text-olive-50 sm:text-2xl"
                            >
                                {isPeriodUpgrade
                                    ? `Go yearly · ${plan.name}`
                                    : `Upgrade to ${plan.name}`}
                            </h2>
                        </div>
                    </div>

                    <form
                        onSubmit={handlePrimaryPay}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                        {/* Order summary */}
                        <div className="flex items-center justify-between gap-3 border border-olive-200 bg-[#f4f2ec] px-4 py-3.5 dark:border-olive-700 dark:bg-olive-950">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-olive-400 dark:text-olive-500">
                                    Due today
                                </p>
                                <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-olive-950 dark:text-olive-50">
                                    {displayPrice(plan, period)}
                                </p>
                            </div>
                            <div className="text-right text-sm text-olive-600 dark:text-olive-400">
                                <p className="font-semibold text-olive-900 dark:text-olive-100">{plan.name}</p>
                                <p className="text-xs text-olive-500 dark:text-olive-400">
                                    {plan.listing_limit} listing
                                    {plan.listing_limit === 1 ? '' : 's'}
                                    {!plan.price_label && amount > 0
                                        ? ` ${periodSuffix(period)}`
                                        : ''}
                                </p>
                            </div>
                        </div>

                        {/* Methods */}
                        <div>
                            <p className={labelCls}>Payment method</p>
                            <div
                                role="radiogroup"
                                aria-label="Payment method"
                                className={`grid gap-2 ${
                                    methodCount >= 3
                                        ? 'grid-cols-1 sm:grid-cols-3'
                                        : 'grid-cols-2'
                                }`}
                            >
                                {paymentMethods.map((opt) => {
                                    const active = method === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            role="radio"
                                            aria-checked={active}
                                            aria-label={opt.label}
                                            onClick={() => selectMethod(opt.value)}
                                            className={`flex min-h-[3.25rem] items-center justify-center rounded-xl border px-3 py-2.5 transition ${
                                                active
                                                    ? 'border-olive-900 bg-olive-900 text-white shadow-sm dark:border-mustard dark:bg-mustard dark:text-earth-dusk'
                                                    : 'border-olive-200 bg-olive-50/80 text-olive-600 hover:border-olive-300 hover:bg-white dark:border-olive-700 dark:bg-olive-950 dark:text-olive-300 dark:hover:border-olive-500'
                                            }`}
                                        >
                                            <MethodIcon
                                                method={opt.value}
                                                className={
                                                    opt.value === 'paypal'
                                                        ? `h-7 w-auto max-w-[6.5rem] ${active ? 'brightness-0 invert dark:invert-0 dark:brightness-100' : ''}`
                                                        : opt.value === 'paystack'
                                                          ? `text-sm sm:text-base ${active ? 'text-white dark:text-earth-dusk' : ''}`
                                                          : `h-8 w-auto max-w-[6.5rem] ${active ? 'brightness-0 invert dark:invert-0 dark:brightness-100' : ''}`
                                                }
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                            {form.errors.payment_method && (
                                <p className="mt-1.5 text-sm text-rose-600">
                                    {form.errors.payment_method}
                                </p>
                            )}
                        </div>

                        {/* Live pay fields */}
                        {method === 'mpesa' && !offlinePayment && (
                            <div>
                                <label className={labelCls} htmlFor="payer_phone">
                                    M-Pesa phone number
                                </label>
                                <input
                                    id="payer_phone"
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    className={field}
                                    value={phone}
                                    onChange={(e) => {
                                        setPhone(e.target.value);
                                        setPhoneError('');
                                        setPayError(null);
                                    }}
                                    placeholder="07XX XXX XXX"
                                    required
                                />
                                {phoneError && (
                                    <p className="mt-1.5 text-sm text-rose-600">{phoneError}</p>
                                )}
                            </div>
                        )}

                        {method === 'paystack' && !offlinePayment && (
                            <div className="space-y-4">
                                <div>
                                    <p className={labelCls}>Pay with</p>
                                    <div
                                        role="radiogroup"
                                        aria-label="Paystack checkout type"
                                        className="relative grid grid-cols-2 rounded-full bg-olive-100/90 p-1 dark:bg-olive-950 dark:ring-1 dark:ring-olive-700"
                                    >
                                        <span
                                            aria-hidden
                                            className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-sm ring-1 ring-olive-200/80 transition-transform duration-300 ease-out dark:bg-olive-800 dark:ring-olive-600 ${
                                                paystackMode === 'card'
                                                    ? 'translate-x-full'
                                                    : 'translate-x-0'
                                            }`}
                                        />
                                        {[
                                            { value: 'mpesa', label: 'M-Pesa' },
                                            { value: 'card', label: 'Card' },
                                        ].map((opt) => {
                                            const active = paystackMode === opt.value;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={active}
                                                    onClick={() => {
                                                        setPaystackMode(opt.value);
                                                        setPhoneError('');
                                                        setPayError(null);
                                                    }}
                                                    className={`relative z-10 rounded-full px-3 py-2.5 text-sm font-semibold transition ${
                                                        active
                                                            ? 'text-olive-950 dark:text-olive-50'
                                                            : 'text-olive-500 hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-100'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {paystackMode === 'card' ? (
                                        <p className="mt-2 text-xs leading-relaxed text-olive-500 dark:text-olive-400">
                                            A secure card window opens on this page.
                                            You stay on Nanyuki Now.
                                        </p>
                                    ) : null}
                                </div>

                                {paystackMode !== 'card' ? (
                                    <div>
                                        <label
                                            className={labelCls}
                                            htmlFor="payer_paystack_phone"
                                        >
                                            M-Pesa phone number
                                        </label>
                                        <input
                                            id="payer_paystack_phone"
                                            type="tel"
                                            inputMode="tel"
                                            autoComplete="tel"
                                            className={field}
                                            value={paystackPhone}
                                            onChange={(e) => {
                                                setPaystackPhone(e.target.value);
                                                setPhoneError('');
                                                setPayError(null);
                                            }}
                                            placeholder="07XX XXX XXX"
                                            required
                                        />
                                        <p className="mt-2 text-xs leading-relaxed text-olive-500 dark:text-olive-400">
                                            Stay on this page. Paystack will send an
                                            M-Pesa prompt to this number.
                                        </p>
                                        {phoneError && (
                                            <p className="mt-1.5 text-sm text-rose-600">
                                                {phoneError}
                                            </p>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {method === 'paypal' && !offlinePayment && (
                            <div className="space-y-4">
                                <div>
                                    <p className={labelCls}>Pay with</p>
                                    <div
                                        role="radiogroup"
                                        aria-label="PayPal checkout type"
                                        className="relative grid grid-cols-2 rounded-full bg-olive-100/90 p-1 dark:bg-olive-950 dark:ring-1 dark:ring-olive-700"
                                    >
                                        <span
                                            aria-hidden
                                            className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-sm ring-1 ring-olive-200/80 transition-transform duration-300 ease-out dark:bg-olive-800 dark:ring-olive-600 ${
                                                paypalMode === 'card'
                                                    ? 'translate-x-full'
                                                    : 'translate-x-0'
                                            }`}
                                        />
                                        {[
                                            { value: 'wallet', label: 'PayPal' },
                                            { value: 'card', label: 'Card' },
                                        ].map((opt) => {
                                            const active = paypalMode === opt.value;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={active}
                                                    onClick={() => {
                                                        setPaypalMode(opt.value);
                                                        setEmailError('');
                                                        setPayError(null);
                                                    }}
                                                    className={`relative z-10 rounded-full px-3 py-2.5 text-sm font-semibold transition ${
                                                        active
                                                            ? 'text-olive-950 dark:text-olive-50'
                                                            : 'text-olive-500 hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-100'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {paypalMode === 'card' ? (
                                        <p className="mt-2 text-xs leading-relaxed text-olive-500 dark:text-olive-400">
                                            Enter card details on PayPal's secure page. A
                                            PayPal account is not required.
                                        </p>
                                    ) : null}
                                </div>

                                {paypalMode === 'wallet' ? (
                                    <div>
                                        <label
                                            className={labelCls}
                                            htmlFor="payer_paypal_email"
                                        >
                                            PayPal email
                                        </label>
                                        <input
                                            id="payer_paypal_email"
                                            type="email"
                                            inputMode="email"
                                            autoComplete="email"
                                            className={field}
                                            value={paypalEmail}
                                            onChange={(e) => {
                                                setPaypalEmail(e.target.value);
                                                setEmailError('');
                                                setPayError(null);
                                            }}
                                            placeholder="you@email.com"
                                            required
                                        />
                                        {emailError && (
                                            <p className="mt-1.5 text-sm text-rose-600">
                                                {emailError}
                                            </p>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {payError && !offlinePayment && (
                            <div className="flex flex-wrap items-center justify-between gap-3 border border-rose-200 bg-rose-50 px-3.5 py-3 dark:border-rose-900 dark:bg-rose-950/40">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                                        Payment failed
                                    </p>
                                    <p className="mt-0.5 text-sm text-rose-700 dark:text-rose-400">{payError}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={initiateLivePay}
                                    disabled={paying}
                                    className="inline-flex shrink-0 items-center gap-1.5 bg-rose-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-800 disabled:opacity-60"
                                >
                                    <RefreshCw
                                        className={`h-3.5 w-3.5 ${paying ? 'animate-spin' : ''}`}
                                    />
                                    Retry again
                                </button>
                            </div>
                        )}

                        {/* Offline payment — steps + details + confirmation */}
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setOfflinePayment((open) => {
                                        if (open) {
                                            form.setData('payment_reference', '');
                                            form.clearErrors('payment_reference');
                                        } else {
                                            setPayError(null);
                                        }
                                        return !open;
                                    });
                                }}
                                className={`flex w-full items-center justify-between gap-3 border px-3.5 py-3 text-left transition ${
                                    offlinePayment
                                        ? 'border-olive-900 bg-[#f4f2ec] dark:border-mustard/50 dark:bg-olive-950'
                                        : 'border-olive-200 hover:border-olive-300 dark:border-olive-700 dark:hover:border-olive-600'
                                }`}
                            >
                                <span>
                                    <span className="block text-sm font-semibold text-olive-950 dark:text-olive-50">
                                        Offline payment
                                    </span>
                                    <span className="mt-0.5 block text-xs text-olive-500 dark:text-olive-400">
                                        {method === 'mpesa'
                                            ? 'Pay via Lipa na M-Pesa, then enter your code'
                                            : method === 'paystack'
                                              ? 'Pay via Paystack, then enter your reference'
                                              : 'Pay via PayPal, then enter your transaction ID'}
                                    </span>
                                </span>
                                <span
                                    className={`text-xs font-bold uppercase tracking-wide ${
                                        offlinePayment
                                            ? 'text-olive-900 dark:text-mustard'
                                            : 'text-olive-400 dark:text-olive-500'
                                    }`}
                                >
                                    {offlinePayment ? 'Hide' : 'Open'}
                                </span>
                            </button>

                            {offlinePayment && (
                                <div className="space-y-4 border border-olive-200 p-4 dark:border-olive-700">
                                    {method === 'mpesa' ? (
                                        <>
                                            <div>
                                                <p className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                                                    How to pay with M-Pesa
                                                </p>
                                                <ol className="mt-3 space-y-2.5">
                                                    {[
                                                        'Open M-Pesa on your phone',
                                                        'Choose Lipa na M-Pesa',
                                                        'Select Paybill (or Buy Goods / Till if shown)',
                                                        upgradeContact.mpesa_paybill
                                                            ? `Enter Business Number: ${upgradeContact.mpesa_paybill}`
                                                            : 'Enter the Business / Till number provided',
                                                        upgradeContact.mpesa_account
                                                            ? `Enter Account: ${upgradeContact.mpesa_account}`
                                                            : 'Enter Account as instructed',
                                                        `Enter Amount: ${amountLabel}`,
                                                        'Enter your M-Pesa PIN and confirm',
                                                        'Copy the confirmation code (e.g. QJX7…) and paste it below',
                                                    ].map((step, i) => (
                                                        <li
                                                            key={step}
                                                            className="flex gap-2.5 text-sm text-olive-800 dark:text-olive-200"
                                                        >
                                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-olive-900 text-[10px] font-bold text-white dark:bg-mustard dark:text-earth-dusk">
                                                                {i + 1}
                                                            </span>
                                                            <span className="min-w-0 leading-snug">
                                                                {step}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                {upgradeContact.mpesa_paybill && (
                                                    <div className="border border-olive-100 bg-[#f4f2ec] px-3 py-2.5 dark:border-olive-700 dark:bg-olive-950">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-olive-400 dark:text-olive-500">
                                                                Paybill / Till
                                                            </p>
                                                            <CopyButton
                                                                value={upgradeContact.mpesa_paybill}
                                                            />
                                                        </div>
                                                        <p className="mt-1 font-display text-lg font-semibold tabular-nums text-olive-950 dark:text-olive-50">
                                                            {upgradeContact.mpesa_paybill}
                                                        </p>
                                                    </div>
                                                )}
                                                {upgradeContact.mpesa_account && (
                                                    <div className="border border-olive-100 bg-[#f4f2ec] px-3 py-2.5 dark:border-olive-700 dark:bg-olive-950">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-olive-400 dark:text-olive-500">
                                                                Account
                                                            </p>
                                                            <CopyButton
                                                                value={upgradeContact.mpesa_account}
                                                            />
                                                        </div>
                                                        <p className="mt-1 font-display text-lg font-semibold text-olive-950 dark:text-olive-50">
                                                            {upgradeContact.mpesa_account}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <p className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                                                    How to pay with PayPal
                                                </p>
                                                <ol className="mt-3 space-y-2.5">
                                                    {[
                                                        'Open PayPal (app or paypal.com)',
                                                        'Send payment for the plan amount',
                                                        upgradeContact.paypal_email
                                                            ? `Send to: ${upgradeContact.paypal_email}`
                                                            : 'Send to the PayPal email provided',
                                                        'Copy your transaction ID and paste it below',
                                                    ].map((step, i) => (
                                                        <li
                                                            key={step}
                                                            className="flex gap-2.5 text-sm text-olive-800 dark:text-olive-200"
                                                        >
                                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-olive-900 text-[10px] font-bold text-white dark:bg-mustard dark:text-earth-dusk">
                                                                {i + 1}
                                                            </span>
                                                            <span className="min-w-0 leading-snug">
                                                                {step}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>
                                            {upgradeContact.paypal_email && (
                                                <div className="flex items-center justify-between gap-3 border border-olive-100 bg-[#f4f2ec] px-3 py-2.5 dark:border-olive-700 dark:bg-olive-950">
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-olive-400 dark:text-olive-500">
                                                            Send to
                                                        </p>
                                                        <p className="truncate font-semibold text-olive-950 dark:text-olive-50">
                                                            {upgradeContact.paypal_email}
                                                        </p>
                                                    </div>
                                                    <CopyButton
                                                        value={upgradeContact.paypal_email}
                                                    />
                                                </div>
                                            )}
                                            {upgradeContact.paypal_note && (
                                                <p className="text-xs text-olive-500 dark:text-olive-400">
                                                    {upgradeContact.paypal_note}
                                                </p>
                                            )}
                                        </>
                                    )}

                                    <div>
                                        <label className={labelCls} htmlFor="payment_reference">
                                            {referenceLabel}
                                        </label>
                                        <input
                                            id="payment_reference"
                                            className={field}
                                            value={form.data.payment_reference}
                                            onChange={(e) =>
                                                form.setData('payment_reference', e.target.value)
                                            }
                                            placeholder={referenceHint}
                                            required
                                            autoComplete="off"
                                            autoFocus
                                        />
                                        {form.errors.payment_reference && (
                                            <p className="mt-1.5 text-sm text-rose-600">
                                                {form.errors.payment_reference}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelCls} htmlFor="member_notes">
                                            Notes (optional)
                                        </label>
                                        <textarea
                                            id="member_notes"
                                            rows={2}
                                            className={field}
                                            value={form.data.member_notes}
                                            onChange={(e) =>
                                                form.setData('member_notes', e.target.value)
                                            }
                                            placeholder="Business name, extra details…"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {form.errors.to_plan && (
                            <p className="text-sm text-rose-600">{form.errors.to_plan}</p>
                        )}
                    </div>

                    {/* Sticky footer CTA */}
                    <div className="shrink-0 border-t border-olive-100 bg-white px-5 py-4 dark:border-olive-800 dark:bg-olive-900">
                        <button
                            type="submit"
                            disabled={
                                form.processing ||
                                paying ||
                                (offlinePayment && !form.data.payment_reference.trim())
                            }
                            className="inline-flex w-full items-center justify-center gap-2 bg-olive-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-mustard hover:text-earth-dusk disabled:cursor-not-allowed disabled:opacity-50 dark:bg-mustard dark:text-earth-dusk dark:hover:bg-olive-100"
                        >
                            {paying || form.processing ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            {form.processing
                                ? offlinePayment
                                    ? 'Submitting for verification…'
                                    : method === 'mpesa' ||
                                        (method === 'paystack' &&
                                            paystackMode !== 'card')
                                      ? 'Sending payment prompt…'
                                      : method === 'paystack' ||
                                          paypalMode === 'card'
                                        ? 'Opening card payment…'
                                        : 'Connecting to PayPal…'
                                : paying
                                  ? method === 'mpesa' ||
                                    (method === 'paystack' &&
                                        paystackMode !== 'card')
                                      ? 'Sending payment prompt…'
                                      : method === 'paystack' ||
                                          paypalMode === 'card'
                                        ? 'Opening card payment…'
                                        : 'Connecting to PayPal…'
                                  : offlinePayment
                                    ? method === 'mpesa'
                                        ? `Submit M-Pesa code · ${amountLabel}`
                                        : method === 'paystack'
                                          ? `Submit Paystack reference · ${amountLabel}`
                                          : `Submit PayPal ID · ${amountLabel}`
                                    : method === 'mpesa'
                                      ? `Pay with M-Pesa · ${amountLabel}`
                                      : method === 'paystack'
                                        ? paystackMode === 'card'
                                          ? `Pay with card · ${amountLabel}`
                                          : `Pay with M-Pesa · ${amountLabel}`
                                        : paypalMode === 'card'
                                          ? `Pay with card · ${amountLabel}`
                                          : `Pay with PayPal · ${amountLabel}`}
                        </button>
                        {offlinePayment && (
                            <p className="mt-2 text-center text-[11px] text-olive-400 dark:text-olive-500">
                                Plan activates after payment is verified
                            </p>
                        )}
                        {(form.errors.to_plan || form.errors.payment_method) && (
                            <p className="mt-2 text-center text-sm text-rose-600">
                                {form.errors.to_plan || form.errors.payment_method}
                            </p>
                        )}
                    </div>
                </form>
                </div>
            </div>
        </div>
    );
}

export default function Upgrade({
    plan,
    plans = [],
    plansByCategory = {},
    initialCategory = null,
    pendingUpgrade = null,
    paymentMethods = [],
    upgradeContact = {},
    initialBilling = 'month',
    initialPlan = null,
    forceRenew = false,
}) {
    const [checkoutPlan, setCheckoutPlan] = useState(null);
    const [categoryKey, setCategoryKey] = useState(
        () => initialCategory || null,
    );
    const [billing, setBilling] = useState(() => {
        if (initialBilling === 'year') {
            return 'year';
        }
        if (plan?.renew_billing_period === 'year' || plan?.billing_period === 'year') {
            return 'year';
        }
        return 'month';
    });
    const [didOpenRenewCheckout, setDidOpenRenewCheckout] = useState(false);

    const [stkSent] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return new URLSearchParams(window.location.search).get('stk') === '1';
    });

    const breakdown = useMemo(
        () => getPricingCategoryBreakdown(categoryKey),
        [categoryKey],
    );

    const categoryPlans = useMemo(() => {
        if (categoryKey && plansByCategory?.[categoryKey]?.length) {
            return plansByCategory[categoryKey];
        }
        if (categoryKey && plans.length) {
            return plans.filter((p) => p.category_key === categoryKey);
        }
        return plans;
    }, [categoryKey, plansByCategory, plans]);

    const inclusionsByPlan = useMemo(() => {
        if (!breakdown) {
            return {};
        }
        return {
            free: categoryInclusionsForPlan(breakdown.rows, 'free'),
            featured: categoryInclusionsForPlan(breakdown.rows, 'featured'),
            premium: categoryInclusionsForPlan(breakdown.rows, 'premium'),
        };
    }, [breakdown]);

    const savings = useMemo(() => maxYearlySavings(categoryPlans), [categoryPlans]);
    const showSwitcher = categoryPlans.some(
        (p) => Number(p.price_amount) > 0 && p.yearly_price_amount != null,
    );

    const defaultPaymentMethod = paymentMethods[0]?.value || 'mpesa';

    const form = useForm({
        to_plan: 'featured',
        category: categoryKey || null,
        billing_period: billing,
        payment_reference: '',
        payment_method: defaultPaymentMethod,
        member_notes: '',
    });

    const setBillingPeriod = (next) => {
        setBilling(next);
        form.setData('billing_period', next);
    };

    const selectCategory = (key) => {
        setCategoryKey(key);
        form.setData('category', key);
        setCheckoutPlan(null);
    };

    const clearCategory = () => {
        setCategoryKey(null);
        form.setData('category', null);
        setCheckoutPlan(null);
    };

    const openCheckout = (selected) => {
        form.setData({
            to_plan: selected.key,
            category: categoryKey || null,
            billing_period: billing,
            payment_reference: '',
            payment_method: paymentMethods[0]?.value || 'mpesa',
            member_notes: '',
        });
        form.clearErrors();
        setCheckoutPlan(selected);
    };

    useEffect(() => {
        if (didOpenRenewCheckout || pendingUpgrade || !forceRenew || !initialPlan) {
            return;
        }

        const target = (categoryPlans || []).find(
            (item) => normalizePlanKey(item.key) === normalizePlanKey(initialPlan),
        );

        if (!target || normalizePlanKey(target.key) === 'free') {
            return;
        }

        openCheckout(target);
        setDidOpenRenewCheckout(true);
    }, [
        categoryPlans,
        didOpenRenewCheckout,
        forceRenew,
        initialPlan,
        pendingUpgrade,
    ]);

    return (
        <AccountLayout title="Plans">
            <Head title="View plans" />

            <div className="space-y-8">
                {pendingUpgrade && (
                    <PendingPaymentBanner
                        upgrade={pendingUpgrade}
                        emphasizeStk={stkSent}
                    />
                )}

                {!breakdown ? (
                    <CategoryPicker
                        onSelect={selectCategory}
                        title="Choose a listing category to see plans"
                        description="Open a category to compare Free, Standard, and Premium for that type of listing."
                    />
                ) : (
                    <div className="space-y-8">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={clearCategory}
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-olive-700 transition hover:text-olive-950 dark:text-olive-300 dark:hover:text-olive-50"
                            >
                                ← All categories
                            </button>
                        </div>

                        <div className="mx-auto max-w-2xl text-center">
                            <p className="font-display text-xl font-semibold tracking-tight text-olive-950 dark:text-olive-50 sm:text-2xl">
                                {breakdown.label}
                            </p>
                            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-olive-950 dark:text-olive-50 sm:text-3xl">
                                Plans & inclusions
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-olive-600 dark:text-olive-400 sm:text-base">
                                Compare what each plan includes for this category.
                            </p>
                            {showSwitcher ? (
                                <div className="mt-6">
                                    <BillingSwitcher
                                        value={billing}
                                        onChange={setBillingPeriod}
                                        savingsPercent={savings}
                                    />
                                </div>
                            ) : null}
                        </div>

                        <PlanCards
                            plans={categoryPlans}
                            currentPlan={plan}
                            pendingPlanKey={pendingUpgrade?.to_plan ?? null}
                            pendingBillingPeriod={
                                pendingUpgrade?.billing_period ?? null
                            }
                            onUpgrade={openCheckout}
                            billing={billing}
                            inclusionsByPlan={inclusionsByPlan}
                            categoryLabel={breakdown.label}
                        />
                    </div>
                )}
            </div>

            {checkoutPlan && (
                <PaymentCheckout
                    key={`${checkoutPlan.key}-${billing}-${categoryKey || 'none'}`}
                    plan={checkoutPlan}
                    paymentMethods={paymentMethods}
                    upgradeContact={upgradeContact}
                    form={form}
                    billing={billing}
                    isPeriodUpgrade={
                        normalizePlanKey(checkoutPlan.key) ===
                            normalizePlanKey(plan.key) &&
                        plan.billing_period === 'month' &&
                        billing === 'year'
                    }
                    onClose={() => setCheckoutPlan(null)}
                />
            )}
        </AccountLayout>
    );
}
