import AccountLayout from '@/Layouts/AccountLayout';
import { Head, useForm } from '@inertiajs/react';
import { Check, Send, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const field =
    'w-full rounded-lg border border-olive-200 bg-white px-3.5 py-3 text-base text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-mustard focus:ring-2 focus:ring-mustard/30';
const labelCls = 'mb-1.5 block text-sm font-semibold text-olive-600';

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

function displayPrice(plan) {
    if (plan.price_label) return plan.price_label;
    if (Number(plan.price_amount) === 0) return 'Free';
    return formatMoney(plan.price_amount, plan.currency);
}

function MpesaIcon({ className = 'h-8 w-auto max-w-[8rem]' }) {
    return (
        <img
            src="/images/payments/mpesa.png"
            alt="M-Pesa"
            className={`object-contain ${className}`}
        />
    );
}

function PaypalIcon({ className = 'h-7 w-auto max-w-[8rem]' }) {
    return (
        <img
            src="/images/payments/paypal.png"
            alt="PayPal"
            className={`object-contain ${className}`}
        />
    );
}

function MethodIcon({ method, className }) {
    if (method === 'paypal') {
        return <PaypalIcon className={className || 'h-7 w-auto max-w-[8rem]'} />;
    }
    return <MpesaIcon className={className || 'h-8 w-auto max-w-[8rem]'} />;
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

function PlansMatrix({ plans, currentKey, pending, onUpgrade }) {
    return (
        <div className="overflow-hidden rounded-xl border border-olive-200 bg-white">
            <div className={`grid divide-olive-100 lg:divide-x ${plans.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
                {plans.map((plan) => {
                    const { isCurrent, canUpgrade, ctaLabel } = planState(
                        plan,
                        currentKey,
                        pending,
                    );
                    const featured = Boolean(plan.is_highlighted);

                    return (
                        <article
                            key={plan.id}
                            className={`relative flex flex-col border-b border-olive-100 p-6 last:border-b-0 lg:border-b-0 sm:p-7 ${
                                featured ? 'bg-olive-950 text-white lg:scale-[1.01] lg:shadow-lift' : 'bg-white'
                            }`}
                        >
                            <div className="flex items-baseline justify-between gap-3">
                                <h2
                                    className={`font-display text-lg font-semibold tracking-tight ${
                                        featured ? 'text-white' : 'text-olive-950'
                                    }`}
                                >
                                    {plan.name}
                                </h2>
                                {featured ? (
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mustard">
                                        Popular
                                    </span>
                                ) : isCurrent ? (
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-olive-400">
                                        Yours
                                    </span>
                                ) : null}
                            </div>

                            {plan.tagline && (
                                <p
                                    className={`mt-2 text-sm leading-relaxed ${
                                        featured ? 'text-white/65' : 'text-olive-500'
                                    }`}
                                >
                                    {plan.tagline}
                                </p>
                            )}

                            <div className="mt-8">
                                <div className="flex items-baseline gap-1.5">
                                    <span
                                        className={`font-display text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl ${
                                            featured ? 'text-white' : 'text-olive-950'
                                        }`}
                                    >
                                        {displayPrice(plan)}
                                    </span>
                                    {!plan.price_label && Number(plan.price_amount) > 0 && (
                                        <span
                                            className={`text-sm ${
                                                featured ? 'text-white/55' : 'text-olive-400'
                                            }`}
                                        >
                                            {periodSuffix(plan.billing_period)}
                                        </span>
                                    )}
                                </div>
                                <p
                                    className={`mt-2 text-sm font-medium ${
                                        featured ? 'text-mustard' : 'text-olive-700'
                                    }`}
                                >
                                    {plan.listing_limit} listing
                                    {plan.listing_limit === 1 ? '' : 's'} included
                                </p>
                            </div>

                            <ul className="mt-8 flex-1 space-y-2.5 border-t border-dashed border-olive-200/80 pt-6">
                                {(plan.inclusions || []).map((item) => (
                                    <li
                                        key={item}
                                        className={`flex gap-2.5 text-sm leading-snug ${
                                            featured ? 'text-white/80' : 'text-olive-700'
                                        }`}
                                    >
                                        <Check
                                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                                                featured ? 'text-mustard' : 'text-olive-800'
                                            }`}
                                            strokeWidth={2.25}
                                        />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                type="button"
                                disabled={!canUpgrade}
                                onClick={() => canUpgrade && onUpgrade(plan)}
                                className={`mt-8 w-full px-4 py-2.5 text-center text-sm font-semibold transition disabled:cursor-not-allowed ${
                                    canUpgrade
                                        ? featured
                                            ? 'bg-mustard text-earth-dusk hover:bg-white'
                                            : 'bg-olive-900 text-white hover:bg-mustard hover:text-earth-dusk'
                                        : isCurrent
                                          ? featured
                                              ? 'border border-white/25 text-white'
                                              : 'border border-olive-200 text-olive-500'
                                          : featured
                                            ? 'border border-white/15 text-white/45'
                                            : 'border border-olive-100 text-olive-400'
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
 * Checkout modal — UI + payload ready for M-Pesa / PayPal APIs.
 * Today: submits a pending upgrade for admin review.
 * Later: swap `submitManualReview` for STK / PayPal redirect initiate calls.
 */
function PaymentCheckout({
    plan,
    paymentMethods,
    upgradeContact,
    onClose,
    form,
}) {
    const method = form.data.payment_method;
    const [phone, setPhone] = useState('');
    const amountLabel = `${displayPrice(plan)}${
        !plan.price_label && Number(plan.price_amount) > 0
            ? ` ${periodSuffix(plan.billing_period)}`
            : ''
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
        form.clearErrors('payment_method');
    };

    const buildNotes = () => {
        const bits = [];
        if (method === 'mpesa' && phone.trim()) {
            bits.push(`Phone: ${phone.trim()}`);
        }
        if (form.data.member_notes?.trim()) {
            bits.push(form.data.member_notes.trim());
        }
        return bits.join('\n');
    };

    /** Manual review path (current). Replace body with API initiate when ready. */
    const submitManualReview = (e) => {
        e.preventDefault();
        form
            .transform((data) => ({
                ...data,
                member_notes: buildNotes(),
            }))
            .post(route('account.upgrade.store'), {
                onSuccess: () => onClose(),
                onFinish: () => {
                    form.transform((data) => data);
                },
            });
    };

    /**
     * API hook — call this from the primary CTA once M-Pesa STK / PayPal are live.
     * Expected payload shape for either provider:
     * { to_plan, payment_method, amount, currency, phone?, return_url, cancel_url }
     */
    const paymentPayload = () => ({
        to_plan: form.data.to_plan || plan.key,
        payment_method: method,
        amount: Number(plan.price_amount) || 0,
        currency: plan.currency || 'KES',
        phone: method === 'mpesa' ? phone.trim() : undefined,
        return_url: typeof window !== 'undefined' ? `${window.location.origin}/account/billing` : '/account/billing',
        cancel_url: typeof window !== 'undefined' ? `${window.location.origin}/account/upgrade` : '/account/upgrade',
    });

    const handlePrimaryPay = (e) => {
        e.preventDefault();
        // Plug APIs here:
        // if (method === 'mpesa') await initiateMpesaStk(paymentPayload())
        // if (method === 'paypal') await initiatePaypalCheckout(paymentPayload())
        // Until then, require confirmation reference and submit for review.
        void paymentPayload();
        submitManualReview(e);
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
                                    {displayPrice(plan)}
                                </p>
                            </div>
                            <div className="text-right text-sm text-olive-600">
                                <p className="font-semibold text-olive-900">{plan.name}</p>
                                <p className="text-xs text-olive-500">
                                    {plan.listing_limit} listing
                                    {plan.listing_limit === 1 ? '' : 's'}
                                    {!plan.price_label && Number(plan.price_amount) > 0
                                        ? periodSuffix(plan.billing_period)
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
                                className="space-y-2"
                            >
                                {paymentMethods.map((opt) => {
                                    const active = method === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            role="radio"
                                            aria-checked={active}
                                            onClick={() => selectMethod(opt.value)}
                                            className={`flex w-full items-center gap-3 border px-3 py-3 text-left transition ${
                                                active
                                                    ? 'border-olive-900 bg-white ring-1 ring-olive-900'
                                                    : 'border-olive-200 bg-white hover:border-olive-300'
                                            }`}
                                        >
                                            <span className="inline-flex h-11 w-[5.75rem] shrink-0 items-center justify-center overflow-hidden rounded-md bg-black px-1.5">
                                                <MethodIcon
                                                    method={opt.value}
                                                    className={
                                                        opt.value === 'paypal'
                                                            ? 'h-6 w-auto max-w-full'
                                                            : 'h-8 w-auto max-w-full'
                                                    }
                                                />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block text-sm font-semibold text-olive-950">
                                                    {opt.label}
                                                </span>
                                                <span className="mt-0.5 block text-xs text-olive-500">
                                                    {opt.description}
                                                </span>
                                            </span>
                                            <span
                                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                                    active
                                                        ? 'border-olive-900 bg-olive-900'
                                                        : 'border-olive-300'
                                                }`}
                                            >
                                                {active && (
                                                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                                                )}
                                            </span>
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

                        {/* Method panel */}
                        {method === 'mpesa' && (
                            <div className="space-y-4 border border-olive-200 p-4">
                                <div className="flex items-center gap-2.5">
                                    <span className="inline-flex h-9 items-center rounded-md bg-black px-2">
                                        <MpesaIcon className="h-6 w-auto max-w-[4.5rem]" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-olive-950">
                                            Pay with M-Pesa
                                        </p>
                                        <p className="text-xs text-olive-500">
                                            Lipa na M-Pesa · Paybill / Till
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {upgradeContact.mpesa_paybill && (
                                        <div className="border border-olive-100 bg-[#f4f2ec] px-3 py-2.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-[10px] font-semibold uppercase tracking-wide text-olive-400">
                                                    Paybill / Till
                                                </p>
                                                <CopyButton value={upgradeContact.mpesa_paybill} />
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
                                                <CopyButton value={upgradeContact.mpesa_account} />
                                            </div>
                                            <p className="mt-1 font-display text-lg font-semibold text-olive-950">
                                                {upgradeContact.mpesa_account}
                                            </p>
                                        </div>
                                    )}
                                </div>

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
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="07XX XXX XXX"
                                    />
                                    <p className="mt-1.5 text-xs text-olive-500">
                                        Used for STK push once M-Pesa API is connected. For now we
                                        still verify your confirmation code.
                                    </p>
                                </div>
                            </div>
                        )}

                        {method === 'paypal' && (
                            <div className="space-y-3 border border-olive-200 p-4">
                                <div className="flex items-center gap-2.5">
                                    <span className="inline-flex h-9 items-center rounded-md bg-black px-2">
                                        <PaypalIcon className="h-5 w-auto max-w-[5rem]" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-olive-950">
                                            Pay with PayPal
                                        </p>
                                        <p className="text-xs text-olive-500">
                                            Cards & PayPal balance
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-olive-600">
                                    {upgradeContact.paypal_note ||
                                        'Complete payment on PayPal, then paste your transaction ID below.'}
                                </p>
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
                                        <CopyButton value={upgradeContact.paypal_email} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Confirmation — stays until live payment APIs return a reference */}
                        <div className="space-y-3">
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
                                />
                                {form.errors.payment_reference && (
                                    <p className="mt-1.5 text-sm text-rose-600">
                                        {form.errors.payment_reference}
                                    </p>
                                )}
                                <p className="mt-1.5 text-xs text-olive-500">
                                    After APIs are plugged in, this field can be filled automatically
                                    from the payment webhook.
                                </p>
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

                        {form.errors.to_plan && (
                            <p className="text-sm text-rose-600">{form.errors.to_plan}</p>
                        )}
                    </div>

                    {/* Sticky footer CTA */}
                    <div className="shrink-0 border-t border-olive-100 bg-white px-5 py-4">
                        <button
                            type="submit"
                            disabled={form.processing || !form.data.payment_reference.trim()}
                            className="inline-flex w-full items-center justify-center gap-2 bg-olive-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-mustard hover:text-earth-dusk disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" />
                            {form.processing
                                ? 'Submitting…'
                                : method === 'mpesa'
                                  ? `Confirm M-Pesa · ${amountLabel}`
                                  : `Confirm PayPal · ${amountLabel}`}
                        </button>
                        <p className="mt-2 text-center text-[11px] text-olive-400">
                            Plan activates after payment is verified
                        </p>
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
}) {
    const [checkoutPlan, setCheckoutPlan] = useState(null);

    const form = useForm({
        to_plan: 'featured',
        payment_reference: '',
        payment_method: 'mpesa',
        member_notes: '',
    });

    const openCheckout = (selected) => {
        form.setData({
            to_plan: selected.key,
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
                <p className="max-w-2xl text-sm text-olive-600">
                    Pick the package that fits your business. Upgrade anytime for better placement
                    and more listings.
                </p>

                {pendingUpgrade && (
                    <div className="rounded-2xl border border-mustard/40 bg-mustard/15 px-5 py-4 text-sm text-earth-dusk">
                        Pending upgrade to <strong>{pendingUpgrade.to_label}</strong> via{' '}
                        <strong className="capitalize">{pendingUpgrade.payment_method || 'mpesa'}</strong>{' '}
                        (ref {pendingUpgrade.payment_reference}). Cancel it from your dashboard if
                        you need to submit a new one.
                    </div>
                )}

                <PlansMatrix
                    plans={plans}
                    currentKey={plan.key}
                    pending={Boolean(pendingUpgrade)}
                    onUpgrade={openCheckout}
                />
            </div>

            {checkoutPlan && (
                <PaymentCheckout
                    key={checkoutPlan.key}
                    plan={checkoutPlan}
                    paymentMethods={paymentMethods}
                    upgradeContact={upgradeContact}
                    form={form}
                    onClose={() => setCheckoutPlan(null)}
                />
            )}
        </AccountLayout>
    );
}
