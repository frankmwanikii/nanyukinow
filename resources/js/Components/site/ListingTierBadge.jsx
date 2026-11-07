import { Mark } from '@/Components/site/Mark';

const TIER_META = {
    premium: {
        label: 'Premium',
        frame: 'border-mustard text-mustard',
        title: 'Premium listing',
    },
    featured: {
        label: 'Standard',
        frame: 'border-mint text-mint',
        title: 'Standard listing',
    },
};

function BoltMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M13.4 2.6a.9.9 0 0 1 .55 1.55L10.9 8.4h4.85a.9.9 0 0 1 .7 1.48l-6.6 8.7a.9.9 0 0 1-1.6-.85L10.1 12H5.35a.9.9 0 0 1-.72-1.45l6.75-7.55a.9.9 0 0 1 1.02-.4z" />
        </Mark>
    );
}

/**
 * Bolt mark always visible. Tier wording appears on card hover.
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
            ? 'h-7 w-7'
            : 'h-8 w-8 sm:h-9 sm:w-9';
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
                <BoltMark className={icon} />
            </span>
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 ease-out group-hover:ml-2 group-hover:max-w-[7rem] group-hover:opacity-100">
                <span className="inline-flex bg-black/75 px-2 py-1 text-[11px] font-semibold tracking-wide text-white ring-1 ring-white/25">
                    {meta.label}
                </span>
            </span>
        </span>
    );
}
