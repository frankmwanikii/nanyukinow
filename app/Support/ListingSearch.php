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
