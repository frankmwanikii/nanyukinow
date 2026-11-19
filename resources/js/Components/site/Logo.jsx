import { Link } from '@inertiajs/react';

export default function Logo({
    variant = 'nav',
    tone = 'onDark',
    className = '',
}) {
    const isHero = variant === 'hero';
    const src =
        tone === 'onLight'
            ? '/images/logo-on-light.png'
            : '/images/logo.png';

    return (
        <Link
            href="/"
            className={`group inline-flex items-center no-underline ${className}`}
            aria-label="Nanyuki Now home"
        >
            <img
                src={src}
                alt="Nanyuki Now — Your city, right now"
                className={`w-auto object-contain ${
                    isHero
                        ? 'h-28 drop-shadow-lg sm:h-40 md:h-48'
                        : 'h-10 sm:h-14'
                }`}
                width={969}
                height={542}
                decoding="async"
            />
        </Link>
    );
}
