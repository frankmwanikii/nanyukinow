import { Link, usePage } from '@inertiajs/react';
import { MailMark, PhoneMark, PinMark } from '@/Components/site/Mark';
import Logo from './Logo';

const EXTRA_CONTACT_PHONE = '0720 299 423';

/** Format local Kenyan mobiles like 0742 451 220. */
function formatKenyanPhone(value) {
    const digits = String(value ?? '').replace(/\D/g, '');
    if (digits.length === 10) {
        return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
    if (digits.length === 12 && digits.startsWith('254')) {
        const local = `0${digits.slice(3)}`;
        return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
    }
    return String(value ?? '').trim();
}

function InstagramIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
            <rect
                x="3.5"
                y="3.5"
                width="17"
                height="17"
                rx="5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <circle
                cx="12"
                cy="12"
                r="3.75"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <circle cx="17.25" cy="6.75" r="1" fill="currentColor" />
        </svg>
    );
}

function FacebookIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
            <path
                d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.2l.8-3H14V9z"
                fill="currentColor"
            />
        </svg>
    );
}

function TikTokIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
            <path
                d="M19.6 8.3a6.7 6.7 0 0 1-3.9-1.2v7.1a5.9 5.9 0 1 1-5.1-5.8v2.9a3 3 0 1 0 2.2 2.9V2.5h2.8a6.7 6.7 0 0 0 4 4.2v1.6z"
                fill="currentColor"
            />
        </svg>
    );
}

function YouTubeIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
            <path
                d="M21.6 7.2a2.4 2.4 0 0 0-1.7-1.7C18.3 5.2 12 5.2 12 5.2s-6.3 0-7.9.3A2.4 2.4 0 0 0 2.4 7.2 24 24 0 0 0 2 12a24 24 0 0 0 .4 4.8 2.4 2.4 0 0 0 1.7 1.7c1.6.3 7.9.3 7.9.3s6.3 0 7.9-.3a2.4 2.4 0 0 0 1.7-1.7A24 24 0 0 0 22 12a24 24 0 0 0-.4-4.8zM10 15.2V8.8l5.5 3.2L10 15.2z"
                fill="currentColor"
            />
        </svg>
    );
}

const socialLinks = [
    { label: 'Facebook', href: 'https://facebook.com', Icon: FacebookIcon },
    { label: 'Instagram', href: 'https://instagram.com', Icon: InstagramIcon },
    { label: 'TikTok', href: 'https://www.tiktok.com', Icon: TikTokIcon },
    { label: 'YouTube', href: 'https://youtube.com', Icon: YouTubeIcon },
];

const siteLinks = [
    { label: 'Home', href: '/' },
    { label: 'Explore', href: '/explore', prefetch: true },
    { label: 'Stories', href: '/stories' },
    { label: 'Pricing', href: '/pricing', prefetch: true },
];

const categoryLinks = [
    { label: 'Eat & Drink', href: '/explore?category=eatDrink' },
    { label: 'Stay', href: '/explore?category=stay' },
    { label: 'Things to do', href: '/explore?category=thingsToDo' },
    { label: 'Services', href: '/explore?category=services' },
];

function FooterLink({ href, prefetch = false, children }) {
    return (
        <Link
            href={href}
            prefetch={prefetch || undefined}
            className="text-base text-olive-600 transition hover:text-olive-950"
        >
            {children}
        </Link>
    );
}

export default function Footer() {
    const year = new Date().getFullYear();
    const { siteContact } = usePage().props;
    const contactPhone = siteContact?.phone || null;
    const contactPhoneLabel = contactPhone
        ? formatKenyanPhone(contactPhone)
        : null;
    const contactEmail = siteContact?.email || 'hello@nanyukinow.co.ke';
    const telHref = contactPhone
        ? `tel:${String(contactPhone).replace(/\s+/g, '')}`
        : null;
    const extraTelHref = `tel:${EXTRA_CONTACT_PHONE.replace(/\s+/g, '')}`;

    return (
        <footer className="relative z-10 bg-earth-dusk text-white">
            {/* CTA band — Graphy-style closer before the utility footer */}
            <div className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] blur-3xl"
                />
                <div className="relative mx-auto max-w-2xl text-center">
                    <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        Looking for something in town?
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-white/65 sm:text-lg">
                        Browse places to eat, stay, and explore around Nanyuki,
                        updated as the day goes.
                    </p>
                    <Link
                        href="/explore"
                        prefetch
                        className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-mustard px-8 text-base font-semibold text-olive-950 transition hover:bg-white"
                    >
                        Explore Nanyuki
                    </Link>
                </div>
            </div>

            {/* Light inset card */}
            <div className="px-3 pb-3 sm:px-5 sm:pb-5 lg:px-6 lg:pb-6">
                <div className="relative mx-auto max-w-site overflow-hidden rounded-2xl bg-[#f3f1ea] text-olive-950 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]">
                    <div className="relative z-10 grid gap-10 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.85fr)] lg:gap-14 lg:px-10 lg:py-14">
                        <div className="space-y-5">
                            <Logo tone="onLight" />
                            <p className="max-w-sm text-base leading-relaxed text-olive-600">
                                Your living guide to Laikipia’s highland town.
                                Listings, stories, and what’s happening right
                                now.
                            </p>
                            <div className="flex items-center gap-1">
                                {socialLinks.map(({ label, href, Icon }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={label}
                                        className="inline-flex h-11 w-11 items-center justify-center text-olive-500 transition hover:text-olive-950"
                                    >
                                        <Icon className="h-5 w-5" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <nav
                            aria-label="Footer"
                            className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-10"
                        >
                            <div>
                                <p className="text-base font-semibold text-olive-950">
                                    Explore
                                </p>
                                <ul className="mt-4 flex flex-col gap-3">
                                    {categoryLinks.map((link) => (
                                        <li key={link.href}>
                                            <FooterLink href={link.href}>
                                                {link.label}
                                            </FooterLink>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <p className="text-base font-semibold text-olive-950">
                                    Visit
                                </p>
                                <ul className="mt-4 flex flex-col gap-3">
                                    {siteLinks.map((link) => (
                                        <li key={link.href}>
                                            <FooterLink
                                                href={link.href}
                                                prefetch={link.prefetch}
                                            >
                                                {link.label}
                                            </FooterLink>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <p className="text-base font-semibold text-olive-950">
                                    Contact
                                </p>
                                <ul className="mt-4 flex flex-col gap-3 text-base text-olive-600">
                                    <li className="flex items-start gap-2.5">
                                        <PinMark className="mt-0.5 h-4 w-4 shrink-0 text-olive-500" />
                                        <span>Nanyuki, Laikipia, Kenya</span>
                                    </li>
                                    {contactPhone ? (
                                        <li className="flex items-start gap-2.5">
                                            <PhoneMark className="mt-0.5 h-4 w-4 shrink-0 text-olive-500" />
                                            <a
                                                href={telHref}
                                                className="transition hover:text-olive-950"
                                            >
                                                {contactPhoneLabel}
                                            </a>
                                        </li>
                                    ) : null}
                                    <li className="flex items-start gap-2.5">
                                        <PhoneMark className="mt-0.5 h-4 w-4 shrink-0 text-olive-500" />
                                        <a
                                            href={extraTelHref}
                                            className="transition hover:text-olive-950"
                                        >
                                            {EXTRA_CONTACT_PHONE}
                                        </a>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <MailMark className="mt-0.5 h-4 w-4 shrink-0 text-olive-500" />
                                        <a
                                            href={`mailto:${contactEmail}`}
                                            className="break-all transition hover:text-olive-950"
                                        >
                                            {contactEmail}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </nav>
                    </div>

                    <div className="relative z-10 flex flex-col gap-3 border-t border-olive-900/8 px-5 py-5 text-sm text-olive-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
                        <p>
                            © {year} Nanyuki Now. All rights reserved. Designed
                            by{' '}
                            <a
                                href="https://fraittech.co.ke"
                                target="_blank"
                                rel="noreferrer"
                                className="text-olive-700 transition hover:text-olive-950"
                            >
                                Fraittech
                            </a>
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <Link
                                href="/terms"
                                className="transition hover:text-olive-950"
                            >
                                Terms of Service
                            </Link>
                            <span
                                className="h-3.5 w-px bg-olive-900/20"
                                aria-hidden="true"
                            />
                            <Link
                                href="/privacy"
                                className="transition hover:text-olive-950"
                            >
                                Privacy Policy
                            </Link>
                        </div>
                    </div>

                    <p
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-6 left-0 right-0 select-none overflow-hidden text-center font-display text-[clamp(4.5rem,18vw,11rem)] font-semibold leading-none text-olive-950/[0.04]"
                    >
                        Nanyuki
                    </p>
                </div>
            </div>
        </footer>
    );
}
