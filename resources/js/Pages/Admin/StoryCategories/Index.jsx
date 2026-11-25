import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionMenu,
    AdminButton,
    AdminInput,
    AdminLink,
    DataCard,
    DataTable,
    EmptyState,
    PageHeader,
    Pagination,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Save, X } from '@/Components/site/LucideCompat';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';

function CategoryFormDialog({ category = null, onClose }) {
    const titleId = useId();
    const isEdit = Boolean(category?.id);

    const form = useForm({
        name: category?.name || '',
        sort_order: category?.sort_order ?? 0,
    });

    const { data, setData, processing, errors } = form;

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const save = (e) => {
        e.preventDefault();
        const opts = {
            preserveScroll: true,
            onSuccess: () => onClose?.(),
        };
        if (isEdit) {
            form.put(route('admin.story-categories.update', category.id), opts);
        } else {
            form.post(route('admin.story-categories.store'), opts);
        }
    };

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
            <button
                type="button"
                aria-label="Dismiss"
                className="absolute inset-0 bg-olive-950/55 backdrop-blur-[2px]"
                onClick={onClose}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="relative w-full max-w-lg overflow-hidden border border-olive-200 bg-white dark:border-olive-700 dark:bg-olive-900"
            >
                <div className="flex items-start justify-between gap-3 border-b border-olive-100 px-5 py-4 dark:border-olive-800">
                    <h2
                        id={titleId}
                        className="font-display text-lg font-semibold tracking-tight text-olive-950 dark:text-white"
                    >
                        {isEdit ? 'Edit story category' : 'Add story category'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-olive-400 transition hover:bg-olive-100 hover:text-olive-800 dark:hover:bg-olive-800 dark:hover:text-olive-100"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={save}>
                    <div className="grid gap-3.5 px-5 py-5">
                        <AdminInput
                            label="Name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            required
                            autoFocus
                        />
                        <AdminInput
                            label="Sort order"
                            type="number"
                            value={data.sort_order}
                            onChange={(e) => setData('sort_order', e.target.value)}
                            error={errors.sort_order}
                        />
                    </div>

                    <div className="flex justify-end gap-2 border-t border-olive-100 bg-olive-50/70 px-5 py-3 dark:border-olive-800 dark:bg-olive-950/40">
                        <AdminButton
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </AdminButton>
                        <AdminButton type="submit" size="sm" disabled={processing}>
                            <Save className="h-3.5 w-3.5" />
                            {processing
                                ? 'Saving…'
                                : isEdit
                                  ? 'Save changes'
                                  : 'Create'}
                        </AdminButton>
                    </div>
                </form>
            </div>
        </div>,
        document.body,
    );
}

export default function Index({ categories, filters = {} }) {
    const { confirm, dialog } = useConfirm();
    const [formCategory, setFormCategory] = useState(undefined);
    const rows = categories?.data || categories || [];
    const total = categories?.meta?.total ?? rows.length;
    const perPage = filters.per_page || categories?.meta?.per_page || 15;

    const setPerPage = (n) => {
        router.get(
            route('admin.story-categories.index'),
            { per_page: n },
            { preserveState: true, preserveScroll: true },
        );
    };

    const remove = async (category) => {
        const ok = await confirm({
            title: 'Delete category?',
            message: `Delete story category “${category.name}”?`,
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        router.delete(route('admin.story-categories.destroy', category.id));
    };

    return (
        <AdminLayout>
            <Head title="Story categories" />
            {dialog}

            <PageHeader
                title="Story categories"
                description="Topics used to organize Stories on the public site."
                actions={
                    <div className="flex flex-wrap gap-2">
                        <AdminLink href={route('admin.stories.index')} variant="secondary">
                            Back to stories
                        </AdminLink>
                        <AdminButton size="sm" onClick={() => setFormCategory(null)}>
                            <Plus className="h-3.5 w-3.5" />
                            Add category
                        </AdminButton>
                    </div>
                }
            />

            {rows.length === 0 ? (
                <EmptyState
                    title="No story categories"
                    description="Create topics so editors can assign stories."
                    action={
                        <AdminButton size="sm" onClick={() => setFormCategory(null)}>
                            <Plus className="h-3.5 w-3.5" />
                            Add category
                        </AdminButton>
                    }
                />
            ) : (
                <DataCard
                    title={`${total} categories`}
                    footer={
                        <Pagination
                            links={categories.links}
                            meta={categories.meta || categories}
                            perPage={perPage}
                            onPerPageChange={setPerPage}
                        />
                    }
                >
                    <DataTable>
                        <thead>
                            <tr>
                                <Th align="center">Order</Th>
                                <Th>Name</Th>
                                <Th>Slug</Th>
                                <Th>Stories</Th>
                                <Th align="right">Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((category) => (
                                <tr key={category.id}>
                                    <Td align="center">
                                        <span className="text-sm text-olive-500">
                                            {category.sort_order}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="font-medium text-olive-900 dark:text-olive-50">
                                            {category.name}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-olive-500">
                                            {category.slug}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-olive-600 dark:text-olive-300">
                                            {category.stories_count}
                                        </span>
                                    </Td>
                                    <Td align="right">
                                        <ActionMenu
                                            items={[
                                                {
                                                    label: 'Edit',
                                                    onClick: () => setFormCategory(category),
                                                },
                                                {
                                                    label: 'Delete',
                                                    danger: true,
                                                    onClick: () => remove(category),
                                                },
                                            ]}
                                        />
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </DataTable>
                </DataCard>
            )}

            {formCategory !== undefined ? (
                <CategoryFormDialog
                    category={formCategory}
                    onClose={() => setFormCategory(undefined)}
                />
            ) : null}
        </AdminLayout>
    );
}
