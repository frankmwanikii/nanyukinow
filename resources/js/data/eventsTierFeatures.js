/**
 * Events plan gates for the listing wizard.
 * Tiers: free → featured (Standard) → premium
 * Fields apply across all event subcategories.
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

export const AGENDA_LIMITS = {
    free: 0,
    featured: 10,
    premium: 40,
};

export const SPONSOR_LIMITS = {
    free: 0,
    featured: 0,
    premium: 20,
};

export const FREE_DESCRIPTION_WORD_LIMIT = 150;

export const EVENTS_FEATURE_TIERS = {
    title: 'free',
    cover: 'free',
    area: 'free',
    address: 'free',
    description: 'free',
    organiser: 'free',
    event_when: 'free',
    venue: 'free',
    phone: 'free',
    search_priority: 'free',

    description_unlimited: 'featured',
    tagline: 'featured',
    map_location: 'featured',
    age_limit: 'featured',
    doors_open: 'featured',
    dress_code: 'featured',
    agenda: 'featured',
    tickets: 'featured',
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
    sponsors: 'premium',
    ticket_url: 'premium',
};

export const EVENTS_DETAIL_MIN_TIER = {
    organiser: 'free',
    age_limit: 'featured',
    doors_open: 'featured',
    dress_code: 'featured',
    agenda: 'featured',
    payments: 'featured',
    sponsors: 'premium',
    video_url: 'premium',
    video_title: 'premium',
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

export function canUseEventsFeature(tier, feature) {
    const required = EVENTS_FEATURE_TIERS[feature] || 'free';
    return tierMeets(tier, required);
}

export function eventsGalleryLimit(tier) {
    return GALLERY_LIMITS[normalizeTier(tier)] ?? GALLERY_LIMITS.free;
}

export function eventsAgendaLimit(tier) {
    return AGENDA_LIMITS[normalizeTier(tier)] ?? AGENDA_LIMITS.free;
}

export function eventsSponsorLimit(tier) {
    return SPONSOR_LIMITS[normalizeTier(tier)] ?? SPONSOR_LIMITS.free;
}

export function eventsDescriptionWordLimit(tier) {
    return tierMeets(tier, 'featured') ? null : FREE_DESCRIPTION_WORD_LIMIT;
}

export function tierDisplayLabel(tier) {
    const t = normalizeTier(tier);
    if (t === 'premium') return 'Premium';
    if (t === 'featured') return 'Standard';
    return 'Free';
}
