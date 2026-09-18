import SiteLayout from '@/Layouts/SiteLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Send } from 'lucide-react';

const field =
    'w-full rounded-xl border border-olive-200 bg-white px-3.5 py-3 text-base text-olive-900 outline-none transition focus:border-mustard focus:ring-2 focus:ring-mustard/30';
const label = 'mb-1.5 block text-sm font-semibold text-olive-600';

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

export default function Upgrade({ plan, plans = [], pendingUpgrade = null, upgradeContact = {} }) {
    const form = useForm({
        to_plan: plans.find((p) => p.key !== plan.key)?.key || 'featured',
        payment_reference: '',
        payment_method: 'mpesa',
        member_notes: '',
    });

    const selected = plans.find((p) => p.key === form.data.to_plan);

    const submit = (e) => {
        e.preventDefault();
        form.post(route('account.upgrade.store'));
    };

    return (
        <SiteLayout>
            <Head title="Upgrade plan" />

            <div className="bg-olive-900">
                <div className="mx-auto max-w-2xl px-4 pb-8 pt-28 sm:px-6 sm:pt-32">
                    <Link
                        href={route('account.index')}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-mustard"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to account
                    </Link>
                    <h1 className="mt-3 font-display text-3xl font-bold text-white">
                        Upgrade your plan
                    </h1>
                    <p className="mt-2 text-sm text-white/65">
                        You are on <strong className="text-mustard">{plan.label}</strong>. Pay via
                        M-Pesa, then submit your confirmation code for activation.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
                {pendingUpgrade && (
                    <div className="rounded-2xl border border-mustard/40 bg-mustard/15 px-5 py-4 text-sm text-earth-dusk">
                        You already have a pending request for <strong>{pendingUpgrade.to_label}</strong>{' '}
                        (ref {pendingUpgrade.payment_reference}). Cancel it from your account if you
                        need to submit a new one.
                    </div>
                )}

                <div className="rounded-2xl border border-olive-200/80 bg-white p-6 shadow-soft">
                    <h2 className="font-display text-lg font-bold text-olive-950">Payment details</h2>
                    <p className="mt-2 text-sm leading-relaxed text-olive-600">
                        {upgradeContact.instructions}
                    </p>
                    <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                        {upgradeContact.mpesa_paybill && (
                            <div className="rounded-xl bg-earth-sand/80 px-4 py-3">
                                <dt className="text-xs font-semibold uppercase text-olive-500">
                                    Paybill / Till
                                </dt>
                                <dd className="mt-1 font-bold text-olive-950">
                                    {upgradeContact.mpesa_paybill}
                                </dd>
                            </div>
                        )}
                        {upgradeContact.mpesa_account && (
                            <div className="rounded-xl bg-earth-sand/80 px-4 py-3">
                                <dt className="text-xs font-semibold uppercase text-olive-500">
                                    Account
                                </dt>
                                <dd className="mt-1 font-bold text-olive-950">
                                    {upgradeContact.mpesa_account}
                                </dd>
                            </div>
                        )}
                        {upgradeContact.whatsapp && (
                            <div className="rounded-xl bg-earth-sand/80 px-4 py-3 sm:col-span-2">
                                <dt className="text-xs font-semibold uppercase text-olive-500">
                                    WhatsApp support
                                </dt>
                                <dd className="mt-1 font-bold text-olive-950">
                                    {upgradeContact.whatsapp}
                                </dd>
                            </div>
                        )}
                    </dl>
                </div>

                {!pendingUpgrade && (
                    <form
                        onSubmit={submit}
                        className="space-y-4 rounded-2xl border border-olive-200/80 bg-white p-6 shadow-soft"
                    >
                        <div>
                            <label className={label}>Choose plan</label>
                            <div className="space-y-2">
                                {plans.map((p) => (
                                    <label
                                        key={p.id}
                                        className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition ${
                                            form.data.to_plan === p.key
                                                ? 'border-mustard bg-mustard/10'
                                                : 'border-olive-200 hover:border-olive-300'
                                        }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="to_plan"
                                                value={p.key}
                                                checked={form.data.to_plan === p.key}
                                                onChange={() => form.setData('to_plan', p.key)}
                                                className="text-mustard focus:ring-mustard"
                                            />
                                            <span>
                                                <span className="block font-semibold text-olive-950">
                                                    {p.name}
                                                </span>
                                                <span className="text-xs text-olive-500">
                                                    Up to {p.listing_limit} listings · badge:{' '}
                                                    {p.badge_label}
                                                </span>
                                            </span>
                                        </span>
                                        <span className="font-bold text-olive-900">
                                            {formatMoney(p.price_amount, p.currency)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {form.errors.to_plan && (
                                <p className="mt-1.5 text-sm text-rose-600">{form.errors.to_plan}</p>
                            )}
                        </div>

                        {selected && (
                            <p className="rounded-xl bg-olive-50 px-4 py-3 text-sm text-olive-700">
                                You will request <strong>{selected.name}</strong> for{' '}
                                <strong>
                                    {formatMoney(selected.price_amount, selected.currency)}
                                </strong>
                                /{selected.billing_period}.
                            </p>
                        )}

                        <div>
                            <label className={label} htmlFor="payment_reference">
                                M-Pesa confirmation code
                            </label>
                            <input
                                id="payment_reference"
                                className={field}
                                value={form.data.payment_reference}
                                onChange={(e) => form.setData('payment_reference', e.target.value)}
                                placeholder="e.g. QJX7…"
                                required
                            />
                            {form.errors.payment_reference && (
                                <p className="mt-1.5 text-sm text-rose-600">
                                    {form.errors.payment_reference}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={label} htmlFor="member_notes">
                                Notes (optional)
                            </label>
                            <textarea
                                id="member_notes"
                                rows={3}
                                className={field}
                                value={form.data.member_notes}
                                onChange={(e) => form.setData('member_notes', e.target.value)}
                                placeholder="Phone used to pay, business name, etc."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-mustard px-4 py-3 text-sm font-bold text-earth-dusk disabled:opacity-50 sm:w-auto"
                        >
                            <Send className="h-4 w-4" />
                            {form.processing ? 'Submitting…' : 'Submit upgrade request'}
                        </button>
                    </form>
                )}
            </div>
        </SiteLayout>
    );
}
