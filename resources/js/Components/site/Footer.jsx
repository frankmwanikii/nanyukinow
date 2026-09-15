import { Link } from '@inertiajs/react';
import { Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';

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

function YouTubeIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M23 12.2s0-3.4-.4-5a3 3 0 0 0-2.1-2.1C18.7 4.6 12 4.6 12 4.6s-6.7 0-8.5.5A3 3 0 0 0 1.4 7.2C1 8.8 1 12.2 1 12.2s0 3.4.4 5a3 3 0 0 0 2.1 2.1c1.8.5 8.5.5 8.5.5s6.7 0 8.5-.5a3 3 0 0 0 2.1-2.1c.4-1.6.4-5 .4-5zM9.8 15.5v-6.6l5.7 3.3-5.7 3.3z" />
        </svg>
    );
}

const socialLinks = [
    { label: 'TikTok', href: 'https://www.tiktok.com', Icon: TikTokIcon },
    { label: 'Instagram', href: 'https://instagram.com', Icon: InstagramIcon },
    { label: 'Facebook', href: 'https://facebook.com', Icon: FacebookIcon },
    { label: 'YouTube', href: 'https://youtube.com', Icon: YouTubeIcon },
];

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="relative z-10 bg-earth-dusk text-white">
            <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:py-16">
                <div className="space-y-4">
                    <Logo />
                    <p className="max-w-sm text-sm leading-relaxed text-white/70">
                        Nanyuki Now is your living guide to Laikipia’s highland
                        town — listings, stories, and what’s happening right now.
                    </p>
                </div>

                <div>
                    <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-mustard">
                        Quick links
                    </h3>
                    <ul className="space-y-2.5 text-sm text-white/75">
                        <li>
                            <Link href="/" className="transition hover:text-mint">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/explore"
                                className="transition hover:text-mint"
                            >
                                Explore
                            </Link>
                        </li>
                        <li>
                            <a
                                href="#categories"
                                className="transition hover:text-mint"
                            >
                                Find it by category
                            </a>
                        </li>
                        <li>
                            <Link
                                href="/register"
                                className="transition hover:text-mint"
                            >
                                Add Business
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-mustard">
                        Categories
                    </h3>
                    <ul className="space-y-2.5 text-sm text-white/75">
                        <li>
                            <Link
                                href="/explore?category=eatDrink"
                                className="transition hover:text-mint"
                            >
                                Eat & Drink
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/explore?category=stay"
                                className="transition hover:text-mint"
                            >
                                Stay
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/explore?category=thingsToDo"
                                className="transition hover:text-mint"
                            >
                                Things to do
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/explore?category=services"
                                className="transition hover:text-mint"
                            >
                                Services
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-mustard">
                        Contact
                    </h3>
                    <ul className="space-y-3 text-sm text-white/75">
                        <li className="flex gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                            Nanyuki, Laikipia, Kenya
                        </li>
                        <li className="flex gap-2">
                            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                            <a href="tel:+254700000000" className="hover:text-mint">
                                +254 700 000 000
                            </a>
                        </li>
                        <li className="flex gap-2">
                            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                            <a
                                href="mailto:hello@nanyukinow.co.ke"
                                className="hover:text-mint"
                            >
                                hello@nanyukinow.co.ke
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex justify-center px-4 pb-6 sm:px-6">
                <div className="flex items-center gap-3">
                    {socialLinks.map(({ label, href, Icon }) => (
                        <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-mustard hover:text-olive-900"
                            aria-label={label}
                        >
                            <Icon className="h-4 w-4" />
                        </a>
                    ))}
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-4 py-4 text-center text-xs text-white/50 sm:flex-row sm:px-6 sm:text-left">
                    <p>
                        © {year} Nanyuki Now. All rights reserved.{' '}
                        <span className="text-white/35">·</span> Designed by{' '}
                        <a
                            href="https://fraittech.co.ke"
                            target="_blank"
                            rel="noreferrer"
                            className="text-white/70 transition hover:text-mint"
                        >
                            Fraittech
                        </a>
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-end">
                        <Link href="/terms" className="transition hover:text-mint">
                            Terms of Service
                        </Link>
                        <span className="h-3 w-px bg-white/25" aria-hidden />
                        <Link
                            href="/privacy"
                            className="transition hover:text-mint"
                        >
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
