import DetailSection from './DetailSection';

/**
 * Standalone charges / pricing options card for Things to do.
 */
export default function ChargesCard({ fact }) {
    if (!fact) return null;

    const rows = Array.isArray(fact.rows)
        ? fact.rows.filter((row) => row?.name || row?.price)
        : null;

    if (!rows?.length && !fact.value) return null;

    return (
        <DetailSection title="Charges">
            {rows?.length ? (
                <ul className="space-y-0">
                    {rows.map((row, index) => (
                        <li
                            key={`${row.name}-${row.price}-${index}`}
                            className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 border-b border-olive-900/10 py-3 first:pt-0 last:border-b-0 last:pb-0"
                        >
                            <span className="min-w-0 break-words text-sm font-normal leading-relaxed text-olive-800">
                                {row.name || 'Price'}
                            </span>
                            <span className="shrink-0 whitespace-nowrap text-right text-sm font-normal leading-relaxed text-olive-800">
                                {row.price || 'On request'}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm font-normal leading-relaxed text-olive-800">
                    {fact.value}
                </p>
            )}
        </DetailSection>
    );
}
