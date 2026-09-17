import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminButton,
    AdminCheckbox,
    AdminInput,
    AdminTextarea,
    AdminLink,
    FormPanel,
} from '@/Components/Admin/ui';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

export default function Form({ story }) {
    const isEdit = Boolean(story?.id);

    const form = useForm({
        title: story?.title || '',
        slug: story?.slug || '',
        category: story?.category || '',
        excerpt: story?.excerpt || '',
        image_url: story?.image_url || '',
        author: story?.author || 'Nanyuki Now',
        read_minutes: story?.read_minutes || 5,
        body: story?.body || '',
        pro_tip: story?.pro_tip || '',
        is_published: story?.is_published || false,
        published_at: story?.published_at || '',
        sections: story?.sections || [],
    });

    const { data, setData, processing, errors } = form;

    const save = (e) => {
        e.preventDefault();
        form
            .transform((d) => ({
                ...d,
                published_at: d.published_at || null,
            }))
            [isEdit ? 'put' : 'post'](
                isEdit
                    ? route('admin.stories.update', story.id)
                    : route('admin.stories.store'),
            );
    };

    return (
        <AdminLayout
            title={isEdit ? 'Edit story' : 'New story'}
            actions={
                <div className="flex gap-2">
                    <AdminLink href={route('admin.stories.index')} variant="secondary">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </AdminLink>
                    {isEdit && (
                        <AdminButton
                            variant="danger"
                            onClick={() => {
                                if (confirm('Delete this story?')) {
                                    router.delete(route('admin.stories.destroy', story.id));
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </AdminButton>
                    )}
                </div>
            }
        >
            <Head title={isEdit ? `Edit · ${story.title}` : 'New story'} />

            <form onSubmit={save} className="space-y-4">
                <FormPanel title="Story content">
                    <div className="grid gap-4 md:grid-cols-2">
                        <AdminInput label="Title" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} className="md:col-span-2" required />
                        <AdminInput label="Slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} error={errors.slug} />
                        <AdminInput label="Category" value={data.category} onChange={(e) => setData('category', e.target.value)} error={errors.category} placeholder="Travel Tips, Stay…" />
                        <AdminInput label="Author" value={data.author} onChange={(e) => setData('author', e.target.value)} error={errors.author} />
                        <AdminInput label="Read minutes" type="number" min="1" value={data.read_minutes} onChange={(e) => setData('read_minutes', e.target.value)} error={errors.read_minutes} />
                        <AdminInput label="Cover image URL" value={data.image_url} onChange={(e) => setData('image_url', e.target.value)} error={errors.image_url} className="md:col-span-2" />
                        {data.image_url && (
                            <img src={data.image_url} alt="" className="h-40 w-full rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700 md:col-span-2" />
                        )}
                        <AdminTextarea label="Excerpt" value={data.excerpt} onChange={(e) => setData('excerpt', e.target.value)} error={errors.excerpt} rows={3} className="md:col-span-2" />
                        <AdminTextarea label="Body" value={data.body} onChange={(e) => setData('body', e.target.value)} error={errors.body} rows={8} className="md:col-span-2" />
                        <AdminTextarea label="Pro tip" value={data.pro_tip} onChange={(e) => setData('pro_tip', e.target.value)} error={errors.pro_tip} rows={3} className="md:col-span-2" />
                        <AdminInput label="Published at" type="datetime-local" value={data.published_at} onChange={(e) => setData('published_at', e.target.value)} error={errors.published_at} />
                        <div className="flex items-end">
                            <AdminCheckbox label="Published" checked={data.is_published} onChange={(e) => setData('is_published', e.target.checked)} />
                        </div>
                    </div>
                </FormPanel>

                <div className="flex justify-end gap-2">
                    <AdminLink href={route('admin.stories.index')} variant="secondary">
                        Cancel
                    </AdminLink>
                    <AdminButton type="submit" disabled={processing}>
                        <Save className="h-4 w-4" />
                        {processing ? 'Saving…' : 'Save story'}
                    </AdminButton>
                </div>
            </form>
        </AdminLayout>
    );
}
