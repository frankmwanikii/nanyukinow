<?php

namespace App\Support;

use App\Models\Listing;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ListingSearch
{
    /**
     * Tokenize a free-text query into lowercased search terms.
     *
     * @return list<string>
     */
    public static function tokens(?string $query): array
    {
        $query = Str::lower(trim((string) $query));

        if ($query === '') {
            return [];
        }

        $parts = preg_split('/[\s,.;:\/\\\\|+]+/u', $query) ?: [];

        return array_values(array_filter(
            array_map(static fn (string $part) => trim($part), $parts),
            static fn (string $part) => $part !== '' && mb_strlen($part) >= 1,
        ));
    }

    /**
     * Base query for listings that should appear on the public site.
     */
    public static function publishedQuery(): Builder
    {
        return Listing::query()
            ->with(['category:id,name,slug'])
            ->published();
    }

    /**
     * Letters and digits only so "olpejeta" matches "Ol Pejeta".
     */
    public static function compact(?string $value): string
    {
        return (string) preg_replace('/[^a-z0-9]+/u', '', Str::lower(trim((string) $value)));
    }

    /**
     * SQL expression that strips spaces, hyphens, and underscores from a column.
     */
    protected static function compactSql(string $column): string
    {
        return "REPLACE(REPLACE(REPLACE(LOWER(COALESCE({$column}, '')), ' ', ''), '-', ''), '_', '')";
    }

    /**
     * Apply robust full-text-ish filters across listing fields.
     *
     * @param  list<string>|string|null  $query
     */
    public static function apply(Builder $builder, string|array|null $query): Builder
    {
        $tokens = is_array($query) ? $query : self::tokens($query);

        if ($tokens === []) {
            return $builder;
        }

        foreach ($tokens as $token) {
            $like = '%'.$token.'%';
            $compact = self::compact($token);
            $compactLike = $compact !== '' ? '%'.$compact.'%' : null;

            $builder->where(function (Builder $group) use ($like, $compactLike) {
                $group->whereRaw('LOWER(title) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(COALESCE(slug, "")) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(COALESCE(tagline, "")) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(COALESCE(description, "")) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(COALESCE(location, "")) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(COALESCE(city, "")) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(COALESCE(address, "")) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(COALESCE(venue, "")) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(CAST(subcategory AS CHAR)) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(COALESCE(property_type, "")) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(COALESCE(phone, "")) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(COALESCE(whatsapp, "")) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(COALESCE(email, "")) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(COALESCE(website, "")) LIKE ?', [$like])
                    ->orWhereHas('category', function (Builder $category) use ($like) {
                        $category->whereRaw('LOWER(name) LIKE ?', [$like])
                            ->orWhereRaw('LOWER(slug) LIKE ?', [$like]);
                    });

                // JSON amenities / details (MySQL & SQLite-friendly LIKE on cast)
                $group->orWhereRaw('LOWER(CAST(amenities AS CHAR)) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(CAST(details AS CHAR)) LIKE ?', [$like]);

                if ($compactLike !== null) {
                    $group->orWhereRaw(self::compactSql('title').' LIKE ?', [$compactLike])
                        ->orWhereRaw(self::compactSql('slug').' LIKE ?', [$compactLike])
                        ->orWhereRaw(self::compactSql('tagline').' LIKE ?', [$compactLike])
                        ->orWhereRaw(self::compactSql('location').' LIKE ?', [$compactLike])
                        ->orWhereRaw(self::compactSql('venue').' LIKE ?', [$compactLike])
                        ->orWhereRaw(self::compactSql('address').' LIKE ?', [$compactLike]);
                }
            });
        }

        return $builder;
    }

    /**
     * @return Collection<int, Listing>
     */
    public static function results(?string $query, int $limit = 12): Collection
    {
        $builder = self::publishedQuery();
        self::apply($builder, $query);

        return $builder
            ->orderByDesc('priority')
            ->orderByDesc('rating')
            ->orderByDesc('id')
            ->limit(max(1, $limit))
            ->get();
    }

    /**
     * Significant search tokens for conversational queries (drops "tell", "about", etc.).
     *
     * @return list<string>
     */
    public static function significantTokens(?string $query): array
    {
        $stop = [
            'a', 'an', 'the', 'and', 'or', 'of', 'to', 'for', 'in', 'on', 'at', 'by',
            'is', 'are', 'was', 'were', 'be', 'been', 'do', 'does', 'did', 'can', 'could',
            'should', 'would', 'will', 'i', 'me', 'my', 'we', 'you', 'your', 'it', 'its',
            'this', 'that', 'with', 'from', 'about', 'tell', 'show', 'give', 'find',
            'looking', 'look', 'need', 'want', 'please', 'info', 'information', 'details',
            'detail', 'more', 'some', 'any', 'near', 'around', 'what', 'where', 'when',
            'who', 'which', 'how', 'recommend', 'recommendation', 'suggestions',
            'suggestion', 'place', 'places', 'listing', 'listings', 'there', 'here',
            'good', 'best', 'nice', 'great',
        ];

        return array_values(array_filter(
            self::tokens($query),
            static fn (string $token) => mb_strlen($token) >= 2 && ! in_array($token, $stop, true),
        ));
    }

    /**
     * Nyuki retrieval: case-insensitive, fuzzy (compact) matching, OR across tokens.
     * "olepangi" matches "Olepangi Farm"; "tell me about olepangi" still finds it.
     *
     * @return Collection<int, Listing>
     */
    public static function nyukiResults(?string $query, int $limit = 12): Collection
    {
        $tokens = self::significantTokens($query);
        $limit = max(1, $limit);

        if ($tokens === []) {
            return collect();
        }

        $builder = self::publishedQuery();
        $builder->where(function (Builder $outer) use ($tokens) {
            foreach ($tokens as $token) {
                $like = '%'.$token.'%';
                $compact = self::compact($token);
                $compactLike = $compact !== '' ? '%'.$compact.'%' : null;

                $outer->orWhere(function (Builder $group) use ($like, $compactLike) {
                    $group->whereRaw('LOWER(title) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(COALESCE(slug, "")) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(COALESCE(tagline, "")) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(COALESCE(description, "")) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(COALESCE(location, "")) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(COALESCE(city, "")) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(COALESCE(address, "")) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(COALESCE(venue, "")) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(CAST(subcategory AS CHAR)) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(COALESCE(property_type, "")) LIKE ?', [$like])
                        ->orWhereHas('category', function (Builder $category) use ($like) {
                            $category->whereRaw('LOWER(name) LIKE ?', [$like])
                                ->orWhereRaw('LOWER(slug) LIKE ?', [$like]);
                        });

                    if ($compactLike !== null) {
                        $group->orWhereRaw(self::compactSql('title').' LIKE ?', [$compactLike])
                            ->orWhereRaw(self::compactSql('slug').' LIKE ?', [$compactLike])
                            ->orWhereRaw(self::compactSql('tagline').' LIKE ?', [$compactLike])
                            ->orWhereRaw(self::compactSql('venue').' LIKE ?', [$compactLike]);
                    }
                });
            }
        });

        return $builder
            ->orderByDesc('priority')
            ->orderByDesc('is_featured')
            ->orderByDesc('rating')
            ->orderByDesc('id')
            ->limit($limit * 3)
            ->get()
            ->sortByDesc(fn (Listing $listing) => self::nyukiRelevanceScore($listing, $tokens))
            ->values()
            ->take($limit);
    }

    /**
     * Higher score when the title/slug compactly contains the query tokens.
     *
     * @param  list<string>  $tokens
     */
    public static function nyukiRelevanceScore(Listing $listing, array $tokens): int
    {
        if ($tokens === []) {
            return 0;
        }

        $title = self::compact($listing->title);
        $slug = self::compact($listing->slug);
        $tagline = self::compact($listing->tagline);
        $score = 0;

        foreach ($tokens as $token) {
            $compact = self::compact($token);
            if ($compact === '') {
                continue;
            }

            if ($title === $compact) {
                $score += 100;
            } elseif (str_starts_with($title, $compact)) {
                $score += 70;
            } elseif (str_contains($title, $compact)) {
                $score += 50;
            }

            if (str_contains($slug, $compact)) {
                $score += 20;
            }

            if (str_contains($tagline, $compact)) {
                $score += 8;
            }
        }

        if ($listing->is_featured) {
            $score += 3;
        }

        return $score;
    }

    /**
     * Compact suggestion rows for the navbar / autocomplete.
     *
     * @return list<array<string, mixed>>
     */
    public static function suggestions(?string $query, int $limit = 8): array
    {
        return self::results($query, $limit)
            ->map(function (Listing $listing) {
                $payload = ListingPayload::card($listing);

                return [
                    'id' => $payload['id'],
                    'title' => $payload['title'],
                    'slug' => $payload['slug'],
                    'location' => $payload['location'] ?: ($payload['city'] ?: null),
                    'category' => $payload['category'],
                    'categoryKey' => $payload['categoryKey'],
                    'subcategory' => $payload['subcategory'],
                    'image' => $payload['image'],
                    'href' => route('listings.show', $payload['slug']),
                ];
            })
            ->values()
            ->all();
    }
}
