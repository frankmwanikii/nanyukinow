/**
 * Per-category section order for listing detail pages.
 * Omit a key (or leave detail data empty) and the section collapses —
 * live listings never invent placeholder content for empty fields.
 *
 * About is always first in `main` so it leads the Overview on every
 * category (mobile and desktop).
 *
 * Map sits in `main` as Getting here (Stay-style open layout). Side rail
 * keeps hours, payments, host/agent, and event schedule.
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

/** Services adds Services and Portfolio tabs between Contact and Reviews. */
export const servicesPageTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'contact', label: 'Contact info' },
    { id: 'services', label: 'Services' },
    { id: 'portfolio', label: 'Portfolio' },
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
            'map',
        ],
        side: ['hours', 'payments'],
        ctaSecondary: null,
    },
    stay: {
        subnav: listingPageTabs,
        main: [
            'about',
            'visualTour',
            'video',
            'deals',
            'roomTypes',
            'facts',
            'amenities',
            'included',
            'highlights',
            'houseRules',
            'map',
        ],
        side: ['hours', 'payments', 'host'],
        ctaSecondary: 'Check availability',
    },
    thingsToDo: {
        subnav: listingPageTabs,
        main: [
            'about',
            'visualTour',
            'video',
            'deals',
            'facts',
            'charges',
            'included',
            'bring',
            'amenities',
            'map',
        ],
        side: ['hours', 'payments'],
        ctaSecondary: 'Enquire',
    },
    services: {
        subnav: servicesPageTabs,
        main: [
            'about',
            'offerings',
            'facts',
            'credentials',
            'visualTour',
            'video',
            'deals',
            'map',
        ],
        side: ['hours', 'payments'],
        ctaSecondary: 'Request service',
    },
    shopping: {
        subnav: shoppingPageTabs,
        main: [
            'about',
            'visualTour',
            'video',
            'deals',
            'facts',
            'amenities',
            'brands',
            'map',
        ],
        side: ['hours', 'payments'],
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
            'map',
        ],
        side: ['agent', 'payments'],
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
            'eventDressCode',
            'facts',
            'amenities',
            'sponsors',
            'agenda',
            'video',
            'map',
        ],
        side: ['eventSchedule', 'payments', 'eventOrganiser'],
        ctaSecondary: 'Get tickets',
    },
};

export function getLayoutForCategory(categoryKey) {
    return categoryLayouts[categoryKey] ?? categoryLayouts.eatDrink;
}
