import { MapPin, Tag } from 'lucide-react';
import DetailSection from './DetailSection';

export default function ChipRow({ chips, priceRangeLabel }) {
    const region = chips?.region;
    const categories = chips?.categories?.filter(Boolean) || [];
    const tags = chips?.tags?.filter(Boolean) || [];

    if (!region && !categories.length && !tags.length && !priceRangeLabel) {
        return null;
    }

    return (
        <div className="space-y-4">
            {region ? (
                <DetailSection title="Region">
                    <p className="inline-flex items-center gap-2 text-sm font-medium text-olive-800">
                        <MapPin className="h-4 w-4 text-mustard" />
                        {region}
                    </p>
                </DetailSection>
            ) : null}

            {priceRangeLabel ? (
                <DetailSection title="Price range">
                    <p className="font-display text-lg font-semibold text-earth-dusk">
                        {priceRangeLabel}
                    </p>
                </DetailSection>
            ) : null}

            {categories.length || tags.length ? (
                <DetailSection title="Categories">
                    <div className="flex flex-wrap gap-2">
                        {[...categories, ...tags].map((label) => (
                            <span
                                key={label}
                                className="inline-flex items-center gap-1.5 rounded-full bg-olive-50 px-3 py-1.5 text-xs font-semibold text-olive-800"
                            >
                                <Tag className="h-3 w-3 text-mustard" />
                                {label}
                            </span>
                        ))}
                    </div>
                </DetailSection>
            ) : null}
        </div>
    );
}
