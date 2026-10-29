import DetailSection from './DetailSection';

export default function ChipRow({ priceRangeLabel, chips }) {
    const categories = Array.isArray(chips?.categories)
        ? chips.categories.filter(Boolean)
        : [];
    const tags = Array.isArray(chips?.tags) ? chips.tags.filter(Boolean) : [];
    const region = chips?.region || null;
    const hasChips = Boolean(region || categories.length || tags.length);

    if (!priceRangeLabel && !hasChips) {
        return null;
    }

    return (
        <DetailSection>
            <div className="flex flex-col gap-4">
                {priceRangeLabel ? (
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-olive-500">
                            Price range
                        </p>
                        <p className="mt-1 font-display text-lg font-semibold text-earth-dusk">
                            {priceRangeLabel}
                        </p>
                    </div>
                ) : null}
                {hasChips ? (
                    <div className="flex flex-wrap gap-2">
                        {region ? (
                            <span className="inline-flex rounded-full bg-olive-100 px-3 py-1.5 text-xs font-semibold text-olive-800">
                                {region}
                            </span>
                        ) : null}
                        {categories.map((item) => (
                            <span
                                key={`cat-${item}`}
                                className="inline-flex rounded-full bg-olive-100 px-3 py-1.5 text-xs font-semibold text-olive-800"
                            >
                                {item}
                            </span>
                        ))}
                        {tags.map((item) => (
                            <span
                                key={`tag-${item}`}
                                className="inline-flex rounded-full bg-mustard/20 px-3 py-1.5 text-xs font-semibold text-olive-900"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>
        </DetailSection>
    );
}
