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
        gallery: ROOM_GALLERY,
        video: {
            poster: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
            src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            title: 'Tour the grounds',
        },
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
        relatedIds: ['e12', 'e13', 'r3'],
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
            { label: 'Type', value: 'For sale' },
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
        floorPlan: {
            image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
            title: 'Ground floor plan',
        },
        agent: {
            name: 'Highland Homes Agency',
            phone: '+254 722 445 668',
            email: 'viewings@highlandhomes.ke',
            note: 'Viewings by appointment, 7 days a week.',
        },
        payments: ['Bank transfer', 'M-Pesa (deposit)'],
        chips: {
            region: 'Timau Area',
            categories: ['Properties', 'For Sale'],
            tags: ['Garden', 'Mountain view'],
        },
        reviewSummary: { count: 12, highlight: 'Transparent viewings and clear paperwork.' },
        relatedIds: ['e15', 'e16', 'e2'],
    },

    // Events — Nanyuki Jazz Night
    e17: {
        about:
            'An evening of live jazz under highland skies — local ensembles, soft lighting, and a crowd that shows up for the music.',
        address: 'Town terrace venue, Nanyuki',
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
            { label: 'Date', value: 'Sat 28 Sep' },
            { label: 'Doors', value: '18:30' },
            { label: 'Starts', value: '19:30' },
            { label: 'Venue', value: 'Town terrace' },
            { label: 'Age', value: '18+' },
            { label: 'Tickets', value: 'KES 1,500' },
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
    },
    events: {
        galleryKinds: EVENT_GALLERY,
        payments: ['M-Pesa', 'Cash'],
        withHours: false,
        facts: [
            { label: 'Date', value: 'See organiser' },
            { label: 'Venue', value: 'Nanyuki' },
        ],
        agenda: [{ time: 'TBA', title: 'Programme announced closer to the date' }],
        eventSchedule: [
            { label: 'Doors', value: 'TBA' },
            { label: 'Event', value: 'TBA' },
        ],
    },
};

function buildGallery(listing, defaults) {
    if (defaults.galleryKinds?.length) {
        return ensureGalleryDepth(
            defaults.galleryKinds.map((space, i) => {
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
    if (!listing.image) return ensureGalleryDepth(ROOM_GALLERY);
    return ensureGalleryDepth([
        {
            label: 'Gallery',
            kind: 'main',
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
        facts: defaults.facts ?? [],
        houseRules: defaults.houseRules ?? [],
        included: defaults.included ?? [],
        bring: defaults.bring ?? [],
        offerings: defaults.offerings ?? [],
        credentials: defaults.credentials ?? [],
        brands: defaults.brands ?? [],
        docs: [],
        menus: [],
        floorPlan: null,
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
            categories: [listing.category, listing.subcategory].filter(Boolean),
            tags: listing.tagline ? [listing.tagline] : [],
        },
        reviewSummary: {
            count: Math.max(8, Math.round((listing.rating || 4) * 18)),
            highlight: 'Well liked by recent visitors.',
        },
        relatedIds: [],
    };

    return {
        ...listing,
        ...base,
        ...explicit,
        gallery: ensureGalleryDepth(explicit?.gallery ?? base.gallery),
        chips: { ...base.chips, ...explicit?.chips },
        reviewSummary: { ...base.reviewSummary, ...explicit?.reviewSummary },
    };
}
