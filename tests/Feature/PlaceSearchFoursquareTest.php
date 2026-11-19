<?php

namespace Tests\Feature;

use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PlaceSearchFoursquareTest extends TestCase
{
    use RefreshDatabase;

    public function test_place_search_prefers_foursquare_when_key_is_set(): void
    {
        $user = User::factory()->create();

        SiteSetting::query()->create([
            'group' => 'maps',
            'key' => 'foursquare_api_key',
            'label' => 'Foursquare API key',
            'type' => 'password',
            'value' => 'test-fsq-service-key',
            'help' => null,
            'sort_order' => 3,
        ]);
        SiteSetting::forgetCache();

        Http::preventStrayRequests();
        Http::fake([
            'places-api.foursquare.com/places/search*' => Http::response([
                'results' => [
                    [
                        'fsq_place_id' => 'abc123',
                        'name' => "Dorman's Nanyuki",
                        'latitude' => 0.0134,
                        'longitude' => 37.0778,
                        'location' => [
                            'formatted_address' => 'Kenyatta Ave, Nanyuki',
                            'locality' => 'Nanyuki',
                            'country' => 'KE',
                        ],
                    ],
                ],
            ], 200),
            'photon.komoot.io/*' => Http::response(['features' => []], 200),
            'nominatim.openstreetmap.org/*' => Http::response([], 200),
        ]);

        $response = $this->actingAs($user)
            ->getJson(route('account.places.search', ['q' => 'coffee']));

        $response->assertOk()
            ->assertJsonPath('results.0.place_id', 'fsq-abc123')
            ->assertJsonPath('results.0.source', 'foursquare')
            ->assertJsonPath('results.0.structured_formatting.main_text', "Dorman's Nanyuki");

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'places-api.foursquare.com/places/search')
                && $request->hasHeader('Authorization', 'Bearer test-fsq-service-key')
                && $request['query'] === 'coffee';
        });
    }

    public function test_place_search_skips_foursquare_without_key(): void
    {
        $user = User::factory()->create();

        SiteSetting::query()->where('key', 'foursquare_api_key')->delete();
        SiteSetting::forgetCache();

        Http::preventStrayRequests();
        Http::fake([
            'photon.komoot.io/*' => Http::response(['features' => []], 200),
            'nominatim.openstreetmap.org/*' => Http::response([], 200),
        ]);

        $this->actingAs($user)
            ->getJson(route('account.places.search', ['q' => 'coffee']))
            ->assertOk()
            ->assertJsonPath('results', []);

        Http::assertNotSent(function ($request) {
            return str_contains($request->url(), 'foursquare.com');
        });
    }

    public function test_place_search_skips_foursquare_when_provider_is_osm(): void
    {
        $user = User::factory()->create();

        SiteSetting::query()->create([
            'group' => 'maps',
            'key' => 'foursquare_api_key',
            'label' => 'Foursquare API key',
            'type' => 'password',
            'value' => 'test-fsq-service-key',
            'help' => null,
            'sort_order' => 4,
        ]);
        SiteSetting::query()->create([
            'group' => 'maps',
            'key' => 'place_search_provider',
            'label' => 'Place search',
            'type' => 'select',
            'value' => 'osm',
            'help' => null,
            'sort_order' => 3,
        ]);
        SiteSetting::forgetCache();

        Http::preventStrayRequests();
        Http::fake([
            'photon.komoot.io/*' => Http::response(['features' => []], 200),
            'nominatim.openstreetmap.org/*' => Http::response([], 200),
        ]);

        $this->actingAs($user)
            ->getJson(route('account.places.search', ['q' => 'coffee']))
            ->assertOk();

        Http::assertNotSent(function ($request) {
            return str_contains($request->url(), 'foursquare.com');
        });
    }
}
