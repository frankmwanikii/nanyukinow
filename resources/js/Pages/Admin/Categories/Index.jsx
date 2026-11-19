import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionMenu,
    AdminButton,
    AdminInput,
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
import { Loader2, Pencil, Plus, Save, Trash2, X } from '@/Components/site/LucideCompat';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';

function formatUpdated(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    } catch {
        return '—';
    }
}

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
            form.put(route('admin.categories.update', category.id), opts);
        } else {
            form.post(route('admin.categories.store'), opts);
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
                        {isEdit ? 'Edit category' : 'Add category'}
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

function SubcategoriesDialog({ category, onClose }) {
    const titleId = useId();
    const { confirm, dialog } = useConfirm();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rows, setRows] = useState([]);
    const [draftName, setDraftName] = useState('');
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const load = () => {
        setLoading(true);
        setError('');
        window.axios
            .get(route('admin.categories.subcategories.index', category.id))
            .then(({ data }) => {
                setRows(data.subcategories || []);
            })
            .catch(() => {
                setError('Could not load subcategories.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category.id]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const add = async (e) => {
        e.preventDefault();
        const name = draftName.trim();
        if (!name || saving) return;
        setSaving(true);
        setError('');
        try {
            const { data } = await window.axios.post(
                route('admin.categories.subcategories.store', category.id),
                { name },
            );
            setRows((prev) => [...prev, data.subcategory]);
            setDraftName('');
        } catch (err) {
            setError(
                err?.response?.data?.errors?.name?.[0] ||
                    err?.response?.data?.message ||
                    'Could not add subcategory.',
            );
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (row) => {
        setEditingId(row.id);
        setEditName(row.name);
        setError('');
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        const name = editName.trim();
        if (!name || !editingId || saving) return;
        setSaving(true);
        setError('');
        try {
            const { data } = await window.axios.put(
                route('admin.categories.subcategories.update', [
                    category.id,
                    editingId,
                ]),
                { name },
            );
            setRows((prev) =>
                prev.map((row) =>
                    row.id === editingId ? data.subcategory : row,
                ),
            );
            setEditingId(null);
            setEditName('');
        } catch (err) {
            setError(
                err?.response?.data?.errors?.name?.[0] ||
                    err?.response?.data?.message ||
                    'Could not update subcategory.',
            );
        } finally {
            setSaving(false);
        }
    };

    const remove = async (row) => {
        const ok = await confirm({
            title: 'Delete subcategory?',
            message: `Delete “${row.name}”? Listings using it will lose this label.`,
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        setSaving(true);
        setError('');
        try {
            await window.axios.delete(
                route('admin.categories.subcategories.destroy', [
                    category.id,
                    row.id,
                ]),
            );
            setRows((prev) => prev.filter((item) => item.id !== row.id));
            if (editingId === row.id) {
                setEditingId(null);
                setEditName('');
            }
        } catch {
            setError('Could not delete subcategory.');
        } finally {
            setSaving(false);
        }
    };

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
            {dialog}
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
                className="relative flex max-h-[min(88vh,40rem)] w-full max-w-lg flex-col overflow-hidden border border-olive-200 bg-white dark:border-olive-700 dark:bg-olive-900"
            >
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-olive-100 px-5 py-4 dark:border-olive-800">
                    <div className="min-w-0">
                        <h2
                            id={titleId}
                            className="font-display text-lg font-semibold tracking-tight text-olive-950 dark:text-white"
                        >
                            Subcategories
                        </h2>
                        <p className="mt-0.5 text-sm text-olive-500 dark:text-olive-400">
                            {category.name}
                            {!loading
                                ? ` · ${rows.length} subcategory${rows.length === 1 ? '' : 'ies'}`
                                : null}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-olive-400 transition hover:bg-olive-100 hover:text-olive-800 dark:hover:bg-olive-800 dark:hover:text-olive-100"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
                    <form onSubmit={add} className="mb-4 flex gap-2">
                        <AdminInput
                            label="Add subcategory"
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            placeholder="e.g. Rooftop bars"
                            className="min-w-0 flex-1"
                            disabled={saving}
                        />
                        <AdminButton
                            type="submit"
                            size="sm"
                            className="mt-6 shrink-0"
                            disabled={saving || !draftName.trim()}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add
                        </AdminButton>
                    </form>

                    {error ? (
                        <p className="mb-3 text-sm font-medium text-rose-600">{error}</p>
                    ) : null}

                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-12 text-sm text-olive-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading…
                        </div>
                    ) : rows.length === 0 ? (
                        <p className="py-8 text-center text-sm text-olive-500">
                            No subcategories yet. Add the first one above.
                        </p>
                    ) : (
                        <ul className="divide-y divide-olive-100 border border-olive-100 dark:divide-olive-800 dark:border-olive-800">
                            {rows.map((row) => (
                                <li
                                    key={row.id}
                                    className="flex items-center gap-2 px-3 py-2.5"
                                >
                                    {editingId === row.id ? (
                                        <form
                                            onSubmit={saveEdit}
                                            className="flex min-w-0 flex-1 items-center gap-2"
                                        >
                                            <input
                                                value={editName}
                                                onChange={(e) =>
                                                    setEditName(e.target.value)
                                                }
                                                className="min-w-0 flex-1 rounded-md border border-olive-200 bg-white px-2.5 py-1.5 text-sm text-olive-900 outline-none focus:border-olive-600 focus:ring-1 focus:ring-olive-600/30 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50"
                                                autoFocus
                                                disabled={saving}
                                            />
                                            <AdminButton
                                                type="submit"
                                                size="sm"
                                                disabled={saving || !editName.trim()}
                                            >
                                                Save
                                            </AdminButton>
                                            <AdminButton
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setEditName('');
                                                }}
                                            >
                                                Cancel
                                            </AdminButton>
                                        </form>
                                    ) : (
                                        <>
                                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-olive-900 dark:text-olive-50">
                                                {row.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => startEdit(row)}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-olive-500 transition hover:bg-olive-100 hover:text-olive-900 dark:hover:bg-olive-800 dark:hover:text-olive-100"
                                                title="Edit"
                                                aria-label={`Edit ${row.name}`}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => remove(row)}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-olive-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                                                title="Delete"
                                                aria-label={`Delete ${row.name}`}
                                                disabled={saving}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex shrink-0 justify-end border-t border-olive-100 bg-olive-50/70 px-5 py-3 dark:border-olive-800 dark:bg-olive-950/40">
                    <AdminButton type="button" size="sm" variant="secondary" onClick={onClose}>
                        Close
                    </AdminButton>
                </div>
            </div>
        </div>,
        document.body,
    );
}

export default function Index({ categories, filters = {} }) {
    const { confirm, dialog } = useConfirm();
    const [subcategoriesCategory, setSubcategoriesCategory] = useState(null);
    const [formCategory, setFormCategory] = useState(undefined);
    // undefined = closed, null = create, object = edit
    const rows = categories?.data || categories || [];
    const total = categories?.meta?.total ?? rows.length;
    const perPage = filters.per_page || categories?.meta?.per_page || 15;

    const setPerPage = (n) => {
        router.get(
            route('admin.categories.index'),
            { per_page: n },
            { preserveState: true, preserveScroll: true },
        );
    };

    const remove = async (category) => {
        const ok = await confirm({
            title: 'Delete category?',
            message: `Delete category “${category.name}”?`,
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        router.delete(route('admin.categories.destroy', category.id));
    };

    return (
        <AdminLayout>
            <Head title="Admin categories" />
            {dialog}

            <PageHeader
                title="Categories"
                description="Listing types that organize the directory."
                actions={
                    <AdminButton size="sm" onClick={() => setFormCategory(null)}>
                        <Plus className="h-3.5 w-3.5" />
                        Add category
                    </AdminButton>
                }
            />

            {rows.length === 0 ? (
                <EmptyState
                    title="No categories"
                    description="Create listing types to organize the directory."
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
                                <Th align="center">Listings</Th>
                                <Th>Date modified</Th>
                                <Th align="right">Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((category) => (
                                <tr key={category.id}>
                                    <Td align="center">
                                        <span className="tabular-nums text-sm text-olive-500 dark:text-olive-400">
                                            {category.sort_order}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="text-base font-medium text-olive-900 dark:text-olive-50">
                                            {category.name}
                                        </span>
                                    </Td>
                                    <Td align="center">
                                        <span className="tabular-nums text-sm font-medium text-olive-800 dark:text-olive-100">
                                            {category.listings_count}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-olive-500 dark:text-olive-400">
                                            {formatUpdated(category.updated_at)}
                                        </span>
                                    </Td>
                                    <Td align="right">
                                        <ActionMenu
                                            items={[
                                                {
                                                    label: 'Edit category',
                                                    onClick: () => setFormCategory(category),
                                                },
                                                {
                                                    label: 'Edit subcategory',
                                                    onClick: () =>
                                                        setSubcategoriesCategory(category),
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
                    key={formCategory?.id ?? 'create'}
                    category={formCategory}
                    onClose={() => setFormCategory(undefined)}
                />
            ) : null}

            {subcategoriesCategory ? (
                <SubcategoriesDialog
                    category={subcategoriesCategory}
                    onClose={() => setSubcategoriesCategory(null)}
                />
            ) : null}
        </AdminLayout>
    );
}
