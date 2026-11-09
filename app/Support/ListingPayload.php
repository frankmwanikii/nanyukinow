<?php

namespace App\Support;

use App\Models\Listing;
use Illuminate\Support\Collection;

class ListingPayload
{
    /**
     * Compact shape for cards, explore catalogue, home strips, and maps.
     *
     * @return array<string, mixed>
     */
    public static function card(Listing $listing): array
    {
        $category = $listing->category;
        $tier = $listing->tier ?: ($listing->is_featured ? 'featured' : 'free');
        $categoryKey = CategoryKey::resolve($category?->slug);
        $details = is_array($listing->details) ? $listing->details : [];
        $price = filled($details['price'] ?? null) ? (string) $details['price'] : null;

        return [
            'id' => $listing->id,
            'title' => $listing->title,
            'slug' => $listing->slug,
            'location' => $listing->location,
            'city' => $listing->city,
            'tagline' => filled($listing->tagline) ? (string) $listing->tagline : null,
            'image' => self::publicMediaUrl($listing->image_url),
            'logo' => self::publicMediaUrl($listing->logo_url),
            'eventPoster' => self::publicMediaUrl($listing->event_poster_url),
            'rating' => $listing->rating !== null ? (float) $listing->rating : 0,
            'likesCount' => (int) ($listing->likes_count ?? 0),
            'category' => $category?->name,
            'categoryKey' => $categoryKey,
            'subcategory' => is_array($listing->subcategory)
                ? $listing->subcategory
                : ListingSubcategories::normalize($listing->subcategory),
            'propertyType' => $listing->property_type,
            'is_featured' => (bool) $listing->is_featured,
            'is_trending' => (bool) $listing->is_trending,
            'tier' => $tier,
            'lat' => $listing->latitude,
            'lng' => $listing->longitude,
            'latitude' => $listing->latitude,
            'longitude' => $listing->longitude,
            'price_range' => $listing->price_range,
            'priceLevel' => $listing->price_range,
            'price' => $price,
            'details' => $price !== null ? ['price' => $price] : [],
            'startDate' => $listing->start_at?->toIso8601String(),
            'endDate' => $listing->end_at?->toIso8601String(),
            'ticketPrice' => $listing->ticket_price,
            'priority' => $listing->priority,
        ];
    }

    /**
     * Full shape for listing detail pages.
     *
     * @return array<string, mixed>
     */
    public static function fromModel(Listing $listing): array
    {
        $category = $listing->category;
        $tier = $listing->tier ?: ($listing->is_featured ? 'featured' : 'free');
        $details = is_array($listing->details) ? $listing->details : [];

        return [
            ...self::card($listing),
            'description' => $listing->description,
            'gallery' => $listing->gallery ?? [],
            'amenities' => $listing->amenities ?? [],
            'hours' => $listing->hours ?? [],
            'socials' => $listing->social_links ?? [],
            'websiteLinks' => collect($listing->social_links['links'] ?? [])
                ->filter(fn ($item) => is_array($item) && filled($item['url'] ?? null))
                ->map(fn (array $item) => [
                    'label' => filled($item['label'] ?? null) ? (string) $item['label'] : 'Website',
                    'url' => (string) $item['url'],
                ])
                ->values()
                ->all(),
            'details' => $details,
            'phone' => $listing->phone,
            'whatsapp' => $listing->whatsapp,
            'email' => $listing->email,
            'website' => $listing->website,
            'address' => $listing->address,
            'venue' => $listing->venue,
            'earlyBirdPrice' => $listing->early_bird_price,
            'gatePrice' => $listing->gate_price,
            'ticketUrl' => $listing->ticket_url,
            'expires_at' => $listing->expires_at?->toIso8601String(),
            'about' => $listing->description ?: ($details['about'] ?? null),
            'ageLimit' => $details['age_limit'] ?? null,
            'organiser' => $details['organiser'] ?? null,
            'claim_status' => $listing->claim_status ?: 'unclaimed',
            'reviews' => $listing->relationLoaded('reviews')
                ? $listing->reviews->map(fn ($review) => [
                    'id' => $review->id,
                    'rating' => (int) $review->rating,
                    'body' => $review->body,
                    'name' => $review->user?->name ?: 'Member',
                    'avatar' => $review->user?->avatar_url,
                    'userId' => $review->user_id,
                    'date' => $review->created_at?->toIso8601String(),
                    'dateLabel' => $review->created_at?->diffForHumans(),
                ])->values()->all()
                : [],
            'reviewSummary' => [
                'count' => $listing->relationLoaded('reviews')
                    ? $listing->reviews->count()
                    : (int) $listing->reviews()->count(),
            ],
        ];
    }

    /**
     * Drop empty or incomplete storage paths so the UI never renders a broken image.
     */
    private static function publicMediaUrl(?string $url): ?string
    {
        return ListingMedia::normalizePublicUrl($url);
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

    /**
     * @param  Collection<int, Listing>  $listings
     * @return list<array<string, mixed>>
     */
    public static function cards(Collection $listings): array
    {
        return $listings
            ->map(fn (Listing $listing) => self::card($listing))
            ->values()
            ->all();
    }
}
