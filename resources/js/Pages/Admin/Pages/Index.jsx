import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionMenu,
    DataCard,
    DataTable,
    EmptyState,
    PageHeader,
    Pagination,
    StatusBadge,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { Head, router } from '@inertiajs/react';

function formatUpdated(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    } catch {
        return '—';
    }
}

export default function Index({ pages, filters = {} }) {
    const rows = pages?.data || pages || [];
    const total = pages?.meta?.total ?? rows.length;
    const perPage = filters.per_page || pages?.meta?.per_page || 15;

    const setPerPage = (n) => {
        router.get(
            route('admin.pages.index'),
            { per_page: n },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AdminLayout>
            <Head title="Pages" />

            <PageHeader title="Pages" />

            {rows.length === 0 ? (
                <EmptyState
                    title="No pages yet"
                    description="Site pages will appear here once defaults are seeded."
                />
            ) : (
                <DataCard
                    title={`${total} pages`}
                    footer={
                        <Pagination
                            links={pages.links}
                            meta={pages.meta || pages}
                            perPage={perPage}
                            onPerPageChange={setPerPage}
                        />
                    }
                >
                    <DataTable>
                        <thead>
                            <tr>
                                <Th>Page</Th>
                                <Th>Status</Th>
                                <Th>Last modified</Th>
                                <Th align="right">Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((page) => (
                                <tr key={page.id}>
                                    <Td>
                                        <span className="text-base font-medium text-olive-900 dark:text-olive-50">
                                            {page.title}
                                        </span>
                                    </Td>
                                    <Td>
                                        <StatusBadge
                                            status={page.is_published ? 'published' : 'draft'}
                                        />
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-olive-500 dark:text-olive-400">
                                            {formatUpdated(page.updated_at)}
                                        </span>
                                    </Td>
                                    <Td align="right">
                                        <ActionMenu
                                            items={[
                                                {
                                                    label: 'Edit',
                                                    href: route('admin.pages.edit', page.id),
                                                },
                                                {
                                                    label: 'View',
                                                    href: page.public_url,
                                                    external: true,
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
