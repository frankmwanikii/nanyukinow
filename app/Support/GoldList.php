<?php

namespace App\Support;

use App\Models\GoldListEntry;
use App\Models\Listing;
use Illuminate\Support\Collection;

class GoldList
{
    public const LIMIT = 24;

    /**
     * Home Gold List cards: admin pins first, then catalogue auto-fill.
     *
     * @return list<array<string, mixed>>
     */
    public static function cards(int $limit = self::LIMIT): array
    {
        $pinned = self::pinnedListings($limit);
        $cards = ListingPayload::cards($pinned);
        $exclude = array_fill_keys($pinned->pluck('id')->all(), true);

        if (count($cards) >= $limit) {
            return array_slice($cards, 0, $limit);
        }

        foreach (PublishedListingsCatalogue::cards() as $card) {
            if (count($cards) >= $limit) {
                break;
            }

            $id = $card['id'] ?? null;
            if ($id === null || isset($exclude[$id])) {
                continue;
            }

            $cards[] = $card;
            $exclude[$id] = true;
        }

        return $cards;
    }

    /**
     * Published listings pinned for the Gold List, in pin order.
     *
     * @return Collection<int, Listing>
     */
    public static function pinnedListings(int $limit = self::LIMIT): Collection
    {
        $orderedIds = GoldListEntry::query()
            ->orderBy('position')
            ->orderBy('id')
            ->limit($limit)
            ->pluck('listing_id');

        if ($orderedIds->isEmpty()) {
            return collect();
        }

        $published = ListingSearch::publishedQuery()
            ->whereIn('id', $orderedIds)
            ->get()
            ->keyBy('id');

        return $orderedIds
            ->map(fn ($id) => $published->get($id))
            ->filter()
            ->values();
    }
}
