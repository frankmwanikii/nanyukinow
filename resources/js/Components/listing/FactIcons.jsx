/**
 * Listing "Good to know" icons — IconScout Unicons via shared path hub.
 * Each fact label maps to a distinct glyph (no shared fallbacks within a strip).
 */
import { UNICONS } from '@/Components/site/uniconsPaths';

function FactIcon({ name, className = 'h-6 w-6' }) {
    const html = UNICONS[name];
    if (!html) {
        return null;
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`shrink-0 ${className}`}
            aria-hidden="true"
            fill="currentColor"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

function icon(name) {
    return function NamedFactIcon({ className }) {
        return <FactIcon name={name} className={className} />;
    };
}

export const GuestsIcon = icon('users-alt');
export const RoomsIcon = icon('estate');
export const BedsIcon = icon('bed');
export const BathsIcon = icon('bath');
export const CheckInIcon = icon('signin');
export const CheckOutIcon = icon('signout');
export const PerNightIcon = icon('money-bill');
export const BoardIcon = icon('crockery');
export const CancellationIcon = icon('ban');
export const BookingIcon = icon('calendar-alt');
export const PriceRangeIcon = icon('tag');
export const ClockIcon = icon('clock');
export const CuisineIcon = icon('utensils');
export const ServiceIcon = icon('restaurant');
export const DietaryIcon = icon('glass-tea');
export const CapacityIcon = icon('users-alt');
export const AvgMealIcon = icon('receipt');
export const ReservationsIcon = icon('bell');
export const DressCodeIcon = icon('bag');
export const SpecialtyIcon = icon('shop');
export const BrandsIcon = icon('award');
export const DeliveryIcon = icon('truck');
export const ReturnsIcon = icon('redo');
export const WholesaleIcon = icon('store');
export const MadeToOrderIcon = icon('constructor');
export const OnlineStoreIcon = icon('shopping-bag');
export const CatalogIcon = icon('comment-alt-dots');
export const PriceListIcon = icon('file-alt');
export const DifficultyIcon = icon('dumbbell');
export const ChargesIcon = icon('invoice');
export const ServiceAreaIcon = icon('map-marker');
export const ResponseIcon = icon('history');
export const SizeIcon = icon('ruler');
export const FurnishingIcon = icon('home');
export const ParkingIcon = icon('parking-circle');
export const YearBuiltIcon = icon('building');
export const VirtualTourIcon = icon('video');
export const FloorPlanIcon = icon('grids');
export const VenueIcon = icon('scenery');
export const OrganiserIcon = icon('user');
export const DoorsOpenIcon = icon('enter');
export const InfoIcon = icon('info-circle');

const BY_LABEL = {
    guests: GuestsIcon,
    'group size': GuestsIcon,
    ages: GuestsIcon,
    age: GuestsIcon,
    'min age': GuestsIcon,
    'age limit': GuestsIcon,
    beds: BedsIcon,
    bedrooms: BedsIcon,
    rooms: RoomsIcon,
    units: RoomsIcon,
    'room types': RoomsIcon,
    baths: BathsIcon,
    'check-in': CheckInIcon,
    'check-out': CheckOutIcon,
    duration: ClockIcon,
    board: BoardIcon,
    'per night': PerNightIcon,
    from: PerNightIcon,
    price: PriceRangeIcon,
    'price range': PriceRangeIcon,
    rent: PriceRangeIcon,
    lease: PriceRangeIcon,
    'early bird': PriceRangeIcon,
    'gate ticket': PriceRangeIcon,
    cancellation: CancellationIcon,
    booking: BookingIcon,
    book: BookingIcon,
    enquire: BookingIcon,
    cuisine: CuisineIcon,
    service: ServiceIcon,
    dietary: DietaryIcon,
    capacity: CapacityIcon,
    'avg meal': AvgMealIcon,
    reservations: ReservationsIcon,
    'dress code': DressCodeIcon,
    specialty: SpecialtyIcon,
    brands: BrandsIcon,
    delivery: DeliveryIcon,
    returns: ReturnsIcon,
    'wholesale / retail': WholesaleIcon,
    'made to order': MadeToOrderIcon,
    'online store': OnlineStoreIcon,
    'whatsapp catalog': CatalogIcon,
    'price list': PriceListIcon,
    difficulty: DifficultyIcon,
    charges: ChargesIcon,
    'service area': ServiceAreaIcon,
    response: ResponseIcon,
    size: SizeIcon,
    furnishing: FurnishingIcon,
    parking: ParkingIcon,
    'year built': YearBuiltIcon,
    'virtual tour': VirtualTourIcon,
    'floor plan': FloorPlanIcon,
    venue: VenueIcon,
    organiser: OrganiserIcon,
    'doors open': DoorsOpenIcon,
};

export function iconForFactLabel(label) {
    const key = String(label || '')
        .trim()
        .toLowerCase();

    return BY_LABEL[key] || InfoIcon;
}
