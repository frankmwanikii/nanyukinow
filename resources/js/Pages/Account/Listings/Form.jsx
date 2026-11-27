import AmenitiesPicker from '@/Components/listing-form/AmenitiesPicker';
import CategoryFields from '@/Components/listing-form/CategoryFields';
import CategoryExtrasEditor from '@/Components/listing-form/CategoryExtrasEditor';
import GalleryUploader from '@/Components/listing-form/GalleryUploader';
import VideoFields from '@/Components/listing-form/VideoFields';
import HoursEditor from '@/Components/listing-form/HoursEditor';
import ListingPreview from '@/Components/listing-form/ListingPreview';
import PlacesLocationInput from '@/Components/listing-form/PlacesLocationInput';
import RichTextEditor from '@/Components/listing-form/RichTextEditor';
import {
    emptyDetailsFor,
} from '@/Components/listing-form/categoryFieldConfig';
import { compactPricingOptions } from '@/Components/listing-form/PricingOptionsInput';
import {
    asTicketOptions,
    compactTicketOptions,
} from '@/Components/listing-form/TicketOptionsInput';
import FieldLabel from '@/Components/listing-form/FieldLabel';

function serializeListingDetails(details) {
    const next = { ...(details || {}) };

    if ('price_from' in next) {
        next.price_from = compactPricingOptions(next.price_from);
    }

    return next;
}

function serializeTicketOptions(rows) {
    return compactTicketOptions(rows).map((row) => ({
        name: row.name.trim(),
        amount: row.amount === '' ? null : Number(row.amount),
    }));
}

import {
    defaultHours,
    field,
    fieldClass,
    label,
    sectionCard,
} from '@/Components/listing-form/fieldStyles';
import FieldError from '@/Components/listing-form/FieldError';
import UploadProgressBar from '@/Components/site/UploadProgressBar';
import AccountLayout from '@/Layouts/AccountLayout';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios';
import { PROPERTY_TYPES, mainCategories } from '@/data/categories';
import { countWords as eatDrinkCountWords } from '@/data/eatDrinkTierFeatures';
import { resolveListingTier } from '@/data/listingTier';
import { slugifyTitle } from '@/data/listings';
import {
    STAY_GALLERY_SPACES,
    customSpacesFromGallery,
    isDefaultStayGallerySpace,
    staySpaceLabel,
} from '@/data/stayTierFeatures';
import { listingSubcategories, subcategoryLabel } from '@/utils/listingSubcategories';
import {
    EatMark,
    EventMark,
    ExploreMark,
    PropertyMark,
    ServicesMark,
    ShopMark,
    StayMark,
} from '@/Components/site/Mark';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    ChevronLeft,
    Cloud,
    CloudOff,
    FileText,
    Loader2,
    Plus,
    Save,
    Settings,
    Trash2,
    X,
} from '@/Components/site/LucideCompat';
import { useEffect, useMemo, useRef, useState } from 'react';

const tierLabels = {
    free: 'Free',
    featured: 'Standard',
    premium: 'Premium',
};

const categoryIcons = {
    eatDrink: EatMark,
    'eat-drink': EatMark,
    stay: StayMark,
    thingsToDo: ExploreMark,
    'things-to-do': ExploreMark,
    services: ServicesMark,
    shopping: ShopMark,
    properties: PropertyMark,
    events: EventMark,
};

function iconForSlug(slug) {
    return categoryIcons[slug] || EatMark;
}

function labelForCategory(category) {
    const raw = String(category?.slug || '').trim();
    const slug = raw.toLowerCase();
    const match = mainCategories.find(
        (item) =>
            item.slug === slug ||
            item.key === raw ||
            item.key.toLowerCase() === slug,
    );

    return match?.label || category?.name || 'Category';
}

function isPlaceholderSlug(slug) {
    const value = String(slug || '').trim().toLowerCase();

    if (!value || value === 'listing' || value === 'untitled') return true;
    if (value.startsWith('untitled')) return true;
    if (/(^|-)draft(-\d+)?$/.test(value)) return true;
    if (/-draft-\d+/.test(value)) return true;

    return false;
}

function isGenericSlug(slug) {
    return /^listing(-\d+)?$/.test(String(slug || '').trim().toLowerCase());
}

function slugFollowsTitle(slug, title) {
    const value = String(slug || '').trim().toLowerCase();
    const base = slugifyTitle(title);

    if (!value) return false;
    if (!base) return isPlaceholderSlug(value) || isGenericSlug(value);

    return (
        value === base ||
        new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-\\d+$`).test(
            value,
        )
    );
}

function listingSlugValue(slug, title) {
    const value = String(slug || '').trim();

    if (!value) return slugifyTitle(title);
    if (isPlaceholderSlug(value) || isGenericSlug(value)) return slugifyTitle(title);
    if (slugFollowsTitle(value, title)) return slugifyTitle(title);

    return value;
}

function matchCategory(dbCategory, main) {
    if (!dbCategory || !main) return false;
    return (
        dbCategory.slug === main.slug ||
        dbCategory.slug === main.key ||
        dbCategory.key === main.key ||
        dbCategory.name?.toLowerCase() === main.label.toLowerCase()
    );
}

function resolveCategoryKey(category) {
    if (!category) return null;
    if (category.key) return category.key;
    const main = mainCategories.find((m) => matchCategory(category, m));
    return main?.key || category.slug || null;
}

function categoryIntro(categoryKey) {
    const map = {
        eatDrink: 'Tell people about your restaurant, cafe, or bar.',
        stay: 'Tell people about your lodge, hotel, Airbnb, or camp.',
        thingsToDo: 'Tell people about this experience or activity.',
        services: 'Tell people about your service and how to book you.',
        shopping: 'Tell people about your shop and what you sell.',
        properties: 'Tell people about this property — sale, rent, or lease.',
        events: 'Tell people about your event — when, where, and why to come.',
    };
    return (
        (map[categoryKey] || 'Tell people about your listing.') +
        ' We’ll review it before it goes live.'
    );
}

function categoryNameLabel(categoryKey) {
    const map = {
        eatDrink: 'Business / venue name',
        stay: 'Property / place name',
        thingsToDo: 'Experience / activity name',
        services: 'Service / business name',
        shopping: 'Shop / store name',
        properties: 'Property title',
        events: 'Event name',
    };
    return map[categoryKey] || 'Name';
}

function subcategoriesFor(categoryKey, selectedCategory = null) {
    if (
        Array.isArray(selectedCategory?.subcategories) &&
        selectedCategory.subcategories.length > 0
    ) {
        return selectedCategory.subcategories;
    }

    return mainCategories.find((c) => c.key === categoryKey)?.children || [];
}

const STEPS = [
    { id: 'basics', title: 'Basics' },
    { id: 'location', title: 'Location' },
    { id: 'details', title: 'Details' },
    { id: 'amenities', title: 'Features' },
    { id: 'media', title: 'Photos & video' },
    { id: 'contact', title: 'Contact' },
    { id: 'preview', title: 'Preview' },
];

const ERROR_FIELD_LABELS = {
    title: 'Name',
    category_id: 'Category',
    subcategory: 'Subcategory',
    property_type: 'Property type',
    tagline: 'Tagline',
    description: 'About',
    location: 'Area',
    address: 'Address',
    latitude: 'Map pin',
    longitude: 'Map pin',
    start_at: 'Starts',
    end_at: 'Ends',
    venue: 'Venue name',
    ticket_url: 'Ticket link',
    ticket_options: 'Tickets',
    ticket_price: 'Tickets',
    cover: 'Cover image',
    image_url: 'Cover image',
    logo: 'Logo',
    logo_url: 'Logo',
    event_poster: 'Event poster',
    gallery_files: 'Gallery',
    gallery_urls: 'Gallery',
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    email: 'Email',
    website: 'Website',
    amenities: 'Amenities',
    hours: 'Hours',
};

const ERROR_STEP_BY_FIELD = {
    title: 'basics',
    category_id: 'basics',
    subcategory: 'basics',
    property_type: 'basics',
    tagline: 'basics',
    description: 'basics',
    location: 'location',
    address: 'location',
    latitude: 'location',
    longitude: 'location',
    start_at: 'details',
    end_at: 'details',
    venue: 'details',
    ticket_url: 'details',
    ticket_options: 'details',
    ticket_price: 'details',
    early_bird_price: 'details',
    gate_price: 'details',
    amenities: 'amenities',
    hours: 'amenities',
    cover: 'media',
    image_url: 'media',
    logo: 'media',
    logo_url: 'media',
    event_poster: 'media',
    event_poster_url: 'media',
    gallery_files: 'media',
    gallery_urls: 'media',
    phone: 'contact',
    whatsapp: 'contact',
    email: 'contact',
    website: 'contact',
    social_links: 'contact',
};

function stepIdForErrorKey(key) {
    if (ERROR_STEP_BY_FIELD[key]) {
        return ERROR_STEP_BY_FIELD[key];
    }
    if (String(key).startsWith('details')) {
        return 'details';
    }
    if (String(key).startsWith('social_links')) {
        return 'contact';
    }
    if (String(key).startsWith('gallery') || String(key).startsWith('ticket')) {
        return String(key).startsWith('ticket') ? 'details' : 'media';
    }
    return 'basics';
}

function friendlyErrorLabel(key) {
    return ERROR_FIELD_LABELS[key] || String(key).replaceAll('_', ' ');
}

function friendlyErrorMessage(key, message) {
    const text = String(message || '');
    if (
        key === 'end_at' &&
        /after or equal to start/i.test(text)
    ) {
        return 'Ends must be on or after Starts.';
    }
    if (
        key === 'start_at' &&
        /required/i.test(text)
    ) {
        return 'Starts is required for events.';
    }
    return text;
}

function focusErrorField(key) {
    if (!key || typeof document === 'undefined') {
        return;
    }
    const el =
        document.getElementById(key) ||
        document.querySelector(`[data-error-field="${key}"]`) ||
        document.getElementById(`detail_${key}`);
    if (!el) {
        return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (typeof el.focus === 'function') {
        el.focus({ preventScroll: true });
    }
}

function normalizeStayGalleryKind(kind) {
    const value = String(kind || 'bedroom').trim() || 'bedroom';
    if (isDefaultStayGallerySpace(value)) {
        return value;
    }
    // Custom rooms saved from the gallery keep their own slug.
    if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(value)) {
        return value.toLowerCase();
    }
    return 'exterior';
}

function galleryFromListing(listing) {
    const urls = listing?.gallery || [];
    return urls
        .map((entry, i) => {
            if (typeof entry === 'string') {
                const url = persistedMediaUrl(entry);
                if (!url) return null;
                return {
                    id: `existing-${i}`,
                    url,
                    preview: url,
                    file: null,
                    kind: 'bedroom',
                    label: 'Bedroom',
                };
            }
            const src = persistedMediaUrl(entry?.src || entry?.url || '');
            if (!src) return null;
            const kind = normalizeStayGalleryKind(entry?.kind);
            return {
                id: `existing-${i}`,
                url: src,
                preview: src,
                file: null,
                kind,
                label: entry?.label || staySpaceLabel(kind),
            };
        })
        .filter(Boolean);
}

function serializeGalleryItems(items, { categorized = false } = {}) {
    return items
        .filter((g) => g.url && !g.file)
        .map((g) => {
            if (!categorized) return g.url;
            const kind = normalizeStayGalleryKind(g.kind);
            return {
                src: g.url,
                kind,
                label: g.label || staySpaceLabel(kind),
            };
        });
}

/** Local blob/data previews are fine in <img>, but never persist them. */
function isBrowserOnlyMediaUrl(url) {
    return (
        typeof url === 'string' &&
        (url.startsWith('blob:') || url.startsWith('data:'))
    );
}

/** Drop incomplete /storage/ placeholders and empty values. */
function persistedMediaUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed || trimmed === '/storage' || trimmed === '/storage/') {
        return '';
    }
    if (isBrowserOnlyMediaUrl(trimmed)) return '';
    return trimmed;
}

function previewMediaUrl(url) {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed || trimmed === '/storage' || trimmed === '/storage/') {
        return null;
    }
    return trimmed;
}

export default function Form({
    listing = null,
    categories = [],
    amenities: initialAmenities = [],
    stayGallerySpaces: initialStayGallerySpaces = [],
    mapsApiKey = '',
    plan,
    allowedTiers = ['free'],
    isDraft = false,
    context = 'account',
    owners = [],
    statuses = [],
    claimStatuses = [],
    editLock = null,
}) {
    const isDraftListing = isDraft || listing?.status === 'draft';
    const isEdit = Boolean(listing?.id) && !isDraftListing;
    const isAdmin = context === 'admin';
    const [lockState, setLockState] = useState(() => editLock);
    const lockTokenRef = useRef(editLock?.token || null);
    const editLockedByOther =
        isAdmin &&
        Boolean(listing?.id) &&
        lockState &&
        lockState.held === false &&
        lockState.editor;
    const [draftKey, setDraftKey] = useState(
        listing?.slug || listing?.id || null,
    );
    const draftKeyRef = useRef(draftKey);
    draftKeyRef.current = draftKey;
    const { errors: pageErrors } = usePage().props;
    const [amenityOptions, setAmenityOptions] = useState(initialAmenities);
    const [stayGallerySpaceLibrary, setStayGallerySpaceLibrary] = useState(
        initialStayGallerySpaces,
    );
    const [customGallerySpaces, setCustomGallerySpaces] = useState(() =>
        customSpacesFromGallery(galleryFromListing(listing)),
    );
    const stayGallerySpaceOptions = useMemo(
        () => [...STAY_GALLERY_SPACES, ...customGallerySpaces],
        [customGallerySpaces],
    );
    const [saveState, setSaveState] = useState('idle');
    const [draftUploadProgress, setDraftUploadProgress] = useState(null);
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const autosaveTimer = useRef(null);
    const autosaveReady = useRef(false);
    const draftSaving = useRef(false);
    const draftPending = useRef(false);
    const formDataRef = useRef(null);
    const slugTouched = useRef(
        Boolean(listing?.slug) &&
            !slugFollowsTitle(listing?.slug, listing?.title) &&
            !isPlaceholderSlug(listing?.slug) &&
            !isGenericSlug(listing?.slug),
    );

    const initialCategory = categories.find(
        (c) => String(c.id) === String(listing?.category_id),
    );
    const initialKey = resolveCategoryKey(initialCategory);

    const form = useForm({
        title:
            listing?.title && listing.title !== 'Untitled draft'
                ? listing.title
                : '',
        category_id: listing?.category_id || '',
        subcategory: listingSubcategories(listing?.subcategory),
        property_type: listing?.property_type || '',
        location: listing?.location || 'Nanyuki',
        city: listing?.city || '',
        tagline: listing?.tagline || '',
        description: listing?.description || '',
        phone: listing?.phone || '',
        whatsapp: listing?.whatsapp || '',
        email: listing?.email || '',
        website: listing?.website || '',
        address: listing?.address || '',
        venue: listing?.venue || '',
        latitude: listing?.latitude ?? '',
        longitude: listing?.longitude ?? '',
        price_range: listing?.price_range || '',
        image_url: persistedMediaUrl(
            listing?.image_url ||
                (initialKey === 'events' ? listing?.event_poster_url : null),
        ),
        logo_url: persistedMediaUrl(listing?.logo_url),
        event_poster_url: persistedMediaUrl(
            listing?.event_poster_url ||
                (initialKey === 'events' ? listing?.image_url : null),
        ),
        amenities: listing?.amenities || [],
        hours:
            listing?.hours?.length
                ? listing.hours
                : defaultHours(),
        social_links: {
            instagram: listing?.social_links?.instagram || '',
            facebook: listing?.social_links?.facebook || '',
            tiktok: listing?.social_links?.tiktok || '',
            youtube: listing?.social_links?.youtube || '',
            links: Array.isArray(listing?.social_links?.links)
                ? listing.social_links.links.map((item) => ({
                      label: item?.label || '',
                      url: item?.url || '',
                  }))
                : [],
        },
        details: {
            ...emptyDetailsFor(initialKey || 'eatDrink'),
            ...(listing?.details || {}),
        },
        start_at: listing?.start_at || '',
        end_at: listing?.end_at || '',
        ticket_options: asTicketOptions(listing?.ticket_options || []),
        ticket_url: listing?.ticket_url || '',
        tier: listing?.tier || plan?.key || 'free',
        cover: null,
        logo: null,
        event_poster: null,
        gallery_files: [],
        gallery_urls: (listing?.gallery || []).filter(Boolean),
        // Admin-only fields
        user_id: listing?.user_id || '',
        slug: listingSlugValue(listing?.slug, listing?.title),
        status: listing?.status || 'published',
        claim_status: listing?.claim_status || 'unclaimed',
        priority: listing?.priority ?? 0,
        expires_at: listing?.expires_at || '',
        published_at: listing?.published_at || '',
        is_published: listing?.is_published ?? true,
        is_verified: listing?.is_verified || false,
        is_featured: listing?.is_featured || false,
        is_trending: listing?.is_trending || false,
    });

    formDataRef.current = form.data;

    const [coverPreview, setCoverPreview] = useState(
        previewMediaUrl(
            listing?.image_url ||
                (initialKey === 'events' ? listing?.event_poster_url : null),
        ),
    );
    const [logoPreview, setLogoPreview] = useState(
        previewMediaUrl(listing?.logo_url),
    );
    const [posterPreview, setPosterPreview] = useState(
        previewMediaUrl(
            listing?.event_poster_url ||
                (initialKey === 'events' ? listing?.image_url : null),
        ),
    );
    const [galleryItems, setGalleryItems] = useState(() =>
        galleryFromListing(listing),
    );

    const hasServerErrors = Boolean(
        pageErrors && Object.keys(pageErrors).length > 0,
    );

    const [phase, setPhase] = useState(() => {
        if (listing?.id && listing?.category_id) return 'wizard';
        if (isEdit) return 'wizard';
        if (hasServerErrors && form.data.category_id) return 'wizard';
        return 'category';
    });

    const [stepIndex, setStepIndex] = useState(0);
    const [adminTab, setAdminTab] = useState('listing'); // listing | advanced

    const selectedCategory = useMemo(
        () =>
            categories.find(
                (c) => String(c.id) === String(form.data.category_id),
            ) || null,
        [categories, form.data.category_id],
    );

    const categoryKey = resolveCategoryKey(selectedCategory);
    const subs = subcategoriesFor(categoryKey, selectedCategory);
    const isEatDrink = categoryKey === 'eatDrink';
    const isStay = categoryKey === 'stay';
    const isShopping = categoryKey === 'shopping';
    const isProperties = categoryKey === 'properties';
    const isThingsToDo = categoryKey === 'thingsToDo';
    const isServices = categoryKey === 'services';
    const isEvents = categoryKey === 'events';
    // Prefer named routes, but never crash the form if Ziggy is stale.
    const adminBase =
        typeof window !== 'undefined'
            ? `/${window.location.pathname.split('/').filter(Boolean)[0] || 'admin'}`
            : '/admin';
    let editorMediaUploadUrl = isAdmin
        ? `${adminBase}/listings/editor-media`
        : '/account/listings/editor-media';
    try {
        editorMediaUploadUrl = route(
            isAdmin
                ? 'admin.listings.editor-media'
                : 'account.listings.editor-media',
        );
    } catch {
        // keep path fallback
    }
    let editorVideoUploadUrl = isAdmin
        ? `${adminBase}/listings/editor-video`
        : '/account/listings/editor-video';
    try {
        editorVideoUploadUrl = route(
            isAdmin
                ? 'admin.listings.editor-video'
                : 'account.listings.editor-video',
        );
    } catch {
        // keep path fallback
    }
    const tierState = resolveListingTier(categoryKey, form.data.tier);
    const {
        listingTier,
        galleryMax,
        galleryPerRoomMax,
        descriptionWordLimit,
        mapLocked,
        videoLocked,
        socialLocked,
        amenitiesLocked,
        hoursLocked,
        logoLocked,
        galleryLocked,
        hideTagline,
        TierUpsell,
        showTierUpsell,
        tierLabel,
        contactMode,
        skipHours,
        categorizedGallery,
        canUse: canUseTierFeature,
    } = tierState;

    const buildDraftBody = (data = formDataRef.current || form.data) => {
        const galleryUrls = serializeGalleryItems(galleryItems, {
            categorized: categorizedGallery,
        });
        const body = new FormData();
        const append = (key, value) => {
            if (value === null || value === undefined) return;
            body.append(key, value);
        };

        append('title', data.title || 'Untitled draft');
        append('category_id', data.category_id || '');
        append('subcategory', JSON.stringify(data.subcategory || []));
        append('property_type', data.property_type || '');
        append('location', data.location || '');
        append('city', data.city || '');
        append('tagline', data.tagline || '');
        // Always send description (including empty) so drafts keep rich text.
        body.append('description', data.description ?? '');
        append('phone', data.phone || '');
        append('whatsapp', data.whatsapp || '');
        append('email', data.email || '');
        append('website', data.website || '');
        append('address', data.address || '');
        append('venue', data.venue || '');
        if (data.latitude !== '' && data.latitude != null) {
            append('latitude', data.latitude);
        }
        if (data.longitude !== '' && data.longitude != null) {
            append('longitude', data.longitude);
        }
        append('price_range', data.price_range || '');
        append('image_url', data.image_url || '');
        append('logo_url', data.logo_url || '');
        append('event_poster_url', data.event_poster_url || '');
        append('tier', data.tier || '');
        append('amenities', JSON.stringify(data.amenities || []));
        append(
            'hours',
            JSON.stringify(
                categoryKey === 'properties' || categoryKey === 'events'
                    ? []
                    : data.hours || [],
            ),
        );
        append(
            'details',
            JSON.stringify(serializeListingDetails(data.details)),
        );
        append('social_links', JSON.stringify(data.social_links || {}));
        append('gallery_urls', JSON.stringify(galleryUrls));
        if (isStay) {
            const galleryFileMeta = galleryItems
                .filter((g) => g.file)
                .map((g) => ({
                    kind: normalizeStayGalleryKind(g.kind),
                    label:
                        g.label ||
                        staySpaceLabel(normalizeStayGalleryKind(g.kind)),
                }));
            append('gallery_file_meta', JSON.stringify(galleryFileMeta));
        }
        if (data.start_at) append('start_at', data.start_at);
        if (data.end_at) append('end_at', data.end_at);
        append(
            'ticket_options',
            JSON.stringify(serializeTicketOptions(data.ticket_options)),
        );
        append('ticket_url', data.ticket_url || '');

        if (isAdmin) {
            append('user_id', data.user_id || '');
            append('claim_status', data.claim_status || 'unclaimed');
            append('priority', data.priority ?? 0);
        }

        // Events use the poster as cover; only upload poster to avoid duplicates.
        if (data.cover && categoryKey !== 'events') {
            append('cover', data.cover);
        }
        if (data.logo) append('logo', data.logo);
        if (data.event_poster) append('event_poster', data.event_poster);
        galleryItems
            .filter((g) => g.file)
            .forEach((g) => body.append('gallery_files[]', g.file));

        return body;
    };

    const persistDraft = async ({
        silent = true,
        overrides = {},
        allowCreateFallback = true,
    } = {}) => {
        if (isEdit) return;
        if (editLockedByOther) return;
        const latest = { ...(formDataRef.current || form.data), ...overrides };
        const categoryId = latest.category_id;
        const activeDraftKey = draftKeyRef.current;
        if (!categoryId && !activeDraftKey) return;

        if (draftSaving.current) {
            // Another save is in flight. Queue one more pass with latest fields.
            draftPending.current = true;
            return;
        }

        draftSaving.current = true;
        draftPending.current = false;
        if (!silent) setSaveState('saving');
        setDraftUploadProgress(0);

        const csrf =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') || '';
        const axiosConfig = {
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrf,
                'X-Requested-With': 'XMLHttpRequest',
            },
            onUploadProgress: (event) => {
                if (!event.total) {
                    setDraftUploadProgress(event.loaded > 0 ? 50 : 0);
                    return;
                }
                setDraftUploadProgress(
                    Math.round((event.loaded / event.total) * 100),
                );
            },
        };

        try {
            const url = activeDraftKey
                ? route(
                      isAdmin
                          ? 'admin.listings.draft.update'
                          : 'account.listings.draft.update',
                      activeDraftKey,
                  )
                : route(
                      isAdmin
                          ? 'admin.listings.draft'
                          : 'account.listings.draft',
                  );

            let response;
            try {
                response = await axios.post(
                    url,
                    buildDraftBody(latest),
                    axiosConfig,
                );
            } catch (err) {
                const status = err?.response?.status;
                if (
                    allowCreateFallback &&
                    activeDraftKey &&
                    (status === 404 || status === 410)
                ) {
                    draftKeyRef.current = null;
                    setDraftKey(null);
                    response = await axios.post(
                        route(
                            isAdmin
                                ? 'admin.listings.draft'
                                : 'account.listings.draft',
                        ),
                        buildDraftBody(latest),
                        axiosConfig,
                    );
                } else {
                    const payload = err?.response?.data;
                    if (payload?.errors && typeof payload.errors === 'object') {
                        Object.entries(payload.errors).forEach(
                            ([key, messages]) => {
                                const message = Array.isArray(messages)
                                    ? messages[0]
                                    : messages;
                                if (key && message) {
                                    form.setError(key, String(message));
                                }
                            },
                        );
                    }

                    setSaveState('error');
                    return;
                }
            }

            const json = response.data;
            if (json?.listing?.slug || json?.listing?.id) {
                const nextKey = json.listing.slug || json.listing.id;
                draftKeyRef.current = nextKey;
                setDraftKey(nextKey);
                if (isAdmin && json.listing.slug) {
                    try {
                        const editPath = new URL(
                            route('admin.listings.edit', json.listing.slug),
                            window.location.origin,
                        ).pathname;
                        if (window.location.pathname !== editPath) {
                            window.history.replaceState(
                                window.history.state,
                                '',
                                editPath,
                            );
                        }
                    } catch {
                        // Ignore history failures; draftKey still keeps saves working.
                    }
                }
                const savedCover = persistedMediaUrl(json.listing.image_url);
                if (savedCover) {
                    form.setData('image_url', savedCover);
                    form.setData('cover', null);
                    setCoverPreview(savedCover);
                }
                const savedLogo = persistedMediaUrl(json.listing.logo_url);
                if (savedLogo) {
                    form.setData('logo_url', savedLogo);
                    form.setData('logo', null);
                    setLogoPreview(savedLogo);
                }
                const savedPoster = persistedMediaUrl(
                    json.listing.event_poster_url ||
                        (categoryKey === 'events'
                            ? json.listing.image_url
                            : null),
                );
                if (savedPoster) {
                    form.setData('event_poster_url', savedPoster);
                    form.setData('event_poster', null);
                    setPosterPreview(savedPoster);
                    if (categoryKey === 'events') {
                        form.setData('image_url', savedPoster);
                        form.setData('cover', null);
                        setCoverPreview(savedPoster);
                    }
                }
                if (Array.isArray(json.listing.gallery)) {
                    const savedGallery = json.listing.gallery
                        .map((entry, i) => {
                            if (typeof entry === 'string') {
                                const url = persistedMediaUrl(entry);
                                if (!url) return null;
                                return {
                                    id: `saved-${i}`,
                                    url,
                                    preview: url,
                                    file: null,
                                };
                            }
                            const url = persistedMediaUrl(
                                entry?.src || entry?.url || '',
                            );
                            if (!url) return null;
                            const kind = normalizeStayGalleryKind(entry?.kind);
                            return {
                                id: `saved-${i}`,
                                url,
                                preview: url,
                                file: null,
                                kind,
                                label:
                                    entry?.label || staySpaceLabel(kind),
                            };
                        })
                        .filter(Boolean);

                    // Keep local unsaved files if the server returned nothing new yet.
                    setGalleryItems((current) => {
                        const pending = current.filter((g) => g.file);
                        if (!savedGallery.length && pending.length) {
                            return current;
                        }
                        if (!pending.length) {
                            return savedGallery;
                        }
                        return [...savedGallery, ...pending];
                    });
                }
            }
            setLastSavedAt(json.saved_at || new Date().toISOString());
            setSaveState('saved');
        } catch {
            setSaveState('error');
        } finally {
            setDraftUploadProgress(null);
            draftSaving.current = false;
            if (draftPending.current) {
                draftPending.current = false;
                void persistDraft({ silent: true });
            }
        }
    };

    const scheduleAutosave = () => {
        if (isEdit) return;
        clearTimeout(autosaveTimer.current);
        autosaveTimer.current = setTimeout(() => {
            persistDraft({ silent: true });
        }, 1200);
    };

    const orderedCategories = useMemo(() => {
        const remaining = [...categories];
        const ordered = [];
        mainCategories.forEach((main) => {
            const index = remaining.findIndex((c) => matchCategory(c, main));
            if (index >= 0) {
                ordered.push(remaining.splice(index, 1)[0]);
            }
        });
        return [...ordered, ...remaining];
    }, [categories]);

    const pickCategory = (category) => {
        const key = resolveCategoryKey(category);
        form.setData((data) => ({
            ...data,
            category_id: category.id,
            subcategory: [],
            property_type: '',
            details: emptyDetailsFor(key),
            hours:
                key === 'properties' || key === 'events'
                    ? []
                    : data.hours?.length
                      ? data.hours
                      : defaultHours(),
        }));
        form.clearErrors('category_id');
        setPhase('wizard');
        setStepIndex(0);
        // Create draft immediately so progress is never lost on glitches.
        persistDraft({
            silent: false,
            overrides: { category_id: category.id },
        });
    };

    const pendingErrorFocus = useRef(null);

    const patch = (partial) => {
        form.setData((data) => ({ ...data, ...partial }));
        const keys = Object.keys(partial || {});
        if (keys.length) {
            form.clearErrors(...keys);
        }
        scheduleAutosave();
    };

    useEffect(() => {
        const key = pendingErrorFocus.current;
        if (!key) {
            return undefined;
        }
        const timer = window.setTimeout(() => {
            pendingErrorFocus.current = null;
            focusErrorField(key);
        }, 80);
        return () => window.clearTimeout(timer);
    }, [stepIndex, form.errors]);

    useEffect(() => {
        setLockState(editLock);
        lockTokenRef.current = editLock?.token || null;
    }, [editLock]);

    useEffect(() => {
        if (!isAdmin || !listing?.id || !listing?.slug) {
            return undefined;
        }

        const csrf = () =>
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') || '';

        const releaseLock = () => {
            const token = lockTokenRef.current;
            if (!token) {
                return;
            }

            const body = new FormData();
            body.append('token', token);
            body.append('_token', csrf());

            const url = route('admin.listings.edit-lock.release', listing.slug);
            if (navigator.sendBeacon) {
                navigator.sendBeacon(url, body);
                return;
            }

            void fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrf(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body,
                keepalive: true,
            });
        };

        const syncLock = async () => {
            const token = lockTokenRef.current;

            try {
                const res = await fetch(
                    route('admin.listings.edit-lock', listing.slug),
                    {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrf(),
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        credentials: 'same-origin',
                        body: JSON.stringify(token ? { token } : {}),
                    },
                );

                const json = await res.json().catch(() => null);
                if (!json) {
                    return;
                }

                setLockState(json);
                lockTokenRef.current = json.held ? json.token : null;
            } catch {
                // Keep the local lock state; the next tick retries.
            }
        };

        const timer = window.setInterval(
            syncLock,
            lockTokenRef.current ? 30000 : 15000,
        );
        window.addEventListener('pagehide', releaseLock);

        return () => {
            window.clearInterval(timer);
            window.removeEventListener('pagehide', releaseLock);
            releaseLock();
        };
    }, [isAdmin, listing?.id, listing?.slug]);

    useEffect(() => {
        // Skip the initial mount dump; save when the user starts editing.
        if (!autosaveReady.current) {
            autosaveReady.current = true;
            return undefined;
        }
        if (isEdit || phase !== 'wizard') return undefined;
        scheduleAutosave();
        return () => clearTimeout(autosaveTimer.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        form.data.title,
        form.data.subcategory,
        form.data.property_type,
        form.data.location,
        form.data.tagline,
        form.data.description,
        form.data.phone,
        form.data.whatsapp,
        form.data.email,
        form.data.website,
        form.data.address,
        form.data.venue,
        form.data.latitude,
        form.data.longitude,
        form.data.price_range,
        form.data.amenities,
        form.data.hours,
        form.data.details,
        form.data.social_links,
        form.data.start_at,
        form.data.end_at,
        form.data.ticket_options,
        form.data.tier,
        galleryItems,
        phase,
    ]);

    const validateStep = () => {
        const step = STEPS[stepIndex]?.id;
        if (step === 'basics') {
            if (!form.data.title?.trim()) {
                form.setError('title', 'Name is required.');
                return false;
            }
            if (
                !Array.isArray(form.data.subcategory) ||
                form.data.subcategory.length === 0
            ) {
                form.setError('subcategory', 'Please choose at least one subcategory.');
                return false;
            }
            if (categoryKey === 'properties' && !form.data.property_type) {
                form.setError('property_type', 'Please choose a property type.');
                return false;
            }
        }
        if (step === 'location' && !form.data.location?.trim()) {
            form.setError('location', 'Pick at least one area (Nanyuki, Naromoru, or Timau).');
            return false;
        }
        if (step === 'details' && categoryKey === 'events') {
            if (!form.data.start_at) {
                form.setError('start_at', 'Starts is required for events.');
                pendingErrorFocus.current = 'start_at';
                return false;
            }
            if (
                form.data.end_at &&
                form.data.start_at &&
                form.data.end_at < form.data.start_at
            ) {
                form.setError(
                    'end_at',
                    'Ends must be on or after Starts.',
                );
                pendingErrorFocus.current = 'end_at';
                return false;
            }
            if (!form.data.venue?.trim()) {
                form.setError('venue', 'Venue name is required for events.');
                pendingErrorFocus.current = 'venue';
                return false;
            }
        }
        if (step === 'media') {
            if (isEvents) {
                if (!posterPreview && !form.data.event_poster_url) {
                    form.setError(
                        'event_poster',
                        'Please add an event poster.',
                    );
                    pendingErrorFocus.current = 'event_poster';
                    return false;
                }
            } else if (!coverPreview && !form.data.image_url) {
                form.setError('cover', 'Please add a cover image.');
                pendingErrorFocus.current = 'cover';
                return false;
            }
        }
        form.clearErrors();
        return true;
    };

    const next = () => {
        if (!isAdmin && !validateStep()) {
            const key = pendingErrorFocus.current;
            if (key) {
                requestAnimationFrame(() => focusErrorField(key));
            }
            return;
        }
        setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    };

    const back = () => {
        form.clearErrors();
        if (stepIndex === 0 && !isEdit) {
            setPhase('category');
            return;
        }
        setStepIndex((i) => Math.max(i - 1, 0));
    };

    const submit = (e, mode = 'save') => {
        e?.preventDefault?.();
        if (editLockedByOther) {
            return;
        }
        if (!form.data.category_id) {
            setPhase('category');
            return;
        }

        if (isAdmin && mode === 'publish') {
            if (!form.data.title?.trim()) {
                form.setError('title', 'Business / venue name is required to publish.');
                setStepIndex(0);
                return;
            }
        }

        const galleryUrls = serializeGalleryItems(galleryItems, {
            categorized: categorizedGallery,
        });
        const galleryFiles = galleryItems
            .filter((g) => g.file)
            .map((g) => g.file);
        const galleryFileMeta = isStay
            ? galleryItems
                  .filter((g) => g.file)
                  .map((g) => ({
                      kind: normalizeStayGalleryKind(g.kind),
                      label:
                          g.label ||
                          staySpaceLabel(normalizeStayGalleryKind(g.kind)),
                  }))
            : [];

        form.transform((data) => {
            const payload = {
                ...data,
                // Always JSON-encode nested structures for multipart posts so
                // deep menu/gallery arrays survive FormData serialization.
                gallery_urls: JSON.stringify(galleryUrls),
                gallery_files: galleryFiles,
                gallery_file_meta: JSON.stringify(galleryFileMeta),
                amenities: JSON.stringify(data.amenities || []),
                hours:
                    categoryKey === 'properties' || categoryKey === 'events'
                        ? null
                        : JSON.stringify(data.hours || []),
                details: JSON.stringify(
                    serializeListingDetails(data.details),
                ),
                social_links: JSON.stringify(data.social_links || {}),
                ticket_options: JSON.stringify(
                    serializeTicketOptions(data.ticket_options),
                ),
                latitude: data.latitude === '' ? null : data.latitude,
                longitude: data.longitude === '' ? null : data.longitude,
            };

            if (isAdmin && mode === 'draft') {
                payload.status = 'draft';
                payload.is_published = false;
            }

            if (isAdmin && mode === 'publish') {
                payload.status = 'published';
                payload.is_published = true;
                if (!payload.published_at) {
                    const now = new Date();
                    const pad = (n) => String(n).padStart(2, '0');
                    payload.published_at = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
                }
            }

            if (isEdit || draftKey || (isAdmin && listing?.id)) {
                payload._method = 'put';
            }

            return payload;
        });

        const options = {
            forceFormData: true,
            onError: (errors) => {
                const firstKey = Object.keys(errors || {})[0];
                if (!firstKey) {
                    return;
                }
                pendingErrorFocus.current = firstKey;
                const stepId = stepIdForErrorKey(firstKey);
                const idx = STEPS.findIndex((s) => s.id === stepId);
                if (idx >= 0) {
                    setStepIndex(idx);
                }
            },
        };

        if (isAdmin) {
            const targetKey = listing?.slug || listing?.id || draftKey;
            if (targetKey) {
                form.post(route('admin.listings.update', targetKey), options);
            } else {
                form.post(route('admin.listings.store'), options);
            }
        } else {
            const targetKey = isEdit
                ? listing.slug || listing.id
                : draftKey;
            if (targetKey) {
                form.post(route('account.listings.update', targetKey), options);
            } else {
                form.post(route('account.listings.store'), options);
            }
        }
    };

    const step = STEPS[stepIndex];
    const progress = ((stepIndex + 1) / STEPS.length) * 100;
    const listingTitle =
        (form.data.title || listing?.title || '').trim() || 'Untitled listing';
    const pageTitle =
        isEdit || listing?.id ? `Editing ${listingTitle}` : 'New listing';

    const LayoutComponent = isAdmin ? AdminLayout : AccountLayout;
    const layoutProps = isAdmin
        ? {}
        : { title: isEdit ? pageTitle : 'Add listing' };

    return (
        <LayoutComponent {...layoutProps}>
            <Head title={pageTitle} />

            {isAdmin ? (
                <div className="mb-2">
                    <h1 className="font-display text-2xl font-bold tracking-tight text-olive-950 dark:text-white">
                        {isEdit || listing?.id ? (
                            <>
                                <span className="font-semibold text-olive-500 dark:text-olive-400">
                                    Editing
                                </span>{' '}
                                {listingTitle}
                            </>
                        ) : (
                            'New listing'
                        )}
                    </h1>
                    {editLockedByOther ? (
                        <div
                            role="status"
                            className="mt-3 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100"
                        >
                            <p className="font-semibold">
                                {lockState.editor?.name || 'Another admin'} is
                                editing this listing
                            </p>
                            <p className="mt-1 text-amber-900/80 dark:text-amber-100/80">
                                Fields are blurred and locked for viewing only
                                until they leave or their session times out.
                            </p>
                            <Link
                                href={route('admin.listings.index')}
                                className="mt-3 inline-flex rounded-sm border border-amber-400/70 bg-white px-3.5 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-50 dark:hover:bg-amber-900"
                            >
                                Back to listings
                            </Link>
                        </div>
                    ) : null}
                </div>
            ) : null}

            {phase === 'category' && !isEdit ? (
                <CategoryPicker
                    categories={orderedCategories}
                    selectedId={form.data.category_id}
                    onPick={pickCategory}
                    error={form.errors.category_id}
                />
            ) : (
                <div className="space-y-5">
                    {isAdmin ? (
                        <AdminSectionTabs
                            active={adminTab}
                            onChange={setAdminTab}
                        />
                    ) : null}

                    <div
                        className={
                            editLockedByOther ? 'relative' : undefined
                        }
                    >
                        {editLockedByOther ? (
                            <div
                                className="absolute inset-0 z-20 cursor-not-allowed rounded-sm bg-olive-50/25 dark:bg-olive-950/30"
                                aria-hidden="true"
                            />
                        ) : null}
                        <div
                            className={
                                editLockedByOther
                                    ? 'pointer-events-none select-none blur-[2.5px] saturate-50'
                                    : undefined
                            }
                            aria-disabled={
                                editLockedByOther ? true : undefined
                            }
                            {...(editLockedByOther
                                ? { inert: '' }
                                : {})}
                        >
                    {isAdmin && adminTab === 'advanced' ? (
                        <div className="space-y-4">
                            <AdminControls
                                form={form}
                                owners={owners}
                                statuses={statuses}
                                claimStatuses={claimStatuses}
                                allowedTiers={allowedTiers}
                                listing={listing}
                                onSlugChange={(value) => {
                                    slugTouched.current = value.trim() !== '';
                                    form.setData('slug', value);
                                }}
                            />
                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <Link
                                    href={route('admin.listings.index')}
                                    className="rounded-sm border border-olive-200 px-4 py-2.5 text-sm font-semibold text-olive-700 dark:border-olive-700 dark:text-olive-200 dark:hover:bg-olive-800"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="button"
                                    disabled={form.processing || editLockedByOther}
                                    onClick={(e) => submit(e, 'draft')}
                                    className="inline-flex items-center gap-2 rounded-sm border border-olive-200 bg-white px-4 py-2.5 text-sm font-semibold text-olive-800 disabled:opacity-50 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-100 dark:hover:bg-olive-800"
                                >
                                    <Save className="h-4 w-4" />
                                    {form.processing
                                        ? form.progress?.percentage != null
                                          ? `Saving ${Math.round(form.progress.percentage)}%`
                                          : 'Saving…'
                                        : 'Save draft'}
                                </button>
                                <button
                                    type="button"
                                    disabled={form.processing || editLockedByOther}
                                    onClick={(e) => submit(e, 'publish')}
                                    className="inline-flex items-center gap-2 rounded-sm bg-mustard px-4 py-2.5 text-sm font-bold text-earth-dusk disabled:opacity-50"
                                >
                                    {form.processing
                                        ? form.progress?.percentage != null
                                          ? `Publishing ${Math.round(form.progress.percentage)}%`
                                          : 'Publishing…'
                                        : 'Publish'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-olive-600 dark:text-olive-400">
                                {categoryIntro(categoryKey)}
                            </p>
                            {selectedCategory ? (
                                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-olive-500 dark:text-olive-500">
                                    {selectedCategory.name}
                                    {subcategoryLabel(form.data)
                                        ? ` · ${subcategoryLabel(form.data)}`
                                        : ''}
                                </p>
                            ) : null}
                        </div>
                        {!isEdit ? (
                            <button
                                type="button"
                                onClick={() => setPhase('category')}
                                className="inline-flex items-center gap-1 text-sm font-semibold text-olive-700 hover:text-olive-950 dark:text-olive-300 dark:hover:text-olive-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Change category
                            </button>
                        ) : null}
                    </div>

                    {!isEdit ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-olive-600">
                            {saveState === 'saving' ||
                            draftUploadProgress != null ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    {draftUploadProgress != null
                                        ? `Uploading ${draftUploadProgress}%`
                                        : 'Saving draft…'}
                                </>
                            ) : saveState === 'saved' ? (
                                <>
                                    <Cloud className="h-3.5 w-3.5 text-olive-700" />
                                    Draft saved
                                    {lastSavedAt
                                        ? ` · ${new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                        : ''}
                                </>
                            ) : saveState === 'error' ? (
                                <>
                                    <CloudOff className="h-3.5 w-3.5 text-rose-600" />
                                    <button
                                        type="button"
                                        className="underline hover:text-olive-950"
                                        onClick={() =>
                                            persistDraft({ silent: false })
                                        }
                                    >
                                        Draft save failed. Retry
                                    </button>
                                </>
                            ) : draftKey ? (
                                <>
                                    <Cloud className="h-3.5 w-3.5" />
                                    Auto-saving as draft
                                </>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="border border-olive-900/15 bg-white p-3 dark:border-olive-800 dark:bg-olive-900">
                        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-olive-700 dark:text-olive-400">
                            <span>
                                Step {stepIndex + 1} of {STEPS.length} ·{' '}
                                {step.title}
                            </span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden bg-olive-100 dark:bg-olive-800">
                            <motion.div
                                className="h-full bg-mustard"
                                animate={{ width: `${progress}%` }}
                                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                            />
                        </div>
                        <div
                            className={`mt-3 gap-1 ${
                                isAdmin
                                    ? 'flex overflow-x-auto pb-0.5'
                                    : 'hidden sm:flex'
                            }`}
                        >
                            {STEPS.map((s, i) => {
                                const canJump = isAdmin || i <= stepIndex;
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => {
                                            if (canJump) setStepIndex(i);
                                        }}
                                        disabled={!canJump}
                                        className={`shrink-0 px-2 py-1.5 text-[11px] font-semibold transition sm:flex-1 sm:px-1 ${
                                            i === stepIndex
                                                ? 'bg-olive-900 text-white dark:bg-mustard dark:text-earth-dusk'
                                                : canJump
                                                  ? 'bg-olive-100 text-olive-900 hover:bg-olive-200 dark:bg-olive-800 dark:text-olive-100 dark:hover:bg-olive-700'
                                                  : 'cursor-not-allowed bg-olive-50 text-olive-400 dark:bg-olive-950 dark:text-olive-600'
                                        }`}
                                    >
                                        {s.title}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <form onSubmit={submit} className={sectionCard}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: 24 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -24 }}
                                transition={{ duration: 0.22 }}
                                className="space-y-5"
                            >
                                {step.id === 'basics' ? (
                                    <BasicsStep
                                        form={form}
                                        categoryKey={categoryKey}
                                        subs={subs}
                                        isEdit={isEdit}
                                        categories={categories}
                                        patch={patch}
                                        slugTouched={slugTouched}
                                        descriptionWordLimit={descriptionWordLimit}
                                        hideTagline={hideTagline}
                                        uploadUrl={editorMediaUploadUrl}
                                    />
                                ) : null}

                                {step.id === 'location' ? (
                                    <div className="space-y-5">
                                        {showTierUpsell && mapLocked ? (
                                            <TierUpsell
                                                tier={listingTier}
                                                isAdmin={isAdmin}
                                            />
                                        ) : null}
                                        <PlacesLocationInput
                                            apiKey={mapsApiKey}
                                            location={form.data.location}
                                            latitude={form.data.latitude}
                                            longitude={form.data.longitude}
                                            address={form.data.address}
                                            errors={form.errors}
                                            onChange={(partial) => patch(partial)}
                                            mapLocked={mapLocked}
                                        />
                                    </div>
                                ) : null}

                                {step.id === 'details' ? (
                                    <>
                                        {showTierUpsell ? (
                                            <TierUpsell
                                                tier={listingTier}
                                                isAdmin={isAdmin}
                                            />
                                        ) : null}
                                        <CategoryFields
                                            categoryKey={categoryKey}
                                            details={form.data.details}
                                            priceRange={form.data.price_range}
                                            onDetailsChange={(detailsOrFn) => {
                                                form.setData((data) => ({
                                                    ...data,
                                                    details:
                                                        typeof detailsOrFn ===
                                                        'function'
                                                            ? detailsOrFn(
                                                                  data.details ||
                                                                      {},
                                                              )
                                                            : detailsOrFn,
                                                }));
                                                form.clearErrors('details');
                                                scheduleAutosave();
                                            }}
                                            onPriceRangeChange={(price_range) =>
                                                patch({ price_range })
                                            }
                                            eventFields={
                                                categoryKey === 'events'
                                                    ? {
                                                          start_at:
                                                              form.data.start_at,
                                                          end_at: form.data.end_at,
                                                          venue: form.data.venue,
                                                          ticket_options:
                                                              form.data
                                                                  .ticket_options,
                                                          ticket_url:
                                                              form.data
                                                                  .ticket_url,
                                                      }
                                                    : null
                                            }
                                            onEventChange={(partial) =>
                                                patch(partial)
                                            }
                                            tier={listingTier}
                                            uploadUrl={editorMediaUploadUrl}
                                            errors={Object.fromEntries(
                                                Object.entries(
                                                    form.errors,
                                                ).map(([key, message]) => [
                                                    key,
                                                    friendlyErrorMessage(
                                                        key,
                                                        message,
                                                    ),
                                                ]),
                                            )}
                                        />
                                        <CategoryExtrasEditor
                                            categoryKey={categoryKey}
                                            details={form.data.details}
                                            onDetailsChange={(detailsOrFn) => {
                                                form.setData((data) => ({
                                                    ...data,
                                                    details:
                                                        typeof detailsOrFn ===
                                                        'function'
                                                            ? detailsOrFn(
                                                                  data.details ||
                                                                      {},
                                                              )
                                                            : detailsOrFn,
                                                }));
                                                form.clearErrors('details');
                                                scheduleAutosave();
                                            }}
                                            libraryRoute={
                                                isAdmin
                                                    ? route('admin.gallery.browse')
                                                    : null
                                            }
                                            uploadUrl={editorMediaUploadUrl}
                                            tier={listingTier}
                                            isAdmin={isAdmin}
                                            amenityOptions={amenityOptions}
                                            onAmenityCreated={(amenity) => {
                                                setAmenityOptions((prev) => {
                                                    if (
                                                        prev.some(
                                                            (a) =>
                                                                a.slug ===
                                                                amenity.slug,
                                                        )
                                                    ) {
                                                        return prev;
                                                    }
                                                    return [amenity, ...prev];
                                                });
                                            }}
                                        />
                                        {categoryKey !== 'properties' &&
                                        categoryKey !== 'events' &&
                                        !skipHours ? (
                                            hoursLocked ? (
                                                <TierUpsell
                                                    tier={listingTier}
                                                    isAdmin={isAdmin}
                                                />
                                            ) : (
                                                <HoursEditor
                                                    hours={form.data.hours}
                                                    onChange={(hours) =>
                                                        patch({ hours })
                                                    }
                                                    title={
                                                        isStay
                                                            ? 'Reception hours'
                                                            : 'Opening hours'
                                                    }
                                                    helpText={
                                                        isStay
                                                            ? 'When guests can check in at reception or reach you on-site.'
                                                            : undefined
                                                    }
                                                />
                                            )
                                        ) : null}
                                    </>
                                ) : null}

                                {step.id === 'amenities' ? (
                                    amenitiesLocked ? (
                                        <TierUpsell
                                            tier={listingTier}
                                            isAdmin={isAdmin}
                                        />
                                    ) : (
                                    <AmenitiesPicker
                                        amenities={amenityOptions}
                                        selected={form.data.amenities}
                                        categoryKey={categoryKey}
                                        onChange={(amenities) =>
                                            patch({ amenities })
                                        }
                                        onCreated={(amenity) => {
                                            setAmenityOptions((prev) => {
                                                if (
                                                    prev.some(
                                                        (a) =>
                                                            a.slug ===
                                                            amenity.slug,
                                                    )
                                                ) {
                                                    return prev;
                                                }
                                                return [amenity, ...prev];
                                            });
                                        }}
                                    />
                                    )
                                ) : null}

                                {step.id === 'media' ? (
                                    <>
                                    <GalleryUploader
                                        coverPreview={coverPreview}
                                        logoPreview={logoPreview}
                                        posterPreview={posterPreview}
                                        galleryItems={galleryItems}
                                        showPoster={isEvents}
                                        hideCover={isEvents}
                                        maxGallery={galleryMax}
                                        maxPerSpace={galleryPerRoomMax}
                                        categorized={
                                            categorizedGallery && !galleryLocked
                                        }
                                        spaceOptions={stayGallerySpaceOptions}
                                        spaceLibrary={stayGallerySpaceLibrary}
                                        allowCustomSpaces
                                        onSpaceAdded={(space) => {
                                            const next = {
                                                value: space.slug || space.value,
                                                label:
                                                    space.name || space.label,
                                            };
                                            if (!next.value || !next.label) {
                                                return;
                                            }
                                            setCustomGallerySpaces((prev) =>
                                                prev.some(
                                                    (s) =>
                                                        s.value === next.value,
                                                )
                                                    ? prev
                                                    : [...prev, next],
                                            );
                                            setStayGallerySpaceLibrary(
                                                (prev) => {
                                                    if (
                                                        prev.some(
                                                            (s) =>
                                                                s.slug ===
                                                                next.value,
                                                        )
                                                    ) {
                                                        return prev;
                                                    }
                                                    return [
                                                        {
                                                            id:
                                                                space.id ||
                                                                next.value,
                                                            name: next.label,
                                                            slug: next.value,
                                                        },
                                                        ...prev,
                                                    ];
                                                },
                                            );
                                        }}
                                        hideGallery={galleryLocked}
                                        hideLogo={logoLocked}
                                        libraryRoute={
                                            isAdmin
                                                ? route('admin.gallery.browse')
                                                : null
                                        }
                                        errors={form.errors}
                                        onCoverChange={({ file, preview, url }) => {
                                            setCoverPreview(previewMediaUrl(preview));
                                            patch({
                                                cover: file || null,
                                                image_url: file
                                                    ? persistedMediaUrl(
                                                          form.data.image_url,
                                                      )
                                                    : persistedMediaUrl(
                                                          url || preview,
                                                      ),
                                            });
                                        }}
                                        onLogoChange={({ file, preview, url }) => {
                                            setLogoPreview(previewMediaUrl(preview));
                                            patch({
                                                logo: file || null,
                                                logo_url: file
                                                    ? persistedMediaUrl(
                                                          form.data.logo_url,
                                                      )
                                                    : persistedMediaUrl(
                                                          url || preview,
                                                      ),
                                            });
                                        }}
                                        onPosterChange={({
                                            file,
                                            preview,
                                            url,
                                        }) => {
                                            const nextPreview =
                                                previewMediaUrl(preview);
                                            const nextUrl = file
                                                ? persistedMediaUrl(
                                                      form.data
                                                          .event_poster_url,
                                                  )
                                                : persistedMediaUrl(
                                                      url || preview,
                                                  );
                                            setPosterPreview(nextPreview);
                                            setCoverPreview(nextPreview);
                                            patch({
                                                event_poster: file || null,
                                                event_poster_url: nextUrl,
                                                cover: null,
                                                image_url: nextUrl || '',
                                            });
                                        }}
                                        onGalleryChange={setGalleryItems}
                                    />
                                    {galleryLocked ? (
                                        <div className="mt-4">
                                            <TierUpsell
                                                tier={listingTier}
                                                isAdmin={isAdmin}
                                            />
                                            <p className="mt-2 text-xs text-olive-500 dark:text-olive-400">
                                                {isStay
                                                    ? 'Free Stay listings include a cover image only. Standard unlocks a categorized gallery (15 photos per room) · Premium unlocks 30 per room.'
                                                    : isShopping
                                                      ? 'Free Shopping listings include a cover image only. Standard unlocks a 5-photo gallery · Premium unlocks a larger gallery.'
                                                      : isProperties
                                                        ? 'Free Property listings include a cover image only. Standard unlocks a 10-photo gallery · Premium unlocks a larger gallery.'
                                                        : isThingsToDo ||
                                                            isServices ||
                                                            isEvents
                                                          ? 'Free listings include a cover image only. Standard unlocks a photo gallery · Premium unlocks a larger gallery.'
                                                          : null}
                                            </p>
                                        </div>
                                    ) : null}
                                    {logoLocked ? (
                                        <div className="mt-4">
                                            <TierUpsell
                                                tier={listingTier}
                                                isAdmin={isAdmin}
                                            />
                                            <p className="mt-2 text-xs text-olive-500 dark:text-olive-400">
                                                Logo uploads unlock on Standard.
                                            </p>
                                        </div>
                                    ) : null}
                                    {showTierUpsell &&
                                    !galleryLocked &&
                                    galleryMax > 0 ? (
                                        <p className="mt-2 text-xs text-olive-500 dark:text-olive-400">
                                            {isStay
                                                ? `Gallery limit for ${tierLabel}: ${galleryPerRoomMax} photos per room`
                                                : `Gallery limit for ${tierLabel}: ${galleryMax} images`}
                                            {isStay
                                                ? listingTier === 'featured'
                                                    ? ' · Premium unlocks 30 per room'
                                                    : ''
                                                : listingTier === 'free'
                                                  ? ' · Upgrade for a larger gallery'
                                                  : listingTier === 'featured'
                                                    ? ' · Premium unlocks a larger gallery'
                                                    : ''}
                                            {isStay
                                                ? ' · Choose a room tab, then add photos for that space.'
                                                : ''}
                                            .
                                        </p>
                                    ) : null}
                                    {showTierUpsell && videoLocked ? (
                                        <div className="mt-6">
                                            <TierUpsell
                                                tier={listingTier}
                                                isAdmin={isAdmin}
                                            />
                                        </div>
                                    ) : null}
                                    {!videoLocked ? (
                                    <div className="mt-6">
                                        <VideoFields
                                            videoUrl={
                                                form.data.details?.video_url ||
                                                ''
                                            }
                                            uploadUrl={editorVideoUploadUrl}
                                            onChange={(partial) =>
                                                patch({
                                                    details: {
                                                        ...form.data.details,
                                                        ...partial,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    ) : null}
                                    </>
                                ) : null}

                                {step.id === 'contact' ? (
                                    <ContactStep
                                        form={form}
                                        patch={patch}
                                        isEatDrink={isEatDrink}
                                        isStay={isStay}
                                        isShopping={isShopping}
                                        contactMode={contactMode}
                                        canUseFeature={canUseTierFeature}
                                        socialLocked={socialLocked}
                                        listingTier={listingTier}
                                        isAdmin={isAdmin}
                                        TierUpsell={TierUpsell}
                                    />
                                ) : null}

                                {step.id === 'preview' ? (
                                    <ListingPreview
                                        formData={form.data}
                                        category={selectedCategory}
                                        categoryKey={categoryKey}
                                        coverPreview={coverPreview}
                                        logoPreview={logoPreview}
                                        posterPreview={posterPreview}
                                        galleryItems={galleryItems}
                                        amenityOptions={amenityOptions}
                                        onEditStep={(stepId) => {
                                            const idx = STEPS.findIndex(
                                                (s) => s.id === stepId,
                                            );
                                            if (idx >= 0) setStepIndex(idx);
                                        }}
                                    />
                                ) : null}
                            </motion.div>
                        </AnimatePresence>

                        {Object.keys(form.errors).length > 0 ? (
                            <div
                                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                                role="alert"
                            >
                                <p className="font-semibold">
                                    Please fix the highlighted fields before
                                    continuing.
                                </p>
                                <ul className="mt-2 space-y-1.5">
                                    {Object.entries(form.errors)
                                        .slice(0, 6)
                                        .map(([key, msg]) => (
                                            <li key={key}>
                                                <button
                                                    type="button"
                                                    className="text-left underline decoration-rose-300 underline-offset-2 transition hover:text-rose-900 dark:hover:text-rose-200"
                                                    onClick={() => {
                                                        const stepId =
                                                            stepIdForErrorKey(
                                                                key,
                                                            );
                                                        const idx =
                                                            STEPS.findIndex(
                                                                (s) =>
                                                                    s.id ===
                                                                    stepId,
                                                            );
                                                        pendingErrorFocus.current =
                                                            key;
                                                        if (idx >= 0) {
                                                            setStepIndex(idx);
                                                        }
                                                        if (
                                                            idx === stepIndex
                                                        ) {
                                                            focusErrorField(
                                                                key,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <span className="font-semibold">
                                                        {friendlyErrorLabel(
                                                            key,
                                                        )}
                                                        :
                                                    </span>{' '}
                                                    {friendlyErrorMessage(
                                                        key,
                                                        msg,
                                                    )}
                                                </button>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        ) : null}

                        <div
                            className={`flex items-center gap-3 overflow-x-auto border-t border-olive-100 pt-5 [-ms-overflow-style:none] [scrollbar-width:none] dark:border-olive-800 [&::-webkit-scrollbar]:hidden ${
                                isAdmin ? '' : 'pb-20 sm:pb-0'
                            }`}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    if (step.id === 'preview') {
                                        setStepIndex(
                                            STEPS.findIndex((s) => s.id === 'basics'),
                                        );
                                        return;
                                    }
                                    back();
                                }}
                                className="inline-flex shrink-0 items-center px-1 py-2 text-sm font-semibold text-olive-700 transition hover:text-olive-950 dark:text-olive-200 dark:hover:text-olive-50"
                            >
                                {step.id === 'preview' ? 'Edit details' : 'Back'}
                            </button>

                            <div className="ml-auto flex shrink-0 items-center gap-3">
                                <Link
                                    href={isAdmin ? route('admin.listings.index') : route('account.listings.index')}
                                    className="inline-flex shrink-0 items-center px-1 py-2 text-sm font-semibold text-olive-600 transition hover:text-olive-950 dark:text-olive-300 dark:hover:text-olive-50"
                                >
                                    Cancel
                                </Link>
                                {isAdmin ? (
                                    <>
                                        <button
                                            type="button"
                                            disabled={form.processing || editLockedByOther}
                                            onClick={(e) => submit(e, 'draft')}
                                            className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-olive-900/20 bg-white px-3.5 py-2 text-sm font-semibold text-olive-800 transition hover:border-olive-900/40 disabled:opacity-50 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-100 dark:hover:bg-olive-800"
                                        >
                                            <Save className="h-4 w-4" />
                                            {form.processing
                                                ? form.progress?.percentage != null
                                                  ? `Saving ${Math.round(form.progress.percentage)}%`
                                                  : 'Saving…'
                                                : 'Save draft'}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={form.processing || editLockedByOther}
                                            onClick={(e) => submit(e, 'publish')}
                                            className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-mustard px-3.5 py-2 text-sm font-semibold text-earth-dusk transition hover:bg-olive-900 hover:text-white disabled:opacity-50 dark:hover:bg-olive-100 dark:hover:text-earth-dusk"
                                        >
                                            {form.processing
                                                ? form.progress?.percentage != null
                                                  ? `Publishing ${Math.round(form.progress.percentage)}%`
                                                  : 'Publishing…'
                                                : 'Publish'}
                                        </button>
                                    </>
                                ) : null}
                                {step.id !== 'preview' ? (
                                    <button
                                        type="button"
                                        onClick={next}
                                        className="inline-flex shrink-0 items-center rounded-sm bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-mustard hover:text-earth-dusk dark:bg-mustard dark:text-earth-dusk dark:hover:bg-olive-100"
                                    >
                                        Continue
                                    </button>
                                ) : !isAdmin ? (
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-mustard px-3.5 py-2 text-sm font-semibold text-earth-dusk transition hover:bg-olive-900 hover:text-white disabled:opacity-50 dark:hover:bg-olive-100 dark:hover:text-earth-dusk"
                                    >
                                        <Save className="h-4 w-4" />
                                        {form.processing
                                            ? form.progress?.percentage != null
                                              ? `Saving ${Math.round(form.progress.percentage)}%`
                                              : 'Saving…'
                                            : isEdit
                                              ? 'Save changes'
                                              : 'Submit for review'}
                                    </button>
                                ) : null}
                            </div>
                        </div>
                        {form.processing && form.progress?.percentage != null ? (
                            <div className="border-t border-olive-200 px-4 py-2 dark:border-olive-800">
                                <UploadProgressBar
                                    value={form.progress.percentage}
                                    label="Uploading…"
                                />
                            </div>
                        ) : draftUploadProgress != null ? (
                            <div className="border-t border-olive-200 px-4 py-2 dark:border-olive-800">
                                <UploadProgressBar
                                    value={draftUploadProgress}
                                    label="Uploading draft media…"
                                />
                            </div>
                        ) : null}
                    </form>
                        </>
                    )}
                        </div>
                    </div>
                </div>
            )}
        </LayoutComponent>
    );
}

function AdminSectionTabs({ active, onChange }) {
    const tabs = [
        { id: 'listing', label: 'Listing', Icon: FileText },
        { id: 'advanced', label: 'Advanced', Icon: Settings },
    ];

    return (
        <nav
            aria-label="Listing sections"
            className="-mx-1 border-b border-olive-200/80 dark:border-olive-800"
        >
            <div className="flex flex-wrap gap-0.5">
                {tabs.map(({ id, label, Icon }) => {
                    const isActive = active === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => onChange(id)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold transition ${
                                isActive
                                    ? 'bg-mustard/15 text-earth-dusk dark:bg-mustard/20 dark:text-mustard'
                                    : 'text-olive-600 hover:bg-olive-50 hover:text-olive-950 dark:text-olive-400 dark:hover:bg-olive-900 dark:hover:text-olive-100'
                            }`}
                        >
                            <Icon
                                className={`h-4 w-4 ${isActive ? 'text-mustard' : 'opacity-80'}`}
                                strokeWidth={2}
                            />
                            {label}
                            {isActive ? (
                                <span
                                    aria-hidden
                                    className="absolute inset-x-0 bottom-0 h-0.5 bg-mustard"
                                />
                            ) : null}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

function AdminControls({
    form,
    owners,
    statuses,
    claimStatuses,
    allowedTiers,
    listing,
    onSlugChange,
}) {
    const { data, setData, errors } = form;

    return (
        <div className={sectionCard}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                    <label className={label} htmlFor="user_id">
                        Owner
                    </label>
                    <select
                        id="user_id"
                        className={field}
                        value={data.user_id}
                        onChange={(e) => setData('user_id', e.target.value)}
                    >
                        <option value="">No owner</option>
                        {owners.map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.name} · {o.email}
                            </option>
                        ))}
                    </select>
                    {errors.user_id ? (
                        <p className="mt-1.5 text-sm text-rose-600">{errors.user_id}</p>
                    ) : null}
                </div>

                <div>
                    <label className={label} htmlFor="slug">
                        Slug
                    </label>
                    <input
                        id="slug"
                        className={field}
                        value={data.slug}
                        onChange={(e) =>
                            onSlugChange
                                ? onSlugChange(e.target.value)
                                : setData('slug', e.target.value)
                        }
                        placeholder="auto from title if empty"
                    />
                    {errors.slug ? (
                        <p className="mt-1.5 text-sm text-rose-600">{errors.slug}</p>
                    ) : null}
                </div>

                <div>
                    <label className={label} htmlFor="status">
                        Status
                    </label>
                    <select
                        id="status"
                        className={field}
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                    >
                        {statuses.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                    {errors.status ? (
                        <p className="mt-1.5 text-sm text-rose-600">{errors.status}</p>
                    ) : null}
                </div>

                <div>
                    <label className={label} htmlFor="claim_status">
                        Claim status
                    </label>
                    <select
                        id="claim_status"
                        className={field}
                        value={data.claim_status}
                        onChange={(e) => setData('claim_status', e.target.value)}
                    >
                        {claimStatuses.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                    {errors.claim_status ? (
                        <p className="mt-1.5 text-sm text-rose-600">{errors.claim_status}</p>
                    ) : null}
                </div>

                <div>
                    <label className={label} htmlFor="tier">
                        Plan
                    </label>
                    <select
                        id="tier"
                        className={field}
                        value={data.tier}
                        onChange={(e) => {
                            const nextTier = e.target.value;
                            const nextPriority =
                                nextTier === 'premium'
                                    ? 3
                                    : nextTier === 'featured'
                                      ? 2
                                      : 1;
                            setData((current) => ({
                                ...current,
                                tier: nextTier,
                                priority: nextPriority,
                                is_featured:
                                    nextTier === 'featured' ||
                                    nextTier === 'premium',
                            }));
                        }}
                    >
                        {(allowedTiers?.length
                            ? allowedTiers
                            : ['free', 'featured', 'premium']
                        ).map((t) => (
                            <option key={t} value={t}>
                                {tierLabels[t] || t}
                            </option>
                        ))}
                    </select>
                    {errors.tier ? (
                        <p className="mt-1.5 text-sm text-rose-600">{errors.tier}</p>
                    ) : null}
                </div>

                <div>
                    <label className={label} htmlFor="priority">
                        Sort priority
                    </label>
                    <select
                        id="priority"
                        className={field}
                        value={String(
                            [1, 2, 3, 4].includes(Number(data.priority))
                                ? Number(data.priority)
                                : data.tier === 'premium'
                                  ? 3
                                  : data.tier === 'featured'
                                    ? 2
                                    : 1,
                        )}
                        onChange={(e) => {
                            const nextPriority = Number(e.target.value);
                            if (nextPriority === 4) {
                                setData('priority', 4);
                                return;
                            }
                            const nextTier =
                                nextPriority === 3
                                    ? 'premium'
                                    : nextPriority === 2
                                      ? 'featured'
                                      : 'free';
                            setData((current) => ({
                                ...current,
                                priority: nextPriority,
                                tier: nextTier,
                                is_featured:
                                    nextTier === 'featured' ||
                                    nextTier === 'premium',
                            }));
                        }}
                    >
                        <option value="1">1 · Free (lowest)</option>
                        <option value="2">2 · Standard</option>
                        <option value="3">3 · Premium</option>
                        <option value="4">4 · Promoted (below hero)</option>
                    </select>
                    <p className="mt-1.5 text-xs text-olive-500">
                        Free / Standard / Premium match Plan (1–3). Promoted (4)
                        keeps the current plan and places the listing under the
                        homepage hero.
                    </p>
                    {errors.priority ? (
                        <p className="mt-1.5 text-sm text-rose-600">{errors.priority}</p>
                    ) : null}
                </div>

                <div>
                    <label className={label} htmlFor="expires_at">
                        Expires at
                    </label>
                    <input
                        id="expires_at"
                        type="datetime-local"
                        className={field}
                        value={data.expires_at}
                        onChange={(e) => setData('expires_at', e.target.value)}
                    />
                    {errors.expires_at ? (
                        <p className="mt-1.5 text-sm text-rose-600">{errors.expires_at}</p>
                    ) : null}
                </div>

                <div>
                    <label className={label} htmlFor="published_at">
                        Published at
                    </label>
                    <input
                        id="published_at"
                        type="datetime-local"
                        className={field}
                        value={data.published_at}
                        onChange={(e) => setData('published_at', e.target.value)}
                    />
                    {errors.published_at ? (
                        <p className="mt-1.5 text-sm text-rose-600">{errors.published_at}</p>
                    ) : null}
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-5">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-olive-300 text-mustard focus:ring-mustard"
                        checked={data.is_published}
                        onChange={(e) => setData('is_published', e.target.checked)}
                    />
                    <span className="text-sm font-medium text-olive-700 dark:text-olive-200">Published on site</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-olive-300 text-mustard focus:ring-mustard"
                        checked={data.is_featured}
                        onChange={(e) => setData('is_featured', e.target.checked)}
                    />
                    <span className="text-sm font-medium text-olive-700 dark:text-olive-200">Featured</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-olive-300 text-mustard focus:ring-mustard"
                        checked={data.is_trending}
                        onChange={(e) => setData('is_trending', e.target.checked)}
                    />
                    <span className="text-sm font-medium text-olive-700 dark:text-olive-200">Trending</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-olive-300 text-mustard focus:ring-mustard"
                        checked={data.is_verified}
                        onChange={(e) => setData('is_verified', e.target.checked)}
                    />
                    <span className="text-sm font-medium text-olive-700 dark:text-olive-200">
                        Verified badge
                    </span>
                </label>
            </div>
            <p className="mt-2 text-xs text-olive-500 dark:text-olive-400">
                Verified badge shows a blue tick before the listing title. It turns
                on automatically when a claim is approved, and you can toggle it
                here anytime.
            </p>
        </div>
    );
}

function BasicsStep({
    form,
    categoryKey,
    subs,
    isEdit,
    categories,
    patch,
    slugTouched,
    descriptionWordLimit = null,
    hideTagline = false,
    uploadUrl = null,
}) {
    const wordCount = eatDrinkCountWords(form.data.description);
    const overLimit =
        descriptionWordLimit != null && wordCount > descriptionWordLimit;
    const selectedSubs = Array.isArray(form.data.subcategory)
        ? form.data.subcategory
        : [];
    const availableSubs = subs.filter((s) => !selectedSubs.includes(s));

    const addSubcategory = (value) => {
        if (!value || selectedSubs.includes(value)) return;
        patch({ subcategory: [...selectedSubs, value] });
    };

    const removeSubcategory = (value) => {
        patch({
            subcategory: selectedSubs.filter((item) => item !== value),
        });
    };

    return (
        <>
            <div data-error-field="title">
                <FieldLabel htmlFor="title" required>
                    {categoryNameLabel(categoryKey)}
                </FieldLabel>
                <input
                    id="title"
                    className={fieldClass(Boolean(form.errors.title))}
                    value={form.data.title}
                    onChange={(e) => {
                        const value = e.target.value;
                        patch(
                            slugTouched.current
                                ? { title: value }
                                : { title: value, slug: slugifyTitle(value) },
                        );
                    }}
                    aria-invalid={form.errors.title ? true : undefined}
                    aria-describedby={
                        form.errors.title ? 'title-error' : undefined
                    }
                    required
                />
                <FieldError
                    id="title-error"
                    message={form.errors.title}
                />
            </div>

            <div className="grid gap-4">
                {isEdit ? (
                    <div>
                        <FieldLabel htmlFor="category_id" required>
                            Category
                        </FieldLabel>
                        <select
                            id="category_id"
                            className={field}
                            value={form.data.category_id}
                            onChange={(e) => {
                                const cat = categories.find(
                                    (c) =>
                                        String(c.id) === String(e.target.value),
                                );
                                const key = resolveCategoryKey(cat);
                                patch({
                                    category_id: e.target.value,
                                    subcategory: [],
                                    property_type: '',
                                    details: emptyDetailsFor(key),
                                });
                            }}
                            required
                        >
                            <option value="">Select…</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : null}

                <div>
                    <FieldLabel htmlFor="subcategory" required>
                        Subcategory
                    </FieldLabel>
                    <p className="mb-2 text-xs text-olive-600 dark:text-olive-400">
                        Choose one or more. Remove a chip to drop it.
                    </p>
                    <select
                        id="subcategory"
                        className={field}
                        value=""
                        onChange={(e) => {
                            addSubcategory(e.target.value);
                            e.target.value = '';
                        }}
                        disabled={availableSubs.length === 0}
                        required={selectedSubs.length === 0}
                    >
                        <option value="">
                            {availableSubs.length
                                ? 'Select a subcategory…'
                                : 'All subcategories selected'}
                        </option>
                        {availableSubs.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                    {selectedSubs.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {selectedSubs.map((s) => (
                                <span
                                    key={s}
                                    className="inline-flex max-w-full items-center gap-1.5 border border-olive-900/15 bg-olive-50 py-1.5 pl-3 pr-1 text-xs font-semibold text-olive-900 dark:border-olive-700 dark:bg-olive-800 dark:text-olive-100"
                                >
                                    <span className="truncate">{s}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSubcategory(s)}
                                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-olive-700 transition hover:bg-olive-200 hover:text-olive-950 dark:text-olive-200 dark:hover:bg-olive-700 dark:hover:text-white"
                                        aria-label={`Remove ${s}`}
                                    >
                                        <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    ) : null}
                    {form.errors.subcategory ? (
                        <p className="mt-1.5 text-sm text-rose-600">
                            {form.errors.subcategory}
                        </p>
                    ) : null}
                </div>

                {categoryKey === 'properties' ? (
                    <div>
                        <FieldLabel htmlFor="property_type" required>
                            Property type
                        </FieldLabel>
                        <select
                            id="property_type"
                            className={field}
                            value={form.data.property_type}
                            onChange={(e) =>
                                patch({ property_type: e.target.value })
                            }
                            required
                        >
                            <option value="">Select type…</option>
                            {PROPERTY_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                        {form.errors.property_type ? (
                            <p className="mt-1.5 text-sm text-rose-600">
                                {form.errors.property_type}
                            </p>
                        ) : null}
                    </div>
                ) : null}
            </div>

            {!hideTagline ? (
                <div>
                    <FieldLabel htmlFor="tagline">Short tagline</FieldLabel>
                    <input
                        id="tagline"
                        className={field}
                        value={form.data.tagline}
                        onChange={(e) => patch({ tagline: e.target.value })}
                        placeholder="What makes this place special?"
                        maxLength={180}
                    />
                </div>
            ) : null}

            <RichTextEditor
                value={form.data.description}
                onChange={(description) => patch({ description })}
                uploadUrl={uploadUrl}
                error={
                    form.errors.description ||
                    (overLimit
                        ? `Free plans allow up to ${descriptionWordLimit} words (${wordCount} used). Upgrade to Standard for unlimited length.`
                        : null)
                }
                placeholder="Share the story, vibe, and what visitors should know…"
                help={
                    descriptionWordLimit != null
                        ? `${wordCount} / ${descriptionWordLimit} words · Free plan limit. Standard unlocks unlimited description.`
                        : `${wordCount} ${wordCount === 1 ? 'word' : 'words'} · Shown as the About section on your public listing page.`
                }
            />
        </>
    );
}

function ContactStep({
    form,
    patch,
    isEatDrink = false,
    isStay = false,
    isShopping = false,
    contactMode = 'open',
    canUseFeature = () => true,
    socialLocked = false,
    listingTier = 'free',
    isAdmin = false,
    TierUpsell = null,
}) {
    const websiteLinks = Array.isArray(form.data.social_links?.links)
        ? form.data.social_links.links
        : [];
    const isConversion = contactMode === 'conversion';
    const isGated = contactMode !== 'open';
    const premiumContactUnlocked =
        !isConversion || canUseFeature('whatsapp');
    const showExtended = !isGated || !socialLocked;
    const showPremiumContactExtras = !isConversion || premiumContactUnlocked;
    const Upsell = TierUpsell;
    const linksEndRef = useRef(null);
    const prevLinkCount = useRef(websiteLinks.length);

    useEffect(() => {
        if (websiteLinks.length > prevLinkCount.current) {
            linksEndRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
        prevLinkCount.current = websiteLinks.length;
    }, [websiteLinks.length]);

    const setWebsiteLinks = (links) => {
        patch({
            social_links: {
                ...form.data.social_links,
                links,
            },
        });
    };

    const updateLink = (index, key, value) => {
        const next = websiteLinks.map((item, i) =>
            i === index ? { ...item, [key]: value } : item,
        );
        setWebsiteLinks(next);
    };

    const addLink = () => {
        setWebsiteLinks([...websiteLinks, { label: '', url: '' }]);
    };

    const removeLink = (index) => {
        setWebsiteLinks(websiteLinks.filter((_, i) => i !== index));
    };

    const linkLabelOptions = isStay
        ? [
              'Book now',
              'Booking page',
              'Airbnb',
              'Check availability',
              'Google Maps',
              'Directions',
              'Website',
          ]
        : isEatDrink
          ? [
                'Book a table',
                'Menu',
                'Order online',
                'Reservations',
                'Google Maps',
                'Directions',
                'Website',
            ]
          : isShopping
            ? [
                  'WhatsApp catalog',
                  'Online store',
                  'Shop',
                  'Google Maps',
                  'Directions',
                  'Website',
              ]
            : [
                  'Website',
                  'Booking',
                  'Shop',
                  'Google Maps',
                  'Directions',
                  'Portfolio',
                  'Tickets',
                  'Menu',
              ];

    // Stay Free: phone + email. Eat & Drink Free: phone only.
    // Conversion (shopping/properties/thingsToDo/services/events):
    //   Free phone · Standard email+social · Premium WhatsApp/website/links
    const contactFields =
        contactMode === 'stay'
            ? [
                  ['phone', 'Contact number', 'text', false],
                  ['email', 'Email', 'email', false],
                  ['whatsapp', 'WhatsApp', 'text', true],
                  ['website', 'Primary website', 'text', true],
              ]
            : contactMode === 'eatDrink'
              ? [
                    ['phone', 'Contact number', 'text', false],
                    ['whatsapp', 'WhatsApp', 'text', true],
                    ['email', 'Email', 'email', true],
                    ['website', 'Primary website', 'text', true],
                ]
              : contactMode === 'conversion'
                ? [
                      ['phone', 'Contact number', 'text', false],
                      ['email', 'Email', 'email', 'standard'],
                      ['whatsapp', 'WhatsApp', 'text', 'premium'],
                      ['website', 'Primary website', 'text', 'premium'],
                  ]
                : [
                      ['phone', 'Phone', 'text', false],
                      ['whatsapp', 'WhatsApp', 'text', false],
                      ['email', 'Email', 'email', false],
                      ['website', 'Primary website', 'text', false],
                  ];

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold text-olive-950 dark:text-white">
                        Contact & social
                    </h3>
                    <p className="mt-1 text-sm text-olive-600 dark:text-olive-400">
                        How should people reach you?
                    </p>
                </div>
                {showExtended && showPremiumContactExtras ? (
                    <button
                        type="button"
                        onClick={addLink}
                        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-sm border border-olive-200 bg-white px-3.5 text-xs font-semibold text-olive-800 transition hover:border-mustard dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100 dark:hover:border-mustard"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add link
                    </button>
                ) : null}
            </div>

            {isGated && socialLocked && Upsell ? (
                <Upsell tier={listingTier} isAdmin={isAdmin} />
            ) : null}
            {isConversion &&
            showExtended &&
            !showPremiumContactExtras &&
            Upsell ? (
                <Upsell tier={listingTier} isAdmin={isAdmin} />
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
                {contactFields
                    .filter(([, , , gated]) => {
                        if (!gated) return true;
                        if (isConversion) {
                            if (gated === 'standard') return !socialLocked;
                            if (gated === 'premium') {
                                return showPremiumContactExtras;
                            }
                            return showExtended;
                        }
                        return showExtended;
                    })
                    .map(([key, text, type]) => (
                        <div key={key}>
                            <label className={label} htmlFor={key}>
                                {text}
                            </label>
                            <input
                                id={key}
                                type={type || 'text'}
                                className={field}
                                value={form.data[key] || ''}
                                onChange={(e) =>
                                    patch({ [key]: e.target.value })
                                }
                                placeholder={key === 'website' ? 'https://' : ''}
                            />
                        </div>
                    ))}
            </div>

            {showExtended ? (
                <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {(isGated
                            ? ['facebook', 'instagram']
                            : ['instagram', 'facebook', 'tiktok', 'youtube']
                        ).map((net) => (
                            <div key={net}>
                                <label
                                    className={label}
                                    htmlFor={`social_${net}`}
                                >
                                    {net.charAt(0).toUpperCase() + net.slice(1)}
                                </label>
                                <input
                                    id={`social_${net}`}
                                    className={field}
                                    value={
                                        form.data.social_links?.[net] || ''
                                    }
                                    onChange={(e) =>
                                        patch({
                                            social_links: {
                                                ...form.data.social_links,
                                                [net]: e.target.value,
                                            },
                                        })
                                    }
                                    placeholder="https://"
                                />
                            </div>
                        ))}
                    </div>

                    {showPremiumContactExtras && websiteLinks.length > 0 ? (
                        <div className="space-y-4 border-t border-olive-100 pt-5 dark:border-olive-800">
                            <div>
                                <p className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                                    More website links
                                </p>
                                <p className="mt-0.5 text-xs text-olive-500 dark:text-olive-400">
                                    Booking pages, menus, online shops, Google
                                    Maps, or other sites you want visitors to
                                    open.
                                </p>
                            </div>
                            <div className="space-y-4">
                                {websiteLinks.map((item, index) => {
                                    const knownLabel = linkLabelOptions.includes(
                                        item.label,
                                    );
                                    const selectValue = knownLabel
                                        ? item.label
                                        : item.label
                                          ? '__custom__'
                                          : '';

                                    return (
                                        <div
                                            key={index}
                                            className="grid gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_auto] sm:items-end"
                                        >
                                            <div>
                                                <label
                                                    className={label}
                                                    htmlFor={`website_link_label_${index}`}
                                                >
                                                    Label
                                                </label>
                                                <select
                                                    id={`website_link_label_${index}`}
                                                    className={field}
                                                    value={selectValue}
                                                    onChange={(e) => {
                                                        const next =
                                                            e.target.value;
                                                        if (
                                                            next ===
                                                            '__custom__'
                                                        ) {
                                                            updateLink(
                                                                index,
                                                                'label',
                                                                item.label &&
                                                                    !linkLabelOptions.includes(
                                                                        item.label,
                                                                    )
                                                                    ? item.label
                                                                    : '',
                                                            );
                                                            return;
                                                        }
                                                        updateLink(
                                                            index,
                                                            'label',
                                                            next,
                                                        );
                                                    }}
                                                >
                                                    <option value="">
                                                        Select…
                                                    </option>
                                                    {linkLabelOptions.map(
                                                        (opt) => (
                                                            <option
                                                                key={opt}
                                                                value={opt}
                                                            >
                                                                {opt}
                                                            </option>
                                                        ),
                                                    )}
                                                    <option value="__custom__">
                                                        Custom…
                                                    </option>
                                                </select>
                                                {selectValue ===
                                                '__custom__' ? (
                                                    <input
                                                        className={`${field} mt-2`}
                                                        value={item.label || ''}
                                                        onChange={(e) =>
                                                            updateLink(
                                                                index,
                                                                'label',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Custom label"
                                                        autoFocus
                                                    />
                                                ) : null}
                                            </div>
                                            <div>
                                                <label
                                                    className={label}
                                                    htmlFor={`website_link_url_${index}`}
                                                >
                                                    URL
                                                </label>
                                                <input
                                                    id={`website_link_url_${index}`}
                                                    className={field}
                                                    value={item.url || ''}
                                                    onChange={(e) =>
                                                        updateLink(
                                                            index,
                                                            'url',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="https://"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeLink(index)
                                                }
                                                className="inline-flex h-11 items-center justify-center rounded-sm border border-olive-200 px-3 text-olive-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-olive-700 dark:text-olive-400 dark:hover:border-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                                                aria-label={`Remove link ${index + 1}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            <div ref={linksEndRef} />
                        </div>
                    ) : null}
                </>
            ) : null}
        </div>
    );
}

function CategoryPicker({ categories, selectedId, onPick, error }) {
    return (
        <div>
            <p className="mb-2 text-sm text-olive-600 dark:text-olive-400">
                Choose a category. Each one has its own fields tailored to that
                listing type.
            </p>
            <h2 className="mb-5 font-display text-xl font-semibold text-olive-950 dark:text-white sm:text-2xl">
                What are you listing?
            </h2>

            {error ? (
                <p className="mb-4 text-sm text-rose-600 dark:text-rose-400">
                    {error}
                </p>
            ) : null}

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {categories.map((category) => {
                    const Icon = iconForSlug(category.slug);
                    const selected =
                        String(selectedId) === String(category.id);

                    return (
                        <motion.button
                            key={category.id}
                            type="button"
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onPick(category)}
                            className={`group relative flex flex-col items-center gap-3 rounded-sm bg-white px-3 py-6 text-center shadow-soft ring-1 transition dark:bg-olive-900 dark:shadow-none sm:py-8 ${
                                selected
                                    ? 'ring-2 ring-mustard shadow-lift'
                                    : 'ring-olive-200/60 hover:shadow-lift hover:ring-olive-300 dark:ring-olive-700 dark:hover:ring-olive-600'
                            }`}
                        >
                            {selected ? (
                                <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-mustard text-earth-dusk">
                                    <Check
                                        className="h-3.5 w-3.5"
                                        strokeWidth={2.5}
                                    />
                                </span>
                            ) : null}
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center text-olive-700 transition group-hover:text-olive-900 dark:text-olive-300 dark:group-hover:text-olive-100">
                                <Icon className="h-8 w-8" />
                            </span>
                            <span className="font-display text-sm font-semibold leading-snug text-earth-dusk dark:text-olive-50 sm:text-base">
                                {labelForCategory(category)}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            <div className="mt-6">
                <Link
                    href={route('account.listings.index')}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-olive-600 transition hover:text-olive-900 dark:text-olive-400 dark:hover:text-olive-100"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to listings
                </Link>
            </div>
        </div>
    );
}
