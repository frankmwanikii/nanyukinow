import AboutBlock from './AboutBlock';
import AgentCard from './AgentCard';
import AmenitiesGrid from './AmenitiesGrid';
import BulletList from './BulletList';
import ChipRow from './ChipRow';
import DetailSection from './DetailSection';
import DirectionsMap from './DirectionsMap';
import EventLineup from './EventLineup';
import EventSchedule from './EventSchedule';
import EventSponsors from './EventSponsors';
import EventTickets from './EventTickets';
import EventWhen from './EventWhen';
import EventWhere from './EventWhere';
import ChargesCard from './ChargesCard';
import FactStrip from './FactStrip';
import HoursList from './HoursList';
import MenuGallery from './MenuGallery';
import ReviewsTeaser from './ReviewsTeaser';
import VideoPreview from './VideoPreview';
import VisualTour from './VisualTour';
import WaysToPay from './WaysToPay';

/**
 * Map registry section keys → rendered components.
 * Missing data returns null from each section (layout collapses).
 */
export function renderListingSection(key, listing) {
    switch (key) {
        case 'visualTour':
            return (
                <VisualTour
                    key={key}
                    gallery={listing.gallery}
                    hideTabs={listing.categoryKey === 'events'}
                    title={
                        listing.categoryKey === 'thingsToDo' ||
                        listing.categoryKey === 'events'
                            ? 'Gallery'
                            : listing.categoryKey === 'stay' ||
                                listing.categoryKey === 'properties'
                              ? 'Rooms & spaces'
                              : 'Visual tour'
                    }
                />
            );
        case 'video':
            return <VideoPreview key={key} video={listing.video} />;
        case 'amenities':
            return (
                <AmenitiesGrid
                    key={key}
                    amenities={listing.amenities}
                    title={
                        listing.categoryKey === 'thingsToDo'
                            ? 'Facilities and amenities'
                            : listing.categoryKey === 'properties'
                              ? 'Features'
                              : 'Amenities'
                    }
                />
            );
        case 'facts': {
            const rawFacts = Array.isArray(listing.facts)
                ? listing.facts
                : [];
            const chargesFact =
                rawFacts.find((fact) => fact?.label === 'Charges') || null;
            const glanceFacts = rawFacts.filter(
                (fact) => fact?.label && fact.label !== 'Charges',
            );

            if (
                listing.priceRangeLabel &&
                !glanceFacts.some((fact) => fact.label === 'Price range')
            ) {
                glanceFacts.push({
                    label: 'Price range',
                    value: listing.priceRangeLabel,
                });
            }

            return (
                <div key={key} className="space-y-4">
                    <FactStrip
                        facts={glanceFacts}
                        layout={
                            listing.categoryKey === 'stay' ||
                            listing.categoryKey === 'properties'
                                ? 'lodging'
                                : 'glance'
                        }
                        title={
                            listing.categoryKey === 'events'
                                ? 'Event details'
                                : listing.categoryKey === 'properties'
                                  ? 'Property overview'
                                  : listing.categoryKey === 'stay'
                                    ? 'Good to know'
                                    : 'At a glance'
                        }
                    />
                    <ChargesCard fact={chargesFact} />
                </div>
            );
        }
        case 'houseRules': {
            const rules = listing.houseRules;
            if (typeof rules === 'string') {
                return (
                    <AboutBlock
                        key={key}
                        about={rules}
                        title="House rules"
                        sectionId={null}
                    />
                );
            }
            return (
                <BulletList
                    key={key}
                    title="House rules"
                    items={rules}
                />
            );
        }
        case 'included':
            return (
                <BulletList
                    key={key}
                    title={
                        listing.categoryKey === 'stay'
                            ? 'Activities'
                            : "What's included"
                    }
                    items={listing.included}
                />
            );
        case 'bring':
            return (
                <BulletList
                    key={key}
                    title="What to bring"
                    items={listing.bring}
                />
            );
        case 'offerings':
            return (
                <BulletList
                    key={key}
                    title="Services offered"
                    items={listing.offerings}
                />
            );
        case 'credentials':
            return (
                <BulletList
                    key={key}
                    title="Credentials"
                    items={listing.credentials}
                />
            );
        case 'portfolio': {
            const items = Array.isArray(listing.portfolio)
                ? listing.portfolio.filter((p) => p?.title || p?.url || p?.image)
                : [];
            if (!items.length) return null;
            return (
                <DetailSection key={key} title="Portfolio / past work">
                    <ul className="space-y-3">
                        {items.map((item, index) => (
                            <li
                                key={`portfolio-${index}`}
                                className="flex gap-3 rounded-2xl border border-olive-100 bg-olive-50/40 p-3 dark:border-olive-800 dark:bg-olive-950/40"
                            >
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt=""
                                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                                    />
                                ) : null}
                                <div className="min-w-0 flex-1">
                                    {item.title ? (
                                        <p className="font-display text-base font-semibold text-olive-950 dark:text-olive-50">
                                            {item.title}
                                        </p>
                                    ) : null}
                                    {item.description ? (
                                        <p className="mt-0.5 text-sm text-olive-700 dark:text-olive-300">
                                            {item.description}
                                        </p>
                                    ) : null}
                                    {item.url ? (
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1 inline-flex text-sm font-semibold text-olive-900 underline-offset-2 hover:underline dark:text-mustard"
                                        >
                                            View work
                                        </a>
                                    ) : null}
                                </div>
                            </li>
                        ))}
                    </ul>
                </DetailSection>
            );
        }
        case 'brands':
            return (
                <BulletList
                    key={key}
                    title="Brands & range"
                    items={listing.brands}
                />
            );
        case 'agenda':
            return (
                <EventLineup
                    key={key}
                    title="Line-up"
                    items={listing.agenda}
                />
            );
        case 'chips':
            return <ChipRow key={key} chips={listing.chips} />;
        case 'priceRange':
            // Shown inside At a glance (facts) to keep pricing summary with duration / difficulty.
            return null;
        case 'deals': {
            const deals = Array.isArray(listing.deals) ? listing.deals : [];
            if (!deals.length) return null;
            return (
                <DetailSection
                    key={key}
                    title={
                        listing.categoryKey === 'stay'
                            ? 'Seasonal offers'
                            : listing.categoryKey === 'shopping'
                              ? 'Current offers'
                              : listing.categoryKey === 'thingsToDo' ||
                                  listing.categoryKey === 'services'
                                ? 'Special offers'
                                : 'Deals & happy hour'
                    }
                >
                    <ul className="space-y-3">
                        {deals.map((deal, index) => (
                            <li
                                key={`deal-${index}`}
                                className="rounded-2xl border border-mustard/40 bg-mustard/10 px-4 py-3"
                            >
                                {deal.title ? (
                                    <p className="font-display text-base font-semibold text-olive-950 dark:text-olive-50">
                                        {deal.title}
                                    </p>
                                ) : null}
                                {deal.description ? (
                                    /<[a-z][\s\S]*>/i.test(
                                        String(deal.description),
                                    ) ? (
                                        <div
                                            className="nn-editor mt-1 text-sm text-olive-700 dark:text-olive-300"
                                            dangerouslySetInnerHTML={{
                                                __html: deal.description,
                                            }}
                                        />
                                    ) : (
                                        <p className="mt-1 text-sm text-olive-700 dark:text-olive-300">
                                            {deal.description}
                                        </p>
                                    )
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </DetailSection>
            );
        }
        case 'menus':
            return (
                <MenuGallery
                    key={key}
                    menus={listing.menus}
                    docs={listing.docs}
                    title="Menus"
                />
            );
        case 'docs':
            return (
                <MenuGallery
                    key={key}
                    menus={listing.menus}
                    docs={listing.docs}
                    title="Menus"
                />
            );
        case 'highlights':
            return (
                <BulletList
                    key={key}
                    title="What's nearby"
                    items={listing.highlights}
                />
            );
        case 'host':
            return (
                <AgentCard
                    key={key}
                    agent={listing.agent}
                    title={
                        listing.categoryKey === 'stay'
                            ? 'Meet your host'
                            : 'Contact agent'
                    }
                />
            );
        case 'eventWhen':
            return <EventWhen key={key} listing={listing} />;
        case 'eventWhere':
            return <EventWhere key={key} listing={listing} />;
        case 'eventTickets':
            return <EventTickets key={key} listing={listing} />;
        case 'sponsors':
            return (
                <EventSponsors key={key} sponsors={listing.sponsors} />
            );
        case 'reviews':
            return (
                <ReviewsTeaser
                    key={key}
                    rating={listing.rating}
                    reviewSummary={listing.reviewSummary}
                />
            );
        case 'about':
            return (
                <AboutBlock
                    key={key}
                    about={listing.about}
                    docs={
                        listing.categoryKey === 'eatDrink' ? undefined : listing.docs
                    }
                />
            );
        case 'map':
            return <DirectionsMap key={key} listing={listing} />;
        case 'hours':
            return (
                <HoursList
                    key={key}
                    hours={listing.hours}
                    status={listing.hoursStatus}
                    title={
                        listing.categoryKey === 'stay'
                            ? 'Reception hours'
                            : 'Working hours'
                    }
                />
            );
        case 'payments':
            return <WaysToPay key={key} payments={listing.payments} />;
        case 'agent':
            return <AgentCard key={key} agent={listing.agent} />;
        case 'eventSchedule':
            return (
                <EventSchedule
                    key={key}
                    items={listing.eventSchedule}
                    title={
                        listing.categoryKey === 'eatDrink'
                            ? 'Events & live music'
                            : 'Event schedule'
                    }
                />
            );
        default:
            return null;
    }
}
