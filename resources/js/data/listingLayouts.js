/**
 * Per-category section order for listing detail pages.
 * Omit a key (or leave detail data empty) and the section collapses —
 * live listings never invent placeholder content for empty fields.
 *
 * About is always first in `main` so it leads the Overview on every
 * category (mobile and desktop).
 */

/** Shared page tabs — Overview = full listing, Contact & Reviews are dedicated pages. */
export const listingPageTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'contact', label: 'Contact info' },
    { id: 'reviews', label: 'Reviews' },
];

/** Shopping adds a Products tab between Contact and Reviews. */
export const shoppingPageTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'contact', label: 'Contact info' },
    { id: 'products', label: 'Products' },
    { id: 'reviews', label: 'Reviews' },
];

export const categoryLayouts = {
    eatDrink: {
        subnav: listingPageTabs,
        main: [
            'about',
            'visualTour',
            'video',
            'deals',
            'menus',
            'facts',
            'amenities',
            'eventSchedule',
            'chips',
        ],
        side: ['map', 'hours', 'payments'],
        ctaSecondary: 'View menu',
    },
    stay: {
        subnav: listingPageTabs,
        main: [
            'about',
            'visualTour',
            'video',
            'deals',
            'facts',
            'amenities',
            'included',
            'highlights',
            'houseRules',
            'chips',
        ],
        side: ['map', 'hours', 'payments', 'host'],
        ctaSecondary: 'Check availability',
    },
    thingsToDo: {
        subnav: listingPageTabs,
        main: [
            'about',
            'visualTour',
            'video',
            'facts',
            'included',
            'bring',
            'amenities',
            'chips',
        ],
        side: ['map', 'hours', 'payments'],
        ctaSecondary: 'Enquire',
    },
    services: {
        subnav: listingPageTabs,
        main: [
            'about',
            'offerings',
            'facts',
            'credentials',
            'visualTour',
            'video',
            'chips',
        ],
        side: ['map', 'hours', 'payments'],
        ctaSecondary: 'Request service',
    },
    shopping: {
        subnav: shoppingPageTabs,
        main: ['about', 'visualTour', 'video', 'chips', 'amenities', 'brands'],
        side: ['map', 'hours', 'payments'],
        ctaSecondary: 'Call store',
    },
    properties: {
        subnav: listingPageTabs,
        main: [
            'about',
            'visualTour',
            'video',
            'facts',
            'amenities',
            'highlights',
            'chips',
        ],
        side: ['agent', 'map', 'payments'],
        ctaSecondary: 'Contact agent',
    },
    events: {
        subnav: listingPageTabs,
        main: [
            'about',
            'visualTour',
            'eventWhen',
            'eventWhere',
            'eventTickets',
            'amenities',
            'sponsors',
            'agenda',
            'video',
            'chips',
        ],
        side: ['map', 'eventSchedule', 'payments'],
        ctaSecondary: 'Get tickets',
    },
};

export function getLayoutForCategory(categoryKey) {
    return categoryLayouts[categoryKey] ?? categoryLayouts.eatDrink;
}
