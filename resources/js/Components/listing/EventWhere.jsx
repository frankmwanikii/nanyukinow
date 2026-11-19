import DetailSection from './DetailSection';

const EVENT_TOWNS = ['Nanyuki', 'Timau', 'Naromoru'];

function eventTown(listing) {
    const raw = String(listing?.region || listing?.location || '').trim();
    if (!raw) return null;
    const match = EVENT_TOWNS.find(
        (town) => town.toLowerCase() === raw.toLowerCase(),
    );
    return match || raw;
}

export default function EventWhere({ listing }) {
    if (listing?.categoryKey !== 'events') return null;

    const venue = listing.venue ? String(listing.venue).trim() : null;
    const town = eventTown(listing);

    if (!venue && !town) return null;

    return (
        <DetailSection title="Venue & location">
            <div className="space-y-4">
                {venue ? (
                    <div>
                        <p className="text-sm text-olive-600">Venue</p>
                        <p className="mt-1 font-display text-lg font-semibold leading-snug text-earth-dusk">
                            {venue}
                        </p>
                    </div>
                ) : null}

                {town ? (
                    <div>
                        <p className="text-sm text-olive-600">Town</p>
                        <p className="mt-1 font-display text-[15px] font-semibold text-earth-dusk">
                            {town}
                        </p>
                    </div>
                ) : null}
            </div>
        </DetailSection>
    );
}
