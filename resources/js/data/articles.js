export const ARTICLE_CATEGORIES = [
    'Travel Tips',
    'Shopping',
    'Stay',
    'Weather',
];

export const articles = [
    {
        id: 'a1',
        slug: 'nanyuki-shopping-guide',
        title: 'The Nanyuki Shopping Guide',
        category: 'Shopping',
        excerpt:
            "Nanyuki isn't just a stop for fuel — it's a treasure trove of high-quality crafts and modern convenience.",
        image: '/images/stories/shopping-hero.webp',
        author: 'Nanyuki Now',
        publishedAt: '2026-03-02',
        readMinutes: 6,
        body: [
            "Nanyuki isn't just a stop for fuel; it's a hidden treasure of high-quality crafts and modern convenience. Bring a suitcase that is almost empty.",
        ],
        sections: [
            {
                id: 'modern-hub',
                title: 'The Modern Hub: One-Stop Convenience',
                paragraphs: [
                    "Nanyuki's modern shopping scene is anchored by places like Cedar Mall — a clean, one-stop hub for fashion, groceries, pharmacy runs, and everyday essentials. Think Chandarana Foodplus, Goodlife Pharmacy, Optica, Beyond Fruits, and more under one roof, with easy parking and a breezy highland setting.",
                    'Whether you need trail snacks before a conservancy day or a last-minute gift before heading home, the modern malls keep town life simple without losing the highland feel.',
                ],
                image: '/images/stories/shopping-cedar-mall.webp',
                imageAlt: 'Cedar Mall Nanyuki exterior on a clear day',
            },
            {
                id: 'artisan-gems',
                title: 'The Artisan Gems: Shopping with a Story',
                paragraphs: [
                    'Beyond the malls, Nanyuki shines in its artisan finds — beaded jewelry, woven baskets, leatherwork, and curios that carry the color and craft of Laikipia. Markets and craft stalls turn shopping into conversation: ask who made the piece, what the patterns mean, and what is in season.',
                    'These are the souvenirs worth packing space for — items with a story, not just a price tag.',
                ],
                image: '/images/stories/shopping-curios.webp',
                imageAlt: 'Colorful Maasai beadwork and woven baskets',
            },
            {
                id: 'survival-kit',
                title: 'The Nanyuki Shopping Survival Kit: What to Bring',
                paragraphs: [
                    'A little prep goes a long way when you are hopping between malls, markets, and roadside craft stops.',
                ],
                list: [
                    {
                        title: 'Comfortable walking shoes',
                        text: "You'll be on your feet exploring shops, stalls, and short stretches between stops.",
                    },
                    {
                        title: 'Reusable bags',
                        text: 'Go green and keep a sturdy bag ready for crafts, produce, and spontaneous finds.',
                    },
                    {
                        title: 'A sense of adventure',
                        text: 'The best pieces often sit in the least expected corners — ask locals where they shop.',
                    },
                ],
                image: '/images/stories/shopping-survival.webp',
                imageAlt: 'Hikers on a mountain ridge at sunset',
            },
        ],
        proTip:
            "Don't be afraid to bargain at local markets. It's part of the culture and often results in a better price — and a friendly conversation with the seller.",
    },
    {
        id: 'a2',
        slug: 'hotels-vs-bush-cabin',
        title: 'Choosing Your Nanyuki Base: Hotels vs. The “Bush Cabin”',
        category: 'Stay',
        excerpt:
            'Town convenience or wild quiet? How to pick the stay that matches the trip you actually want.',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        author: 'Nanyuki Now',
        publishedAt: '2026-02-18',
        readMinutes: 6,
        body: [
            'Your base shapes the whole trip. A hotel in Nanyuki keeps restaurants, fuel, and evening plans close. A bush cabin trades that for silence, stars, and wildlife at the edges of the day.',
            'Choose a hotel if you’re hopping between town, conservancies, and short day trips. You’ll save driving time and have easier access to cafés, meetings, and last-minute bookings.',
            'Choose a bush cabin if the point is to slow down — morning game drives, long lunches, and nights that feel properly away from it all. Just plan meals and transfers ahead.',
            'Many visitors do both: a couple of nights in town to settle in, then a cabin stretch for the wilder half of the stay.',
        ],
    },
    {
        id: 'a3',
        slug: 'mastering-nanyuki-bipolar-weather',
        title: 'Mastering Nanyuki’s Bi-Polar Weather',
        category: 'Weather',
        excerpt:
            'Sun at noon, sweater by sunset — pack and plan for the highland climate that keeps everyone guessing.',
        image: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1200&q=80',
        author: 'Nanyuki Now',
        publishedAt: '2026-01-28',
        readMinutes: 4,
        body: [
            'Nanyuki sits high enough that the weather can feel like two seasons in one day. Bright, dry mornings often give way to cooler afternoons and properly chilly evenings.',
            'Dress in layers you can peel off: a light shirt for midday, a fleece or light jacket for dusk, and something warmer if you’re heading out on an early game drive.',
            'Rain can arrive fast in the wetter months. A compact rain shell beats an umbrella when you’re moving between vehicles, trails, and open conservancies.',
            'Check the forecast, then assume it will still surprise you — and you’ll be comfortable either way.',
        ],
    },
    {
        id: 'a4',
        slug: 'first-weekend-in-nanyuki',
        title: 'Your first weekend in Nanyuki',
        category: 'Travel Tips',
        excerpt:
            'A simple two-day rhythm: coffee, conservancy air, and a sunset worth staying out for.',
        image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
        author: 'Nanyuki Now',
        publishedAt: '2025-12-10',
        readMinutes: 5,
        body: [
            'Keep day one easy: arrive, settle, and walk the town. Grab a café lunch, stock a few snacks, and get a feel for distances before you commit to longer drives.',
            'Day two is for the open country — a conservancy visit, a short hike, or a scenic loop toward Timau or Naromoru. Leave buffer time; highland roads reward a slower pace.',
            'End both days somewhere with a view. Nanyuki’s evenings are part of the product.',
        ],
    },
    {
        id: 'a5',
        slug: 'what-to-pack-for-laikipia',
        title: 'What to pack for Laikipia',
        category: 'Travel Tips',
        excerpt:
            'The short list that covers town days, bush mornings, and those sharp highland evenings.',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
        author: 'Nanyuki Now',
        publishedAt: '2025-11-22',
        readMinutes: 4,
        body: [
            'Pack light but intentional: closed shoes for dust and trails, sandals for town, and layers for temperature swings.',
            'Binoculars, sunscreen, a refillable bottle, and a power bank earn their keep. If you’re staying in a cabin, confirm laundry and kitchen basics before you overpack.',
            'Leave room for local honey, coffee, and crafts — you’ll thank yourself on the way home.',
        ],
    },
];

export function getArticleBySlug(slug) {
    return articles.find((article) => article.slug === slug) ?? null;
}

export function filterArticles({ category = null, q = '' } = {}) {
    const query = q.trim().toLowerCase();

    return articles.filter((article) => {
        if (category && article.category !== category) return false;
        if (!query) return true;
        const haystack = [
            article.title,
            article.excerpt,
            article.category,
            ...(article.body ?? []),
        ]
            .join(' ')
            .toLowerCase();
        return haystack.includes(query);
    });
}

export function formatArticleDate(iso) {
    try {
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}
