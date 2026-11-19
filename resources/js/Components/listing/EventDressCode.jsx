import DetailSection from './DetailSection';

function dressItems(listing) {
    const raw = listing.dressCode || listing.details?.dress_code || null;
    if (Array.isArray(raw)) {
        return raw.map((item) => String(item || '').trim()).filter(Boolean);
    }
    if (!raw) return [];
    return String(raw)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

export default function EventDressCode({ listing }) {
    if (listing?.categoryKey !== 'events') return null;

    const items = dressItems(listing);
    if (!items.length) return null;

    return (
        <DetailSection title="Dress code">
            <ul className="flex flex-wrap gap-2">
                {items.map((item) => (
                    <li
                        key={item}
                        className="rounded-full bg-olive-50 px-3 py-1.5 text-sm font-semibold text-olive-800 ring-1 ring-olive-200/80"
                    >
                        {item}
                    </li>
                ))}
            </ul>
        </DetailSection>
    );
}
