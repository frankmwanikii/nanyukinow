import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminButton,
    AdminInput,
    AdminPasswordInput,
    AdminSelect,
    AdminTextarea,
    FormPanel,
} from '@/Components/Admin/ui';
import { Head, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useMemo } from 'react';

const groupLabels = {
    branding: 'Branding',
    pages: 'Contact & footer',
    billing: 'Membership & upgrades',
    payments: 'Payment gateways',
    social: 'Social links',
    seo: 'SEO & sharing',
};

const groupOrder = ['branding', 'pages', 'billing', 'payments', 'social', 'seo'];

const byKey = (items = []) =>
    Object.fromEntries(items.map((item) => [item.key, item]));

function Field({ item, value, onChange, label, className = '' }) {
    const fieldLabel = label || item.label;

    if (item.type === 'select') {
        return (
            <div className={className}>
                <AdminSelect
                    label={fieldLabel}
                    value={value}
                    onChange={(e) => onChange(item.key, e.target.value)}
                >
                    {(item.options || []).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </AdminSelect>
            </div>
        );
    }

    if (item.type === 'password') {
        return (
            <div className={className}>
                <AdminPasswordInput
                    label={fieldLabel}
                    value={value}
                    onChange={(e) => onChange(item.key, e.target.value)}
                    autoComplete="off"
                />
            </div>
        );
    }

    if (item.type === 'textarea') {
        return (
            <div className={className}>
                <AdminTextarea
                    label={fieldLabel}
                    value={value}
                    onChange={(e) => onChange(item.key, e.target.value)}
                    rows={4}
                />
            </div>
        );
    }

    return (
        <div className={className}>
            <AdminInput
                label={fieldLabel}
                value={value}
                onChange={(e) => onChange(item.key, e.target.value)}
            />
            {item.type === 'image' && value ? (
                <img
                    src={value}
                    alt=""
                    className="mt-2 h-24 rounded-md object-cover ring-1 ring-olive-200 dark:ring-olive-700"
                />
            ) : null}
        </div>
    );
}

function SectionBlock({ title, children }) {
    return (
        <div className="rounded-xl border border-olive-100 bg-[#faf9f6] p-4 dark:border-olive-800 dark:bg-olive-950/40 sm:p-5">
            {title ? (
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-olive-500 dark:text-olive-400">
                    {title}
                </h3>
            ) : null}
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">{children}</div>
        </div>
    );
}

function PaymentGatewaysPanel({ items, valueFor, updateValue }) {
    const map = useMemo(() => byKey(items), [items]);
    const provider = valueFor('mobile_money_provider') || 'mpesa';
    const paypalMode = valueFor('paypal_mode') || 'sandbox';
    const mpesaMode = valueFor('mpesa_mode') || 'sandbox';
    const intasendMode = valueFor('intasend_mode') || 'sandbox';

    const field = (key, label, className) => {
        const item = map[key];
        if (!item) return null;
        return (
            <Field
                key={key}
                item={item}
                value={valueFor(key)}
                onChange={updateValue}
                label={label}
                className={className}
            />
        );
    };

    return (
        <FormPanel
            title="Payment gateways"
            description="Configure how members pay. Only credentials for the active provider and mode are shown."
        >
            <div className="space-y-5">
                <SectionBlock title="M-Pesa">
                    {field('mobile_money_provider', 'Checkout provider', 'sm:col-span-2')}

                    {provider === 'mpesa' ? (
                        <>
                            {field('mpesa_mode', 'Environment', 'sm:col-span-2')}
                            {mpesaMode === 'live' ? (
                                <>
                                    {field('mpesa_live_consumer_key', 'Consumer key')}
                                    {field('mpesa_live_consumer_secret', 'Consumer secret')}
                                    {field('mpesa_live_shortcode', 'Shortcode / Paybill')}
                                    {field('mpesa_live_passkey', 'Passkey')}
                                </>
                            ) : (
                                <>
                                    {field('mpesa_sandbox_consumer_key', 'Consumer key')}
                                    {field(
                                        'mpesa_sandbox_consumer_secret',
                                        'Consumer secret',
                                    )}
                                    {field('mpesa_sandbox_shortcode', 'Shortcode')}
                                    {field('mpesa_sandbox_passkey', 'Passkey')}
                                </>
                            )}
                            {field(
                                'mpesa_callback_url',
                                'Callback URL (optional)',
                                'sm:col-span-2',
                            )}
                        </>
                    ) : null}

                    {provider === 'intasend' ? (
                        <>
                            {field('intasend_mode', 'Environment', 'sm:col-span-2')}
                            {intasendMode === 'live' ? (
                                <>
                                    {field('intasend_live_public_key', 'Public key')}
                                    {field('intasend_live_secret_key', 'Secret key')}
                                </>
                            ) : (
                                <>
                                    {field('intasend_sandbox_public_key', 'Public key')}
                                    {field('intasend_sandbox_secret_key', 'Secret key')}
                                </>
                            )}
                        </>
                    ) : null}
                </SectionBlock>

                <SectionBlock title="PayPal">
                    {field('paypal_mode', 'Environment', 'sm:col-span-2')}
                    {paypalMode === 'live' ? (
                        <>
                            {field('paypal_live_client_id', 'Client ID')}
                            {field('paypal_live_secret', 'Secret')}
                        </>
                    ) : (
                        <>
                            {field('paypal_sandbox_client_id', 'Client ID')}
                            {field('paypal_sandbox_secret', 'Secret')}
                        </>
                    )}
                    {field('paypal_checkout_currency', 'Charge currency')}
                    {field('paypal_kes_per_usd', 'KES per 1 USD')}
                </SectionBlock>
            </div>
        </FormPanel>
    );
}

export default function Index({ groupedSettings }) {
    const flat = useMemo(() => {
        const rows = [];
        Object.entries(groupedSettings || {}).forEach(([group, items]) => {
            items.forEach((item) => rows.push({ ...item, group }));
        });
        return rows;
    }, [groupedSettings]);

    const form = useForm({
        settings: flat.map((item) => ({
            key: item.key,
            value: item.value || '',
        })),
    });

    const updateValue = (key, value) => {
        form.setData(
            'settings',
            form.data.settings.map((row) =>
                row.key === key ? { ...row, value } : row,
            ),
        );
    };

    const valueFor = (key) =>
        form.data.settings.find((row) => row.key === key)?.value || '';

    const save = (e) => {
        e.preventDefault();
        form.put(route('admin.settings.update'));
    };

    const groups = useMemo(() => {
        const keys = Object.keys(groupedSettings || {});
        return [
            ...groupOrder.filter((g) => keys.includes(g)),
            ...keys.filter((g) => !groupOrder.includes(g)),
        ];
    }, [groupedSettings]);

    return (
        <AdminLayout title="Settings">
            <Head title="Settings" />

            <p className="mb-5 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Website and admin configuration. Edit public page copy under Pages.
            </p>

            <form onSubmit={save} className="space-y-4">
                {groups.map((group) => {
                    if (group === 'payments') {
                        return (
                            <PaymentGatewaysPanel
                                key={group}
                                items={groupedSettings.payments || []}
                                valueFor={valueFor}
                                updateValue={updateValue}
                            />
                        );
                    }

                    return (
                        <FormPanel key={group} title={groupLabels[group] || group}>
                            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                                {(groupedSettings[group] || []).map((item) => (
                                    <Field
                                        key={item.key}
                                        item={item}
                                        value={valueFor(item.key)}
                                        onChange={updateValue}
                                        className={
                                            item.type === 'textarea'
                                                ? 'sm:col-span-2'
                                                : ''
                                        }
                                    />
                                ))}
                            </div>
                        </FormPanel>
                    );
                })}

                <div className="flex justify-end">
                    <AdminButton type="submit" disabled={form.processing}>
                        <Save className="h-4 w-4" />
                        {form.processing ? 'Saving…' : 'Save settings'}
                    </AdminButton>
                </div>
            </form>
        </AdminLayout>
    );
}
