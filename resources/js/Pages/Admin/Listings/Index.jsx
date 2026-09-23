import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionMenu,
    AdminButton,
    AdminInput,
    AdminLink,
    AdminSelect,
    DataCard,
    DataTable,
    EmptyState,
    ExpiryCell,
    FilterBar,
    MediaCell,
    PageHeader,
    Pagination,
    StatusBadge,
    SummaryCard,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import { Head, router } from '@inertiajs/react';
import {
    CircleCheck,
    Clock,
    Crown,
    Hourglass,
    Plus,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function Index({
    listings,
    filters,
    categories,
    statuses,
    tiers,
    stats = {},
}) {
    const { confirm, dialog } = useConfirm();
    const [selected, setSelected] = useState([]);
    const [local, setLocal] = useState({
        q: filters.q || '',
        status: filters.status || '',
        tier: filters.tier || '',
        category_id: filters.category_id || '',
        expiry: filters.expiry || '',
        sort: filters.sort || 'updated_at',
        direction: filters.direction || 'desc',
        per_page: filters.per_page || 15,
    });
    const skipDebounce = useRef(true);

    const allIds = useMemo(() => listings.data.map((l) => l.id), [listings.data]);
    const allSelected = allIds.length > 0 && selected.length === allIds.length;

    const applyCardFilter = (partial) => {
        const next = {
            ...local,
            status: '',
            tier: '',
            expiry: '',
            ...partial,
        };
        setLocal(next);
        pushFilters(next);
    };

    const pushFilters = (next) => {
        router.get(route('admin.listings.index'), next, {
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
            pushFilters(local);
        }, 350);

        return () => clearTimeout(timer);
        // Debounce search typing only; selects call pushFilters immediately.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [local.q]);

    const setSelect = (key, value) => {
        const next = { ...local, [key]: value };
        setLocal(next);
        pushFilters(next);
    };

    const toggleSort = (column) => {
        const next = {
            ...local,
            sort: column,
            direction: local.sort === column && local.direction === 'asc' ? 'desc' : 'asc',
        };
        setLocal(next);
        pushFilters(next);
    };

    const toggleOne = (id) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const toggleAll = () => {
        setSelected(allSelected ? [] : allIds);
    };

    const runBulk = async (action) => {
        if (!selected.length) return;
        if (action === 'delete') {
            const ok = await confirm({
                title: 'Delete listings?',
                message: `Delete ${selected.length} selected listing${selected.length === 1 ? '' : 's'}? This cannot be undone.`,
                confirmLabel: 'Delete',
            });
            if (!ok) return;
        }
        router.post(route('admin.listings.bulk'), { ids: selected, action }, {
            onSuccess: () => setSelected([]),
        });
    };

    return (
        <AdminLayout>
            <Head title="Admin listings" />
            {dialog}

            <PageHeader
                title="Listings"
                actions={
                    <AdminLink href={route('admin.listings.create')}>
                        <Plus className="h-4 w-4" />
                        New listing
                    </AdminLink>
                }
            />

            <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Published"
                    value={stats.published ?? 0}
                    hint="Live on the site"
                    icon={CircleCheck}
                    iconTone="mint"
                    actionLabel="View published"
                    onAction={() => applyCardFilter({ status: 'published' })}
                />
                <SummaryCard
                    title="Premium"
                    value={stats.premium ?? 0}
                    hint="Premium plan listings"
                    icon={Crown}
                    iconTone="mustard"
                    actionLabel="View premium"
                    onAction={() => applyCardFilter({ tier: 'premium' })}
                />
                <SummaryCard
                    title="Pending review"
                    value={stats.pending ?? 0}
                    hint="Awaiting approval"
                    icon={Hourglass}
                    iconTone="amber"
                    actionLabel="Review queue"
                    onAction={() => applyCardFilter({ status: 'pending' })}
                />
                <SummaryCard
                    title="Expiring soon"
                    value={stats.expiring_soon ?? 0}
                    hint="Within the next 14 days"
                    icon={Clock}
                    iconTone="rose"
                    actionLabel="View expiring"
                    onAction={() => applyCardFilter({ expiry: 'soon' })}
                />
            </div>

            <FilterBar>
                <AdminInput
                    label="Search"
                    value={local.q}
                    onChange={(e) => setLocal({ ...local, q: e.target.value })}
                    placeholder="Title, location, phone…"
                    className="min-w-[180px] flex-1"
                />
                <AdminSelect
                    label="Status"
                    value={local.status}
                    onChange={(e) => setSelect('status', e.target.value)}
                    className="w-[140px]"
                >
                    <option value="">All</option>
                    {statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </AdminSelect>
                <AdminSelect
                    label="Tier"
                    value={local.tier}
                    onChange={(e) => setSelect('tier', e.target.value)}
                    className="w-[130px]"
                >
                    <option value="">All</option>
                    {tiers.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </AdminSelect>
                <AdminSelect
                    label="Category"
                    value={local.category_id}
                    onChange={(e) => setSelect('category_id', e.target.value)}
                    className="w-[150px]"
                >
                    <option value="">All</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </AdminSelect>
                <AdminSelect
                    label="Expiry"
                    value={local.expiry}
                    onChange={(e) => setSelect('expiry', e.target.value)}
                    className="w-[150px]"
                >
                    <option value="">Any</option>
                    <option value="soon">Soon (14d)</option>
                    <option value="expired">Expired</option>
                    <option value="none">No expiry</option>
                </AdminSelect>
            </FilterBar>

            {selected.length > 0 && (
                <div className="sticky top-0 z-20 -mx-4 mb-3 border-b border-olive-200/80 bg-earth-sand/95 px-4 py-2.5 backdrop-blur-sm sm:-mx-6 sm:px-6 dark:border-olive-800 dark:bg-olive-950/95">
                    <div className="flex flex-wrap items-center gap-2 rounded-md border border-olive-200 bg-olive-50 px-3 py-2 text-sm shadow-soft dark:border-olive-700 dark:bg-olive-900">
                        <span className="text-xs font-semibold text-olive-800 dark:text-olive-100">{selected.length} selected</span>
                        <AdminButton size="sm" variant="secondary" onClick={() => runBulk('publish')}>Publish</AdminButton>
                        <AdminButton size="sm" variant="secondary" onClick={() => runBulk('unpublish')}>Unpublish</AdminButton>
                        <AdminButton size="sm" variant="secondary" onClick={() => runBulk('feature')}>Feature</AdminButton>
                        <AdminButton size="sm" variant="secondary" onClick={() => runBulk('archive')}>Archive</AdminButton>
                        <AdminButton size="sm" variant="danger" onClick={() => runBulk('delete')}>
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                        </AdminButton>
                    </div>
                </div>
            )}

            {listings.data.length === 0 ? (
                <EmptyState
                    title="No listings match"
                    description="Adjust filters or create a new listing for the directory."
                    action={
                        <AdminLink href={route('admin.listings.create')}>
                            Create listing
                        </AdminLink>
                    }
                />
            ) : (
                <DataCard
                    title={`${listings.meta?.total ?? listings.data.length} listings`}
                    footer={
                        <Pagination
                            links={listings.links}
                            meta={listings.meta || listings}
                            perPage={local.per_page}
                            onPerPageChange={(n) => {
                                const next = { ...local, per_page: n };
                                setLocal(next);
                                pushFilters(next);
                            }}
                        />
                    }
                >
                    <DataTable>
                        <thead>
                            <tr>
                                <Th className="w-10">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleAll}
                                        className="h-3.5 w-3.5 rounded border-slate-300 text-slate-800"
                                    />
                                </Th>
                                <Th
                                    sortable
                                    sorted={local.sort === 'title'}
                                    direction={local.direction}
                                    onSort={() => toggleSort('title')}
                                >
                                    Listing
                                </Th>
                                <Th>Category</Th>
                                <Th
                                    sortable
                                    sorted={local.sort === 'status'}
                                    direction={local.direction}
                                    onSort={() => toggleSort('status')}
                                >
                                    Status
                                </Th>
                                <Th
                                    sortable
                                    sorted={local.sort === 'tier'}
                                    direction={local.direction}
                                    onSort={() => toggleSort('tier')}
                                >
                                    Tier
                                </Th>
                                <Th
                                    sortable
                                    sorted={local.sort === 'priority'}
                                    direction={local.direction}
                                    onSort={() => toggleSort('priority')}
                                    align="center"
                                >
                                    Priority
                                </Th>
                                <Th
                                    sortable
                                    sorted={local.sort === 'expires_at'}
                                    direction={local.direction}
                                    onSort={() => toggleSort('expires_at')}
                                >
                                    Expires
                                </Th>
                                <Th
                                    sortable
                                    sorted={local.sort === 'updated_at'}
                                    direction={local.direction}
                                    onSort={() => toggleSort('updated_at')}
                                >
                                    Updated
                                </Th>
                                <Th align="right">Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {listings.data.map((listing) => {
                                const isSelected = selected.includes(listing.id);
                                const editUrl = route('admin.listings.edit', listing.slug || listing.id);
                                return (
                                    <tr
                                        key={listing.id}
                                        role="link"
                                        tabIndex={0}
                                        onClick={() => router.visit(editUrl)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                router.visit(editUrl);
                                            }
                                        }}
                                        className={`cursor-pointer transition hover:bg-olive-50/80 dark:hover:bg-olive-800/40 ${
                                            isSelected
                                                ? 'is-selected ring-1 ring-inset ring-olive-900/15 dark:ring-mustard/30'
                                                : ''
                                        }`}
                                    >
                                        <Td
                                            onClick={(e) => e.stopPropagation()}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleOne(listing.id)}
                                                className="h-3.5 w-3.5 rounded border-slate-300 text-slate-800"
                                                aria-label={`Select ${listing.title}`}
                                            />
                                        </Td>
                                        <Td>
                                            <MediaCell
                                                image={
                                                    listing.categoryKey === 'events'
                                                        ? listing.eventPoster || listing.image || listing.image_url
                                                        : listing.image || listing.image_url
                                                }
                                                title={listing.title}
                                            />
                                        </Td>
                                        <Td>
                                            <span className="text-sm text-olive-600 dark:text-olive-300">
                                                {listing.category || '—'}
                                            </span>
                                        </Td>
                                        <Td><StatusBadge status={listing.status} /></Td>
                                        <Td><StatusBadge status={listing.tier} /></Td>
                                        <Td align="center">
                                            <span className="tabular-nums text-sm text-olive-700 dark:text-olive-200">
                                                {listing.priority}
                                            </span>
                                        </Td>
                                        <Td>
                                            <ExpiryCell
                                                expiresAt={listing.expires_at}
                                                label={listing.expiry_label}
                                                isExpired={listing.is_expired}
                                            />
                                        </Td>
                                        <Td>
                                            <span className="text-sm text-olive-500 dark:text-olive-400">
                                                {listing.updated_at
                                                    ? new Date(listing.updated_at).toLocaleDateString()
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
                                                        label: 'Edit',
                                                        href: editUrl,
                                                    },
                                                    {
                                                        label:
                                                            listing.status === 'published' &&
                                                            listing.is_published
                                                                ? 'View'
                                                                : 'Preview',
                                                        href: route('listings.show', listing.slug),
                                                        external: true,
                                                    },
                                                    {
                                                        label: 'Delete',
                                                        danger: true,
                                                        onClick: async () => {
                                                            const ok = await confirm({
                                                                title: 'Delete listing?',
                                                                message: `Delete “${listing.title || 'Untitled'}”? This cannot be undone.`,
                                                                confirmLabel: 'Delete',
                                                            });
                                                            if (!ok) return;
                                                            router.delete(
                                                                route(
                                                                    'admin.listings.destroy',
                                                                    listing.slug || listing.id,
                                                                ),
                                                            );
                                                        },
                                                    },
                                                ]}
                                            />
                                        </Td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </DataTable>
                </DataCard>
            )}
        </AdminLayout>
    );
}
