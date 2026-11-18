import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import FieldLabel from '@/Components/listing-form/FieldLabel';
import { field } from '@/Components/listing-form/fieldStyles';
import { SendArrowMark } from '@/Components/site/Mark';
import ListingModal from './ListingModal';
import RecaptchaField from './RecaptchaField';

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
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaError, setCaptchaError] = useState('');
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const reset = () => {
        setReason('');
        setDetails('');
        setEmail(user?.email || '');
        setName(user?.name || '');
        setCaptchaToken('');
        setCaptchaError('');
        setError('');
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!listing?.slug || sending) return;

        if (!captchaToken) {
            setCaptchaError('Please complete the security check.');
            return;
        }

        setSending(true);
        setError('');
        setCaptchaError('');

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
                    'g-recaptcha-response': captchaToken,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const captchaMessage =
                    data?.errors?.['g-recaptcha-response']?.[0] || '';
                if (captchaMessage) {
                    setCaptchaError(captchaMessage);
                    setCaptchaToken('');
                }
                const firstError =
                    captchaMessage ||
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
            <p className="mb-5 text-sm leading-relaxed text-olive-600">
                Help us keep Nanyuki Now accurate. Report an issue with{' '}
                <span className="font-semibold text-olive-900">
                    {listing?.title}
                </span>
                .
            </p>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <FieldLabel htmlFor="report-reason" required>
                        What is wrong?
                    </FieldLabel>
                    <select
                        id="report-reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        className={field}
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
                    <FieldLabel htmlFor="report-details" required>
                        Details
                    </FieldLabel>
                    <textarea
                        id="report-details"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Describe the issue so we can review it…"
                        required
                        rows={4}
                        className={`${field} resize-y`}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <FieldLabel htmlFor="report-name">Your name</FieldLabel>
                        <input
                            id="report-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Optional"
                            className={field}
                        />
                    </div>
                    <div>
                        <FieldLabel htmlFor="report-email">Email</FieldLabel>
                        <input
                            id="report-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Optional, for follow-up"
                            className={field}
                        />
                    </div>
                </div>

                <RecaptchaField
                    value={captchaToken}
                    onChange={(token) => {
                        setCaptchaToken(token);
                        if (token) setCaptchaError('');
                    }}
                    error={captchaError}
                />

                {error ? (
                    <p className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                        {error}
                    </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                        type="submit"
                        disabled={sending}
                        className="inline-flex min-h-11 items-center gap-2 bg-olive-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950 disabled:opacity-60"
                    >
                        {sending ? 'Submitting…' : 'Submit report'}
                        {!sending ? (
                            <SendArrowMark className="h-4 w-4" />
                        ) : null}
                    </button>
                    {sent ? (
                        <span className="text-sm font-semibold text-olive-700">
                            Thanks. We received your report.
                        </span>
                    ) : null}
                </div>
            </form>
        </ListingModal>
    );
}
