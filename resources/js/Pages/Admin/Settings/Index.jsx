import AdminLayout from '@/Layouts/AdminLayout';
import { AdminButton, AdminInput, AdminTextarea } from '@/Components/Admin/ui';
import { Head, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useMemo } from 'react';

const groupLabels = {
    branding: 'Branding',
    home: 'Home page',
    pages: 'Site pages & contact',
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

            <p className="mb-6 max-w-2xl text-sm text-olive-700">
                Edit site-wide content, hero imagery, contact details, and social links.
                Changes here power the public surfaces without redeploying code.
            </p>

            <form onSubmit={save} className="space-y-6">
                {groups.map((group) => (
                    <section key={group} className="rounded-2xl border border-olive-200/80 bg-white p-5 shadow-soft">
                        <h2 className="mb-4 font-display text-lg text-olive-950">
                            {groupLabels[group] || group}
                        </h2>
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
                                            <p className="mt-1 text-xs text-olive-500">{item.help}</p>
                                        )}
                                        {item.type === 'image' && valueFor(item.key) && (
                                            <img
                                                src={valueFor(item.key)}
                                                alt=""
                                                className="mt-2 h-24 rounded-xl object-cover ring-1 ring-olive-200"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}

                <div className="flex justify-end">
                    <AdminButton type="submit" variant="mustard" disabled={form.processing}>
                        <Save className="h-4 w-4" />
                        {form.processing ? 'Saving…' : 'Save settings'}
                    </AdminButton>
                </div>
            </form>
        </AdminLayout>
    );
}
