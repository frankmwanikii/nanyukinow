import { Link } from '@inertiajs/react';

export default function Logo({ variant = 'nav', className = '' }) {
    const isHero = variant === 'hero';

    return (
        <Link
            href="/"
            className={`group inline-flex items-center no-underline ${className}`}
            aria-label="Nanyuki Now home"
        >
            <img
                src="/images/logo.png"
                alt="Nanyuki Now — Your city, right now"
                className={`w-auto object-contain ${
                    isHero
                        ? 'h-28 drop-shadow-lg sm:h-40 md:h-48'
                        : 'h-11 sm:h-12'
                }`}
                width={969}
                height={542}
                decoding="async"
            />
        </Link>
    );
}
