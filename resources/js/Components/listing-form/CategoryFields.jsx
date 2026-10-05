import {
    CATEGORY_DETAIL_FIELDS,
    PAYMENT_OPTIONS,
    PRICE_LEVELS,
    categoryStepTitle,
} from './categoryFieldConfig';
import TierLockedField from './TierLockedField';
import { field, help, label } from './fieldStyles';
import RichTextEditor from './RichTextEditor';
import {
    canUseEatDrinkFeature,
    eatDrinkCuisineLimit,
    normalizeTier,
    tierMeets,
} from '@/data/eatDrinkTierFeatures';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

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

function MultiChipPicker({ options = [], value = [], onChange, disabled = false }) {
    const selected = asTagList(value);

    return (
        <div className="mt-2 flex flex-wrap gap-2">
            {options.map((opt) => {
                const active = selected.includes(opt);
                return (
                    <button
                        key={opt}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                            if (disabled) return;
                            const next = active
                                ? selected.filter((p) => p !== opt)
                                : [...selected, opt];
                            onChange(next);
                        }}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                            active
                                ? 'bg-olive-900 text-white'
                                : 'bg-olive-100 text-olive-800 hover:bg-olive-200'
                        }`}
                    >
                        {opt}
                    </button>
                );
            })}
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
    isAdmin = false,
}) {
    const fields = CATEGORY_DETAIL_FIELDS[categoryKey] || [];
    const isEatDrink = categoryKey === 'eatDrink';
    const listingTier = normalizeTier(tier);

    const setDetail = (key, value) => {
        onDetailsChange({ ...details, [key]: value });
    };

    const payments = details.payments || [];
    const paymentsLocked = isEatDrink && !canUseEatDrinkFeature(listingTier, 'payments');
    const priceLevels =
        isEatDrink && !tierMeets(listingTier, 'featured')
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
                        <label className={label} htmlFor="early_bird_price">
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
                                onEventChange?.({ gate_price: e.target.value })
                            }
                        />
                    </div>
                    <div>
                        <label className={label} htmlFor="ticket_url">
                            Ticket link
                        </label>
                        <input
                            id="ticket_url"
                            className={field}
                            value={eventFields.ticket_url || ''}
                            onChange={(e) =>
                                onEventChange?.({ ticket_url: e.target.value })
                            }
                            placeholder="https://"
                        />
                    </div>
                </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((f) => {
                    const minTier = f.minTier || 'free';
                    const locked =
                        isEatDrink && !tierMeets(listingTier, minTier);
                    const cuisineMax =
                        f.key === 'cuisine' && isEatDrink
                            ? eatDrinkCuisineLimit(listingTier)
                            : null;

                    return (
                        <TierLockedField
                            key={f.key}
                            locked={locked}
                            feature={f.key}
                            requiredTier={
                                minTier === 'featured'
                                    ? 'Standard'
                                    : minTier === 'premium'
                                      ? 'Premium'
                                      : 'Free'
                            }
                            isAdmin={isAdmin}
                            className={
                                f.type === 'tags' ||
                                f.type === 'multi' ||
                                f.type === 'richtext' ||
                                f.key.includes('highlight') ||
                                f.key === 'booking_url' ||
                                f.key === 'avg_meal'
                                    ? 'sm:col-span-2'
                                    : ''
                            }
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
                                            required={f.required && !locked}
                                            disabled={locked}
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
                                            disabled={locked}
                                        />
                                    ) : f.type === 'multi' ? (
                                        <MultiChipPicker
                                            options={f.options || []}
                                            value={details[f.key] || []}
                                            onChange={(v) =>
                                                setDetail(f.key, v)
                                            }
                                            disabled={locked}
                                        />
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
                                            required={f.required && !locked}
                                            disabled={locked}
                                        />
                                    )}
                                    {f.help ? (
                                        <p className={help}>{f.help}</p>
                                    ) : null}
                                </>
                            )}
                        </TierLockedField>
                    );
                })}
            </div>

            {(categoryKey === 'eatDrink' ||
                categoryKey === 'stay' ||
                categoryKey === 'shopping') && (
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

            <TierLockedField
                locked={paymentsLocked}
                feature="payments"
                requiredTier="Standard"
                isAdmin={isAdmin}
            >
                <div>
                    <p className={label}>Payment methods</p>
                    <MultiChipPicker
                        options={
                            isEatDrink
                                ? ['M-Pesa', 'Card', 'Cash', 'Paybill', 'Bank transfer']
                                : PAYMENT_OPTIONS
                        }
                        value={payments}
                        onChange={(next) => setDetail('payments', next)}
                        disabled={paymentsLocked}
                    />
                    {isEatDrink ? (
                        <p className={help}>
                            Standard plan unlocks M-Pesa, cards, and cash options.
                        </p>
                    ) : null}
                </div>
            </TierLockedField>
        </div>
    );
}
