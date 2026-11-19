/**
 * Category-specific form field definitions for the listing wizard.
 * Keys match CategoryKey / mainCategories keys.
 */

export { CAPACITY_AREAS } from '@/utils/eatDrinkDetails';

export const PRICE_LEVELS = [
    { value: '$', label: 'Budget ($)' },
    { value: '$$', label: 'Moderate ($$)' },
    { value: '$$$', label: 'Pricey ($$$)' },
    { value: '$$$$', label: 'Luxury ($$$$)' },
];

export const PAYMENT_OPTIONS = [
    'Cash',
    'M-Pesa',
    'Card',
    'Paybill',
    'Bank transfer',
];

/** Popular Eat & Drink cuisine / specialty suggestions. */
export const POPULAR_CUISINES = [
    'Kenyan',
    'Nyama Choma',
    'Coastal',
    'Chinese',
    'Indian',
    'Italian',
    'Continental',
    'Ethiopian',
    'Thai',
    'Japanese',
    'Mexican',
    'Seafood',
    'BBQ',
    'Grill',
    'Pizza',
    'Fast food',
    'Cafe',
    'Bakery',
    'Vegetarian',
    'Vegan',
    'African',
    'Fusion',
];

/** Popular dietary options for Eat & Drink. */
export const POPULAR_DIETARY_OPTIONS = [
    'Halal',
    'Vegan',
    'Vegetarian',
    'Gluten-free',
    'Dairy-free',
    'Nut-free',
    'Kosher',
    'Pescatarian',
    'Low sugar',
    'Kid-friendly',
];

/** Popular delivery / service options for Eat & Drink. */
export const POPULAR_DELIVERY_OPTIONS = [
    'Dine-in',
    'Takeaway',
    'Delivery',
    'Delivery (town only)',
    'Uber Eats / Glovo',
    'Reservations',
    'Outdoor seating',
    'Drive-through',
];

/** Shopping delivery & fulfilment suggestions. */
export const POPULAR_SHOPPING_DELIVERY_OPTIONS = [
    'In-store pickup',
    'Local rider delivery',
    'Countrywide parcels',
    'Same-day town delivery',
    'Wholesale dispatch',
    'Not available',
];

/** Wholesale vs. retail options for shopping listings. */
export const POPULAR_WHOLESALE_RETAIL_OPTIONS = [
    'Retail only',
    'Wholesale only',
    'Wholesale & retail',
    'Trade accounts welcome',
    'Minimum order for wholesale',
];

/** Popular dress codes for Eat & Drink. */
export const POPULAR_DRESS_CODES = [
    'Casual',
    'Smart casual',
    'Business casual',
    'Formal',
    'Black tie',
    'Resort wear',
    'No dress code',
];

/** Meal / board basis options for Stay. */
export const MEAL_PLAN_OPTIONS = [
    'Self-catering',
    'Bed & breakfast (B&B)',
    'Half board',
    'Full board',
    'All inclusive',
    'Room only',
];

/** Cancellation policy suggestions for Stay. */
export const CANCELLATION_OPTIONS = [
    'Free cancellation up to 24 hours before check-in',
    'Free cancellation up to 48 hours before check-in',
    'Free cancellation up to 7 days before check-in',
    'Non-refundable',
    '50% refund up to 48 hours before check-in',
    'Contact host for cancellation terms',
];

/** Popular Stay activities / experiences. */
export const POPULAR_STAY_ACTIVITIES = [
    'Game drives',
    'Spa access',
    'Guided walks',
    'Horse riding',
    'Mountain biking',
    'Yoga',
    'Bird watching',
    'Cultural visits',
    'Bush breakfast',
    'Sundowners',
    'Pool access',
    'Farm tour',
];

/** Popular nearby attractions for Stay. */
export const POPULAR_NEARBY_ATTRACTIONS = [
    'Mount Kenya',
    'Ol Pejeta Conservancy',
    'Nanyuki town',
    'Equator marker',
    'Ngare Ndare Forest',
    'Solio Ranch',
    'Aberdare National Park',
    'Timau',
    'Naromoru',
    'Trout tree / river',
];

/**
 * @typedef {{ key: string, label: string, type: string, placeholder?: string, options?: string[], required?: boolean, help?: string }} DetailField
 */

/** @type {Record<string, DetailField[]>} */
export const CATEGORY_DETAIL_FIELDS = {
    eatDrink: [
        {
            key: 'cuisine',
            label: 'Cuisine / specialty',
            type: 'cuisine',
            placeholder: 'Search or type a cuisine…',
            required: true,
            help: 'Pick popular options or type your own.',
            minTier: 'free',
        },
        {
            key: 'dietary',
            label: 'Dietary options',
            type: 'suggest',
            optionsKey: 'dietary',
            placeholder: 'Search dietary options or type your own…',
            help: 'Help diners filter for Halal, vegan, and other needs.',
            minTier: 'featured',
        },
        {
            key: 'delivery_options',
            label: 'Delivery & takeaway',
            type: 'suggest',
            optionsKey: 'delivery',
            placeholder: 'Search service options or type your own…',
            help: 'How guests can order or enjoy your food.',
            minTier: 'featured',
        },
        {
            key: 'reservations',
            label: 'Reservations',
            type: 'select',
            options: ['Recommended', 'Required', 'Walk-ins welcome', 'Not needed'],
            minTier: 'featured',
        },
        {
            key: 'booking_url',
            label: 'Reservation / booking link',
            type: 'text',
            placeholder: 'WhatsApp link or booking page URL',
            help: 'Direct WhatsApp chat or booking widget for table requests.',
            minTier: 'premium',
        },
        {
            key: 'avg_meal',
            label: 'Average meal cost',
            type: 'number',
            prefix: 'KES',
            min: 0,
            step: 50,
            placeholder: '1200',
            help: 'Typical cost per person in Kenyan shillings.',
            minTier: 'premium',
        },
        {
            key: 'capacity',
            label: 'Seating capacity',
            type: 'capacity',
            help: 'Enter seat counts only — areas are labelled for you.',
            minTier: 'premium',
        },
        {
            key: 'dress_code',
            label: 'Dress code',
            type: 'suggest',
            optionsKey: 'dress_code',
            placeholder: 'Search dress codes or type your own…',
            help: 'Pick one or more, or add a custom code.',
            minTier: 'premium',
        },
    ],
    stay: [
        // Free — basic stay details
        {
            key: 'guests',
            label: 'Max guests',
            type: 'text',
            placeholder: 'e.g. 4',
            required: true,
            minTier: 'free',
        },
        {
            key: 'rooms',
            label: 'Rooms / units',
            type: 'text',
            placeholder: 'e.g. 3 bedrooms',
            minTier: 'free',
        },
        {
            key: 'beds',
            label: 'Beds',
            type: 'text',
            placeholder: 'e.g. 2 doubles, 1 twin',
            minTier: 'free',
        },
        {
            key: 'baths',
            label: 'Bathrooms',
            type: 'text',
            placeholder: 'e.g. 2',
            minTier: 'free',
        },
        // Standard
        {
            key: 'check_in',
            label: 'Check-in',
            type: 'time',
            required: true,
            minTier: 'featured',
        },
        {
            key: 'check_out',
            label: 'Check-out',
            type: 'time',
            required: true,
            minTier: 'featured',
        },
        {
            key: 'nightly_rate',
            label: 'Exact price per night',
            type: 'text',
            placeholder: 'e.g. KES 8,500',
            help: 'Base rate guests see on your listing.',
            minTier: 'featured',
        },
        {
            key: 'meal_plan',
            label: 'Meal plan / board basis',
            type: 'select',
            options: [
                'Self-catering',
                'Bed & breakfast (B&B)',
                'Half board',
                'Full board',
                'All inclusive',
                'Room only',
            ],
            help: 'What meals are included with a stay.',
            minTier: 'featured',
        },
        {
            key: 'house_rules',
            label: 'House rules',
            type: 'richtext',
            placeholder: 'Quiet hours, pets, smoking, check-in notes…',
            help: 'Shown on the listing page. Use lists for clear rules.',
            minTier: 'featured',
        },
        {
            key: 'cancellation_policy',
            label: 'Cancellation policy',
            type: 'select',
            options: [
                'Free cancellation up to 24 hours before check-in',
                'Free cancellation up to 48 hours before check-in',
                'Free cancellation up to 7 days before check-in',
                'Non-refundable',
                '50% refund up to 48 hours before check-in',
                'Contact host for cancellation terms',
            ],
            help: 'Shown to guests before they enquire or book.',
            minTier: 'featured',
        },
        // Premium
        {
            key: 'booking_url',
            label: 'Direct booking link',
            type: 'text',
            placeholder: 'Airbnb, Booking.com, or your booking engine URL',
            help: 'Shown as a book-now button on your listing.',
            minTier: 'premium',
        },
        {
            key: 'included',
            label: 'Activities / experiences',
            type: 'suggest',
            optionsKey: 'activities',
            placeholder: 'Search activities or type your own…',
            help: 'Game drives, spa access, guided walks, and more.',
            minTier: 'premium',
        },
        {
            key: 'nearby_attractions',
            label: 'Nearby attractions / distances',
            type: 'suggest',
            optionsKey: 'nearby',
            placeholder: 'Search attractions or type your own…',
            help: 'e.g. Ol Pejeta — 25 min, Mount Kenya — day trip.',
            minTier: 'premium',
        },
        {
            key: 'host_name',
            label: 'Host name',
            type: 'text',
            placeholder: 'Who hosts this stay?',
            help: 'For Airbnbs and villas — shown on the listing page.',
            minTier: 'premium',
        },
        {
            key: 'host_bio',
            label: 'Host bio',
            type: 'richtext',
            placeholder: 'A short intro about the host…',
            help: 'Help guests feel confident booking with you.',
            minTier: 'premium',
        },
    ],
    thingsToDo: [
        {
            key: 'duration',
            label: 'Duration',
            type: 'text',
            placeholder: 'e.g. Half day, 3 hours',
            required: true,
            minTier: 'free',
        },
        {
            key: 'difficulty',
            label: 'Difficulty',
            type: 'select',
            options: ['Easy', 'Moderate', 'Challenging', 'All levels'],
            required: true,
            minTier: 'free',
        },
        {
            key: 'price_from',
            label: 'Pricing',
            type: 'pricing',
            help: 'Add each visitor type and its price, for example Kenya adult and Child.',
            minTier: 'free',
        },
        {
            key: 'min_age',
            label: 'Minimum age',
            type: 'text',
            placeholder: 'e.g. 12+',
            minTier: 'featured',
        },
        {
            key: 'group_size',
            label: 'Group size',
            type: 'text',
            placeholder: 'e.g. 2–8 people',
            minTier: 'featured',
        },
        {
            key: 'included',
            label: 'What’s included',
            type: 'tags',
            placeholder: 'Add item and press Enter',
            minTier: 'featured',
        },
        {
            key: 'bring',
            label: 'What to bring',
            type: 'tags',
            placeholder: 'Add item and press Enter',
            minTier: 'featured',
        },
        {
            key: 'booking_url',
            label: 'Booking / enquire link',
            type: 'text',
            placeholder: 'https://… or WhatsApp booking link',
            help: 'Direct guests to book or enquire about this experience.',
            minTier: 'premium',
        },
    ],
    services: [
        {
            key: 'service_area',
            label: 'Service area',
            type: 'text',
            placeholder: 'Nanyuki & surrounds',
            required: true,
            minTier: 'free',
        },
        {
            key: 'pricing_from',
            label: 'Pricing from',
            type: 'text',
            placeholder: 'e.g. KES 2,000 / hour',
            minTier: 'free',
        },
        {
            key: 'offerings',
            label: 'Offerings',
            type: 'tags',
            placeholder: 'Add offering and press Enter',
            required: true,
            minTier: 'free',
        },
        {
            key: 'response_time',
            label: 'Typical response',
            type: 'text',
            placeholder: 'e.g. Within 2 hours',
            minTier: 'featured',
        },
        {
            key: 'credentials',
            label: 'Credentials / licenses',
            type: 'tags',
            placeholder: 'Add credential and press Enter',
            minTier: 'featured',
        },
        {
            key: 'booking_url',
            label: 'Booking / request link',
            type: 'text',
            placeholder: 'https://… or WhatsApp booking link',
            help: 'Where clients can request your service.',
            minTier: 'premium',
        },
    ],
    shopping: [
        {
            key: 'specialty',
            label: 'Specialty',
            type: 'text',
            placeholder: 'e.g. Sneakers, smartphones, kitenge fabrics',
            required: true,
            minTier: 'featured',
        },
        {
            key: 'brands',
            label: 'Brands / makers',
            type: 'tags',
            placeholder: 'Add brand and press Enter',
            minTier: 'featured',
        },
        {
            key: 'delivery_options',
            label: 'Delivery options',
            type: 'suggest',
            optionsKey: 'shopping_delivery',
            placeholder: 'Search delivery options or type your own…',
            help: 'Countrywide parcels, local rider, in-store pickup, and more.',
            minTier: 'featured',
        },
        {
            key: 'return_policy',
            label: 'Returns & warranty',
            type: 'richtext',
            placeholder: 'Exchange windows, warranty terms, and repair policy…',
            minTier: 'featured',
        },
        {
            key: 'wholesale_retail',
            label: 'Wholesale vs. retail',
            type: 'suggest',
            optionsKey: 'wholesale_retail',
            placeholder: 'Who can buy from you?',
            help: 'Retail only, wholesale, or both.',
            minTier: 'featured',
        },
        {
            key: 'whatsapp_catalog_url',
            label: 'WhatsApp catalog link',
            type: 'text',
            placeholder: 'https://wa.me/c/… or catalog URL',
            help: 'Direct chat-to-buy or WhatsApp Business catalog.',
            minTier: 'premium',
        },
        {
            key: 'online_store_url',
            label: 'Online store / e-commerce link',
            type: 'text',
            placeholder: 'https://yourshop.com',
            minTier: 'premium',
        },
        {
            key: 'price_list_pdf',
            label: 'Product catalog / price list (PDF)',
            type: 'text',
            placeholder: 'https://…/price-list.pdf',
            minTier: 'premium',
        },
        {
            key: 'made_to_order',
            label: 'Made-to-order badge',
            type: 'select',
            options: ['', 'Show made-to-order badge'],
            help: 'Highlights custom or made-to-order items on your listing.',
            minTier: 'premium',
        },
    ],
    properties: [
        {
            key: 'bedrooms',
            label: 'Bedrooms',
            type: 'text',
            placeholder: 'e.g. 3',
            required: true,
            minTier: 'free',
        },
        {
            key: 'bathrooms',
            label: 'Bathrooms',
            type: 'text',
            placeholder: 'e.g. 2',
            required: true,
            minTier: 'free',
        },
        {
            key: 'price',
            label: 'Price',
            type: 'text',
            placeholder: 'e.g. KES 18M or KES 45,000 / month',
            required: true,
            minTier: 'free',
        },
        {
            key: 'size_sqm',
            label: 'Size (sqm / acres)',
            type: 'text',
            placeholder: 'e.g. 220 sqm or ½ acre',
            minTier: 'featured',
        },
        {
            key: 'furnished',
            label: 'Furnishing',
            type: 'select',
            options: ['Furnished', 'Semi-furnished', 'Unfurnished', 'N/A'],
            minTier: 'featured',
        },
        {
            key: 'parking_spaces',
            label: 'Parking',
            type: 'text',
            placeholder: 'e.g. 2 cars',
            minTier: 'featured',
        },
        {
            key: 'year_built',
            label: 'Year built',
            type: 'text',
            placeholder: 'e.g. 2019',
            minTier: 'featured',
        },
        {
            key: 'highlights',
            label: 'Highlights',
            type: 'tags',
            placeholder: 'Add highlight and press Enter',
            minTier: 'featured',
        },
        {
            key: 'agent_name',
            label: 'Agent / contact name',
            type: 'text',
            placeholder: 'Who handles viewings?',
            minTier: 'featured',
        },
        {
            key: 'agent_phone',
            label: 'Agent phone',
            type: 'text',
            minTier: 'featured',
        },
        {
            key: 'agent_email',
            label: 'Agent email',
            type: 'email',
            minTier: 'featured',
        },
        {
            key: 'virtual_tour_url',
            label: 'Virtual tour link',
            type: 'text',
            placeholder: 'Matterport, YouTube tour, or 360° link',
            minTier: 'premium',
        },
        {
            key: 'floor_plan_pdf',
            label: 'Floor plan (PDF)',
            type: 'text',
            placeholder: 'https://…/floor-plan.pdf',
            minTier: 'premium',
        },
        {
            key: 'enquiry_url',
            label: 'Enquiry / viewing link',
            type: 'text',
            placeholder: 'https://… or WhatsApp enquiry link',
            minTier: 'premium',
        },
    ],
    events: [
        {
            key: 'organiser',
            label: 'Organiser',
            type: 'text',
            placeholder: 'Who is hosting?',
            required: true,
            minTier: 'free',
        },
        {
            key: 'age_limit',
            label: 'Age limit',
            type: 'text',
            placeholder: 'e.g. 18+, All ages',
            minTier: 'featured',
        },
        {
            key: 'doors_open',
            label: 'Doors open',
            type: 'text',
            placeholder: 'e.g. 18:30',
            minTier: 'featured',
        },
        {
            key: 'dress_code',
            label: 'Dress code',
            type: 'text',
            placeholder: 'Casual, smart…',
            minTier: 'featured',
        },
    ],
};

export function emptyDetailsFor(categoryKey) {
    const fields = CATEGORY_DETAIL_FIELDS[categoryKey] || [];
    const details = {
        payments:
            categoryKey === 'eatDrink' ||
            categoryKey === 'stay' ||
            categoryKey === 'shopping' ||
            categoryKey === 'properties' ||
            categoryKey === 'thingsToDo' ||
            categoryKey === 'services' ||
            categoryKey === 'events'
                ? []
                : ['Cash', 'M-Pesa'],
        video_url: '',
        video_title: '',
        menus: [],
        agenda: [],
        sponsors: [],
        event_schedule: [],
        products: [],
        portfolio: [],
        deals: [],
        host_photo: '',
    };

    fields.forEach((f) => {
        details[f.key] =
            f.type === 'tags' ||
            f.type === 'multi' ||
            f.type === 'cuisine' ||
            f.type === 'suggest' ||
            f.type === 'pricing'
                ? []
                : f.type === 'richtext'
                  ? ''
                  : '';
    });

    if (categoryKey === 'stay') {
        details.check_in = '14:00';
        details.check_out = '10:00';
    }

    return details;
}

export function categoryStepTitle(categoryKey) {
    const map = {
        eatDrink: 'Venue details',
        stay: 'Stay details',
        thingsToDo: 'Experience details',
        services: 'Service details',
        shopping: 'Shop details',
        properties: 'Property details',
        events: 'Event details',
    };
    return map[categoryKey] || 'Details';
}
