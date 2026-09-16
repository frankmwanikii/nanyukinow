import { Link } from '@inertiajs/react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import DetailSection from './DetailSection';
import DirectionsMap from './DirectionsMap';
import HoursList from './HoursList';
import EventSchedule from './EventSchedule';
import AgentCard from './AgentCard';
import WaysToPay from './WaysToPay';

export default function ContactInfoPage({ listing }) {
    const tel = listing.phone
        ? `tel:${String(listing.phone).replace(/\s+/g, '')}`
        : null;

    return (
        <div className="mx-auto grid max-w-[1400px] gap-5 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.9fr)] lg:items-start lg:gap-6">
            <div className="flex flex-col gap-5">
                <DetailSection title="Contact info">
                    <div className="space-y-4">
                        <div>
                            <p className="font-display text-xl font-semibold text-earth-dusk">
                                {listing.title}
                            </p>
                            <p className="mt-1 text-sm text-olive-600">
                                {listing.tagline}
                                {listing.location ? ` · ${listing.location}` : ''}
                            </p>
                        </div>

                        {listing.address ? (
                            <p className="flex items-start gap-2 text-sm text-olive-800">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mustard" />
                                <span>{listing.address}</span>
                            </p>
                        ) : null}

                        <div className="flex flex-wrap gap-2.5 pt-1">
                            {tel ? (
                                <a
                                    href={tel}
                                    className="inline-flex items-center gap-2 rounded-full bg-mustard px-5 py-3 text-sm font-bold text-olive-950 transition hover:bg-olive-700 hover:text-white"
                                >
                                    <Phone className="h-4 w-4" />
                                    {listing.phone}
                                </a>
                            ) : null}
                            <Link
                                href="/explore"
                                className="inline-flex items-center gap-2 rounded-full bg-olive-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Direct message
                            </Link>
                            {listing.agent?.email ? (
                                <a
                                    href={`mailto:${listing.agent.email}`}
                                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-olive-800 ring-1 ring-olive-200 transition hover:bg-olive-50"
                                >
                                    <Mail className="h-4 w-4" />
                                    Email
                                </a>
                            ) : null}
                        </div>
                    </div>
                </DetailSection>

                <DirectionsMap listing={listing} />
            </div>

            <aside className="flex flex-col gap-5 lg:sticky lg:top-36">
                {listing.agent ? <AgentCard agent={listing.agent} /> : null}
                <HoursList
                    hours={listing.hours}
                    status={listing.hoursStatus}
                />
                <EventSchedule items={listing.eventSchedule} />
                <WaysToPay payments={listing.payments} />
            </aside>
        </div>
    );
}
