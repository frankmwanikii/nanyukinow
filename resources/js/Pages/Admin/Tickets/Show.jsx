import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminButton,
    AdminCheckbox,
    AdminTextarea,
    FormPanel,
    PageHeader,
    StatusBadge,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import { TicketMark } from '@/Components/site/Mark';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from '@/Components/site/LucideCompat';

function formatDate(iso) {
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

function formatBytes(size) {
    const n = Number(size);
    if (!Number.isFinite(n) || n <= 0) return null;
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageAttachment(attachment) {
    if (!attachment) return false;
    if (String(attachment.mime || '').startsWith('image/')) return true;
    return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(attachment.name || '');
}

function priorityTone(priority) {
    return (
        {
            low: 'border-olive-200 bg-olive-50 text-olive-700 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-300',
            normal:
                'border-olive-300 bg-white text-olive-800 dark:border-olive-600 dark:bg-olive-900 dark:text-olive-200',
            high: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
            urgent:
                'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
        }[priority] ||
        'border-olive-200 bg-olive-50 text-olive-700 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-300'
    );
}

function initials(name = '') {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function MetaChip({ children, className = '' }) {
    return (
        <span
            className={`inline-flex items-center border px-2 py-0.5 text-[11px] font-semibold ${className}`}
        >
            {children}
        </span>
    );
}

export default function Show({ ticket }) {
    const { confirm, dialog } = useConfirm();
    const form = useForm({
        admin_reply: ticket.admin_reply || '',
        close: false,
    });
    const isClosed = ticket.status === 'closed';
    const memberName = ticket.user?.name || 'Unknown member';
    const attachmentSize = formatBytes(ticket.attachment?.size);
    const previewUrl =
        ticket.attachment?.preview_url ||
        (isImageAttachment(ticket.attachment)
            ? ticket.attachment.url
            : null);

    const submitReply = (e) => {
        e.preventDefault();
        form.post(route('admin.tickets.reply', ticket.id), {
            preserveScroll: true,
        });
    };

    const closeTicket = async () => {
        const ok = await confirm({
            title: 'Close ticket?',
            message: `Close ${ticket.reference} without sending a new reply?`,
            confirmLabel: 'Close ticket',
            tone: 'warning',
        });
        if (!ok) return;
        router.post(
            route('admin.tickets.close', ticket.id),
            {},
            { preserveScroll: true },
        );
    };

    const reopenTicket = async () => {
        const ok = await confirm({
            title: 'Reopen ticket?',
            message: `Mark ${ticket.reference} as open again?`,
            confirmLabel: 'Reopen',
        });
        if (!ok) return;
        router.post(
            route('admin.tickets.reopen', ticket.id),
            {},
            { preserveScroll: true },
        );
    };

    const destroy = async () => {
        const ok = await confirm({
            title: 'Delete ticket?',
            message: 'This cannot be undone.',
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        router.delete(route('admin.tickets.destroy', ticket.id));
    };

    return (
        <AdminLayout>
            <Head title={ticket.reference} />
            {dialog}

            <PageHeader
                title={ticket.subject}
                description="Member support concern. Reply here and it shows on their ticket."
                actions={
                    <Link
                        href={route('admin.tickets.index')}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-olive-600 transition hover:text-olive-950 dark:text-olive-300 dark:hover:text-olive-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        All tickets
                    </Link>
                }
            />

            <div className="mb-5 flex flex-wrap items-center gap-2">
                <MetaChip className="border-olive-200 bg-white text-olive-700 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-200">
                    <TicketMark className="mr-1.5 h-3.5 w-3.5" />
                    {ticket.reference}
                </MetaChip>
                <StatusBadge status={ticket.status} />
                <MetaChip className={priorityTone(ticket.priority)}>
                    {ticket.priority_label} priority
                </MetaChip>
                <span className="text-sm text-olive-500 dark:text-olive-400">
                    Opened {formatDate(ticket.created_at)}
                </span>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)]">
                <div className="space-y-5">
                    <FormPanel title="Conversation">
                        <div className="space-y-4">
                            <article className="border border-olive-200 bg-olive-50/70 p-4 dark:border-olive-700 dark:bg-olive-950/60 sm:p-5">
                                <div className="flex items-start gap-3">
                                    <span
                                        aria-hidden="true"
                                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center bg-olive-800 text-xs font-semibold text-white dark:bg-olive-700"
                                    >
                                        {initials(memberName)}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                                            <p className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                                                {memberName}
                                            </p>
                                            <p className="text-xs text-olive-500 dark:text-olive-400">
                                                {formatDate(ticket.created_at)}
                                            </p>
                                        </div>
                                        <p className="mt-0.5 text-xs font-medium text-olive-500 dark:text-olive-400">
                                            Member message
                                        </p>
                                        <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-olive-900 dark:text-olive-100">
                                            {ticket.body}
                                        </div>
                                    </div>
                                </div>
                            </article>

                            {ticket.admin_reply ? (
                                <article className="border border-mustard/40 bg-mustard/10 p-4 dark:border-mustard/30 dark:bg-mustard/5 sm:p-5">
                                    <div className="flex items-start gap-3">
                                        <span
                                            aria-hidden="true"
                                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center bg-mustard text-xs font-semibold text-olive-950"
                                        >
                                            NN
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                                <p className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                                                    {ticket.reviewer?.name ||
                                                        'Nanyuki Now team'}
                                                </p>
                                                <p className="text-xs text-olive-500 dark:text-olive-400">
                                                    {formatDate(
                                                        ticket.answered_at,
                                                    )}
                                                </p>
                                            </div>
                                            <p className="mt-0.5 text-xs font-medium text-olive-500 dark:text-olive-400">
                                                Team reply
                                            </p>
                                            <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-olive-900 dark:text-olive-100">
                                                {ticket.admin_reply}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ) : (
                                <div className="border border-dashed border-olive-300 px-4 py-5 text-sm text-olive-600 dark:border-olive-700 dark:text-olive-300">
                                    No team reply yet. Use the panel on the
                                    right to respond.
                                </div>
                            )}
                        </div>
                    </FormPanel>

                    {ticket.attachment ? (
                        <FormPanel
                            title="Attachment"
                            description={
                                attachmentSize
                                    ? `${ticket.attachment.name || 'File'} · ${attachmentSize}`
                                    : ticket.attachment.name || 'Attached file'
                            }
                        >
                            {previewUrl ? (
                                <a
                                    href={ticket.attachment.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group block overflow-hidden border border-olive-200 bg-olive-50 dark:border-olive-700 dark:bg-olive-950"
                                >
                                    <img
                                        src={previewUrl}
                                        alt={
                                            ticket.attachment.name ||
                                            'Ticket attachment'
                                        }
                                        className="max-h-80 w-full object-contain transition group-hover:opacity-95"
                                    />
                                </a>
                            ) : null}
                            <a
                                href={ticket.attachment.url}
                                className="mt-3 inline-flex text-sm font-semibold text-olive-800 underline-offset-2 hover:underline dark:text-olive-100"
                            >
                                Download{' '}
                                {ticket.attachment.name || 'attachment'}
                            </a>
                        </FormPanel>
                    ) : null}
                </div>

                <div className="space-y-5 lg:sticky lg:top-4 lg:self-start">
                    <FormPanel title="Member">
                        <div className="flex items-start gap-3">
                            <span
                                aria-hidden="true"
                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center bg-olive-800 text-sm font-semibold text-white dark:bg-olive-700"
                            >
                                {initials(memberName)}
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-olive-950 dark:text-olive-50">
                                    {memberName}
                                </p>
                                {ticket.user?.email ? (
                                    <a
                                        href={`mailto:${ticket.user.email}`}
                                        className="mt-0.5 block truncate text-sm text-olive-600 underline-offset-2 hover:underline dark:text-olive-300"
                                    >
                                        {ticket.user.email}
                                    </a>
                                ) : (
                                    <p className="mt-0.5 text-sm text-olive-500">
                                        No email on file
                                    </p>
                                )}
                            </div>
                        </div>
                        {ticket.user?.id ? (
                            <Link
                                href={route(
                                    'admin.users.show',
                                    ticket.user.id,
                                )}
                                className="mt-4 inline-flex text-sm font-semibold text-olive-800 underline-offset-2 hover:underline dark:text-mustard"
                            >
                                View member account
                            </Link>
                        ) : null}
                    </FormPanel>

                    {!isClosed ? (
                        <FormPanel
                            title="Reply"
                            description="Your message is saved on the ticket for the member."
                        >
                            <form onSubmit={submitReply} className="space-y-4">
                                <AdminTextarea
                                    label="Message to member"
                                    value={form.data.admin_reply}
                                    onChange={(e) =>
                                        form.setData(
                                            'admin_reply',
                                            e.target.value,
                                        )
                                    }
                                    rows={7}
                                    placeholder="Write a clear reply…"
                                    error={form.errors.admin_reply}
                                />
                                <AdminCheckbox
                                    label="Close ticket after sending"
                                    checked={form.data.close}
                                    onChange={(e) =>
                                        form.setData('close', e.target.checked)
                                    }
                                />
                                <AdminButton
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full"
                                >
                                    {form.processing
                                        ? 'Sending…'
                                        : 'Send reply'}
                                </AdminButton>
                                <div className="border-t border-olive-200 pt-4 dark:border-olive-800">
                                    <p className="mb-3 text-xs font-medium text-olive-500 dark:text-olive-400">
                                        Other actions
                                    </p>
                                    <div className="space-y-2">
                                        <AdminButton
                                            type="button"
                                            variant="secondary"
                                            onClick={closeTicket}
                                            className="w-full"
                                        >
                                            Close without reply
                                        </AdminButton>
                                        <AdminButton
                                            type="button"
                                            variant="ghost"
                                            onClick={destroy}
                                            className="w-full text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
                                        >
                                            Delete ticket
                                        </AdminButton>
                                    </div>
                                </div>
                            </form>
                        </FormPanel>
                    ) : (
                        <FormPanel
                            title="Closed"
                            description={`Closed ${formatDate(ticket.closed_at)}.`}
                        >
                            <div className="space-y-2">
                                <AdminButton
                                    type="button"
                                    onClick={reopenTicket}
                                    className="w-full"
                                >
                                    Reopen ticket
                                </AdminButton>
                                <AdminButton
                                    type="button"
                                    variant="ghost"
                                    onClick={destroy}
                                    className="w-full text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
                                >
                                    Delete ticket
                                </AdminButton>
                            </div>
                        </FormPanel>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
