import { CloudUpload, FileText, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ListingModal from './ListingModal';

const fieldClass =
    'w-full rounded-xl border-0 bg-olive-50 px-4 py-3 text-sm text-earth-dusk ring-1 ring-olive-200 placeholder:text-olive-400 focus:ring-2 focus:ring-mustard';

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

function simulateUpload(docId, setDocs) {
    let progress = 0;
    const tick = () => {
        progress = Math.min(100, progress + Math.floor(8 + Math.random() * 18));
        setDocs((prev) =>
            prev.map((doc) =>
                doc.id === docId
                    ? {
                          ...doc,
                          progress,
                          status: progress >= 100 ? 'done' : 'uploading',
                      }
                    : doc,
            ),
        );
        if (progress < 100) {
            window.setTimeout(tick, 120 + Math.random() * 160);
        }
    };
    window.setTimeout(tick, 80);
}

export default function ClaimListingModal({ open, onClose, listing }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [reason, setReason] = useState('');
    const [docs, setDocs] = useState([]);
    const [fileError, setFileError] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    const [sent, setSent] = useState(false);
    const fileInputRef = useRef(null);

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
        setConfirmed(false);
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
                progress: 0,
                status: 'uploading',
            });
        }

        if (!incoming.length) return;

        setDocs((prev) => [...prev, ...incoming]);
        incoming.forEach((doc) => simulateUpload(doc.id, setDocs));
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

    const uploading = docs.some((doc) => doc.status === 'uploading');

    const submit = (e) => {
        e.preventDefault();
        if (!confirmed || uploading) return;
        setSent(true);
        reset();
        window.setTimeout(() => {
            setSent(false);
            onClose();
        }, 1600);
    };

    return (
        <ListingModal
            open={open}
            onClose={onClose}
            title="Claim listing"
            wide
        >
            <p className="mb-4 text-sm text-olive-600">
                Tell us why you should manage{' '}
                <span className="font-semibold text-olive-800">
                    {listing?.title}
                </span>
                . We’ll review your request and supporting documents.
            </p>

            <form onSubmit={submit} className="space-y-4" encType="multipart/form-data">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="claim-fname"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500"
                        >
                            First name
                        </label>
                        <input
                            id="claim-fname"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Jane"
                            required
                            className={fieldClass}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="claim-lname"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500"
                        >
                            Second name
                        </label>
                        <input
                            id="claim-lname"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Wanjiru"
                            required
                            className={fieldClass}
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="claim-email"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500"
                        >
                            Email address
                        </label>
                        <input
                            id="claim-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@email.com"
                            required
                            className={fieldClass}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="claim-phone"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500"
                        >
                            Phone number
                        </label>
                        <input
                            id="claim-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+254 …"
                            required
                            className={fieldClass}
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="claim-reason"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500"
                    >
                        Reason for claim
                    </label>
                    <textarea
                        id="claim-reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="I own / manage this business because…"
                        required
                        rows={4}
                        className={`${fieldClass} resize-y`}
                    />
                </div>

                <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-olive-500">
                        Supporting documents
                    </p>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onDrop={onDrop}
                        className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-mustard/70 bg-white px-4 py-8 text-center transition hover:border-mustard hover:bg-olive-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard"
                    >
                        <CloudUpload
                            className="h-10 w-10 text-mustard"
                            strokeWidth={1.5}
                        />
                        <span className="mt-3 text-sm font-semibold text-earth-dusk">
                            Drop files here or click to upload
                        </span>
                        <span className="mt-1 text-xs text-olive-500">
                            JPG, PNG, WEBP, GIF, PDF · max 8MB · up to 5 files
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
                                    className="relative overflow-hidden rounded-xl border border-olive-200/80 bg-olive-50"
                                >
                                    <div className="relative aspect-[4/3] bg-olive-100">
                                        {doc.previewUrl ? (
                                            <img
                                                src={doc.previewUrl}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-olive-600">
                                                <FileText className="h-8 w-8 text-mustard" />
                                                <span className="line-clamp-2 text-center text-[11px] font-semibold">
                                                    {doc.file.name}
                                                </span>
                                            </div>
                                        )}

                                        {doc.status === 'uploading' ? (
                                            <div className="absolute inset-0 flex flex-col justify-end bg-earth-dusk/45 p-2.5">
                                                <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-white">
                                                    <span>Uploading…</span>
                                                    <span>{doc.progress}%</span>
                                                </div>
                                                <div className="h-1.5 overflow-hidden rounded-full bg-white/30">
                                                    <div
                                                        className="h-full rounded-full bg-mustard transition-[width] duration-150"
                                                        style={{
                                                            width: `${doc.progress}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="flex items-start justify-between gap-2 px-2.5 py-2">
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold text-olive-900">
                                                {doc.file.name}
                                            </p>
                                            <p className="text-[11px] text-olive-500">
                                                {doc.status === 'done'
                                                    ? formatBytes(doc.file.size)
                                                    : `Uploading ${doc.progress}%`}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(doc.id)}
                                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-olive-700 ring-1 ring-olive-200 transition hover:bg-mustard"
                                            aria-label={`Remove ${doc.file.name}`}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    {fileError ? (
                        <p className="mt-1.5 text-xs font-medium text-red-600">
                            {fileError}
                        </p>
                    ) : null}
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-olive-200/80 bg-olive-50/70 px-4 py-3.5">
                    <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        required
                        className="mt-0.5 h-4 w-4 rounded border-olive-300 text-olive-700 focus:ring-mustard"
                    />
                    <span className="text-sm leading-relaxed text-olive-800">
                        I confirm that the information and documents I have
                        provided are true and accurate to the best of my
                        knowledge, and that I am authorized to claim this
                        listing.
                    </span>
                </label>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                        type="submit"
                        disabled={!confirmed || uploading}
                        className="inline-flex items-center gap-2 rounded-full bg-olive-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Send className="h-4 w-4" />
                        Submit claim
                    </button>
                    {sent ? (
                        <span className="text-sm font-semibold text-olive-700">
                            Claim submitted — we’ll be in touch.
                        </span>
                    ) : null}
                </div>
            </form>
        </ListingModal>
    );
}
