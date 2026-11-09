import { Plus, Trash2 } from 'lucide-react';
import { field, help, label } from './fieldStyles';

/**
 * Normalize stored pricing (array of {name, price} or legacy free-text string).
 */
export function asPricingOptions(value) {
    if (Array.isArray(value)) {
        return value.map((row) => ({
            name: String(row?.name ?? ''),
            price: String(row?.price ?? ''),
        }));
    }

    if (typeof value === 'string' && value.trim() !== '') {
        return [{ name: '', price: value.trim() }];
    }

    return [];
}

export function compactPricingOptions(rows) {
    return asPricingOptions(rows).filter(
        (row) => row.name.trim() !== '' || row.price.trim() !== '',
    );
}

/**
 * Repeatable name + price rows for Things to do charges.
 */
export default function PricingOptionsInput({
    id = 'pricing',
    value = [],
    onChange,
    fieldHelp = null,
    required = false,
}) {
    const rows = asPricingOptions(value);
    const displayRows =
        rows.length > 0 ? rows : [{ name: '', price: '' }];

    const commit = (next) => {
        // Keep empty rows while editing so "Add pricing option" works.
        onChange(asPricingOptions(next));
    };

    const updateRow = (index, patch) => {
        const next = displayRows.map((row, i) =>
            i === index ? { ...row, ...patch } : row,
        );
        commit(next);
    };

    const addRow = () => {
        commit([...displayRows, { name: '', price: '' }]);
    };

    const removeRow = (index) => {
        const next = displayRows.filter((_, i) => i !== index);
        commit(next.length ? next : []);
    };

    return (
        <div>
            <p className={label}>
                Pricing
                {required ? (
                    <span className="text-rose-500"> *</span>
                ) : null}
            </p>
            <ul className="space-y-3">
                {displayRows.map((row, index) => (
                    <li
                        key={`${id}-${index}`}
                        className="rounded-xl border border-olive-100 bg-olive-50/40 p-3 dark:border-olive-800 dark:bg-olive-950/40"
                    >
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-olive-500 dark:text-olive-400">
                                Option {index + 1}
                            </span>
                            {displayRows.length > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => removeRow(index)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-olive-200 text-olive-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-olive-700 dark:hover:border-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                                    aria-label={`Remove pricing option ${index + 1}`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            ) : null}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="min-w-0">
                                <label
                                    className="mb-1 block text-xs font-semibold text-olive-500 dark:text-olive-400"
                                    htmlFor={`${id}_name_${index}`}
                                >
                                    Name
                                </label>
                                <input
                                    id={`${id}_name_${index}`}
                                    className={field}
                                    value={row.name}
                                    onChange={(e) =>
                                        updateRow(index, {
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Kenya adult"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="min-w-0">
                                <label
                                    className="mb-1 block text-xs font-semibold text-olive-500 dark:text-olive-400"
                                    htmlFor={`${id}_price_${index}`}
                                >
                                    Price
                                </label>
                                <input
                                    id={`${id}_price_${index}`}
                                    className={field}
                                    value={row.price}
                                    onChange={(e) =>
                                        updateRow(index, {
                                            price: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. KES 2,500"
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            <button
                type="button"
                onClick={addRow}
                className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-sm bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-olive-800 dark:bg-mustard dark:text-olive-950 dark:hover:bg-mustard/90"
            >
                <Plus className="h-4 w-4" />
                Add pricing option
            </button>
            {fieldHelp ? <p className={help}>{fieldHelp}</p> : null}
        </div>
    );
}
