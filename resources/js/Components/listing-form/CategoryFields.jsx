import {
    CATEGORY_DETAIL_FIELDS,
    PAYMENT_OPTIONS,
    POPULAR_DELIVERY_OPTIONS,
    POPULAR_DIETARY_OPTIONS,
    POPULAR_DRESS_CODES,
    POPULAR_NEARBY_ATTRACTIONS,
    POPULAR_ROOM_TYPES,
    POPULAR_SHOPPING_DELIVERY_OPTIONS,
    POPULAR_STAY_ACTIVITIES,
    POPULAR_WHOLESALE_RETAIL_OPTIONS,
    PRICE_LEVELS,
    categoryStepTitle,
} from './categoryFieldConfig';
import CapacityAreasInput from './CapacityAreasInput';
import CuisinePicker from './CuisinePicker';
import PricingOptionsInput from './PricingOptionsInput';
import TicketOptionsInput from './TicketOptionsInput';
import SuggestTagsPicker from './SuggestTagsPicker';
import FieldLabel from './FieldLabel';
import FieldError from './FieldError';
import { field, fieldClass, help, label } from './fieldStyles';
import RichTextEditor from './RichTextEditor';
import {
    canUseEatDrinkFeature,
    eatDrinkCuisineHelp,
    eatDrinkCuisineLimit,
    normalizeTier as normalizeEatDrinkTier,
    tierMeets as eatDrinkTierMeets,
} from '@/data/eatDrinkTierFeatures';
import {
    canUseStayFeature,
    normalizeTier as normalizeStayTier,
    tierMeets as stayTierMeets,
} from '@/data/stayTierFeatures';
import {
    canUseShoppingFeature,
    normalizeTier as normalizeShoppingTier,
    tierMeets as shoppingTierMeets,
} from '@/data/shoppingTierFeatures';
import {
    canUsePropertiesFeature,
    normalizeTier as normalizePropertiesTier,
    tierMeets as propertiesTierMeets,
} from '@/data/propertiesTierFeatures';
import {
    canUseThingsToDoFeature,
    normalizeTier as normalizeThingsToDoTier,
    tierMeets as thingsToDoTierMeets,
} from '@/data/thingsToDoTierFeatures';
import {
    canUseServicesFeature,
    normalizeTier as normalizeServicesTier,
    tierMeets as servicesTierMeets,
} from '@/data/servicesTierFeatures';
import {
    canUseEventsFeature,
    normalizeTier as normalizeEventsTier,
    tierMeets as eventsTierMeets,
} from '@/data/eventsTierFeatures';
import { isTieredCategory } from '@/data/listingTier';
import { ImagePlus, Plus, X } from '@/Components/site/LucideCompat';
import { uploadEditorMedia } from '@/utils/uploadEditorMedia';
import { useRef, useState } from 'react';

const SUGGEST_OPTIONS = {
    dietary: POPULAR_DIETARY_OPTIONS,
    delivery: POPULAR_DELIVERY_OPTIONS,
    shopping_delivery: POPULAR_SHOPPING_DELIVERY_OPTIONS,
    wholesale_retail: POPULAR_WHOLESALE_RETAIL_OPTIONS,
    dress_code: POPULAR_DRESS_CODES,
    room_types: POPULAR_ROOM_TYPES,
    activities: POPULAR_STAY_ACTIVITIES,
    nearby: POPULAR_NEARBY_ATTRACTIONS,
};

/** Migrate legacy tag arrays into HTML the rich editor can open. */
function richTextValue(value) {
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && value.length) {
        return `<ul>${value
            .filter(Boolean)
            .map(
                (item) =>
                    `<li>${String(item)
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')}</li>`,
            )
            .join('')}</ul>`;
    }
    return '';
}

function asTagList(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => (typeof item === 'string' ? item.trim() : ''))
            .filter(Boolean);
    }
    if (typeof value === 'string' && value.trim()) {
        return value
            .split(/[,|]+/)
            .map((part) => part.trim())
            .filter(Boolean);
    }
    return [];
}

function TagsInput({ value = [], onChange, placeholder, maxTags = null, disabled = false }) {
    const [draft, setDraft] = useState('');
    const list = asTagList(value);
    const atLimit = maxTags != null && list.length >= maxTags;

    const add = () => {
        if (disabled || atLimit) return;
        const next = draft.trim();
        if (!next) return;
        if (list.includes(next)) {
            setDraft('');
            return;
        }
        onChange([...list, next]);
        setDraft('');
    };

    return (
        <div>
            <div className="flex gap-2">
                <input
                    className={field}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={atLimit ? `Limit of ${maxTags} reached` : placeholder}
                    disabled={disabled || atLimit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            add();
                        }
                    }}
                />
                <button
                    type="button"
                    onClick={add}
                    disabled={disabled || atLimit}
                    className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-olive-900 px-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" />
                    Add
                </button>
            </div>
            {list.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                    {list.map((item) => (
                        <span
                            key={item}
                            className="inline-flex items-center gap-1 rounded-full bg-olive-100 px-3 py-1 text-xs font-semibold text-olive-900 dark:bg-olive-800 dark:text-olive-100"
                        >
                            {item}
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={() =>
                                    onChange(list.filter((v) => v !== item))
                                }
                                aria-label={`Remove ${item}`}
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

function DropdownMultiSelect({
    id,
    options = [],
    value = [],
    onChange,
    disabled = false,
    placeholder = 'Select…',
}) {
    const selected = asTagList(value);
    const available = options.filter((opt) => !selected.includes(opt));

    return (
        <div>
            <select
                id={id}
                className={field}
                value=""
                disabled={disabled || available.length === 0}
                onChange={(e) => {
                    const next = e.target.value;
                    if (!next || selected.includes(next)) return;
                    onChange([...selected, next]);
                    e.target.value = '';
                }}
            >
                <option value="">
                    {available.length
                        ? placeholder
                        : 'All options selected'}
                </option>
                {available.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
            {selected.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                    {selected.map((item) => (
                        <span
                            key={item}
                            className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-olive-100 py-1.5 pl-3 pr-1.5 text-xs font-semibold text-olive-900 dark:bg-olive-800 dark:text-olive-100"
                        >
                            <span className="truncate">{item}</span>
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={() =>
                                    onChange(
                                        selected.filter((v) => v !== item),
                                    )
                                }
                                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-olive-700 transition hover:bg-olive-200 hover:text-olive-950 disabled:opacity-50 dark:text-olive-200 dark:hover:bg-olive-700 dark:hover:text-white"
                                aria-label={`Remove ${item}`}
                            >
                                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </button>
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

function HostPhotoField({
    id,
    label: fieldLabel,
    value,
    help: fieldHelp,
    uploadUrl = null,
    onChange,
}) {
    const inputRef = useRef(null);
    const uploadingRef = useRef(false);
    const fileInputId = `${id}-file`;
    const urlInputId = `${id}-url`;
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [imageUrlError, setImageUrlError] = useState(null);

    const openFilePicker = () => {
        if (uploadingRef.current) return;
        inputRef.current?.click();
    };

    const pickFile = async (file) => {
        if (!file || uploadingRef.current) return;
        if (!file.type?.startsWith('image/')) {
            setError('Choose a JPG, PNG, or WebP image.');
            return;
        }
        setError(null);
        setImageUrlError(null);
        uploadingRef.current = true;
        setUploading(true);
        try {
            const url = await uploadEditorMedia(file, uploadUrl);
            if (!url) {
                setError(
                    'Could not upload that image. Try a JPG, PNG, or WebP under 5MB.',
                );
                return;
            }
            onChange(url);
        } finally {
            uploadingRef.current = false;
            setUploading(false);
        }
    };

    const onDropFiles = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (uploadingRef.current) return;
        const file = e.dataTransfer?.files?.[0];
        if (file) {
            void pickFile(file);
        }
    };

    const parseImageUrl = (raw) => {
        const next = (raw || '').trim();
        if (!next) {
            setImageUrlError('Paste an image URL.');
            return null;
        }
        try {
            const parsed = new URL(next);
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                setImageUrlError('URL must start with http:// or https://');
                return null;
            }
        } catch {
            setImageUrlError('That does not look like a valid URL.');
            return null;
        }
        setImageUrlError(null);
        return next;
    };

    const submitImageUrl = () => {
        if (uploadingRef.current) return;
        const raw = parseImageUrl(imageUrl);
        if (!raw) return;
        setError(null);
        onChange(raw);
        setImageUrl('');
    };

    const dropzoneClassName = `flex w-full max-w-md flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-olive-300 bg-white/80 px-4 py-10 text-center transition dark:border-olive-700 dark:bg-olive-950/80 ${
        uploading
            ? 'cursor-wait opacity-70'
            : 'cursor-pointer hover:border-mustard hover:bg-mustard/5 dark:hover:border-mustard dark:hover:bg-mustard/10'
    }`;

    return (
        <div className="min-w-0 space-y-3">
            <p className={label} id={`${id}-label`}>
                {fieldLabel}
            </p>

            <input
                ref={inputRef}
                id={fileInputId}
                type="file"
                accept="image/*"
                disabled={uploading}
                className="sr-only"
                aria-labelledby={`${id}-label`}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    void pickFile(file);
                }}
            />

            {value ? (
                <div className="overflow-hidden rounded-2xl border border-olive-200 bg-white dark:border-olive-700 dark:bg-olive-950/80">
                    <div className="relative mx-auto aspect-square w-full max-w-[14rem] bg-olive-50 dark:bg-olive-900">
                        <img
                            src={value}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-gradient-to-t from-black/55 to-transparent p-3 pt-8">
                            <button
                                type="button"
                                disabled={uploading}
                                onClick={openFilePicker}
                                className="rounded-xl border border-white/30 bg-white/95 px-3 py-1.5 text-xs font-semibold text-olive-900 shadow-sm hover:bg-white disabled:opacity-60"
                            >
                                {uploading ? 'Uploading…' : 'Replace photo'}
                            </button>
                            <button
                                type="button"
                                disabled={uploading}
                                onClick={() => onChange('')}
                                className="rounded-sm bg-white/90 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm hover:bg-white disabled:opacity-60"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    disabled={uploading}
                    onClick={openFilePicker}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onDrop={onDropFiles}
                    className={dropzoneClassName}
                >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-olive-50 ring-1 ring-olive-100 dark:bg-olive-900 dark:ring-olive-700">
                        <ImagePlus className="h-6 w-6 text-olive-700 dark:text-olive-300" />
                    </span>
                    <span>
                        <span className="block text-sm font-semibold text-olive-950 dark:text-olive-50">
                            {uploading
                                ? 'Uploading…'
                                : 'Drop host photo here'}
                        </span>
                        <span className="mt-1 block text-xs text-olive-500">
                            {uploading
                                ? 'Please wait'
                                : 'Or click to upload · square photos work best'}
                        </span>
                    </span>
                </button>
            )}

            <div>
                <label className={label} htmlFor={urlInputId}>
                    Image URL (optional)
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        id={urlInputId}
                        type="url"
                        className={field}
                        value={imageUrl}
                        disabled={uploading}
                        onChange={(e) => {
                            setImageUrl(e.target.value);
                            setImageUrlError(null);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                submitImageUrl();
                            }
                        }}
                        placeholder="https://…/host.jpg"
                    />
                    <button
                        type="button"
                        disabled={uploading}
                        onClick={submitImageUrl}
                        className="inline-flex shrink-0 items-center justify-center rounded-sm bg-olive-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-olive-800 disabled:opacity-60"
                    >
                        Add URL
                    </button>
                </div>
                {imageUrlError ? (
                    <p className="mt-1.5 text-sm text-rose-600">{imageUrlError}</p>
                ) : (
                    <p className={help}>
                        Paste a direct image link if you already host the photo
                        online.
                    </p>
                )}
            </div>

            {uploading ? (
                <p className="text-sm font-medium text-olive-700 dark:text-olive-300">
                    Uploading host photo…
                </p>
            ) : null}

            {error ? (
                <p className="text-sm font-medium text-rose-700">{error}</p>
            ) : fieldHelp ? (
                <p className={help}>{fieldHelp}</p>
            ) : null}
        </div>
    );
}

export default function CategoryFields({
    categoryKey,
    details = {},
    priceRange,
    onDetailsChange,
    onPriceRangeChange,
    eventFields = null,
    onEventChange,
    tier = 'free',
    errors = {},
    uploadUrl = null,
}) {
    const fields = CATEGORY_DETAIL_FIELDS[categoryKey] || [];
    const isEatDrink = categoryKey === 'eatDrink';
    const isStay = categoryKey === 'stay';
    const isShopping = categoryKey === 'shopping';
    const isProperties = categoryKey === 'properties';
    const isThingsToDo = categoryKey === 'thingsToDo';
    const isServices = categoryKey === 'services';
    const isEvents = categoryKey === 'events';
    const isTiered = isTieredCategory(categoryKey);

    const listingTier = isStay
        ? normalizeStayTier(tier)
        : isShopping
          ? normalizeShoppingTier(tier)
          : isProperties
            ? normalizePropertiesTier(tier)
            : isThingsToDo
              ? normalizeThingsToDoTier(tier)
              : isServices
                ? normalizeServicesTier(tier)
                : isEvents
                  ? normalizeEventsTier(tier)
                  : normalizeEatDrinkTier(tier);

    const tierMeets = isStay
        ? stayTierMeets
        : isShopping
          ? shoppingTierMeets
          : isProperties
            ? propertiesTierMeets
            : isThingsToDo
              ? thingsToDoTierMeets
              : isServices
                ? servicesTierMeets
                : isEvents
                  ? eventsTierMeets
                  : eatDrinkTierMeets;

    const setDetail = (key, value) => {
        onDetailsChange((prev) => ({ ...(prev || {}), [key]: value }));
    };

    const payments = details.payments || [];
    const showPayments =
        (isEatDrink && canUseEatDrinkFeature(listingTier, 'payments')) ||
        (isStay && canUseStayFeature(listingTier, 'payments')) ||
        (isShopping && canUseShoppingFeature(listingTier, 'payments')) ||
        (isProperties && canUsePropertiesFeature(listingTier, 'payments')) ||
        (isThingsToDo && canUseThingsToDoFeature(listingTier, 'payments')) ||
        (isServices && canUseServicesFeature(listingTier, 'payments')) ||
        (isEvents && canUseEventsFeature(listingTier, 'payments')) ||
        !isTiered;
    const showEventTickets =
        !isEvents || canUseEventsFeature(listingTier, 'tickets');
    const showEventTicketUrl =
        !isEvents || canUseEventsFeature(listingTier, 'ticket_url');
    const visibleFields = fields.filter((f) => {
        if (isTiered) {
            return tierMeets(listingTier, f.minTier || 'free');
        }
        return true;
    });
    const priceLevels =
        isTiered && !tierMeets(listingTier, 'featured')
            ? PRICE_LEVELS.filter((p) => p.value !== '$$$$')
            : PRICE_LEVELS;

    return (
        <div className="space-y-5">
            <div>
                <h3 className="font-display text-lg font-semibold text-olive-950 dark:text-white">
                    {categoryStepTitle(categoryKey)}
                </h3>
                <p className={help}>
                    These show on the listing page and help visitors decide quickly.
                </p>
            </div>

            {categoryKey === 'events' && eventFields ? (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="font-display text-base font-semibold text-olive-950 dark:text-white">
                            When & where
                        </h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="min-w-0" data-error-field="start_at">
                                <FieldLabel htmlFor="start_at" required>
                                    Starts
                                </FieldLabel>
                                <input
                                    id="start_at"
                                    type="datetime-local"
                                    className={fieldClass(Boolean(errors.start_at))}
                                    value={eventFields.start_at || ''}
                                    onChange={(e) =>
                                        onEventChange?.({
                                            start_at: e.target.value,
                                        })
                                    }
                                    aria-invalid={
                                        errors.start_at ? true : undefined
                                    }
                                    aria-describedby={
                                        errors.start_at
                                            ? 'start_at-error'
                                            : undefined
                                    }
                                    required
                                />
                                <FieldError
                                    id="start_at-error"
                                    message={errors.start_at}
                                />
                            </div>
                            <div className="min-w-0" data-error-field="end_at">
                                <FieldLabel htmlFor="end_at">Ends</FieldLabel>
                                <input
                                    id="end_at"
                                    type="datetime-local"
                                    className={fieldClass(Boolean(errors.end_at))}
                                    value={eventFields.end_at || ''}
                                    onChange={(e) =>
                                        onEventChange?.({
                                            end_at: e.target.value,
                                        })
                                    }
                                    aria-invalid={
                                        errors.end_at ? true : undefined
                                    }
                                    aria-describedby={
                                        errors.end_at
                                            ? 'end_at-error'
                                            : undefined
                                    }
                                />
                                <FieldError
                                    id="end_at-error"
                                    message={errors.end_at}
                                />
                            </div>
                            <div
                                className="min-w-0 sm:col-span-2"
                                data-error-field="venue"
                            >
                                <FieldLabel htmlFor="venue" required>
                                    Venue name
                                </FieldLabel>
                                <input
                                    id="venue"
                                    className={fieldClass(Boolean(errors.venue))}
                                    value={eventFields.venue || ''}
                                    onChange={(e) =>
                                        onEventChange?.({
                                            venue: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Town Terrace"
                                    aria-invalid={
                                        errors.venue ? true : undefined
                                    }
                                    aria-describedby={
                                        errors.venue ? 'venue-error' : undefined
                                    }
                                    required
                                />
                                <FieldError
                                    id="venue-error"
                                    message={errors.venue}
                                />
                            </div>
                        </div>
                    </div>

                    {showEventTickets || showEventTicketUrl ? (
                        <div className="space-y-4 border-t border-olive-900/10 pt-6 dark:border-olive-800">
                            <h4 className="font-display text-base font-semibold text-olive-950 dark:text-white">
                                Tickets
                            </h4>
                            {showEventTickets ? (
                                <TicketOptionsInput
                                    value={eventFields.ticket_options || []}
                                    onChange={(ticket_options) =>
                                        onEventChange?.({ ticket_options })
                                    }
                                    showHeading={false}
                                    fieldHelp="Add each ticket type and its price in Kenyan shillings."
                                />
                            ) : null}
                            {showEventTicketUrl ? (
                                <div
                                    className="min-w-0"
                                    data-error-field="ticket_url"
                                >
                                    <label
                                        className={label}
                                        htmlFor="ticket_url"
                                    >
                                        Ticket link
                                    </label>
                                    <input
                                        id="ticket_url"
                                        className={fieldClass(
                                            Boolean(errors.ticket_url),
                                        )}
                                        value={eventFields.ticket_url || ''}
                                        onChange={(e) =>
                                            onEventChange?.({
                                                ticket_url: e.target.value,
                                            })
                                        }
                                        placeholder="https://"
                                        aria-invalid={
                                            errors.ticket_url
                                                ? true
                                                : undefined
                                        }
                                        aria-describedby={
                                            errors.ticket_url
                                                ? 'ticket_url-error'
                                                : undefined
                                        }
                                    />
                                    <FieldError
                                        id="ticket_url-error"
                                        message={errors.ticket_url}
                                    />
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            ) : null}

            {visibleFields.length > 0 ? (
            <div
                className={
                    categoryKey === 'events'
                        ? 'space-y-4 border-t border-olive-900/10 pt-6 dark:border-olive-800'
                        : undefined
                }
            >
                {categoryKey === 'events' ? (
                    <h4 className="font-display text-base font-semibold text-olive-950 dark:text-white">
                        Guest info
                    </h4>
                ) : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {visibleFields.map((f) => {
                    const cuisineMax =
                        f.key === 'cuisine' && isEatDrink
                            ? eatDrinkCuisineLimit(listingTier)
                            : null;
                    const spanWide =
                        f.type === 'tags' ||
                        f.type === 'cuisine' ||
                        f.type === 'suggest' ||
                        f.type === 'multi' ||
                        f.type === 'richtext' ||
                        f.type === 'capacity' ||
                        f.type === 'pricing' ||
                        f.key.includes('highlight') ||
                        f.key === 'booking_url' ||
                        f.key === 'reservations' ||
                        f.key === 'avg_meal' ||
                        f.key === 'host_bio' ||
                        f.key === 'host_photo' ||
                        f.key === 'meal_plan' ||
                        f.key === 'nightly_rate' ||
                        f.key === 'cancellation_policy' ||
                        f.key === 'return_policy' ||
                        f.key === 'whatsapp_catalog_url' ||
                        f.key === 'online_store_url' ||
                        f.key === 'price_list_pdf' ||
                        f.key === 'virtual_tour_url' ||
                        f.key === 'floor_plan_pdf' ||
                        f.key === 'enquiry_url';

                    return (
                        <div
                            key={f.key}
                            className={`min-w-0 ${spanWide ? 'sm:col-span-2' : ''}`}
                        >
                            {f.type === 'richtext' ? (
                                <RichTextEditor
                                    id={`detail_${f.key}`}
                                    label={f.label}
                                    value={richTextValue(details[f.key])}
                                    onChange={(html) => setDetail(f.key, html)}
                                    placeholder={f.placeholder}
                                    help={f.help}
                                    allowImages={false}
                                />
                            ) : f.type === 'image' ? (
                                <HostPhotoField
                                    id={`detail_${f.key}`}
                                    label={f.label}
                                    value={details[f.key] || ''}
                                    help={f.help}
                                    uploadUrl={uploadUrl}
                                    onChange={(url) => setDetail(f.key, url)}
                                />
                            ) : f.type === 'cuisine' ? (
                                <CuisinePicker
                                    id={`detail_${f.key}`}
                                    value={details[f.key] || []}
                                    onChange={(v) => {
                                        const next = Array.isArray(v) ? v : [];
                                        setDetail(
                                            f.key,
                                            cuisineMax != null
                                                ? next.slice(0, cuisineMax)
                                                : next,
                                        );
                                    }}
                                    maxTags={cuisineMax}
                                    required={f.required}
                                    fieldHelp={
                                        isEatDrink
                                            ? eatDrinkCuisineHelp(listingTier)
                                            : f.help
                                    }
                                />
                            ) : f.type === 'suggest' ? (
                                <SuggestTagsPicker
                                    id={`detail_${f.key}`}
                                    value={details[f.key] || []}
                                    onChange={(v) => setDetail(f.key, v)}
                                    options={
                                        SUGGEST_OPTIONS[f.optionsKey] ||
                                        f.options ||
                                        []
                                    }
                                    labelText={f.label}
                                    placeholder={
                                        f.placeholder ||
                                        'Search or type your own…'
                                    }
                                    suggestionsLabel="Popular options"
                                    required={f.required}
                                    fieldHelp={f.help}
                                />
                            ) : f.type === 'capacity' ? (
                                <CapacityAreasInput
                                    id={`detail_${f.key}`}
                                    value={details[f.key]}
                                    onChange={(v) => setDetail(f.key, v)}
                                    fieldHelp={f.help}
                                />
                            ) : f.type === 'pricing' ? (
                                <PricingOptionsInput
                                    id={`detail_${f.key}`}
                                    value={details[f.key]}
                                    onChange={(v) => setDetail(f.key, v)}
                                    fieldHelp={f.help}
                                    required={f.required}
                                />
                            ) : (
                                <>
                                    <label
                                        className={label}
                                        htmlFor={`detail_${f.key}`}
                                    >
                                        {f.label}
                                        {f.required ? (
                                            <span className="text-rose-500">
                                                {' '}
                                                *
                                            </span>
                                        ) : null}
                                    </label>
                                    {f.type === 'select' ? (
                                        <select
                                            id={`detail_${f.key}`}
                                            className={field}
                                            value={details[f.key] || ''}
                                            onChange={(e) =>
                                                setDetail(f.key, e.target.value)
                                            }
                                            required={f.required}
                                        >
                                            <option value="">Select…</option>
                                            {(f.options || []).map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    ) : f.type === 'tags' ? (
                                        <TagsInput
                                            value={details[f.key] || []}
                                            onChange={(v) =>
                                                setDetail(f.key, v)
                                            }
                                            placeholder={f.placeholder}
                                            maxTags={cuisineMax}
                                        />
                                    ) : f.type === 'multi' ? (
                                        <DropdownMultiSelect
                                            id={`detail_${f.key}`}
                                            options={f.options || []}
                                            value={details[f.key] || []}
                                            onChange={(v) =>
                                                setDetail(f.key, v)
                                            }
                                            placeholder={`Select ${f.label.toLowerCase()}…`}
                                        />
                                    ) : f.type === 'number' ? (
                                        <div className="relative">
                                            {f.prefix ? (
                                                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-semibold text-olive-500">
                                                    {f.prefix}
                                                </span>
                                            ) : null}
                                            <input
                                                id={`detail_${f.key}`}
                                                type="number"
                                                inputMode="numeric"
                                                min={f.min ?? 0}
                                                step={f.step ?? 1}
                                                className={`${field}${f.prefix ? ' pl-14' : ''}`}
                                                value={
                                                    details[f.key] === null ||
                                                    details[f.key] === undefined
                                                        ? ''
                                                        : details[f.key]
                                                }
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    if (raw === '') {
                                                        setDetail(f.key, null);
                                                        return;
                                                    }
                                                    const n = Number(raw);
                                                    setDetail(
                                                        f.key,
                                                        Number.isFinite(n)
                                                            ? n
                                                            : null,
                                                    );
                                                }}
                                                placeholder={f.placeholder}
                                                required={f.required}
                                            />
                                        </div>
                                    ) : (
                                        <input
                                            id={`detail_${f.key}`}
                                            type={
                                                f.type === 'email'
                                                    ? 'email'
                                                    : f.type === 'time'
                                                      ? 'time'
                                                      : 'text'
                                            }
                                            className={field}
                                            value={details[f.key] || ''}
                                            onChange={(e) =>
                                                setDetail(f.key, e.target.value)
                                            }
                                            placeholder={f.placeholder}
                                            required={f.required}
                                        />
                                    )}
                                    {f.help ? (
                                        <p className={help}>{f.help}</p>
                                    ) : null}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
            </div>
            ) : null}

            {(categoryKey === 'eatDrink' ||
                categoryKey === 'stay' ||
                categoryKey === 'shopping' ||
                categoryKey === 'thingsToDo') && (
                <div className="min-w-0">
                    <label className={label} htmlFor="price_range">
                        Price level
                    </label>
                    <select
                        id="price_range"
                        className={field}
                        value={priceRange || ''}
                        onChange={(e) => onPriceRangeChange?.(e.target.value)}
                    >
                        <option value="">Select…</option>
                        {priceLevels.map((p) => (
                            <option key={p.value} value={p.value}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {showPayments ? (
                <div
                    className={
                        categoryKey === 'events'
                            ? 'min-w-0 space-y-4 border-t border-olive-900/10 pt-6 dark:border-olive-800'
                            : 'min-w-0'
                    }
                >
                    {categoryKey === 'events' ? (
                        <h4 className="font-display text-base font-semibold text-olive-950 dark:text-white">
                            Payments
                        </h4>
                    ) : null}
                    <div className="min-w-0">
                        <label className={label} htmlFor="payments">
                            Payment methods
                        </label>
                        <DropdownMultiSelect
                            id="payments"
                            options={
                                isEatDrink || isStay
                                    ? [
                                          'M-Pesa',
                                          'Card',
                                          'Cash',
                                          'Paybill',
                                          'Bank transfer',
                                      ]
                                    : PAYMENT_OPTIONS
                            }
                            value={payments}
                            onChange={(next) => setDetail('payments', next)}
                            placeholder="Select a payment method…"
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}
