/**
 * Listing plan tiers:
 * - premium → mustard (yellow) bolt badge
 * - featured (Standard) → mint (green) bolt badge
 * - free → no badge
 */
export const LISTING_TIERS = ['premium', 'featured', 'free'];

export function resolveListingTier(item, index = 0) {
    if (item?.tier && LISTING_TIERS.includes(item.tier)) {
        return item.tier;
    }
    if (item?.badge === 'top' || item?.badge === 'premium') {
        return 'premium';
    }
    if (item?.badge === 'featured') {
        return 'featured';
    }
    // Spread featured across catalogue so cards aren't all free.
    if (typeof index === 'number' && index % 7 === 2) {
        return 'featured';
    }
    if (typeof index === 'number' && index % 11 === 5) {
        return 'premium';
    }
    return 'free';
}
