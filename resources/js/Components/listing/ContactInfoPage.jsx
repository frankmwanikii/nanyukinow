import { Mail, MapPin, Paperclip, Phone, Send, X } from 'lucide-react';
import { useRef, useState } from 'react';
import DetailSection from './DetailSection';
import DirectionsMap from './DirectionsMap';
import HoursList from './HoursList';
import EventSchedule from './EventSchedule';
import AgentCard from './AgentCard';
import WaysToPay from './WaysToPay';
import RecaptchaField from './RecaptchaField';

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
    'w-full rounded-xl border-0 bg-olive-50 px-4 py-3 text-sm text-earth-dusk ring-1 ring-olive-200 placeholder:text-olive-400 focus:ring-2 focus:ring-mustard';

function ContactMessageForm({ listing }) {
    const fileInputRef = useRef(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaError, setCaptchaError] = useState('');
    const [fileError, setFileError] = useState('');
    const [sent, setSent] = useState(false);

    const onFileChange = (e) => {
        const picked = Array.from(e.target.files || []);
        setFileError('');
        if (!picked.length) return;

        const maxBytes = 5 * 1024 * 1024;
        const maxFiles = 5;
        const allowed = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        const next = [...attachments];
        const rejected = [];

        for (const file of picked) {
            if (next.length >= maxFiles) {
                rejected.push(`${file.name} (max ${maxFiles} files)`);
                continue;
            }
            if (!allowed.includes(file.type)) {
                rejected.push(`${file.name} (type not allowed)`);
                continue;
            }
            if (file.size > maxBytes) {
                rejected.push(`${file.name} (over 5MB)`);
                continue;
            }
            const duplicate = next.some(
                (f) => f.name === file.name && f.size === file.size,
            );
            if (duplicate) continue;
            next.push(file);
        }

        setAttachments(next);
        if (rejected.length) {
            setFileError(`Skipped: ${rejected.slice(0, 3).join(', ')}`);
        }
        e.target.value = '';
    };

    const removeFile = (index) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
        setFileError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const clearFiles = () => {
        setAttachments([]);
        setFileError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const submit = (e) => {
        e.preventDefault();
        setCaptchaError('');
        if (!firstName.trim() || !lastName.trim() || !message.trim()) return;
        if (!captchaToken) {
            setCaptchaError('Please complete the security check.');
            return;
        }
        setSent(true);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setMessage('');
        clearFiles();
        setCaptchaToken('');
        window.setTimeout(() => setSent(false), 2800);
    };

    return (
        <DetailSection title="Send a message">
            <p className="mb-4 text-sm text-olive-600">
                Reach {listing.title} directly — we’ll pass your note along.
            </p>
            <form onSubmit={submit} className="space-y-4" encType="multipart/form-data">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="contact-fname"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500"
                        >
                            First name
                        </label>
                        <input
                            id="contact-fname"
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
                            htmlFor="contact-lname"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500"
                        >
                            Last name
                        </label>
                        <input
                            id="contact-lname"
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
                            htmlFor="contact-email"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500"
                        >
                            Your email
                        </label>
                        <input
                            id="contact-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@email.com"
                            className={fieldClass}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="contact-phone"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500"
                        >
                            Phone
                        </label>
                        <input
                            id="contact-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+254 …"
                            className={fieldClass}
                        />
                    </div>
                </div>
                <div>
                    <label
                        htmlFor="contact-message"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500"
                    >
                        Message
                    </label>
                    <textarea
                        id="contact-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="How can they help you?"
                        required
                        rows={4}
                        className={`${fieldClass} resize-y`}
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500">
                        Attach files
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                        <label
                            htmlFor="contact-file"
                            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-olive-50 px-4 py-2.5 text-sm font-semibold text-olive-800 ring-1 ring-olive-200 transition hover:bg-white hover:ring-mustard"
                        >
                            <Paperclip className="h-4 w-4 text-mustard" />
                            Choose files
                        </label>
                        <input
                            ref={fileInputRef}
                            id="contact-file"
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,image/jpeg,image/png,image/webp,application/pdf"
                            onChange={onFileChange}
                            className="sr-only"
                        />
                        <span className="text-xs text-olive-500">
                            Optional · up to 5 files · JPG, PNG, PDF, DOC · 5MB each
                        </span>
                    </div>
                    {attachments.length > 0 ? (
                        <ul className="mt-3 flex flex-wrap gap-2">
                            {attachments.map((file, index) => (
                                <li
                                    key={`${file.name}-${file.size}-${index}`}
                                    className="inline-flex max-w-full items-center gap-2 rounded-full bg-mustard/15 px-3 py-1.5 text-xs font-semibold text-olive-900"
                                >
                                    <span className="truncate">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="rounded-full p-0.5 hover:bg-white/80"
                                        aria-label={`Remove ${file.name}`}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
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

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-full bg-olive-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950"
                    >
                        <Send className="h-4 w-4" />
                        Send message
                    </button>
                    {sent ? (
                        <span className="text-sm font-semibold text-olive-700">
                            Message sent — thanks!
                        </span>
                    ) : null}
                </div>
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

    return (
        <div className="mx-auto grid max-w-[1400px] gap-4 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.9fr)] lg:items-start lg:gap-5">
            <div className="flex flex-col gap-4">
                <DetailSection title="Contact info">
                    <div className="space-y-5">
                        <div>
                            <p className="font-display text-xl font-semibold text-earth-dusk">
                                {listing.title}
                            </p>
                            <p className="mt-1 text-sm text-olive-600">
                                {listing.tagline}
                                {listing.location ? ` · ${listing.location}` : ''}
                            </p>
                        </div>

                        {listing.address ? (
                            <p className="flex items-start gap-2 text-sm text-olive-800">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mustard" />
                                <span>{listing.address}</span>
                            </p>
                        ) : null}

                        <div className="grid gap-3 sm:grid-cols-2">
                            {tel ? (
                                <a
                                    href={tel}
                                    className="flex items-center gap-3 rounded-xl bg-olive-50 px-4 py-3 text-sm font-semibold text-olive-900 transition hover:bg-mustard/20"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-mustard shadow-soft">
                                        <Phone className="h-4 w-4" />
                                    </span>
                                    <span>
                                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-olive-500">
                                            Phone
                                        </span>
                                        {listing.phone}
                                    </span>
                                </a>
                            ) : null}
                            {email ? (
                                <a
                                    href={`mailto:${email}`}
                                    className="flex items-center gap-3 rounded-xl bg-olive-50 px-4 py-3 text-sm font-semibold text-olive-900 transition hover:bg-mustard/20"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-mustard shadow-soft">
                                        <Mail className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-olive-500">
                                            Email
                                        </span>
                                        <span className="break-all">{email}</span>
                                    </span>
                                </a>
                            ) : null}
                        </div>

                        {socialLinks.length ? (
                            <div>
                                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-olive-500">
                                    Social
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {socialLinks.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <a
                                                key={item.label}
                                                href={item.href}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-olive-800 ring-1 ring-olive-200 transition hover:bg-olive-700 hover:text-white hover:ring-olive-700"
                                            >
                                                <Icon className="h-4 w-4" />
                                                {item.label}
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </DetailSection>

                <ContactMessageForm listing={listing} />
                <DirectionsMap listing={listing} />
            </div>

            <aside className="flex flex-col gap-4 lg:sticky lg:top-36">
                {listing.agent ? <AgentCard agent={listing.agent} /> : null}
                <HoursList
                    hours={listing.hours}
                    status={listing.hoursStatus}
                />
                <EventSchedule items={listing.eventSchedule} />
                <WaysToPay payments={listing.payments} />
            </aside>
        </div>
    );
}
