import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminButton,
    AdminInput,
    AdminPasswordInput,
    AdminSelect,
    AdminTextarea,
    PageHeader,
} from '@/Components/Admin/ui';
import { Head, useForm } from '@inertiajs/react';
import { Image as ImageIcon, Save } from 'lucide-react';
import { useMemo } from 'react';

const groupMeta = {
    branding: {
        title: 'Branding',
        blurb: 'Site name, tagline, and logos.',
    },
    pages: {
        title: 'Contact & footer',
        blurb: 'Public contact details and footer copy.',
    },
    billing: {
        title: 'Membership & upgrades',
        blurb: 'Upgrade instructions and payment references shown to members.',
    },
    payments: {
        title: 'Payment gateways',
        blurb: 'Only credentials for the active provider and environment are shown.',
    },
    social: {
        title: 'Social links',
        blurb: 'Profiles linked from the site footer.',
    },
    seo: {
        title: 'SEO & sharing',
        blurb: 'Default search and social preview metadata.',
    },
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
        </div>
    );
}

function MediaPreview({ url, label }) {
    if (!url) {
        return (
            <div className="flex h-[4.5rem] items-center justify-center rounded-xl border border-dashed border-olive-200 bg-olive-50/70 text-olive-400 dark:border-olive-700 dark:bg-olive-950/50">
                <ImageIcon className="h-5 w-5" />
                <span className="sr-only">{label}</span>
            </div>
        );
    }

    return (
        <div className="flex h-[4.5rem] items-center justify-center overflow-hidden rounded-xl border border-olive-200 bg-white p-2 dark:border-olive-700 dark:bg-olive-950">
            <img src={url} alt={label} className="max-h-full max-w-full object-contain" />
        </div>
    );
}

function Panel({ title, blurb, children }) {
    return (
        <section className="overflow-hidden rounded-2xl border border-olive-200/80 bg-white dark:border-olive-800 dark:bg-olive-900">
            <header className="border-b border-olive-100 px-5 py-4 dark:border-olive-800 sm:px-6">
                <h2 className="text-base font-semibold tracking-tight text-olive-950 dark:text-olive-50">
                    {title}
                </h2>
                {blurb ? (
                    <p className="mt-1 text-sm text-olive-500 dark:text-olive-400">{blurb}</p>
                ) : null}
            </header>
            <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
        </section>
    );
}

function FieldGrid({ children }) {
    return (
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">{children}</div>
    );
}

function NestedBlock({ title, badge, children }) {
    return (
        <div className="rounded-xl border border-olive-100 bg-[#faf9f6] p-4 dark:border-olive-800 dark:bg-olive-950/40 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-olive-500 dark:text-olive-400">
                    {title}
                </h3>
                {badge ? (
                    <span className="rounded-full bg-olive-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-olive-700 dark:bg-olive-800 dark:text-olive-200">
                        {badge}
                    </span>
                ) : null}
            </div>
            <FieldGrid>{children}</FieldGrid>
        </div>
    );
}

function BrandingFields({ items, valueFor, updateValue }) {
    const map = byKey(items);
    const field = (key, label, className) => {
        const item = map[key];
        if (!item) return null;
        return (
            <Field
                item={item}
                value={valueFor(key)}
                onChange={updateValue}
                label={label}
                className={className}
            />
        );
    };

    return (
        <div className="space-y-5">
            <FieldGrid>
                {field('site_name', 'Site name')}
                {field('site_tagline', 'Tagline')}
            </FieldGrid>
            <FieldGrid>
                <div className="space-y-3">
                    {field('logo_url', 'Logo URL')}
                    <MediaPreview url={valueFor('logo_url')} label="Logo preview" />
                </div>
                <div className="space-y-3">
                    {field('favicon_url', 'Favicon URL')}
                    <MediaPreview url={valueFor('favicon_url')} label="Favicon preview" />
                </div>
            </FieldGrid>
        </div>
    );
}

function PaymentsFields({ items, valueFor, updateValue }) {
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
        <div className="space-y-4">
            <NestedBlock
                title="M-Pesa"
                badge={provider === 'intasend' ? 'IntaSend' : 'Daraja'}
            >
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
                                {field('mpesa_sandbox_consumer_secret', 'Consumer secret')}
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
            </NestedBlock>

            <NestedBlock
                title="PayPal"
                badge={paypalMode === 'live' ? 'Live' : 'Sandbox'}
            >
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
            </NestedBlock>
        </div>
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
        form.put(route('admin.settings.update'), {
            preserveScroll: true,
            onSuccess: () => {
                form.setDefaults({
                    settings: form.data.settings,
                });
            },
        });
    };

    const groups = useMemo(() => {
        const keys = Object.keys(groupedSettings || {});
        return [
            ...groupOrder.filter((g) => keys.includes(g)),
            ...keys.filter((g) => !groupOrder.includes(g)),
        ];
    }, [groupedSettings]);

    return (
        <AdminLayout>
            <Head title="Settings" />

            <PageHeader title="Settings" />

            <form onSubmit={save} className="space-y-4 pb-8">
                {groups.map((group) => {
                    const meta = groupMeta[group] || {
                        title: group,
                        blurb: null,
                    };
                    const items = groupedSettings[group] || [];

                    return (
                        <Panel key={group} title={meta.title} blurb={meta.blurb}>
                            {group === 'payments' ? (
                                <PaymentsFields
                                    items={items}
                                    valueFor={valueFor}
                                    updateValue={updateValue}
                                />
                            ) : group === 'branding' ? (
                                <BrandingFields
                                    items={items}
                                    valueFor={valueFor}
                                    updateValue={updateValue}
                                />
                            ) : (
                                <FieldGrid>
                                    {items.map((item) => (
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
                                </FieldGrid>
                            )}
                        </Panel>
                    );
                })}

                <div className="flex items-center justify-end gap-3 pt-1">
                    {form.isDirty ? (
                        <p className="mr-auto text-sm text-olive-500">Unsaved changes</p>
                    ) : null}
                    <AdminButton
                        type="submit"
                        disabled={form.processing || !form.isDirty}
                    >
                        <Save className="h-4 w-4" />
                        {form.processing ? 'Saving…' : 'Save settings'}
                    </AdminButton>
                </div>
            </form>
        </AdminLayout>
    );
}
