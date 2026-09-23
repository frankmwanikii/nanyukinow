import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionGroup,
    ActionIcon,
    ActionMenu,
    AdminButton,
    AdminInput,
    AdminLink,
    DataCard,
    DataTable,
    EmptyState,
    MediaCell,
    PageHeader,
    Pagination,
    StatusBadge,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { LayoutList, Loader2, Plus, Save, X } from 'lucide-react';
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
                className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-olive-200/80 bg-white shadow-2xl dark:border-olive-700 dark:bg-olive-900"
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

function CategoryListingsDialog({ category, onClose }) {
    const titleId = useId();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [listings, setListings] = useState([]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');

        window.axios
            .get(route('admin.categories.listings', category.id))
            .then(({ data }) => {
                if (cancelled) return;
                setListings(data.listings || []);
            })
            .catch(() => {
                if (cancelled) return;
                setError('Could not load listings for this category.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [category.id]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

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
                className="relative flex max-h-[min(88vh,40rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-olive-200/80 bg-white shadow-2xl dark:border-olive-700 dark:bg-olive-900"
            >
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-olive-100 px-5 py-4 dark:border-olive-800">
                    <div className="min-w-0">
                        <h2
                            id={titleId}
                            className="font-display text-lg font-semibold tracking-tight text-olive-950 dark:text-white"
                        >
                            {category.name}
                        </h2>
                        <p className="mt-0.5 text-sm text-olive-500 dark:text-olive-400">
                            {loading
                                ? 'Loading listings…'
                                : `${listings.length} listing${listings.length === 1 ? '' : 's'}`}
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

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-olive-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading…
                        </div>
                    ) : error ? (
                        <p className="px-5 py-10 text-center text-sm text-rose-600">{error}</p>
                    ) : listings.length === 0 ? (
                        <p className="px-5 py-10 text-center text-sm text-olive-500">
                            No listings in this category yet.
                        </p>
                    ) : (
                        <ul className="divide-y divide-olive-100 dark:divide-olive-800">
                            {listings.map((listing) => (
                                <li key={listing.id}>
                                    <Link
                                        href={listing.edit_href}
                                        className="flex items-center gap-3 px-5 py-3 transition hover:bg-olive-50 dark:hover:bg-olive-800/60"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <MediaCell
                                                image={listing.image_url}
                                                title={listing.title}
                                                subtitle={listing.location || listing.slug}
                                            />
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                            <StatusBadge status={listing.status} />
                                            {listing.tier ? (
                                                <StatusBadge status={listing.tier} />
                                            ) : null}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex shrink-0 justify-end gap-2 border-t border-olive-100 bg-olive-50/70 px-5 py-3 dark:border-olive-800 dark:bg-olive-950/40">
                    <AdminLink
                        href={route('admin.listings.index', {
                            category_id: category.id,
                        })}
                        variant="secondary"
                        className="!px-3.5 !py-2 !text-sm"
                    >
                        Open in listings
                    </AdminLink>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center justify-center rounded-full border border-olive-200 bg-white px-3.5 py-2 text-sm font-semibold text-olive-800 transition hover:bg-olive-50 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

export default function Index({ categories, filters = {} }) {
    const { confirm, dialog } = useConfirm();
    const [listingsCategory, setListingsCategory] = useState(null);
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
                                        <div className="inline-flex items-center gap-1.5">
                                            <ActionGroup>
                                                <ActionIcon
                                                    title="View listings"
                                                    onClick={() => setListingsCategory(category)}
                                                >
                                                    <LayoutList className="h-4 w-4" />
                                                </ActionIcon>
                                            </ActionGroup>
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
                                        </div>
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

            {listingsCategory ? (
                <CategoryListingsDialog
                    category={listingsCategory}
                    onClose={() => setListingsCategory(null)}
                />
            ) : null}
        </AdminLayout>
    );
}
