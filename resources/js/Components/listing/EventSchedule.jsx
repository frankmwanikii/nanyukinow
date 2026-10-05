import DetailSection from './DetailSection';

export default function EventSchedule({
    items = [],
    title = 'Event schedule',
}) {
    const rows = Array.isArray(items) ? items.filter((i) => i?.label) : [];
    if (!rows.length) return null;

    return (
        <DetailSection title={title}>
            <ul className="divide-y divide-olive-100">
                {rows.map((row) => (
                    <li
                        key={row.label}
                        className="flex items-center justify-between gap-3 py-2.5 text-sm"
                    >
                        <span className="font-medium text-olive-800">
                            {row.label}
                        </span>
                        <span className="text-olive-600">{row.value}</span>
                    </li>
                ))}
            </ul>
        </DetailSection>
    );
}
