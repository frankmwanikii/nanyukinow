import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionGroup,
    ActionIcon,
    ActionMenu,
    AdminButton,
    AdminCheckbox,
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

function LocationFormDialog({ location = null, onClose }) {
    const titleId = useId();
    const isEdit = Boolean(location?.id);

    const form = useForm({
        name: location?.name || '',
        sort_order: location?.sort_order ?? 0,
        is_active: location?.is_active ?? true,
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
            form.put(route('admin.locations.update', location.id), opts);
        } else {
            form.post(route('admin.locations.store'), opts);
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
                        {isEdit ? 'Edit location' : 'Add location'}
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
                            placeholder="e.g. Nanyuki"
                        />
                        <AdminInput
                            label="Sort order"
                            type="number"
                            value={data.sort_order}
                            onChange={(e) => setData('sort_order', e.target.value)}
                            error={errors.sort_order}
                        />
                        <AdminCheckbox
                            label="Active (shown in filters)"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
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

function LocationListingsDialog({ location, onClose }) {
    const titleId = useId();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [listings, setListings] = useState([]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');

        window.axios
            .get(route('admin.locations.listings', location.id))
            .then(({ data }) => {
                if (cancelled) return;
                setListings(data.listings || []);
            })
            .catch(() => {
                if (cancelled) return;
                setError('Could not load listings for this location.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [location.id]);

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
                className="relative flex max-h-[min(88vh,40rem)] w-full max-w-xl flex-col overflow-hidden border border-olive-200 bg-white dark:border-olive-700 dark:bg-olive-900"
            >
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-olive-100 px-5 py-4 dark:border-olive-800">
                    <div className="min-w-0">
                        <h2
                            id={titleId}
                            className="font-display text-lg font-semibold tracking-tight text-olive-950 dark:text-white"
                        >
                            {location.name}
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
                            No listings in this location yet.
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
                        href={route('admin.listings.index', { q: location.name })}
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

export default function Index({ locations, filters = {} }) {
    const { confirm, dialog } = useConfirm();
    const [listingsLocation, setListingsLocation] = useState(null);
    const [formLocation, setFormLocation] = useState(undefined);
    const rows = locations?.data || locations || [];
    const total = locations?.meta?.total ?? rows.length;
    const perPage = filters.per_page || locations?.meta?.per_page || 15;

    const setPerPage = (n) => {
        router.get(
            route('admin.locations.index'),
            { per_page: n },
            { preserveState: true, preserveScroll: true },
        );
    };

    const remove = async (location) => {
        const ok = await confirm({
            title: 'Delete location?',
            message: `Delete location “${location.name}”?`,
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        router.delete(route('admin.locations.destroy', location.id));
    };

    return (
        <AdminLayout>
            <Head title="Admin locations" />
            {dialog}

            <PageHeader
                title="Locations"
                description="Towns and areas used to filter and label listings."
                actions={
                    <AdminButton size="sm" onClick={() => setFormLocation(null)}>
                        <Plus className="h-3.5 w-3.5" />
                        Add location
                    </AdminButton>
                }
            />

            {rows.length === 0 ? (
                <EmptyState
                    title="No locations"
                    description="Add towns or areas so listings can be filtered and labeled."
                    action={
                        <AdminButton size="sm" onClick={() => setFormLocation(null)}>
                            <Plus className="h-3.5 w-3.5" />
                            Add location
                        </AdminButton>
                    }
                />
            ) : (
                <DataCard
                    title={`${total} locations`}
                    footer={
                        <Pagination
                            links={locations.links}
                            meta={locations.meta || locations}
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
                                <Th>Status</Th>
                                <Th align="right">Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((location) => (
                                <tr key={location.id}>
                                    <Td align="center">
                                        <span className="tabular-nums text-sm text-olive-500 dark:text-olive-400">
                                            {location.sort_order}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="text-base font-medium text-olive-900 dark:text-olive-50">
                                            {location.name}
                                        </span>
                                    </Td>
                                    <Td align="center">
                                        <span className="tabular-nums text-sm font-medium text-olive-800 dark:text-olive-100">
                                            {location.listings_count}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-olive-500 dark:text-olive-400">
                                            {formatUpdated(location.updated_at)}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span
                                            className={`text-sm font-medium ${
                                                location.is_active
                                                    ? 'text-olive-800 dark:text-olive-100'
                                                    : 'text-olive-400 dark:text-olive-500'
                                            }`}
                                        >
                                            {location.is_active ? 'Active' : 'Hidden'}
                                        </span>
                                    </Td>
                                    <Td align="right">
                                        <div className="inline-flex items-center gap-1.5">
                                            <ActionGroup>
                                                <ActionIcon
                                                    title="View listings"
                                                    onClick={() => setListingsLocation(location)}
                                                >
                                                    <LayoutList className="h-4 w-4" />
                                                </ActionIcon>
                                            </ActionGroup>
                                            <ActionMenu
                                                items={[
                                                    {
                                                        label: 'Edit',
                                                        onClick: () => setFormLocation(location),
                                                    },
                                                    {
                                                        label: 'Delete',
                                                        danger: true,
                                                        onClick: () => remove(location),
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

            {formLocation !== undefined ? (
                <LocationFormDialog
                    key={formLocation?.id ?? 'create'}
                    location={formLocation}
                    onClose={() => setFormLocation(undefined)}
                />
            ) : null}

            {listingsLocation ? (
                <LocationListingsDialog
                    location={listingsLocation}
                    onClose={() => setListingsLocation(null)}
                />
            ) : null}
        </AdminLayout>
    );
}
