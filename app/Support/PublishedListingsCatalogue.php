<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Throwable;

class PublishedListingsCatalogue
{
    public const CACHE_KEY = 'listings.published.cards';

    public const FEATURED_CACHE_KEY = 'listings.featured.cards';

    /**
     * Fresh for 120s; may be served stale until 600s while refreshing.
     *
     * @var array{0: int, 1: int}
     */
    private const FLEXIBLE_TTL = [120, 600];

    /**
     * Ordered published listing cards for explore and deferred home strips.
     *
     * @return list<array<string, mixed>>
     */
    public static function cards(): array
    {
        try {
            /** @var list<array<string, mixed>> $cards */
            $cards = Cache::flexible(self::CACHE_KEY, self::FLEXIBLE_TTL, fn () => self::buildCards());

            return $cards;
        } catch (Throwable) {
            return self::buildCards();
        }
    }

    /**
     * Promoted strip for the home hero area — small query, separate cache.
     *
     * @return list<array<string, mixed>>
     */
    public static function featuredCards(int $limit = 12): array
    {
        try {
            /** @var list<array<string, mixed>> $cards */
            $cards = Cache::remember(
                self::FEATURED_CACHE_KEY,
                120,
                fn () => self::buildFeaturedCards($limit),
            );

            return $cards;
        } catch (Throwable) {
            return self::buildFeaturedCards($limit);
        }
    }

    public static function forget(): void
    {
        try {
            Cache::forget(self::CACHE_KEY);
            Cache::forget(self::FEATURED_CACHE_KEY);
        } catch (Throwable) {
            // Cache store may be unavailable; ignore.
        }
    }

    /**
     * @return list<array<string, mixed>>
     */
    private static function buildCards(): array
    {
        $published = ListingSearch::publishedQuery()
            ->orderByDesc('priority')
            ->orderByDesc('rating')
            ->orderByDesc('id')
            ->get();

        return ListingPayload::cards($published);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private static function buildFeaturedCards(int $limit): array
    {
        return ListingPayload::cards(
            ListingSearch::publishedQuery()
                ->where('priority', '>=', Membership::PROMOTED_PRIORITY)
                ->orderByDesc('priority')
                ->orderByDesc('rating')
                ->orderByDesc('id')
                ->limit($limit)
                ->get()
        );
    }
}
