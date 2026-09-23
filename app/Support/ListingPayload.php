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
        $categoryKey = CategoryKey::fromSlug($category?->slug);
        $details = is_array($listing->details) ? $listing->details : [];

        return [
            'id' => $listing->id,
            'title' => $listing->title,
            'slug' => $listing->slug,
            'location' => $listing->location,
            'city' => $listing->city,
            'description' => $listing->description,
            'tagline' => $listing->tagline ?: $listing->description,
            'image' => $listing->image_url,
            'logo' => $listing->logo_url,
            'eventPoster' => $listing->event_poster_url,
            'gallery' => $listing->gallery ?? [],
            'amenities' => $listing->amenities ?? [],
            'hours' => $listing->hours ?? [],
            'socials' => $listing->social_links ?? [],
            'details' => $details,
            'rating' => $listing->rating !== null ? (float) $listing->rating : null,
            'category' => $category?->name,
            'categoryKey' => $categoryKey,
            'subcategory' => $listing->subcategory,
            'propertyType' => $listing->property_type,
            'is_featured' => (bool) $listing->is_featured,
            'is_trending' => (bool) $listing->is_trending,
            'tier' => $tier,
            'phone' => $listing->phone,
            'whatsapp' => $listing->whatsapp,
            'email' => $listing->email,
            'website' => $listing->website,
            'address' => $listing->address,
            'venue' => $listing->venue,
            'lat' => $listing->latitude,
            'lng' => $listing->longitude,
            'latitude' => $listing->latitude,
            'longitude' => $listing->longitude,
            'price_range' => $listing->price_range,
            'priceLevel' => $listing->price_range,
            'startDate' => $listing->start_at?->toIso8601String(),
            'endDate' => $listing->end_at?->toIso8601String(),
            'ticketPrice' => $listing->ticket_price,
            'earlyBirdPrice' => $listing->early_bird_price,
            'gatePrice' => $listing->gate_price,
            'ticketUrl' => $listing->ticket_url,
            'expires_at' => $listing->expires_at?->toIso8601String(),
            'priority' => $listing->priority,
            'about' => $listing->description ?: ($details['about'] ?? null),
            'ageLimit' => $details['age_limit'] ?? null,
            'organiser' => $details['organiser'] ?? null,
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
