import { DAYS, defaultHours, label } from './fieldStyles';
import { Check, Copy, Moon } from 'lucide-react';

function formatDay(day) {
    return {
        full: day,
        short: day.slice(0, 3),
    };
}

function StatusToggle({ closed, onChange }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={!closed}
            aria-label={closed ? 'Marked closed' : 'Marked open'}
            onClick={() => onChange(!closed)}
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-1.5 text-xs font-semibold transition ${
                closed
                    ? 'bg-olive-100 text-olive-600 ring-1 ring-olive-200 dark:bg-olive-800 dark:text-olive-300 dark:ring-olive-700'
                    : 'bg-olive-900 text-white dark:bg-mustard dark:text-earth-dusk'
            }`}
        >
            <span
                className={`flex h-6 w-6 items-center justify-center rounded-full transition ${
                    closed
                        ? 'bg-white text-olive-500 shadow-sm dark:bg-olive-950 dark:text-olive-400'
                        : 'bg-mustard text-olive-950'
                }`}
            >
                {closed ? (
                    <Moon className="h-3.5 w-3.5" strokeWidth={2} />
                ) : (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                )}
            </span>
            <span className="pr-2.5">{closed ? 'Closed' : 'Open'}</span>
        </button>
    );
}

function TimeField({ value, disabled, onChange, ariaLabel }) {
    return (
        <input
            type="time"
            aria-label={ariaLabel}
            value={value || '08:00'}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className={`h-10 w-[6.75rem] shrink-0 rounded-xl border bg-white px-2 text-sm font-semibold tabular-nums text-olive-900 outline-none transition focus:border-mustard focus:ring-2 focus:ring-mustard/30 disabled:cursor-not-allowed disabled:bg-olive-50/80 disabled:text-olive-400 dark:bg-olive-950 dark:text-olive-50 dark:disabled:bg-olive-900 dark:disabled:text-olive-600 sm:w-[7.5rem] ${
                disabled
                    ? 'border-olive-100 dark:border-olive-800'
                    : 'border-olive-200 dark:border-olive-700'
            }`}
        />
    );
}

export default function HoursEditor({
    hours,
    onChange,
    title = 'Opening hours',
    helpText = 'Set Monday, then apply the same hours across the week.',
}) {
    const rows = hours?.length ? hours : defaultHours();

    const update = (index, patch) => {
        const next = rows.map((row, i) =>
            i === index ? { ...row, ...patch } : row,
        );
        onChange(next);
    };

    const copyToAll = (sourceIndex) => {
        const source = rows[sourceIndex];
        if (!source) return;
        onChange(
            rows.map((row) => ({
                ...row,
                open: source.open || '08:00',
                close: source.close || '18:00',
                closed: Boolean(source.closed),
            })),
        );
    };

    const copyWeekdays = (sourceIndex) => {
        const source = rows[sourceIndex];
        if (!source) return;
        onChange(
            rows.map((row, i) => {
                const day = row.day || DAYS[i];
                if (day === 'Sunday') {
                    return { ...row, closed: true };
                }
                return {
                    ...row,
                    open: source.open || '08:00',
                    close: source.close || '18:00',
                    closed: Boolean(source.closed),
                };
            }),
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className={label}>{title}</p>
                    <p className="text-xs text-olive-500 dark:text-olive-400">
                        {helpText}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => copyToAll(0)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-olive-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-olive-800 dark:bg-mustard dark:text-earth-dusk dark:hover:bg-mustard/90"
                    >
                        <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                        Copy schedule to all
                    </button>
                    <button
                        type="button"
                        onClick={() => copyWeekdays(0)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-olive-200 bg-white px-3 py-2 text-xs font-semibold text-olive-800 transition hover:border-olive-300 hover:bg-olive-50 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-100 dark:hover:border-olive-600 dark:hover:bg-olive-900"
                    >
                        Mon–Sat · Sun closed
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-olive-200/80 dark:bg-olive-950 dark:shadow-none dark:ring-olive-800">
                <div className="hidden items-center gap-3 border-b border-olive-100 bg-olive-50/70 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-olive-500 dark:border-olive-800 dark:bg-olive-900/70 dark:text-olive-400 md:grid md:grid-cols-[6.5rem_minmax(0,1fr)_7.5rem_2.25rem]">
                    <span>Day</span>
                    <span>Hours</span>
                    <span className="text-center">Status</span>
                    <span className="sr-only">Copy</span>
                </div>

                <ul className="divide-y divide-olive-100 dark:divide-olive-800">
                    {rows.map((row, index) => {
                        const day = formatDay(row.day || DAYS[index]);
                        const closed = Boolean(row.closed);

                        return (
                            <li
                                key={day.full}
                                className={`px-3 py-3.5 transition md:px-4 ${
                                    closed
                                        ? 'bg-olive-50/50 dark:bg-olive-900/40'
                                        : 'bg-white dark:bg-olive-950'
                                }`}
                            >
                                <div className="flex flex-col gap-3 md:grid md:grid-cols-[6.5rem_minmax(0,1fr)_7.5rem_2.25rem] md:items-center md:gap-3">
                                    <div className="flex items-center justify-between gap-3 md:block">
                                        <p className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                                            <span className="md:hidden">
                                                {day.short}
                                            </span>
                                            <span className="hidden md:inline">
                                                {day.full}
                                            </span>
                                        </p>
                                        <div className="md:hidden">
                                            <StatusToggle
                                                closed={closed}
                                                onChange={(nextClosed) =>
                                                    update(index, {
                                                        closed: nextClosed,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div
                                        className={`flex items-center gap-2 ${
                                            closed ? 'pointer-events-none opacity-40' : ''
                                        }`}
                                    >
                                        <TimeField
                                            value={row.open}
                                            disabled={closed}
                                            ariaLabel={`${day.full} opens`}
                                            onChange={(open) =>
                                                update(index, { open })
                                            }
                                        />
                                        <span
                                            className="shrink-0 text-xs font-semibold text-olive-400"
                                            aria-hidden
                                        >
                                            –
                                        </span>
                                        <TimeField
                                            value={row.close}
                                            disabled={closed}
                                            ariaLabel={`${day.full} closes`}
                                            onChange={(close) =>
                                                update(index, { close })
                                            }
                                        />
                                    </div>

                                    <div className="hidden justify-center md:flex">
                                        <StatusToggle
                                            closed={closed}
                                            onChange={(nextClosed) =>
                                                update(index, {
                                                    closed: nextClosed,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="flex justify-end md:justify-center">
                                        <button
                                            type="button"
                                            title={`Copy ${day.full} hours to every day`}
                                            disabled={closed}
                                            onClick={() => copyToAll(index)}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-olive-500 transition hover:bg-olive-100 hover:text-olive-900 disabled:pointer-events-none disabled:opacity-30 dark:text-olive-400 dark:hover:bg-olive-800 dark:hover:text-olive-100"
                                        >
                                            <Copy
                                                className="h-3.5 w-3.5"
                                                strokeWidth={2}
                                            />
                                            <span className="sr-only">
                                                Copy {day.full} to all days
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
