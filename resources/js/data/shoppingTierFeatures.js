/**
 * Shopping plan gates for the listing wizard.
 * Tiers: free → featured (Standard) → premium
 */

export const TIER_RANK = {
    free: 0,
    featured: 1,
    premium: 2,
};

export const GALLERY_LIMITS = {
    free: 0,
    featured: 5,
    premium: 50,
};

export const PRODUCT_LIMITS = {
    free: 0,
    featured: 5,
    premium: 50,
};

export const FREE_DESCRIPTION_WORD_LIMIT = 150;

/** Feature → minimum tier required */
export const SHOPPING_FEATURE_TIERS = {
    title: 'free',
    cover: 'free',
    area: 'free',
    address: 'free',
    description: 'free',
    hours: 'free',
    price_level: 'free',
    phone: 'free',
    search_priority: 'free',

    description_unlimited: 'featured',
    tagline: 'featured',
    specialty: 'featured',
    brands: 'featured',
    map_location: 'featured',
    delivery_options: 'featured',
    return_policy: 'featured',
    wholesale_retail: 'featured',
    payments: 'featured',
    amenities: 'featured',
    logo: 'featured',
    gallery: 'featured',
    email: 'featured',
    social_contact: 'featured',
    products: 'featured',

    video: 'premium',
    gallery_premium: 'premium',
    whatsapp: 'premium',
    website: 'premium',
    extra_links: 'premium',
    whatsapp_catalog: 'premium',
    online_store: 'premium',
    deals: 'premium',
    price_list: 'premium',
    made_to_order: 'premium',
};

/** Detail keys stripped server-side when tier is too low. */
export const SHOPPING_DETAIL_MIN_TIER = {
    specialty: 'featured',
    brands: 'featured',
    delivery_options: 'featured',
    return_policy: 'featured',
    wholesale_retail: 'featured',
    payments: 'featured',
    products: 'featured',
    video_url: 'premium',
    video_title: 'premium',
    whatsapp_catalog_url: 'premium',
    online_store_url: 'premium',
    price_list_pdf: 'premium',
    made_to_order: 'premium',
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

export function canUseShoppingFeature(tier, feature) {
    const required = SHOPPING_FEATURE_TIERS[feature] || 'free';
    return tierMeets(tier, required);
}

export function shoppingGalleryLimit(tier) {
    return GALLERY_LIMITS[normalizeTier(tier)] ?? GALLERY_LIMITS.free;
}

export function shoppingProductLimit(tier) {
    return PRODUCT_LIMITS[normalizeTier(tier)] ?? PRODUCT_LIMITS.free;
}

export function shoppingDescriptionWordLimit(tier) {
    return tierMeets(tier, 'featured') ? null : FREE_DESCRIPTION_WORD_LIMIT;
}

export function shoppingProductHelp(tier) {
    const limit = shoppingProductLimit(tier);
    const plan = tierDisplayLabel(tier);
    if (!limit) {
        return 'Showcase individual products on your Products tab.';
    }
    return `${plan}: up to ${limit} showcased products. Premium unlocks a larger catalog.`;
}

export function tierDisplayLabel(tier) {
    const t = normalizeTier(tier);
    if (t === 'premium') return 'Premium';
    if (t === 'featured') return 'Standard';
    return 'Free';
}
