<?php

namespace App\Support;

use App\Models\Category;
use App\Models\CategorySubcategory;
use Illuminate\Support\Facades\Cache;

class CategoryTaxonomy
{
    private const CACHE_KEY = 'category_taxonomy.subcategories_by_key';

    private const NAV_CACHE_KEY = 'category_taxonomy.navigation';

    private const CACHE_TTL_SECONDS = 300;

    /**
     * Primary website nav keys. Everything else belongs under More.
     *
     * @var list<string>
     */
    public const PRIMARY_NAV_KEYS = ['eatDrink', 'stay', 'thingsToDo'];

    /**
     * Default subcategory labels keyed by CategoryKey (camelCase).
     *
     * @var array<string, list<string>>
     */
    public const DEFAULTS = [
        'eatDrink' => [
            'Restaurants',
            'Cafes',
            'Bars & Lounges',
            'Pork Joint & BBQ',
            'Outdoor Dining',
            'Fast Food & Takeaways',
            'Bakery & Desserts',
            'Garden Restaurant',
        ],
        'stay' => [
            'Airbnbs',
            'Hotels',
            'Boutique Hotels',
            'Conference Hotels',
            'Luxury Camps',
            'Private Villa',
            'Resorts',
            'Safari Lodges',
            'Serviced Apartments',
            'Lodges & Camps',
        ],
        'thingsToDo' => [
            'Outdoor & Adventure',
            'Wildlife & Nature',
            'Gym & Fitness',
            'Nightlife',
            'Spas & Wellness',
        ],
        'services' => [
            'Tours & Guides',
            'Health & Medical',
            'Finance & Banking',
            'Beauty & Personal Care',
            'Car Hire',
            'Tech & Digital',
            'Creative & Media',
            'Cleaning & Maintenance',
        ],
        'shopping' => [
            'Supermarkets',
            'Local Shops',
            'Electronics',
            'Mobile Phones & Gadgets',
            'African Fashions',
            'Boutique & Apparel',
            'Party Items',
            'Gifts & Souvenirs',
            'Flower & Decor',
            'Curios & Souvenirs',
        ],
        'properties' => [
            'For Sale',
            'For Rent',
            'For Lease',
        ],
        'events' => [
            'Music & Entertainment',
            'Faith & Community',
            'Lifestyle & Social',
            'Family & Kids',
            'Seasonal Events',
            'Arts & Culture',
            'Sports & Fitness',
            'Wildlife & Conservation',
            'Charity & Fundraisers',
            'Business & Networking',
            'Outdoor & Adventure',
        ],
    ];

    /**
     * @return array<string, list<string>>
     */
    public static function subcategoriesByKey(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL_SECONDS, function () {
            $map = [];

            $categories = Category::query()
                ->with(['subcategories:id,category_id,name,sort_order'])
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'slug']);

            foreach ($categories as $category) {
                $key = CategoryKey::resolve($category->slug);
                if ($key === null) {
                    continue;
                }

                $names = $category->subcategories
                    ->pluck('name')
                    ->filter(fn ($name) => is_string($name) && trim($name) !== '')
                    ->values()
                    ->all();

                if ($names === [] && isset(self::DEFAULTS[$key])) {
                    $names = self::DEFAULTS[$key];
                }

                $map[$key] = $names;
            }

            foreach (self::DEFAULTS as $key => $defaults) {
                if (! array_key_exists($key, $map)) {
                    $map[$key] = $defaults;
                }
            }

            return $map;
        });
    }

    /**
     * @return list<string>
     */
    public static function forKey(?string $categoryKey): array
    {
        $key = CategoryKey::resolve($categoryKey);
        if ($key === null) {
            return [];
        }

        return self::subcategoriesByKey()[$key] ?? [];
    }

    /**
     * Full category tree for public navigation (label, key, children).
     *
     * @return list<array{key: string, slug: string, label: string, children: list<string>}>
     */
    public static function forNavigation(): array
    {
        return Cache::remember(self::NAV_CACHE_KEY, self::CACHE_TTL_SECONDS, function () {
            $byKey = self::subcategoriesByKey();

            $rows = Category::query()
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'slug'])
                ->map(function (Category $category) use ($byKey) {
                    $key = CategoryKey::resolve($category->slug);
                    if ($key === null) {
                        return null;
                    }

                    return [
                        'key' => $key,
                        'slug' => $category->slug,
                        'label' => $category->name,
                        'children' => $byKey[$key] ?? [],
                    ];
                })
                ->filter()
                ->values()
                ->all();

            if ($rows !== []) {
                return $rows;
            }

            $fallback = [];
            foreach (CategoryKey::DEFINITIONS as $key => $meta) {
                $fallback[] = [
                    'key' => $key,
                    'slug' => $meta['slug'],
                    'label' => $meta['label'],
                    'children' => $byKey[$key] ?? (self::DEFAULTS[$key] ?? []),
                ];
            }

            return $fallback;
        });
    }

    public static function forgetCache(): void
    {
        Cache::forget(self::CACHE_KEY);
        Cache::forget(self::NAV_CACHE_KEY);
    }

    /**
     * Seed default subcategory rows for every known category (idempotent).
     */
    public static function seedDefaults(): int
    {
        $created = 0;

        foreach (Category::query()->get(['id', 'slug']) as $category) {
            $key = CategoryKey::fromSlug($category->slug);
            if ($key === null || ! isset(self::DEFAULTS[$key])) {
                continue;
            }

            foreach (self::DEFAULTS[$key] as $index => $name) {
                $row = CategorySubcategory::query()->firstOrCreate(
                    [
                        'category_id' => $category->id,
                        'name' => $name,
                    ],
                    [
                        'sort_order' => $index,
                    ],
                );

                if ($row->wasRecentlyCreated) {
                    $created++;
                }
            }
        }

        self::forgetCache();

        return $created;
    }
}
