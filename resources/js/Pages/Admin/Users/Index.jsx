import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionGroup,
    ActionIcon,
    AdminButton,
    AdminCheckbox,
    AdminInput,
    AdminSelect,
    DataCard,
    DataTable,
    EmptyState,
    FilterBar,
    MediaCell,
    Pagination,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function Index({ users, filters }) {
    const [editing, setEditing] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [q, setQ] = useState(filters.q || '');
    const [role, setRole] = useState(filters.role || '');

    const createForm = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        is_admin: false,
    });

    const editForm = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        is_admin: false,
    });

    const search = (e) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { q, role }, { preserveState: true, replace: true });
    };

    const startEdit = (user) => {
        setEditing(user.id);
        setShowCreate(false);
        editForm.setData({
            name: user.name,
            username: user.username || '',
            email: user.email,
            password: '',
            is_admin: user.is_admin,
        });
    };

    return (
        <AdminLayout
            title="Users"
            actions={
                <AdminButton size="sm" onClick={() => { setShowCreate(true); setEditing(null); }}>
                    <Plus className="h-3.5 w-3.5" />
                    Add user
                </AdminButton>
            }
        >
            <Head title="Admin users" />

            <FilterBar onSubmit={search}>
                <AdminInput label="Search" value={q} onChange={(e) => setQ(e.target.value)} className="min-w-[200px] flex-1" placeholder="Name, email, username" />
                <AdminSelect label="Role" value={role} onChange={(e) => setRole(e.target.value)} className="w-36">
                    <option value="">All</option>
                    <option value="admin">Admins</option>
                    <option value="user">Members</option>
                </AdminSelect>
                <div className="flex items-end pb-0.5">
                    <AdminButton type="submit" size="sm"><Search className="h-3.5 w-3.5" /> Filter</AdminButton>
                </div>
            </FilterBar>

            {showCreate && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        createForm.post(route('admin.users.store'), {
                            onSuccess: () => {
                                createForm.reset();
                                setShowCreate(false);
                            },
                        });
                    }}
                    className="mb-4 grid gap-2.5 rounded-lg border border-olive-200/80 bg-white p-4 dark:border-olive-800 dark:bg-olive-900 md:grid-cols-2 xl:grid-cols-3"
                >
                    <AdminInput label="Name" value={createForm.data.name} onChange={(e) => createForm.setData('name', e.target.value)} error={createForm.errors.name} />
                    <AdminInput label="Username" value={createForm.data.username} onChange={(e) => createForm.setData('username', e.target.value)} error={createForm.errors.username} />
                    <AdminInput label="Email" type="email" value={createForm.data.email} onChange={(e) => createForm.setData('email', e.target.value)} error={createForm.errors.email} />
                    <AdminInput label="Password" type="password" value={createForm.data.password} onChange={(e) => createForm.setData('password', e.target.value)} error={createForm.errors.password} />
                    <div className="flex items-end gap-3">
                        <AdminCheckbox label="Admin access" checked={createForm.data.is_admin} onChange={(e) => createForm.setData('is_admin', e.target.checked)} />
                        <AdminButton type="submit" size="sm" disabled={createForm.processing}>Create</AdminButton>
                        <AdminButton type="button" size="sm" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</AdminButton>
                    </div>
                </form>
            )}

            {users.data.length === 0 ? (
                <EmptyState title="No users found" />
            ) : (
                <DataCard
                    title={`${users.meta?.total ?? users.data.length} users`}
                    footer={<Pagination links={users.links} meta={users.meta} />}
                >
                    <DataTable>
                        <thead>
                            <tr>
                                <Th>User</Th>
                                <Th>Role</Th>
                                <Th align="center">Listings</Th>
                                <Th>Joined</Th>
                                <Th align="right">Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((user) => (
                                <tr key={user.id}>
                                    {editing === user.id ? (
                                        <Td colSpan={5}>
                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    editForm.put(route('admin.users.update', user.id), {
                                                        onSuccess: () => setEditing(null),
                                                    });
                                                }}
                                                className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3"
                                            >
                                                <AdminInput label="Name" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} error={editForm.errors.name} />
                                                <AdminInput label="Username" value={editForm.data.username} onChange={(e) => editForm.setData('username', e.target.value)} error={editForm.errors.username} />
                                                <AdminInput label="Email" type="email" value={editForm.data.email} onChange={(e) => editForm.setData('email', e.target.value)} error={editForm.errors.email} />
                                                <AdminInput label="New password" type="password" value={editForm.data.password} onChange={(e) => editForm.setData('password', e.target.value)} error={editForm.errors.password} placeholder="Leave blank to keep" />
                                                <div className="flex items-end gap-2">
                                                    <AdminCheckbox label="Admin" checked={editForm.data.is_admin} onChange={(e) => editForm.setData('is_admin', e.target.checked)} />
                                                    <AdminButton type="submit" size="sm" disabled={editForm.processing}>Save</AdminButton>
                                                    <AdminButton type="button" size="sm" variant="secondary" onClick={() => setEditing(null)}>Cancel</AdminButton>
                                                </div>
                                            </form>
                                        </Td>
                                    ) : (
                                        <>
                                            <Td>
                                                <MediaCell
                                                    title={user.name}
                                                    subtitle={`${user.email}${user.username ? ` · @${user.username}` : ''}`}
                                                />
                                            </Td>
                                            <Td>
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                                                    <span className={`h-1.5 w-1.5 rounded-full ${user.is_admin ? 'bg-indigo-500' : 'bg-slate-400'}`} />
                                                    {user.is_admin ? 'Admin' : 'Member'}
                                                </span>
                                            </Td>
                                            <Td align="center">
                                                <span className="tabular-nums text-xs text-slate-600">{user.listings_count}</span>
                                            </Td>
                                            <Td>
                                                <span className="text-xs text-slate-500">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                                                </span>
                                            </Td>
                                            <Td align="right">
                                                <ActionGroup>
                                                    <ActionIcon title="Edit" onClick={() => startEdit(user)}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </ActionIcon>
                                                    <ActionIcon
                                                        title="Delete"
                                                        danger
                                                        onClick={() => {
                                                            if (confirm(`Delete ${user.name}?`)) {
                                                                router.delete(route('admin.users.destroy', user.id));
                                                            }
                                                        }}
                                                    >
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
        </AdminLayout>
    );
}
