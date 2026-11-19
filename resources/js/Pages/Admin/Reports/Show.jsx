import AdminLayout from '@/Layouts/AdminLayout';
import {
    DataCard,
    PageHeader,
    StatusBadge,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from '@/Components/site/LucideCompat';

export default function Show({ report }) {
    const { confirm, dialog } = useConfirm();
    const form = useForm({
        status: 'reviewed',
        admin_notes: report.admin_notes || '',
    });

    const resolve = (status) => {
        form.transform((data) => ({ ...data, status }));
        form.post(route('admin.reports.resolve', report.id));
    };

    const destroy = async () => {
        const ok = await confirm({
            title: 'Delete report?',
            message: 'This cannot be undone.',
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        router.delete(route('admin.reports.destroy', report.id));
    };

    return (
        <AdminLayout>
            <Head title={`Report #${report.id}`} />
            {dialog}

            <PageHeader
                title="Listing report"
                description={report.listing?.title || 'Listing removed'}
                actions={
                    <Link
                        href={route('admin.reports.index')}
                        className="inline-flex items-center gap-2 rounded-xl border border-olive-200 bg-white px-3 py-2 text-sm font-semibold text-olive-800 transition hover:bg-olive-50 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                }
            />

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
                <DataCard title="Details">
                    <dl className="space-y-4 text-sm">
                        <div>
                            <dt className="text-xs font-medium text-olive-500">
                                Status
                            </dt>
                            <dd className="mt-1">
                                <StatusBadge status={report.status} />
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-olive-500">
                                Reason
                            </dt>
                            <dd className="mt-1 font-medium text-olive-900 dark:text-olive-50">
                                {report.reason}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-olive-500">
                                Details
                            </dt>
                            <dd className="mt-1 whitespace-pre-wrap text-olive-800 dark:text-olive-100">
                                {report.details}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-olive-500">
                                Reporter
                            </dt>
                            <dd className="mt-1 text-olive-800 dark:text-olive-100">
                                {report.reporter_name || 'Anonymous'}
                                {report.reporter_email
                                    ? ` · ${report.reporter_email}`
                                    : ''}
                            </dd>
                        </div>
                        {report.listing?.slug ? (
                            <div>
                                <dt className="text-xs font-medium text-olive-500">
                                    Listing
                                </dt>
                                <dd className="mt-1">
                                    <a
                                        href={route(
                                            'listings.show',
                                            report.listing.slug,
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-semibold text-olive-800 underline-offset-2 hover:underline dark:text-olive-100"
                                    >
                                        {report.listing.title}
                                    </a>
                                </dd>
                            </div>
                        ) : null}
                    </dl>
                </DataCard>

                {report.status === 'pending' ? (
                    <DataCard title="Resolve">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                resolve(form.data.status);
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-olive-500">
                                    Outcome
                                </label>
                                <select
                                    value={form.data.status}
                                    onChange={(e) =>
                                        form.setData('status', e.target.value)
                                    }
                                    className="w-full rounded-xl border-0 bg-olive-50 px-3 py-2.5 text-sm ring-1 ring-olive-200 dark:bg-olive-900 dark:ring-olive-700"
                                >
                                    <option value="reviewed">Reviewed</option>
                                    <option value="dismissed">Dismissed</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-olive-500">
                                    Admin notes
                                </label>
                                <textarea
                                    value={form.data.admin_notes}
                                    onChange={(e) =>
                                        form.setData(
                                            'admin_notes',
                                            e.target.value,
                                        )
                                    }
                                    rows={4}
                                    className="w-full rounded-xl border-0 bg-olive-50 px-3 py-2.5 text-sm ring-1 ring-olive-200 dark:bg-olive-900 dark:ring-olive-700"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-olive-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950 disabled:opacity-60"
                            >
                                Save resolution
                            </button>
                            <button
                                type="button"
                                onClick={destroy}
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                            >
                                Delete report
                            </button>
                        </form>
                    </DataCard>
                ) : (
                    <DataCard title="Resolution">
                        <p className="text-sm text-olive-700 dark:text-olive-200">
                            {report.admin_notes || 'No admin notes.'}
                        </p>
                        {report.reviewer?.name ? (
                            <p className="mt-3 text-xs text-olive-500">
                                By {report.reviewer.name}
                            </p>
                        ) : null}
                    </DataCard>
                )}
            </div>
        </AdminLayout>
    );
}
