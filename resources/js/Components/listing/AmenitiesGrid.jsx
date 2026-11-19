import {
    Accessibility,
    Baby,
    Car,
    ConciergeBell,
    CreditCard,
    Flame,
    Leaf,
    ParkingCircle,
    Shield,
    Shirt,
    Snowflake,
    Trees,
    Utensils,
    Waves,
    Wifi,
    Wine,
    Briefcase,
} from '@/Components/site/LucideCompat';
import { useState } from 'react';
import DetailSection from './DetailSection';

const AMENITY_META = {
    wifi: { label: 'Free Wi‑Fi', icon: Wifi },
    parking: { label: 'Parking', icon: ParkingCircle },
    pool: { label: 'Swimming pool', icon: Waves },
    restaurant: { label: 'Restaurant', icon: Utensils },
    workspace: { label: 'Workspace', icon: Briefcase },
    family: { label: 'Family friendly', icon: Baby },
    fireplace: { label: 'Fireplace', icon: Flame },
    laundry: { label: 'Laundry', icon: Shirt },
    outdoor: { label: 'Outdoor seating', icon: Trees },
    alcohol: { label: 'Bar / alcohol', icon: Wine },
    ac: { label: 'Air conditioning', icon: Snowflake },
    cards: { label: 'Accepts cards', icon: CreditCard },
    wheelchair: { label: 'Wheelchair access', icon: Accessibility },
    security: { label: 'Security', icon: Shield },
    garden: { label: 'Garden', icon: Leaf },
    concierge: { label: 'Concierge', icon: ConciergeBell },
    car: { label: 'Car access', icon: Car },
};

const PREVIEW_COUNT = 8;

export default function AmenitiesGrid({
    amenities = [],
    title = 'Amenities',
}) {
    const [expanded, setExpanded] = useState(false);

    const items = (amenities || [])
        .map((key) => {
            if (typeof key === 'string') {
                return AMENITY_META[key] || { label: key, icon: Leaf };
            }
            return key;
        })
        .filter(Boolean);

    if (!items.length) return null;

    const visible = expanded ? items : items.slice(0, PREVIEW_COUNT);
    const hasMore = items.length > PREVIEW_COUNT;

    return (
        <DetailSection title={title}>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                {visible.map((item) => {
                    const Icon = item.icon || Leaf;
                    return (
                        <li
                            key={item.label}
                            className="flex items-center gap-3 text-sm font-medium text-olive-800"
                        >
                            <Icon
                                className="h-[1.15rem] w-[1.15rem] shrink-0 text-olive-700"
                                strokeWidth={1.75}
                                aria-hidden
                            />
                            <span>{item.label}</span>
                        </li>
                    );
                })}
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
