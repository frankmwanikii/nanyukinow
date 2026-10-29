/**
 * Top-level browse taxonomy for Nanyuki Now.
 * Nested items are subcategories under each main category.
 */
export const mainCategories = [
    {
        key: 'eatDrink',
        slug: 'eat-drink',
        label: 'Eat & Drink',
        children: [
            'Restaurants',
            'Cafes',
            'Bars & Lounges',
            'Pork Joint & BBQ',
            'Outdoor Dining',
            'Fast Food & Takeaways',
            'Bakery & Desserts',
            'Garden Restaurant',
        ],
    },
    {
        key: 'stay',
        slug: 'stay',
        label: 'Stay',
        children: [
            'Airbnbs',
            'Hotels',
            'Boutique Hotels',
            'Conference Hotels',
            'Luxury Camps',
            'Private Villa',
            'Resorts',
            'Safari Lodges',
            'Serviced Apartments',
            'Lodges & Camps',
        ],
    },
    {
        key: 'thingsToDo',
        slug: 'things-to-do',
        label: 'Things to do',
        children: [
            'Outdoor & Adventure',
            'Wildlife & Nature',
            'Gym & Fitness',
            'Nightlife',
            'Spas & Wellness',
        ],
    },
    {
        key: 'services',
        slug: 'services',
        label: 'Services',
        children: [
            'Tours & Guides',
            'Health & Medical',
            'Finance & Banking',
            'Beauty & Personal Care',
            'Car Hire',
            'Tech & Digital',
            'Creative & Media',
            'Cleaning & Maintenance',
        ],
    },
    {
        key: 'shopping',
        slug: 'shopping',
        label: 'Shopping',
        children: [
            'Supermarkets',
            'Local Shops',
            'Electronics',
            'Mobile Phones & Gadgets',
            'African Fashions',
            'Boutique & Apparel',
            'Party Items',
            'Gifts & Souvenirs',
            'Flower & Decor',
            'Curios & Souvenirs',
        ],
    },
    {
        key: 'properties',
        slug: 'properties',
        label: 'Properties',
        children: ['For Sale', 'For Rent', 'For Lease'],
    },
    {
        key: 'events',
        slug: 'events',
        label: 'Events',
        children: [
            'Music & Entertainment',
            'Faith & Community',
            'Lifestyle & Social',
            'Family & Kids',
            'Seasonal Events',
            'Arts & Culture',
            'Sports & Fitness',
            'Wildlife & Conservation',
            'Charity & Fundraisers',
            'Business & Networking',
            'Outdoor & Adventure',
        ],
    },
];

export const categoryKeys = mainCategories.map((c) => c.key);

/** Building / unit types for property listings (separate from For Sale / Rent / Lease). */
export const PROPERTY_TYPES = [
    'Villa',
    'Bungalow',
    'Maisonette',
    'Apartment',
    'Bedsitter',
    'Studio',
    'Real estate',
    'Townhouse',
    'Duplex',
    'Mansion',
    'Cottage',
    'Farmhouse',
    'Penthouse',
    'Commercial',
    'Warehouse',
    'Office',
];

export function getCategoryByKey(key) {
    return mainCategories.find((c) => c.key === key) ?? null;
}

export function getCategoryBySlug(slug) {
    return mainCategories.find((c) => c.slug === slug) ?? null;
}

export function explorePath({
    category,
    subcategory,
    propertyType,
    q,
    location,
} = {}) {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (subcategory) params.set('subcategory', subcategory);
    if (propertyType) params.set('propertyType', propertyType);
    if (q) params.set('q', q);
    if (location) params.set('location', location);
    const query = params.toString();
    return query ? `/explore?${query}` : '/explore';
}
