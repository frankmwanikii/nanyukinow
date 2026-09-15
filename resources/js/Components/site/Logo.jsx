import { Link } from '@inertiajs/react';

export default function Logo({ variant = 'nav', className = '' }) {
    const isHero = variant === 'hero';

    return (
        <Link
            href="/"
            className={`group inline-flex items-center gap-2.5 no-underline ${className}`}
            aria-label="Nanyuki Now home"
        >
            <span
                className={`relative shrink-0 ${isHero ? 'h-16 w-16 sm:h-24 sm:w-24' : 'h-10 w-10'}`}
                aria-hidden
            >
                <svg viewBox="0 0 64 64" className="h-full w-full" fill="none">
                    <path
                        d="M10 46 L26 18 L32 28 L38 14 L54 46 Z"
                        stroke="currentColor"
                        className="text-mustard"
                        strokeWidth="2.2"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M18 46 C24 28 28 22 32 18 C36 24 40 32 46 46"
                        stroke="currentColor"
                        className="text-mustard"
                        strokeWidth="5.5"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <circle cx="34" cy="30" r="2.2" className="fill-mint" />
                    <circle cx="40" cy="36" r="1.6" className="fill-mint" />
                    <circle cx="28" cy="34" r="1.4" className="fill-mint" />
                </svg>
            </span>
            <span className="flex flex-col leading-none">
                <span
                    className={`font-display font-semibold tracking-tight ${
                        isHero
                            ? 'text-3xl sm:text-5xl md:text-6xl'
                            : 'text-base sm:text-lg'
                    }`}
                >
                    <span className="text-mustard">Nanyuki</span>{' '}
                    <span className="text-mint">Now</span>
                </span>
                <span
                    className={`mt-1 font-sans uppercase tracking-[0.22em] text-white/75 ${
                        isHero ? 'text-[10px] sm:text-xs' : 'text-[8px] sm:text-[9px]'
                    }`}
                >
                    Your city, right now
                </span>
            </span>
        </Link>
    );
}
