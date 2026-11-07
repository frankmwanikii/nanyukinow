import {
    PremiumTierMark,
    StandardTierMark,
} from '@/Components/site/Mark';

const TIER_META = {
    premium: {
        label: 'Premium',
        title: 'Premium listing',
        Icon: PremiumTierMark,
        chip: 'bg-earth-dusk text-mustard',
    },
    featured: {
        label: 'Standard',
        title: 'Standard listing',
        Icon: StandardTierMark,
        chip: 'bg-earth-dusk text-mint',
    },
};

/**
 * Paid-tier chip for listing cards (icon + label). Free listings omit this.
 */
export default function ListingTierBadge({
    tier,
    className = '',
}) {
    const meta = TIER_META[tier];
    if (!meta) {
        return null;
    }

    const { Icon } = meta;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold ${meta.chip} ${className}`}
            title={meta.title}
            aria-label={meta.title}
        >
            <Icon className="h-3 w-3 shrink-0" />
            {meta.label}
        </span>
    );
}
