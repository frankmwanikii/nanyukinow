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

const METHOD_META = {
    mpesa: {
        color: 'border-emerald-500 bg-emerald-50 text-emerald-900',
        active: 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50',
        chip: 'bg-emerald-600',
    },
    intasend: {
        color: 'border-sky-500 bg-sky-50 text-sky-900',
        active: 'ring-2 ring-sky-500 border-sky-500 bg-sky-50',
        chip: 'bg-sky-600',
    },
    paypal: {
        color: 'border-indigo-500 bg-indigo-50 text-indigo-900',
        active: 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50',
        chip: 'bg-[#003087]',
    },
};

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

function PaymentCheckout({
    plan,
    paymentMethods,
    upgradeContact,
    onClose,
    form,
}) {
    const method = form.data.payment_method;

    const referenceLabel = useMemo(() => {
        if (method === 'paypal') return 'PayPal transaction ID';
        if (method === 'intasend') return 'IntaSend transaction / invoice ID';
        return 'M-Pesa confirmation code';
    }, [method]);

    const referenceHint = useMemo(() => {
        if (method === 'paypal') return 'e.g. 8AB12345XY678901A';
        if (method === 'intasend') return 'e.g. INV-… or TXN-…';
        return 'e.g. QJX7…';
    }, [method]);

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

    const submit = (e) => {
        e.preventDefault();
        form.post(route('account.upgrade.store'), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-[1400] flex items-end justify-center sm:items-center">
            <button
                type="button"
                aria-label="Close checkout"
                className="absolute inset-0 bg-olive-950/55 backdrop-blur-[2px]"
                onClick={onClose}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="checkout-title"
                className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-lift sm:mx-4 sm:rounded-3xl"
            >
                <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-olive-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                            Checkout
                        </p>
                        <h2 id="checkout-title" className="font-display text-xl font-bold text-olive-950">
                            Upgrade to {plan.name}
                        </h2>
                        <p className="mt-1 text-sm text-olive-600">
                            {displayPrice(plan)}
                            {!plan.price_label && Number(plan.price_amount) > 0
                                ? ` ${periodSuffix(plan.billing_period)}`
                                : ''}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-olive-500 transition hover:bg-olive-50 hover:text-olive-900"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
                    <div>
                        <p className={labelCls}>Pay with</p>
                        <div
                            role="radiogroup"
                            aria-label="Payment method"
                            className="grid grid-cols-3 gap-2 rounded-2xl bg-olive-50 p-1.5"
                        >
                            {paymentMethods.map((opt) => {
                                const active = method === opt.value;
                                const tone = METHOD_META[opt.value] || METHOD_META.mpesa;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        onClick={() => form.setData('payment_method', opt.value)}
                                        className={`rounded-xl px-2 py-3 text-center transition ${
                                            active
                                                ? 'bg-white shadow-soft ring-1 ring-olive-200'
                                                : 'hover:bg-white/70'
                                        }`}
                                    >
                                        <span
                                            className={`mx-auto mb-1.5 flex h-2 w-2 rounded-full ${
                                                active ? tone.chip : 'bg-olive-300'
                                            }`}
                                        />
                                        <span className="block text-sm font-bold text-olive-950">
                                            {opt.short}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {form.errors.payment_method && (
                            <p className="mt-1.5 text-sm text-rose-600">{form.errors.payment_method}</p>
                        )}
                        <p className="mt-2 text-xs text-olive-500">
                            {paymentMethods.find((m) => m.value === method)?.description}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-olive-100 bg-earth-sand/50 p-4">
                        {method === 'mpesa' && (
                            <div className="space-y-3 text-sm">
                                <p className="font-semibold text-olive-900">M-Pesa payment</p>
                                <p className="text-olive-600">{upgradeContact.instructions}</p>
                                <dl className="grid gap-2 sm:grid-cols-2">
                                    {upgradeContact.mpesa_paybill && (
                                        <div className="rounded-xl bg-white px-3 py-2.5">
                                            <dt className="text-[11px] font-semibold uppercase text-olive-500">
                                                Paybill / Till
                                            </dt>
                                            <dd className="font-bold text-olive-950">
                                                {upgradeContact.mpesa_paybill}
                                            </dd>
                                        </div>
                                    )}
                                    {upgradeContact.mpesa_account && (
                                        <div className="rounded-xl bg-white px-3 py-2.5">
                                            <dt className="text-[11px] font-semibold uppercase text-olive-500">
                                                Account
                                            </dt>
                                            <dd className="font-bold text-olive-950">
                                                {upgradeContact.mpesa_account}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        )}

                        {method === 'intasend' && (
                            <div className="space-y-2 text-sm">
                                <p className="font-semibold text-olive-900">IntaSend</p>
                                <p className="text-olive-600">
                                    {upgradeContact.intasend_note}
                                </p>
                                <p className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-medium text-sky-900">
                                    After paying with IntaSend, paste your transaction or invoice ID
                                    below so we can confirm your upgrade.
                                </p>
                            </div>
                        )}

                        {method === 'paypal' && (
                            <div className="space-y-2 text-sm">
                                <p className="font-semibold text-olive-900">PayPal</p>
                                <p className="text-olive-600">{upgradeContact.paypal_note}</p>
                                {upgradeContact.paypal_email && (
                                    <p className="rounded-xl bg-white px-3 py-2.5">
                                        <span className="block text-[11px] font-semibold uppercase text-olive-500">
                                            PayPal email
                                        </span>
                                        <span className="font-bold text-olive-950">
                                            {upgradeContact.paypal_email}
                                        </span>
                                    </p>
                                )}
                                <p className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-900">
                                    After paying with PayPal, paste your transaction ID below so we
                                    can confirm your upgrade.
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className={labelCls} htmlFor="payment_reference">
                            {referenceLabel}
                        </label>
                        <input
                            id="payment_reference"
                            className={field}
                            value={form.data.payment_reference}
                            onChange={(e) => form.setData('payment_reference', e.target.value)}
                            placeholder={referenceHint}
                            required
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
                            onChange={(e) => form.setData('member_notes', e.target.value)}
                            placeholder="Phone used to pay, business name…"
                        />
                    </div>

                    {form.errors.to_plan && (
                        <p className="text-sm text-rose-600">{form.errors.to_plan}</p>
                    )}

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-mustard px-4 py-3.5 text-sm font-bold text-earth-dusk transition hover:bg-olive-800 hover:text-white disabled:opacity-50"
                    >
                        <Send className="h-4 w-4" />
                        {form.processing ? 'Submitting…' : 'Submit payment for review'}
                    </button>
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
