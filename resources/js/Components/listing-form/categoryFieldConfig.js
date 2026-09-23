/**
 * Category-specific form field definitions for the listing wizard.
 * Keys match CategoryKey / mainCategories keys.
 */

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

/**
 * @typedef {{ key: string, label: string, type: string, placeholder?: string, options?: string[], required?: boolean, help?: string }} DetailField
 */

/** @type {Record<string, DetailField[]>} */
export const CATEGORY_DETAIL_FIELDS = {
    eatDrink: [
        {
            key: 'cuisine',
            label: 'Cuisine / specialty',
            type: 'text',
            placeholder: 'e.g. Kenyan, Italian, BBQ',
            required: true,
        },
        {
            key: 'dress_code',
            label: 'Dress code',
            type: 'text',
            placeholder: 'Casual, smart casual…',
        },
        {
            key: 'capacity',
            label: 'Seating capacity',
            type: 'text',
            placeholder: 'e.g. 80 indoors, 40 terrace',
        },
        {
            key: 'reservations',
            label: 'Reservations',
            type: 'select',
            options: ['Recommended', 'Required', 'Walk-ins welcome', 'Not needed'],
        },
        {
            key: 'avg_meal',
            label: 'Average meal cost',
            type: 'text',
            placeholder: 'e.g. KES 1,200',
        },
    ],
    stay: [
        {
            key: 'guests',
            label: 'Max guests',
            type: 'text',
            placeholder: 'e.g. 4',
            required: true,
        },
        {
            key: 'rooms',
            label: 'Rooms / units',
            type: 'text',
            placeholder: 'e.g. 3 bedrooms',
        },
        {
            key: 'beds',
            label: 'Beds',
            type: 'text',
            placeholder: 'e.g. 2 doubles, 1 twin',
        },
        {
            key: 'baths',
            label: 'Bathrooms',
            type: 'text',
            placeholder: 'e.g. 2',
        },
        {
            key: 'check_in',
            label: 'Check-in',
            type: 'time',
            required: true,
        },
        {
            key: 'check_out',
            label: 'Check-out',
            type: 'time',
            required: true,
        },
        {
            key: 'nightly_rate',
            label: 'From (nightly)',
            type: 'text',
            placeholder: 'e.g. KES 8,500',
        },
        {
            key: 'house_rules',
            label: 'House rules',
            type: 'tags',
            placeholder: 'Add a rule and press Enter',
            help: 'e.g. No parties, No smoking',
        },
    ],
    thingsToDo: [
        {
            key: 'duration',
            label: 'Duration',
            type: 'text',
            placeholder: 'e.g. Half day, 3 hours',
            required: true,
        },
        {
            key: 'difficulty',
            label: 'Difficulty',
            type: 'select',
            options: ['Easy', 'Moderate', 'Challenging', 'All levels'],
            required: true,
        },
        {
            key: 'min_age',
            label: 'Minimum age',
            type: 'text',
            placeholder: 'e.g. 12+',
        },
        {
            key: 'group_size',
            label: 'Group size',
            type: 'text',
            placeholder: 'e.g. 2–8 people',
        },
        {
            key: 'price_from',
            label: 'From price',
            type: 'text',
            placeholder: 'e.g. KES 3,500 / person',
        },
        {
            key: 'included',
            label: 'What’s included',
            type: 'tags',
            placeholder: 'Add item and press Enter',
        },
        {
            key: 'bring',
            label: 'What to bring',
            type: 'tags',
            placeholder: 'Add item and press Enter',
        },
    ],
    services: [
        {
            key: 'service_area',
            label: 'Service area',
            type: 'text',
            placeholder: 'Nanyuki & surrounds',
            required: true,
        },
        {
            key: 'pricing_from',
            label: 'Pricing from',
            type: 'text',
            placeholder: 'e.g. KES 2,000 / hour',
        },
        {
            key: 'response_time',
            label: 'Typical response',
            type: 'text',
            placeholder: 'e.g. Within 2 hours',
        },
        {
            key: 'offerings',
            label: 'Offerings',
            type: 'tags',
            placeholder: 'Add offering and press Enter',
            required: true,
        },
        {
            key: 'credentials',
            label: 'Credentials / licenses',
            type: 'tags',
            placeholder: 'Add credential and press Enter',
        },
    ],
    shopping: [
        {
            key: 'specialty',
            label: 'Specialty',
            type: 'text',
            placeholder: 'What do you sell?',
            required: true,
        },
        {
            key: 'brands',
            label: 'Brands / makers',
            type: 'tags',
            placeholder: 'Add brand and press Enter',
        },
        {
            key: 'delivery',
            label: 'Delivery',
            type: 'select',
            options: ['Available', 'Town only', 'Pickup only', 'Not available'],
        },
        {
            key: 'return_policy',
            label: 'Returns',
            type: 'text',
            placeholder: 'e.g. 7-day exchange',
        },
    ],
    properties: [
        {
            key: 'bedrooms',
            label: 'Bedrooms',
            type: 'text',
            placeholder: 'e.g. 3',
            required: true,
        },
        {
            key: 'bathrooms',
            label: 'Bathrooms',
            type: 'text',
            placeholder: 'e.g. 2',
            required: true,
        },
        {
            key: 'size_sqm',
            label: 'Size (sqm / acres)',
            type: 'text',
            placeholder: 'e.g. 220 sqm or ½ acre',
        },
        {
            key: 'price',
            label: 'Price',
            type: 'text',
            placeholder: 'e.g. KES 18M or KES 45,000 / month',
            required: true,
        },
        {
            key: 'furnished',
            label: 'Furnishing',
            type: 'select',
            options: ['Furnished', 'Semi-furnished', 'Unfurnished', 'N/A'],
        },
        {
            key: 'parking_spaces',
            label: 'Parking',
            type: 'text',
            placeholder: 'e.g. 2 cars',
        },
        {
            key: 'year_built',
            label: 'Year built',
            type: 'text',
            placeholder: 'e.g. 2019',
        },
        {
            key: 'highlights',
            label: 'Highlights',
            type: 'tags',
            placeholder: 'Add highlight and press Enter',
        },
        {
            key: 'agent_name',
            label: 'Agent / contact name',
            type: 'text',
            placeholder: 'Who handles viewings?',
        },
        {
            key: 'agent_phone',
            label: 'Agent phone',
            type: 'text',
        },
        {
            key: 'agent_email',
            label: 'Agent email',
            type: 'email',
        },
    ],
    events: [
        {
            key: 'organiser',
            label: 'Organiser',
            type: 'text',
            placeholder: 'Who is hosting?',
            required: true,
        },
        {
            key: 'age_limit',
            label: 'Age limit',
            type: 'text',
            placeholder: 'e.g. 18+, All ages',
        },
        {
            key: 'doors_open',
            label: 'Doors open',
            type: 'text',
            placeholder: 'e.g. 18:30',
        },
        {
            key: 'dress_code',
            label: 'Dress code',
            type: 'text',
            placeholder: 'Casual, smart…',
        },
    ],
};

export function emptyDetailsFor(categoryKey) {
    const fields = CATEGORY_DETAIL_FIELDS[categoryKey] || [];
    const details = {
        payments: ['Cash', 'M-Pesa'],
        video_url: '',
    };

    fields.forEach((f) => {
        details[f.key] = f.type === 'tags' ? [] : '';
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
