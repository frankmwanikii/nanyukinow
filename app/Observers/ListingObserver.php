<?php

namespace App\Observers;

use App\Models\Listing;
use App\Support\PublishedListingsCatalogue;

class ListingObserver
{
    /**
     * Attributes that change often but do not need a catalogue rebuild.
     *
     * @var list<string>
     */
    private const IGNORE_ATTRIBUTES = [
        'likes_count',
        'views_count',
        'updated_at',
    ];

    public function saved(Listing $listing): void
    {
        if ($this->shouldInvalidate($listing)) {
            PublishedListingsCatalogue::forget();
        }
    }

    public function deleted(Listing $listing): void
    {
        PublishedListingsCatalogue::forget();
    }

    private function shouldInvalidate(Listing $listing): bool
    {
        if (! $listing->wasRecentlyCreated && ! $listing->wasChanged()) {
            return false;
        }

        $changed = array_keys($listing->getChanges());
        if ($changed === []) {
            return $listing->wasRecentlyCreated;
        }

        $meaningful = array_diff($changed, self::IGNORE_ATTRIBUTES);

        return $meaningful !== [];
    }
}
