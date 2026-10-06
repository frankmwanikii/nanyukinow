/**
 * Resolve Free / Standard / Premium gates for any tiered listing category.
 */

import EatDrinkTierUpsell from '@/Components/listing-form/EatDrinkTierUpsell';
import StayTierUpsell from '@/Components/listing-form/StayTierUpsell';
import ShoppingTierUpsell from '@/Components/listing-form/ShoppingTierUpsell';
import PropertiesTierUpsell from '@/Components/listing-form/PropertiesTierUpsell';
import ThingsToDoTierUpsell from '@/Components/listing-form/ThingsToDoTierUpsell';
import ServicesTierUpsell from '@/Components/listing-form/ServicesTierUpsell';
import EventsTierUpsell from '@/Components/listing-form/EventsTierUpsell';
import {
    canUseEatDrinkFeature,
    eatDrinkDescriptionWordLimit,
    eatDrinkGalleryLimit,
    normalizeTier as normalizeEatDrinkTier,
    tierDisplayLabel as eatDrinkTierDisplayLabel,
} from '@/data/eatDrinkTierFeatures';
import {
    canUseStayFeature,
    normalizeTier as normalizeStayTier,
    stayDescriptionWordLimit,
    stayGalleryLimit,
    stayGalleryPerRoomLimit,
    tierDisplayLabel as stayTierDisplayLabel,
} from '@/data/stayTierFeatures';
import {
    canUseShoppingFeature,
    normalizeTier as normalizeShoppingTier,
    shoppingDescriptionWordLimit,
    shoppingGalleryLimit,
    tierDisplayLabel as shoppingTierDisplayLabel,
} from '@/data/shoppingTierFeatures';
import {
    canUsePropertiesFeature,
    normalizeTier as normalizePropertiesTier,
    propertiesDescriptionWordLimit,
    propertiesGalleryLimit,
    tierDisplayLabel as propertiesTierDisplayLabel,
} from '@/data/propertiesTierFeatures';
import {
    canUseThingsToDoFeature,
    normalizeTier as normalizeThingsToDoTier,
    thingsToDoDescriptionWordLimit,
    thingsToDoGalleryLimit,
    tierDisplayLabel as thingsToDoTierDisplayLabel,
} from '@/data/thingsToDoTierFeatures';
import {
    canUseServicesFeature,
    normalizeTier as normalizeServicesTier,
    servicesDescriptionWordLimit,
    servicesGalleryLimit,
    tierDisplayLabel as servicesTierDisplayLabel,
} from '@/data/servicesTierFeatures';
import {
    canUseEventsFeature,
    eventsDescriptionWordLimit,
    eventsGalleryLimit,
    normalizeTier as normalizeEventsTier,
    tierDisplayLabel as eventsTierDisplayLabel,
} from '@/data/eventsTierFeatures';

/** @typedef {'eatDrink'|'stay'|'conversion'|'open'} ContactMode */

const REGISTRY = {
    eatDrink: {
        Upsell: EatDrinkTierUpsell,
        canUse: canUseEatDrinkFeature,
        galleryLimit: eatDrinkGalleryLimit,
        descriptionWordLimit: eatDrinkDescriptionWordLimit,
        normalize: normalizeEatDrinkTier,
        label: eatDrinkTierDisplayLabel,
        lockGalleryWhenEmpty: false,
        contactMode: /** @type {ContactMode} */ ('eatDrink'),
    },
    stay: {
        Upsell: StayTierUpsell,
        canUse: canUseStayFeature,
        galleryLimit: stayGalleryLimit,
        galleryPerRoomLimit: stayGalleryPerRoomLimit,
        descriptionWordLimit: stayDescriptionWordLimit,
        normalize: normalizeStayTier,
        label: stayTierDisplayLabel,
        lockGalleryWhenEmpty: true,
        contactMode: /** @type {ContactMode} */ ('stay'),
        categorizedGallery: true,
        hoursFeature: 'reception_hours',
    },
    shopping: {
        Upsell: ShoppingTierUpsell,
        canUse: canUseShoppingFeature,
        galleryLimit: shoppingGalleryLimit,
        descriptionWordLimit: shoppingDescriptionWordLimit,
        normalize: normalizeShoppingTier,
        label: shoppingTierDisplayLabel,
        lockGalleryWhenEmpty: true,
        contactMode: /** @type {ContactMode} */ ('conversion'),
    },
    properties: {
        Upsell: PropertiesTierUpsell,
        canUse: canUsePropertiesFeature,
        galleryLimit: propertiesGalleryLimit,
        descriptionWordLimit: propertiesDescriptionWordLimit,
        normalize: normalizePropertiesTier,
        label: propertiesTierDisplayLabel,
        lockGalleryWhenEmpty: true,
        contactMode: /** @type {ContactMode} */ ('conversion'),
        skipHours: true,
    },
    thingsToDo: {
        Upsell: ThingsToDoTierUpsell,
        canUse: canUseThingsToDoFeature,
        galleryLimit: thingsToDoGalleryLimit,
        descriptionWordLimit: thingsToDoDescriptionWordLimit,
        normalize: normalizeThingsToDoTier,
        label: thingsToDoTierDisplayLabel,
        lockGalleryWhenEmpty: true,
        contactMode: /** @type {ContactMode} */ ('conversion'),
    },
    services: {
        Upsell: ServicesTierUpsell,
        canUse: canUseServicesFeature,
        galleryLimit: servicesGalleryLimit,
        descriptionWordLimit: servicesDescriptionWordLimit,
        normalize: normalizeServicesTier,
        label: servicesTierDisplayLabel,
        lockGalleryWhenEmpty: true,
        contactMode: /** @type {ContactMode} */ ('conversion'),
    },
    events: {
        Upsell: EventsTierUpsell,
        canUse: canUseEventsFeature,
        galleryLimit: eventsGalleryLimit,
        descriptionWordLimit: eventsDescriptionWordLimit,
        normalize: normalizeEventsTier,
        label: eventsTierDisplayLabel,
        lockGalleryWhenEmpty: true,
        contactMode: /** @type {ContactMode} */ ('conversion'),
        skipHours: true,
    },
};

export function isTieredCategory(categoryKey) {
    return Boolean(REGISTRY[categoryKey]);
}

/**
 * @param {string|null|undefined} categoryKey
 * @param {string|null|undefined} tierRaw
 */
export function resolveListingTier(categoryKey, tierRaw) {
    const config = REGISTRY[categoryKey];
    if (!config) {
        return {
            isTiered: false,
            listingTier: 'free',
            galleryMax: 12,
            galleryPerRoomMax: null,
            descriptionWordLimit: null,
            mapLocked: false,
            videoLocked: false,
            socialLocked: false,
            amenitiesLocked: false,
            hoursLocked: false,
            logoLocked: false,
            galleryLocked: false,
            hideTagline: false,
            TierUpsell: null,
            showTierUpsell: false,
            tierLabel: 'Free',
            contactMode: /** @type {ContactMode} */ ('open'),
            skipHours: categoryKey === 'properties' || categoryKey === 'events',
            categorizedGallery: false,
            canUse: () => true,
        };
    }

    const listingTier = config.normalize(tierRaw);
    const canUse = (feature) => config.canUse(listingTier, feature);
    const galleryMax = config.galleryLimit(listingTier);
    const galleryPerRoomMax = config.galleryPerRoomLimit
        ? config.galleryPerRoomLimit(listingTier)
        : null;
    const hoursFeature = config.hoursFeature || 'hours';

    return {
        isTiered: true,
        listingTier,
        galleryMax,
        galleryPerRoomMax,
        descriptionWordLimit: config.descriptionWordLimit(listingTier),
        mapLocked: !canUse('map_location'),
        videoLocked: !canUse('video'),
        socialLocked: !canUse('social_contact'),
        amenitiesLocked: !canUse('amenities'),
        hoursLocked: config.skipHours ? false : !canUse(hoursFeature),
        logoLocked: !canUse('logo'),
        galleryLocked: Boolean(config.lockGalleryWhenEmpty && galleryMax <= 0),
        hideTagline: !canUse('tagline'),
        TierUpsell: config.Upsell,
        showTierUpsell: true,
        tierLabel: config.label(listingTier),
        contactMode: config.contactMode,
        skipHours: Boolean(config.skipHours),
        categorizedGallery: Boolean(config.categorizedGallery),
        canUse,
    };
}
