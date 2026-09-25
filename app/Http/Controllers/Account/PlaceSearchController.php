<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PlaceSearchController extends Controller
{
    private const NANYUKI_LAT = -0.0166;

    private const NANYUKI_LNG = 37.0728;

    /** Viewbox: west,north,east,south around Nanyuki / Laikipia */
    private const VIEWBOX = '36.70,0.20,37.45,-0.30';

    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:120'],
        ]);

        $q = trim($data['q']);
        $results = [];

        foreach ($this->searchLocalListings($q) as $item) {
            $results[$item['place_id']] = $item;
        }

        foreach ($this->searchExternal($q) as $item) {
            if (! isset($results[$item['place_id']])) {
                $results[$item['place_id']] = $item;
            }
        }

        $sorted = array_values($results);
        usort($sorted, function (array $a, array $b) {
            $rank = static fn (array $r): int => match ($r['source'] ?? '') {
                'local' => 0,
                'photon' => 1,
                default => 2,
            };

            return $rank($a) <=> $rank($b);
        });

        return response()->json([
            'results' => array_slice($sorted, 0, 10),
        ]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function searchLocalListings(string $q): array
    {
        $listings = \App\Support\ListingSearch::results($q, 6);

        return $listings->map(function (Listing $listing) {
            $lat = $listing->latitude;
            $lng = $listing->longitude;
            $secondary = collect([
                $listing->venue,
                $listing->address,
                $listing->location,
                $listing->city ?: 'Nanyuki',
                'Kenya',
            ])->filter()->unique()->implode(', ');

            return [
                'place_id' => 'local-'.$listing->id,
                'source' => 'local',
                'provider' => 'local',
                'description' => trim($listing->title.($secondary ? ', '.$secondary : '')),
                'structured_formatting' => [
                    'main_text' => $listing->title,
                    'secondary_text' => $secondary ?: 'On Nanyuki Now',
                ],
                'badge' => 'Nanyuki Now',
                'latitude' => $lat !== null ? (float) $lat : null,
                'longitude' => $lng !== null ? (float) $lng : null,
                'location_label' => $listing->location ?: ($listing->city ?: 'Nanyuki'),
                'city' => $listing->city ?: '',
                'address' => $listing->address
                    ?: collect([$listing->title, $listing->location, $listing->city ?: 'Nanyuki', 'Kenya'])
                        ->filter()
                        ->unique()
                        ->implode(', '),
                'geocode_query' => trim($listing->title.' '.($listing->location ?: 'Nanyuki').' Kenya'),
            ];
        })->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function searchExternal(string $q): array
    {
        $localised = $this->localisedQueries($q);
        $ua = 'NanyukiNow/1.0 (https://nanyukinow.co.ke; places@nanyukinow.co.ke)';

        $responses = Http::pool(fn (Pool $pool) => [
            $pool->as('photon')
                ->withHeaders(['User-Agent' => $ua, 'Accept' => 'application/json'])
                ->timeout(6)
                ->get('https://photon.komoot.io/api/', [
                    'q' => $localised[0],
                    'limit' => 8,
                    'lat' => self::NANYUKI_LAT,
                    'lon' => self::NANYUKI_LNG,
                    'lang' => 'en',
                ]),
            $pool->as('photon2')
                ->withHeaders(['User-Agent' => $ua, 'Accept' => 'application/json'])
                ->timeout(6)
                ->get('https://photon.komoot.io/api/', [
                    'q' => $q,
                    'limit' => 6,
                    'lat' => self::NANYUKI_LAT,
                    'lon' => self::NANYUKI_LNG,
                    'lang' => 'en',
                ]),
            $pool->as('nominatim')
                ->withHeaders(['User-Agent' => $ua, 'Accept' => 'application/json'])
                ->timeout(6)
                ->get('https://nominatim.openstreetmap.org/search', [
                    'format' => 'jsonv2',
                    'addressdetails' => 1,
                    'limit' => 6,
                    'countrycodes' => 'ke',
                    'viewbox' => self::VIEWBOX,
                    'bounded' => 0,
                    'q' => $localised[0],
                ]),
        ]);

        $out = [];

        foreach (['photon', 'photon2'] as $key) {
            $res = $responses[$key] ?? null;
            if (! $res instanceof \Illuminate\Http\Client\Response || ! $res->successful()) {
                continue;
            }
            foreach ($res->json('features') ?? [] as $feature) {
                $item = $this->photonToResult($feature);
                if ($item && $this->isKenyaLocal($item)) {
                    $out[$item['place_id']] = $item;
                }
            }
        }

        $nominatim = $responses['nominatim'] ?? null;
        if ($nominatim instanceof \Illuminate\Http\Client\Response && $nominatim->successful()) {
            foreach ($nominatim->json() ?? [] as $row) {
                $item = $this->nominatimToResult($row);
                if ($item) {
                    $out[$item['place_id']] = $out[$item['place_id']] ?? $item;
                }
            }
        }

        return array_values($out);
    }

    /**
     * @return list<string>
     */
    private function localisedQueries(string $q): array
    {
        $lower = Str::lower($q);
        $hasArea = Str::contains($lower, ['nanyuki', 'timau', 'naromoru', 'laikipia', 'kenya', 'naro moru']);

        $queries = [$q];
        if (! $hasArea) {
            $queries[] = $q.' Nanyuki';
            $queries[] = $q.' Nanyuki Kenya';
        }

        return $queries;
    }

    /**
     * @param  array<string, mixed>  $feature
     * @return array<string, mixed>|null
     */
    private function photonToResult(array $feature): ?array
    {
        $props = $feature['properties'] ?? [];
        $coords = $feature['geometry']['coordinates'] ?? null;
        if (! is_array($coords) || count($coords) < 2) {
            return null;
        }

        $lng = (float) $coords[0];
        $lat = (float) $coords[1];
        $name = $props['name'] ?? $props['street'] ?? null;
        if (! $name) {
            return null;
        }

        $parts = array_values(array_filter([
            $props['housenumber'] ?? null,
            $props['street'] ?? null,
            $props['district'] ?? null,
            $props['city'] ?? null,
            $props['county'] ?? null,
            $props['state'] ?? null,
            $props['country'] ?? null,
        ]));

        $secondary = implode(', ', array_unique($parts));
        $osmId = ($props['osm_type'] ?? 'p').'-'.($props['osm_id'] ?? md5($name.$lat.$lng));

        return [
            'place_id' => 'photon-'.$osmId,
            'source' => 'photon',
            'provider' => 'osm',
            'description' => $secondary ? $name.', '.$secondary : $name,
            'structured_formatting' => [
                'main_text' => $name,
                'secondary_text' => $secondary ?: 'Kenya',
            ],
            'badge' => null,
            'latitude' => $lat,
            'longitude' => $lng,
            'location_label' => $props['city']
                ?? $props['county']
                ?? $props['district']
                ?? $name,
            'city' => $props['city'] ?? $props['county'] ?? '',
            'address' => $secondary ? $name.', '.$secondary : $name,
            '_osm' => ['lat' => (string) $lat, 'lon' => (string) $lng],
        ];
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<string, mixed>|null
     */
    private function nominatimToResult(array $row): ?array
    {
        $lat = isset($row['lat']) ? (float) $row['lat'] : null;
        $lng = isset($row['lon']) ? (float) $row['lon'] : null;
        if ($lat === null || $lng === null) {
            return null;
        }

        $addr = $row['address'] ?? [];
        $main = $row['name']
            ?? $addr['tourism']
            ?? $addr['amenity']
            ?? $addr['hotel']
            ?? $addr['road']
            ?? explode(',', (string) ($row['display_name'] ?? 'Place'))[0];

        $secondary = $row['display_name'] ?? '';
        if (Str::startsWith($secondary, $main.',')) {
            $secondary = trim(Str::after($secondary, $main.','));
        }

        return [
            'place_id' => 'osm-'.($row['place_id'] ?? md5($row['display_name'] ?? $main)),
            'source' => 'nominatim',
            'provider' => 'osm',
            'description' => $row['display_name'] ?? $main,
            'structured_formatting' => [
                'main_text' => $main,
                'secondary_text' => $secondary,
            ],
            'badge' => null,
            'latitude' => $lat,
            'longitude' => $lng,
            'location_label' => $addr['suburb']
                ?? $addr['neighbourhood']
                ?? $addr['village']
                ?? $addr['town']
                ?? $addr['city']
                ?? $main,
            'city' => $addr['city'] ?? $addr['town'] ?? $addr['county'] ?? '',
            'address' => $row['display_name'] ?? $main,
            '_osm' => $row,
        ];
    }

    /**
     * Prefer Kenya / Mt Kenya region hits from Photon (global index).
     *
     * @param  array<string, mixed>  $item
     */
    private function isKenyaLocal(array $item): bool
    {
        $hay = Str::lower(($item['description'] ?? '').' '.($item['city'] ?? '').' '.($item['address'] ?? ''));
        if (Str::contains($hay, ['kenya', 'nanyuki', 'laikipia', 'timau', 'naromoru', 'meru', 'nyeri'])) {
            return true;
        }

        $lat = $item['latitude'] ?? null;
        $lng = $item['longitude'] ?? null;
        if (! is_numeric($lat) || ! is_numeric($lng)) {
            return false;
        }

        // Rough Mt Kenya / central Kenya box
        return $lat > -1.2 && $lat < 1.0 && $lng > 35.8 && $lng < 38.5;
    }
}
