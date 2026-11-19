import { Ticket } from '@/Components/site/LucideCompat';
import DetailSection from './DetailSection';

/**
 * Stable, brand-friendly ticket tones. Cycle by index so colors stay put
 * across renders, while still feeling varied.
 */
const TICKET_TONES = [
    {
        row: 'bg-mustard/25 ring-mustard/50',
        accent: 'bg-mustard',
        name: 'text-earth-dusk',
        price: 'text-olive-950',
    },
    {
        row: 'bg-olive-100 ring-olive-300/70',
        accent: 'bg-olive-700',
        name: 'text-olive-950',
        price: 'text-olive-900',
    },
    {
        row: 'bg-sky-100/90 ring-sky-300/60',
        accent: 'bg-sky-600',
        name: 'text-sky-950',
        price: 'text-sky-900',
    },
    {
        row: 'bg-orange-100/90 ring-orange-300/60',
        accent: 'bg-orange-500',
        name: 'text-orange-950',
        price: 'text-orange-900',
    },
    {
        row: 'bg-emerald-100/90 ring-emerald-300/60',
        accent: 'bg-emerald-600',
        name: 'text-emerald-950',
        price: 'text-emerald-900',
    },
    {
        row: 'bg-rose-100/90 ring-rose-300/60',
        accent: 'bg-rose-500',
        name: 'text-rose-950',
        price: 'text-rose-900',
    },
];

function toneForTicket(ticket, index) {
    const label = String(ticket?.name || '').toLowerCase();
    if (label.includes('vip') || label.includes('golden') || label.includes('gold')) {
        return TICKET_TONES[0];
    }
    if (label.includes('couple')) {
        return TICKET_TONES[5];
    }
    if (label.includes('regular') || label.includes('general') || label.includes('gate')) {
        return TICKET_TONES[1];
    }
    return TICKET_TONES[index % TICKET_TONES.length];
}

export default function EventTickets({ listing }) {
    if (listing?.categoryKey !== 'events') return null;

    const tickets = Array.isArray(listing.tickets) ? listing.tickets : [];
    const hasTickets = tickets.length > 0;
    const hasAny =
        hasTickets ||
        listing.ticketPrice ||
        listing.ticketUrl ||
        listing.ageLimit;
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
            {hasTickets ? (
                <ul className="space-y-2.5">
                    {tickets.map((ticket, index) => {
                        const tone = toneForTicket(ticket, index);
                        return (
                            <li
                                key={`${ticket.name}-${index}`}
                                className={`relative overflow-hidden rounded-xl ring-1 ${tone.row}`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`absolute inset-y-0 left-0 w-1.5 ${tone.accent}`}
                                />
                                <div className="flex items-center justify-between gap-3 py-3.5 pl-4 pr-4 sm:pl-5">
                                    <div className="min-w-0">
                                        <p
                                            className={`font-display text-[15px] font-semibold leading-snug ${tone.name}`}
                                        >
                                            {ticket.name || 'Ticket'}
                                        </p>
                                    </div>
                                    <p
                                        className={`shrink-0 font-display text-base font-bold tabular-nums ${tone.price}`}
                                    >
                                        {ticket.priceLabel || 'On request'}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
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
