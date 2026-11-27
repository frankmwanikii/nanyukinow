/**
 * Services plan gates for the listing wizard.
 * Tiers: free → featured (Standard) → premium
 * Fields (including portfolio / priced services) apply across all service subcategories.
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

export const SERVICE_LIMITS = {
    free: 0,
    featured: 5,
    premium: 50,
};

/** Photos allowed on each priced service. null = unlimited. */
export const SERVICE_IMAGES_PER_ITEM = {
    free: 0,
    featured: 5,
    premium: null,
};

/** Photos allowed on each portfolio piece. null = unlimited. */
export const PORTFOLIO_IMAGES_PER_ITEM = {
    free: 0,
    featured: 5,
    premium: null,
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
    services: 'featured',
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
    services: 'featured',
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

export function servicesServiceLimit(tier) {
    return SERVICE_LIMITS[normalizeTier(tier)] ?? SERVICE_LIMITS.free;
}

/** @returns {number|null} Cap per priced service, or null when unlimited. */
export function servicesServiceImagesPerItem(tier) {
    const key = normalizeTier(tier);
    if (Object.prototype.hasOwnProperty.call(SERVICE_IMAGES_PER_ITEM, key)) {
        return SERVICE_IMAGES_PER_ITEM[key];
    }

    return SERVICE_IMAGES_PER_ITEM.free;
}

/** @returns {number|null} Cap per portfolio piece, or null when unlimited. */
export function servicesPortfolioImagesPerItem(tier) {
    const key = normalizeTier(tier);
    if (Object.prototype.hasOwnProperty.call(PORTFOLIO_IMAGES_PER_ITEM, key)) {
        return PORTFOLIO_IMAGES_PER_ITEM[key];
    }

    return PORTFOLIO_IMAGES_PER_ITEM.free;
}

/** Normalize photos: prefer `images[]`, fall back to legacy `image`. */
export function serviceItemImages(item) {
    if (!item || typeof item !== 'object') {
        return [];
    }
    if (Array.isArray(item.images)) {
        return item.images
            .map((url) => (typeof url === 'string' ? url.trim() : ''))
            .filter(Boolean);
    }
    if (typeof item.image === 'string' && item.image.trim()) {
        return [item.image.trim()];
    }
    return [];
}

export function portfolioItemImages(item) {
    return serviceItemImages(item);
}

export function servicesDescriptionWordLimit(tier) {
    return tierMeets(tier, 'featured') ? null : FREE_DESCRIPTION_WORD_LIMIT;
}

export function servicesPortfolioHelp(tier) {
    const limit = servicesPortfolioLimit(tier);
    const plan = tierDisplayLabel(tier);
    if (!limit) {
        return 'Showcase past jobs, case studies, and sample work on your Portfolio tab.';
    }
    return `${plan}: up to ${limit} portfolio pieces. Premium unlocks more.`;
}

export function servicesServiceHelp(tier) {
    const limit = servicesServiceLimit(tier);
    const plan = tierDisplayLabel(tier);
    if (!limit) {
        return 'List priced services on your Services tab.';
    }
    return `${plan}: up to ${limit} priced services. Premium unlocks a larger menu.`;
}

export function tierDisplayLabel(tier) {
    const t = normalizeTier(tier);
    if (t === 'premium') return 'Premium';
    if (t === 'featured') return 'Standard';
    return 'Free';
}
