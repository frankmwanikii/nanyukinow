/**
 * Things to do plan gates for the listing wizard.
 * Tiers: free → featured (Standard) → premium
 * Fields apply across all experience subcategories.
 */

export const TIER_RANK = {
    free: 0,
    featured: 1,
    premium: 2,
};

export const GALLERY_LIMITS = {
    free: 0,
    featured: 8,
    premium: 30,
};

export const FREE_DESCRIPTION_WORD_LIMIT = 150;

export const THINGS_TO_DO_FEATURE_TIERS = {
    title: 'free',
    cover: 'free',
    area: 'free',
    address: 'free',
    description: 'free',
    duration: 'free',
    difficulty: 'free',
    price_from: 'free',
    hours: 'free',
    phone: 'free',
    search_priority: 'free',

    description_unlimited: 'featured',
    tagline: 'featured',
    map_location: 'featured',
    min_age: 'featured',
    group_size: 'featured',
    included: 'featured',
    bring: 'featured',
    amenities: 'featured',
    logo: 'featured',
    gallery: 'featured',
    payments: 'featured',
    email: 'featured',
    social_contact: 'featured',

    video: 'premium',
    gallery_premium: 'premium',
    whatsapp: 'premium',
    website: 'premium',
    extra_links: 'premium',
    booking_url: 'premium',
    deals: 'premium',
};

export const THINGS_TO_DO_DETAIL_MIN_TIER = {
    duration: 'free',
    difficulty: 'free',
    price_from: 'free',
    min_age: 'featured',
    group_size: 'featured',
    included: 'featured',
    bring: 'featured',
    payments: 'featured',
    video_url: 'premium',
    video_title: 'premium',
    booking_url: 'premium',
    deals: 'premium',
};

export function normalizeTier(tier) {
    if (tier === 'premium') return 'premium';
    if (tier === 'featured' || tier === 'standard') return 'featured';
    return 'free';
}

export function tierMeets(currentTier, requiredTier) {
    const current = TIER_RANK[normalizeTier(currentTier)] ?? 0;
    const required = TIER_RANK[normalizeTier(requiredTier)] ?? 0;
    return current >= required;
}

export function canUseThingsToDoFeature(tier, feature) {
    const required = THINGS_TO_DO_FEATURE_TIERS[feature] || 'free';
    return tierMeets(tier, required);
}

export function thingsToDoGalleryLimit(tier) {
    return GALLERY_LIMITS[normalizeTier(tier)] ?? GALLERY_LIMITS.free;
}

export function thingsToDoDescriptionWordLimit(tier) {
    return tierMeets(tier, 'featured') ? null : FREE_DESCRIPTION_WORD_LIMIT;
}

export function tierDisplayLabel(tier) {
    const t = normalizeTier(tier);
    if (t === 'premium') return 'Premium';
    if (t === 'featured') return 'Standard';
    return 'Free';
}
