import DetailSection from './DetailSection';

function Chip({ children }) {
    return (
        <span className="inline-flex rounded-full bg-olive-100 px-3 py-1.5 text-xs font-semibold text-olive-800">
            {children}
        </span>
    );
}

export default function ChipRow({ chips }) {
    const categories = Array.isArray(chips?.categories)
        ? chips.categories.filter(Boolean)
        : [];
    const region = chips?.region || null;

    if (!region && !categories.length) {
        return null;
    }

    return (
        <div className="space-y-4">
            {region ? (
                <DetailSection title="Location">
                    <Chip>{region}</Chip>
                </DetailSection>
            ) : null}

            {categories.length ? (
                <DetailSection title="Appears in">
                    <div className="flex flex-wrap gap-2">
                        {categories.map((item) => (
                            <Chip key={`cat-${item}`}>{item}</Chip>
                        ))}
                    </div>
                </DetailSection>
            ) : null}
        </div>
    );
}
