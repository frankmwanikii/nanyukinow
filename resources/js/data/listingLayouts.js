/**
 * Per-category section order for listing detail pages.
 * Omit a key (or leave detail data empty) and DetailSection collapses cleanly.
 */

export const categoryLayouts = {
    eatDrink: {
        subnav: [
            { id: 'overview', label: 'Overview' },
            { id: 'gallery', label: 'Gallery' },
            { id: 'contact', label: 'Contact' },
            { id: 'reviews', label: 'Reviews' },
        ],
        main: [
            'visualTour',
            'video',
            'amenities',
            'chips',
            'priceRange',
            'docs',
            'reviews',
        ],
        side: ['about', 'map', 'hours', 'payments'],
        ctaSecondary: 'View menu',
    },
    stay: {
        subnav: [
            { id: 'overview', label: 'Overview' },
            { id: 'gallery', label: 'Rooms & spaces' },
            { id: 'contact', label: 'Contact' },
            { id: 'reviews', label: 'Reviews' },
        ],
        main: [
            'visualTour',
            'video',
            'facts',
            'amenities',
            'houseRules',
            'chips',
            'reviews',
        ],
        side: ['about', 'map', 'hours', 'payments'],
        ctaSecondary: 'Check availability',
    },
    thingsToDo: {
        subnav: [
            { id: 'overview', label: 'Overview' },
            { id: 'gallery', label: 'Gallery' },
            { id: 'contact', label: 'Meeting point' },
            { id: 'reviews', label: 'Reviews' },
        ],
        main: [
            'visualTour',
            'video',
            'facts',
            'included',
            'bring',
            'amenities',
            'chips',
            'reviews',
        ],
        side: ['about', 'map', 'hours', 'payments'],
        ctaSecondary: 'Enquire',
    },
    services: {
        subnav: [
            { id: 'overview', label: 'Overview' },
            { id: 'gallery', label: 'Gallery' },
            { id: 'contact', label: 'Contact' },
            { id: 'reviews', label: 'Reviews' },
        ],
        main: [
            'offerings',
            'facts',
            'credentials',
            'visualTour',
            'video',
            'chips',
            'reviews',
        ],
        side: ['about', 'map', 'hours', 'payments'],
        ctaSecondary: 'Request service',
    },
    shopping: {
        subnav: [
            { id: 'overview', label: 'Overview' },
            { id: 'gallery', label: 'Store' },
            { id: 'contact', label: 'Contact' },
            { id: 'reviews', label: 'Reviews' },
        ],
        main: [
            'visualTour',
            'video',
            'chips',
            'amenities',
            'brands',
            'reviews',
        ],
        side: ['about', 'map', 'hours', 'payments'],
        ctaSecondary: 'Call store',
    },
    properties: {
        subnav: [
            { id: 'overview', label: 'Overview' },
            { id: 'gallery', label: 'Spaces' },
            { id: 'contact', label: 'Agent' },
            { id: 'reviews', label: 'Reviews' },
        ],
        main: [
            'visualTour',
            'video',
            'facts',
            'amenities',
            'floorPlan',
            'chips',
            'reviews',
        ],
        side: ['about', 'agent', 'map', 'payments'],
        ctaSecondary: 'Contact agent',
    },
    events: {
        subnav: [
            { id: 'overview', label: 'Overview' },
            { id: 'gallery', label: 'Gallery' },
            { id: 'contact', label: 'Venue' },
            { id: 'reviews', label: 'Reviews' },
        ],
        main: [
            'facts',
            'agenda',
            'visualTour',
            'video',
            'chips',
            'reviews',
        ],
        side: ['about', 'map', 'eventSchedule', 'payments'],
        ctaSecondary: 'Get tickets',
    },
};

export function getLayoutForCategory(categoryKey) {
    return categoryLayouts[categoryKey] ?? categoryLayouts.eatDrink;
}
