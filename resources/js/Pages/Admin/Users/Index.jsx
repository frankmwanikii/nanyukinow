import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionMenu,
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
    StatusBadge,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Index({ users, filters }) {
    const [editing, setEditing] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [q, setQ] = useState(filters.q || '');
    const [role, setRole] = useState(filters.role || '');
    const skipDebounce = useRef(true);

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

    const pushFilters = (next) => {
        router.get(route('admin.users.index'), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    useEffect(() => {
        if (skipDebounce.current) {
            skipDebounce.current = false;
            return undefined;
        }

        const timer = setTimeout(() => {
            pushFilters({ q, role });
        }, 350);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

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

            <FilterBar>
                <AdminInput
                    label="Search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="min-w-[200px] flex-1"
                    placeholder="Name, email, username"
                />
                <AdminSelect
                    label="Role"
                    value={role}
                    onChange={(e) => {
                        const next = e.target.value;
                        setRole(next);
                        pushFilters({ q, role: next });
                    }}
                    className="w-36"
                >
                    <option value="">All</option>
                    <option value="admin">Admins</option>
                    <option value="user">Members</option>
                </AdminSelect>
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
                                <Th>Plan</Th>
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
                                        <Td colSpan={6}>
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
                                                <StatusBadge status={user.plan || 'free'} />
                                                <span className="mt-1 block text-xs text-olive-500">
                                                    {user.plan_label || 'Free'}
                                                </span>
                                            </Td>
                                            <Td>
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                                                    <span className={`h-1.5 w-1.5 rounded-full ${user.is_admin ? 'bg-indigo-500' : 'bg-slate-400'}`} />
                                                    {user.is_admin ? 'Admin' : 'Member'}
                                                </span>
                                            </Td>
                                            <Td align="center">
                                                <span className="tabular-nums text-sm text-olive-700 dark:text-olive-200">{user.listings_count}</span>
                                            </Td>
                                            <Td>
                                                <span className="text-sm text-olive-500 dark:text-olive-400">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                                                </span>
                                            </Td>
                                            <Td align="right">
                                                <ActionMenu
                                                    items={[
                                                        {
                                                            label: 'Edit',
                                                            onClick: () => startEdit(user),
                                                        },
                                                        {
                                                            label: 'Set Free plan',
                                                            onClick: () =>
                                                                router.post(route('admin.upgrades.assign'), {
                                                                    user_id: user.id,
                                                                    plan: 'free',
                                                                }),
                                                        },
                                                        {
                                                            label: 'Set Standard plan',
                                                            onClick: () =>
                                                                router.post(route('admin.upgrades.assign'), {
                                                                    user_id: user.id,
                                                                    plan: 'featured',
                                                                    duration_days: 30,
                                                                }),
                                                        },
                                                        {
                                                            label: 'Set Premium plan',
                                                            onClick: () =>
                                                                router.post(route('admin.upgrades.assign'), {
                                                                    user_id: user.id,
                                                                    plan: 'premium',
                                                                    duration_days: 30,
                                                                }),
                                                        },
                                                        {
                                                            label: 'View listings',
                                                            href: route('admin.listings.index', { q: user.name }),
                                                        },
                                                        {
                                                            label: 'Delete',
                                                            danger: true,
                                                            onClick: () => {
                                                                if (!confirm(`Delete ${user.name}?`)) return;
                                                                router.delete(route('admin.users.destroy', user.id));
                                                            },
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
        </AdminLayout>
    );
}
