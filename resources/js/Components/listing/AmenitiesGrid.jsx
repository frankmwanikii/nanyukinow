import { useState } from 'react';
import { UNICONS } from '@/Components/site/uniconsPaths';
import { resolveAmenityItem } from '@/utils/amenityIcons';
import DetailSection from './DetailSection';

const PREVIEW_COUNT = 8;

function AmenityIcon({ name, className = 'h-5 w-5' }) {
    const html = UNICONS[name] || UNICONS['check-circle'];
    if (!html) return null;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`shrink-0 ${className}`}
            aria-hidden="true"
            fill="currentColor"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

export default function AmenitiesGrid({
    amenities = [],
    title = 'Amenities',
}) {
    const [expanded, setExpanded] = useState(false);

    const items = (amenities || [])
        .map((entry) => resolveAmenityItem(entry))
        .filter(Boolean);

    if (!items.length) return null;

    const visible = expanded ? items : items.slice(0, PREVIEW_COUNT);
    const hasMore = items.length > PREVIEW_COUNT;

    return (
        <DetailSection title={title}>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-2">
                {visible.map((item) => (
                    <li
                        key={item.slug || item.name}
                        className="flex items-center gap-3 text-sm font-medium text-olive-800"
                    >
                        <AmenityIcon
                            name={item.icon}
                            className="h-[1.15rem] w-[1.15rem] text-olive-700"
                        />
                        <span className="min-w-0 leading-snug">{item.name}</span>
                    </li>
                ))}
            </ul>
            {hasMore ? (
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="mt-4 text-sm font-semibold text-olive-900 underline decoration-olive-300 underline-offset-4 transition hover:decoration-mustard"
                >
                    {expanded
                        ? 'Show fewer'
                        : `Show all ${items.length} amenities`}
                </button>
            ) : null}
        </DetailSection>
    );
}
