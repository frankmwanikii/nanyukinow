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
} from 'lucide-react';
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

export default function AmenitiesGrid({
    amenities = [],
    title = 'Amenities',
}) {
    const items = (amenities || [])
        .map((key) => {
            if (typeof key === 'string') {
                return AMENITY_META[key] || { label: key, icon: Leaf };
            }
            return key;
        })
        .filter(Boolean);

    if (!items.length) return null;

    return (
        <DetailSection title={title}>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {items.map((item) => {
                    const Icon = item.icon || Leaf;
                    return (
                        <li
                            key={item.label}
                            className="flex items-center gap-3 rounded-xl bg-olive-50/80 px-3 py-2.5 text-sm font-medium text-olive-800"
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-olive-700 shadow-soft">
                                <Icon className="h-4 w-4" />
                            </span>
                            {item.label}
                        </li>
                    );
                })}
            </ul>
        </DetailSection>
    );
}
