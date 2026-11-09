import AccountLayout from '@/Layouts/AccountLayout';
import { TicketMark, UploadMark } from '@/Components/site/Mark';
import { Head, Link, useForm } from '@inertiajs/react';
import { useRef } from 'react';

const field =
    'w-full border border-olive-900/15 bg-white px-3.5 py-3 text-sm text-olive-950 outline-none transition placeholder:text-olive-400 focus:border-mustard focus:ring-2 focus:ring-mustard/30 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50 dark:placeholder:text-olive-500';
const labelCls =
    'mb-1.5 block text-sm font-semibold text-olive-700 dark:text-olive-300';

const ACCEPT =
    '.jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,image/jpeg,image/png,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function priorityTone(priority) {
    return (
        {
            low: 'border-olive-200 bg-olive-50 text-olive-700 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-300',
            normal:
                'border-olive-300 bg-white text-olive-800 dark:border-olive-600 dark:bg-olive-900 dark:text-olive-200',
            high: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
            urgent:
                'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
        }[priority] || 'border-olive-200 bg-olive-50 text-olive-700'
    );
}

function statusTone(status) {
    return (
        {
            open: 'border-mustard/50 bg-mustard/15 text-olive-900 dark:text-mustard',
            answered:
                'border-olive-300 bg-olive-100 text-olive-800 dark:border-olive-600 dark:bg-olive-800 dark:text-olive-100',
            closed:
                'border-olive-200 bg-olive-50 text-olive-500 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-400',
        }[status] || 'border-olive-200 bg-olive-50 text-olive-700'
    );
}

function formatDate(value) {
    if (!value) return '';
    try {
        return new Date(value).toLocaleString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return value;
    }
}

function formatBytes(size) {
    if (!size || Number.isNaN(Number(size))) return '';
    const bytes = Number(size);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Index({ tickets = [], priorities = [] }) {
    const fileInputRef = useRef(null);
    const form = useForm({
        subject: '',
        body: '',
        priority: 'normal',
        attachment: null,
    });

    const priorityOptions = priorities.length
        ? priorities
        : [
              { value: 'low', label: 'Low' },
              { value: 'normal', label: 'Normal' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
          ];

    const submit = (event) => {
        event.preventDefault();
        form.post(route('account.tickets.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset('subject', 'body', 'attachment');
                form.setData('priority', 'normal');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    return (
        <AccountLayout title="Tickets">
            <Head title="Support tickets" />

            <div className="space-y-5">
                <section className="border border-olive-900/15 bg-white dark:border-olive-800 dark:bg-olive-900">
                    <div className="border-b border-olive-900/10 px-4 py-4 sm:px-5 dark:border-olive-800">
                        <div className="flex items-center gap-2.5">
                            <TicketMark className="h-5 w-5 shrink-0 text-olive-800 dark:text-olive-200" />
                            <div>
                                <h2 className="font-display text-base font-semibold text-olive-950 dark:text-olive-50">
                                    Open a ticket
                                </h2>
                                <p className="mt-0.5 text-sm text-olive-600 dark:text-olive-400">
                                    Tell us what you need help with. We reply to open tickets from the team.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-4 px-4 py-5 sm:px-5">
                        <div>
                            <label htmlFor="ticket-subject" className={labelCls}>
                                Subject
                            </label>
                            <input
                                id="ticket-subject"
                                type="text"
                                value={form.data.subject}
                                onChange={(e) => form.setData('subject', e.target.value)}
                                className={field}
                                placeholder="Short summary of the issue"
                                maxLength={160}
                                required
                            />
                            {form.errors.subject ? (
                                <p className="mt-1.5 text-sm text-rose-700 dark:text-rose-400">
                                    {form.errors.subject}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label htmlFor="ticket-priority" className={labelCls}>
                                Priority
                            </label>
                            <select
                                id="ticket-priority"
                                value={form.data.priority}
                                onChange={(e) => form.setData('priority', e.target.value)}
                                className={field}
                                required
                            >
                                {priorityOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {form.errors.priority ? (
                                <p className="mt-1.5 text-sm text-rose-700 dark:text-rose-400">
                                    {form.errors.priority}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label htmlFor="ticket-body" className={labelCls}>
                                Message
                            </label>
                            <textarea
                                id="ticket-body"
                                value={form.data.body}
                                onChange={(e) => form.setData('body', e.target.value)}
                                className={`${field} min-h-[140px] resize-y`}
                                placeholder="Share details, listing names, payment references, or steps you already tried."
                                required
                            />
                            {form.errors.body ? (
                                <p className="mt-1.5 text-sm text-rose-700 dark:text-rose-400">
                                    {form.errors.body}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label htmlFor="ticket-attachment" className={labelCls}>
                                Attachment
                                <span className="ml-1 font-normal text-olive-500 dark:text-olive-400">
                                    (optional)
                                </span>
                            </label>
                            <div className="flex flex-wrap items-center gap-3">
                                <label
                                    htmlFor="ticket-attachment"
                                    className="inline-flex cursor-pointer items-center gap-2 border border-olive-900/15 bg-earth-sand px-3.5 py-2.5 text-sm font-semibold text-olive-800 transition hover:border-olive-900/35 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-200"
                                >
                                    <UploadMark className="h-4 w-4" />
                                    Choose file
                                </label>
                                <input
                                    ref={fileInputRef}
                                    id="ticket-attachment"
                                    type="file"
                                    accept={ACCEPT}
                                    className="sr-only"
                                    onChange={(e) =>
                                        form.setData(
                                            'attachment',
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                                <p className="text-sm text-olive-600 dark:text-olive-400">
                                    {form.data.attachment
                                        ? `${form.data.attachment.name}${
                                              form.data.attachment.size
                                                  ? ` · ${formatBytes(form.data.attachment.size)}`
                                                  : ''
                                          }`
                                        : 'JPG, PNG, WebP, GIF, PDF, DOC, or DOCX. Max 8 MB.'}
                                </p>
                                {form.data.attachment ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            form.setData('attachment', null);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = '';
                                            }
                                        }}
                                        className="text-sm font-semibold text-rose-700 hover:underline dark:text-rose-400"
                                    >
                                        Remove
                                    </button>
                                ) : null}
                            </div>
                            {form.errors.attachment ? (
                                <p className="mt-1.5 text-sm text-rose-700 dark:text-rose-400">
                                    {form.errors.attachment}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-olive-500 dark:text-olive-400">
                                Priority helps us triage. Urgent is for payments or listings that are live-breaking.
                            </p>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex items-center gap-1.5 rounded-sm border border-mustard bg-mustard px-4 py-2.5 text-sm font-semibold text-earth-dusk transition hover:bg-olive-900 hover:text-white disabled:opacity-60 dark:hover:bg-olive-100 dark:hover:text-earth-dusk"
                            >
                                <TicketMark className="h-4 w-4" />
                                {form.processing ? 'Sending…' : 'Send ticket'}
                            </button>
                        </div>
                    </form>
                </section>

                <section className="border border-olive-900/15 bg-white dark:border-olive-800 dark:bg-olive-900">
                    <div className="flex items-center justify-between gap-3 border-b border-olive-900/10 px-4 py-4 sm:px-5 dark:border-olive-800">
                        <h2 className="font-display text-base font-semibold text-olive-950 dark:text-olive-50">
                            Your tickets
                        </h2>
                        <span className="bg-olive-100 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-olive-700 dark:bg-olive-950 dark:text-olive-400">
                            {tickets.length}
                        </span>
                    </div>

                    {tickets.length === 0 ? (
                        <div className="px-4 py-12 text-center sm:px-5">
                            <p className="text-sm font-semibold text-olive-900 dark:text-olive-100">
                                No tickets yet
                            </p>
                            <p className="mx-auto mt-1 max-w-sm text-sm text-olive-600 dark:text-olive-400">
                                Use the form above when you need help with billing, listings, or your account.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-olive-900/10 dark:divide-olive-800">
                            {tickets.map((ticket) => (
                                <li key={ticket.id}>
                                    <Link
                                        href={route('account.tickets.show', ticket.id)}
                                        className="flex flex-col gap-2 px-4 py-4 transition hover:bg-earth-sand/70 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:hover:bg-olive-950/60"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-olive-950 dark:text-olive-50">
                                                {ticket.subject}
                                            </p>
                                            <p className="mt-1 text-xs text-olive-500 dark:text-olive-400">
                                                {ticket.reference}
                                                {ticket.created_at
                                                    ? ` · ${formatDate(ticket.created_at)}`
                                                    : ''}
                                                {ticket.has_attachment ? ' · Attachment' : ''}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`inline-flex border px-2 py-0.5 text-[11px] font-semibold ${priorityTone(ticket.priority)}`}
                                            >
                                                {ticket.priority_label}
                                            </span>
                                            <span
                                                className={`inline-flex border px-2 py-0.5 text-[11px] font-semibold ${statusTone(ticket.status)}`}
                                            >
                                                {ticket.status_label}
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </AccountLayout>
    );
}
