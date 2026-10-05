import DetailSection from './DetailSection';
import { formatGigWhenLabel } from '@/utils/eatDrinkDetails';

function scheduleLabel(row) {
    return formatGigWhenLabel(row) || (typeof row?.label === 'string' ? row.label : '');
}

export default function EventSchedule({
    items = [],
    title = 'Event schedule',
}) {
    const rows = Array.isArray(items)
        ? items.filter((i) => scheduleLabel(i) || i?.value)
        : [];
    if (!rows.length) return null;

    return (
        <DetailSection title={title}>
            <ul className="divide-y divide-olive-100">
                {rows.map((row, index) => {
                    const when = scheduleLabel(row);
                    return (
                        <li
                            key={`${when}-${row.value || ''}-${index}`}
                            className="flex items-center justify-between gap-3 py-2.5 text-sm"
                        >
                            <span className="min-w-0 font-medium text-olive-800">
                                {when || '—'}
                            </span>
                            {row.value ? (
                                <span className="shrink-0 text-right text-olive-600">
                                    {row.value}
                                </span>
                            ) : null}
                        </li>
                    );
                })}
            </ul>
        </DetailSection>
    );
}
