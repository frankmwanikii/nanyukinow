import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionMenu,
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
    SummaryCard,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    ClipboardList,
    Hourglass,
    XCircle,
} from '@/Components/site/LucideCompat';
import { useEffect, useRef, useState } from 'react';

function formatDate(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString(undefined, {
            dateStyle: 'medium',
        });
    } catch {
        return '—';
    }
}

export default function Index({ claims, filters, counts }) {
    const { confirm, dialog } = useConfirm();
    const [local, setLocal] = useState({
        q: filters.q || '',
        status: filters.status || 'pending',
        per_page: filters.per_page || 15,
    });
    const skipDebounce = useRef(true);
    const rows = claims?.data || [];
    const total = claims?.meta?.total ?? claims?.total ?? rows.length;

    const pushFilters = (next) => {
        router.get(route('admin.claims.index'), next, {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [local.q]);

    const setSelect = (key, value) => {
        const next = { ...local, [key]: value };
        setLocal(next);
        pushFilters(next);
    };

    const applyCardFilter = (status) => {
        const next = { ...local, status };
        setLocal(next);
        pushFilters(next);
    };

    const approveClaim = async (claim) => {
        const ok = await confirm({
            title: 'Approve claim?',
            message: `Approve “${claim.full_name}” for ${
                claim.listing?.title || 'this listing'
            }? The listing will be marked claimed.`,
            confirmLabel: 'Approve',
            tone: 'warning',
        });
        if (!ok) return;
        router.post(
            route('admin.claims.approve', claim.id),
            {},
            { preserveScroll: true },
        );
    };

    const rejectClaim = async (claim) => {
        const ok = await confirm({
            title: 'Reject claim?',
            message: `Reject “${claim.full_name}” for ${
                claim.listing?.title || 'this listing'
            }?`,
            confirmLabel: 'Reject',
        });
        if (!ok) return;
        router.post(
            route('admin.claims.reject', claim.id),
            { admin_notes: 'Rejected from claims list.' },
            { preserveScroll: true },
        );
    };

    const deleteClaim = async (claim) => {
        const ok = await confirm({
            title: 'Delete claim?',
            message: `Delete the claim from “${claim.full_name}”? This cannot be undone.`,
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        router.delete(route('admin.claims.destroy', claim.id), {
            preserveScroll: true,
        });
    };

    const emptyTitle =
        local.status === 'pending'
            ? 'No pending claims'
            : local.status === 'approved'
              ? 'No approved claims'
              : local.status === 'rejected'
                ? 'No rejected claims'
                : 'No claims found';

    const emptyDescription =
        local.status === 'pending'
            ? 'When someone submits a claim on a listing, it will show up here for review.'
            : 'Adjust the status filter or search to find claims.';

    return (
        <AdminLayout>
            <Head title="Claims" />
            {dialog}

            <PageHeader
                title="Claims"
                description="Review ownership claims submitted from listing pages."
            />

            <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Pending"
                    value={counts?.pending ?? 0}
                    hint="Awaiting review"
                    icon={Hourglass}
                    iconTone="amber"
                    actionLabel="Review queue"
                    onAction={() => applyCardFilter('pending')}
                />
                <SummaryCard
                    title="Approved"
                    value={counts?.approved ?? 0}
                    hint="Assigned to claimants"
                    icon={CheckCircle2}
                    iconTone="mint"
                    actionLabel="View approved"
                    onAction={() => applyCardFilter('approved')}
                />
                <SummaryCard
                    title="Rejected"
                    value={counts?.rejected ?? 0}
                    hint="Declined requests"
                    icon={XCircle}
                    iconTone="rose"
                    actionLabel="View rejected"
                    onAction={() => applyCardFilter('rejected')}
                />
                <SummaryCard
                    title="All claims"
                    value={counts?.all ?? 0}
                    hint="Every submission"
                    icon={ClipboardList}
                    iconTone="slate"
                    actionLabel="View all"
                    onAction={() => applyCardFilter('all')}
                />
            </div>

            <FilterBar>
                <AdminInput
                    label="Search"
                    value={local.q}
                    onChange={(e) => setLocal({ ...local, q: e.target.value })}
                    placeholder="Claimant, email, listing…"
                    className="min-w-[180px] flex-1"
                />
                <AdminSelect
                    label="Status"
                    value={local.status}
                    onChange={(e) => setSelect('status', e.target.value)}
                    className="w-[150px]"
                >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="all">All</option>
                </AdminSelect>
            </FilterBar>

            {rows.length === 0 ? (
                <EmptyState title={emptyTitle} description={emptyDescription} />
            ) : (
                <DataCard
                    title={`${total} claim${total === 1 ? '' : 's'}`}
                    footer={
                        <Pagination
                            links={claims.links}
                            meta={claims.meta || claims}
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
                                <Th>Listing</Th>
                                <Th>Claimant</Th>
                                <Th>Email</Th>
                                <Th>Phone</Th>
                                <Th>Docs</Th>
                                <Th>Submitted</Th>
                                <Th>Status</Th>
                                <Th align="right">Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((claim) => {
                                const showUrl = route(
                                    'admin.claims.show',
                                    claim.id,
                                );
                                const docs = claim.documents?.length || 0;
                                const pending = claim.status === 'pending';

                                return (
                                    <tr
                                        key={claim.id}
                                        role="link"
                                        tabIndex={0}
                                        className="cursor-pointer transition hover:bg-olive-50/80 dark:hover:bg-olive-800/40"
                                        onClick={() => router.visit(showUrl)}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === 'Enter' ||
                                                e.key === ' '
                                            ) {
                                                e.preventDefault();
                                                router.visit(showUrl);
                                            }
                                        }}
                                    >
                                        <Td>
                                            <MediaCell
                                                image={claim.listing?.image}
                                                title={
                                                    claim.listing?.title ||
                                                    'Listing removed'
                                                }
                                            />
                                        </Td>
                                        <Td>
                                            <p className="truncate text-sm font-medium text-olive-900 dark:text-olive-50">
                                                {claim.full_name}
                                            </p>
                                        </Td>
                                        <Td>
                                            <p className="truncate text-sm text-olive-800 dark:text-olive-100">
                                                {claim.email || '—'}
                                            </p>
                                        </Td>
                                        <Td>
                                            <p className="truncate whitespace-nowrap text-sm text-olive-800 dark:text-olive-100">
                                                {claim.phone || '—'}
                                            </p>
                                        </Td>
                                        <Td>
                                            <span className="tabular-nums text-sm text-olive-700 dark:text-olive-200">
                                                {docs}
                                            </span>
                                        </Td>
                                        <Td>
                                            <span className="whitespace-nowrap text-sm text-olive-600 dark:text-olive-300">
                                                {formatDate(claim.created_at)}
                                            </span>
                                        </Td>
                                        <Td>
                                            <StatusBadge status={claim.status} />
                                        </Td>
                                        <Td
                                            align="right"
                                            onClick={(e) => e.stopPropagation()}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        >
                                            <ActionMenu
                                                items={[
                                                    {
                                                        label: 'Review',
                                                        href: showUrl,
                                                    },
                                                    pending
                                                        ? {
                                                              label: 'Approve',
                                                              onClick: () =>
                                                                  approveClaim(
                                                                      claim,
                                                                  ),
                                                          }
                                                        : null,
                                                    pending
                                                        ? {
                                                              label: 'Reject',
                                                              onClick: () =>
                                                                  rejectClaim(
                                                                      claim,
                                                                  ),
                                                          }
                                                        : null,
                                                    {
                                                        label: 'Delete',
                                                        danger: true,
                                                        onClick: () =>
                                                            deleteClaim(claim),
                                                    },
                                                ].filter(Boolean)}
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
