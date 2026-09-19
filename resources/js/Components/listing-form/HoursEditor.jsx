import { DAYS, defaultHours, field, label } from './fieldStyles';

export default function HoursEditor({ hours, onChange }) {
    const rows = hours?.length ? hours : defaultHours();

    const update = (index, patch) => {
        const next = rows.map((row, i) =>
            i === index ? { ...row, ...patch } : row,
        );
        onChange(next);
    };

    return (
        <div className="space-y-3">
            <div>
                <p className={label}>Opening hours</p>
                <p className="text-xs text-olive-500">
                    Toggle closed days and set open / close times.
                </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-olive-100">
                {rows.map((row, index) => (
                    <div
                        key={row.day || DAYS[index]}
                        className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-olive-50 px-3 py-3 last:border-b-0 sm:grid-cols-[7rem_1fr_1fr_auto]"
                    >
                        <p className="text-sm font-semibold text-olive-900">
                            {row.day}
                        </p>
                        <input
                            type="time"
                            className={`${field} py-2 text-sm`}
                            value={row.open || '08:00'}
                            disabled={row.closed}
                            onChange={(e) =>
                                update(index, { open: e.target.value })
                            }
                        />
                        <input
                            type="time"
                            className={`${field} py-2 text-sm`}
                            value={row.close || '18:00'}
                            disabled={row.closed}
                            onChange={(e) =>
                                update(index, { close: e.target.value })
                            }
                        />
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-olive-700">
                            <input
                                type="checkbox"
                                checked={Boolean(row.closed)}
                                onChange={(e) =>
                                    update(index, { closed: e.target.checked })
                                }
                                className="rounded border-olive-300 text-mustard focus:ring-mustard"
                            />
                            Closed
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}
