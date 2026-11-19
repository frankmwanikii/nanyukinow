import { Ticket } from '@/Components/site/LucideCompat';
import DetailSection from './DetailSection';

export default function EventTickets({ listing }) {
    if (listing?.categoryKey !== 'events') return null;

    const hasTiers = listing.earlyBirdPrice || listing.gatePrice;
    const hasAny =
        hasTiers || listing.ticketPrice || listing.ticketUrl || listing.ageLimit;
    if (!hasAny) return null;

    return (
        <DetailSection
            title="Tickets"
            action={
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-olive-50 text-olive-800">
                    <Ticket className="h-4 w-4" strokeWidth={2} />
                </span>
            }
        >
            {hasTiers ? (
                <div className="overflow-hidden rounded-xl ring-1 ring-olive-100">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-olive-50/90">
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-olive-500">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-olive-500">
                                    Price
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {listing.earlyBirdPrice ? (
                                <tr className="border-t border-olive-100 bg-white">
                                    <td className="px-4 py-3.5">
                                        <p className="font-display text-[15px] font-semibold text-earth-dusk">
                                            Early bird
                                        </p>
                                        <p className="mt-0.5 text-xs text-olive-500">
                                            Advance purchase online
                                        </p>
                                    </td>
                                    <td className="px-4 py-3.5 text-right font-display text-base font-bold text-olive-900">
                                        {listing.earlyBirdPrice}
                                    </td>
                                </tr>
                            ) : null}
                            {listing.gatePrice ? (
                                <tr className="border-t border-olive-100 bg-white">
                                    <td className="px-4 py-3.5">
                                        <p className="font-display text-[15px] font-semibold text-earth-dusk">
                                            Gate ticket
                                        </p>
                                        <p className="mt-0.5 text-xs text-olive-500">
                                            Paid at the entrance
                                        </p>
                                    </td>
                                    <td className="px-4 py-3.5 text-right font-display text-base font-bold text-olive-900">
                                        {listing.gatePrice}
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            ) : listing.ticketPrice ? (
                <p className="font-display text-lg font-semibold text-earth-dusk">
                    {listing.ticketPrice}
                </p>
            ) : null}

            {listing.ageLimit ? (
                <p className="mt-3 text-sm text-olive-600">
                    Age limit:{' '}
                    <span className="font-semibold text-olive-800">
                        {listing.ageLimit}
                    </span>
                </p>
            ) : null}

            {listing.ticketUrl ? (
                <a
                    href={listing.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-mustard px-6 py-3.5 text-sm font-bold text-olive-950 shadow-soft transition hover:bg-olive-700 hover:text-white sm:w-auto"
                >
                    <Ticket className="h-4 w-4" />
                    Buy tickets
                </a>
            ) : null}
        </DetailSection>
    );
}
