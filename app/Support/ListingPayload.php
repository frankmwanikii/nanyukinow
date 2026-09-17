<?php

namespace App\Support;

use App\Models\Listing;
use Illuminate\Support\Collection;

class ListingPayload
{
    /**
     * Map an Eloquent listing into the shape the React UI expects.
     *
     * @return array<string, mixed>
     */
    public static function fromModel(Listing $listing): array
    {
        $category = $listing->category;
        $tier = $listing->tier ?: ($listing->is_featured ? 'featured' : 'free');

        return [
            'id' => $listing->id,
            'title' => $listing->title,
            'slug' => $listing->slug,
            'location' => $listing->location,
            'description' => $listing->description,
            'tagline' => $listing->tagline ?: $listing->description,
            'image' => $listing->image_url,
            'logo' => $listing->logo_url,
            'rating' => $listing->rating !== null ? (float) $listing->rating : null,
            'category' => $category?->name,
            'categoryKey' => $category?->slug,
            'is_featured' => (bool) $listing->is_featured,
            'is_trending' => (bool) $listing->is_trending,
            'tier' => $tier,
            'phone' => $listing->phone,
            'email' => $listing->email,
            'website' => $listing->website,
            'latitude' => $listing->latitude,
            'longitude' => $listing->longitude,
            'expires_at' => $listing->expires_at?->toIso8601String(),
            'priority' => $listing->priority,
        ];
    }

    /**
     * @param  Collection<int, Listing>  $listings
     * @return list<array<string, mixed>>
     */
    public static function collection(Collection $listings): array
    {
        return $listings
            ->map(fn (Listing $listing) => self::fromModel($listing))
            ->values()
            ->all();
    }
}
