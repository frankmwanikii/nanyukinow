import { MapPin, Tag } from 'lucide-react';
import DetailSection from './DetailSection';

export default function ChipRow({ chips, priceRangeLabel }) {
    const region = chips?.region;
    const categories = chips?.categories?.filter(Boolean) || [];
    const tags = chips?.tags?.filter(Boolean) || [];
    const labels = [...categories, ...tags];

    if (!region && !labels.length && !priceRangeLabel) {
        return null;
    }

    return (
        <DetailSection title="Details">
            <div className="space-y-4">
                {region ? (
                    <p className="inline-flex items-center gap-2 text-sm font-medium text-olive-800">
                        <MapPin className="h-4 w-4 shrink-0 text-mustard" />
                        {region}
                    </p>
                ) : null}

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

                {labels.length ? (
                    <div className="flex flex-wrap gap-2">
                        {labels.map((label) => (
                            <span
                                key={label}
                                className="inline-flex items-center gap-1.5 rounded-full border border-olive-200/80 bg-transparent px-3 py-1.5 text-xs font-semibold text-olive-800"
                            >
                                <Tag className="h-3 w-3 text-mustard" />
                                {label}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>
        </DetailSection>
    );
}
