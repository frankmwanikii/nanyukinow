import { Link } from '@inertiajs/react';

export default function Logo({
    variant = 'nav',
    tone = 'onDark',
    className = '',
}) {
    const isHero = variant === 'hero';
    const onLight = tone === 'onLight';
    const src = onLight ? '/images/logo-on-light.png' : '/images/logo.png';

    return (
        <Link
            href="/"
            className={`group inline-flex items-center no-underline ${className}`}
            aria-label="Nanyuki Now home"
        >
            <img
                src={src}
                alt="Nanyuki Now. Your city right now"
                className={`w-auto object-contain ${
                    isHero
                        ? 'h-28 drop-shadow-lg sm:h-40 md:h-48'
                        : onLight
                          ? 'h-36 w-auto max-w-[14rem] sm:h-44 sm:max-w-[17rem]'
                          : 'h-10 sm:h-14'
                }`}
                width={onLight ? 1024 : 969}
                height={onLight ? 1024 : 542}
                decoding="async"
            />
        </Link>
    );
}
