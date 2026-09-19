import AmenitiesPicker from '@/Components/listing-form/AmenitiesPicker';
import CategoryFields from '@/Components/listing-form/CategoryFields';
import GalleryUploader from '@/Components/listing-form/GalleryUploader';
import HoursEditor from '@/Components/listing-form/HoursEditor';
import ListingPreview from '@/Components/listing-form/ListingPreview';
import PlacesLocationInput from '@/Components/listing-form/PlacesLocationInput';
import RichTextEditor from '@/Components/listing-form/RichTextEditor';
import {
    emptyDetailsFor,
} from '@/Components/listing-form/categoryFieldConfig';
import {
    defaultHours,
    field,
    label,
    sectionCard,
} from '@/Components/listing-form/fieldStyles';
import AccountLayout from '@/Layouts/AccountLayout';
import { PROPERTY_TYPES, mainCategories } from '@/data/categories';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BedDouble,
    Briefcase,
    CalendarDays,
    Camera,
    Check,
    ChevronLeft,
    ChevronRight,
    Coffee,
    Home,
    Save,
    ShoppingCart,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const tierLabels = {
    free: 'Free',
    featured: 'Standard',
    premium: 'Premium',
};

const categoryIcons = {
    eatDrink: Coffee,
    'eat-drink': Coffee,
    stay: BedDouble,
    thingsToDo: Camera,
    'things-to-do': Camera,
    services: Briefcase,
    shopping: ShoppingCart,
    properties: Home,
    events: CalendarDays,
};

function iconForSlug(slug) {
    return categoryIcons[slug] || Coffee;
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

function subcategoriesFor(categoryKey) {
    return mainCategories.find((c) => c.key === categoryKey)?.children || [];
}

const STEPS = [
    { id: 'basics', title: 'Basics' },
    { id: 'location', title: 'Location' },
    { id: 'details', title: 'Details' },
    { id: 'amenities', title: 'Features' },
    { id: 'media', title: 'Photos' },
    { id: 'contact', title: 'Contact' },
    { id: 'preview', title: 'Preview' },
];

function galleryFromListing(listing) {
    const urls = listing?.gallery || [];
    return urls.map((url, i) => ({
        id: `existing-${i}`,
        url,
        preview: url,
        file: null,
    }));
}

export default function Form({
    listing = null,
    categories = [],
    amenities: initialAmenities = [],
    mapsApiKey = '',
    plan,
    allowedTiers = ['free'],
}) {
    const isEdit = Boolean(listing?.id);
    const { errors: pageErrors } = usePage().props;
    const [amenityOptions, setAmenityOptions] = useState(initialAmenities);

    const initialCategory = categories.find(
        (c) => String(c.id) === String(listing?.category_id),
    );
    const initialKey = resolveCategoryKey(initialCategory);

    const form = useForm({
        title: listing?.title || '',
        category_id: listing?.category_id || '',
        subcategory: listing?.subcategory || '',
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
        image_url: listing?.image_url || '',
        logo_url: listing?.logo_url || '',
        event_poster_url: listing?.event_poster_url || '',
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
        },
        details: {
            ...emptyDetailsFor(initialKey || 'eatDrink'),
            ...(listing?.details || {}),
        },
        start_at: listing?.start_at || '',
        end_at: listing?.end_at || '',
        ticket_price: listing?.ticket_price || '',
        early_bird_price: listing?.early_bird_price || '',
        gate_price: listing?.gate_price || '',
        ticket_url: listing?.ticket_url || '',
        tier: listing?.tier || plan?.key || 'free',
        cover: null,
        logo: null,
        event_poster: null,
        gallery_files: [],
        gallery_urls: (listing?.gallery || []).filter(Boolean),
    });

    const [coverPreview, setCoverPreview] = useState(
        listing?.image_url || null,
    );
    const [logoPreview, setLogoPreview] = useState(listing?.logo_url || null);
    const [posterPreview, setPosterPreview] = useState(
        listing?.event_poster_url || null,
    );
    const [galleryItems, setGalleryItems] = useState(() =>
        galleryFromListing(listing),
    );

    const hasServerErrors = Boolean(
        pageErrors && Object.keys(pageErrors).length > 0,
    );

    const [phase, setPhase] = useState(() => {
        if (isEdit) return 'wizard';
        if (hasServerErrors && form.data.category_id) return 'wizard';
        return 'category';
    });

    const [stepIndex, setStepIndex] = useState(0);

    const selectedCategory = useMemo(
        () =>
            categories.find(
                (c) => String(c.id) === String(form.data.category_id),
            ) || null,
        [categories, form.data.category_id],
    );

    const categoryKey = resolveCategoryKey(selectedCategory);
    const subs = subcategoriesFor(categoryKey);

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
            subcategory: '',
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
    };

    const patch = (partial) => {
        form.setData((data) => ({ ...data, ...partial }));
    };

    const validateStep = () => {
        const step = STEPS[stepIndex]?.id;
        if (step === 'basics') {
            if (!form.data.title?.trim()) {
                form.setError('title', 'Name is required.');
                return false;
            }
            if (!form.data.subcategory) {
                form.setError('subcategory', 'Please choose a subcategory.');
                return false;
            }
            if (categoryKey === 'properties' && !form.data.property_type) {
                form.setError('property_type', 'Please choose a property type.');
                return false;
            }
        }
        if (step === 'location' && !form.data.location?.trim()) {
            form.setError('location', 'Location is required.');
            return false;
        }
        if (step === 'details' && categoryKey === 'events') {
            if (!form.data.start_at) {
                form.setError('start_at', 'Start date is required for events.');
                return false;
            }
            if (!form.data.venue?.trim()) {
                form.setError('venue', 'Venue is required for events.');
                return false;
            }
        }
        if (step === 'media' && !coverPreview && !form.data.image_url) {
            form.setError('cover', 'Please add a cover image.');
            return false;
        }
        form.clearErrors();
        return true;
    };

    const next = () => {
        if (!validateStep()) return;
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

    const submit = (e) => {
        e.preventDefault();
        if (!form.data.category_id) {
            setPhase('category');
            return;
        }

        const galleryUrls = galleryItems
            .filter((g) => g.url && !g.file)
            .map((g) => g.url);
        const galleryFiles = galleryItems
            .filter((g) => g.file)
            .map((g) => g.file);

        form.transform((data) => {
            const payload = {
                ...data,
                gallery_urls: JSON.stringify(galleryUrls),
                gallery_files: galleryFiles,
                amenities: JSON.stringify(data.amenities || []),
                hours:
                    categoryKey === 'properties' || categoryKey === 'events'
                        ? null
                        : JSON.stringify(data.hours || []),
                details: JSON.stringify(data.details || {}),
                social_links: JSON.stringify(data.social_links || {}),
                latitude: data.latitude === '' ? null : data.latitude,
                longitude: data.longitude === '' ? null : data.longitude,
            };

            if (isEdit) {
                payload._method = 'put';
            }

            return payload;
        });

        const options = {
            forceFormData: true,
            onError: () => setStepIndex(0),
        };

        if (isEdit) {
            form.post(route('account.listings.update', listing.id), options);
        } else {
            form.post(route('account.listings.store'), options);
        }
    };

    const step = STEPS[stepIndex];
    const progress = ((stepIndex + 1) / STEPS.length) * 100;

    return (
        <AccountLayout title={isEdit ? 'Edit listing' : 'Add listing'}>
            <Head title={isEdit ? 'Edit listing' : 'New listing'} />

            {phase === 'category' && !isEdit ? (
                <CategoryPicker
                    categories={orderedCategories}
                    selectedId={form.data.category_id}
                    onPick={pickCategory}
                    error={form.errors.category_id}
                />
            ) : (
                <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-olive-600">
                                {categoryIntro(categoryKey)}
                            </p>
                            {selectedCategory ? (
                                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-olive-500">
                                    {selectedCategory.name}
                                    {form.data.subcategory
                                        ? ` · ${form.data.subcategory}`
                                        : ''}
                                </p>
                            ) : null}
                        </div>
                        {!isEdit ? (
                            <button
                                type="button"
                                onClick={() => setPhase('category')}
                                className="inline-flex items-center gap-1 text-sm font-semibold text-olive-700 hover:text-olive-950"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Change category
                            </button>
                        ) : null}
                    </div>

                    <div className="rounded-2xl border border-olive-100 bg-white p-3 shadow-soft">
                        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-olive-600">
                            <span>
                                Step {stepIndex + 1} of {STEPS.length} ·{' '}
                                {step.title}
                            </span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-olive-100">
                            <motion.div
                                className="h-full rounded-full bg-mustard"
                                animate={{ width: `${progress}%` }}
                                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                            />
                        </div>
                        <div className="mt-3 hidden gap-1 sm:flex">
                            {STEPS.map((s, i) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => {
                                        if (i <= stepIndex) setStepIndex(i);
                                    }}
                                    className={`flex-1 rounded-lg px-1 py-1.5 text-[11px] font-semibold transition ${
                                        i === stepIndex
                                            ? 'bg-olive-900 text-white'
                                            : i < stepIndex
                                              ? 'bg-mustard/40 text-olive-900'
                                              : 'bg-olive-50 text-olive-400'
                                    }`}
                                >
                                    {s.title}
                                </button>
                            ))}
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
                                        allowedTiers={allowedTiers}
                                        patch={patch}
                                    />
                                ) : null}

                                {step.id === 'location' ? (
                                    <PlacesLocationInput
                                        apiKey={mapsApiKey}
                                        location={form.data.location}
                                        address={form.data.address}
                                        city={form.data.city}
                                        latitude={form.data.latitude}
                                        longitude={form.data.longitude}
                                        errors={form.errors}
                                        onChange={(partial) => patch(partial)}
                                    />
                                ) : null}

                                {step.id === 'details' ? (
                                    <>
                                        <CategoryFields
                                            categoryKey={categoryKey}
                                            details={form.data.details}
                                            priceRange={form.data.price_range}
                                            onDetailsChange={(details) =>
                                                patch({ details })
                                            }
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
                                                          ticket_price:
                                                              form.data
                                                                  .ticket_price,
                                                          early_bird_price:
                                                              form.data
                                                                  .early_bird_price,
                                                          gate_price:
                                                              form.data
                                                                  .gate_price,
                                                          ticket_url:
                                                              form.data
                                                                  .ticket_url,
                                                      }
                                                    : null
                                            }
                                            onEventChange={(partial) =>
                                                patch(partial)
                                            }
                                        />
                                        {categoryKey !== 'properties' &&
                                        categoryKey !== 'events' ? (
                                            <HoursEditor
                                                hours={form.data.hours}
                                                onChange={(hours) =>
                                                    patch({ hours })
                                                }
                                            />
                                        ) : null}
                                    </>
                                ) : null}

                                {step.id === 'amenities' ? (
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
                                ) : null}

                                {step.id === 'media' ? (
                                    <GalleryUploader
                                        coverPreview={coverPreview}
                                        logoPreview={logoPreview}
                                        posterPreview={posterPreview}
                                        galleryItems={galleryItems}
                                        showPoster={categoryKey === 'events'}
                                        errors={form.errors}
                                        onCoverChange={({ file, preview, url }) => {
                                            setCoverPreview(preview);
                                            patch({
                                                cover: file || null,
                                                image_url: url || form.data.image_url,
                                            });
                                        }}
                                        onLogoChange={({ file, preview }) => {
                                            setLogoPreview(preview);
                                            patch({ logo: file || null });
                                        }}
                                        onPosterChange={({ file, preview }) => {
                                            setPosterPreview(preview);
                                            patch({
                                                event_poster: file || null,
                                            });
                                        }}
                                        onGalleryChange={setGalleryItems}
                                    />
                                ) : null}

                                {step.id === 'contact' ? (
                                    <ContactStep form={form} patch={patch} />
                                ) : null}

                                {step.id === 'preview' ? (
                                    <ListingPreview
                                        formData={form.data}
                                        category={selectedCategory}
                                        categoryKey={categoryKey}
                                        coverPreview={coverPreview}
                                        logoPreview={logoPreview}
                                        posterPreview={posterPreview}
                                    />
                                ) : null}
                            </motion.div>
                        </AnimatePresence>

                        {Object.keys(form.errors).length > 0 ? (
                            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                Please fix the highlighted fields before continuing.
                                <ul className="mt-2 list-disc pl-5">
                                    {Object.entries(form.errors)
                                        .slice(0, 6)
                                        .map(([key, msg]) => (
                                            <li key={key}>{msg}</li>
                                        ))}
                                </ul>
                            </div>
                        ) : null}

                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-olive-100 pb-20 pt-5 sm:pb-0">
                            <button
                                type="button"
                                onClick={back}
                                className="inline-flex items-center gap-1 rounded-xl border border-olive-200 px-4 py-2.5 text-sm font-semibold text-olive-700"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </button>

                            <div className="flex flex-wrap gap-2">
                                <Link
                                    href={route('account.index')}
                                    className="rounded-xl border border-olive-200 px-4 py-2.5 text-sm font-semibold text-olive-700"
                                >
                                    Cancel
                                </Link>
                                {step.id !== 'preview' ? (
                                    <button
                                        type="button"
                                        onClick={next}
                                        className="inline-flex items-center gap-2 rounded-xl bg-olive-900 px-4 py-2.5 text-sm font-bold text-white"
                                    >
                                        Continue
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="inline-flex items-center gap-2 rounded-xl bg-mustard px-4 py-2.5 text-sm font-bold text-earth-dusk disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4" />
                                        {form.processing
                                            ? 'Saving…'
                                            : isEdit
                                              ? 'Save changes'
                                              : 'Submit for review'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </AccountLayout>
    );
}

function BasicsStep({
    form,
    categoryKey,
    subs,
    isEdit,
    categories,
    allowedTiers,
    patch,
}) {
    return (
        <>
            <div>
                <label className={label} htmlFor="title">
                    {categoryNameLabel(categoryKey)}
                </label>
                <input
                    id="title"
                    className={field}
                    value={form.data.title}
                    onChange={(e) => patch({ title: e.target.value })}
                    required
                />
                {form.errors.title ? (
                    <p className="mt-1.5 text-sm text-rose-600">
                        {form.errors.title}
                    </p>
                ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {isEdit ? (
                    <div>
                        <label className={label} htmlFor="category_id">
                            Category
                        </label>
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
                                    subcategory: '',
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

                <div className={isEdit ? '' : 'sm:col-span-2'}>
                    <label className={label} htmlFor="subcategory">
                        Subcategory
                    </label>
                    <select
                        id="subcategory"
                        className={field}
                        value={form.data.subcategory}
                        onChange={(e) =>
                            patch({ subcategory: e.target.value })
                        }
                        required
                    >
                        <option value="">Select subcategory…</option>
                        {subs.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                    {form.errors.subcategory ? (
                        <p className="mt-1.5 text-sm text-rose-600">
                            {form.errors.subcategory}
                        </p>
                    ) : null}
                </div>

                {categoryKey === 'properties' ? (
                    <div className="sm:col-span-2">
                        <label className={label} htmlFor="property_type">
                            Property type
                        </label>
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

                {allowedTiers.length > 1 ? (
                    <div>
                        <label className={label} htmlFor="tier">
                            Plan
                        </label>
                        <select
                            id="tier"
                            className={field}
                            value={form.data.tier}
                            onChange={(e) => patch({ tier: e.target.value })}
                        >
                            {allowedTiers.map((t) => (
                                <option key={t} value={t}>
                                    {tierLabels[t] || t}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : null}
            </div>

            <div>
                <label className={label} htmlFor="tagline">
                    Short tagline
                </label>
                <input
                    id="tagline"
                    className={field}
                    value={form.data.tagline}
                    onChange={(e) => patch({ tagline: e.target.value })}
                    placeholder="What makes this place special?"
                    maxLength={180}
                />
            </div>

            <RichTextEditor
                value={form.data.description}
                onChange={(description) => patch({ description })}
                error={form.errors.description}
                placeholder="Share the story, vibe, and what visitors should know…"
            />
        </>
    );
}

function ContactStep({ form, patch }) {
    return (
        <div className="space-y-5">
            <div>
                <h3 className="font-display text-lg font-semibold text-olive-950">
                    Contact & social
                </h3>
                <p className="mt-1 text-sm text-olive-600">
                    How should people reach you?
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                {[
                    ['phone', 'Phone'],
                    ['whatsapp', 'WhatsApp'],
                    ['email', 'Email', 'email'],
                    ['website', 'Website'],
                ].map(([key, text, type]) => (
                    <div key={key}>
                        <label className={label} htmlFor={key}>
                            {text}
                        </label>
                        <input
                            id={key}
                            type={type || 'text'}
                            className={field}
                            value={form.data[key] || ''}
                            onChange={(e) => patch({ [key]: e.target.value })}
                            placeholder={key === 'website' ? 'https://' : ''}
                        />
                    </div>
                ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                {['instagram', 'facebook', 'tiktok', 'youtube'].map((net) => (
                    <div key={net}>
                        <label className={label} htmlFor={`social_${net}`}>
                            {net.charAt(0).toUpperCase() + net.slice(1)}
                        </label>
                        <input
                            id={`social_${net}`}
                            className={field}
                            value={form.data.social_links?.[net] || ''}
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
        </div>
    );
}

function CategoryPicker({ categories, selectedId, onPick, error }) {
    return (
        <div>
            <p className="mb-2 text-sm text-olive-600">
                Choose a category — each one has its own fields tailored to that
                listing type.
            </p>
            <h2 className="mb-5 font-display text-xl font-semibold text-olive-950 sm:text-2xl">
                What are you listing?
            </h2>

            {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}

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
                            className={`group relative flex flex-col items-center gap-3 rounded-2xl bg-white px-3 py-6 text-center shadow-soft ring-1 transition sm:py-8 ${
                                selected
                                    ? 'ring-2 ring-mustard shadow-lift'
                                    : 'ring-olive-200/60 hover:shadow-lift hover:ring-olive-300'
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
                            <span className="flex h-12 w-12 items-center justify-center text-olive-700 transition group-hover:text-olive-900">
                                <Icon className="h-8 w-8" strokeWidth={1.5} />
                            </span>
                            <span className="font-display text-sm font-semibold text-earth-dusk sm:text-base">
                                {category.name}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            <div className="mt-6">
                <Link
                    href={route('account.index')}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-olive-600 transition hover:text-olive-900"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to account
                </Link>
            </div>
        </div>
    );
}
