import {
    CATEGORY_DETAIL_FIELDS,
    PAYMENT_OPTIONS,
    PRICE_LEVELS,
    categoryStepTitle,
} from './categoryFieldConfig';
import { field, help, label } from './fieldStyles';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

function TagsInput({ value = [], onChange, placeholder }) {
    const [draft, setDraft] = useState('');

    const add = () => {
        const next = draft.trim();
        if (!next) return;
        if (value.includes(next)) {
            setDraft('');
            return;
        }
        onChange([...value, next]);
        setDraft('');
    };

    return (
        <div>
            <div className="flex gap-2">
                <input
                    className={field}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={placeholder}
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
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-olive-900 px-3 text-sm font-semibold text-white"
                >
                    <Plus className="h-4 w-4" />
                    Add
                </button>
            </div>
            {value.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                    {value.map((item) => (
                        <span
                            key={item}
                            className="inline-flex items-center gap-1 rounded-full bg-olive-100 px-3 py-1 text-xs font-semibold text-olive-900"
                        >
                            {item}
                            <button
                                type="button"
                                onClick={() =>
                                    onChange(value.filter((v) => v !== item))
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

export default function CategoryFields({
    categoryKey,
    details = {},
    priceRange,
    onDetailsChange,
    onPriceRangeChange,
    eventFields = null,
    onEventChange,
}) {
    const fields = CATEGORY_DETAIL_FIELDS[categoryKey] || [];

    const setDetail = (key, value) => {
        onDetailsChange({ ...details, [key]: value });
    };

    const payments = details.payments || [];

    return (
        <div className="space-y-5">
            <div>
                <h3 className="font-display text-lg font-semibold text-olive-950">
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
                {fields.map((f) => (
                    <div
                        key={f.key}
                        className={
                            f.type === 'tags' || f.key.includes('highlight')
                                ? 'sm:col-span-2'
                                : ''
                        }
                    >
                        <label className={label} htmlFor={`detail_${f.key}`}>
                            {f.label}
                            {f.required ? (
                                <span className="text-rose-500"> *</span>
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
                                onChange={(v) => setDetail(f.key, v)}
                                placeholder={f.placeholder}
                            />
                        ) : (
                            <input
                                id={`detail_${f.key}`}
                                type={f.type === 'email' ? 'email' : f.type === 'time' ? 'time' : 'text'}
                                className={field}
                                value={details[f.key] || ''}
                                onChange={(e) =>
                                    setDetail(f.key, e.target.value)
                                }
                                placeholder={f.placeholder}
                                required={f.required}
                            />
                        )}
                        {f.help ? <p className={help}>{f.help}</p> : null}
                    </div>
                ))}
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
                        {PRICE_LEVELS.map((p) => (
                            <option key={p.value} value={p.value}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div>
                <p className={label}>Payment methods</p>
                <div className="mt-2 flex flex-wrap gap-2">
                    {PAYMENT_OPTIONS.map((opt) => {
                        const active = payments.includes(opt);
                        return (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                    const next = active
                                        ? payments.filter((p) => p !== opt)
                                        : [...payments, opt];
                                    setDetail('payments', next);
                                }}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
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
            </div>
        </div>
    );
}
