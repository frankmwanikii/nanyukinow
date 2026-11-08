/**
 * Per-category Free / Standard / Premium feature breakdown for the public
 * pricing page. Values may be boolean (included / not) or a short string
 * (limit / nuance). Plan keys match Membership: free | featured | premium.
 */

import { mainCategories } from '@/data/categories';

const yes = true;
const no = false;

/** @typedef {'free' | 'featured' | 'premium'} PlanKey */
/** @typedef {boolean | string} CellValue */
/** @typedef {{ id: string, label: string, values: Record<PlanKey, CellValue> }} FeatureRow */

/**
 * @type {Record<string, { key: string, slug: string, label: string, blurb: string, rows: FeatureRow[] }>}
 */
export const PRICING_CATEGORY_BREAKDOWNS = {
    eatDrink: {
        key: 'eatDrink',
        slug: 'eat-drink',
        label: 'Eat & Drink',
        blurb: 'Menus, cuisine, dietary flags, and booking extras for restaurants, cafés, and bars.',
        rows: [
            {
                id: 'basics',
                label: 'Title, logo, cover, area & address',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'description',
                label: 'Description',
                values: {
                    free: 'Up to 150 words',
                    featured: 'Unlimited',
                    premium: 'Unlimited',
                },
            },
            {
                id: 'tagline',
                label: 'Tagline',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'hours_amenities',
                label: 'Hours, amenities & price level',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'cuisine',
                label: 'Cuisine & specialty tags',
                values: {
                    free: 'Up to 5',
                    featured: 'Up to 10',
                    premium: 'Unlimited',
                },
            },
            {
                id: 'gallery',
                label: 'Photo gallery',
                values: {
                    free: '3 photos',
                    featured: '10 photos',
                    premium: '30 photos',
                },
            },
            {
                id: 'phone',
                label: 'Phone number',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'map',
                label: 'Map pin',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'menus',
                label: 'Menus',
                values: {
                    free: no,
                    featured: '5 pages · 5 images each',
                    premium: '15 pages · 15 images each',
                },
            },
            {
                id: 'payments_dietary',
                label: 'Payments, dietary & delivery options',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'contact_web',
                label: 'Email, website, WhatsApp & social',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'video',
                label: 'Video preview',
                values: { free: no, featured: no, premium: yes },
            },
            {
                id: 'booking',
                label: 'Booking / reservation link',
                values: { free: no, featured: no, premium: yes },
            },
            {
                id: 'premium_extras',
                label: 'Deals, live music, avg meal, capacity & dress code',
                values: { free: no, featured: no, premium: yes },
            },
        ],
    },

    stay: {
        key: 'stay',
        slug: 'stay',
        label: 'Stay',
        blurb: 'Room galleries, rates, house rules, and host details for lodges, hotels, and Airbnbs.',
        rows: [
            {
                id: 'basics',
                label: 'Title, logo, cover, area & address',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'description',
                label: 'Description',
                values: {
                    free: 'Up to 150 words',
                    featured: 'Unlimited',
                    premium: 'Unlimited',
                },
            },
            {
                id: 'tagline',
                label: 'Tagline',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'stay_basics',
                label: 'Guests, rooms, beds & baths',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'contact',
                label: 'Phone & email',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'map',
                label: 'Map pin',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'gallery',
                label: 'Room-by-room photo gallery',
                values: {
                    free: no,
                    featured: '15 photos per space',
                    premium: '30 photos per space',
                },
            },
            {
                id: 'rates',
                label: 'Check-in/out, nightly rate & meal plan',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'house',
                label: 'Amenities, house rules, payments & cancellation',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'social',
                label: 'WhatsApp, website & social',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'video',
                label: 'Video preview',
                values: { free: no, featured: no, premium: yes },
            },
            {
                id: 'booking',
                label: 'Booking link',
                values: { free: no, featured: no, premium: yes },
            },
            {
                id: 'premium_extras',
                label: 'Activities, seasonal offers, nearby attractions & host profile',
                values: { free: no, featured: no, premium: yes },
            },
        ],
    },

    thingsToDo: {
        key: 'thingsToDo',
        slug: 'things-to-do',
        label: 'Things to do',
        blurb: 'Duration, difficulty, what’s included, and booking for adventures and experiences.',
        rows: [
            {
                id: 'basics',
                label: 'Title, cover, area & address',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'description',
                label: 'Description',
                values: {
                    free: 'Up to 150 words',
                    featured: 'Unlimited',
                    premium: 'Unlimited',
                },
            },
            {
                id: 'activity_basics',
                label: 'Duration, difficulty & pricing options',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'hours_phone',
                label: 'Hours & phone',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'tagline',
                label: 'Tagline',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'map',
                label: 'Map pin',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'details',
                label: 'Min age, group size, included & what to bring',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'gallery',
                label: 'Photo gallery',
                values: {
                    free: no,
                    featured: '8 photos',
                    premium: '30 photos',
                },
            },
            {
                id: 'logo_amenities',
                label: 'Logo, amenities & payments',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'contact',
                label: 'Email & social',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'video',
                label: 'Video preview',
                values: { free: no, featured: no, premium: yes },
            },
            {
                id: 'premium_contact',
                label: 'WhatsApp, website & extra links',
                values: { free: no, featured: no, premium: yes },
            },
            {
                id: 'booking_deals',
                label: 'Booking link & deals',
                values: { free: no, featured: no, premium: yes },
            },
        ],
    },

    services: {
        key: 'services',
        slug: 'services',
        label: 'Services',
        blurb: 'Offerings, portfolio, credentials, and booking for guides, clinics, and local pros.',
        rows: [
            {
                id: 'basics',
                label: 'Title, cover, area & address',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'description',
                label: 'Description',
                values: {
                    free: 'Up to 150 words',
                    featured: 'Unlimited',
                    premium: 'Unlimited',
                },
            },
            {
                id: 'service_basics',
                label: 'Service area, offerings & pricing from',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'hours_phone',
                label: 'Hours & phone',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'tagline',
                label: 'Tagline',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'map',
                label: 'Map pin',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'creds',
                label: 'Response time, credentials & portfolio',
                values: {
                    free: no,
                    featured: 'Up to 5 portfolio items',
                    premium: 'Up to 25 portfolio items',
                },
            },
            {
                id: 'gallery',
                label: 'Photo gallery',
                values: {
                    free: no,
                    featured: '8 photos',
                    premium: '30 photos',
                },
            },
            {
                id: 'logo_pay',
                label: 'Logo, amenities, payments, email & social',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'video',
                label: 'Video preview',
                values: { free: no, featured: no, premium: yes },
            },
            {
                id: 'premium_contact',
                label: 'WhatsApp, website & extra links',
                values: { free: no, featured: no, premium: yes },
            },
            {
                id: 'booking_deals',
                label: 'Booking link & deals',
                values: { free: no, featured: no, premium: yes },
            },
        ],
    },

    shopping: {
        key: 'shopping',
        slug: 'shopping',
        label: 'Shopping',
        blurb: 'Products, brands, delivery, catalogues, and store links for shops and markets.',
        rows: [
            {
                id: 'basics',
                label: 'Title, cover, area & address',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'description',
                label: 'Description',
                values: {
                    free: 'Up to 150 words',
                    featured: 'Unlimited',
                    premium: 'Unlimited',
                },
            },
            {
                id: 'hours_price_phone',
                label: 'Hours, price level & phone',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'tagline',
                label: 'Tagline',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'specialty',
                label: 'Specialty, brands, delivery & return policy',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'map',
                label: 'Map pin',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'products',
                label: 'Product catalogue',
                values: {
                    free: no,
                    featured: 'Up to 5 products',
                    premium: 'Up to 50 products',
                },
            },
            {
                id: 'gallery',
                label: 'Photo gallery',
                values: {
                    free: no,
                    featured: '5 photos',
                    premium: '50 photos',
                },
            },
            {
                id: 'logo_pay',
                label: 'Logo, amenities, payments, email & social',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'video',
                label: 'Video preview',
                values: { free: no, featured: no, premium: yes },
            },
            {
                id: 'premium_contact',
                label: 'WhatsApp, website & extra links',
                values: { free: no, featured: no, premium: yes },
            },
            {
                id: 'store_extras',
                label: 'WhatsApp catalogue, online store, price list & deals',
                values: { free: no, featured: no, premium: yes },
            },
        ],
    },

    properties: {
        key: 'properties',
        slug: 'properties',
        label: 'Properties',
        blurb: 'Beds, baths, floor plans, agent details, and enquiry links for sale and rent.',
        rows: [
            {
                id: 'basics',
                label: 'Title, cover, area & address',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'description',
                label: 'Description',
                values: {
                    free: 'Up to 150 words',
                    featured: 'Unlimited',
                    premium: 'Unlimited',
                },
            },
            {
                id: 'property_basics',
                label: 'Property type, bedrooms, bathrooms & price',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'phone',
                label: 'Phone number',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'tagline',
                label: 'Tagline',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'map',
                label: 'Map pin',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'specs',
                label: 'Size, furnished, parking, year built & highlights',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'gallery',
                label: 'Photo gallery',
                values: {
                    free: no,
                    featured: '10 photos',
                    premium: '40 photos',
                },
            },
            {
                id: 'agent',
                label: 'Amenities, payments, agent & email / social',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'video',
                label: 'Video preview',
                values: { free: no, featured: no, premium: yes },
            },
            {
                id: 'premium_contact',
                label: 'WhatsApp, website & extra links',
                values: { free: no, featured: no, premium: yes },
            },
            {
                id: 'premium_docs',
                label: 'Virtual tour, floor plan & enquiry link',
                values: { free: no, featured: no, premium: yes },
            },
        ],
    },

    events: {
        key: 'events',
        slug: 'events',
        label: 'Events',
        blurb: 'Agenda, tickets, sponsors, and doors info for concerts, markets, and meetups.',
        rows: [
            {
                id: 'basics',
                label: 'Title, cover, area & address',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'description',
                label: 'Description',
                values: {
                    free: 'Up to 150 words',
                    featured: 'Unlimited',
                    premium: 'Unlimited',
                },
            },
            {
                id: 'event_basics',
                label: 'Organiser, date/time & venue',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'phone',
                label: 'Phone number',
                values: { free: yes, featured: yes, premium: yes },
            },
            {
                id: 'tagline',
                label: 'Tagline',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'map',
                label: 'Map pin',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'details',
                label: 'Age limit, doors open & dress code',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'agenda',
                label: 'Agenda / lineup',
                values: {
                    free: no,
                    featured: 'Up to 10 items',
                    premium: 'Up to 40 items',
                },
            },
            {
                id: 'tickets',
                label: 'Ticket prices',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'gallery',
                label: 'Photo gallery',
                values: {
                    free: no,
                    featured: '8 photos',
                    premium: '30 photos',
                },
            },
            {
                id: 'logo_pay',
                label: 'Logo, amenities, payments, email & social',
                values: { free: no, featured: yes, premium: yes },
            },
            {
                id: 'video',
                label: 'Video preview',
                values: { free: no, featured: no, premium: yes },
            },
            {
                id: 'premium_contact',
                label: 'WhatsApp, website & extra links',
                values: { free: no, featured: no, premium: yes },
            },
            {
                id: 'sponsors',
                label: 'Sponsors',
                values: {
                    free: no,
                    featured: no,
                    premium: 'Up to 20',
                },
            },
            {
                id: 'ticket_url',
                label: 'Ticket purchase link',
                values: { free: no, featured: no, premium: yes },
            },
        ],
    },
};

export const PRICING_CATEGORY_OPTIONS = mainCategories.map((cat) => {
    const breakdown = PRICING_CATEGORY_BREAKDOWNS[cat.key];
    return {
        key: cat.key,
        slug: cat.slug,
        label: cat.label,
        blurb: breakdown?.blurb || `Listing fields for ${cat.label}.`,
    };
});

/**
 * @param {string | null | undefined} keyOrSlug
 */
export function getPricingCategoryBreakdown(keyOrSlug) {
    if (!keyOrSlug) return null;
    const direct = PRICING_CATEGORY_BREAKDOWNS[keyOrSlug];
    if (direct) return direct;
    return (
        Object.values(PRICING_CATEGORY_BREAKDOWNS).find(
            (item) => item.slug === keyOrSlug,
        ) || null
    );
}

/**
 * @param {PlanKey | string} planKey
 * @returns {PlanKey}
 */
export function normalizePlanKey(planKey) {
    if (planKey === 'premium') return 'premium';
    if (planKey === 'featured' || planKey === 'standard') return 'featured';
    return 'free';
}

/**
 * Human label for a matrix cell.
 * @param {CellValue} value
 */
export function formatCellValue(value) {
    if (value === true) return 'Included';
    if (value === false || value == null) return null;
    return String(value);
}

/**
 * Whether a plan includes this feature (any truthy / string value).
 * @param {CellValue} value
 */
export function cellIncluded(value) {
    return value === true || (typeof value === 'string' && value.length > 0);
}

/**
 * Turn a matrix label + cell into a natural, dash-free bullet.
 * e.g. Description + Unlimited → "Unlimited description"
 *      Photo gallery + 3 photos → "Photo gallery with 3 photos"
 * @param {string} label
 * @param {CellValue} value
 */
export function formatInclusionPhrase(label, value) {
    if (value === true) {
        return label;
    }

    const detail = String(value || '')
        .trim()
        .replace(/\s*·\s*/g, ' and ');
    if (!detail) {
        return label;
    }

    const lowerLabel =
        label.length > 0
            ? label.charAt(0).toLowerCase() + label.slice(1)
            : label;

    if (/^unlimited$/i.test(detail)) {
        return `Unlimited ${lowerLabel}`;
    }

    if (/^up to \d+\s+words?$/i.test(detail)) {
        return `${label} ${detail.toLowerCase()}`;
    }

    if (/^up to \d+$/i.test(detail)) {
        return `${detail} ${lowerLabel}`;
    }

    if (/^up to \d+\s+/i.test(detail)) {
        return detail;
    }

    if (/photos?/i.test(detail) || /pages?/i.test(detail) || /images?/i.test(detail)) {
        return `${label} with ${detail}`;
    }

    return `${label} with ${detail}`;
}

/**
 * Display name for a plan key on public pricing cards.
 * @param {PlanKey | string} planKey
 */
export function planDisplayName(planKey) {
    const tier = normalizePlanKey(planKey);
    if (tier === 'featured') {
        return 'Standard';
    }
    if (tier === 'premium') {
        return 'Premium';
    }
    return 'Free';
}

/**
 * Bullet list for a plan card.
 * Free lists its features. Higher tiers lead with “Everything in {lower}”
 * then only the extras/upgrades for that tier (natural wording, no dashes).
 * @param {FeatureRow[]} rows
 * @param {PlanKey | string} planKey
 * @returns {string[]}
 */
export function categoryInclusionsForPlan(rows = [], planKey) {
    const tier = normalizePlanKey(planKey);
    const order = ['free', 'featured', 'premium'];
    const tierIndex = order.indexOf(tier);
    const bullets = [];

    if (tierIndex > 0) {
        bullets.push(`Everything in ${planDisplayName(order[tierIndex - 1])}`);
    }

    if (tier === 'featured') {
        bullets.push('Featured badge');
    } else if (tier === 'premium') {
        bullets.push('Premium badge');
    }

    rows.forEach((row) => {
        const value = row.values[tier];
        if (!cellIncluded(value)) {
            return;
        }

        if (tierIndex > 0) {
            const prev = row.values[order[tierIndex - 1]];
            const isNew =
                !cellIncluded(prev) ||
                (typeof value === 'string' && value !== prev);
            if (!isNew) {
                return;
            }
        }

        bullets.push(formatInclusionPhrase(row.label, value));
    });

    return bullets;
}
