import AdminLayout from '@/Layouts/AdminLayout';
import { AdminButton, AdminInput, AdminTextarea, FormPanel } from '@/Components/Admin/ui';
import { Head, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useMemo } from 'react';

const groupLabels = {
    branding: 'Branding',
    home: 'Home page',
    pages: 'Site pages & contact',
    billing: 'Membership & upgrades',
    social: 'Social links',
    seo: 'SEO & sharing',
};

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

    const groups = Object.keys(groupedSettings || {});

    return (
        <AdminLayout title="Site & pages">
            <Head title="Admin settings" />

            <p className="mb-5 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Edit site-wide content, hero imagery, contact details, and social links.
                Changes here power the public surfaces without redeploying code.
            </p>

            <form onSubmit={save} className="space-y-4">
                {groups.map((group) => (
                    <FormPanel key={group} title={groupLabels[group] || group}>
                        <div className="grid gap-4 md:grid-cols-2">
                            {(groupedSettings[group] || []).map((item) => {
                                const Field = item.type === 'textarea' ? AdminTextarea : AdminInput;
                                return (
                                    <div key={item.key} className={item.type === 'textarea' ? 'md:col-span-2' : ''}>
                                        <Field
                                            label={item.label}
                                            value={valueFor(item.key)}
                                            onChange={(e) => updateValue(item.key, e.target.value)}
                                            rows={item.type === 'textarea' ? 4 : undefined}
                                        />
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
                                );
                            })}
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
