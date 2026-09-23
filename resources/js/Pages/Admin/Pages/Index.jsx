import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminLink,
    DataCard,
    EmptyState,
    StatusBadge,
} from '@/Components/Admin/ui';
import { Head } from '@inertiajs/react';
import { ExternalLink, FileText, Pencil } from 'lucide-react';

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

export default function Index({ pages = [] }) {
    return (
        <AdminLayout title="Pages">
            <Head title="Pages" />

            <p className="mb-5 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Every public page on the website. Open a page to edit its title, SEO fields, and
                on-page content.
            </p>

            {pages.length === 0 ? (
                <EmptyState
                    title="No pages yet"
                    description="Site pages will appear here once defaults are seeded."
                />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {pages.map((page) => (
                        <DataCard
                            key={page.id}
                            title={page.title}
                            tools={
                                <StatusBadge
                                    status={page.is_published ? 'published' : 'draft'}
                                />
                            }
                            footer={
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-xs text-olive-500">
                                        Updated {formatUpdated(page.updated_at)}
                                    </p>
                                    <div className="flex gap-2">
                                        <a
                                            href={page.public_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-olive-700 ring-1 ring-olive-200 transition hover:bg-olive-50 dark:text-olive-200 dark:ring-olive-700"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View
                                        </a>
                                        <AdminLink
                                            href={route('admin.pages.edit', page.id)}
                                            variant="secondary"
                                            className="!rounded-full !px-3 !py-1.5 !text-xs"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Edit
                                        </AdminLink>
                                    </div>
                                </div>
                            }
                        >
                            <div className="flex gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-olive-100 text-olive-800 dark:bg-olive-800 dark:text-olive-100">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-mono text-xs text-olive-500">
                                        {page.path}
                                    </p>
                                    <p className="mt-1 text-sm leading-snug text-olive-700 dark:text-olive-200">
                                        {page.description || 'Editable website page.'}
                                    </p>
                                </div>
                            </div>
                        </DataCard>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
