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
    PageHeader,
    Pagination,
    StatusBadge,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Index({ users, filters }) {
    const { confirm, dialog } = useConfirm();
    const [showCreate, setShowCreate] = useState(false);
    const [q, setQ] = useState(filters.q || '');
    const [role, setRole] = useState(filters.role || '');
    const [perPage, setPerPage] = useState(filters.per_page || 20);
    const skipDebounce = useRef(true);

    const createForm = useForm({
        name: '',
        username: '',
        email: '',
        phone: '',
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
            pushFilters({ q, role, per_page: perPage });
        }, 350);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    const openMember = (user) => {
        router.visit(route('admin.users.show', user.username || user.id));
    };

    return (
        <AdminLayout>
            <Head title="Admin users" />
            {dialog}

            <PageHeader
                title="Users"
                actions={
                    <AdminButton
                        size="sm"
                        onClick={() => setShowCreate(true)}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add user
                    </AdminButton>
                }
            />

            <FilterBar>
                <AdminInput
                    label="Search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="min-w-[200px] flex-1"
                    placeholder="Name, email, username, phone"
                />
                <AdminSelect
                    label="Role"
                    value={role}
                    onChange={(e) => {
                        const next = e.target.value;
                        setRole(next);
                        pushFilters({ q, role: next, per_page: perPage });
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
                    <AdminInput
                        label="Name"
                        value={createForm.data.name}
                        onChange={(e) => createForm.setData('name', e.target.value)}
                        error={createForm.errors.name}
                    />
                    <AdminInput
                        label="Username"
                        value={createForm.data.username}
                        onChange={(e) => createForm.setData('username', e.target.value)}
                        error={createForm.errors.username}
                    />
                    <AdminInput
                        label="Email"
                        type="email"
                        value={createForm.data.email}
                        onChange={(e) => createForm.setData('email', e.target.value)}
                        error={createForm.errors.email}
                    />
                    <AdminInput
                        label="Phone"
                        type="tel"
                        value={createForm.data.phone}
                        onChange={(e) => createForm.setData('phone', e.target.value)}
                        error={createForm.errors.phone}
                    />
                    <AdminInput
                        label="Password"
                        type="password"
                        value={createForm.data.password}
                        onChange={(e) => createForm.setData('password', e.target.value)}
                        error={createForm.errors.password}
                    />
                    <div className="flex items-end gap-3">
                        <AdminCheckbox
                            label="Admin access"
                            checked={createForm.data.is_admin}
                            onChange={(e) => createForm.setData('is_admin', e.target.checked)}
                        />
                        <AdminButton type="submit" size="sm" disabled={createForm.processing}>
                            Create
                        </AdminButton>
                        <AdminButton
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setShowCreate(false)}
                        >
                            Cancel
                        </AdminButton>
                    </div>
                </form>
            )}

            {users.data.length === 0 ? (
                <EmptyState title="No users found" />
            ) : (
                <DataCard
                    title={`${users.meta?.total ?? users.data.length} users`}
                    footer={
                        <Pagination
                            links={users.links}
                            meta={users.meta || users}
                            perPage={perPage}
                            onPerPageChange={(n) => {
                                setPerPage(n);
                                pushFilters({ q, role, per_page: n });
                            }}
                        />
                    }
                >
                    <DataTable>
                        <thead>
                            <tr>
                                <Th>User</Th>
                                <Th>Role</Th>
                                <Th>Plan</Th>
                                <Th>Email</Th>
                                <Th>Phone</Th>
                                <Th>Joined</Th>
                                <Th align="right">Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((user) => (
                                <tr
                                    key={user.id}
                                    role="link"
                                    tabIndex={0}
                                    onClick={() => openMember(user)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            openMember(user);
                                        }
                                    }}
                                    className="cursor-pointer transition hover:bg-olive-50/80 dark:hover:bg-olive-800/40"
                                >
                                    <Td>
                                        <MediaCell
                                            image={user.avatar_url}
                                            title={user.name}
                                        />
                                    </Td>
                                    <Td>
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${user.is_admin ? 'bg-indigo-500' : 'bg-slate-400'}`}
                                            />
                                            {user.is_admin ? 'Admin' : 'Member'}
                                        </span>
                                    </Td>
                                    <Td>
                                        <StatusBadge status={user.plan || 'free'} />
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-olive-700 dark:text-olive-200">
                                            {user.email || '—'}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="whitespace-nowrap text-sm text-olive-700 dark:text-olive-200">
                                            {user.phone || '—'}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-olive-500 dark:text-olive-400">
                                            {user.created_at
                                                ? new Date(user.created_at).toLocaleDateString()
                                                : '—'}
                                        </span>
                                    </Td>
                                    <Td
                                        align="right"
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => e.stopPropagation()}
                                    >
                                        <ActionMenu
                                            items={[
                                                {
                                                    label: 'Open profile',
                                                    href: route(
                                                        'admin.users.show',
                                                        user.username || user.id,
                                                    ),
                                                },
                                                {
                                                    label: 'Listings',
                                                    href: route('admin.users.show', {
                                                        user: user.username || user.id,
                                                        tab: 'listings',
                                                    }),
                                                },
                                                {
                                                    label: 'Payment history',
                                                    href: route('admin.users.show', {
                                                        user: user.username || user.id,
                                                        tab: 'payments',
                                                    }),
                                                },
                                                ...((user.plan || 'free') !== 'free'
                                                    ? [
                                                          {
                                                              label: 'Set Free plan',
                                                              onClick: () =>
                                                                  router.post(
                                                                      route('admin.finance.assign'),
                                                                      {
                                                                          user_id: user.id,
                                                                          plan: 'free',
                                                                      },
                                                                  ),
                                                          },
                                                      ]
                                                    : []),
                                                ...((user.plan || 'free') !== 'featured'
                                                    ? [
                                                          {
                                                              label: 'Set Standard plan',
                                                              onClick: () =>
                                                                  router.post(
                                                                      route('admin.finance.assign'),
                                                                      {
                                                                          user_id: user.id,
                                                                          plan: 'featured',
                                                                          duration_days: 30,
                                                                      },
                                                                  ),
                                                          },
                                                      ]
                                                    : []),
                                                ...((user.plan || 'free') !== 'premium'
                                                    ? [
                                                          {
                                                              label: 'Set Premium plan',
                                                              onClick: () =>
                                                                  router.post(
                                                                      route('admin.finance.assign'),
                                                                      {
                                                                          user_id: user.id,
                                                                          plan: 'premium',
                                                                          duration_days: 30,
                                                                      },
                                                                  ),
                                                          },
                                                      ]
                                                    : []),
                                                {
                                                    label: 'Delete',
                                                    danger: true,
                                                    onClick: async () => {
                                                        const ok = await confirm({
                                                            title: 'Delete user?',
                                                            message: `Delete ${user.name}? This cannot be undone.`,
                                                            confirmLabel: 'Delete',
                                                        });
                                                        if (!ok) return;
                                                        router.delete(
                                                            route(
                                                                'admin.users.destroy',
                                                                user.username || user.id,
                                                            ),
                                                        );
                                                    },
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
        </AdminLayout>
    );
}
