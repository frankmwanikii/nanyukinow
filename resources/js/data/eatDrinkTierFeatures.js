/**
 * Eat & Drink plan gates for the listing wizard.
 * Tiers: free → featured (Standard) → premium
 * Locked fields are hidden; show EatDrinkTierUpsell once instead.
 */

export const TIER_RANK = {
    free: 0,
    featured: 1,
    premium: 2,
};

export const GALLERY_LIMITS = {
    free: 3,
    featured: 10,
    premium: 30,
};

export const FREE_DESCRIPTION_WORD_LIMIT = 150;
export const FREE_CUISINE_TAG_LIMIT = 5;
export const STANDARD_CUISINE_TAG_LIMIT = 10;
export const STANDARD_MENU_LIMIT = 5;
export const PREMIUM_MENU_LIMIT = 15;
export const STANDARD_MENU_IMAGES_PER_PAGE = 5;
export const PREMIUM_MENU_IMAGES_PER_PAGE = 15;

/** Feature → minimum tier required */
export const EAT_DRINK_FEATURE_TIERS = {
    // Free
    title: 'free',
    logo: 'free',
    cover: 'free',
    area: 'free',
    address: 'free',
    description: 'free',
    tagline: 'free',
    phone: 'free',
    hours: 'free',
    amenities: 'free',
    price_level: 'free',
    cuisine: 'free',
    gallery: 'free',
    search_priority: 'free',

    // Standard (featured)
    description_unlimited: 'featured',
    map_location: 'featured',
    gallery_standard: 'featured',
    menus: 'featured',
    payments: 'featured',
    dietary: 'featured',
    delivery_options: 'featured',
    email: 'featured',
    social_contact: 'featured',
    website: 'featured',
    whatsapp: 'featured',

    // Premium
    video: 'premium',
    gallery_premium: 'premium',
    booking_url: 'premium',
    deals: 'premium',
    live_music: 'premium',
    avg_meal: 'premium',
    capacity: 'premium',
    dress_code: 'premium',
};

/** Detail keys that require a minimum tier (stripped server-side when locked). */
export const EAT_DRINK_DETAIL_MIN_TIER = {
    cuisine: 'free',
    payments: 'featured',
    dietary: 'featured',
    delivery_options: 'featured',
    menus: 'featured',
    video_url: 'premium',
    video_title: 'premium',
    booking_url: 'premium',
    deals: 'premium',
    event_schedule: 'premium',
    avg_meal: 'premium',
    capacity: 'premium',
    dress_code: 'premium',
    reservations: 'featured',
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

export function canUseEatDrinkFeature(tier, feature) {
    const required = EAT_DRINK_FEATURE_TIERS[feature] || 'free';
    return tierMeets(tier, required);
}

export function eatDrinkGalleryLimit(tier) {
    return GALLERY_LIMITS[normalizeTier(tier)] ?? GALLERY_LIMITS.free;
}

export function eatDrinkCuisineLimit(tier) {
    const normalized = normalizeTier(tier);
    if (normalized === 'premium') return null;
    if (normalized === 'featured') return STANDARD_CUISINE_TAG_LIMIT;
    return FREE_CUISINE_TAG_LIMIT;
}

/** Tier-aware help copy for the cuisine / specialty field. */
export function eatDrinkCuisineHelp(tier) {
    const limit = eatDrinkCuisineLimit(tier);
    const plan = tierDisplayLabel(tier);

    if (limit == null) {
        return 'Pick popular options or type your own. Premium plans have no cuisine limit.';
    }

    return `Pick popular options or type your own. ${plan} plans can add up to ${limit}.`;
}

export function eatDrinkDescriptionWordLimit(tier) {
    return tierMeets(tier, 'featured') ? null : FREE_DESCRIPTION_WORD_LIMIT;
}

/** Max menu pages for Eat & Drink. Free has none. */
export function eatDrinkMenuLimit(tier) {
    const normalized = normalizeTier(tier);
    if (normalized === 'premium') return PREMIUM_MENU_LIMIT;
    if (normalized === 'featured') return STANDARD_MENU_LIMIT;
    return 0;
}

/** Max images allowed on each menu page. */
export function eatDrinkMenuImagesPerPage(tier) {
    const normalized = normalizeTier(tier);
    if (normalized === 'premium') return PREMIUM_MENU_IMAGES_PER_PAGE;
    if (normalized === 'featured') return STANDARD_MENU_IMAGES_PER_PAGE;
    return 0;
}

export function eatDrinkMenuHelp(tier) {
    const pages = eatDrinkMenuLimit(tier);
    const perPage = eatDrinkMenuImagesPerPage(tier);
    const plan = tierDisplayLabel(tier);
    if (!pages) {
        return 'Add menu pages with photos or a PDF link.';
    }
    return `${plan}: up to ${pages} menu pages, ${perPage} images each. Add a PDF link per page if you like.`;
}

/** Normalize a menu item's image list (supports legacy single `image`). */
export function menuItemImages(item) {
    if (!item || typeof item !== 'object') return [];
    if (Array.isArray(item.images)) {
        return item.images
            .map((u) => (typeof u === 'string' ? u.trim() : ''))
            .filter(Boolean);
    }
    if (typeof item.image === 'string' && item.image.trim()) {
        return [item.image.trim()];
    }
    return [];
}

export function tierDisplayLabel(tier) {
    const t = normalizeTier(tier);
    if (t === 'premium') return 'Premium';
    if (t === 'featured') return 'Standard';
    return 'Free';
}

export function requiredTierLabel(feature) {
    return tierDisplayLabel(EAT_DRINK_FEATURE_TIERS[feature] || 'free');
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
