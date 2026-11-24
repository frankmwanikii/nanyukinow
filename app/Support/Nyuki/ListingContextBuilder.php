<?php

namespace App\Support\Nyuki;

use App\Models\Listing;
use App\Models\User;
use App\Support\ListingPayload;
use App\Support\ListingSearch;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ListingContextBuilder
{
    private const MAX_LISTINGS = 12;

    private const DESCRIPTION_CHARS = 420;

    private const DETAIL_DESCRIPTION_CHARS = 1800;

    /**
     * @return array{
     *     listings: Collection<int, Listing>,
     *     context_text: string,
     *     citations: list<array<string, mixed>>,
     *     detail_mode: bool
     * }
     */
    public function build(string $message, ?User $user = null): array
    {
        $detailMode = $this->wantsDetails($message);
        $listings = $this->retrieve($message, $user, $detailMode);
        $citations = [];
        $blocks = [];

        foreach ($listings as $index => $listing) {
            $n = $index + 1;
            $href = route('listings.show', $listing->slug, absolute: false);
            $citations[] = array_merge(ListingPayload::card($listing), [
                'href' => $href,
            ]);
            $blocks[] = $this->formatListing($n, $listing, $href, $detailMode);
        }

        $header = $listings->isEmpty()
            ? 'DIRECTORY CONTEXT (live database, real time): No strongly matching published listings were found for this question. Say so clearly if you cannot recommend from the directory, and suggest browsing Explore or refining the ask.'
            : 'DIRECTORY CONTEXT (live database, real time): '.$listings->count().' published listing(s) from Nanyuki Now right now. Prefer these when recommending. Titles may be matched case-insensitively and partially (e.g. "olepangi" means Olepangi Farm). Do not invent listings that are not listed here.';

        if ($detailMode && $listings->isNotEmpty()) {
            $header .= ' The visitor asked for details. Use the full fields below (hours, contact, amenities, description) and keep the answer concrete.';
        }

        return [
            'listings' => $listings,
            'context_text' => $header."\n\n".implode("\n\n", $blocks),
            'citations' => $citations,
            'detail_mode' => $detailMode,
        ];
    }

    /**
     * @return Collection<int, Listing>
     */
    private function retrieve(string $message, ?User $user, bool $detailMode): Collection
    {
        /** @var Collection<int, Listing> $byId */
        $byId = collect();
        $tokens = ListingSearch::significantTokens($message);

        $push = function (iterable $rows) use (&$byId): void {
            foreach ($rows as $listing) {
                if (! $listing instanceof Listing) {
                    continue;
                }
                if ($byId->has($listing->id)) {
                    continue;
                }
                $byId->put($listing->id, $listing);
                if ($byId->count() >= self::MAX_LISTINGS) {
                    break;
                }
            }
        };

        if ($user !== null && $this->asksAboutSaved($message)) {
            $push(
                $user->bookmarkedListings()
                    ->with(['category:id,name,slug'])
                    ->published()
                    ->limit(8)
                    ->get()
            );
        }

        // Primary: fuzzy conversational search against the live published directory.
        $push(ListingSearch::nyukiResults($message, $detailMode ? 8 : 10));

        // Fallback: name/slug contains any significant token (handles odd phrasing).
        if ($byId->isEmpty() && $tokens !== []) {
            foreach ($tokens as $token) {
                if ($byId->count() >= self::MAX_LISTINGS) {
                    break;
                }
                $like = '%'.Str::lower($token).'%';
                $compact = ListingSearch::compact($token);
                $compactLike = $compact !== '' ? '%'.$compact.'%' : null;

                $push(
                    ListingSearch::publishedQuery()
                        ->where(function ($q) use ($like, $compactLike) {
                            $q->whereRaw('LOWER(title) LIKE ?', [$like])
                                ->orWhereRaw('LOWER(COALESCE(slug, "")) LIKE ?', [$like]);
                            if ($compactLike !== null) {
                                $q->orWhereRaw(
                                    "REPLACE(REPLACE(REPLACE(LOWER(COALESCE(title, '')), ' ', ''), '-', ''), '_', '') LIKE ?",
                                    [$compactLike]
                                );
                            }
                        })
                        ->orderByDesc('priority')
                        ->limit(6)
                        ->get()
                );
            }
        }

        foreach ($this->intentCategorySlugs($message) as $slug) {
            if ($byId->count() >= self::MAX_LISTINGS) {
                break;
            }
            // In detail mode, prefer name matches only; skip broad category fill.
            if ($detailMode && $byId->isNotEmpty()) {
                break;
            }
            $push(
                ListingSearch::publishedQuery()
                    ->whereHas('category', fn ($q) => $q->where('slug', $slug))
                    ->orderByDesc('priority')
                    ->orderByDesc('is_featured')
                    ->orderByDesc('rating')
                    ->orderByDesc('id')
                    ->limit(5)
                    ->get()
            );
        }

        if (! $detailMode && $byId->count() < 4) {
            $push(
                ListingSearch::publishedQuery()
                    ->orderByDesc('is_featured')
                    ->orderByDesc('is_trending')
                    ->orderByDesc('priority')
                    ->orderByDesc('rating')
                    ->orderByDesc('id')
                    ->limit(6)
                    ->get()
            );
        }

        $ranked = $byId->values();
        if ($tokens !== []) {
            $ranked = $ranked
                ->sortByDesc(fn (Listing $listing) => ListingSearch::nyukiRelevanceScore($listing, $tokens))
                ->values();
        }

        return $ranked->take(self::MAX_LISTINGS);
    }

    public function wantsDetails(string $message): bool
    {
        $m = Str::lower($message);

        return (bool) preg_match(
            '/\b(detail|details|tell me about|more about|info on|information on|what about|hours|open|contact|phone|whatsapp|amenities|price|prices|menu|address|where is|describe)\b/u',
            $m,
        );
    }

    private function asksAboutSaved(string $message): bool
    {
        $m = Str::lower($message);

        return Str::contains($m, ['saved', 'bookmark', 'bookmarked', 'favourites', 'favorites', 'my list']);
    }

    /**
     * @return list<string>
     */
    private function intentCategorySlugs(string $message): array
    {
        $m = Str::lower($message);
        $slugs = [];

        $map = [
            'eat-drink' => ['eat', 'lunch', 'dinner', 'breakfast', 'cafe', 'coffee', 'restaurant', 'bar', 'drink', 'food', 'brunch'],
            'stay' => ['stay', 'hotel', 'lodge', 'airbnb', 'room', 'accommodation', 'sleep', 'overnight', 'cabin', 'cottage'],
            'events' => ['event', 'tonight', 'saturday', 'concert', 'gig', 'ticket', 'what\'s on', 'whats on', 'nightlife'],
            'things-to-do' => ['safari', 'hike', 'tour', 'wildlife', 'activity', 'things to do', 'adventure'],
            'shopping' => ['shop', 'shopping', 'store', 'market', 'buy'],
            'services' => ['service', 'repair', 'hire', 'salon', 'gym', 'clinic'],
            'properties' => ['property', 'house for sale', 'land', 'rent', 'for sale', 'plot'],
        ];

        foreach ($map as $slug => $words) {
            foreach ($words as $word) {
                if (Str::contains($m, $word)) {
                    $slugs[] = $slug;
                    break;
                }
            }
        }

        return array_values(array_unique($slugs));
    }

    private function formatListing(int $n, Listing $listing, string $href, bool $detailMode): string
    {
        $lines = [
            "[{$n}] {$listing->title}",
            'URL: '.$href,
        ];

        if ($listing->category?->name) {
            $lines[] = 'Category: '.$listing->category->name;
        }

        $subs = is_array($listing->subcategory) ? array_filter($listing->subcategory) : [];
        if ($subs !== []) {
            $lines[] = 'Subcategory: '.implode(', ', $subs);
        }

        if (filled($listing->property_type)) {
            $lines[] = 'Type: '.$listing->property_type;
        }

        $place = collect([$listing->location, $listing->city, $listing->address, $listing->venue])
            ->filter(fn ($v) => filled($v))
            ->unique()
            ->implode(' · ');
        if ($place !== '') {
            $lines[] = 'Place: '.$place;
        }

        if (filled($listing->tagline)) {
            $lines[] = 'Tagline: '.Str::limit(strip_tags((string) $listing->tagline), 160);
        }

        $description = $this->plainDescription($listing->description);
        if ($description !== '') {
            $limit = $detailMode ? self::DETAIL_DESCRIPTION_CHARS : self::DESCRIPTION_CHARS;
            $lines[] = 'About: '.Str::limit($description, $limit);
        }

        if (filled($listing->price_range)) {
            $lines[] = 'Price range: '.$listing->price_range;
        }

        if (filled($listing->ticket_price)) {
            $lines[] = 'Tickets: '.$listing->ticket_price;
        }

        if ($listing->start_at) {
            $lines[] = 'Starts: '.$listing->start_at->toDayDateTimeString();
        }

        if ($listing->end_at) {
            $lines[] = 'Ends: '.$listing->end_at->toDayDateTimeString();
        }

        $hours = $this->formatHours($listing->hours);
        if ($hours !== '') {
            $lines[] = 'Hours: '.$hours;
        }

        $amenities = $this->formatAmenities($listing->amenities, $detailMode ? 40 : 16);
        if ($amenities !== '') {
            $lines[] = 'Amenities: '.$amenities;
        }

        $details = $this->formatDetails($listing->details, $detailMode ? 30 : 10);
        if ($details !== '') {
            $lines[] = 'Details: '.$details;
        }

        $contact = collect([
            filled($listing->phone) ? 'phone '.$listing->phone : null,
            filled($listing->whatsapp) ? 'WhatsApp '.$listing->whatsapp : null,
            filled($listing->email) ? 'email '.$listing->email : null,
            filled($listing->website) ? 'web '.$listing->website : null,
        ])->filter()->implode(', ');
        if ($contact !== '') {
            $lines[] = 'Contact: '.$contact;
        }

        if ($detailMode && is_array($listing->social_links)) {
            $socialBits = [];
            foreach ($listing->social_links as $key => $value) {
                if (is_string($value) && $value !== '' && $key !== 'links') {
                    $socialBits[] = $key.': '.$value;
                }
            }
            foreach ($listing->social_links['links'] ?? [] as $link) {
                if (is_array($link) && filled($link['url'] ?? null)) {
                    $label = filled($link['label'] ?? null) ? (string) $link['label'] : 'link';
                    $socialBits[] = $label.': '.$link['url'];
                }
            }
            if ($socialBits !== []) {
                $lines[] = 'Links: '.implode('; ', array_slice($socialBits, 0, 8));
            }
        }

        if ($listing->latitude && $listing->longitude) {
            $lines[] = 'Map: '.$listing->latitude.', '.$listing->longitude;
        }

        if ($listing->rating) {
            $lines[] = 'Rating: '.$listing->rating;
        }

        $flags = collect([
            $listing->is_featured ? 'featured' : null,
            $listing->is_trending ? 'trending' : null,
            $listing->is_verified ? 'verified' : null,
            $listing->tier ? 'tier '.$listing->tier : null,
        ])->filter()->implode(', ');
        if ($flags !== '') {
            $lines[] = 'Flags: '.$flags;
        }

        return implode("\n", $lines);
    }

    private function plainDescription(?string $html): string
    {
        $text = html_entity_decode(strip_tags((string) $html), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/u', ' ', $text) ?? $text;

        return trim($text);
    }

    private function formatHours(mixed $hours): string
    {
        if (! is_array($hours) || $hours === []) {
            return '';
        }

        $parts = [];
        foreach ($hours as $key => $value) {
            if (is_string($value) || is_numeric($value)) {
                $parts[] = (is_string($key) ? $key.': ' : '').(string) $value;
            } elseif (is_array($value)) {
                $open = $value['open'] ?? $value['from'] ?? null;
                $close = $value['close'] ?? $value['to'] ?? null;
                if ($open || $close) {
                    $parts[] = (is_string($key) ? $key.': ' : '').trim(($open ?? '').' to '.($close ?? ''), ' to ');
                }
            }
            if (count($parts) >= 8) {
                break;
            }
        }

        return implode('; ', $parts);
    }

    private function formatAmenities(mixed $amenities, int $limit = 16): string
    {
        if (! is_array($amenities) || $amenities === []) {
            return '';
        }

        $labels = [];
        foreach ($amenities as $item) {
            if (is_string($item) && $item !== '') {
                $labels[] = $item;
            } elseif (is_array($item)) {
                $label = $item['label'] ?? $item['name'] ?? $item['title'] ?? null;
                if (is_string($label) && $label !== '') {
                    $labels[] = $label;
                }
            }
            if (count($labels) >= $limit) {
                break;
            }
        }

        return implode(', ', $labels);
    }

    private function formatDetails(mixed $details, int $limit = 10): string
    {
        if (! is_array($details) || $details === []) {
            return '';
        }

        $parts = [];
        foreach ($details as $key => $value) {
            if (is_array($value)) {
                $nested = $this->formatDetails($value, max(3, (int) floor($limit / 2)));
                if ($nested !== '' && is_string($key)) {
                    $parts[] = Str::headline((string) $key).': '.$nested;
                }

                continue;
            }

            if (! is_scalar($value) || (string) $value === '') {
                continue;
            }

            $parts[] = (is_string($key) ? Str::headline((string) $key).': ' : '').(string) $value;
            if (count($parts) >= $limit) {
                break;
            }
        }

        return implode('; ', $parts);
    }
}
