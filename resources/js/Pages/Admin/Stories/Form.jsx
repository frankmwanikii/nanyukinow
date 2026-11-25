import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminButton,
    AdminInput,
    AdminSelect,
    AdminTextarea,
    AdminLink,
    FormPanel,
    StatusBadge,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import RichTextEditor from '@/Components/listing-form/RichTextEditor';
import UploadProgressBar from '@/Components/site/UploadProgressBar';
import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ExternalLink,
    Images,
    Plus,
    Save,
    Trash2,
    Upload,
    X,
} from '@/Components/site/LucideCompat';
import axios from 'axios';
import { useRef, useState } from 'react';

function emptySection() {
    return {
        id: '',
        title: '',
        paragraphs: '',
        list: [],
        image: '',
        imageAlt: '',
    };
}

function sectionsToForm(sections = []) {
    return (sections || []).map((section) => ({
        id: section.id || '',
        title: section.title || '',
        paragraphs: Array.isArray(section.paragraphs)
            ? section.paragraphs.join('\n\n')
            : section.paragraphs || '',
        list: Array.isArray(section.list)
            ? section.list.map((item) => ({
                  title: item.title || '',
                  text: item.text || '',
              }))
            : [],
        image: section.image || '',
        imageAlt: section.imageAlt || '',
    }));
}

function sectionsFromForm(sections = []) {
    return sections.map((section) => ({
        id: section.id || undefined,
        title: section.title || '',
        paragraphs: (section.paragraphs || '')
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean),
        list: (section.list || [])
            .map((item) => ({
                title: item.title || '',
                text: item.text || '',
            }))
            .filter((item) => item.title || item.text),
        image: section.image || '',
        imageAlt: section.imageAlt || '',
    }));
}

async function uploadCover(file, uploadUrl, onProgress) {
    const csrf =
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') || '';
    const body = new FormData();
    body.append('image', file);

    const { data } = await axios.post(uploadUrl, body, {
        headers: {
            Accept: 'application/json',
            'X-CSRF-TOKEN': csrf,
            'X-Requested-With': 'XMLHttpRequest',
        },
        onUploadProgress: (event) => {
            if (!onProgress) return;
            if (!event.total) {
                onProgress(event.loaded > 0 ? 50 : 0);
                return;
            }
            onProgress(
                Math.max(
                    0,
                    Math.min(100, Math.round((event.loaded / event.total) * 100)),
                ),
            );
        },
    });

    return typeof data?.url === 'string' ? data.url.trim() : null;
}

function FeaturedImageField({ value, onChange, uploadUrl, error }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadError, setUploadError] = useState(null);

    const runUpload = async (file) => {
        if (!file || uploading || !uploadUrl) return;
        if (!String(file.type || '').startsWith('image/')) {
            setUploadError('Choose a JPG, PNG, or WebP image.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setUploadError('Images must be 10MB or smaller.');
            return;
        }

        setUploadError(null);
        setUploading(true);
        setProgress(0);
        try {
            const url = await uploadCover(file, uploadUrl, setProgress);
            if (!url) {
                setUploadError('Could not upload that image. Try again.');
                return;
            }
            onChange(url);
        } catch (err) {
            setUploadError(
                err?.response?.data?.errors?.image?.[0] ||
                    err?.response?.data?.message ||
                    'Could not upload that image. Try again.',
            );
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="space-y-3">
            {value ? (
                <div className="relative overflow-hidden rounded-lg ring-1 ring-olive-200 dark:ring-olive-700">
                    <img
                        src={value}
                        alt=""
                        className="aspect-[16/9] w-full object-cover"
                    />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-olive-950/70 text-white transition hover:bg-olive-950"
                        aria-label="Remove image"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        runUpload(e.dataTransfer.files?.[0]);
                    }}
                    disabled={uploading}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-olive-300 bg-olive-50/60 px-4 py-10 text-center transition hover:border-olive-500 hover:bg-olive-50 dark:border-olive-700 dark:bg-olive-950/40"
                >
                    <Upload className="h-6 w-6 text-olive-500" />
                    <strong className="text-sm text-olive-900 dark:text-olive-50">
                        No featured image yet
                    </strong>
                    <span className="text-xs text-olive-500">
                        Drop a photo here, or click to upload
                    </span>
                    <span className="text-[0.7rem] text-olive-400">
                        16:9 · JPG, PNG, WEBP · max 10MB
                    </span>
                </button>
            )}

            {value ? (
                <AdminButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                >
                    <Upload className="h-3.5 w-3.5" />
                    Replace image
                </AdminButton>
            ) : null}

            {uploading ? <UploadProgressBar value={progress} /> : null}
            {(uploadError || error) && (
                <p className="text-sm text-rose-600">{uploadError || error}</p>
            )}

            <AdminInput
                label="Image URL"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="/storage/… or https://…"
            />
            <p className="text-xs text-olive-500">
                Or pick from the{' '}
                <a
                    href={route('admin.gallery.index', { source: 'stories' })}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-olive-700 underline-offset-2 hover:underline dark:text-mustard"
                >
                    Gallery
                </a>{' '}
                and paste the path.
            </p>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    runUpload(e.target.files?.[0]);
                    e.target.value = '';
                }}
            />
        </div>
    );
}

export default function Form({
    story,
    categories = [],
    uploadUrl = null,
    editorUploadUrl = null,
}) {
    const { confirm, dialog } = useConfirm();
    const isEdit = Boolean(story?.id);
    const [sectionsOpen, setSectionsOpen] = useState(
        Boolean(story?.sections?.length),
    );

    const form = useForm({
        title: story?.title || '',
        subtitle: story?.subtitle || '',
        slug: story?.slug || '',
        story_category_id: story?.story_category_id || '',
        excerpt: story?.excerpt || '',
        image_url: story?.image_url || '',
        author: story?.author || 'Nanyuki Now',
        read_minutes: story?.read_minutes || 5,
        body: story?.body || '',
        pro_tip: story?.pro_tip || '',
        is_published: story?.is_published || false,
        is_featured: story?.is_featured || false,
        published_at: story?.published_at || '',
        sections: sectionsToForm(story?.sections || []),
    });

    const { data, setData, processing, errors } = form;
    const liveUrl =
        isEdit && data.is_published && story?.slug
            ? route('stories.show', story.slug)
            : null;

    const updateSection = (index, key, value) => {
        const next = data.sections.map((section, i) =>
            i === index ? { ...section, [key]: value } : section,
        );
        setData('sections', next);
    };

    const updateListItem = (sectionIndex, itemIndex, key, value) => {
        const next = data.sections.map((section, i) => {
            if (i !== sectionIndex) return section;
            const list = (section.list || []).map((item, j) =>
                j === itemIndex ? { ...item, [key]: value } : item,
            );
            return { ...section, list };
        });
        setData('sections', next);
    };

    const save = (e) => {
        e.preventDefault();
        form.transform((d) => ({
            ...d,
            story_category_id: d.story_category_id || null,
            published_at: d.published_at || null,
            sections: sectionsFromForm(d.sections),
        }));
        const url = isEdit
            ? route('admin.stories.update', story.id)
            : route('admin.stories.store');
        if (isEdit) {
            form.put(url, { preserveScroll: true });
        } else {
            form.post(url);
        }
    };

    return (
        <AdminLayout>
            <Head title={isEdit ? `Edit · ${story.title}` : 'New story'} />
            {dialog}

            <form onSubmit={save} className="relative pb-24">
                <header className="mb-5 flex flex-col gap-4 border-b border-olive-100 pb-5 dark:border-olive-800 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-olive-500">
                            Newsroom
                        </p>
                        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-olive-950 dark:text-white">
                            {isEdit ? 'Edit story' : 'New story'}
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-olive-600 dark:text-olive-300">
                            {isEdit
                                ? 'Update the headline, body, and publish settings. Changes go live when status is Published.'
                                : 'Write the story, add a featured image, then publish when it is ready.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                            status={data.is_published ? 'published' : 'draft'}
                        />
                        {data.is_featured ? (
                            <span className="inline-flex items-center rounded-full bg-mustard/25 px-2.5 py-1 text-xs font-semibold text-olive-900 dark:text-mustard">
                                Featured
                            </span>
                        ) : null}
                    </div>
                </header>

                <div className="mb-5 flex flex-wrap gap-2">
                    <AdminLink href={route('admin.stories.index')} variant="secondary">
                        <ArrowLeft className="h-4 w-4" />
                        All stories
                    </AdminLink>
                    <AdminLink href={route('admin.stories.create')} variant="secondary">
                        <Plus className="h-4 w-4" />
                        New story
                    </AdminLink>
                    {liveUrl ? (
                        <a
                            href={liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-md border border-olive-200 bg-white px-3 py-2 text-sm font-semibold text-olive-800 transition hover:bg-olive-50 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100"
                        >
                            <ExternalLink className="h-4 w-4" />
                            View live
                        </a>
                    ) : null}
                    <a
                        href={route('admin.gallery.index', { source: 'stories' })}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-md border border-olive-200 bg-white px-3 py-2 text-sm font-semibold text-olive-800 transition hover:bg-olive-50 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100"
                    >
                        <Images className="h-4 w-4" />
                        Gallery
                    </a>
                    {isEdit ? (
                        <AdminButton
                            type="button"
                            variant="danger"
                            onClick={async () => {
                                const ok = await confirm({
                                    title: 'Delete story?',
                                    message:
                                        'Delete this story? This cannot be undone.',
                                    confirmLabel: 'Delete',
                                });
                                if (!ok) return;
                                router.delete(
                                    route('admin.stories.destroy', story.id),
                                );
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </AdminButton>
                    ) : null}
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)] lg:items-start">
                    <div className="min-w-0 space-y-4">
                        <FormPanel
                            title="Compose"
                            description="Headline and body as readers will see them."
                        >
                            <div className="space-y-4">
                                <AdminInput
                                    label="Headline"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    error={errors.title}
                                    required
                                    placeholder="Write a clear headline"
                                />
                                <AdminInput
                                    label="Sub-headline"
                                    value={data.subtitle}
                                    onChange={(e) =>
                                        setData('subtitle', e.target.value)
                                    }
                                    error={errors.subtitle}
                                    placeholder="Short hook under the title"
                                />
                                <AdminTextarea
                                    label="Summary"
                                    value={data.excerpt}
                                    onChange={(e) =>
                                        setData('excerpt', e.target.value)
                                    }
                                    error={errors.excerpt}
                                    rows={3}
                                    placeholder="1–2 sentences for cards and listings"
                                />
                                <RichTextEditor
                                    id="story-body"
                                    label="Article body"
                                    value={data.body}
                                    onChange={(html) => setData('body', html)}
                                    error={errors.body}
                                    placeholder="Tell the story…"
                                    uploadUrl={editorUploadUrl}
                                    allowImages
                                />
                            </div>
                        </FormPanel>

                        <FormPanel
                            title="Structured sections"
                            description="Optional layout blocks for multi-part guides. Most stories only need the article body above."
                        >
                            <div className="mb-3">
                                <AdminButton
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {
                                        setSectionsOpen(true);
                                        setData('sections', [
                                            ...data.sections,
                                            emptySection(),
                                        ]);
                                    }}
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add section
                                </AdminButton>
                                {data.sections.length > 0 ? (
                                    <button
                                        type="button"
                                        className="ml-3 text-sm font-semibold text-olive-600 underline-offset-2 hover:underline"
                                        onClick={() =>
                                            setSectionsOpen((open) => !open)
                                        }
                                    >
                                        {sectionsOpen ? 'Collapse' : 'Expand'}
                                    </button>
                                ) : null}
                            </div>

                            {data.sections.length === 0 ? (
                                <p className="text-sm text-olive-500">
                                    No sections yet.
                                </p>
                            ) : sectionsOpen ? (
                                <div className="space-y-6">
                                    {data.sections.map((section, index) => (
                                        <div
                                            key={index}
                                            className="space-y-3 rounded-lg border border-olive-100 p-4 dark:border-olive-800"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-semibold text-olive-800 dark:text-olive-100">
                                                    Section {index + 1}
                                                </p>
                                                <AdminButton
                                                    type="button"
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() =>
                                                        setData(
                                                            'sections',
                                                            data.sections.filter(
                                                                (_, i) =>
                                                                    i !== index,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Remove
                                                </AdminButton>
                                            </div>
                                            <div className="grid gap-3 md:grid-cols-2">
                                                <AdminInput
                                                    label="Title"
                                                    value={section.title}
                                                    onChange={(e) =>
                                                        updateSection(
                                                            index,
                                                            'title',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="md:col-span-2"
                                                />
                                                <AdminInput
                                                    label="Section id"
                                                    value={section.id}
                                                    onChange={(e) =>
                                                        updateSection(
                                                            index,
                                                            'id',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="auto from title"
                                                />
                                                <AdminInput
                                                    label="Image URL"
                                                    value={section.image}
                                                    onChange={(e) =>
                                                        updateSection(
                                                            index,
                                                            'image',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <AdminInput
                                                    label="Image alt"
                                                    value={section.imageAlt}
                                                    onChange={(e) =>
                                                        updateSection(
                                                            index,
                                                            'imageAlt',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="md:col-span-2"
                                                />
                                                <div className="md:col-span-2">
                                                    <AdminTextarea
                                                        label="Paragraphs"
                                                        value={
                                                            section.paragraphs
                                                        }
                                                        onChange={(e) =>
                                                            updateSection(
                                                                index,
                                                                'paragraphs',
                                                                e.target.value,
                                                            )
                                                        }
                                                        rows={5}
                                                    />
                                                    <p className="mt-1.5 text-xs text-olive-500">
                                                        Separate paragraphs with
                                                        a blank line.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                                        List items
                                                    </p>
                                                    <AdminButton
                                                        type="button"
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            updateSection(
                                                                index,
                                                                'list',
                                                                [
                                                                    ...(section.list ||
                                                                        []),
                                                                    {
                                                                        title: '',
                                                                        text: '',
                                                                    },
                                                                ],
                                                            )
                                                        }
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        Add item
                                                    </AdminButton>
                                                </div>
                                                {(section.list || []).map(
                                                    (item, itemIndex) => (
                                                        <div
                                                            key={itemIndex}
                                                            className="grid gap-2 rounded-md bg-olive-50/60 p-3 dark:bg-olive-950/40 md:grid-cols-[1fr_1.4fr_auto]"
                                                        >
                                                            <AdminInput
                                                                label="Item title"
                                                                value={
                                                                    item.title
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) =>
                                                                    updateListItem(
                                                                        index,
                                                                        itemIndex,
                                                                        'title',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            <AdminInput
                                                                label="Item text"
                                                                value={
                                                                    item.text
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) =>
                                                                    updateListItem(
                                                                        index,
                                                                        itemIndex,
                                                                        'text',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            <div className="flex items-end">
                                                                <AdminButton
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    onClick={() =>
                                                                        updateSection(
                                                                            index,
                                                                            'list',
                                                                            (
                                                                                section.list ||
                                                                                []
                                                                            ).filter(
                                                                                (
                                                                                    _,
                                                                                    i,
                                                                                ) =>
                                                                                    i !==
                                                                                    itemIndex,
                                                                            ),
                                                                        )
                                                                    }
                                                                >
                                                                    Remove
                                                                </AdminButton>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-olive-500">
                                    {data.sections.length} section
                                    {data.sections.length === 1 ? '' : 's'}{' '}
                                    hidden. Expand to edit.
                                </p>
                            )}
                        </FormPanel>
                    </div>

                    <aside className="min-w-0 space-y-4 lg:sticky lg:top-24">
                        <FormPanel
                            title="Publish"
                            description="Status, schedule, and discovery."
                        >
                            <div className="space-y-4">
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                    <AdminSelect
                                        label="Status"
                                        value={
                                            data.is_published
                                                ? 'published'
                                                : 'draft'
                                        }
                                        onChange={(e) =>
                                            setData(
                                                'is_published',
                                                e.target.value === 'published',
                                            )
                                        }
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">
                                            Published
                                        </option>
                                    </AdminSelect>
                                    <AdminInput
                                        label="Publish date"
                                        type="datetime-local"
                                        value={data.published_at}
                                        onChange={(e) =>
                                            setData(
                                                'published_at',
                                                e.target.value,
                                            )
                                        }
                                        error={errors.published_at}
                                    />
                                </div>

                                <AdminSelect
                                    label="Category"
                                    value={data.story_category_id}
                                    onChange={(e) =>
                                        setData(
                                            'story_category_id',
                                            e.target.value,
                                        )
                                    }
                                    error={errors.story_category_id}
                                    required={data.is_published}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </AdminSelect>
                                {categories.length === 0 ? (
                                    <p className="text-xs text-olive-500">
                                        <AdminLink
                                            href={route(
                                                'admin.story-categories.index',
                                            )}
                                            variant="secondary"
                                            className="!inline !px-0 !py-0 !text-xs !font-semibold !shadow-none !ring-0"
                                        >
                                            Add a category
                                        </AdminLink>{' '}
                                        first.
                                    </p>
                                ) : null}

                                <AdminInput
                                    label="Author"
                                    value={data.author}
                                    onChange={(e) =>
                                        setData('author', e.target.value)
                                    }
                                    error={errors.author}
                                />
                                <AdminInput
                                    label="URL slug"
                                    value={data.slug}
                                    onChange={(e) =>
                                        setData('slug', e.target.value)
                                    }
                                    error={errors.slug}
                                    placeholder="auto-from-title"
                                />
                                <AdminInput
                                    label="Read minutes"
                                    type="number"
                                    min="1"
                                    value={data.read_minutes}
                                    onChange={(e) =>
                                        setData('read_minutes', e.target.value)
                                    }
                                    error={errors.read_minutes}
                                />
                                <AdminTextarea
                                    label="Pro tip"
                                    value={data.pro_tip}
                                    onChange={(e) =>
                                        setData('pro_tip', e.target.value)
                                    }
                                    error={errors.pro_tip}
                                    rows={3}
                                />

                                <label className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-olive-100 bg-olive-50/50 px-3 py-3 dark:border-olive-800 dark:bg-olive-950/40">
                                    <span>
                                        <strong className="block text-sm text-olive-900 dark:text-olive-50">
                                            Featured post
                                        </strong>
                                        <small className="text-xs text-olive-500">
                                            Prefer this story on the home strip
                                        </small>
                                    </span>
                                    <input
                                        type="checkbox"
                                        className="mt-1 rounded border-olive-300 text-olive-700 focus:ring-olive-600"
                                        checked={data.is_featured}
                                        onChange={(e) =>
                                            setData(
                                                'is_featured',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                </label>
                            </div>
                        </FormPanel>

                        <FormPanel
                            title="Featured image"
                            description="Shown on cards, listings, and social previews."
                        >
                            <FeaturedImageField
                                value={data.image_url}
                                onChange={(url) => setData('image_url', url)}
                                uploadUrl={uploadUrl}
                                error={errors.image_url}
                            />
                        </FormPanel>
                    </aside>
                </div>

                <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end p-3 sm:p-4">
                    <div className="pointer-events-auto flex w-full max-w-lg flex-wrap items-center justify-end gap-2 rounded-xl border border-olive-200 bg-white/95 px-3 py-2.5 shadow-lift backdrop-blur dark:border-olive-700 dark:bg-olive-900/95 sm:px-4">
                        <AdminLink
                            href={route('admin.stories.index')}
                            variant="secondary"
                        >
                            Cancel
                        </AdminLink>
                        {liveUrl ? (
                            <a
                                href={liveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-md border border-olive-200 bg-white px-3 py-2 text-sm font-semibold text-olive-800 transition hover:bg-olive-50 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-100"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Preview
                            </a>
                        ) : null}
                        <AdminButton type="submit" disabled={processing}>
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving…' : 'Save story'}
                        </AdminButton>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
