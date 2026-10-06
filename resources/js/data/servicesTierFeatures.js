/**
 * Services plan gates for the listing wizard.
 * Tiers: free → featured (Standard) → premium
 * Fields (including portfolio / works) apply across all service subcategories.
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

export const PORTFOLIO_LIMITS = {
    free: 0,
    featured: 5,
    premium: 25,
};

export const FREE_DESCRIPTION_WORD_LIMIT = 150;

export const SERVICES_FEATURE_TIERS = {
    title: 'free',
    cover: 'free',
    area: 'free',
    address: 'free',
    description: 'free',
    service_area: 'free',
    offerings: 'free',
    pricing_from: 'free',
    hours: 'free',
    phone: 'free',
    search_priority: 'free',

    description_unlimited: 'featured',
    tagline: 'featured',
    map_location: 'featured',
    response_time: 'featured',
    credentials: 'featured',
    portfolio: 'featured',
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

export const SERVICES_DETAIL_MIN_TIER = {
    service_area: 'free',
    offerings: 'free',
    pricing_from: 'free',
    response_time: 'featured',
    credentials: 'featured',
    portfolio: 'featured',
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

export function canUseServicesFeature(tier, feature) {
    const required = SERVICES_FEATURE_TIERS[feature] || 'free';
    return tierMeets(tier, required);
}

export function servicesGalleryLimit(tier) {
    return GALLERY_LIMITS[normalizeTier(tier)] ?? GALLERY_LIMITS.free;
}

export function servicesPortfolioLimit(tier) {
    return PORTFOLIO_LIMITS[normalizeTier(tier)] ?? PORTFOLIO_LIMITS.free;
}

export function servicesDescriptionWordLimit(tier) {
    return tierMeets(tier, 'featured') ? null : FREE_DESCRIPTION_WORD_LIMIT;
}

export function servicesPortfolioHelp(tier) {
    const limit = servicesPortfolioLimit(tier);
    const plan = tierDisplayLabel(tier);
    if (!limit) {
        return 'Link past jobs, case studies, and sample work.';
    }
    return `${plan}: up to ${limit} portfolio pieces with links. Premium unlocks more.`;
}

export function tierDisplayLabel(tier) {
    const t = normalizeTier(tier);
    if (t === 'premium') return 'Premium';
    if (t === 'featured') return 'Standard';
    return 'Free';
}
