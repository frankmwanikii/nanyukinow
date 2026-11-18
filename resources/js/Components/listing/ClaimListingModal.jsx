import { useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import FieldLabel from '@/Components/listing-form/FieldLabel';
import { field, help } from '@/Components/listing-form/fieldStyles';
import {
    CloseMark,
    SendArrowMark,
    UploadMark,
} from '@/Components/site/Mark';
import ListingModal from './ListingModal';
import RecaptchaField from './RecaptchaField';

const MAX_FILES = 5;
const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPT =
    '.jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,image/jpeg,image/png,image/webp,image/gif,application/pdf';

function isImage(file) {
    return String(file.type || '').startsWith('image/');
}

function formatBytes(size) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function DocumentMark({ className = 'h-8 w-8' }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M7 3.75h7.5L19 8.25v12A1.75 1.75 0 0 1 17.25 22H7A1.75 1.75 0 0 1 5.25 20.25V5.5A1.75 1.75 0 0 1 7 3.75Z" />
            <path d="M14.25 3.75V8.5H19" />
            <path d="M9 12.5h6M9 16h4.5" />
        </svg>
    );
}

export default function ClaimListingModal({ open, onClose, listing }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [reason, setReason] = useState('');
    const [docs, setDocs] = useState([]);
    const [fileError, setFileError] = useState('');
    const [formError, setFormError] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaError, setCaptchaError] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        if (user?.name) {
            const parts = String(user.name).trim().split(/\s+/);
            setFirstName((prev) => prev || parts[0] || '');
            setLastName((prev) => prev || parts.slice(1).join(' ') || '');
        }
        if (user?.email) setEmail((prev) => prev || user.email);
        if (user?.phone) setPhone((prev) => prev || user.phone);
    }, [open, user]);

    useEffect(() => {
        return () => {
            docs.forEach((doc) => {
                if (doc.previewUrl) URL.revokeObjectURL(doc.previewUrl);
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const clearDocs = () => {
        setDocs((prev) => {
            prev.forEach((doc) => {
                if (doc.previewUrl) URL.revokeObjectURL(doc.previewUrl);
            });
            return [];
        });
    };

    const reset = () => {
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setReason('');
        clearDocs();
        setFileError('');
        setFormError('');
        setConfirmed(false);
        setCaptchaToken('');
        setCaptchaError('');
        setSending(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const addFiles = (picked) => {
        if (!picked?.length) return;

        setFileError('');
        const incoming = [];

        for (const file of picked) {
            if (docs.length + incoming.length >= MAX_FILES) {
                setFileError(`You can upload up to ${MAX_FILES} files.`);
                break;
            }
            if (file.size > MAX_BYTES) {
                setFileError(`${file.name} is larger than 8MB.`);
                continue;
            }

            const id = `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`;
            const previewUrl = isImage(file) ? URL.createObjectURL(file) : null;
            incoming.push({
                id,
                file,
                previewUrl,
            });
        }

        if (!incoming.length) return;
        setDocs((prev) => [...prev, ...incoming]);
    };

    const onFileChange = (e) => {
        addFiles(Array.from(e.target.files || []));
        e.target.value = '';
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addFiles(Array.from(e.dataTransfer.files || []));
    };

    const removeFile = (id) => {
        setDocs((prev) => {
            const target = prev.find((doc) => doc.id === id);
            if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
            return prev.filter((doc) => doc.id !== id);
        });
        setFileError('');
    };

    const submit = (e) => {
        e.preventDefault();
        if (!confirmed || sending || !listing?.slug) return;

        if (!captchaToken) {
            setCaptchaError('Please complete the security check.');
            return;
        }

        setFormError('');
        setCaptchaError('');
        setSending(true);

        const body = new FormData();
        body.append('first_name', firstName.trim());
        body.append('last_name', lastName.trim());
        body.append('email', email.trim());
        body.append('phone', phone.trim());
        body.append('reason', reason.trim());
        body.append('confirmed', confirmed ? '1' : '0');
        body.append('g-recaptcha-response', captchaToken);
        docs.forEach((doc) => {
            if (doc.file) body.append('documents[]', doc.file);
        });

        router.post(route('listings.claim', listing.slug), body, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setSent(true);
                reset();
                window.setTimeout(() => {
                    setSent(false);
                    onClose();
                }, 1600);
            },
            onError: (errors) => {
                if (errors?.['g-recaptcha-response']) {
                    setCaptchaError(errors['g-recaptcha-response']);
                    setCaptchaToken('');
                }
                const first =
                    errors?.listing ||
                    errors?.documents ||
                    errors?.reason ||
                    errors?.email ||
                    errors?.confirmed ||
                    errors?.['g-recaptcha-response'] ||
                    Object.values(errors || {})[0];
                setFormError(
                    typeof first === 'string'
                        ? first
                        : 'Could not submit this claim. Please check the form and try again.',
                );
            },
            onFinish: () => setSending(false),
        });
    };

    return (
        <ListingModal open={open} onClose={onClose} title="Claim listing" wide>
            <p className="mb-5 text-sm leading-relaxed text-olive-600">
                Tell us why you should manage{' '}
                <span className="font-semibold text-olive-900">
                    {listing?.title}
                </span>
                . We will review your request and supporting documents.
            </p>

            <form
                onSubmit={submit}
                className="space-y-5"
                encType="multipart/form-data"
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <FieldLabel htmlFor="claim-fname" required>
                            First name
                        </FieldLabel>
                        <input
                            id="claim-fname"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Jane"
                            required
                            className={field}
                        />
                    </div>
                    <div>
                        <FieldLabel htmlFor="claim-lname" required>
                            Last name
                        </FieldLabel>
                        <input
                            id="claim-lname"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Wanjiru"
                            required
                            className={field}
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <FieldLabel htmlFor="claim-email" required>
                            Email address
                        </FieldLabel>
                        <input
                            id="claim-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@email.com"
                            required
                            className={field}
                        />
                    </div>
                    <div>
                        <FieldLabel htmlFor="claim-phone" required>
                            Phone number
                        </FieldLabel>
                        <input
                            id="claim-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+254 …"
                            required
                            className={field}
                        />
                    </div>
                </div>

                <div>
                    <FieldLabel htmlFor="claim-reason" required>
                        Reason for claim
                    </FieldLabel>
                    <textarea
                        id="claim-reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="I own / manage this business because…"
                        required
                        rows={4}
                        className={`${field} resize-y`}
                    />
                </div>

                <div>
                    <FieldLabel as="p">Supporting documents</FieldLabel>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onDrop={onDrop}
                        className="flex w-full flex-col items-center justify-center border border-olive-900/20 bg-white px-4 py-8 text-center transition hover:border-olive-900 focus:outline-none focus-visible:border-olive-900"
                    >
                        <UploadMark className="h-8 w-8 text-olive-700" />
                        <span className="mt-3 text-sm font-semibold text-olive-900">
                            Drop files here or click to upload
                        </span>
                        <span className={`max-w-sm ${help}`}>
                            JPG, PNG, WEBP, GIF, or PDF. Max 8MB, up to 5 files.
                        </span>
                    </button>
                    <input
                        ref={fileInputRef}
                        id="claim-docs"
                        type="file"
                        multiple
                        accept={ACCEPT}
                        onChange={onFileChange}
                        className="sr-only"
                    />

                    {docs.length > 0 ? (
                        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {docs.map((doc) => (
                                <li
                                    key={doc.id}
                                    className="relative overflow-hidden border border-olive-900/15 bg-white"
                                >
                                    <div className="relative aspect-[4/3] bg-olive-50">
                                        {doc.previewUrl ? (
                                            <img
                                                src={doc.previewUrl}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-olive-600">
                                                <DocumentMark className="h-8 w-8 text-olive-700" />
                                                <span className="line-clamp-2 text-center text-[11px] font-semibold">
                                                    {doc.file.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-start justify-between gap-2 px-2.5 py-2">
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold text-olive-900">
                                                {doc.file.name}
                                            </p>
                                            <p className="text-[11px] text-olive-500">
                                                {formatBytes(doc.file.size)}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(doc.id)}
                                            className="flex h-7 w-7 shrink-0 items-center justify-center border border-olive-900/20 bg-white text-olive-700 transition hover:border-mustard hover:bg-mustard"
                                            aria-label={`Remove ${doc.file.name}`}
                                        >
                                            <CloseMark className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    {fileError ? (
                        <p className="mt-1.5 text-xs font-medium text-rose-700">
                            {fileError}
                        </p>
                    ) : null}
                </div>

                <label className="flex cursor-pointer items-start gap-3">
                    <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        required
                        className="mt-1 h-4 w-4 border-olive-900/30 text-olive-800 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-sm leading-relaxed text-olive-800">
                        I confirm that the information and documents I have
                        provided are true and accurate to the best of my
                        knowledge, and that I am authorized to claim this
                        listing.
                    </span>
                </label>

                <RecaptchaField
                    value={captchaToken}
                    onChange={(token) => {
                        setCaptchaToken(token);
                        if (token) setCaptchaError('');
                    }}
                    error={captchaError}
                />

                {formError ? (
                    <p className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                        {formError}
                    </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                        type="submit"
                        disabled={!confirmed || sending}
                        className="inline-flex min-h-11 items-center gap-2 bg-olive-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {sending ? 'Submitting…' : 'Submit claim'}
                        {!sending ? (
                            <SendArrowMark className="h-4 w-4" />
                        ) : null}
                    </button>
                    {sent ? (
                        <span className="text-sm font-semibold text-olive-700">
                            Claim submitted. We will be in touch.
                        </span>
                    ) : null}
                </div>
            </form>
        </ListingModal>
    );
}
