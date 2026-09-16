import DetailSection from './DetailSection';

export default function HoursList({ hours, status = 'open', title = 'Hours' }) {
    if (!Array.isArray(hours) || !hours.length) return null;

    const isOpen = status === 'open';

    return (
        <DetailSection
            title={title}
            action={
                <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                        isOpen
                            ? 'bg-mint/30 text-olive-900'
                            : 'bg-red-100 text-red-700'
                    }`}
                >
                    {isOpen ? 'Open' : 'Closed'}
                </span>
            }
        >
            <ul className="divide-y divide-olive-100">
                {hours.map((row) => {
                    const closed =
                        !row.close ||
                        String(row.open).toLowerCase() === 'closed';
                    return (
                        <li
                            key={row.day}
                            className="flex items-center justify-between gap-3 py-2.5 text-sm"
                        >
                            <span className="font-medium text-olive-800">
                                {row.day}
                            </span>
                            <span className="text-olive-600">
                                {closed
                                    ? 'Closed'
                                    : `${row.open} – ${row.close}`}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </DetailSection>
    );
}
