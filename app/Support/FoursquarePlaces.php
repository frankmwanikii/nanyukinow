<?php

namespace App\Support;

use App\Models\SiteSetting;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class FoursquarePlaces
{
    public const BASE_URL = 'https://places-api.foursquare.com';

    public const API_VERSION = '2025-06-17';

    public static function apiKey(): string
    {
        $fromSettings = trim((string) SiteSetting::getValue('foursquare_api_key', ''));
        if ($fromSettings !== '') {
            return $fromSettings;
        }

        return trim((string) config('services.foursquare.api_key', ''));
    }

    public static function configured(): bool
    {
        return self::apiKey() !== '';
    }

    /**
     * Search places near Nanyuki. Returns normalized place picker rows.
     *
     * @return list<array<string, mixed>>
     */
    public static function search(string $query, float $lat, float $lng, int $radiusMeters = 25000, int $limit = 8): array
    {
        $key = self::apiKey();
        if ($key === '' || Str::length(trim($query)) < 2) {
            return [];
        }

        $response = self::client($key)
            ->get(self::BASE_URL.'/places/search', [
                'query' => trim($query),
                'll' => $lat.','.$lng,
                'radius' => $radiusMeters,
                'limit' => min(50, max(1, $limit)),
                'sort' => 'RELEVANCE',
            ]);

        return self::mapSearchResponse($response);
    }

    /**
     * Autocomplete (requires at least 3 characters).
     *
     * @return list<array<string, mixed>>
     */
    public static function autocomplete(string $query, float $lat, float $lng, int $radiusMeters = 25000, int $limit = 8): array
    {
        $key = self::apiKey();
        if ($key === '' || Str::length(trim($query)) < 3) {
            return [];
        }

        $response = self::client($key)
            ->get(self::BASE_URL.'/autocomplete', [
                'query' => trim($query),
                'll' => $lat.','.$lng,
                'radius' => $radiusMeters,
                'types' => 'place',
                'limit' => min(50, max(1, $limit)),
            ]);

        if (! $response->successful()) {
            return [];
        }

        $out = [];
        foreach ($response->json('results') ?? [] as $row) {
            if (($row['type'] ?? '') !== 'place') {
                continue;
            }
            $place = $row['place'] ?? null;
            if (! is_array($place)) {
                continue;
            }
            $item = self::mapPlace($place, $row['text'] ?? null);
            if ($item) {
                $out[] = $item;
            }
        }

        return $out;
    }

    /**
     * @return PendingRequest
     */
    public static function client(string $apiKey)
    {
        return Http::withHeaders([
            'Accept' => 'application/json',
            'Authorization' => 'Bearer '.$apiKey,
            'X-Places-Api-Version' => (string) config('services.foursquare.api_version', self::API_VERSION),
        ])
            ->connectTimeout(3)
            ->timeout(8)
            ->retry(2, 200, throw: false);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function mapSearchResponse(Response $response): array
    {
        if (! $response->successful()) {
            return [];
        }

        $out = [];
        foreach ($response->json('results') ?? [] as $place) {
            if (! is_array($place)) {
                continue;
            }
            $item = self::mapPlace($place);
            if ($item) {
                $out[] = $item;
            }
        }

        return $out;
    }

    /**
     * @param  array<string, mixed>  $place
     * @param  array<string, mixed>|null  $text
     * @return array<string, mixed>|null
     */
    public static function mapPlace(array $place, ?array $text = null): ?array
    {
        $id = $place['fsq_place_id'] ?? null;
        $name = $place['name'] ?? ($text['primary'] ?? null);
        $lat = isset($place['latitude']) ? (float) $place['latitude'] : null;
        $lng = isset($place['longitude']) ? (float) $place['longitude'] : null;

        if (! $id || ! $name || $lat === null || $lng === null) {
            return null;
        }

        $location = is_array($place['location'] ?? null) ? $place['location'] : [];
        $formatted = trim((string) ($location['formatted_address'] ?? ''));
        $secondary = $formatted !== ''
            ? $formatted
            : collect([
                $location['address'] ?? null,
                $location['locality'] ?? null,
                $location['region'] ?? null,
                $location['country'] ?? null,
            ])->filter()->unique()->implode(', ');

        if ($secondary === '' && is_array($text)) {
            $secondary = trim((string) ($text['secondary'] ?? ''));
        }

        $city = (string) ($location['locality'] ?? $location['region'] ?? '');

        return [
            'place_id' => 'fsq-'.$id,
            'source' => 'foursquare',
            'provider' => 'foursquare',
            'description' => $secondary !== '' ? $name.', '.$secondary : $name,
            'structured_formatting' => [
                'main_text' => $name,
                'secondary_text' => $secondary !== '' ? $secondary : 'Kenya',
            ],
            'badge' => 'Foursquare',
            'latitude' => $lat,
            'longitude' => $lng,
            'location_label' => $city !== '' ? $city : $name,
            'city' => $city,
            'address' => $secondary !== '' ? $name.', '.$secondary : $name,
        ];
    }
}
