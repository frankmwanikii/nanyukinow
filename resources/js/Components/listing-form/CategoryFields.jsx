import {
    CATEGORY_DETAIL_FIELDS,
    PAYMENT_OPTIONS,
    POPULAR_DELIVERY_OPTIONS,
    POPULAR_DIETARY_OPTIONS,
    POPULAR_DRESS_CODES,
    POPULAR_NEARBY_ATTRACTIONS,
    POPULAR_SHOPPING_DELIVERY_OPTIONS,
    POPULAR_STAY_ACTIVITIES,
    POPULAR_WHOLESALE_RETAIL_OPTIONS,
    PRICE_LEVELS,
    categoryStepTitle,
} from './categoryFieldConfig';
import CapacityAreasInput from './CapacityAreasInput';
import CuisinePicker from './CuisinePicker';
import SuggestTagsPicker from './SuggestTagsPicker';
import { field, help, label } from './fieldStyles';
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
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

const SUGGEST_OPTIONS = {
    dietary: POPULAR_DIETARY_OPTIONS,
    delivery: POPULAR_DELIVERY_OPTIONS,
    shopping_delivery: POPULAR_SHOPPING_DELIVERY_OPTIONS,
    wholesale_retail: POPULAR_WHOLESALE_RETAIL_OPTIONS,
    dress_code: POPULAR_DRESS_CODES,
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
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-olive-900 px-3 text-sm font-semibold text-white disabled:opacity-50"
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
                                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-olive-700 transition hover:bg-olive-200 hover:text-olive-950 disabled:opacity-50 dark:text-olive-200 dark:hover:bg-olive-700 dark:hover:text-white"
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

export default function CategoryFields({
    categoryKey,
    details = {},
    priceRange,
    onDetailsChange,
    onPriceRangeChange,
    eventFields = null,
    onEventChange,
    tier = 'free',
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
        onDetailsChange({ ...details, [key]: value });
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
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className={label} htmlFor="start_at">
                            Starts
                        </label>
                        <input
                            id="start_at"
                            type="datetime-local"
                            className={field}
                            value={eventFields.start_at || ''}
                            onChange={(e) =>
                                onEventChange?.({ start_at: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div>
                        <label className={label} htmlFor="end_at">
                            Ends
                        </label>
                        <input
                            id="end_at"
                            type="datetime-local"
                            className={field}
                            value={eventFields.end_at || ''}
                            onChange={(e) =>
                                onEventChange?.({ end_at: e.target.value })
                            }
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className={label} htmlFor="venue">
                            Venue name
                        </label>
                        <input
                            id="venue"
                            className={field}
                            value={eventFields.venue || ''}
                            onChange={(e) =>
                                onEventChange?.({ venue: e.target.value })
                            }
                            placeholder="e.g. Town Terrace"
                            required
                        />
                    </div>
                    {showEventTickets ? (
                        <>
                            <div>
                                <label className={label} htmlFor="ticket_price">
                                    Ticket price
                                </label>
                                <input
                                    id="ticket_price"
                                    className={field}
                                    value={eventFields.ticket_price || ''}
                                    onChange={(e) =>
                                        onEventChange?.({
                                            ticket_price: e.target.value,
                                        })
                                    }
                                    placeholder="From KES 1,200"
                                />
                            </div>
                            <div>
                                <label
                                    className={label}
                                    htmlFor="early_bird_price"
                                >
                                    Early bird
                                </label>
                                <input
                                    id="early_bird_price"
                                    className={field}
                                    value={eventFields.early_bird_price || ''}
                                    onChange={(e) =>
                                        onEventChange?.({
                                            early_bird_price: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="gate_price">
                                    Gate price
                                </label>
                                <input
                                    id="gate_price"
                                    className={field}
                                    value={eventFields.gate_price || ''}
                                    onChange={(e) =>
                                        onEventChange?.({
                                            gate_price: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </>
                    ) : null}
                    {showEventTicketUrl ? (
                        <div>
                            <label className={label} htmlFor="ticket_url">
                                Ticket link
                            </label>
                            <input
                                id="ticket_url"
                                className={field}
                                value={eventFields.ticket_url || ''}
                                onChange={(e) =>
                                    onEventChange?.({
                                        ticket_url: e.target.value,
                                    })
                                }
                                placeholder="https://"
                            />
                        </div>
                    ) : null}
                </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
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
                        f.key.includes('highlight') ||
                        f.key === 'booking_url' ||
                        f.key === 'reservations' ||
                        f.key === 'avg_meal' ||
                        f.key === 'host_bio' ||
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
                            className={spanWide ? 'sm:col-span-2' : ''}
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

            {(categoryKey === 'eatDrink' ||
                categoryKey === 'stay' ||
                categoryKey === 'shopping' ||
                categoryKey === 'thingsToDo') && (
                <div>
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
                <div>
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
            ) : null}
        </div>
    );
}
