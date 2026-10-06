/**
 * Properties plan gates for the listing wizard.
 * Tiers: free → featured (Standard) → premium
 * Fields apply across For Sale / For Rent / For Lease.
 */

export const TIER_RANK = {
    free: 0,
    featured: 1,
    premium: 2,
};

export const GALLERY_LIMITS = {
    free: 0,
    featured: 10,
    premium: 40,
};

export const FREE_DESCRIPTION_WORD_LIMIT = 150;

export const PROPERTIES_FEATURE_TIERS = {
    title: 'free',
    cover: 'free',
    area: 'free',
    address: 'free',
    description: 'free',
    property_type: 'free',
    bedrooms: 'free',
    bathrooms: 'free',
    price: 'free',
    phone: 'free',
    search_priority: 'free',

    description_unlimited: 'featured',
    tagline: 'featured',
    map_location: 'featured',
    size_sqm: 'featured',
    furnished: 'featured',
    parking_spaces: 'featured',
    year_built: 'featured',
    highlights: 'featured',
    amenities: 'featured',
    logo: 'featured',
    gallery: 'featured',
    payments: 'featured',
    agent: 'featured',
    email: 'featured',
    social_contact: 'featured',

    video: 'premium',
    gallery_premium: 'premium',
    whatsapp: 'premium',
    website: 'premium',
    extra_links: 'premium',
    virtual_tour: 'premium',
    floor_plan: 'premium',
    enquiry_url: 'premium',
};

export const PROPERTIES_DETAIL_MIN_TIER = {
    bedrooms: 'free',
    bathrooms: 'free',
    price: 'free',
    size_sqm: 'featured',
    furnished: 'featured',
    parking_spaces: 'featured',
    year_built: 'featured',
    highlights: 'featured',
    payments: 'featured',
    agent_name: 'featured',
    agent_phone: 'featured',
    agent_email: 'featured',
    video_url: 'premium',
    video_title: 'premium',
    virtual_tour_url: 'premium',
    floor_plan_pdf: 'premium',
    enquiry_url: 'premium',
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

export function canUsePropertiesFeature(tier, feature) {
    const required = PROPERTIES_FEATURE_TIERS[feature] || 'free';
    return tierMeets(tier, required);
}

export function propertiesGalleryLimit(tier) {
    return GALLERY_LIMITS[normalizeTier(tier)] ?? GALLERY_LIMITS.free;
}

export function propertiesDescriptionWordLimit(tier) {
    return tierMeets(tier, 'featured') ? null : FREE_DESCRIPTION_WORD_LIMIT;
}

export function tierDisplayLabel(tier) {
    const t = normalizeTier(tier);
    if (t === 'premium') return 'Premium';
    if (t === 'featured') return 'Standard';
    return 'Free';
}
