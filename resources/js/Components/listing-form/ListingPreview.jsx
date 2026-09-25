import { useMemo, useState } from 'react';
import ListingCard from '@/Components/site/ListingCard';
import {
    CATEGORY_DETAIL_FIELDS,
    PRICE_LEVELS,
    categoryStepTitle,
} from './categoryFieldConfig';
import {
    Camera,
    FileText,
    LayoutGrid,
    MapPin,
    Pencil,
    Phone,
    Sparkles,
} from 'lucide-react';

function hasValue(value) {
    if (value == null || value === '') return false;
    if (Array.isArray(value)) {
        return value.some((v) => v != null && String(v).trim() !== '');
    }
    return String(value).trim() !== '';
}

function stripHtml(html) {
    if (!html) return '';
    return String(html)
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function Row({ label, value }) {
    const empty = !hasValue(value) && value !== 0;
    return (
        <div className="grid gap-1 border-b border-olive-100 py-3.5 last:border-b-0 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
            <dt className="text-sm font-medium text-olive-500">{label}</dt>
            <dd
                className={`min-w-0 break-words text-sm ${
                    empty ? 'text-olive-400' : 'font-medium text-olive-950'
                }`}
            >
                {empty ? '—' : value}
            </dd>
        </div>
    );
}

function formatHours(hours) {
    if (!Array.isArray(hours) || !hours.length) return [];
    return hours
        .filter((h) => h && (h.open || h.close || h.day || h.label || h.closed))
        .map((h) => {
            const day = h.day || h.label || 'Day';
            if (h.closed) return `${day}: Closed`;
            return `${day}: ${h.open || '—'}–${h.close || '—'}`;
        });
}

const PRICE_LEVEL_CATEGORIES = new Set(['eatDrink', 'stay', 'shopping']);
const HOURS_CATEGORIES = new Set([
    'eatDrink',
    'stay',
    'thingsToDo',
    'services',
    'shopping',
]);

export default function ListingPreview({
    formData,
    category,
    categoryKey,
    coverPreview,
    logoPreview,
    posterPreview,
    galleryItems = [],
    amenityOptions = [],
    onEditStep,
}) {
    const [section, setSection] = useState('basics');

    const cover =
        coverPreview || formData.image_url || formData.image || null;
    const logo = logoPreview || formData.logo_url || formData.logo || null;
    const poster =
        posterPreview ||
        formData.event_poster_url ||
        formData.eventPoster ||
        null;
    const details = formData.details || {};
    const detailFields = CATEGORY_DETAIL_FIELDS[categoryKey] || [];
    const showPriceLevel = PRICE_LEVEL_CATEGORIES.has(categoryKey);
    const showHours = HOURS_CATEGORIES.has(categoryKey);
    const isEvent = categoryKey === 'events';

    const amenityNames = useMemo(() => {
        const slugs = formData.amenities || [];
        return slugs.map((slug) => {
            const match = amenityOptions.find(
                (a) => a.slug === slug || String(a.id) === String(slug),
            );
            return match?.name || slug;
        });
    }, [formData.amenities, amenityOptions]);

    const galleryPreviews = useMemo(
        () =>
            (galleryItems || [])
                .map((g) => g.preview || g.url)
                .filter(Boolean),
        [galleryItems],
    );

    const hoursLines = formatHours(formData.hours);
    const socialEntries = Object.entries(formData.social_links || {}).filter(
        ([, v]) => hasValue(v),
    );
    const priceLabel =
        PRICE_LEVELS.find((p) => p.value === formData.price_range)?.label ||
        formData.price_range ||
        null;

    const sections = useMemo(
        () => [
            { id: 'basics', label: 'Basics', step: 'basics', Icon: FileText },
            { id: 'location', label: 'Location', step: 'location', Icon: MapPin },
            {
                id: 'details',
                label: categoryStepTitle(categoryKey) || 'Details',
                step: 'details',
                Icon: LayoutGrid,
            },
            {
                id: 'amenities',
                label: 'Features',
                step: 'amenities',
                Icon: Sparkles,
            },
            { id: 'media', label: 'Photos & video', step: 'media', Icon: Camera },
            { id: 'contact', label: 'Contact', step: 'contact', Icon: Phone },
            { id: 'card', label: 'Card', step: null, Icon: LayoutGrid },
        ],
        [categoryKey],
    );

    const active = sections.find((s) => s.id === section) || sections[0];

    const previewListing = {
        id: formData.id || 'preview',
        title: formData.title || 'Untitled listing',
        location: formData.location || 'Nanyuki',
        category: category?.name || 'Listing',
        categoryKey: categoryKey || 'eatDrink',
        subcategory: formData.subcategory || null,
        propertyType: formData.property_type || null,
        rating: formData.rating ?? 5,
        image: cover || '/images/logo.png',
        logo,
        eventPoster: poster,
        startDate: formData.start_at
            ? new Date(formData.start_at).toISOString()
            : null,
        endDate: formData.end_at
            ? new Date(formData.end_at).toISOString()
            : null,
        tier: formData.tier || 'free',
        ticketPrice: formData.ticket_price || null,
        details,
        tagline: formData.tagline || null,
    };

    const goEdit = () => {
        if (active.step && onEditStep) onEditStep(active.step);
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-display text-xl font-semibold text-olive-950">
                    Preview
                </h3>
                <p className="mt-1 text-sm text-olive-600">
                    Pick a section to verify its fields. Edit jumps you back to
                    that step.
                </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-olive-200 bg-white shadow-soft lg:grid lg:grid-cols-[13.5rem_minmax(0,1fr)]">
                <nav
                    aria-label="Preview sections"
                    className="border-b border-olive-100 bg-olive-50/60 lg:border-b-0 lg:border-r lg:border-olive-100"
                >
                    <ul className="flex gap-1 overflow-x-auto p-2 lg:block lg:space-y-0.5 lg:overflow-visible lg:p-3">
                        {sections.map(({ id, label, Icon }) => {
                            const isActive = section === id;
                            return (
                                <li key={id} className="shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setSection(id)}
                                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                                            isActive
                                                ? 'bg-olive-900 text-white shadow-soft'
                                                : 'text-olive-700 hover:bg-white hover:text-olive-950'
                                        }`}
                                    >
                                        <Icon
                                            className={`h-4 w-4 shrink-0 ${
                                                isActive
                                                    ? 'text-mustard'
                                                    : 'text-olive-500'
                                            }`}
                                        />
                                        <span className="truncate">{label}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="min-w-0 p-4 sm:p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-olive-100 pb-3">
                        <h4 className="text-base font-semibold text-olive-950">
                            {active.label}
                        </h4>
                        {active.step && onEditStep ? (
                            <button
                                type="button"
                                onClick={goEdit}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-olive-200 bg-white px-3 py-1.5 text-xs font-semibold text-olive-800 transition hover:border-mustard/50 hover:bg-mustard/10"
                            >
                                <Pencil className="h-3 w-3" />
                                Edit this section
                            </button>
                        ) : null}
                    </div>

                    {section === 'basics' ? (
                        <dl>
                            <Row label="Name" value={formData.title} />
                            <Row
                                label="Category"
                                value={[
                                    category?.name,
                                    formData.subcategory,
                                    formData.property_type,
                                ]
                                    .filter(Boolean)
                                    .join(' · ')}
                            />
                            <Row label="Tagline" value={formData.tagline} />
                            <Row
                                label="Description"
                                value={
                                    formData.description ? (
                                        <div
                                            className="nn-editor text-olive-800"
                                            dangerouslySetInnerHTML={{
                                                __html: formData.description,
                                            }}
                                        />
                                    ) : (
                                        stripHtml(formData.description) || null
                                    )
                                }
                            />
                        </dl>
                    ) : null}

                    {section === 'location' ? (
                        <dl>
                            <Row label="Area / town" value={formData.location} />
                            <Row label="City" value={formData.city} />
                            <Row label="Address" value={formData.address} />
                            <Row
                                label="Coordinates"
                                value={
                                    formData.latitude && formData.longitude
                                        ? `${formData.latitude}, ${formData.longitude}`
                                        : null
                                }
                            />
                        </dl>
                    ) : null}

                    {section === 'details' ? (
                        <dl>
                            {showPriceLevel ? (
                                <Row label="Price level" value={priceLabel} />
                            ) : null}
                            {detailFields.map((field) => {
                                const raw = details[field.key];
                                if (Array.isArray(raw)) {
                                    return (
                                        <Row
                                            key={field.key}
                                            label={field.label}
                                            value={
                                                hasValue(raw) ? (
                                                    <ul className="list-disc space-y-0.5 pl-4">
                                                        {raw
                                                            .filter(Boolean)
                                                            .map((item) => (
                                                                <li
                                                                    key={String(
                                                                        item,
                                                                    )}
                                                                >
                                                                    {item}
                                                                </li>
                                                            ))}
                                                    </ul>
                                                ) : null
                                            }
                                        />
                                    );
                                }
                                return (
                                    <Row
                                        key={field.key}
                                        label={field.label}
                                        value={raw}
                                    />
                                );
                            })}
                            <Row
                                label="Payments"
                                value={
                                    Array.isArray(details.payments) &&
                                    details.payments.length
                                        ? details.payments
                                        : null
                                }
                            />
                            {isEvent ? (
                                <>
                                    <Row label="Venue" value={formData.venue} />
                                    <Row
                                        label="Starts"
                                        value={formData.start_at}
                                    />
                                    <Row label="Ends" value={formData.end_at} />
                                    <Row
                                        label="Ticket price"
                                        value={formData.ticket_price}
                                    />
                                    <Row
                                        label="Early bird"
                                        value={formData.early_bird_price}
                                    />
                                    <Row
                                        label="Gate price"
                                        value={formData.gate_price}
                                    />
                                    <Row
                                        label="Ticket URL"
                                        value={formData.ticket_url}
                                    />
                                    <Row
                                        label="Agenda"
                                        value={
                                            Array.isArray(details.agenda) &&
                                            details.agenda.length
                                                ? `${details.agenda.length} item${
                                                      details.agenda.length === 1
                                                          ? ''
                                                          : 's'
                                                  }`
                                                : null
                                        }
                                    />
                                    <Row
                                        label="Schedule"
                                        value={
                                            Array.isArray(
                                                details.event_schedule,
                                            ) && details.event_schedule.length
                                                ? `${details.event_schedule.length} row${
                                                      details.event_schedule
                                                          .length === 1
                                                          ? ''
                                                          : 's'
                                                  }`
                                                : null
                                        }
                                    />
                                    <Row
                                        label="Sponsors"
                                        value={
                                            Array.isArray(details.sponsors) &&
                                            details.sponsors.length
                                                ? `${details.sponsors.length}`
                                                : null
                                        }
                                    />
                                </>
                            ) : null}
                            {categoryKey === 'eatDrink' ? (
                                <Row
                                    label="Menus"
                                    value={
                                        Array.isArray(details.menus) &&
                                        details.menus.length
                                            ? `${details.menus.length} page${
                                                  details.menus.length === 1
                                                      ? ''
                                                      : 's'
                                              }`
                                            : null
                                    }
                                />
                            ) : null}
                            {categoryKey === 'shopping' ? (
                                <Row
                                    label="Products"
                                    value={
                                        Array.isArray(details.products) &&
                                        details.products.length
                                            ? `${details.products.length}`
                                            : null
                                    }
                                />
                            ) : null}
                            {!detailFields.length && !isEvent ? (
                                <p className="py-6 text-sm text-olive-400">
                                    No extra fields for this category.
                                </p>
                            ) : null}
                        </dl>
                    ) : null}

                    {section === 'amenities' ? (
                        <dl>
                            <Row
                                label="Amenities"
                                value={
                                    amenityNames.length ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {amenityNames.map((name) => (
                                                <span
                                                    key={name}
                                                    className="rounded-full bg-olive-50 px-2.5 py-1 text-xs font-semibold text-olive-800 ring-1 ring-olive-200"
                                                >
                                                    {name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null
                                }
                            />
                        </dl>
                    ) : null}

                    {section === 'media' ? (
                        <div className="space-y-5">
                            <dl>
                                <Row
                                    label="Cover"
                                    value={
                                        cover ? (
                                            <img
                                                src={cover}
                                                alt=""
                                                className="h-24 w-36 rounded-lg object-cover ring-1 ring-olive-200"
                                            />
                                        ) : null
                                    }
                                />
                                <Row
                                    label="Logo"
                                    value={
                                        logo ? (
                                            <img
                                                src={logo}
                                                alt=""
                                                className="h-14 w-14 rounded-lg object-cover ring-1 ring-olive-200"
                                            />
                                        ) : null
                                    }
                                />
                                {isEvent ? (
                                    <Row
                                        label="Poster"
                                        value={
                                            poster ? (
                                                <img
                                                    src={poster}
                                                    alt=""
                                                    className="h-24 w-16 rounded-lg object-cover ring-1 ring-olive-200"
                                                />
                                            ) : null
                                        }
                                    />
                                ) : null}
                                <Row
                                    label="Gallery"
                                    value={
                                        galleryPreviews.length
                                            ? `${galleryPreviews.length} photo${
                                                  galleryPreviews.length === 1
                                                      ? ''
                                                      : 's'
                                              }`
                                            : null
                                    }
                                />
                                <Row
                                    label="Video"
                                    value={
                                        details.video_url
                                            ? details.video_title ||
                                              details.video_url
                                            : null
                                    }
                                />
                            </dl>
                            {galleryPreviews.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {galleryPreviews.map((src, i) => (
                                        <img
                                            key={`${src}-${i}`}
                                            src={src}
                                            alt=""
                                            className="h-16 w-16 rounded-lg object-cover ring-1 ring-olive-200"
                                        />
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {section === 'contact' ? (
                        <dl>
                            <Row label="Phone" value={formData.phone} />
                            <Row label="WhatsApp" value={formData.whatsapp} />
                            <Row label="Email" value={formData.email} />
                            <Row label="Website" value={formData.website} />
                            {showHours ? (
                                <Row
                                    label="Hours"
                                    value={
                                        hoursLines.length ? (
                                            <ul className="space-y-1">
                                                {hoursLines.map((line) => (
                                                    <li key={line}>{line}</li>
                                                ))}
                                            </ul>
                                        ) : null
                                    }
                                />
                            ) : null}
                            <Row
                                label="Social"
                                value={
                                    socialEntries.length ? (
                                        <ul className="space-y-1">
                                            {socialEntries.map(
                                                ([key, value]) => (
                                                    <li
                                                        key={key}
                                                        className="break-all"
                                                    >
                                                        <span className="capitalize text-olive-500">
                                                            {key}:
                                                        </span>{' '}
                                                        {value}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    ) : null
                                }
                            />
                        </dl>
                    ) : null}

                    {section === 'card' ? (
                        <div className="mx-auto max-w-sm">
                            <p className="mb-3 text-xs font-medium text-olive-500">
                                How this listing appears in Explore
                            </p>
                            <ListingCard listing={previewListing} inert />
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
