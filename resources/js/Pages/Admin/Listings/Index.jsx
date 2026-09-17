import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionGroup,
    ActionIcon,
    AdminButton,
    AdminCheckbox,
    AdminInput,
    AdminLink,
    AdminSelect,
    DataCard,
    DataTable,
    EmptyState,
    ExpiryCell,
    FilterBar,
    MediaCell,
    Pagination,
    StatusBadge,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { Head, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function Index({ listings, filters, categories, statuses, tiers }) {
    const [selected, setSelected] = useState([]);
    const [local, setLocal] = useState({
        q: filters.q || '',
        status: filters.status || '',
        tier: filters.tier || '',
        category_id: filters.category_id || '',
        expiry: filters.expiry || '',
        featured: filters.featured || false,
        sort: filters.sort || 'updated_at',
        direction: filters.direction || 'desc',
    });

    const allIds = useMemo(() => listings.data.map((l) => l.id), [listings.data]);
    const allSelected = allIds.length > 0 && selected.length === allIds.length;

    const applyFilters = (e) => {
        e?.preventDefault();
        router.get(route('admin.listings.index'), local, {
            preserveState: true,
            replace: true,
        });
    };

    const toggleSort = (column) => {
        const next = {
            ...local,
            sort: column,
            direction: local.sort === column && local.direction === 'asc' ? 'desc' : 'asc',
        };
        setLocal(next);
        router.get(route('admin.listings.index'), next, { preserveState: true, replace: true });
    };

    const toggleOne = (id) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const toggleAll = () => {
        setSelected(allSelected ? [] : allIds);
    };

    const runBulk = (action) => {
        if (!selected.length) return;
        if (action === 'delete' && !confirm(`Delete ${selected.length} listing(s)?`)) return;
        router.post(route('admin.listings.bulk'), { ids: selected, action }, {
            onSuccess: () => setSelected([]),
        });
    };

    return (
        <AdminLayout
            title="Listings"
            actions={
                <AdminLink href={route('admin.listings.create')}>
                    <Plus className="h-4 w-4" />
                    Add listing
                </AdminLink>
            }
        >
            <Head title="Admin listings" />

            <FilterBar onSubmit={applyFilters}>
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
                    onChange={(e) => setLocal({ ...local, status: e.target.value })}
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
                    onChange={(e) => setLocal({ ...local, tier: e.target.value })}
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
                    onChange={(e) => setLocal({ ...local, category_id: e.target.value })}
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
                    onChange={(e) => setLocal({ ...local, expiry: e.target.value })}
                    className="w-[150px]"
                >
                    <option value="">Any</option>
                    <option value="soon">Soon (14d)</option>
                    <option value="expired">Expired</option>
                    <option value="none">No expiry</option>
                </AdminSelect>
                <div className="flex items-end gap-3 pb-0.5">
                    <AdminCheckbox
                        label="Featured"
                        checked={local.featured}
                        onChange={(e) => setLocal({ ...local, featured: e.target.checked })}
                    />
                    <AdminButton type="submit" size="sm">
                        <Search className="h-3.5 w-3.5" />
                        Filter
                    </AdminButton>
                </div>
            </FilterBar>

            {selected.length > 0 && (
                <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-olive-200 bg-olive-50 px-3 py-2 text-sm dark:border-olive-700 dark:bg-olive-900">
                    <span className="text-xs font-semibold text-olive-800 dark:text-olive-100">{selected.length} selected</span>
                    <AdminButton size="sm" variant="secondary" onClick={() => runBulk('publish')}>Publish</AdminButton>
                    <AdminButton size="sm" variant="secondary" onClick={() => runBulk('unpublish')}>Unpublish</AdminButton>
                    <AdminButton size="sm" variant="secondary" onClick={() => runBulk('feature')}>Feature</AdminButton>
                    <AdminButton size="sm" variant="secondary" onClick={() => runBulk('archive')}>Archive</AdminButton>
                    <AdminButton size="sm" variant="danger" onClick={() => runBulk('delete')}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                    </AdminButton>
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
                        <Pagination links={listings.links} meta={listings.meta} />
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
                                return (
                                    <tr key={listing.id} className={isSelected ? 'is-selected' : ''}>
                                        <Td>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleOne(listing.id)}
                                                className="h-3.5 w-3.5 rounded border-slate-300 text-slate-800"
                                            />
                                        </Td>
                                        <Td>
                                            <MediaCell
                                                image={listing.image_url}
                                                title={listing.title}
                                                subtitle={listing.location || listing.slug}
                                                href={route('admin.listings.edit', listing.id)}
                                            />
                                        </Td>
                                        <Td>
                                            <span className="text-xs text-slate-600">
                                                {listing.category || '—'}
                                            </span>
                                        </Td>
                                        <Td><StatusBadge status={listing.status} /></Td>
                                        <Td><StatusBadge status={listing.tier} /></Td>
                                        <Td align="center">
                                            <span className="tabular-nums text-xs text-slate-600">
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
                                            <span className="text-xs text-slate-500">
                                                {listing.updated_at
                                                    ? new Date(listing.updated_at).toLocaleDateString()
                                                    : '—'}
                                            </span>
                                        </Td>
                                        <Td align="right">
                                            <ActionGroup>
                                                <ActionIcon
                                                    href={route('admin.listings.edit', listing.id)}
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </ActionIcon>
                                                <ActionIcon
                                                    href={route('listings.show', listing.slug)}
                                                    title="View"
                                                    external
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </ActionIcon>
                                            </ActionGroup>
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
