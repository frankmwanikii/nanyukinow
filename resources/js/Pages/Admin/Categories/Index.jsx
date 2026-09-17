import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionGroup,
    ActionIcon,
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
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const blank = { name: '', slug: '', icon: '', sort_order: 0 };

export default function Index({ categories }) {
    const [editing, setEditing] = useState(null);
    const createForm = useForm({ ...blank });
    const editForm = useForm({ ...blank });

    const startEdit = (category) => {
        setEditing(category.id);
        editForm.setData({
            name: category.name,
            slug: category.slug,
            icon: category.icon || '',
            sort_order: category.sort_order ?? 0,
        });
    };

    const saveCreate = (e) => {
        e.preventDefault();
        createForm.post(route('admin.categories.store'), {
            onSuccess: () => createForm.reset(),
        });
    };

    const saveEdit = (e) => {
        e.preventDefault();
        editForm.put(route('admin.categories.update', editing), {
            onSuccess: () => setEditing(null),
        });
    };

    const remove = (category) => {
        if (!confirm(`Delete category “${category.name}”?`)) return;
        router.delete(route('admin.categories.destroy', category.id));
    };

    return (
        <AdminLayout title="Categories">
            <Head title="Admin categories" />

            <div className="grid gap-4 xl:grid-cols-3">
                <FormPanel title="Add category" className="xl:col-span-1">
                    <form onSubmit={saveCreate}>
                    <div className="space-y-2.5">
                        <AdminInput label="Name" value={createForm.data.name} onChange={(e) => createForm.setData('name', e.target.value)} error={createForm.errors.name} required />
                        <AdminInput label="Slug" value={createForm.data.slug} onChange={(e) => createForm.setData('slug', e.target.value)} error={createForm.errors.slug} placeholder="optional" />
                        <AdminInput label="Icon key" value={createForm.data.icon} onChange={(e) => createForm.setData('icon', e.target.value)} error={createForm.errors.icon} placeholder="e.g. stay" />
                        <AdminInput label="Sort order" type="number" value={createForm.data.sort_order} onChange={(e) => createForm.setData('sort_order', e.target.value)} error={createForm.errors.sort_order} />
                        <AdminButton type="submit" size="sm" disabled={createForm.processing}>
                            <Plus className="h-3.5 w-3.5" />
                            Create
                        </AdminButton>
                    </div>
                    </form>
                </FormPanel>

                <div className="xl:col-span-2">
                    {categories.length === 0 ? (
                        <EmptyState title="No categories" description="Create listing types to organize the directory." />
                    ) : (
                        <DataCard title={`${categories.length} categories`}>
                            <DataTable>
                                <thead>
                                    <tr>
                                        <Th align="center">Order</Th>
                                        <Th>Name</Th>
                                        <Th>Slug</Th>
                                        <Th align="center">Listings</Th>
                                        <Th align="right">Action</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((category) => (
                                        <tr key={category.id}>
                                            {editing === category.id ? (
                                                <Td colSpan={5}>
                                                    <form onSubmit={saveEdit} className="grid gap-2 md:grid-cols-4">
                                                        <AdminInput label="Name" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} error={editForm.errors.name} />
                                                        <AdminInput label="Slug" value={editForm.data.slug} onChange={(e) => editForm.setData('slug', e.target.value)} error={editForm.errors.slug} />
                                                        <AdminInput label="Icon" value={editForm.data.icon} onChange={(e) => editForm.setData('icon', e.target.value)} error={editForm.errors.icon} />
                                                        <AdminInput label="Sort" type="number" value={editForm.data.sort_order} onChange={(e) => editForm.setData('sort_order', e.target.value)} error={editForm.errors.sort_order} />
                                                        <div className="flex gap-2 md:col-span-4">
                                                            <AdminButton type="submit" size="sm" disabled={editForm.processing}>Save</AdminButton>
                                                            <AdminButton variant="secondary" size="sm" type="button" onClick={() => setEditing(null)}>Cancel</AdminButton>
                                                        </div>
                                                    </form>
                                                </Td>
                                            ) : (
                                                <>
                                                    <Td align="center">
                                                        <span className="tabular-nums text-sm text-olive-500 dark:text-olive-400">{category.sort_order}</span>
                                                    </Td>
                                                    <Td>
                                                        <span className="text-base font-medium text-olive-900 dark:text-olive-50">{category.name}</span>
                                                        {category.icon && (
                                                            <span className="ml-2 text-sm text-olive-400">{category.icon}</span>
                                                        )}
                                                    </Td>
                                                    <Td>
                                                        <code className="rounded bg-olive-100 px-2 py-1 text-sm text-olive-700 dark:bg-olive-800 dark:text-olive-200">
                                                            {category.slug}
                                                        </code>
                                                    </Td>
                                                    <Td align="center">
                                                        <span className="tabular-nums text-sm font-medium text-olive-800 dark:text-olive-100">
                                                            {category.listings_count}
                                                        </span>
                                                    </Td>
                                                    <Td align="right">
                                                        <ActionGroup>
                                                            <ActionIcon title="Edit" onClick={() => startEdit(category)}>
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </ActionIcon>
                                                            <ActionIcon title="Delete" danger onClick={() => remove(category)}>
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </ActionIcon>
                                                        </ActionGroup>
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
