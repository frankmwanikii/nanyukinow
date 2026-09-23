import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminButton,
    AdminInput,
    AdminLink,
    AdminTextarea,
    FormPanel,
} from '@/Components/Admin/ui';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, Save } from 'lucide-react';

export default function Edit({ page }) {
    const form = useForm({
        title: page.title || '',
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        is_published: Boolean(page.is_published),
        content: Object.fromEntries(
            (page.fields || []).map((field) => [
                field.key,
                page.content?.[field.key] ?? '',
            ]),
        ),
    });

    const setContent = (key, value) => {
        form.setData('content', {
            ...form.data.content,
            [key]: value,
        });
    };

    const save = (e) => {
        e.preventDefault();
        form.put(route('admin.pages.update', page.id));
    };

    return (
        <AdminLayout title={`Edit · ${page.title}`}>
            <Head title={`Edit ${page.title}`} />

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <AdminLink href={route('admin.pages.index')} variant="secondary">
                        <ArrowLeft className="h-4 w-4" />
                        All pages
                    </AdminLink>
                    <p className="mt-3 font-mono text-xs text-olive-500">{page.path}</p>
                    <p className="mt-1 max-w-xl text-sm text-olive-600 dark:text-olive-300">
                        {page.description}
                    </p>
                </div>
                <a
                    href={page.public_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold text-olive-700 ring-1 ring-olive-200 transition hover:bg-olive-50 dark:text-olive-200 dark:ring-olive-700"
                >
                    <ExternalLink className="h-4 w-4" />
                    View live page
                </a>
            </div>

            <form onSubmit={save} className="space-y-4">
                <FormPanel title="Page details">
                    <div className="grid gap-4 md:grid-cols-2">
                        <AdminInput
                            label="Title"
                            value={form.data.title}
                            onChange={(e) => form.setData('title', e.target.value)}
                        />
                        <label className="flex items-center gap-3 rounded-lg border border-olive-200 px-3 py-3 dark:border-olive-700">
                            <input
                                type="checkbox"
                                checked={form.data.is_published}
                                onChange={(e) =>
                                    form.setData('is_published', e.target.checked)
                                }
                                className="rounded border-olive-300 text-mustard focus:ring-mustard"
                            />
                            <span className="text-sm font-semibold text-olive-800 dark:text-olive-100">
                                Published on the website
                            </span>
                        </label>
                        <AdminInput
                            label="SEO title"
                            value={form.data.meta_title}
                            onChange={(e) => form.setData('meta_title', e.target.value)}
                        />
                        <div className="md:col-span-2">
                            <AdminTextarea
                                label="SEO description"
                                rows={3}
                                value={form.data.meta_description}
                                onChange={(e) =>
                                    form.setData('meta_description', e.target.value)
                                }
                            />
                        </div>
                    </div>
                </FormPanel>

                <FormPanel
                    title="Page content"
                    description="These fields power the live page. Leave a legal body blank to keep the built-in Terms / Privacy layout."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        {(page.fields || []).map((field) => (
                            <div
                                key={field.key}
                                className={
                                    field.type === 'textarea' || field.type === 'image'
                                        ? 'md:col-span-2'
                                        : ''
                                }
                            >
                                {field.type === 'textarea' ? (
                                    <AdminTextarea
                                        label={field.label}
                                        rows={field.rows || 4}
                                        value={form.data.content[field.key] || ''}
                                        onChange={(e) =>
                                            setContent(field.key, e.target.value)
                                        }
                                    />
                                ) : (
                                    <AdminInput
                                        label={field.label}
                                        value={form.data.content[field.key] || ''}
                                        onChange={(e) =>
                                            setContent(field.key, e.target.value)
                                        }
                                    />
                                )}
                                {field.help ? (
                                    <p className="mt-1.5 text-sm text-olive-500 dark:text-olive-400">
                                        {field.help}
                                    </p>
                                ) : null}
                                {field.type === 'image' &&
                                form.data.content[field.key] ? (
                                    <img
                                        src={form.data.content[field.key]}
                                        alt=""
                                        className="mt-2 h-28 rounded-md object-cover ring-1 ring-olive-200 dark:ring-olive-700"
                                    />
                                ) : null}
                            </div>
                        ))}
                    </div>
                </FormPanel>

                <div className="flex justify-end">
                    <AdminButton type="submit" disabled={form.processing}>
                        <Save className="h-4 w-4" />
                        {form.processing ? 'Saving…' : 'Save page'}
                    </AdminButton>
                </div>
            </form>
        </AdminLayout>
    );
}
