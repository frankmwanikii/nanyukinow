/**
 * Per-category section order for listing detail pages.
 * Omit a key (or leave detail data empty) and DetailSection collapses cleanly.
 */

/** Shared page tabs — Overview = full listing, Contact & Reviews are dedicated pages. */
export const listingPageTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'contact', label: 'Contact info' },
    { id: 'reviews', label: 'Reviews' },
];

export const categoryLayouts = {
    eatDrink: {
        subnav: listingPageTabs,
        main: [
            'visualTour',
            'video',
            'amenities',
            'chips',
            'priceRange',
            'docs',
        ],
        side: ['about', 'map', 'hours', 'payments'],
        ctaSecondary: 'View menu',
    },
    stay: {
        subnav: listingPageTabs,
        main: [
            'visualTour',
            'video',
            'facts',
            'amenities',
            'houseRules',
            'chips',
        ],
        side: ['about', 'map', 'hours', 'payments'],
        ctaSecondary: 'Check availability',
    },
    thingsToDo: {
        subnav: listingPageTabs,
        main: [
            'visualTour',
            'video',
            'facts',
            'included',
            'bring',
            'amenities',
            'chips',
        ],
        side: ['about', 'map', 'hours', 'payments'],
        ctaSecondary: 'Enquire',
    },
    services: {
        subnav: listingPageTabs,
        main: [
            'offerings',
            'facts',
            'credentials',
            'visualTour',
            'video',
            'chips',
        ],
        side: ['about', 'map', 'hours', 'payments'],
        ctaSecondary: 'Request service',
    },
    shopping: {
        subnav: listingPageTabs,
        main: ['visualTour', 'video', 'chips', 'amenities', 'brands'],
        side: ['about', 'map', 'hours', 'payments'],
        ctaSecondary: 'Call store',
    },
    properties: {
        subnav: listingPageTabs,
        main: [
            'visualTour',
            'video',
            'facts',
            'amenities',
            'floorPlan',
            'chips',
        ],
        side: ['about', 'agent', 'map', 'payments'],
        ctaSecondary: 'Contact agent',
    },
    events: {
        subnav: listingPageTabs,
        main: ['facts', 'agenda', 'visualTour', 'video', 'chips'],
        side: ['about', 'map', 'eventSchedule', 'payments'],
        ctaSecondary: 'Get tickets',
    },
};

export function getLayoutForCategory(categoryKey) {
    return categoryLayouts[categoryKey] ?? categoryLayouts.eatDrink;
}
