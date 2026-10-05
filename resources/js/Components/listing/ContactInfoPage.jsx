import { CloudUpload, FileText, Mail, Phone, Send, X } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import DetailSection from './DetailSection';
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

function InstagramIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
            <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
        </svg>
    );
}

function FacebookIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.2l.8-3H14V9z" />
        </svg>
    );
}

function TikTokIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M19.6 8.3a6.7 6.7 0 0 1-3.9-1.2v7.1a5.9 5.9 0 1 1-5.1-5.8v2.9a3 3 0 1 0 2.2 2.9V2.5h2.8a6.7 6.7 0 0 0 4 4.2v1.6z" />
        </svg>
    );
}

function WhatsAppIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

function YouTubeIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M23 12.2s0-3.4-.4-5a3 3 0 0 0-2.1-2.1C18.7 4.6 12 4.6 12 4.6s-6.7 0-8.5.5A3 3 0 0 0 1.4 7.2C1 8.8 1 12.2 1 12.2s0 3.4.4 5a3 3 0 0 0 2.1 2.1c1.8.5 8.5.5 8.5.5s6.7 0 8.5-.5a3 3 0 0 0 2.1-2.1c.4-1.6.4-5 .4-5zM9.8 15.5v-6.6l5.7 3.3-5.7 3.3z" />
        </svg>
    );
}

const fieldClass =
    'w-full rounded-xl border-0 bg-olive-50 px-4 py-3.5 text-sm text-earth-dusk ring-1 ring-olive-200/80 placeholder:text-olive-400 transition focus:bg-white focus:ring-2 focus:ring-mustard';

const fieldErrorClass =
    'w-full rounded-xl border-0 bg-red-50/60 px-4 py-3.5 text-sm text-earth-dusk ring-1 ring-red-400 placeholder:text-olive-400 transition focus:bg-white focus:ring-2 focus:ring-red-500';

const labelClass =
    'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-olive-500';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContactField(name, value) {
    const trimmed = String(value ?? '').trim();

    switch (name) {
        case 'firstName':
            if (!trimmed) return 'First name is required.';
            if (trimmed.length > 80) return 'First name is too long.';
            return '';
        case 'lastName':
            if (!trimmed) return 'Last name is required.';
            if (trimmed.length > 80) return 'Last name is too long.';
            return '';
        case 'email':
            if (!trimmed) return 'Email is required so they can reply.';
            if (trimmed.length > 255) return 'Email is too long.';
            if (!EMAIL_RE.test(trimmed)) return 'Enter a valid email address.';
            return '';
        case 'phone':
            if (trimmed.length > 40) return 'Phone number is too long.';
            return '';
        case 'message':
            if (!trimmed) return 'Please write a message.';
            if (trimmed.length > 5000) return 'Message is too long.';
            return '';
        default:
            return '';
    }
}

function ContactMethod({ href, icon: Icon, label, value, external = false }) {
    return (
        <a
            href={href}
            {...(external
                ? { target: '_blank', rel: 'noreferrer' }
                : {})}
            className="group flex min-h-14 min-w-0 items-center gap-3.5 rounded-2xl bg-olive-50/80 px-3.5 py-3 ring-1 ring-olive-200/60 transition hover:bg-mustard/15 hover:ring-mustard/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard"
        >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-mustard shadow-soft ring-1 ring-olive-100 transition group-hover:bg-mustard group-hover:text-olive-950 group-hover:ring-mustard">
                <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-olive-500">
                    {label}
                </span>
                <span className="mt-0.5 block truncate text-sm font-semibold text-earth-dusk">
                    {value}
                </span>
            </span>
        </a>
    );
}

function ContactMessageForm({ listing }) {
    const fileInputRef = useRef(null);
    const { auth, flash } = usePage().props;
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState(auth?.user?.email || '');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [docs, setDocs] = useState([]);
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaError, setCaptchaError] = useState('');
    const [fileError, setFileError] = useState('');
    const [formError, setFormError] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (flash?.success) {
            setSent(true);
            window.setTimeout(() => setSent(false), 3200);
        }
    }, [flash?.success]);

    useEffect(() => {
        return () => {
            docs.forEach((doc) => {
                if (doc.previewUrl) URL.revokeObjectURL(doc.previewUrl);
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setFieldError = (name, value) => {
        const next = validateContactField(name, value);
        setErrors((prev) => {
            if ((prev[name] || '') === next) return prev;
            return { ...prev, [name]: next };
        });
        return next;
    };

    const updateField = (name, value, setter) => {
        setter(value);
        setTouched((prev) => ({ ...prev, [name]: true }));
        setFieldError(name, value);
        if (formError) setFormError('');
    };

    const clearDocs = () => {
        setDocs((prev) => {
            prev.forEach((doc) => {
                if (doc.previewUrl) URL.revokeObjectURL(doc.previewUrl);
            });
            return [];
        });
        setFileError('');
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

    const validateAll = () => {
        const next = {
            firstName: validateContactField('firstName', firstName),
            lastName: validateContactField('lastName', lastName),
            email: validateContactField('email', email),
            phone: validateContactField('phone', phone),
            message: validateContactField('message', message),
        };
        setErrors(next);
        setTouched({
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            message: true,
        });
        return !Object.values(next).some(Boolean);
    };

    const submit = (e) => {
        e.preventDefault();
        setCaptchaError('');
        setFormError('');

        const fieldsOk = validateAll();
        if (!fieldsOk) {
            setFormError('Please fix the highlighted fields.');
            return;
        }
        if (!captchaToken) {
            setCaptchaError('Please complete the security check.');
            return;
        }
        if (uploading || sending) return;
        if (!listing?.slug) {
            setFormError('This listing can’t receive messages right now.');
            return;
        }

        setSending(true);
        router.post(
            route('listings.contact', listing.slug),
            {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                email: email.trim(),
                phone: phone.trim() || null,
                message: message.trim(),
                'g-recaptcha-response': captchaToken,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setFirstName('');
                    setLastName('');
                    setEmail(auth?.user?.email || '');
                    setPhone('');
                    setMessage('');
                    clearDocs();
                    setCaptchaToken('');
                    setErrors({});
                    setTouched({});
                    setSent(true);
                    window.setTimeout(() => setSent(false), 3200);
                },
                onError: (serverErrors) => {
                    const mapped = {};
                    if (serverErrors.first_name) mapped.firstName = serverErrors.first_name;
                    if (serverErrors.last_name) mapped.lastName = serverErrors.last_name;
                    if (serverErrors.email) mapped.email = serverErrors.email;
                    if (serverErrors.phone) mapped.phone = serverErrors.phone;
                    if (serverErrors.message) mapped.message = serverErrors.message;
                    if (Object.keys(mapped).length) {
                        setErrors((prev) => ({ ...prev, ...mapped }));
                        setTouched((prev) => ({
                            ...prev,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            message: true,
                        }));
                    }
                    setFormError(
                        serverErrors.message ||
                            serverErrors.email ||
                            serverErrors.first_name ||
                            'Could not send your message. Please try again.',
                    );
                },
                onFinish: () => setSending(false),
            },
        );
    };

    const showError = (name) => (touched[name] ? errors[name] : '');
    const inputClass = (name) => (showError(name) ? fieldErrorClass : fieldClass);

    return (
        <DetailSection title="Send a message">
            <form
                onSubmit={submit}
                className="space-y-5"
                encType="multipart/form-data"
                noValidate
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="min-w-0">
                        <label htmlFor="contact-fname" className={labelClass}>
                            First name
                        </label>
                        <input
                            id="contact-fname"
                            type="text"
                            value={firstName}
                            onChange={(e) =>
                                updateField('firstName', e.target.value, setFirstName)
                            }
                            onBlur={() => {
                                setTouched((prev) => ({ ...prev, firstName: true }));
                                setFieldError('firstName', firstName);
                            }}
                            placeholder="Jane"
                            autoComplete="given-name"
                            aria-invalid={Boolean(showError('firstName'))}
                            aria-describedby={
                                showError('firstName') ? 'contact-fname-error' : undefined
                            }
                            className={inputClass('firstName')}
                        />
                        {showError('firstName') ? (
                            <p
                                id="contact-fname-error"
                                className="mt-1.5 text-xs font-medium text-red-600"
                            >
                                {showError('firstName')}
                            </p>
                        ) : null}
                    </div>
                    <div className="min-w-0">
                        <label htmlFor="contact-lname" className={labelClass}>
                            Last name
                        </label>
                        <input
                            id="contact-lname"
                            type="text"
                            value={lastName}
                            onChange={(e) =>
                                updateField('lastName', e.target.value, setLastName)
                            }
                            onBlur={() => {
                                setTouched((prev) => ({ ...prev, lastName: true }));
                                setFieldError('lastName', lastName);
                            }}
                            placeholder="Wanjiru"
                            autoComplete="family-name"
                            aria-invalid={Boolean(showError('lastName'))}
                            aria-describedby={
                                showError('lastName') ? 'contact-lname-error' : undefined
                            }
                            className={inputClass('lastName')}
                        />
                        {showError('lastName') ? (
                            <p
                                id="contact-lname-error"
                                className="mt-1.5 text-xs font-medium text-red-600"
                            >
                                {showError('lastName')}
                            </p>
                        ) : null}
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="min-w-0">
                        <label htmlFor="contact-email" className={labelClass}>
                            Your email
                        </label>
                        <input
                            id="contact-email"
                            type="email"
                            value={email}
                            onChange={(e) =>
                                updateField('email', e.target.value, setEmail)
                            }
                            onBlur={() => {
                                setTouched((prev) => ({ ...prev, email: true }));
                                setFieldError('email', email);
                            }}
                            placeholder="you@email.com"
                            autoComplete="email"
                            aria-invalid={Boolean(showError('email'))}
                            aria-describedby={
                                showError('email') ? 'contact-email-error' : undefined
                            }
                            className={inputClass('email')}
                        />
                        {showError('email') ? (
                            <p
                                id="contact-email-error"
                                className="mt-1.5 text-xs font-medium text-red-600"
                            >
                                {showError('email')}
                            </p>
                        ) : null}
                    </div>
                    <div className="min-w-0">
                        <label htmlFor="contact-phone" className={labelClass}>
                            Phone
                        </label>
                        <input
                            id="contact-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) =>
                                updateField('phone', e.target.value, setPhone)
                            }
                            onBlur={() => {
                                setTouched((prev) => ({ ...prev, phone: true }));
                                setFieldError('phone', phone);
                            }}
                            placeholder="+254 …"
                            autoComplete="tel"
                            aria-invalid={Boolean(showError('phone'))}
                            aria-describedby={
                                showError('phone') ? 'contact-phone-error' : undefined
                            }
                            className={inputClass('phone')}
                        />
                        {showError('phone') ? (
                            <p
                                id="contact-phone-error"
                                className="mt-1.5 text-xs font-medium text-red-600"
                            >
                                {showError('phone')}
                            </p>
                        ) : null}
                    </div>
                </div>
                <div className="min-w-0">
                    <label htmlFor="contact-message" className={labelClass}>
                        Message
                    </label>
                    <textarea
                        id="contact-message"
                        value={message}
                        onChange={(e) =>
                            updateField('message', e.target.value, setMessage)
                        }
                        onBlur={() => {
                            setTouched((prev) => ({ ...prev, message: true }));
                            setFieldError('message', message);
                        }}
                        placeholder="How can they help you?"
                        rows={5}
                        aria-invalid={Boolean(showError('message'))}
                        aria-describedby={
                            showError('message') ? 'contact-message-error' : undefined
                        }
                        className={`${inputClass('message')} min-h-[120px] resize-y`}
                    />
                    {showError('message') ? (
                        <p
                            id="contact-message-error"
                            className="mt-1.5 text-xs font-medium text-red-600"
                        >
                            {showError('message')}
                        </p>
                    ) : null}
                </div>

                <div>
                    <p className={labelClass}>Attach files</p>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onDrop={onDrop}
                        className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-mustard/60 bg-olive-50/40 px-4 py-7 text-center transition hover:border-mustard hover:bg-mustard/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard"
                    >
                        <CloudUpload
                            className="h-9 w-9 text-mustard"
                            strokeWidth={1.5}
                        />
                        <span className="mt-2.5 text-sm font-semibold text-earth-dusk">
                            Drop files here or click to upload
                        </span>
                        <span className="mt-1 text-xs text-olive-500">
                            JPG, PNG, WEBP, GIF, PDF · max 8MB · up to 5 files
                        </span>
                    </button>
                    <input
                        ref={fileInputRef}
                        id="contact-file"
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
                                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-olive-700 ring-1 ring-olive-200 transition hover:bg-mustard"
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

                <RecaptchaField
                    value={captchaToken}
                    onChange={(token) => {
                        setCaptchaToken(token);
                        if (token) setCaptchaError('');
                    }}
                    error={captchaError}
                />

                <div className="flex flex-wrap items-center gap-3 border-t border-olive-100 pt-5">
                    <button
                        type="submit"
                        disabled={uploading || sending}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-olive-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                        <Send className="h-4 w-4" />
                        {uploading
                            ? 'Uploading…'
                            : sending
                              ? 'Sending…'
                              : 'Send message'}
                    </button>
                    {sent ? (
                        <span className="text-sm font-semibold text-olive-700">
                            Message sent — thanks!
                        </span>
                    ) : null}
                </div>
                {formError ? (
                    <p className="text-sm font-medium text-red-600">{formError}</p>
                ) : null}
            </form>
        </DetailSection>
    );
}

export default function ContactInfoPage({ listing }) {
    const tel = listing.phone
        ? `tel:${String(listing.phone).replace(/\s+/g, '')}`
        : null;
    const email = listing.email || listing.agent?.email || null;
    const socials = listing.socials || {};

    const socialLinks = [
        socials.instagram
            ? { label: 'Instagram', href: socials.instagram, icon: InstagramIcon }
            : null,
        socials.facebook
            ? { label: 'Facebook', href: socials.facebook, icon: FacebookIcon }
            : null,
        socials.tiktok
            ? { label: 'TikTok', href: socials.tiktok, icon: TikTokIcon }
            : null,
        socials.youtube
            ? { label: 'YouTube', href: socials.youtube, icon: YouTubeIcon }
            : null,
        socials.whatsapp
            ? { label: 'WhatsApp', href: socials.whatsapp, icon: WhatsAppIcon }
            : null,
    ].filter(Boolean);

    const hasContactDetails = Boolean(tel || email || socialLinks.length);

    const contactPanel = hasContactDetails ? (
        <DetailSection title="Contact">
            <div className="flex flex-col gap-2.5">
                {tel ? (
                    <ContactMethod
                        href={tel}
                        icon={Phone}
                        label="Phone"
                        value={listing.phone}
                    />
                ) : null}
                {email ? (
                    <ContactMethod
                        href={`mailto:${email}`}
                        icon={Mail}
                        label="Email"
                        value={email}
                    />
                ) : null}
                {socialLinks.map((item) => (
                    <ContactMethod
                        key={item.label}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        value={
                            item.label === 'WhatsApp'
                                ? 'Chat on WhatsApp'
                                : `Visit ${item.label}`
                        }
                        external
                    />
                ))}
            </div>
        </DetailSection>
    ) : null;

    return (
        <div className="mx-auto grid max-w-[1400px] gap-4 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)] lg:items-start lg:gap-5">
            {/* Mobile: contact first for quick reach; desktop: form main, contact side */}
            <div className="order-1 flex min-w-0 flex-col gap-4 lg:order-2 lg:sticky lg:top-36">
                {contactPanel}
            </div>
            <div className="order-2 min-w-0 lg:order-1">
                <ContactMessageForm listing={listing} />
            </div>
        </div>
    );
}
