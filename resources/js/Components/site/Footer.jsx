import { Link } from '@inertiajs/react';
import { Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';
import { useLocale } from '@/i18n/LocaleContext';

function InstagramIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
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

export default function Footer() {
    const { t } = useLocale();
    const year = new Date().getFullYear();

    return (
        <footer className="bg-earth-dusk text-white">
            <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:py-16">
                <div className="space-y-4">
                    <Logo />
                    <p className="max-w-sm text-sm leading-relaxed text-white/70">
                        {t.footer.about}
                    </p>
                </div>

                <div>
                    <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-mustard">
                        {t.footer.quickLinks}
                    </h3>
                    <ul className="space-y-2.5 text-sm text-white/75">
                        <li>
                            <a href="/" className="transition hover:text-mint">
                                {t.nav.home}
                            </a>
                        </li>
                        <li>
                            <a href="#listings" className="transition hover:text-mint">
                                {t.topRated.title}
                            </a>
                        </li>
                        <li>
                            <a href="#categories" className="transition hover:text-mint">
                                {t.categories.title}
                            </a>
                        </li>
                        <li>
                            <Link href="/register" className="transition hover:text-mint">
                                {t.nav.addBusiness}
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-mustard">
                        {t.footer.categories}
                    </h3>
                    <ul className="space-y-2.5 text-sm text-white/75">
                        <li>
                            <a href="#eat" className="transition hover:text-mint">
                                {t.nav.eatDrink}
                            </a>
                        </li>
                        <li>
                            <a href="#stay" className="transition hover:text-mint">
                                {t.nav.stay}
                            </a>
                        </li>
                        <li>
                            <a href="#activities" className="transition hover:text-mint">
                                {t.nav.thingsToDo}
                            </a>
                        </li>
                        <li>
                            <a href="#categories" className="transition hover:text-mint">
                                {t.categories.items.services}
                            </a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-mustard">
                        {t.footer.contact}
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
                    <div className="mt-5 flex gap-3">
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-mustard hover:text-olive-900"
                            aria-label="Instagram"
                        >
                            <InstagramIcon className="h-4 w-4" />
                        </a>
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-mustard hover:text-olive-900"
                            aria-label="Facebook"
                        >
                            <FacebookIcon className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-4 py-4 text-center text-xs text-white/50 sm:flex-row sm:px-6 sm:text-left">
                    <p>
                        © {year} Nanyuki Now. {t.footer.rights}
                    </p>
                    <p className="tracking-wide">nanyukinow.co.ke</p>
                </div>
            </div>
        </footer>
    );
}
