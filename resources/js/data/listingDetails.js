/**
 * Rich detail payloads keyed by listing id.
 * Listings without an entry get a category-aware default via getListingDetail().
 */

const WEEKDAY_HOURS = [
    { day: 'Monday', open: '08:00', close: '22:00' },
    { day: 'Tuesday', open: '08:00', close: '22:00' },
    { day: 'Wednesday', open: '08:00', close: '22:00' },
    { day: 'Thursday', open: '08:00', close: '22:00' },
    { day: 'Friday', open: '08:00', close: '23:00' },
    { day: 'Saturday', open: '09:00', close: '23:00' },
    { day: 'Sunday', open: '09:00', close: '21:00' },
];

const PAY_DEFAULT = ['Cash', 'M-Pesa', 'Card'];

/** Multi-image spaces: each room/area has its own image set. */
const ROOM_GALLERY = [
    {
        label: 'Living room',
        kind: 'living',
        images: [
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80',
        ],
    },
    {
        label: 'Bedroom',
        kind: 'bedroom',
        images: [
            'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1400&q=80',
        ],
    },
    {
        label: 'Bathroom',
        kind: 'bathroom',
        images: [
            'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1400&q=80',
        ],
    },
    {
        label: 'Outdoor area',
        kind: 'outdoor',
        images: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80',
        ],
    },
    {
        label: 'Kitchen',
        kind: 'kitchen',
        images: [
            'https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80',
        ],
    },
];

/** Hotels: no private bathroom/kitchen aisles — use a general gallery instead. */
const HOTEL_GALLERY = [
    {
        label: 'General gallery',
        kind: 'general',
        images: [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=80',
        ],
    },
    {
        label: 'Living room',
        kind: 'living',
        images: [
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80',
        ],
    },
    {
        label: 'Bedroom',
        kind: 'bedroom',
        images: [
            'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1400&q=80',
        ],
    },
    {
        label: 'Outdoor area',
        kind: 'outdoor',
        images: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80',
        ],
    },
];

const HOTEL_SUBCATEGORIES = new Set([
    'Hotels',
    'Boutique Hotels',
    'Conference Hotels',
]);

function isHotelListing(listing) {
    return (
        listing?.categoryKey === 'stay' &&
        HOTEL_SUBCATEGORIES.has(listing.subcategory)
    );
}

const DINING_GALLERY = [
    {
        label: 'Dining room',
        kind: 'dining',
        images: [
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80',
        ],
    },
    {
        label: 'Outdoor seating',
        kind: 'outdoor',
        images: [
            'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1400&q=80',
        ],
    },
    {
        label: 'Bar',
        kind: 'bar',
        images: [
            'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80',
        ],
    },
    {
        label: 'Kitchen',
        kind: 'kitchen',
        images: [
            'https://images.unsplash.com/photo-1556910103-1c02745a30d2?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=1400&q=80',
        ],
    },
];

/**
 * Normalize gallery into spaces with multiple images.
 * Supports:
 * - { label, kind, images: [url|{src}] }
 * - legacy { src, label, kind }
 */
export function normalizeGallerySpaces(gallery = []) {
    if (!Array.isArray(gallery) || !gallery.length) return [];

    const spaces = [];
    const indexByKey = new Map();

    for (const entry of gallery) {
        if (!entry) continue;

        if (Array.isArray(entry.images) && entry.images.length) {
            const images = entry.images
                .map((img) => (typeof img === 'string' ? img : img?.src))
                .filter(Boolean);
            if (!images.length) continue;
            spaces.push({
                label: entry.label || 'Gallery',
                kind: entry.kind || entry.label || 'space',
                images,
                cover: images[0],
            });
            continue;
        }

        if (!entry.src) continue;
        const key = entry.kind || entry.label || entry.src;
        if (indexByKey.has(key)) {
            spaces[indexByKey.get(key)].images.push(entry.src);
            continue;
        }
        indexByKey.set(key, spaces.length);
        spaces.push({
            label: entry.label || 'Gallery',
            kind: entry.kind || entry.label || 'space',
            images: [entry.src],
            cover: entry.src,
        });
    }

    return spaces;
}

/** Explicit rich details for hero examples per category. */
export const listingDetailsById = {
    // Stay — Sportsman Arms Hotel
    1: {
        about:
            'A Nanyuki classic on the edge of town — garden rooms, a busy restaurant terrace, and easy access to Mount Kenya adventures. Ideal for stopovers, family weekends, and conference groups that still want highland air.',
        address: 'Nanyuki–Meru Highway, Nanyuki',
        gallery: HOTEL_GALLERY,
        amenities: [
            'wifi',
            'parking',
            'pool',
            'restaurant',
            'workspace',
            'family',
            'fireplace',
            'laundry',
        ],
        facts: [
            { label: 'Guests', value: '2–4' },
            { label: 'Bedrooms', value: '2' },
            { label: 'Baths', value: '2' },
            { label: 'Check-in', value: '14:00' },
            { label: 'Check-out', value: '10:00' },
        ],
        houseRules: [
            'Quiet hours after 22:00',
            'No smoking indoors',
            'Pets by prior arrangement',
            'ID required at check-in',
        ],
        hours: WEEKDAY_HOURS,
        hoursStatus: 'open',
        payments: ['Cash', 'M-Pesa', 'Card', 'Paybill'],
        chips: {
            region: 'Nanyuki Town',
            categories: ['Stay', 'Hotels', 'Conference'],
            tags: ['Garden rooms', 'Restaurant on-site'],
        },
        reviewSummary: { count: 128, highlight: 'Friendly staff and reliable hotspot Wi‑Fi.' },
        relatedIds: [4, 'e1', 'e2'],
    },

    // Eat & Drink — Trout Tree Restaurant
    2: {
        about:
            'Treehouse dining above a trout farm — fresh fish, highland views, and a menu that rewards a slow lunch. Book ahead on weekends; the walkways fill fast when the weather is clear.',
        address: 'Timau Road, near Nanyuki',
        gallery: DINING_GALLERY,
        video: {
            poster: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
            src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            title: 'A look at the deck',
        },
        amenities: [
            'wifi',
            'outdoor',
            'family',
            'parking',
            'alcohol',
            'ac',
            'cards',
            'wheelchair',
        ],
        priceRangeLabel: 'Pricey',
        menus: [
            {
                title: 'Lunch menu',
                image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
            },
            {
                title: 'Drinks list',
                image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80',
            },
            {
                title: 'Dessert board',
                image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
            },
        ],
        hours: WEEKDAY_HOURS.map((h) =>
            h.day === 'Monday' ? { ...h, open: 'Closed', close: '' } : h,
        ),
        hoursStatus: 'closed',
        payments: ['Cash', 'M-Pesa', 'Card'],
        chips: {
            region: 'Timau Area',
            categories: ['Eat & Drink', 'Garden Restaurant', 'Seafood'],
            tags: ['Trout', 'Outdoor dining'],
        },
        reviewSummary: { count: 214, highlight: 'Unforgettable setting — come hungry.' },
        relatedIds: [5, 't2', 'rn1'],
    },

    // Eat & Drink — Root North Farmshop & Cafe
    rn1: {
        about:
            'Root North Farmshop & Café in Timau is a charming countryside stop nestled along the slopes of Mount Kenya. It blends a farm-to-table concept with a relaxed café experience, offering fresh, locally inspired meals, baked goods, and quality coffee in a serene open-air setting.\n\nSurrounded by expansive farmland and cool highland air, it’s a peaceful retreat for travellers and locals passing through the Nanyuki–Timau corridor, ideal for slow breakfasts, casual lunches, or a quiet coffee break with scenic views.',
        address: 'Timau Road, Mount Kenya slopes',
        gallery: [
            {
                label: 'Café & terrace',
                kind: 'dining',
                images: [
                    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80',
                ],
            },
            {
                label: 'Farm shop',
                kind: 'shop',
                images: [
                    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80',
                ],
            },
        ],
        video: {
            poster:
                'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
            src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            title: 'A morning at Root North',
        },
        amenities: [
            'wifi',
            'outdoor',
            'parking',
            'family',
            'garden',
            'cards',
        ],
        priceRangeLabel: 'Moderate',
        menus: [
            {
                title: 'Drinks & food menu',
                image: '/images/menus/root-north-menu-drinks-food.webp',
            },
            {
                title: 'Pudding menu',
                image: '/images/menus/root-north-menu-pudding.webp',
            },
        ],
        hours: [
            { day: 'Monday', open: '08:00', close: '17:00' },
            { day: 'Tuesday', open: '08:00', close: '17:00' },
            { day: 'Wednesday', open: '08:00', close: '17:00' },
            { day: 'Thursday', open: '08:00', close: '17:00' },
            { day: 'Friday', open: '08:00', close: '17:00' },
            { day: 'Saturday', open: '08:00', close: '17:00' },
            { day: 'Sunday', open: '08:00', close: '17:00' },
        ],
        hoursStatus: 'open',
        payments: ['Cash', 'M-Pesa', 'Card'],
        email: 'hello@rootnorth.co.ke',
        socials: {
            instagram: 'https://instagram.com/',
            facebook: 'https://facebook.com/',
            whatsapp: 'https://wa.me/254703564727',
        },
        chips: {
            region: 'Timau Area',
            categories: ['Eat & Drink', 'Cafes', 'Farmshop'],
            tags: ['Farm-to-table', 'Coffee', 'Mount Kenya views'],
        },
        reviewSummary: {
            count: 64,
            highlight: 'Peaceful highland café — perfect coffee stop on the Timau road.',
        },
        relatedIds: ['t2', 2, 'e3'],
    },

    // Things to do — Mt Kenya Wildlife Conservancy
    3: {
        about:
            'Guided wildlife encounters at the foot of Mount Kenya — orphaned animals, conservation stories, and walking trails that make the highland landscape feel close.',
        address: 'Mount Kenya Wildlife Conservancy, Nanyuki',
        gallery: [
            {
                label: 'Gallery',
                kind: 'gallery',
                images: [
                    'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1456926638090-c60cd07ea953?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1474044159687-1ee9f38a6762?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1400&q=80',
                ],
            },
        ],
        video: {
            poster: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
            src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            title: 'Conservancy preview',
        },
        facts: [
            { label: 'Duration', value: '2–3 hrs' },
            { label: 'Group size', value: 'Up to 12' },
            { label: 'Difficulty', value: 'Easy' },
            { label: 'Ages', value: 'All ages' },
        ],
        included: [
            'Guided walk',
            'Entry to viewing areas',
            'Conservation briefing',
        ],
        bring: ['Closed shoes', 'Sun hat', 'Water bottle', 'Binoculars (optional)'],
        amenities: ['parking', 'family', 'wheelchair', 'wifi'],
        hours: WEEKDAY_HOURS.map((h) => ({ ...h, open: '09:00', close: '17:00' })),
        hoursStatus: 'open',
        payments: ['Cash', 'M-Pesa', 'Card'],
        chips: {
            region: 'Naromoru / Mt Kenya',
            categories: ['Things to do', 'Wildlife & Nature'],
            tags: ['Family friendly', 'Guided'],
        },
        reviewSummary: { count: 96, highlight: 'Meaningful, well-run conservation visit.' },
        relatedIds: ['t1', 6, 'a1'],
    },

    // Services — Laikipia Trails Guides
    e7: {
        about:
            'Local mountain and conservancy guides for day hikes, multi-day treks, and private safari logistics around Nanyuki and Laikipia.',
        address: 'Nanyuki Town centre',
        gallery: [
            {
                label: 'On trail',
                kind: 'outdoor',
                images: [
                    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
                ],
            },
            {
                label: 'Team',
                kind: 'team',
                images: [
                    'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80',
                ],
            },
            {
                label: 'Briefing',
                kind: 'workspace',
                images: [
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1400&q=80',
                ],
            },
        ],
        video: {
            poster: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
            src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            title: 'Meet the guides',
        },
        offerings: [
            'Day hikes on Sirimon & Naromoru',
            'Private conservancy drives',
            'Airport transfers & logistics',
            'Custom multi-day itineraries',
        ],
        facts: [
            { label: 'Service area', value: 'Nanyuki · Timau · Laikipia' },
            { label: 'Response', value: 'Usually same day' },
            { label: 'From', value: 'KES 4,500 / day' },
        ],
        credentials: [
            'KWS-registered guides',
            'First-aid certified',
            'English & Kiswahili',
        ],
        hours: WEEKDAY_HOURS,
        hoursStatus: 'open',
        payments: ['Cash', 'M-Pesa', 'Paybill'],
        chips: {
            region: 'Nanyuki',
            categories: ['Services', 'Tours & Guides'],
            tags: ['Private', 'Custom trips'],
        },
        reviewSummary: { count: 54, highlight: 'Patient guides who know the mountain weather.' },
        relatedIds: ['e8', 'e9', 6],
    },

    // Shopping — Cleanshelf Supermarket
    e11: {
        about:
            'Everyday groceries, fresh produce, and household essentials — a reliable town stop between safari days and self-catering stays.',
        address: 'Timau Road, Nanyuki area',
        gallery: [
            {
                label: 'Aisles',
                kind: 'store',
                images: [
                    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1400&q=80',
                ],
            },
            {
                label: 'Produce',
                kind: 'produce',
                images: [
                    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1488459716781-31a44007a7d5?auto=format&fit=crop&w=1400&q=80',
                ],
            },
            {
                label: 'Checkout',
                kind: 'checkout',
                images: [
                    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1400&q=80',
                ],
            },
        ],
        video: {
            poster: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
            src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            title: 'Inside the store',
        },
        amenities: ['parking', 'wifi', 'cards', 'wheelchair', 'family'],
        brands: ['Brookside', 'Dawa', 'Local farm produce', 'Household brands'],
        hours: WEEKDAY_HOURS.map((h) => ({ ...h, open: '07:30', close: '21:00' })),
        hoursStatus: 'open',
        payments: ['Cash', 'M-Pesa', 'Card'],
        chips: {
            region: 'Timau Area',
            categories: ['Shopping', 'Supermarkets'],
            tags: ['Groceries', 'Self-catering'],
        },
        reviewSummary: { count: 41, highlight: 'Well stocked for Airbnb stays.' },
        relatedIds: ['e11b', 'e11d', 'e12', 'e13'],
    },

    e11b: {
        about:
            'TVs, audio, computing accessories, and everyday electronics for homes and offices around Nanyuki.',
        address: 'Kenya Road, Nanyuki town',
        amenities: ['parking', 'wifi', 'cards'],
        brands: ['Samsung', 'Sony', 'Generic accessories'],
        hours: WEEKDAY_HOURS.map((h) => ({ ...h, open: '08:30', close: '18:30' })),
        hoursStatus: 'open',
        payments: ['Cash', 'M-Pesa', 'Card'],
        chips: {
            region: 'Nanyuki Area',
            categories: ['Shopping', 'Electronics'],
            tags: ['TVs', 'Audio', 'Computing'],
        },
        reviewSummary: { count: 28, highlight: 'Helpful with warranties and setup.' },
        relatedIds: ['e11c', 'e11', 'e13'],
    },

    e11c: {
        about:
            'Phones, cases, chargers, and pocket gadgets — a quick stop for travellers who need a cable or screen protector.',
        address: 'Lumumba Road, Nanyuki',
        amenities: ['wifi', 'cards'],
        brands: ['Samsung', 'Tecno', 'Infinix', 'Accessories'],
        hours: WEEKDAY_HOURS.map((h) => ({ ...h, open: '08:00', close: '19:00' })),
        hoursStatus: 'open',
        payments: ['Cash', 'M-Pesa', 'Card'],
        chips: {
            region: 'Nanyuki Area',
            categories: ['Shopping', 'Mobile Phones & Gadgets'],
            tags: ['Phones', 'Chargers', 'Cases'],
        },
        reviewSummary: { count: 33, highlight: 'Fast swaps for chargers and glass.' },
        relatedIds: ['e11b', 'e11', 'e13'],
    },

    // Properties — Cedar Grove Estate
    e14: {
        about:
            'A highland home with wide views, mature gardens, and room to host — listed for sale with flexible viewing by appointment.',
        address: 'Cedar Grove, Timau foothills',
        gallery: ROOM_GALLERY,
        video: {
            poster: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
            src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            title: 'Property walkthrough',
        },
        facts: [
            { label: 'Bedrooms', value: '4' },
            { label: 'Baths', value: '3' },
            { label: 'Size', value: '320 m²' },
            { label: 'Price', value: 'On request' },
        ],
        amenities: [
            'parking',
            'wifi',
            'fireplace',
            'outdoor',
            'security',
            'garden',
        ],
        highlights: [
            'Mount Kenya views from the upper terrace',
            '10 minutes to Timau town & shops',
            'Quiet cul-de-sac with gated access',
            'Mature garden and outdoor entertaining space',
            'Title deed ready for transfer',
        ],
        agent: {
            name: 'Highland Homes Agency',
            phone: '+254 722 445 668',
            email: 'viewings@highlandhomes.ke',
            note: 'Viewings by appointment, 7 days a week.',
        },
        payments: ['Bank transfer', 'M-Pesa (deposit)'],
        chips: {
            region: 'Timau Area',
            categories: ['Properties', 'Mansion', 'For Sale'],
            tags: ['Garden', 'Mountain view'],
        },
        reviewSummary: { count: 12, highlight: 'Transparent viewings and clear paperwork.' },
        relatedIds: ['e14b', 'e14c', 'e15'],
    },

    e14b: {
        about:
            'A modern villa with open living spaces, private garden, and easy access to town — ideal as a family home or highland retreat.',
        address: 'Simba Ridge, Nanyuki outskirts',
        facts: [
            { label: 'Bedrooms', value: '5' },
            { label: 'Baths', value: '4' },
            { label: 'Size', value: '410 m²' },
            { label: 'Price', value: 'On request' },
        ],
        amenities: ['parking', 'wifi', 'security', 'garden', 'outdoor'],
        highlights: [
            'Open-plan living with private garden',
            'Short drive into Nanyuki CBD',
            'Secure estate with parking',
            'Ideal family home or highland retreat',
        ],
        agent: {
            name: 'Highland Homes Agency',
            phone: '+254 722 445 668',
            email: 'viewings@highlandhomes.ke',
            note: 'Private viewings available weekends.',
        },
        chips: {
            region: 'Nanyuki Area',
            categories: ['Properties', 'Villa', 'For Sale'],
            tags: ['Garden', 'Family home'],
        },
        reviewSummary: { count: 9, highlight: 'Spacious and well finished.' },
        relatedIds: ['e14', 'e14c', 'e15c'],
    },

    e14c: {
        about:
            'Single-level bungalow on a quiet Timau plot — bright rooms, mature trees, and straightforward living for a small family.',
        address: 'Greenfields Estate, Timau',
        facts: [
            { label: 'Bedrooms', value: '3' },
            { label: 'Baths', value: '2' },
            { label: 'Size', value: '180 m²' },
            { label: 'Price', value: 'On request' },
        ],
        amenities: ['parking', 'security', 'garden'],
        highlights: [
            'Single-level living — no stairs',
            'Quiet Timau neighbourhood',
            'Mature trees and garden space',
            'Ready to move with clear utilities',
        ],
        agent: {
            name: 'Highland Homes Agency',
            phone: '+254 722 445 668',
            email: 'viewings@highlandhomes.ke',
            note: 'Ask about title and utilities.',
        },
        chips: {
            region: 'Timau Area',
            categories: ['Properties', 'Bungalow', 'For Sale'],
            tags: ['Quiet', 'Ready to move'],
        },
        reviewSummary: { count: 7, highlight: 'Easy single-level living.' },
        relatedIds: ['e14', 'e14b', 'e15'],
    },

    e15: {
        about:
            'Bright apartment near town amenities — balcony views, secure parking, and flexible lease terms for working travellers.',
        address: 'Townview Court, Naromoru',
        facts: [
            { label: 'Bedrooms', value: '2' },
            { label: 'Baths', value: '1' },
            { label: 'Size', value: '85 m²' },
            { label: 'Rent', value: 'On request' },
        ],
        amenities: ['parking', 'wifi', 'security'],
        agent: {
            name: 'Townview Lettings',
            phone: '+254 711 220 441',
            email: 'lets@townview.ke',
            note: 'Available for immediate occupancy.',
        },
        chips: {
            region: 'Naromoru Area',
            categories: ['Properties', 'Apartment', 'For Rent'],
            tags: ['Furnished options', 'Town access'],
        },
        reviewSummary: { count: 18, highlight: 'Clean flat, responsive landlord.' },
        relatedIds: ['e15b', 'e15c', 'e14'],
    },

    e15b: {
        about:
            'Compact bedsitter on Market Road — affordable, secure, and walking distance to shops and matatus.',
        address: 'Market Road, Nanyuki',
        facts: [
            { label: 'Bedrooms', value: 'Bedsitter' },
            { label: 'Baths', value: '1' },
            { label: 'Size', value: '28 m²' },
            { label: 'Rent', value: 'On request' },
        ],
        amenities: ['wifi', 'security'],
        agent: {
            name: 'Townview Lettings',
            phone: '+254 711 220 441',
            email: 'lets@townview.ke',
            note: 'Deposit + first month required.',
        },
        chips: {
            region: 'Nanyuki Area',
            categories: ['Properties', 'Bedsitter', 'For Rent'],
            tags: ['Budget', 'Town centre'],
        },
        reviewSummary: { count: 14, highlight: 'Good value for singles.' },
        relatedIds: ['e15', 'e15c', 'e16'],
    },

    e15c: {
        about:
            'Two-level maisonette with private entrance and small yard — suited to families who want space without leaving town.',
        address: 'Hillside Lane, Nanyuki',
        facts: [
            { label: 'Bedrooms', value: '3' },
            { label: 'Baths', value: '2.5' },
            { label: 'Size', value: '160 m²' },
            { label: 'Rent', value: 'On request' },
        ],
        amenities: ['parking', 'wifi', 'security', 'garden'],
        agent: {
            name: 'Highland Homes Agency',
            phone: '+254 722 445 668',
            email: 'viewings@highlandhomes.ke',
            note: 'Long-term leases preferred.',
        },
        chips: {
            region: 'Nanyuki Area',
            categories: ['Properties', 'Maisonette', 'For Rent'],
            tags: ['Family', 'Private yard'],
        },
        reviewSummary: { count: 11, highlight: 'Feels like a house, not a flat.' },
        relatedIds: ['e15', 'e14b', 'e14'],
    },

    e16: {
        about:
            'Clear-span warehouse bay with yard access — suited to storage, light logistics, or workshop use on a renewable lease.',
        address: 'Industrial spur, Nanyuki',
        facts: [
            { label: 'Units', value: '1 bay' },
            { label: 'Size', value: '450 m²' },
            { label: 'Yard', value: 'Yes' },
            { label: 'Lease', value: 'On request' },
        ],
        amenities: ['parking', 'security'],
        agent: {
            name: 'North Commercial Desk',
            phone: '+254 700 118 902',
            email: 'lease@northcommercial.ke',
            note: 'Site visit with prior notice.',
        },
        chips: {
            region: 'Nanyuki Area',
            categories: ['Properties', 'Warehouse', 'For Lease'],
            tags: ['Logistics', 'Yard access'],
        },
        reviewSummary: { count: 6, highlight: 'Practical bay with easy truck turn.' },
        relatedIds: ['e14', 'e15', 'e15b'],
    },

    // Events — Nanyuki Jazz Night
    e17: {
        about:
            'An evening of live jazz under highland skies — local ensembles, soft lighting, and a crowd that shows up for the music.',
        address: 'Town Terrace, Nanyuki CBD',
        venue: 'Town Terrace',
        organiser: 'Nanyuki Now Live',
        startDate: '2026-09-28T19:30:00+03:00',
        endDate: '2026-09-28T22:15:00+03:00',
        ticketPrice: 'From KES 1,200',
        earlyBirdPrice: 'KES 1,200',
        gatePrice: 'KES 1,500',
        ticketUrl: 'https://pay.nanyukinow.co.ke/tickets/nanyuki-jazz-night',
        ageLimit: '18+',
        eventPoster:
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
        amenities: [
            'parking',
            'wifi',
            'alcohol',
            'cards',
            'wheelchair',
            'security',
            'outdoor',
        ],
        sponsors: [
            {
                name: 'Safaricom',
                logo: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=200&q=80',
            },
            {
                name: 'Tusker',
                logo: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=200&q=80',
            },
            {
                name: 'Nanyuki Club',
                logo: 'https://images.unsplash.com/photo-1560179707-f14f90ef2aca?auto=format&fit=crop&w=200&q=80',
            },
            {
                name: 'Mount Kenya Radio',
                logo: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=200&q=80',
            },
        ],
        gallery: [
            {
                label: 'Stage',
                kind: 'stage',
                images: [
                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1400&q=80',
                ],
            },
            {
                label: 'Crowd',
                kind: 'crowd',
                images: [
                    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1400&q=80',
                ],
            },
            {
                label: 'Atmosphere',
                kind: 'venue',
                images: [
                    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1400&q=80',
                    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80',
                ],
            },
        ],
        video: {
            poster: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
            src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            title: 'Last season highlights',
        },
        facts: [
            { label: 'Starts', value: 'Sat 28 Sep, 7:30 pm' },
            { label: 'Ends', value: 'Sat 28 Sep, 10:15 pm' },
            { label: 'Venue', value: 'Town Terrace' },
            { label: 'Location', value: 'Nanyuki' },
            { label: 'Age', value: '18+' },
            { label: 'Early bird', value: 'KES 1,200' },
            { label: 'Gate ticket', value: 'KES 1,500' },
        ],
        agenda: [
            { time: '18:30', title: 'Doors & welcome drink' },
            { time: '19:30', title: 'Opening set' },
            { time: '20:45', title: 'Headliner' },
            { time: '22:15', title: 'Close' },
        ],
        eventSchedule: [
            { label: 'Doors open', value: '18:30' },
            { label: 'Music', value: '19:30 – 22:15' },
            { label: 'Last entry', value: '21:00' },
        ],
        payments: ['M-Pesa', 'Card', 'Cash at door'],
        chips: {
            region: 'Nanyuki Town',
            categories: ['Events', 'Music & Entertainment'],
            tags: ['Live music', 'Evening'],
        },
        reviewSummary: { count: 67, highlight: 'Intimate sound and a great local crowd.' },
        relatedIds: ['e18', 'e19', 'e20'],
    },

    e18: {
        about:
            'A weekend fair celebrating highland harvest — produce stalls, kids’ games, live folk sets, and picnic lawns for the whole family.',
        address: 'Naromoru Community Grounds',
        venue: 'Naromoru Community Grounds',
        organiser: 'Naromoru Farmers Collective',
        startDate: '2026-10-11T09:00:00+03:00',
        endDate: '2026-10-12T17:00:00+03:00',
        ticketPrice: 'Free entry',
        earlyBirdPrice: 'Free',
        gatePrice: 'Free',
        ticketUrl: 'https://pay.nanyukinow.co.ke/tickets/community-harvest-fair',
        ageLimit: 'All ages',
        eventPoster:
            'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80',
        amenities: [
            'parking',
            'family',
            'outdoor',
            'garden',
            'wheelchair',
            'cards',
        ],
        sponsors: [
            {
                name: 'Brookside',
                logo: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=200&q=80',
            },
            {
                name: 'County Tourism',
                logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80',
            },
            {
                name: 'Farmers Co-op',
                logo: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=200&q=80',
            },
        ],
        facts: [
            { label: 'Starts', value: 'Sat 11 Oct, 9:00 am' },
            { label: 'Ends', value: 'Sun 12 Oct, 5:00 pm' },
            { label: 'Venue', value: 'Community Grounds' },
            { label: 'Location', value: 'Naromoru' },
            { label: 'Age', value: 'All ages' },
            { label: 'Early bird', value: 'Free' },
            { label: 'Gate ticket', value: 'Free' },
        ],
        agenda: [
            { time: '09:00', title: 'Gates open & market stalls' },
            { time: '11:00', title: 'Kids zone & games' },
            { time: '14:00', title: 'Folk music set' },
            { time: '16:30', title: 'Prize draw' },
        ],
        eventSchedule: [
            { label: 'Day 1', value: 'Sat 09:00 – 17:00' },
            { label: 'Day 2', value: 'Sun 09:00 – 17:00' },
            { label: 'Parking', value: 'On-site, free' },
        ],
        payments: ['Cash', 'M-Pesa (vendors)'],
        chips: {
            region: 'Naromoru',
            categories: ['Events', 'Family & Kids'],
            tags: ['Weekend', 'Free'],
        },
        reviewSummary: { count: 41, highlight: 'Great for families — lots to do.' },
        relatedIds: ['e17', 'e19', 'e20'],
    },

    e19: {
        about:
            'A charity 10K through conservancy trails raising funds for wildlife protection — finish-line music, medals, and a community brunch.',
        address: 'Ol Pejeta Conservancy Gate, Nanyuki',
        venue: 'Ol Pejeta Conservancy Gate',
        organiser: 'Laikipia Wildlife Trust',
        startDate: '2026-11-08T06:30:00+03:00',
        endDate: '2026-11-08T12:00:00+03:00',
        ticketPrice: 'From KES 2,000',
        earlyBirdPrice: 'KES 2,000',
        gatePrice: 'KES 2,500',
        ticketUrl: 'https://pay.nanyukinow.co.ke/tickets/conservancy-charity-run',
        ageLimit: '16+',
        eventPoster:
            'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=900&q=80',
        amenities: [
            'parking',
            'family',
            'outdoor',
            'wheelchair',
            'security',
            'cards',
        ],
        sponsors: [
            {
                name: 'Ol Pejeta',
                logo: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=200&q=80',
            },
            {
                name: 'Sportpesa',
                logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=200&q=80',
            },
            {
                name: 'Equity Bank',
                logo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=200&q=80',
            },
            {
                name: 'Water Bottle Co.',
                logo: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=200&q=80',
            },
        ],
        facts: [
            { label: 'Starts', value: 'Sun 8 Nov, 6:30 am' },
            { label: 'Ends', value: 'Sun 8 Nov, 12:00 pm' },
            { label: 'Venue', value: 'Ol Pejeta Gate' },
            { label: 'Location', value: 'Nanyuki' },
            { label: 'Age', value: '16+' },
            { label: 'Early bird', value: 'KES 2,000' },
            { label: 'Gate ticket', value: 'KES 2,500' },
        ],
        agenda: [
            { time: '05:45', title: 'Registration & warm-up' },
            { time: '06:30', title: 'Race start' },
            { time: '09:30', title: 'Medal ceremony' },
            { time: '10:00', title: 'Community brunch' },
        ],
        eventSchedule: [
            { label: 'Check-in', value: '05:45 – 06:20' },
            { label: 'Race', value: '06:30 – 09:00' },
            { label: 'Brunch', value: '10:00 – 12:00' },
        ],
        payments: ['M-Pesa', 'Card'],
        chips: {
            region: 'Nanyuki',
            categories: ['Events', 'Wildlife & Conservation'],
            tags: ['Charity', 'Outdoors'],
        },
        reviewSummary: { count: 112, highlight: 'Well organised and for a great cause.' },
        relatedIds: ['e17', 'e18', 'e20'],
    },

    e20: {
        about:
            'An after-work mixer for highland founders, hoteliers, and creatives — short intros, open networking, and light bites.',
        address: 'Timau Club Lounge',
        venue: 'Timau Club Lounge',
        organiser: 'Laikipia Business Circle',
        startDate: '2026-10-02T17:00:00+03:00',
        endDate: '2026-10-02T20:00:00+03:00',
        ticketPrice: 'From KES 600',
        earlyBirdPrice: 'KES 600',
        gatePrice: 'KES 800',
        ticketUrl: 'https://pay.nanyukinow.co.ke/tickets/business-networking-mixer',
        ageLimit: '21+',
        eventPoster:
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
        amenities: [
            'parking',
            'wifi',
            'alcohol',
            'cards',
            'workspace',
            'security',
        ],
        sponsors: [
            {
                name: 'KCB',
                logo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9301b?auto=format&fit=crop&w=200&q=80',
            },
            {
                name: 'Safaricom Business',
                logo: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=200&q=80',
            },
            {
                name: 'Timau Club',
                logo: 'https://images.unsplash.com/photo-1560179707-f14f90ef2aca?auto=format&fit=crop&w=200&q=80',
            },
        ],
        facts: [
            { label: 'Starts', value: 'Fri 2 Oct, 5:00 pm' },
            { label: 'Ends', value: 'Fri 2 Oct, 8:00 pm' },
            { label: 'Venue', value: 'Timau Club Lounge' },
            { label: 'Location', value: 'Timau' },
            { label: 'Age', value: '21+' },
            { label: 'Early bird', value: 'KES 600' },
            { label: 'Gate ticket', value: 'KES 800' },
        ],
        agenda: [
            { time: '17:00', title: 'Check-in & drinks' },
            { time: '17:30', title: 'Welcome & lightning intros' },
            { time: '18:15', title: 'Open networking' },
            { time: '19:45', title: 'Wrap & photo moment' },
        ],
        eventSchedule: [
            { label: 'Doors', value: '17:00' },
            { label: 'Programme', value: '17:30 – 19:45' },
            { label: 'Dress code', value: 'Smart casual' },
        ],
        payments: ['M-Pesa', 'Card'],
        chips: {
            region: 'Timau',
            categories: ['Events', 'Business & Networking'],
            tags: ['After-work', 'Networking'],
        },
        reviewSummary: { count: 28, highlight: 'Useful connections without the stiff vibe.' },
        relatedIds: ['e17', 'e18', 'e19'],
    },
};

const ACTIVITY_GALLERY = [
    {
        label: 'Gallery',
        kind: 'gallery',
        images: [
            'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1456926638090-c60cd07ea953?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1474044159687-1ee9f38a6762?auto=format&fit=crop&w=1400&q=80',
        ],
    },
];

const SERVICE_GALLERY = [
    {
        label: 'On the job',
        kind: 'work',
        images: [
            'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
        ],
    },
    {
        label: 'Team',
        kind: 'team',
        images: [
            'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80',
        ],
    },
    {
        label: 'Workspace',
        kind: 'workspace',
        images: [
            'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1400&q=80',
        ],
    },
];

const SHOP_GALLERY = [
    {
        label: 'Storefront',
        kind: 'store',
        images: [
            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1400&q=80',
        ],
    },
    {
        label: 'Products',
        kind: 'products',
        images: [
            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1488459716781-31a44007a7d5?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=1400&q=80',
        ],
    },
    {
        label: 'Details',
        kind: 'details',
        images: [
            'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1400&q=80',
        ],
    },
];

const EVENT_GALLERY = [
    {
        label: 'Stage',
        kind: 'stage',
        images: [
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80',
        ],
    },
    {
        label: 'Crowd',
        kind: 'crowd',
        images: [
            'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80',
        ],
    },
    {
        label: 'Atmosphere',
        kind: 'venue',
        images: [
            'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1400&q=80',
            'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1400&q=80',
        ],
    },
];

/**
 * Product catalogues keyed by shopping subcategory.
 * Keeps bakery items in supermarkets — never in electronics, etc.
 */
const PRODUCTS_BY_SHOPPING_SUBCATEGORY = {
    Supermarkets: [
        {
            name: 'Fresh farm eggs (tray)',
            category: 'Produce',
            price: 450,
            description: 'Local highland eggs — tray of 30.',
            image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Brookside fresh milk 500ml',
            category: 'Dairy',
            price: 75,
            description: 'Chilled daily delivery.',
            image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Cooking oil 2L',
            category: 'Pantry',
            price: 620,
            description: 'Vegetable cooking oil.',
            image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Soft white loaf',
            category: 'Bread',
            price: 80,
            description: 'Fresh bakery aisle loaf.',
            image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Rice 2kg',
            category: 'Pantry',
            price: 380,
            description: 'Premium long grain.',
            image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Household detergent 1L',
            category: 'Household',
            price: 320,
            description: 'Everyday cleaning essential.',
            image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Seasonal fruit pack',
            category: 'Produce',
            price: 500,
            description: 'Mixed highland fruit — changes with season.',
            image: 'https://images.unsplash.com/photo-1619566636858-adf3ef4644af?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Bottled water 6-pack',
            category: 'Beverages',
            price: 240,
            description: 'Still drinking water.',
            image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Wheat flour 2kg',
            category: 'Pantry',
            price: 210,
            description: 'All-purpose baking flour.',
            image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Yoghurt 500ml',
            category: 'Dairy',
            price: 120,
            description: 'Plain or flavoured — fridge section.',
            image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Tomatoes 1kg',
            category: 'Produce',
            price: 150,
            description: 'Fresh local tomatoes.',
            image: 'https://images.unsplash.com/photo-1546470427-e212b7d31075?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Instant coffee 100g',
            category: 'Beverages',
            price: 450,
            description: 'Everyday jar — popular brands in stock.',
            image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Toilet soap bar (3-pack)',
            category: 'Household',
            price: 180,
            description: 'Gentle cleansing bars.',
            image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9e2ec?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Sugar 1kg',
            category: 'Pantry',
            price: 190,
            description: 'White granulated sugar.',
            image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Soda 500ml',
            category: 'Beverages',
            price: 70,
            description: 'Chilled soft drinks.',
            image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Cheese block 200g',
            category: 'Dairy',
            price: 350,
            description: 'Mild cheddar-style block.',
            image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80',
        },
    ],
    'Local Shops': [
        {
            name: 'Kerosene lamp',
            category: 'Homewares',
            price: 850,
            description: 'Classic metal lamp for power cuts.',
            image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Plastic basin set',
            category: 'Homewares',
            price: 600,
            description: 'Nested washing basins.',
            image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Maize flour 2kg',
            category: 'Staples',
            price: 180,
            description: 'Everyday ugali flour.',
            image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Nylon rope (10m)',
            category: 'Hardware',
            price: 250,
            description: 'General-purpose cord.',
            image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'School exercise books (pack)',
            category: 'Stationery',
            price: 320,
            description: 'A4 ruled books — pack of 5.',
            image: 'https://images.unsplash.com/photo-1456513080130-7f85fcf37d13?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Torch with batteries',
            category: 'Hardware',
            price: 450,
            description: 'Handy LED torch.',
            image: 'https://images.unsplash.com/photo-1590534247854-e608c9cdba86?auto=format&fit=crop&w=800&q=80',
        },
    ],
    Electronics: [
        {
            name: 'LED TV 32"',
            category: 'TVs',
            price: 28500,
            description: 'HD smart-ready television.',
            image: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Bluetooth speaker',
            category: 'Audio',
            price: 4500,
            description: 'Portable wireless speaker.',
            image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Laptop bag 15"',
            category: 'Accessories',
            price: 2200,
            description: 'Padded carry bag.',
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Wireless mouse',
            category: 'Computing',
            price: 1200,
            description: 'USB dongle included.',
            image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Power bank 10000mAh',
            category: 'Accessories',
            price: 2800,
            description: 'Fast-charge portable battery.',
            image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'HDMI cable 2m',
            category: 'Cables',
            price: 650,
            description: 'High-speed HDMI lead.',
            image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Extension socket (4-way)',
            category: 'Power',
            price: 980,
            description: 'Surge-protected strip.',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'USB flash drive 64GB',
            category: 'Storage',
            price: 1100,
            description: 'USB 3.0 stick.',
            image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',
        },
    ],
    'Mobile Phones & Gadgets': [
        {
            name: 'Smartphone case',
            category: 'Phone cases',
            price: 800,
            description: 'Shockproof TPU case — popular models.',
            image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Tempered glass protector',
            category: 'Screen care',
            price: 500,
            description: '9H screen glass.',
            image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Type-C fast charger',
            category: 'Chargers',
            price: 1500,
            description: '25W wall charger + cable.',
            image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Wireless earbuds',
            category: 'Audio gadgets',
            price: 3500,
            description: 'In-ear buds with charging case.',
            image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Car phone mount',
            category: 'Car gadgets',
            price: 1200,
            description: 'Dash / vent clip mount.',
            image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Selfie stick tripod',
            category: 'Photography',
            price: 1800,
            description: 'Bluetooth remote included.',
            image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
        },
    ],
    'African Fashions': [
        {
            name: 'Ankara print dress',
            category: 'Dresses',
            price: 4500,
            description: 'Ready-to-wear wax print dress.',
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Kitenge wrap',
            category: 'Wraps',
            price: 1800,
            description: 'Colourful kitenge fabric wrap.',
            image: 'https://images.unsplash.com/photo-1558171813-4c0887531718?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Beaded necklace',
            category: 'Accessories',
            price: 2200,
            description: 'Hand-strung statement beads.',
            image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Men’s dashiki shirt',
            category: 'Shirts',
            price: 3200,
            description: 'Embroidered dashiki top.',
            image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Headwrap set',
            category: 'Accessories',
            price: 1500,
            description: 'Matching gele / headwrap pair.',
            image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Leather sandals',
            category: 'Footwear',
            price: 2800,
            description: 'Handmade casual sandals.',
            image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
        },
    ],
    'Boutique & Apparel': [
        {
            name: 'Linen shirt',
            category: 'Tops',
            price: 3800,
            description: 'Breathable highland-ready shirt.',
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b81?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Denim jeans',
            category: 'Bottoms',
            price: 4200,
            description: 'Classic fit denim.',
            image: 'https://images.unsplash.com/photo-1542272454315-7f6b6f66080b?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Knit sweater',
            category: 'Knitwear',
            price: 5500,
            description: 'Warm evening layer.',
            image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Canvas tote bag',
            category: 'Bags',
            price: 1600,
            description: 'Everyday carry tote.',
            image: 'https://images.unsplash.com/photo-1590874103328-eac38a67437e?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Sunglasses',
            category: 'Accessories',
            price: 2400,
            description: 'UV-protected frames.',
            image: 'https://images.unsplash.com/photo-1511499767150-a48a237ac008?auto=format&fit=crop&w=800&q=80',
        },
    ],
    'Party Items': [
        {
            name: 'Balloon pack (50)',
            category: 'Decor',
            price: 450,
            description: 'Assorted party balloons.',
            image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Birthday banner',
            category: 'Decor',
            price: 350,
            description: 'Happy Birthday letter banner.',
            image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Paper cups & plates set',
            category: 'Tableware',
            price: 600,
            description: 'Disposable serving set for 20.',
            image: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Confetti poppers (pack)',
            category: 'Extras',
            price: 280,
            description: 'Push-pop confetti tubes.',
            image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Cake candles',
            category: 'Extras',
            price: 150,
            description: 'Number & spiral candles.',
            image: 'https://images.unsplash.com/photo-1464349746301-6d3b4b8c9a0f?auto=format&fit=crop&w=800&q=80',
        },
    ],
    'Gifts & Souvenirs': [
        {
            name: 'Mt Kenya photo print',
            category: 'Prints',
            price: 1800,
            description: 'Framed highland landscape print.',
            image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Coffee gift pack',
            category: 'Gourmet gifts',
            price: 2500,
            description: 'Local roast beans + mug.',
            image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Wooden keepsake box',
            category: 'Craft gifts',
            price: 2200,
            description: 'Carved cedar box.',
            image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Nanyuki postcard set',
            category: 'Stationery gifts',
            price: 400,
            description: 'Pack of 8 local postcards.',
            image: 'https://images.unsplash.com/photo-1456513080130-7f85fcf37d13?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Scented candle',
            category: 'Home gifts',
            price: 1200,
            description: 'Soy candle — highland scent.',
            image: 'https://images.unsplash.com/photo-1602607388654-166b711af63f?auto=format&fit=crop&w=800&q=80',
        },
    ],
    'Flower & Decor': [
        {
            name: 'Fresh bouquet',
            category: 'Bouquets',
            price: 2500,
            description: 'Seasonal mixed blooms.',
            image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Potted succulent',
            category: 'Plants',
            price: 800,
            description: 'Desk-friendly plant.',
            image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cb2d?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Ceramic vase',
            category: 'Vases',
            price: 1800,
            description: 'Handmade glaze vase.',
            image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Wreath for door',
            category: 'Seasonal decor',
            price: 2200,
            description: 'Dried flower wreath.',
            image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Table centrepiece',
            category: 'Event florals',
            price: 3500,
            description: 'Ready arrangement for dining tables.',
            image: 'https://images.unsplash.com/photo-1487530811176-3780da1762fe?auto=format&fit=crop&w=800&q=80',
        },
    ],
    'Curios & Souvenirs': [
        {
            name: 'Maasai beaded bracelet',
            category: 'Jewellery',
            price: 900,
            description: 'Hand-beaded wristband.',
            image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Soapstone carving',
            category: 'Carvings',
            price: 2500,
            description: 'Animal figure carving.',
            image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Woven basket',
            category: 'Basketry',
            price: 1800,
            description: 'Kiondo-style woven basket.',
            image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Safari keyring',
            category: 'Small gifts',
            price: 350,
            description: 'Leather & bead keyring.',
            image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Shuka blanket',
            category: 'Textiles',
            price: 3200,
            description: 'Classic check shuka.',
            image: 'https://images.unsplash.com/photo-1558171813-4c0887531718?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'Wooden spoon set',
            category: 'Craft kitchen',
            price: 1100,
            description: 'Hand-carved serving spoons.',
            image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
        },
    ],
};

function productsForShoppingListing(listing) {
    if (listing?.categoryKey !== 'shopping') return [];
    const sub = listing.subcategory;
    const catalogue = PRODUCTS_BY_SHOPPING_SUBCATEGORY[sub];
    return Array.isArray(catalogue) ? catalogue.map((p) => ({ ...p })) : [];
}

/** Extra stock frames used to pad thin galleries to at least 3 photos. */
const PAD_IMAGES = [
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1474044159687-1ee9f38a6762?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80',
];

function ensureGalleryDepth(gallery, minPerSpace = 3) {
    const spaces = normalizeGallerySpaces(gallery);
    return spaces.map((space, spaceIndex) => {
        const images = [...space.images];
        let pad = 0;
        while (images.length < minPerSpace) {
            const candidate =
                PAD_IMAGES[(spaceIndex * 3 + pad) % PAD_IMAGES.length];
            if (!images.includes(candidate)) {
                images.push(candidate);
            }
            pad += 1;
            if (pad > PAD_IMAGES.length + 2) break;
        }
        return {
            ...space,
            images,
            cover: images[0],
        };
    });
}

const DEFAULTS_BY_CATEGORY = {
    eatDrink: {
        galleryKinds: DINING_GALLERY,
        amenities: ['wifi', 'outdoor', 'parking', 'family', 'cards'],
        payments: PAY_DEFAULT,
        withHours: true,
    },
    stay: {
        galleryKinds: ROOM_GALLERY,
        amenities: ['wifi', 'parking', 'family', 'workspace'],
        payments: [...PAY_DEFAULT, 'Paybill'],
        withHours: true,
        facts: [
            { label: 'Guests', value: '2+' },
            { label: 'Check-in', value: '14:00' },
            { label: 'Check-out', value: '10:00' },
        ],
    },
    thingsToDo: {
        galleryKinds: ACTIVITY_GALLERY,
        amenities: ['parking', 'family'],
        payments: PAY_DEFAULT,
        withHours: true,
        facts: [
            { label: 'Duration', value: 'Half day' },
            { label: 'Difficulty', value: 'Moderate' },
        ],
        included: ['Guided experience', 'Local host'],
        bring: ['Comfortable shoes', 'Water'],
    },
    services: {
        galleryKinds: SERVICE_GALLERY,
        amenities: [],
        payments: ['Cash', 'M-Pesa'],
        withHours: true,
        offerings: ['Consultation', 'On-site service', 'Follow-up support'],
        credentials: ['Licensed operator'],
        facts: [
            { label: 'Service area', value: 'Nanyuki & surrounds' },
            { label: 'From', value: 'On request' },
        ],
    },
    shopping: {
        galleryKinds: SHOP_GALLERY,
        amenities: ['parking', 'cards', 'wifi'],
        payments: PAY_DEFAULT,
        withHours: true,
        brands: ['Local makers', 'Everyday essentials'],
    },
    properties: {
        galleryKinds: ROOM_GALLERY,
        amenities: ['parking', 'security', 'garden'],
        payments: ['Bank transfer'],
        withHours: false,
        facts: [
            { label: 'Bedrooms', value: '—' },
            { label: 'Baths', value: '—' },
            { label: 'Price', value: 'On request' },
        ],
        highlights: [
            'Close to local shops and services',
            'Easy road access to Nanyuki town',
            'Quiet residential setting',
            'Suitable for family living',
        ],
    },
    events: {
        galleryKinds: EVENT_GALLERY,
        amenities: ['parking', 'wifi', 'family', 'wheelchair', 'cards', 'security'],
        payments: ['M-Pesa', 'Cash'],
        withHours: false,
        facts: [
            { label: 'Starts', value: 'See organiser' },
            { label: 'Ends', value: 'See organiser' },
            { label: 'Venue', value: 'Nanyuki' },
            { label: 'Location', value: 'Nanyuki' },
        ],
        agenda: [{ time: 'TBA', title: 'Programme announced closer to the date' }],
        eventSchedule: [
            { label: 'Doors', value: 'TBA' },
            { label: 'Event', value: 'TBA' },
        ],
        sponsors: [],
    },
};

function buildGallery(listing, defaults) {
    const kinds =
        isHotelListing(listing) && !defaults?.forceRoomGallery
            ? HOTEL_GALLERY
            : defaults.galleryKinds;

    if (kinds?.length) {
        return ensureGalleryDepth(
            kinds.map((space, i) => {
                const images = Array.isArray(space.images)
                    ? [...space.images]
                    : space.src
                      ? [space.src]
                      : [];
                if (i === 0 && listing.image) {
                    images[0] = listing.image;
                }
                return {
                    label: space.label || 'Gallery',
                    kind: space.kind || space.label || 'space',
                    images,
                };
            }),
        );
    }
    if (!listing.image) {
        return ensureGalleryDepth(
            isHotelListing(listing) ? HOTEL_GALLERY : ROOM_GALLERY,
        );
    }
    return ensureGalleryDepth([
        {
            label: isHotelListing(listing) ? 'General gallery' : 'Gallery',
            kind: isHotelListing(listing) ? 'general' : 'main',
            images: [listing.image],
        },
        {
            label: 'More views',
            kind: 'more',
            images: PAD_IMAGES.slice(0, 3),
        },
        {
            label: 'Highlights',
            kind: 'highlights',
            images: PAD_IMAGES.slice(2, 5),
        },
    ]);
}

/**
 * Merge base listing with rich detail (or category defaults).
 */
export function getListingDetail(listing) {
    if (!listing) return null;

    const explicit = listingDetailsById[listing.id] ?? listingDetailsById[String(listing.id)];
    const defaults = DEFAULTS_BY_CATEGORY[listing.categoryKey] ?? DEFAULTS_BY_CATEGORY.eatDrink;

    const propertyType = listing.propertyType || null;
    const rawFacts = explicit?.facts ?? defaults.facts ?? [];
    const facts =
        listing.categoryKey === 'properties'
            ? [
                  ...(propertyType
                      ? [{ label: 'Property type', value: propertyType }]
                      : []),
                  ...(listing.subcategory
                      ? [{ label: 'Listing', value: listing.subcategory }]
                      : []),
                  ...rawFacts.filter(
                      (f) =>
                          f?.label &&
                          f.label !== 'Property type' &&
                          f.label !== 'Listing' &&
                          !(
                              f.label === 'Type' &&
                              /sale|rent|lease/i.test(String(f.value || ''))
                          ),
                  ),
              ]
            : rawFacts;

    const baseChipsCategories =
        listing.categoryKey === 'properties'
            ? [listing.category, propertyType, listing.subcategory].filter(Boolean)
            : [listing.category, listing.subcategory].filter(Boolean);

    const base = {
        about:
            listing.about ||
            `${listing.title} is a local favourite in ${listing.location}. Reach out to confirm hours, pricing, and availability.`,
        address: listing.address || `${listing.location}, Kenya`,
        gallery: buildGallery(listing, defaults),
        video: listing.image
            ? {
                  poster: listing.image,
                  src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
                  title: `Preview · ${listing.title}`,
              }
            : null,
        amenities: defaults.amenities ?? [],
        facts,
        propertyType,
        houseRules: defaults.houseRules ?? [],
        included: defaults.included ?? [],
        bring: defaults.bring ?? [],
        offerings: defaults.offerings ?? [],
        credentials: defaults.credentials ?? [],
        brands: defaults.brands ?? [],
        docs: [],
        menus: [],
        products: productsForShoppingListing(listing),
        highlights: defaults.highlights ?? [],
        sponsors: defaults.sponsors ?? [],
        eventPoster: listing.eventPoster || null,
        startDate: listing.startDate || null,
        endDate: listing.endDate || null,
        venue: listing.venue || null,
        ticketPrice: listing.ticketPrice || null,
        earlyBirdPrice: listing.earlyBirdPrice || null,
        gatePrice: listing.gatePrice || null,
        ticketUrl: listing.ticketUrl || null,
        ageLimit: listing.ageLimit || null,
        organiser: listing.organiser || null,
        agent:
            listing.categoryKey === 'properties'
                ? {
                      name: 'Listing agent',
                      phone: listing.phone,
                      email: null,
                      note: 'Contact for viewings and details.',
                  }
                : null,
        hours: defaults.withHours ? WEEKDAY_HOURS : null,
        hoursStatus: listing.isOpen === false ? 'closed' : 'open',
        eventSchedule: defaults.eventSchedule ?? null,
        agenda: defaults.agenda ?? [],
        payments: defaults.payments ?? [],
        email:
            listing.email ||
            `hello@${String(listing.title || 'listing')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '')
                .slice(0, 18) || 'listing'}.co.ke`,
        socials: listing.socials || {
            instagram: 'https://instagram.com/',
            facebook: 'https://facebook.com/',
            tiktok: 'https://www.tiktok.com/',
            youtube: 'https://youtube.com/',
            whatsapp: listing.phone
                ? `https://wa.me/${String(listing.phone).replace(/\D/g, '')}`
                : null,
        },
        priceRangeLabel: listing.priceLevel
            ? { $: 'Budget', $$: 'Moderate', $$$: 'Pricey' }[listing.priceLevel] ||
              listing.priceLevel
            : null,
        chips: {
            region: `${listing.location} Area`,
            categories: baseChipsCategories,
            tags: listing.tagline ? [listing.tagline] : [],
        },
        reviewSummary: {
            count: Math.max(8, Math.round((listing.rating || 4) * 18)),
            highlight: 'Well liked by recent visitors.',
        },
        relatedIds: [],
    };

    const mergedChips = { ...base.chips, ...explicit?.chips };
    if (listing.categoryKey === 'properties') {
        const chipCats = [
            listing.category,
            propertyType || explicit?.chips?.categories?.find?.(Boolean),
            listing.subcategory,
            ...(Array.isArray(explicit?.chips?.categories)
                ? explicit.chips.categories
                : []),
        ].filter(Boolean);
        mergedChips.categories = [...new Set(chipCats)];
    }

    const posterSrc =
        explicit?.eventPoster || listing.eventPoster || null;
    let gallery = ensureGalleryDepth(explicit?.gallery ?? base.gallery);
    if (listing.categoryKey === 'events' && posterSrc) {
        const spaces = normalizeGallerySpaces(gallery);
        const hasPosterSpace = spaces.some(
            (space) => space.kind === 'poster' || space.label === 'Poster',
        );
        if (!hasPosterSpace) {
            gallery = [
                {
                    label: 'Poster',
                    kind: 'poster',
                    images: [posterSrc],
                    cover: posterSrc,
                },
                ...spaces,
            ];
        }
    }

    return {
        ...listing,
        ...base,
        ...explicit,
        propertyType: propertyType || explicit?.propertyType || null,
        facts: listing.categoryKey === 'properties' ? facts : explicit?.facts ?? base.facts,
        gallery,
        chips: mergedChips,
        reviewSummary: { ...base.reviewSummary, ...explicit?.reviewSummary },
        products:
            Array.isArray(explicit?.products) && explicit.products.length
                ? explicit.products
                : base.products,
    };
}
