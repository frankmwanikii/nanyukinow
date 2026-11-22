import DetailSection from './DetailSection';

/**
 * Split "East African Citizens : Adult" into group + role.
 * @param {string} name
 * @returns {{ group: string|null, role: string }}
 */
function splitChargeName(name) {
    const text = String(name || '').trim();
    if (!text) {
        return { group: null, role: 'Price' };
    }

    const match = text.match(/^(.+?)\s*[:：]\s*(.+)$/);
    if (match) {
        return {
            group: match[1].trim(),
            role: match[2].trim(),
        };
    }

    return { group: null, role: text };
}

function titleCaseRole(role) {
    const text = String(role || '').trim();
    if (!text) {
        return text;
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * @param {Array<{ name?: string, price?: string }>} rows
 * @returns {Array<{ title: string|null, items: Array<{ role: string, price: string }> }>}
 */
function groupChargeRows(rows) {
    const groups = new Map();
    const order = [];

    rows.forEach((row) => {
        const { group, role } = splitChargeName(row.name || 'Price');
        const key = group || '';
        if (!groups.has(key)) {
            groups.set(key, []);
            order.push(key);
        }
        groups.get(key).push({
            role: titleCaseRole(role),
            price: String(row.price || '').trim() || 'On request',
        });
    });

    return order.map((key) => ({
        title: key || null,
        items: groups.get(key),
    }));
}

function FeeRows({ items, padded = false }) {
    return (
        <ul className="divide-y divide-olive-900/10">
            {items.map((item, index) => (
                <li
                    key={`${item.role}-${item.price}-${index}`}
                    className={`flex items-baseline justify-between gap-x-4 ${
                        padded ? 'px-4 py-3 sm:px-5' : 'py-2.5'
                    }`}
                >
                    <span className="min-w-0 text-sm leading-snug text-olive-700">
                        {item.role}
                    </span>
                    <span className="shrink-0 font-display text-[0.95rem] font-bold tabular-nums tracking-tight text-earth-dusk">
                        {item.price}
                    </span>
                </li>
            ))}
        </ul>
    );
}

/**
 * Things to do entry fees / pricing options.
 * Audience groups share one tariff board when there are two or more named groups.
 */
export default function ChargesCard({ fact }) {
    if (!fact) return null;

    const rows = Array.isArray(fact.rows)
        ? fact.rows.filter((row) => row?.name || row?.price)
        : null;

    if (!rows?.length && !fact.value) return null;

    const groups = rows?.length ? groupChargeRows(rows) : [];
    const hasNamedGroups = groups.filter((group) => group.title).length >= 2;

    return (
        <DetailSection id="entry-fees" title="Entry fees">
            {groups.length ? (
                hasNamedGroups ? (
                    <div className="overflow-hidden rounded-2xl border border-olive-900/10 bg-olive-50/50">
                        <div className="grid sm:grid-cols-2 sm:divide-x sm:divide-olive-900/10">
                            {groups.map((group, groupIndex) => (
                                <div
                                    key={group.title || `fees-${groupIndex}`}
                                    className={`min-w-0 ${
                                        groupIndex > 0
                                            ? 'border-t border-olive-900/10 sm:border-t-0'
                                            : ''
                                    }`}
                                >
                                    <div
                                        className={`relative border-b border-olive-900/10 bg-white px-4 py-3 sm:px-5 ${
                                            groupIndex === 0
                                                ? 'pl-[1.15rem] sm:pl-[1.35rem]'
                                                : ''
                                        }`}
                                    >
                                        {groupIndex === 0 ? (
                                            <span
                                                aria-hidden="true"
                                                className="absolute inset-y-0 left-0 w-1 bg-mustard"
                                            />
                                        ) : null}
                                        <h3 className="font-display text-[0.95rem] font-semibold leading-snug tracking-tight text-earth-dusk sm:text-base">
                                            {group.title}
                                        </h3>
                                    </div>
                                    <FeeRows items={group.items} padded />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-sm">
                        {groups.map((group, groupIndex) => (
                            <div
                                key={group.title || `fees-${groupIndex}`}
                                className="min-w-0"
                            >
                                {group.title ? (
                                    <h3 className="mb-1 font-display text-[0.95rem] font-semibold tracking-tight text-earth-dusk">
                                        {group.title}
                                    </h3>
                                ) : null}
                                <FeeRows items={group.items} />
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <p className="font-display text-base font-semibold text-earth-dusk">
                    {fact.value}
                </p>
            )}
        </DetailSection>
    );
}
