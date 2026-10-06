/**
 * Stay plan gates for the listing wizard.
 * Tiers: free → featured (Standard) → premium
 * Locked fields are hidden; show StayTierUpsell once instead.
 */

export const TIER_RANK = {
    free: 0,
    featured: 1,
    premium: 2,
};

export const GALLERY_PER_ROOM_LIMITS = {
    free: 0,
    featured: 15,
    premium: 30,
};

/** Room / space labels for the categorized Stay gallery. */
export const STAY_GALLERY_SPACES = [
    { value: 'bedroom', label: 'Bedroom' },
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'living', label: 'Living room' },
    { value: 'dining', label: 'Dining' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'exterior', label: 'Exterior' },
];

/** Overall gallery cap = per-room limit × number of room tabs. */
export const GALLERY_LIMITS = {
    free: 0,
    featured:
        GALLERY_PER_ROOM_LIMITS.featured * STAY_GALLERY_SPACES.length,
    premium:
        GALLERY_PER_ROOM_LIMITS.premium * STAY_GALLERY_SPACES.length,
};

export const FREE_DESCRIPTION_WORD_LIMIT = 150;

/** Feature → minimum tier required */
export const STAY_FEATURE_TIERS = {
    // Free
    title: 'free',
    logo: 'free',
    cover: 'free',
    area: 'free',
    address: 'free',
    description: 'free',
    tagline: 'free',
    phone: 'free',
    email: 'free',
    price_level: 'free',
    stay_basics: 'free',
    search_priority: 'free',

    // Standard (featured)
    description_unlimited: 'featured',
    map_location: 'featured',
    gallery: 'featured',
    gallery_standard: 'featured',
    check_times: 'featured',
    reception_hours: 'featured',
    nightly_rate: 'featured',
    meal_plan: 'featured',
    amenities: 'featured',
    house_rules: 'featured',
    payments: 'featured',
    cancellation_policy: 'featured',
    social_contact: 'featured',
    whatsapp: 'featured',
    website: 'featured',

    // Premium
    video: 'premium',
    gallery_premium: 'premium',
    booking_url: 'premium',
    activities: 'premium',
    seasonal_offers: 'premium',
    nearby_attractions: 'premium',
    host_profile: 'premium',
};

/** Detail keys that require a minimum tier (stripped server-side when locked). */
export const STAY_DETAIL_MIN_TIER = {
    guests: 'free',
    rooms: 'free',
    beds: 'free',
    baths: 'free',
    check_in: 'featured',
    check_out: 'featured',
    nightly_rate: 'featured',
    meal_plan: 'featured',
    house_rules: 'featured',
    payments: 'featured',
    cancellation_policy: 'featured',
    video_url: 'premium',
    video_title: 'premium',
    booking_url: 'premium',
    included: 'premium',
    deals: 'premium',
    nearby_attractions: 'premium',
    host_name: 'premium',
    host_bio: 'premium',
    host_photo: 'premium',
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

export function canUseStayFeature(tier, feature) {
    const required = STAY_FEATURE_TIERS[feature] || 'free';
    return tierMeets(tier, required);
}

export function stayGalleryLimit(tier) {
    return GALLERY_LIMITS[normalizeTier(tier)] ?? GALLERY_LIMITS.free;
}

export function stayGalleryPerRoomLimit(tier) {
    return (
        GALLERY_PER_ROOM_LIMITS[normalizeTier(tier)] ??
        GALLERY_PER_ROOM_LIMITS.free
    );
}

export function stayDescriptionWordLimit(tier) {
    return tierMeets(tier, 'featured') ? null : FREE_DESCRIPTION_WORD_LIMIT;
}

export function tierDisplayLabel(tier) {
    const t = normalizeTier(tier);
    if (t === 'premium') return 'Premium';
    if (t === 'featured') return 'Standard';
    return 'Free';
}

export function requiredTierLabel(feature) {
    return tierDisplayLabel(STAY_FEATURE_TIERS[feature] || 'free');
}

export function staySpaceLabel(kind) {
    const match = STAY_GALLERY_SPACES.find((s) => s.value === kind);
    return match?.label || 'Exterior';
}

/** Plain-text word count from HTML or string. */
export function countWords(value) {
    if (!value) return 0;
    const text = String(value)
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (!text) return 0;
    return text.split(' ').filter(Boolean).length;
}
