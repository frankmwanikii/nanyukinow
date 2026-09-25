import AccountLayout from '@/Layouts/AccountLayout';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Check, RefreshCw, Send, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const field =
    'w-full rounded-lg border border-olive-200 bg-white px-3.5 py-3 text-base text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-mustard focus:ring-2 focus:ring-mustard/30 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50 dark:placeholder:text-olive-500 dark:focus:border-mustard dark:focus:ring-mustard/30';
const labelCls = 'mb-1.5 block text-sm font-semibold text-olive-600 dark:text-olive-400';

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

function BillingSwitcher({ value, onChange, savingsPercent = 0 }) {
    return (
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div
                role="radiogroup"
                aria-label="Billing period"
                className="relative inline-grid grid-cols-2 rounded-full bg-olive-100/90 p-1 dark:bg-olive-900 dark:ring-1 dark:ring-olive-700"
            >
                <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-sm ring-1 ring-olive-200/80 transition-transform duration-300 ease-out dark:bg-mustard dark:ring-mustard/40 ${
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
                            onClick={() => onChange(opt.id)}
                            className={`relative z-10 min-w-[6.5rem] rounded-full px-4 py-2 text-sm font-semibold transition ${
                                active
                                    ? 'text-olive-950 dark:text-earth-dusk'
                                    : 'text-olive-500 hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-100'
                            }`}
                        >
                            {opt.label}
                        </button>
                    );
                })}
            </div>
            {savingsPercent > 0 ? (
                <p className="text-sm font-medium text-olive-600 dark:text-olive-400">
                    Save up to{' '}
                    <span className="font-semibold text-earth-clay dark:text-mustard">
                        {savingsPercent}%
                    </span>{' '}
                    yearly
                </p>
            ) : null}
        </div>
    );
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

function MethodIcon({ method, className }) {
    if (method === 'paypal') {
        return <PaypalIcon className={className || 'h-8 w-auto max-w-[9rem]'} />;
    }
    return <MpesaIcon className={className || 'h-10 w-auto max-w-[9rem]'} />;
}

function planState(plan, currentKey, pending) {
    const isCurrent = currentKey === plan.key;
    const isFree = plan.key === 'free';
    const canUpgrade =
        !isFree &&
        !isCurrent &&
        !pending &&
        currentKey !== 'premium' &&
        !(currentKey === 'featured' && plan.key === 'featured');

    let ctaLabel = plan.cta_label || 'Get started';
    if (isCurrent) ctaLabel = 'Current plan';
    else if (isFree) ctaLabel = 'Included';
    else if (pending) ctaLabel = 'Pending';
    else if (canUpgrade) ctaLabel = 'Upgrade';

    return { isCurrent, isFree, canUpgrade, ctaLabel };
}

const TIER_ORDER = ['free', 'featured', 'premium'];

function planRank(plan) {
    const idx = TIER_ORDER.indexOf(plan?.key);
    return idx === -1 ? 99 : idx;
}

function sortPlans(plans = []) {
    return [...plans].sort((a, b) => {
        const byRank = planRank(a) - planRank(b);
        if (byRank !== 0) return byRank;
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });
}

function isMetaInclusion(item) {
    const text = String(item || '').trim();
    if (!text) return true;
    // Structural “inherits lower tier” notes — not real matrix rows
    if (/^everything in\b/i.test(text)) return true;
    // Listing counts come from listing_limit instead
    if (/^(up to\s+)?\d+\s+(free\s+)?listings?\b/i.test(text)) return true;
    if (/^\d+\s+free listing\b/i.test(text)) return true;
    // Broken / incomplete bullets
    if (/^listings?$/i.test(text)) return true;
    return false;
}

function cleanFeatureLabel(item) {
    const text = String(item || '').trim().replace(/\s+/g, ' ');
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Expand each plan’s inclusions so higher tiers inherit lower-tier features.
 * Skips meta lines like “Everything in Free”.
 */
function buildInclusionMatrix(plans) {
    const ordered = sortPlans(plans);
    const expanded = new Map(); // plan.key -> Set<feature>
    const introduction = new Map(); // feature -> plan.key that first added it
    const featureOrder = [];

    ordered.forEach((plan, index) => {
        const set = new Set();
        if (index > 0) {
            const prev = expanded.get(ordered[index - 1].key);
            prev?.forEach((f) => set.add(f));
        }

        (plan.inclusions || []).forEach((raw) => {
            if (isMetaInclusion(raw)) return;
            const feature = cleanFeatureLabel(raw);
            if (!feature) return;
            if (!introduction.has(feature)) {
                introduction.set(feature, plan.key);
                featureOrder.push(feature);
            }
            set.add(feature);
        });

        expanded.set(plan.key, set);
    });

    return { ordered, expanded, featureOrder, introduction };
}

function MatrixCheck({ on }) {
    if (on) {
        return (
            <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-mint/35 text-olive-900 dark:bg-mint/20 dark:text-mint"
                aria-label="Included"
            >
                <Check className="h-3.5 w-3.5" strokeWidth={2.75} />
            </span>
        );
    }

    return (
        <span className="text-sm text-olive-300 dark:text-olive-600" aria-label="Not included">
            —
        </span>
    );
}

function InclusionMatrix({ plans, currentKey = null }) {
    const { ordered, expanded, featureOrder } = buildInclusionMatrix(plans);

    if (ordered.length === 0) return null;

    const hasFeatures = featureOrder.length > 0;
    const hasLimits = ordered.some((p) => Number(p.listing_limit) > 0);
    if (!hasFeatures && !hasLimits) return null;

    return (
        <div className="overflow-hidden rounded-2xl border border-olive-200/80 bg-white shadow-soft dark:border-olive-800 dark:bg-olive-900 dark:shadow-none">
            <div className="border-b border-olive-100 px-5 py-5 sm:px-6 dark:border-olive-800">
                <h2 className="font-display text-xl font-semibold tracking-tight text-olive-950 dark:text-olive-50">
                    What’s included
                </h2>
                <p className="mt-1 max-w-xl text-sm text-olive-500 dark:text-olive-400">
                    Higher plans include everything below them — so you only pay for the extras
                    you need.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-olive-100 dark:border-olive-800">
                            <th
                                scope="col"
                                className="sticky left-0 z-10 bg-white px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-olive-400 dark:bg-olive-900 dark:text-olive-500 sm:px-6"
                            >
                                Feature
                            </th>
                            {ordered.map((plan) => {
                                const isYours = currentKey && plan.key === currentKey;
                                return (
                                    <th
                                        key={plan.id || plan.key}
                                        scope="col"
                                        className={`px-4 py-3.5 text-center ${
                                            isYours
                                                ? 'bg-mustard/10 dark:bg-mustard/10'
                                                : ''
                                        }`}
                                    >
                                        <span className="block font-display text-sm font-semibold text-olive-950 dark:text-olive-50">
                                            {plan.name}
                                        </span>
                                        {isYours ? (
                                            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-mustard">
                                                Your plan
                                            </span>
                                        ) : null}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {hasLimits ? (
                            <tr className="border-b border-olive-100 dark:border-olive-800">
                                <th
                                    scope="row"
                                    className="sticky left-0 z-10 bg-earth-sand/50 px-5 py-3.5 text-left text-sm font-medium text-olive-800 dark:bg-olive-950/60 dark:text-olive-200 sm:px-6"
                                >
                                    Listings included
                                </th>
                                {ordered.map((plan) => {
                                    const isYours = currentKey && plan.key === currentKey;
                                    return (
                                        <td
                                            key={`limit-${plan.id || plan.key}`}
                                            className={`px-4 py-3.5 text-center ${
                                                isYours
                                                    ? 'bg-mustard/10 dark:bg-mustard/10'
                                                    : 'bg-earth-sand/50 dark:bg-olive-950/60'
                                            }`}
                                        >
                                            <span className="font-display text-base font-semibold tabular-nums text-olive-950 dark:text-olive-50">
                                                {plan.listing_limit ?? '—'}
                                            </span>
                                        </td>
                                    );
                                })}
                            </tr>
                        ) : null}

                        {featureOrder.map((feature, index) => {
                            const zebra = index % 2 === 0;
                            return (
                                <tr
                                    key={feature}
                                    className="border-b border-olive-100 last:border-b-0 dark:border-olive-800"
                                >
                                    <th
                                        scope="row"
                                        className={`sticky left-0 z-10 px-5 py-3.5 text-left text-sm font-medium text-olive-800 dark:text-olive-200 sm:px-6 ${
                                            zebra
                                                ? 'bg-white dark:bg-olive-900'
                                                : 'bg-olive-50/60 dark:bg-olive-950/40'
                                        }`}
                                    >
                                        {feature}
                                    </th>
                                    {ordered.map((plan) => {
                                        const isYours =
                                            currentKey && plan.key === currentKey;
                                        const has =
                                            expanded.get(plan.key)?.has(feature) ??
                                            false;
                                        return (
                                            <td
                                                key={`${plan.id || plan.key}-${feature}`}
                                                className={`px-4 py-3.5 text-center ${
                                                    isYours
                                                        ? 'bg-mustard/10 dark:bg-mustard/10'
                                                        : zebra
                                                          ? 'bg-white dark:bg-olive-900'
                                                          : 'bg-olive-50/60 dark:bg-olive-950/40'
                                                }`}
                                            >
                                                <div className="flex justify-center">
                                                    <MatrixCheck on={has} />
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap gap-4 border-t border-olive-100 px-5 py-3.5 text-xs text-olive-500 dark:border-olive-800 dark:text-olive-400 sm:px-6">
                <span className="inline-flex items-center gap-1.5">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-mint/35 dark:bg-mint/20">
                        <Check className="h-3 w-3 text-olive-900 dark:text-mint" strokeWidth={2.75} />
                    </span>
                    Included
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="text-olive-300 dark:text-olive-600">—</span>
                    Not on this plan
                </span>
            </div>
        </div>
    );
}

function PlansMatrix({ plans, currentKey, pending, onUpgrade, billing = 'month' }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-olive-200/80 bg-white shadow-soft dark:border-olive-800 dark:bg-olive-950 dark:shadow-none">
            <div
                className={`grid divide-olive-100 dark:divide-olive-800 lg:divide-x ${
                    plans.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
                }`}
            >
                {plans.map((plan) => {
                    const { isCurrent, canUpgrade, ctaLabel } = planState(
                        plan,
                        currentKey,
                        pending,
                    );
                    const featured = Boolean(plan.is_highlighted);
                    const period =
                        plan.billing_period === 'one_time' ? 'one_time' : billing;
                    const amount = amountForPeriod(plan, period);

                    return (
                        <article
                            key={plan.id}
                            className={`relative flex flex-col border-b border-olive-100 p-6 last:border-b-0 sm:p-7 lg:border-b-0 dark:border-olive-800 ${
                                featured
                                    ? 'bg-olive-950 text-white lg:scale-[1.01] lg:shadow-lift dark:bg-olive-800 dark:ring-1 dark:ring-inset dark:ring-mustard/35'
                                    : 'bg-white dark:bg-olive-900'
                            }`}
                        >
                            <div className="flex items-baseline justify-between gap-3">
                                <h2
                                    className={`font-display text-lg font-semibold tracking-tight ${
                                        featured
                                            ? 'text-white'
                                            : 'text-olive-950 dark:text-olive-50'
                                    }`}
                                >
                                    {plan.name}
                                </h2>
                                {featured ? (
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mustard">
                                        Popular
                                    </span>
                                ) : isCurrent ? (
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-olive-400 dark:text-olive-500">
                                        Yours
                                    </span>
                                ) : null}
                            </div>

                            {plan.tagline && (
                                <p
                                    className={`mt-2 text-sm leading-relaxed ${
                                        featured
                                            ? 'text-white/65'
                                            : 'text-olive-500 dark:text-olive-400'
                                    }`}
                                >
                                    {plan.tagline}
                                </p>
                            )}

                            <div className="mt-8">
                                <div className="flex items-baseline gap-1.5">
                                    <span
                                        className={`font-display text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl ${
                                            featured
                                                ? 'text-white'
                                                : 'text-olive-950 dark:text-olive-50'
                                        }`}
                                    >
                                        {displayPrice(plan, period)}
                                    </span>
                                    {!plan.price_label && amount > 0 && (
                                        <span
                                            className={`text-sm ${
                                                featured
                                                    ? 'text-white/55'
                                                    : 'text-olive-400 dark:text-olive-500'
                                            }`}
                                        >
                                            {periodSuffix(period)}
                                        </span>
                                    )}
                                </div>
                                {period === 'year' && !plan.price_label && amount > 0 ? (
                                    <p
                                        className={`mt-1 text-xs ${
                                            featured
                                                ? 'text-white/50'
                                                : 'text-olive-400 dark:text-olive-500'
                                        }`}
                                    >
                                        {formatMoney(Math.round(amount / 12), plan.currency)}
                                        /mo billed yearly
                                    </p>
                                ) : null}
                                <p
                                    className={`mt-2 text-sm font-medium ${
                                        featured
                                            ? 'text-mustard'
                                            : 'text-olive-700 dark:text-olive-300'
                                    }`}
                                >
                                    {plan.listing_limit} listing
                                    {plan.listing_limit === 1 ? '' : 's'} included
                                </p>
                            </div>

                            <ul
                                className={`mt-8 flex-1 space-y-2.5 border-t border-dashed pt-6 ${
                                    featured
                                        ? 'border-white/15'
                                        : 'border-olive-200/80 dark:border-olive-700'
                                }`}
                            >
                                {(plan.inclusions || [])
                                    .filter((item) => !isMetaInclusion(item))
                                    .map((item) => (
                                        <li
                                            key={item}
                                            className={`flex gap-2.5 text-sm leading-snug ${
                                                featured
                                                    ? 'text-white/80'
                                                    : 'text-olive-700 dark:text-olive-200'
                                            }`}
                                        >
                                            <Check
                                                className={`mt-0.5 h-4 w-4 shrink-0 ${
                                                    featured
                                                        ? 'text-mustard'
                                                        : 'text-olive-800 dark:text-mustard'
                                                }`}
                                                strokeWidth={2.25}
                                            />
                                            <span>{cleanFeatureLabel(item)}</span>
                                        </li>
                                    ))}
                            </ul>

                            <button
                                type="button"
                                disabled={!canUpgrade}
                                onClick={() => canUpgrade && onUpgrade(plan)}
                                className={`mt-8 w-full rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition disabled:cursor-not-allowed ${
                                    canUpgrade
                                        ? featured
                                            ? 'nn-upgrade-glow bg-mustard text-earth-dusk hover:bg-white'
                                            : 'bg-olive-900 text-white hover:bg-mustard hover:text-earth-dusk dark:bg-mustard dark:text-earth-dusk dark:hover:bg-olive-100'
                                        : isCurrent
                                          ? featured
                                              ? 'border border-white/25 text-white'
                                              : 'border border-olive-200 text-olive-500 dark:border-olive-700 dark:text-olive-400'
                                          : featured
                                            ? 'border border-white/15 text-white/45'
                                            : 'border border-olive-100 text-olive-400 dark:border-olive-800 dark:text-olive-600'
                                }`}
                            >
                                {ctaLabel}
                            </button>
                        </article>
                    );
                })}
            </div>
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
            className="text-xs font-semibold text-olive-700 underline-offset-2 hover:underline"
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
}) {
    const method = form.data.payment_method;
    const [phone, setPhone] = useState('');
    const [paypalEmail, setPaypalEmail] = useState('');
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

    const referenceLabel =
        method === 'paypal' ? 'PayPal transaction ID' : 'M-Pesa confirmation code';
    const referenceHint =
        method === 'paypal' ? 'e.g. 8AB12345XY678901A' : 'e.g. QJX7ABC123';

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
    };

    const buildNotes = () => {
        const bits = [];
        if (method === 'mpesa' && phone.trim()) {
            bits.push(`Phone: ${phone.trim()}`);
        }
        if (method === 'paypal' && paypalEmail.trim()) {
            bits.push(`PayPal email: ${paypalEmail.trim()}`);
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
        to_plan: form.data.to_plan || plan.key,
        billing_period: form.data.billing_period || period,
        payment_method: method,
        amount,
        currency: plan.currency || 'KES',
        phone: method === 'mpesa' ? phone.trim() : undefined,
        email: method === 'paypal' ? paypalEmail.trim() : undefined,
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

        if (method === 'paypal' && !paypalEmail.trim()) {
            setEmailError('Enter your PayPal email address.');
            return;
        }

        setPaying(true);
        try {
            const { data } = await axios.post(route('account.upgrade.pay'), paymentPayload());
            if (data?.checkout_url) {
                window.location.href = data.checkout_url;
                return;
            }
            if (data?.ok) {
                onClose();
                return;
            }
            setPayError('Please try again.');
        } catch (err) {
            const fieldError =
                err?.response?.data?.errors?.phone?.[0] ||
                err?.response?.data?.errors?.email?.[0];
            setPayError(fieldError || 'Please try again.');
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

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="checkout-title"
                className="relative z-10 flex max-h-[94vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:mx-4 sm:rounded-2xl"
            >
                {/* Header */}
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-olive-100 px-5 py-4">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-olive-400">
                            Secure checkout
                        </p>
                        <h2
                            id="checkout-title"
                            className="mt-1 font-display text-xl font-semibold tracking-tight text-olive-950"
                        >
                            Upgrade to {plan.name}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-olive-500 transition hover:bg-olive-50 hover:text-olive-900"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form
                    onSubmit={handlePrimaryPay}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
                        {/* Order summary */}
                        <div className="flex items-center justify-between gap-3 border border-olive-200 bg-[#f4f2ec] px-4 py-3.5">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-olive-400">
                                    Due today
                                </p>
                                <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-olive-950">
                                    {displayPrice(plan, period)}
                                </p>
                            </div>
                            <div className="text-right text-sm text-olive-600">
                                <p className="font-semibold text-olive-900">{plan.name}</p>
                                <p className="text-xs text-olive-500">
                                    {plan.listing_limit} listing
                                    {plan.listing_limit === 1 ? '' : 's'}
                                    {!plan.price_label && amount > 0
                                        ? ` ${periodSuffix(period)}`
                                        : ''}
                                </p>
                            </div>
                        </div>

                        {/* Methods — sliding segmented toggle */}
                        <div>
                            <p className={labelCls}>Payment method</p>
                            <div
                                role="radiogroup"
                                aria-label="Payment method"
                                className="relative grid grid-cols-2 rounded-full bg-olive-100/90 p-1"
                            >
                                <span
                                    aria-hidden
                                    className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-sm ring-1 ring-olive-200/80 transition-transform duration-300 ease-out ${
                                        method === 'paypal' ? 'translate-x-full' : 'translate-x-0'
                                    }`}
                                />
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
                                            className={`relative z-10 flex items-center justify-center rounded-full px-3 py-3 transition ${
                                                active
                                                    ? 'text-olive-950'
                                                    : 'text-olive-500 hover:text-olive-800'
                                            }`}
                                        >
                                            <MethodIcon
                                                method={opt.value}
                                                className={
                                                    opt.value === 'paypal'
                                                        ? 'h-7 w-auto max-w-[6.5rem]'
                                                        : 'h-8 w-auto max-w-[6.5rem]'
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

                        {method === 'paypal' && !offlinePayment && (
                            <div>
                                <label className={labelCls} htmlFor="payer_paypal_email">
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
                                    <p className="mt-1.5 text-sm text-rose-600">{emailError}</p>
                                )}
                            </div>
                        )}

                        {payError && !offlinePayment && (
                            <div className="flex flex-wrap items-center justify-between gap-3 border border-rose-200 bg-rose-50 px-3.5 py-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-rose-800">
                                        Payment failed
                                    </p>
                                    <p className="mt-0.5 text-sm text-rose-700">{payError}</p>
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
                                        ? 'border-olive-900 bg-[#f4f2ec]'
                                        : 'border-olive-200 hover:border-olive-300'
                                }`}
                            >
                                <span>
                                    <span className="block text-sm font-semibold text-olive-950">
                                        Offline payment
                                    </span>
                                    <span className="mt-0.5 block text-xs text-olive-500">
                                        {method === 'mpesa'
                                            ? 'Pay via Lipa na M-Pesa, then enter your code'
                                            : 'Pay via PayPal, then enter your transaction ID'}
                                    </span>
                                </span>
                                <span
                                    className={`text-xs font-bold uppercase tracking-wide ${
                                        offlinePayment ? 'text-olive-900' : 'text-olive-400'
                                    }`}
                                >
                                    {offlinePayment ? 'Hide' : 'Open'}
                                </span>
                            </button>

                            {offlinePayment && (
                                <div className="space-y-4 border border-olive-200 p-4">
                                    {method === 'mpesa' ? (
                                        <>
                                            <div>
                                                <p className="text-sm font-semibold text-olive-950">
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
                                                            className="flex gap-2.5 text-sm text-olive-800"
                                                        >
                                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-olive-900 text-[10px] font-bold text-white">
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
                                                    <div className="border border-olive-100 bg-[#f4f2ec] px-3 py-2.5">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-olive-400">
                                                                Paybill / Till
                                                            </p>
                                                            <CopyButton
                                                                value={upgradeContact.mpesa_paybill}
                                                            />
                                                        </div>
                                                        <p className="mt-1 font-display text-lg font-semibold tabular-nums text-olive-950">
                                                            {upgradeContact.mpesa_paybill}
                                                        </p>
                                                    </div>
                                                )}
                                                {upgradeContact.mpesa_account && (
                                                    <div className="border border-olive-100 bg-[#f4f2ec] px-3 py-2.5">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-olive-400">
                                                                Account
                                                            </p>
                                                            <CopyButton
                                                                value={upgradeContact.mpesa_account}
                                                            />
                                                        </div>
                                                        <p className="mt-1 font-display text-lg font-semibold text-olive-950">
                                                            {upgradeContact.mpesa_account}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <p className="text-sm font-semibold text-olive-950">
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
                                                            className="flex gap-2.5 text-sm text-olive-800"
                                                        >
                                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-olive-900 text-[10px] font-bold text-white">
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
                                                <div className="flex items-center justify-between gap-3 border border-olive-100 bg-[#f4f2ec] px-3 py-2.5">
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-olive-400">
                                                            Send to
                                                        </p>
                                                        <p className="truncate font-semibold text-olive-950">
                                                            {upgradeContact.paypal_email}
                                                        </p>
                                                    </div>
                                                    <CopyButton
                                                        value={upgradeContact.paypal_email}
                                                    />
                                                </div>
                                            )}
                                            {upgradeContact.paypal_note && (
                                                <p className="text-xs text-olive-500">
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
                    <div className="shrink-0 border-t border-olive-100 bg-white px-5 py-4">
                        <button
                            type="submit"
                            disabled={
                                form.processing ||
                                paying ||
                                (offlinePayment && !form.data.payment_reference.trim())
                            }
                            className="inline-flex w-full items-center justify-center gap-2 bg-olive-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-mustard hover:text-earth-dusk disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {paying || form.processing ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            {form.processing
                                ? offlinePayment
                                    ? 'Submitting for verification…'
                                    : method === 'mpesa'
                                      ? 'Sending M-Pesa prompt…'
                                      : 'Connecting to PayPal…'
                                : paying
                                  ? method === 'mpesa'
                                      ? 'Sending M-Pesa prompt…'
                                      : 'Connecting to PayPal…'
                                  : offlinePayment
                                    ? method === 'mpesa'
                                        ? `Submit M-Pesa code · ${amountLabel}`
                                        : `Submit PayPal ID · ${amountLabel}`
                                    : method === 'mpesa'
                                      ? `Pay with M-Pesa · ${amountLabel}`
                                      : `Pay with PayPal · ${amountLabel}`}
                        </button>
                        {offlinePayment && (
                            <p className="mt-2 text-center text-[11px] text-olive-400">
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
    );
}

export default function Upgrade({
    plan,
    plans = [],
    pendingUpgrade = null,
    paymentMethods = [],
    upgradeContact = {},
    initialBilling = 'month',
}) {
    const [checkoutPlan, setCheckoutPlan] = useState(null);
    const [billing, setBilling] = useState(
        initialBilling === 'year' ? 'year' : 'month',
    );
    const savings = maxYearlySavings(plans);
    const showSwitcher = plans.some(
        (p) => Number(p.price_amount) > 0 && p.yearly_price_amount != null,
    );

    const form = useForm({
        to_plan: 'featured',
        billing_period: billing,
        payment_reference: '',
        payment_method: 'mpesa',
        member_notes: '',
    });

    const setBillingPeriod = (next) => {
        setBilling(next);
        form.setData('billing_period', next);
    };

    const openCheckout = (selected) => {
        form.setData({
            to_plan: selected.key,
            billing_period: billing,
            payment_reference: '',
            payment_method: 'mpesa',
            member_notes: '',
        });
        form.clearErrors();
        setCheckoutPlan(selected);
    };

    return (
        <AccountLayout title="Plans">
            <Head title="View plans" />

            <div className="space-y-6">
                <p className="max-w-2xl text-sm text-olive-600 dark:text-olive-400">
                    Pick the package that fits your business. Upgrade anytime for better placement
                    and more listings.
                </p>

                {pendingUpgrade && (
                    <div className="rounded-2xl border border-mustard/40 bg-mustard/15 px-5 py-4 text-sm text-earth-dusk dark:border-mustard/30 dark:bg-mustard/10 dark:text-mustard">
                        Pending upgrade to <strong>{pendingUpgrade.to_label}</strong> via{' '}
                        <strong className="capitalize">{pendingUpgrade.payment_method || 'mpesa'}</strong>{' '}
                        (ref {pendingUpgrade.payment_reference}). Cancel it from your dashboard if
                        you need to submit a new one.
                    </div>
                )}

                {showSwitcher ? (
                    <BillingSwitcher
                        value={billing}
                        onChange={setBillingPeriod}
                        savingsPercent={savings}
                    />
                ) : null}

                <PlansMatrix
                    plans={plans}
                    currentKey={plan.key}
                    pending={Boolean(pendingUpgrade)}
                    onUpgrade={openCheckout}
                    billing={billing}
                />

                <InclusionMatrix plans={plans} currentKey={plan.key} />
            </div>

            {checkoutPlan && (
                <PaymentCheckout
                    key={`${checkoutPlan.key}-${billing}`}
                    plan={checkoutPlan}
                    paymentMethods={paymentMethods}
                    upgradeContact={upgradeContact}
                    form={form}
                    billing={billing}
                    onClose={() => setCheckoutPlan(null)}
                />
            )}
        </AccountLayout>
    );
}
