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
} from 'lucide-react';
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

export default function Index({ reports, filters, counts }) {
    const { confirm, dialog } = useConfirm();
    const [local, setLocal] = useState({
        q: filters.q || '',
        status: filters.status || 'pending',
        per_page: filters.per_page || 15,
    });
    const skipDebounce = useRef(true);
    const rows = reports?.data || [];
    const total = reports?.meta?.total ?? reports?.total ?? rows.length;

    const pushFilters = (next) => {
        router.get(route('admin.reports.index'), next, {
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

    const resolveReport = async (report, status) => {
        const ok = await confirm({
            title: status === 'dismissed' ? 'Dismiss report?' : 'Mark reviewed?',
            message: `Update report on “${report.listing?.title || 'listing'}”?`,
            confirmLabel: status === 'dismissed' ? 'Dismiss' : 'Mark reviewed',
            tone: status === 'dismissed' ? 'warning' : 'default',
        });
        if (!ok) return;
        router.post(
            route('admin.reports.resolve', report.id),
            { status },
            { preserveScroll: true },
        );
    };

    const deleteReport = async (report) => {
        const ok = await confirm({
            title: 'Delete report?',
            message: 'This cannot be undone.',
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        router.delete(route('admin.reports.destroy', report.id), {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout>
            <Head title="Reports" />
            {dialog}

            <PageHeader
                title="Reports"
                description="Review issues reported from public listing pages."
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
                    title="Reviewed"
                    value={counts?.reviewed ?? 0}
                    hint="Handled"
                    icon={CheckCircle2}
                    iconTone="mint"
                    actionLabel="View reviewed"
                    onAction={() => applyCardFilter('reviewed')}
                />
                <SummaryCard
                    title="Dismissed"
                    value={counts?.dismissed ?? 0}
                    hint="Not actionable"
                    icon={XCircle}
                    iconTone="rose"
                    actionLabel="View dismissed"
                    onAction={() => applyCardFilter('dismissed')}
                />
                <SummaryCard
                    title="All reports"
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
                    placeholder="Reason, listing, email…"
                    className="min-w-[180px] flex-1"
                />
                <AdminSelect
                    label="Status"
                    value={local.status}
                    onChange={(e) => setSelect('status', e.target.value)}
                    className="w-[150px]"
                >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="dismissed">Dismissed</option>
                    <option value="all">All</option>
                </AdminSelect>
            </FilterBar>

            {rows.length === 0 ? (
                <EmptyState
                    title="No reports found"
                    description="When someone reports a listing, it will show up here."
                />
            ) : (
                <DataCard
                    title={`${total} report${total === 1 ? '' : 's'}`}
                    footer={
                        <Pagination
                            links={reports.links}
                            meta={reports.meta || reports}
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
                                <Th>Reason</Th>
                                <Th>Reporter</Th>
                                <Th>Submitted</Th>
                                <Th>Status</Th>
                                <Th align="right">Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((report) => {
                                const showUrl = route(
                                    'admin.reports.show',
                                    report.id,
                                );
                                const pending = report.status === 'pending';

                                return (
                                    <tr
                                        key={report.id}
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
                                                image={report.listing?.image}
                                                title={
                                                    report.listing?.title ||
                                                    'Listing removed'
                                                }
                                            />
                                        </Td>
                                        <Td>
                                            <p className="truncate text-sm font-medium text-olive-900 dark:text-olive-50">
                                                {report.reason}
                                            </p>
                                        </Td>
                                        <Td>
                                            <p className="truncate text-sm text-olive-800 dark:text-olive-100">
                                                {report.reporter_name ||
                                                    report.reporter_email ||
                                                    'Anonymous'}
                                            </p>
                                        </Td>
                                        <Td>
                                            <span className="whitespace-nowrap text-sm text-olive-600 dark:text-olive-300">
                                                {formatDate(report.created_at)}
                                            </span>
                                        </Td>
                                        <Td>
                                            <StatusBadge
                                                status={report.status}
                                            />
                                        </Td>
                                        <Td
                                            align="right"
                                            onClick={(e) => e.stopPropagation()}
                                            onKeyDown={(e) =>
                                                e.stopPropagation()
                                            }
                                        >
                                            <ActionMenu
                                                items={[
                                                    {
                                                        label: 'Review',
                                                        href: showUrl,
                                                    },
                                                    pending
                                                        ? {
                                                              label: 'Mark reviewed',
                                                              onClick: () =>
                                                                  resolveReport(
                                                                      report,
                                                                      'reviewed',
                                                                  ),
                                                          }
                                                        : null,
                                                    pending
                                                        ? {
                                                              label: 'Dismiss',
                                                              onClick: () =>
                                                                  resolveReport(
                                                                      report,
                                                                      'dismissed',
                                                                  ),
                                                          }
                                                        : null,
                                                    {
                                                        label: 'Delete',
                                                        danger: true,
                                                        onClick: () =>
                                                            deleteReport(
                                                                report,
                                                            ),
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
