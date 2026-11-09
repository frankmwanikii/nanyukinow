import { Loader2 } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ForwardMark } from '@/Components/site/Mark';
import ListingModal from './ListingModal';

const fieldClass =
    'w-full rounded-xl border-0 bg-olive-50 px-4 py-3 text-sm text-earth-dusk ring-1 ring-olive-200 placeholder:text-olive-400 focus:ring-2 focus:ring-mustard';

const REPORT_REASONS = [
    'Incorrect or outdated information',
    'Spam or fake listing',
    'Offensive or inappropriate content',
    'Scam or suspicious activity',
    'Duplicate listing',
    'Something else',
];

function csrfToken() {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') || ''
    );
}

export default function ReportListingModal({ open, onClose, listing }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [email, setEmail] = useState(() => user?.email || '');
    const [name, setName] = useState(() => user?.name || '');
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const reset = () => {
        setReason('');
        setDetails('');
        setEmail(user?.email || '');
        setName(user?.name || '');
        setError('');
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!listing?.slug || sending) return;

        setSending(true);
        setError('');

        try {
            const response = await fetch(route('listings.report', listing.slug), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    reason,
                    details,
                    reporter_name: name || null,
                    reporter_email: email || null,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const firstError =
                    data?.message ||
                    Object.values(data?.errors || {})?.[0]?.[0] ||
                    'Could not send report. Please try again.';
                setError(firstError);
                return;
            }

            setSent(true);
            reset();
            window.setTimeout(() => {
                setSent(false);
                onClose();
            }, 1600);
        } catch {
            setError('Could not send report. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <ListingModal open={open} onClose={onClose} title="Report listing" wide>
            <p className="mb-4 text-sm text-olive-600">
                Help us keep Nanyuki Now accurate. Report an issue with{' '}
                <span className="font-semibold text-olive-800">
                    {listing?.title}
                </span>
                .
            </p>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label
                        htmlFor="report-reason"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500"
                    >
                        What’s wrong?
                    </label>
                    <select
                        id="report-reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        className={fieldClass}
                    >
                        <option value="" disabled>
                            Select a reason
                        </option>
                        {REPORT_REASONS.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="report-details"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500"
                    >
                        Details
                    </label>
                    <textarea
                        id="report-details"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Describe the issue so we can review it…"
                        required
                        rows={4}
                        className={`${fieldClass} resize-y`}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="report-name"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500"
                        >
                            Your name
                        </label>
                        <input
                            id="report-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Optional"
                            className={fieldClass}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="report-email"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500"
                        >
                            Email
                        </label>
                        <input
                            id="report-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Optional — for follow-up"
                            className={fieldClass}
                        />
                    </div>
                </div>

                {error ? (
                    <p className="text-sm font-medium text-rose-700">{error}</p>
                ) : null}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                        type="submit"
                        disabled={sending}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-olive-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950 disabled:opacity-60"
                    >
                        {sending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        Submit report
                        {!sending ? (
                            <ForwardMark className="h-4 w-4" />
                        ) : null}
                    </button>
                    {sent ? (
                        <span className="text-sm font-semibold text-olive-700">
                            Thanks — we received your report.
                        </span>
                    ) : null}
                </div>
            </form>
        </ListingModal>
    );
}
