import { MapPin } from '@/Components/site/LucideCompat';
import DetailSection from './DetailSection';

const EVENT_REGIONS = ['Nanyuki', 'Timau', 'Naromoru'];

function eventRegion(listing) {
    const raw = String(listing?.region || listing?.location || '').trim();
    if (!raw) return null;
    const match = EVENT_REGIONS.find(
        (region) => region.toLowerCase() === raw.toLowerCase(),
    );
    return match || null;
}

export default function EventWhere({ listing }) {
    if (listing?.categoryKey !== 'events') return null;

    const venue = listing.venue || null;
    const region = eventRegion(listing);
    const organiser = listing.organiser || null;
    const doorsOpen = listing.doorsOpen || listing.details?.doors_open || null;
    const dressCode = listing.dressCode || listing.details?.dress_code || null;
    if (!venue && !region && !organiser && !doorsOpen && !dressCode) return null;

    const rows = [];
    if (venue) rows.push({ label: 'Venue', value: venue });
    if (region) rows.push({ label: 'Region', value: region });
    if (organiser) rows.push({ label: 'Organised by', value: organiser });
    if (doorsOpen) rows.push({ label: 'Doors open', value: String(doorsOpen) });
    if (dressCode) rows.push({ label: 'Dress code', value: String(dressCode) });

    return (
        <DetailSection
            title="Venue & location"
            action={
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mustard/25 text-olive-900">
                    <MapPin className="h-4 w-4" strokeWidth={2} />
                </span>
            }
        >
            <dl className="divide-y divide-olive-100">
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                        <dt className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-olive-500">
                            {row.label}
                        </dt>
                        <dd className="text-right font-display text-[15px] font-semibold text-earth-dusk">
                            {row.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </DetailSection>
    );
}
