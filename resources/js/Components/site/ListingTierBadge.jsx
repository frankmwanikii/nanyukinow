import { Zap } from 'lucide-react';

const TIER_META = {
    premium: {
        label: 'Premium',
        frame: 'border-mustard text-mustard',
        title: 'Premium listing',
    },
    featured: {
        label: 'Featured',
        frame: 'border-mint text-mint',
        title: 'Featured listing',
    },
};

/**
 * Bolt icon always visible. "Premium" / "Featured" wording appears on card hover.
 */
export default function ListingTierBadge({
    tier,
    className = '',
    size = 'md',
}) {
    const meta = TIER_META[tier];
    if (!meta) return null;

    const box =
        size === 'sm'
            ? 'h-7 w-7 rounded-[0.55rem]'
            : 'h-8 w-8 rounded-[0.65rem] sm:h-9 sm:w-9';
    const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4 sm:h-[1.15rem] sm:w-[1.15rem]';
    const border = size === 'sm' ? 'border-[1.5px]' : 'border-2';

    return (
        <span
            className={`inline-flex items-center gap-0 ${className}`}
            aria-label={meta.title}
        >
            <span
                className={`inline-flex shrink-0 items-center justify-center ${box} ${border} ${meta.frame} bg-black/25 backdrop-blur-[2px]`}
            >
                <Zap className={icon} strokeWidth={2.35} fill="none" />
            </span>
            <span
                className={`max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 ease-out group-hover:ml-2 group-hover:max-w-[7rem] group-hover:opacity-100`}
            >
                <span className="inline-flex rounded-md bg-black/75 px-2 py-1 text-[11px] font-bold tracking-wide text-white ring-1 ring-white/25">
                    {meta.label}
                </span>
            </span>
        </span>
    );
}
