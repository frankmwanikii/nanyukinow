import { UserRound } from '@/Components/site/LucideCompat';
import DetailSection from './DetailSection';

export default function EventOrganiser({ listing }) {
    if (listing?.categoryKey !== 'events') return null;

    const organiser = String(
        listing.organiser || listing.details?.organiser || '',
    ).trim();
    if (!organiser) return null;

    return (
        <DetailSection
            title="Organiser"
            action={
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-olive-50 text-olive-800">
                    <UserRound className="h-4 w-4" strokeWidth={2} />
                </span>
            }
        >
            <p className="font-display text-lg font-semibold leading-snug text-earth-dusk">
                {organiser}
            </p>
            <p className="mt-1.5 text-sm text-olive-600">
                The team putting on this event.
            </p>
        </DetailSection>
    );
}
