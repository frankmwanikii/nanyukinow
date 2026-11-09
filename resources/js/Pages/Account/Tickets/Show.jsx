import AccountLayout from '@/Layouts/AccountLayout';
import { TicketMark } from '@/Components/site/Mark';
import { Head, Link } from '@inertiajs/react';

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

export default function Show({ ticket }) {
    return (
        <AccountLayout title="Ticket">
            <Head title={ticket.reference} />

            <div className="space-y-5">
                <div>
                    <Link
                        href={route('account.tickets.index')}
                        className="text-sm font-semibold text-olive-700 transition hover:text-olive-950 dark:text-olive-300 dark:hover:text-olive-50"
                    >
                        ← All tickets
                    </Link>
                </div>

                <section className="border border-olive-900/15 bg-white dark:border-olive-800 dark:bg-olive-900">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-olive-900/10 px-4 py-4 sm:px-5 dark:border-olive-800">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <TicketMark className="h-5 w-5 shrink-0 text-olive-800 dark:text-olive-200" />
                                <p className="text-xs font-semibold uppercase tracking-wide text-olive-500 dark:text-olive-400">
                                    {ticket.reference}
                                </p>
                            </div>
                            <h2 className="mt-2 font-display text-xl font-semibold text-olive-950 dark:text-olive-50">
                                {ticket.subject}
                            </h2>
                            <p className="mt-1 text-sm text-olive-600 dark:text-olive-400">
                                Opened {formatDate(ticket.created_at)}
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
                    </div>

                    <div className="space-y-5 px-4 py-5 sm:px-5">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-olive-500 dark:text-olive-400">
                                Your message
                            </p>
                            <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-olive-900 dark:text-olive-100">
                                {ticket.body}
                            </div>
                        </div>

                        {ticket.admin_reply ? (
                            <div className="border border-olive-900/10 bg-earth-sand px-4 py-4 dark:border-olive-800 dark:bg-olive-950">
                                <p className="text-xs font-semibold uppercase tracking-wide text-olive-500 dark:text-olive-400">
                                    Team reply
                                    {ticket.answered_at
                                        ? ` · ${formatDate(ticket.answered_at)}`
                                        : ''}
                                </p>
                                <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-olive-900 dark:text-olive-100">
                                    {ticket.admin_reply}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-olive-600 dark:text-olive-400">
                                No reply yet. We will update this ticket when the team responds.
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </AccountLayout>
    );
}
