<?php

namespace App\Support;

use App\Models\Listing;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ListingPayload
{
    /**
     * Maximum length of the plain-text tagline derived from a description.
     */
    private const TAGLINE_LIMIT = 180;

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
            'tagline' => $listing->tagline ?: self::plainText($listing->description),
            'image' => self::publicMediaUrl($listing->image_url),
            'logo' => self::publicMediaUrl($listing->logo_url),
            'eventPoster' => self::publicMediaUrl($listing->event_poster_url),
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
            'claim_status' => $listing->claim_status ?: 'unclaimed',
        ];
    }

    /**
     * Drop empty or incomplete storage paths so the UI never renders a broken image.
     */
    private static function publicMediaUrl(?string $url): ?string
    {
        if (! filled($url)) {
            return null;
        }

        $trimmed = trim($url);
        if ($trimmed === '' || $trimmed === '/storage' || $trimmed === '/storage/') {
            return null;
        }

        return $trimmed;
    }

    /**
     * Reduce rich-text content to a short plain-text line.
     */
    private static function plainText(?string $html): ?string
    {
        if (! filled($html)) {
            return null;
        }

        $text = html_entity_decode($html, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/<[^>]*>/', ' ', $text) ?? '';
        $text = str_replace("\u{00A0}", ' ', $text);
        $text = trim(preg_replace('/\s+/u', ' ', $text) ?? '');

        return $text !== '' ? Str::limit($text, self::TAGLINE_LIMIT) : null;
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
