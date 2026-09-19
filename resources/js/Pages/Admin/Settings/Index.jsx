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
    home: 'Home page',
    pages: 'Site pages & contact',
    billing: 'Membership & upgrades',
    payments: 'Payment gateways',
    social: 'Social links',
    seo: 'SEO & sharing',
};

const groupOrder = ['branding', 'home', 'pages', 'billing', 'payments', 'social', 'seo'];

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
            form.data.settings.map((row) => (row.key === key ? { ...row, value } : row)),
        );
    };

    const valueFor = (key) => form.data.settings.find((row) => row.key === key)?.value || '';

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

    const renderField = (item) => {
        const value = valueFor(item.key);

        if (item.type === 'select') {
            return (
                <AdminSelect
                    label={item.label}
                    value={value}
                    onChange={(e) => updateValue(item.key, e.target.value)}
                >
                    {(item.options || []).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </AdminSelect>
            );
        }

        if (item.type === 'password') {
            return (
                <AdminPasswordInput
                    label={item.label}
                    value={value}
                    onChange={(e) => updateValue(item.key, e.target.value)}
                    autoComplete="off"
                />
            );
        }

        if (item.type === 'textarea') {
            return (
                <AdminTextarea
                    label={item.label}
                    value={value}
                    onChange={(e) => updateValue(item.key, e.target.value)}
                    rows={4}
                />
            );
        }

        return (
            <AdminInput
                label={item.label}
                value={value}
                onChange={(e) => updateValue(item.key, e.target.value)}
            />
        );
    };

    return (
        <AdminLayout title="Site & pages">
            <Head title="Admin settings" />

            <p className="mb-5 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Edit site-wide content, payment credentials, and social links. Switch M-Pesa
                between Daraja and IntaSend, and PayPal / gateway modes, without redeploying.
            </p>

            <form onSubmit={save} className="space-y-4">
                {groups.map((group) => (
                    <FormPanel key={group} title={groupLabels[group] || group}>
                        <div className="grid gap-4 md:grid-cols-2">
                            {(groupedSettings[group] || []).map((item) => (
                                <div
                                    key={item.key}
                                    className={item.type === 'textarea' ? 'md:col-span-2' : ''}
                                >
                                    {renderField(item)}
                                    {item.help && (
                                        <p className="mt-1.5 text-sm text-olive-500 dark:text-olive-400">
                                            {item.help}
                                        </p>
                                    )}
                                    {item.type === 'image' && valueFor(item.key) && (
                                        <img
                                            src={valueFor(item.key)}
                                            alt=""
                                            className="mt-2 h-24 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </FormPanel>
                ))}

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
