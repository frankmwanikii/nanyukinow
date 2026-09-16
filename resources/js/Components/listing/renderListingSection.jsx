import AboutBlock from './AboutBlock';
import AgentCard from './AgentCard';
import AmenitiesGrid from './AmenitiesGrid';
import BulletList from './BulletList';
import ChipRow from './ChipRow';
import DirectionsMap from './DirectionsMap';
import EventLineup from './EventLineup';
import EventSchedule from './EventSchedule';
import EventSponsors from './EventSponsors';
import EventTickets from './EventTickets';
import EventWhen from './EventWhen';
import EventWhere from './EventWhere';
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
                            ? 'Facilities'
                            : listing.categoryKey === 'properties'
                              ? 'Features'
                              : 'Amenities'
                    }
                />
            );
        case 'facts':
            return (
                <FactStrip
                    key={key}
                    facts={listing.facts}
                    title={
                        listing.categoryKey === 'events'
                            ? 'Event details'
                            : listing.categoryKey === 'properties'
                              ? 'Property facts'
                              : listing.categoryKey === 'stay'
                                ? 'Stay facts'
                                : 'At a glance'
                    }
                />
            );
        case 'houseRules':
            return (
                <BulletList
                    key={key}
                    title="House rules"
                    items={listing.houseRules}
                />
            );
        case 'included':
            return (
                <BulletList
                    key={key}
                    title="What's included"
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
            return (
                <ChipRow
                    key={key}
                    chips={listing.chips}
                    priceRangeLabel={null}
                />
            );
        case 'priceRange':
            return listing.priceRangeLabel ? (
                <ChipRow
                    key={key}
                    chips={null}
                    priceRangeLabel={listing.priceRangeLabel}
                />
            ) : null;
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
                />
            );
        case 'payments':
            return <WaysToPay key={key} payments={listing.payments} />;
        case 'agent':
            return <AgentCard key={key} agent={listing.agent} />;
        case 'eventSchedule':
            return (
                <EventSchedule key={key} items={listing.eventSchedule} />
            );
        default:
            return null;
    }
}
