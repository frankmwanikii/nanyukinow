import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionMenu,
    AdminInput,
    AdminSelect,
    DataCard,
    DataTable,
    EmptyState,
    FilterBar,
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
    Ticket,
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

function priorityTone(priority) {
    return (
        {
            low: 'text-olive-600 dark:text-olive-300',
            normal: 'text-olive-800 dark:text-olive-100',
            high: 'text-amber-800 dark:text-amber-200',
            urgent: 'text-rose-700 dark:text-rose-300',
        }[priority] || 'text-olive-800 dark:text-olive-100'
    );
}

export default function Index({ tickets, filters, counts, priorities = [] }) {
    const { confirm, dialog } = useConfirm();
    const [local, setLocal] = useState({
        q: filters.q || '',
        status: filters.status || 'open',
        priority: filters.priority || '',
        per_page: filters.per_page || 15,
    });
    const skipDebounce = useRef(true);
    const rows = tickets?.data || [];
    const total = tickets?.meta?.total ?? tickets?.total ?? rows.length;

    const pushFilters = (next) => {
        router.get(route('admin.tickets.index'), next, {
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

    const deleteTicket = async (ticket) => {
        const ok = await confirm({
            title: 'Delete ticket?',
            message: `Remove ${ticket.reference}? This cannot be undone.`,
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        router.delete(route('admin.tickets.destroy', ticket.id), {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout>
            <Head title="Tickets" />
            {dialog}

            <PageHeader
                title="Tickets"
                description="Reply to member support concerns from their account."
            />

            <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Open"
                    value={counts?.open ?? 0}
                    hint="Awaiting reply"
                    icon={Hourglass}
                    iconTone="amber"
                    actionLabel="Review open"
                    onAction={() => applyCardFilter('open')}
                />
                <SummaryCard
                    title="Answered"
                    value={counts?.answered ?? 0}
                    hint="Reply sent"
                    icon={CheckCircle2}
                    iconTone="mint"
                    actionLabel="View answered"
                    onAction={() => applyCardFilter('answered')}
                />
                <SummaryCard
                    title="Closed"
                    value={counts?.closed ?? 0}
                    hint="Resolved"
                    icon={XCircle}
                    iconTone="rose"
                    actionLabel="View closed"
                    onAction={() => applyCardFilter('closed')}
                />
                <SummaryCard
                    title="All tickets"
                    value={counts?.all ?? 0}
                    hint="Every concern"
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
                    placeholder="Subject, member, TKT-00012…"
                    className="min-w-[180px] flex-1"
                />
                <AdminSelect
                    label="Status"
                    value={local.status}
                    onChange={(e) => setSelect('status', e.target.value)}
                    className="w-[150px]"
                >
                    <option value="open">Open</option>
                    <option value="answered">Answered</option>
                    <option value="closed">Closed</option>
                    <option value="all">All</option>
                </AdminSelect>
                <AdminSelect
                    label="Priority"
                    value={local.priority}
                    onChange={(e) => setSelect('priority', e.target.value)}
                    className="w-[150px]"
                >
                    <option value="">Any</option>
                    {priorities.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                            {priority.label}
                        </option>
                    ))}
                </AdminSelect>
            </FilterBar>

            {rows.length === 0 ? (
                <EmptyState
                    title="No tickets found"
                    description="When a member opens a support ticket, it will show up here."
                />
            ) : (
                <DataCard
                    title={`${total} ticket${total === 1 ? '' : 's'}`}
                    footer={
                        <Pagination
                            links={tickets.links}
                            meta={tickets.meta || tickets}
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
                                <Th>Ticket</Th>
                                <Th>Member</Th>
                                <Th>Priority</Th>
                                <Th>Submitted</Th>
                                <Th>Status</Th>
                                <Th align="right">Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((ticket) => {
                                const showUrl = route(
                                    'admin.tickets.show',
                                    ticket.id,
                                );

                                return (
                                    <tr
                                        key={ticket.id}
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
                                            <div className="flex min-w-0 items-start gap-2.5">
                                                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-olive-100 text-olive-700 dark:bg-olive-800 dark:text-olive-200">
                                                    <Ticket className="h-4 w-4" />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-olive-950 dark:text-olive-50">
                                                        {ticket.subject}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-olive-500 dark:text-olive-400">
                                                        {ticket.reference}
                                                    </p>
                                                </div>
                                            </div>
                                        </Td>
                                        <Td>
                                            <p className="truncate text-sm text-olive-800 dark:text-olive-100">
                                                {ticket.user?.name ||
                                                    'Unknown member'}
                                            </p>
                                            <p className="truncate text-xs text-olive-500 dark:text-olive-400">
                                                {ticket.user?.email || ''}
                                            </p>
                                        </Td>
                                        <Td>
                                            <span
                                                className={`text-sm font-medium ${priorityTone(ticket.priority)}`}
                                            >
                                                {ticket.priority_label}
                                            </span>
                                        </Td>
                                        <Td>
                                            <span className="whitespace-nowrap text-sm text-olive-600 dark:text-olive-300">
                                                {formatDate(ticket.created_at)}
                                            </span>
                                        </Td>
                                        <Td>
                                            <StatusBadge
                                                status={ticket.status}
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
                                                        label: 'Open',
                                                        href: showUrl,
                                                    },
                                                    {
                                                        label: 'Delete',
                                                        danger: true,
                                                        onClick: () =>
                                                            deleteTicket(
                                                                ticket,
                                                            ),
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
