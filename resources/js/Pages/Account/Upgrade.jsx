import AccountLayout from '@/Layouts/AccountLayout';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Check, RefreshCw, Send, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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
 * Checkout modal — live pay hits /account/upgrade/pay (PaymentGateway).
 * Offline path still submits a pending upgrade for admin review.
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
    const [paypalEmail, setPaypalEmail] = useState('');
    const [offlinePayment, setOfflinePayment] = useState(false);
    const [paying, setPaying] = useState(false);
    const [payError, setPayError] = useState(null);
    const [phoneError, setPhoneError] = useState('');
    const [emailError, setEmailError] = useState('');
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
        payment_method: method,
        amount: Number(plan.price_amount) || 0,
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
