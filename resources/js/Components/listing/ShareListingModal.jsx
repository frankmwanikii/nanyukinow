import {
    Copy,
    Mail,
    Share,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import ListingModal from './ListingModal';

function FacebookIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.2l.8-3H14V9z" />
        </svg>
    );
}

function XIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
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

function TelegramIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M21.8 4.2 2.9 11.5c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.7.1 1 .9 1 .6 0 .8-.3 1.1-.6l2.7-2.6 5.6 4.1c1 .6 1.8.3 2.1-1l3.8-17.8c.4-1.5-.5-2.1-1.7-1.6z" />
        </svg>
    );
}

function PinterestIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.8 6.3 9.3-.1-.8-.2-2 0-2.9.2-.8 1.3-5.4 1.3-5.4s-.3-.7-.3-1.6c0-1.5.9-2.6 2-2.6.9 0 1.4.7 1.4 1.5 0 .9-.6 2.3-.9 3.5-.3 1.1.5 1.9 1.5 1.9 1.8 0 3.2-1.9 3.2-4.7 0-2.4-1.8-4.2-4.3-4.2-2.9 0-4.7 2.2-4.7 4.5 0 .9.3 1.8.8 2.3.1.1.1.2.1.3l-.3 1.2c0 .2-.2.2-.4.1-1.5-.7-2.4-2.9-2.4-4.6 0-3.8 2.7-7.2 7.9-7.2 4.1 0 7.4 3 7.4 6.9 0 4.1-2.6 7.5-6.2 7.5-1.2 0-2.4-.6-2.8-1.4l-.8 2.9c-.3 1.1-1 2.5-1.5 3.4 1.1.3 2.3.5 3.5.5 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
        </svg>
    );
}

function LinkedInIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M6.5 9.5H3.6V20h2.9V9.5zM5 3.5A1.7 1.7 0 1 0 5 6.9 1.7 1.7 0 0 0 5 3.5zM20.4 20h-2.9v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V20H10.7V9.5h2.8v1.4h.1c.4-.7 1.3-1.5 2.8-1.5 3 0 3.5 2 3.5 4.5V20z" />
        </svg>
    );
}

function ThreadsIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M16.3 9.2c-.1-1.9-1.1-3.3-3.1-3.8-.6-.2-1.3-.2-2-.2-2.7 0-4.4 1.8-4.4 4.5 0 1.6.7 2.9 1.9 3.6.5.3 1 .5 1.6.6l.2-.9c-.4-.1-.7-.2-1-.4-.8-.5-1.2-1.3-1.2-2.9 0-2 1.2-3.3 3-3.3.5 0 1 .1 1.4.2 1.3.4 1.9 1.3 2 2.7-1.1-.1-2.2 0-3.1.4-1.4.5-2.3 1.6-2.3 3.1 0 1.9 1.5 3.2 3.5 3.2 1.3 0 2.4-.5 3.2-1.5.5.9 1.2 1.3 2.1 1.4v-1c-.5-.1-.8-.3-1.1-.7-.2-.4-.3-.8-.4-1.3.2-.1.3-.3.4-.5.5-1 1-2.1 1.1-3.4.1-1.1 0-2.1-.3-3zM12.7 15c-1.1 0-1.8-.7-1.8-1.6 0-1.3 1.2-1.9 3-1.9.1 1.7-.8 3.5-1.2 3.5z" />
        </svg>
    );
}

function InstagramIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
            <circle cx="17.5" cy="6.5" r="1.3" fill="currentColor" />
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

function openShareWindow(url) {
    window.open(url, '_blank', 'noopener,noreferrer,width=640,height=640');
}

export default function ShareListingModal({ open, onClose, listing }) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return undefined;
        const t = window.setTimeout(() => setCopied(false), 1800);
        return () => window.clearTimeout(t);
    }, [copied]);

    const url =
        typeof window !== 'undefined' ? window.location.href : '';
    const title = listing?.title || 'Nanyuki Now listing';
    const text = `Check out ${title} on Nanyuki Now`;
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
        } catch {
            // ignore
        }
    };

    const shareNative = async () => {
        try {
            if (navigator.share) {
                await navigator.share({ title, text, url });
                return;
            }
            await copyLink();
        } catch {
            // ignore cancel
        }
    };

    const items = [
        {
            id: 'facebook',
            label: 'Facebook',
            bg: 'bg-[#1877F2]',
            icon: FacebookIcon,
            onClick: () =>
                openShareWindow(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
                ),
        },
        {
            id: 'x',
            label: 'X',
            bg: 'bg-black',
            icon: XIcon,
            onClick: () =>
                openShareWindow(
                    `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
                ),
        },
        {
            id: 'whatsapp',
            label: 'WhatsApp',
            bg: 'bg-[#25D366]',
            icon: WhatsAppIcon,
            onClick: () =>
                openShareWindow(
                    `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
                ),
        },
        {
            id: 'telegram',
            label: 'Telegram',
            bg: 'bg-[#2AABEE]',
            icon: TelegramIcon,
            onClick: () =>
                openShareWindow(
                    `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
                ),
        },
        {
            id: 'pinterest',
            label: 'Pinterest',
            bg: 'bg-[#E60023]',
            icon: PinterestIcon,
            onClick: () =>
                openShareWindow(
                    `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
                ),
        },
        {
            id: 'linkedin',
            label: 'LinkedIn',
            bg: 'bg-[#0A66C2]',
            icon: LinkedInIcon,
            onClick: () =>
                openShareWindow(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
                ),
        },
        {
            id: 'mail',
            label: 'Mail',
            bg: 'bg-[#EA4335]',
            icon: Mail,
            onClick: () => {
                window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
            },
        },
        {
            id: 'copy',
            label: copied ? 'Copied!' : 'Copy link',
            bg: 'bg-[#5F6368]',
            icon: Copy,
            onClick: copyLink,
        },
        {
            id: 'native',
            label: 'Share via...',
            bg: 'bg-[#5F6368]',
            icon: Share,
            onClick: shareNative,
        },
        {
            id: 'threads',
            label: 'Threads',
            bg: 'bg-black',
            icon: ThreadsIcon,
            onClick: () =>
                openShareWindow(
                    `https://www.threads.net/intent/post?text=${encodeURIComponent(`${text} ${url}`)}`,
                ),
        },
        {
            id: 'instagram',
            label: 'Instagram',
            bg: 'bg-[#F77737]',
            icon: InstagramIcon,
            onClick: async () => {
                await copyLink();
                openShareWindow('https://www.instagram.com/');
            },
        },
        {
            id: 'tiktok',
            label: 'TikTok',
            bg: 'bg-black',
            icon: TikTokIcon,
            onClick: async () => {
                await copyLink();
                openShareWindow('https://www.tiktok.com/');
            },
        },
    ];

    return (
        <ListingModal open={open} onClose={onClose} title="Share">
            <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={item.onClick}
                            title={item.label}
                            className="group flex flex-col items-center gap-2 text-center"
                        >
                            <span
                                className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-soft transition group-hover:scale-105 sm:h-16 sm:w-16 ${item.bg}`}
                            >
                                <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.75} />
                            </span>
                            <span className="text-xs font-semibold text-earth-dusk sm:text-sm">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
            {copied ? (
                <p className="mt-5 text-center text-sm font-semibold text-olive-700">
                    Link copied to clipboard
                </p>
            ) : null}
        </ListingModal>
    );
}
