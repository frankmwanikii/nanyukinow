import { Zap } from 'lucide-react';

const TIER_META = {
    premium: {
        label: 'Premium',
        frame: 'border-mint text-mint',
        title: 'Premium listing',
    },
    featured: {
        label: 'Featured',
        frame: 'border-mustard text-mustard',
        title: 'Featured listing',
    },
};

/**
 * Outline bolt-in-rounded-square badge (premium = mint, featured = mustard).
 * Free listings render nothing.
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
            className={`inline-flex items-center justify-center ${box} ${border} ${meta.frame} ${className}`}
            title={meta.title}
            aria-label={meta.title}
        >
            <Zap className={icon} strokeWidth={2.35} fill="none" />
        </span>
    );
}
