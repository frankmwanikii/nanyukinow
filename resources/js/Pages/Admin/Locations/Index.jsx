import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionMenu,
    AdminButton,
    AdminInput,
    DataCard,
    DataTable,
    EmptyState,
    FormPanel,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { Head, router, useForm } from '@inertiajs/react';
import { MapPin, Plus } from 'lucide-react';
import { useState } from 'react';

const blank = { name: '', slug: '', sort_order: 0, is_active: true };

export default function Index({ locations }) {
    const [editing, setEditing] = useState(null);
    const createForm = useForm({ ...blank });
    const editForm = useForm({ ...blank });

    const startEdit = (location) => {
        setEditing(location.id);
        editForm.setData({
            name: location.name,
            slug: location.slug,
            sort_order: location.sort_order ?? 0,
            is_active: location.is_active ?? true,
        });
    };

    const saveCreate = (e) => {
        e.preventDefault();
        createForm.post(route('admin.locations.store'), {
            onSuccess: () => createForm.reset(),
        });
    };

    const saveEdit = (e) => {
        e.preventDefault();
        editForm.put(route('admin.locations.update', editing), {
            onSuccess: () => setEditing(null),
        });
    };

    const remove = (location) => {
        if (!confirm(`Delete location “${location.name}”?`)) return;
        router.delete(route('admin.locations.destroy', location.id));
    };

    return (
        <AdminLayout title="Locations">
            <Head title="Admin locations" />

            <div className="grid gap-4 xl:grid-cols-3">
                <FormPanel title="Add location" className="xl:col-span-1">
                    <form onSubmit={saveCreate}>
                        <div className="space-y-2.5">
                            <AdminInput
                                label="Name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                error={createForm.errors.name}
                                required
                                placeholder="e.g. Nanyuki"
                            />
                            <AdminInput
                                label="Slug"
                                value={createForm.data.slug}
                                onChange={(e) => createForm.setData('slug', e.target.value)}
                                error={createForm.errors.slug}
                                placeholder="optional"
                            />
                            <AdminInput
                                label="Sort order"
                                type="number"
                                value={createForm.data.sort_order}
                                onChange={(e) => createForm.setData('sort_order', e.target.value)}
                                error={createForm.errors.sort_order}
                            />
                            <label className="flex items-center gap-2 text-sm text-olive-700 dark:text-olive-200">
                                <input
                                    type="checkbox"
                                    checked={createForm.data.is_active}
                                    onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                    className="h-3.5 w-3.5 rounded border-olive-300 text-olive-800"
                                />
                                Active (shown in filters)
                            </label>
                            <AdminButton type="submit" size="sm" disabled={createForm.processing}>
                                <Plus className="h-3.5 w-3.5" />
                                Add location
                            </AdminButton>
                        </div>
                    </form>
                </FormPanel>

                <div className="xl:col-span-2">
                    {locations.length === 0 ? (
                        <EmptyState
                            title="No locations"
                            description="Add towns or areas so listings can be filtered and labeled."
                            action={
                                <span className="inline-flex items-center gap-2 text-sm text-olive-500">
                                    <MapPin className="h-4 w-4" />
                                    Start with Nanyuki, Timau, or Naromoru
                                </span>
                            }
                        />
                    ) : (
                        <DataCard title={`${locations.length} locations`}>
                            <DataTable>
                                <thead>
                                    <tr>
                                        <Th align="center">Order</Th>
                                        <Th>Name</Th>
                                        <Th>Slug</Th>
                                        <Th align="center">Listings</Th>
                                        <Th>Status</Th>
                                        <Th align="right">Action</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {locations.map((location) => (
                                        <tr key={location.id}>
                                            {editing === location.id ? (
                                                <Td colSpan={6}>
                                                    <form onSubmit={saveEdit} className="grid gap-2 md:grid-cols-4">
                                                        <AdminInput
                                                            label="Name"
                                                            value={editForm.data.name}
                                                            onChange={(e) => editForm.setData('name', e.target.value)}
                                                            error={editForm.errors.name}
                                                        />
                                                        <AdminInput
                                                            label="Slug"
                                                            value={editForm.data.slug}
                                                            onChange={(e) => editForm.setData('slug', e.target.value)}
                                                            error={editForm.errors.slug}
                                                        />
                                                        <AdminInput
                                                            label="Sort"
                                                            type="number"
                                                            value={editForm.data.sort_order}
                                                            onChange={(e) => editForm.setData('sort_order', e.target.value)}
                                                            error={editForm.errors.sort_order}
                                                        />
                                                        <label className="flex items-end gap-2 pb-2 text-sm text-olive-700 dark:text-olive-200">
                                                            <input
                                                                type="checkbox"
                                                                checked={editForm.data.is_active}
                                                                onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                                                className="h-3.5 w-3.5 rounded border-olive-300 text-olive-800"
                                                            />
                                                            Active
                                                        </label>
                                                        <div className="flex gap-2 md:col-span-4">
                                                            <AdminButton type="submit" size="sm" disabled={editForm.processing}>
                                                                Save
                                                            </AdminButton>
                                                            <AdminButton
                                                                variant="secondary"
                                                                size="sm"
                                                                type="button"
                                                                onClick={() => setEditing(null)}
                                                            >
                                                                Cancel
                                                            </AdminButton>
                                                        </div>
                                                    </form>
                                                </Td>
                                            ) : (
                                                <>
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
                                                    <Td>
                                                        <code className="rounded bg-olive-100 px-2 py-1 text-sm text-olive-700 dark:bg-olive-800 dark:text-olive-200">
                                                            {location.slug}
                                                        </code>
                                                    </Td>
                                                    <Td align="center">
                                                        <span className="tabular-nums text-sm font-medium text-olive-800 dark:text-olive-100">
                                                            {location.listings_count}
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
                                                        <ActionMenu
                                                            items={[
                                                                {
                                                                    label: 'Edit',
                                                                    onClick: () => startEdit(location),
                                                                },
                                                                {
                                                                    label: 'View',
                                                                    href: `/explore?location=${encodeURIComponent(location.name)}`,
                                                                    external: true,
                                                                },
                                                                {
                                                                    label: 'Delete',
                                                                    danger: true,
                                                                    onClick: () => remove(location),
                                                                },
                                                            ]}
                                                        />
                                                    </Td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </DataTable>
                        </DataCard>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
