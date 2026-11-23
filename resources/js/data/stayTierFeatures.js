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
    { value: 'restaurant', label: 'Restaurant' },
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
    room_types: 'free',
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

/** Max room-type cards by plan. */
export const ROOM_TYPE_LIMITS = {
    free: 4,
    featured: 8,
    premium: 12,
};

/** Max photos per room-type card by plan. */
export const ROOM_TYPE_IMAGES_PER_ITEM = {
    free: 3,
    featured: 5,
    premium: 8,
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

export function stayRoomTypeLimit(tier) {
    return ROOM_TYPE_LIMITS[normalizeTier(tier)] ?? ROOM_TYPE_LIMITS.free;
}

export function stayRoomTypeImagesPerItem(tier) {
    return (
        ROOM_TYPE_IMAGES_PER_ITEM[normalizeTier(tier)] ??
        ROOM_TYPE_IMAGES_PER_ITEM.free
    );
}

export function stayRoomTypeHelp(tier) {
    const types = stayRoomTypeLimit(tier);
    const photos = stayRoomTypeImagesPerItem(tier);
    const plan = tierDisplayLabel(tier);
    return `${plan}: up to ${types} room types, ${photos} photos each. Pick a popular title or type your own, then add price and photos.`;
}

/** Normalize a room-type item's image list (supports legacy single `image`). */
export function roomTypeItemImages(item) {
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

/**
 * @param {unknown} value
 * @returns {string[]}
 */
export function coerceRoomTypeAmenities(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    const slugs = [];
    for (const entry of value) {
        let slug = '';
        if (typeof entry === 'string') {
            slug = entry.trim();
        } else if (entry && typeof entry === 'object') {
            slug = String(entry.slug || entry.key || '').trim();
        }
        if (!slug || slugs.includes(slug)) {
            continue;
        }
        slugs.push(slug);
        if (slugs.length >= 40) {
            break;
        }
    }

    return slugs;
}

/**
 * Coerce legacy string tags and partial objects into room-type cards.
 * @param {unknown} value
 * @returns {Array<{ title: string, price: string, description: string, images: string[], amenities: string[] }>}
 */
export function coerceRoomTypes(value) {
    if (!Array.isArray(value)) {
        if (typeof value === 'string' && value.trim()) {
            return value
                .split(/[,|]+/)
                .map((part) => part.trim())
                .filter(Boolean)
                .map((title) => ({
                    title,
                    price: '',
                    description: '',
                    images: [],
                    amenities: [],
                }));
        }
        return [];
    }

    return value
        .map((item) => {
            if (typeof item === 'string') {
                const title = item.trim();
                return title
                    ? {
                          title,
                          price: '',
                          description: '',
                          images: [],
                          amenities: [],
                      }
                    : null;
            }
            if (!item || typeof item !== 'object') return null;
            const title = String(item.title || item.name || item.label || '').trim();
            const price = String(item.price || item.rate || item.amount || '').trim();
            const description = String(
                item.description || item.note || item.summary || '',
            ).trim();
            const images = roomTypeItemImages(item);
            const amenities = coerceRoomTypeAmenities(item.amenities);

            // Keep empty object drafts so "Add room type" rows stay editable
            // in the form. Server-side normalize still drops blank rows on save.
            return { title, price, description, images, amenities };
        })
        .filter(Boolean);
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
    if (match) return match.label;
    const raw = String(kind || '')
        .trim()
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ');
    if (!raw) return 'Room';
    return raw.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function isDefaultStayGallerySpace(kind) {
    return STAY_GALLERY_SPACES.some((s) => s.value === kind);
}

/** Collect custom room tabs from saved gallery items. */
export function customSpacesFromGallery(items = []) {
    const extras = [];
    for (const item of items) {
        const kind = typeof item?.kind === 'string' ? item.kind.trim() : '';
        if (!kind || isDefaultStayGallerySpace(kind)) continue;
        if (extras.some((s) => s.value === kind)) continue;
        extras.push({
            value: kind,
            label: item.label || staySpaceLabel(kind),
        });
    }
    return extras;
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
