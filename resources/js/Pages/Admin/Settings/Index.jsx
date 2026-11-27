import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminButton,
    AdminInput,
    AdminPasswordInput,
    AdminSelect,
    AdminTabs,
    AdminTextarea,
    PageHeader,
} from '@/Components/Admin/ui';
import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const groupMeta = {
    branding: {
        title: 'Brand',
        blurb: 'Name used in mail and payment checkouts.',
    },
    pages: {
        title: 'Contact',
        blurb: 'Email and phones shown in the footer, Terms, Privacy, and emails.',
    },
    access: {
        title: 'Access',
        blurb: 'Preview gate for the public site.',
    },
    billing: {
        title: 'Billing',
        blurb: 'Offline payment details shown on upgrade checkout.',
    },
    payments: {
        title: 'Payments',
        blurb: 'Live checkout methods and gateway credentials.',
    },
    maps: {
        title: 'Maps',
        blurb: 'Map provider for Explore, directions, and listing location.',
    },
};

const groupOrder = [
    'branding',
    'pages',
    'access',
    'billing',
    'payments',
    'maps',
];

const byKey = (items = []) =>
    Object.fromEntries(items.map((item) => [item.key, item]));

function FieldHelp({ help }) {
    if (!help) {
        return null;
    }

    return (
        <p className="mt-1.5 text-sm leading-relaxed text-olive-500 dark:text-olive-400">
            {help}
        </p>
    );
}

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
                <FieldHelp help={item.help} />
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
                <FieldHelp help={item.help} />
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
                <FieldHelp help={item.help} />
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
            <FieldHelp help={item.help} />
        </div>
    );
}

function FieldGrid({ children }) {
    return (
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            {children}
        </div>
    );
}

function Section({ title, hint, children }) {
    return (
        <section className="border-t border-olive-200 pt-5 first:border-t-0 first:pt-0 dark:border-olive-800">
            <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                    {title}
                </h3>
                {hint ? (
                    <p className="text-sm text-olive-500 dark:text-olive-400">
                        {hint}
                    </p>
                ) : null}
            </div>
            <FieldGrid>{children}</FieldGrid>
        </section>
    );
}

const CHECKOUT_METHOD_OPTIONS = [
    { value: 'mpesa', label: 'M-Pesa' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'paystack', label: 'Paystack' },
];

function parseCheckoutMethods(raw) {
    const keys = String(raw || '')
        .split(',')
        .map((part) => part.trim().toLowerCase())
        .filter(Boolean);
    const allowed = CHECKOUT_METHOD_OPTIONS.map((opt) => opt.value);
    return keys.filter((key) => allowed.includes(key));
}

function MethodToggle({ on, onChange, label }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={`${label} ${on ? 'on' : 'off'}`}
            onClick={(e) => {
                e.stopPropagation();
                onChange(!on);
            }}
            className={`relative h-6 w-11 shrink-0 border transition ${
                on
                    ? 'border-olive-900 bg-olive-900 dark:border-mustard dark:bg-mustard'
                    : 'border-olive-300 bg-olive-100 dark:border-olive-600 dark:bg-olive-800'
            }`}
        >
            <span
                aria-hidden
                className={`absolute top-0.5 h-4.5 w-4.5 bg-white transition-all ${
                    on ? 'left-[1.35rem]' : 'left-0.5'
                }`}
                style={{ height: '1.125rem', width: '1.125rem' }}
            />
        </button>
    );
}

function PaymentsFields({ items, valueFor, updateValue }) {
    const map = useMemo(() => byKey(items), [items]);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const provider = valueFor('mobile_money_provider') || 'mpesa';
    const paypalMode = valueFor('paypal_mode') || 'sandbox';
    const paystackMode = valueFor('paystack_mode') || 'live';
    const mpesaMode = valueFor('mpesa_mode') || 'sandbox';
    const intasendMode = valueFor('intasend_mode') || 'sandbox';
    const palplussMode = valueFor('palpluss_mode') || 'sandbox';
    const enabledMethods = parseCheckoutMethods(
        valueFor('enabled_checkout_methods'),
    );
    const providerHint =
        provider === 'intasend'
            ? 'IntaSend'
            : provider === 'palpluss'
              ? 'Palpluss'
              : 'Daraja';

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

    const setMethodEnabled = (value, enabled) => {
        const next = enabled
            ? [...enabledMethods, value]
            : enabledMethods.filter((key) => key !== value);
        const ordered = CHECKOUT_METHOD_OPTIONS.map((opt) => opt.value).filter(
            (key) => next.includes(key),
        );
        updateValue('enabled_checkout_methods', ordered.join(','));
    };

    return (
        <div className="space-y-6">
            <Section title="Checkout methods">
                <div className="sm:col-span-2">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {CHECKOUT_METHOD_OPTIONS.map((opt) => {
                            const enabled = enabledMethods.includes(opt.value);
                            const selected = selectedMethod === opt.value;
                            return (
                                <div
                                    key={opt.value}
                                    className={`flex min-h-12 items-center gap-3 border px-3 py-2.5 transition ${
                                        selected
                                            ? 'border-olive-900 bg-olive-950 text-white dark:border-mustard dark:bg-mustard dark:text-earth-dusk'
                                            : 'border-olive-200 bg-white text-olive-800 hover:border-olive-400 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-200'
                                    }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedMethod((current) =>
                                                current === opt.value
                                                    ? null
                                                    : opt.value,
                                            )
                                        }
                                        aria-pressed={selected}
                                        className="min-w-0 flex-1 text-left text-sm font-semibold"
                                    >
                                        {opt.label}
                                        <span
                                            className={`mt-0.5 block text-xs font-medium ${
                                                selected
                                                    ? 'text-white/70 dark:text-earth-dusk/70'
                                                    : 'text-olive-400'
                                            }`}
                                        >
                                            {enabled ? 'On for members' : 'Off'}
                                        </span>
                                    </button>
                                    <MethodToggle
                                        on={enabled}
                                        label={opt.label}
                                        onChange={(next) =>
                                            setMethodEnabled(opt.value, next)
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                    {!selectedMethod ? (
                        <p className="mt-3 text-sm text-olive-500 dark:text-olive-400">
                            Select a method to edit its credentials.
                        </p>
                    ) : null}
                </div>
            </Section>

            {selectedMethod === 'mpesa' ? (
                <Section title="M-Pesa" hint={providerHint}>
                    {field(
                        'mobile_money_provider',
                        'Checkout provider',
                        'sm:col-span-2',
                    )}

                    {provider === 'mpesa' ? (
                        <>
                            {field('mpesa_mode', 'Environment', 'sm:col-span-2')}
                            {mpesaMode === 'live' ? (
                                <>
                                    {field('mpesa_live_consumer_key', 'Consumer key')}
                                    {field(
                                        'mpesa_live_consumer_secret',
                                        'Consumer secret',
                                    )}
                                    {field(
                                        'mpesa_live_shortcode',
                                        'Shortcode / Paybill',
                                    )}
                                    {field('mpesa_live_passkey', 'Passkey')}
                                </>
                            ) : (
                                <>
                                    {field(
                                        'mpesa_sandbox_consumer_key',
                                        'Consumer key',
                                    )}
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
                            {field(
                                'intasend_mode',
                                'Environment',
                                'sm:col-span-2',
                            )}
                            {intasendMode === 'live' ? (
                                <>
                                    {field(
                                        'intasend_live_public_key',
                                        'Public key',
                                    )}
                                    {field(
                                        'intasend_live_secret_key',
                                        'Secret key',
                                    )}
                                </>
                            ) : (
                                <>
                                    {field(
                                        'intasend_sandbox_public_key',
                                        'Public key',
                                    )}
                                    {field(
                                        'intasend_sandbox_secret_key',
                                        'Secret key',
                                    )}
                                </>
                            )}
                        </>
                    ) : null}

                    {provider === 'palpluss' ? (
                        <>
                            {field(
                                'palpluss_mode',
                                'Environment',
                                'sm:col-span-2',
                            )}
                            {palplussMode === 'live' ? (
                                <>
                                    {field('palpluss_live_api_key', 'API key')}
                                    {field(
                                        'palpluss_live_channel_id',
                                        'Channel ID (optional)',
                                    )}
                                </>
                            ) : (
                                <>
                                    {field(
                                        'palpluss_sandbox_api_key',
                                        'API key',
                                    )}
                                    {field(
                                        'palpluss_sandbox_channel_id',
                                        'Channel ID (optional)',
                                    )}
                                </>
                            )}
                            {field(
                                'palpluss_callback_url',
                                'Callback URL (optional)',
                                'sm:col-span-2',
                            )}
                            {field(
                                'palpluss_webhook_secret',
                                'Webhook signing secret',
                                'sm:col-span-2',
                            )}
                            <p className="sm:col-span-2 text-sm leading-relaxed text-olive-500 dark:text-olive-400">
                                Add nanyukinow.co.ke under Palpluss Webhooks, paste the
                                whsec_ secret here, and point callbacks to{' '}
                                <code className="font-mono text-[12px] text-olive-800 dark:text-olive-200">
                                    /webhooks/palpluss
                                </code>
                                .
                            </p>
                        </>
                    ) : null}
                </Section>
            ) : null}

            {selectedMethod === 'paypal' ? (
                <Section
                    title="PayPal"
                    hint={paypalMode === 'live' ? 'Live' : 'Sandbox'}
                >
                    {field('paypal_mode', 'Environment', 'sm:col-span-2')}
                    {paypalMode === 'live' ? (
                        <>
                            {field('paypal_live_client_id', 'Client ID')}
                            {field('paypal_live_secret', 'Secret')}
                            {field(
                                'paypal_live_webhook_id',
                                'Webhook ID',
                                'sm:col-span-2',
                            )}
                        </>
                    ) : (
                        <>
                            {field('paypal_sandbox_client_id', 'Client ID')}
                            {field('paypal_sandbox_secret', 'Secret')}
                            {field(
                                'paypal_sandbox_webhook_id',
                                'Webhook ID',
                                'sm:col-span-2',
                            )}
                        </>
                    )}
                    {field('paypal_checkout_currency', 'Charge currency')}
                    {field('paypal_kes_per_usd', 'KES per 1 USD')}
                    <p className="sm:col-span-2 text-sm leading-relaxed text-olive-500 dark:text-olive-400">
                        PayPal webhook:{' '}
                        <code className="font-mono text-[12px] text-olive-800 dark:text-olive-200">
                            /webhooks/paypal
                        </code>
                    </p>
                </Section>
            ) : null}

            {selectedMethod === 'paystack' ? (
                <Section
                    title="Paystack"
                    hint={paystackMode === 'live' ? 'Live' : 'Sandbox'}
                >
                    {field('paystack_mode', 'Environment', 'sm:col-span-2')}
                    {paystackMode === 'live' ? (
                        <>
                            {field(
                                'paystack_live_secret_key',
                                'Secret / API key',
                            )}
                            {field(
                                'paystack_live_public_key',
                                'Public key (optional)',
                            )}
                        </>
                    ) : (
                        <>
                            {field(
                                'paystack_sandbox_secret_key',
                                'Secret / API key',
                            )}
                            {field(
                                'paystack_sandbox_public_key',
                                'Public key (optional)',
                            )}
                        </>
                    )}
                    {field(
                        'paystack_channels',
                        'Channels (optional)',
                        'sm:col-span-2',
                    )}
                    <p className="sm:col-span-2 text-sm leading-relaxed text-olive-500 dark:text-olive-400">
                        Paystack webhook:{' '}
                        <code className="font-mono text-[12px] text-olive-800 dark:text-olive-200">
                            /webhooks/paystack
                        </code>
                    </p>
                </Section>
            ) : null}

        </div>
    );
}

function MapsFields({ items, valueFor, updateValue }) {
    const map = useMemo(() => byKey(items), [items]);
    const provider = valueFor('map_provider') || 'google';
    const placeSearch = valueFor('place_search_provider') || 'foursquare';

    const field = (key, label, className) => {
        const item = map[key];
        if (!item) {
            return null;
        }

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
            <FieldGrid>
                {field('map_provider', 'Map provider', 'sm:col-span-2')}
                {provider === 'google'
                    ? field(
                          'google_maps_api_key',
                          'Google Maps API key',
                          'sm:col-span-2',
                      )
                    : null}
                {provider === 'leaflet'
                    ? field(
                          'place_search_provider',
                          'Place search',
                          'sm:col-span-2',
                      )
                    : null}
                {provider === 'leaflet' && placeSearch === 'foursquare'
                    ? field(
                          'foursquare_api_key',
                          'Foursquare API key',
                          'sm:col-span-2',
                      )
                    : null}
            </FieldGrid>
            <p className="text-sm leading-relaxed text-olive-500 dark:text-olive-400">
                {provider === 'leaflet'
                    ? 'OpenStreetMap needs no tile key. This updates Explore, directions, and the listing location picker after you save.'
                    : 'Google Maps also powers Places search. If the map errors, check billing, Maps JavaScript API, and HTTP referrer restrictions on the key.'}
            </p>
        </div>
    );
}

function BrandingFields({ items, valueFor, updateValue }) {
    const map = byKey(items);
    const item = map.site_name;
    if (!item) {
        return null;
    }

    return (
        <FieldGrid>
            <Field
                item={item}
                value={valueFor('site_name')}
                onChange={updateValue}
                label="Site name"
                className="sm:col-span-2"
            />
        </FieldGrid>
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

    const [tab, setTab] = useState(groups[0] || 'branding');
    const activeGroup = groups.includes(tab) ? tab : groups[0];
    const activeMeta = groupMeta[activeGroup] || {
        title: activeGroup,
        blurb: null,
    };
    const activeItems = groupedSettings[activeGroup] || [];

    const tabItems = groups.map((group) => ({
        id: group,
        label: (groupMeta[group] || { title: group }).title,
    }));

    return (
        <AdminLayout>
            <Head title="Settings" />

            <PageHeader title="Settings" />

            <AdminTabs
                items={tabItems}
                value={activeGroup}
                onChange={setTab}
                label="Settings groups"
            />

            <form onSubmit={save} className="w-full space-y-4 pb-24 sm:pb-8">
                <section className="border border-olive-200 bg-white dark:border-olive-800 dark:bg-olive-900">
                    {activeMeta.blurb ? (
                        <p className="border-b border-olive-100 px-5 py-3 text-sm text-olive-500 dark:border-olive-800 dark:text-olive-400 sm:px-6">
                            {activeMeta.blurb}
                        </p>
                    ) : null}
                    <div className="px-5 py-5 sm:px-6 sm:py-6">
                        {activeGroup === 'payments' ? (
                            <PaymentsFields
                                items={activeItems}
                                valueFor={valueFor}
                                updateValue={updateValue}
                            />
                        ) : activeGroup === 'maps' ? (
                            <MapsFields
                                items={activeItems}
                                valueFor={valueFor}
                                updateValue={updateValue}
                            />
                        ) : activeGroup === 'branding' ? (
                            <BrandingFields
                                items={activeItems}
                                valueFor={valueFor}
                                updateValue={updateValue}
                            />
                        ) : (
                            <FieldGrid>
                                {activeItems.map((item) => (
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
                    </div>
                </section>

                <div className="fixed inset-x-0 bottom-0 z-20 border-t border-olive-200 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-olive-800 dark:bg-olive-950/95 sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none dark:sm:bg-transparent">
                    <div className="mx-auto flex max-w-site items-center justify-end gap-3 sm:mx-0 sm:max-w-none">
                        {form.isDirty ? (
                            <p className="mr-auto text-sm text-olive-500">
                                Unsaved changes
                            </p>
                        ) : null}
                        <AdminButton
                            type="submit"
                            disabled={form.processing || !form.isDirty}
                        >
                            {form.processing ? 'Saving…' : 'Save settings'}
                        </AdminButton>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
