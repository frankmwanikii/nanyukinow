import { Plus, Trash2 } from '@/Components/site/LucideCompat';
import { field, help, label } from './fieldStyles';

/**
 * Normalize stored tickets (array of {name, amount} or empty).
 */
export function asTicketOptions(value) {
    if (Array.isArray(value)) {
        return value.map((row) => ({
            name: String(row?.name ?? ''),
            amount:
                row?.amount === null ||
                row?.amount === undefined ||
                row?.amount === ''
                    ? ''
                    : String(row.amount).replace(/\D+/g, ''),
        }));
    }

    return [];
}

export function compactTicketOptions(rows) {
    return asTicketOptions(rows).filter(
        (row) => row.name.trim() !== '' || row.amount !== '',
    );
}

function digitsOnly(value) {
    return String(value ?? '').replace(/\D+/g, '');
}

/**
 * Repeatable ticket name + KSh amount rows for Events.
 */
export default function TicketOptionsInput({
    id = 'ticket_options',
    value = [],
    onChange,
    fieldHelp = null,
    showHeading = true,
}) {
    const rows = asTicketOptions(value);
    const displayRows =
        rows.length > 0 ? rows : [{ name: '', amount: '' }];

    const commit = (next) => {
        onChange(asTicketOptions(next));
    };

    const updateRow = (index, patch) => {
        const next = displayRows.map((row, i) =>
            i === index ? { ...row, ...patch } : row,
        );
        commit(next);
    };

    const addRow = () => {
        commit([...displayRows, { name: '', amount: '' }]);
    };

    const removeRow = (index) => {
        const next = displayRows.filter((_, i) => i !== index);
        commit(next.length ? next : []);
    };

    return (
        <div className="min-w-0">
            {showHeading ? <p className={label}>Tickets</p> : null}
            <ul className="space-y-3">
                {displayRows.map((row, index) => (
                    <li
                        key={`${id}-${index}`}
                        className="min-w-0 rounded-xl border border-olive-100 bg-olive-50/40 p-3 sm:p-4 dark:border-olive-800 dark:bg-olive-950/40"
                    >
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-olive-500 dark:text-olive-400">
                                Ticket {index + 1}
                            </span>
                            {displayRows.length > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => removeRow(index)}
                                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-olive-200 text-olive-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-olive-700 dark:hover:border-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                                    aria-label={`Remove ticket ${index + 1}`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            ) : null}
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="min-w-0">
                                <label
                                    className="mb-1 block text-xs font-semibold text-olive-500 dark:text-olive-400"
                                    htmlFor={`${id}_name_${index}`}
                                >
                                    Ticket name
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
                                    placeholder="e.g. Early bird"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="min-w-0">
                                <label
                                    className="mb-1 block text-xs font-semibold text-olive-500 dark:text-olive-400"
                                    htmlFor={`${id}_amount_${index}`}
                                >
                                    Amount (KSh)
                                </label>
                                <input
                                    id={`${id}_amount_${index}`}
                                    type="number"
                                    inputMode="numeric"
                                    min={0}
                                    step={1}
                                    className={field}
                                    value={row.amount}
                                    onChange={(e) =>
                                        updateRow(index, {
                                            amount: digitsOnly(e.target.value),
                                        })
                                    }
                                    onKeyDown={(e) => {
                                        if (
                                            [
                                                'e',
                                                'E',
                                                '+',
                                                '-',
                                                '.',
                                                ',',
                                            ].includes(e.key)
                                        ) {
                                            e.preventDefault();
                                        }
                                    }}
                                    placeholder="0"
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
                Add ticket
            </button>
            {fieldHelp ? <p className={help}>{fieldHelp}</p> : null}
        </div>
    );
}
