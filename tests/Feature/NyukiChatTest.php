<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class NyukiChatTest extends TestCase
{
    use RefreshDatabase;

    private function makeListing(array $overrides = []): Listing
    {
        $owner = User::factory()->create();
        $category = Category::query()->create([
            'name' => 'Eat & Drink',
            'slug' => 'eat-drink',
            'sort_order' => 1,
        ]);

        return Listing::query()->create(array_merge([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'title' => 'Root North Cafe',
            'slug' => 'root-north-cafe',
            'location' => 'Timau',
            'description' => 'Farm-to-table lunch near the Timau road.',
            'tagline' => 'Coffee and highland views',
            'image_url' => '/storage/listings/root-north-cover.jpg',
            'status' => 'published',
            'tier' => 'free',
            'is_published' => true,
            'claim_status' => 'claimed',
        ], $overrides));
    }

    public function test_chat_requires_a_message(): void
    {
        $this->postJson(route('nyuki.chat'), [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }

    public function test_chat_returns_service_unavailable_without_gemini_key(): void
    {
        config(['services.gemini.api_key' => '']);

        $this->postJson(route('nyuki.chat'), [
            'message' => 'Where should I eat lunch?',
        ])
            ->assertStatus(503)
            ->assertJsonFragment([
                'message' => 'Nyuki is not connected yet. Add a GEMINI_API_KEY in the server environment.',
            ]);
    }

    public function test_chat_sends_listing_context_to_gemini_and_returns_reply(): void
    {
        config([
            'services.gemini.api_key' => 'test-gemini-key',
            'services.gemini.model' => 'gemini-2.5-flash',
        ]);

        $listing = $this->makeListing();

        Http::preventStrayRequests();
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [[
                    'content' => [
                        'parts' => [[
                            'text' => "* **Root North Cafe** (/listings/root-north-cafe) is a calm lunch stop.\n* Another option nearby.",
                        ]],
                    ],
                ]],
            ], 200),
        ]);

        $response = $this->postJson(route('nyuki.chat'), [
            'message' => 'Where should I eat lunch near Timau?',
            'history' => [
                ['role' => 'user', 'content' => 'Hi'],
                ['role' => 'assistant', 'content' => 'Hello from Nyuki.'],
            ],
        ]);

        $response->assertOk()
            ->assertJsonPath('reply', "- **Root North Cafe** is a calm lunch stop.\n- Another option nearby.")
            ->assertJsonPath('citations.0.slug', $listing->slug)
            ->assertJsonPath('citations.0.title', $listing->title)
            ->assertJsonPath('citations.0.image', '/storage/listings/root-north-cover.jpg')
            ->assertJsonPath('follow_ups.0.label', 'Tell me more about Root North Cafe')
            ->assertJsonPath('explore_cta.label', 'Browse Eat & Drink')
            ->assertJsonPath('explore_cta.href', '/explore?category=eatDrink')
            ->assertJsonPath('model', 'gemini-2.5-flash');

        Http::assertSent(function ($request) use ($listing) {
            if (! str_contains($request->url(), 'gemini-2.5-flash:generateContent')) {
                return false;
            }

            $body = $request->data();
            $encoded = json_encode($body);

            return $request->hasHeader('x-goog-api-key', 'test-gemini-key')
                && is_string($encoded)
                && str_contains($encoded, $listing->title)
                && str_contains($encoded, 'Where should I eat lunch near Timau?');
        });
    }

    public function test_chat_handles_gemini_upstream_failure(): void
    {
        config(['services.gemini.api_key' => 'test-gemini-key']);

        Http::preventStrayRequests();
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'error' => ['message' => 'boom'],
            ], 500),
        ]);

        $this->postJson(route('nyuki.chat'), [
            'message' => 'Any quiet stays?',
        ])
            ->assertStatus(502)
            ->assertJsonFragment([
                'message' => 'Nyuki could not get an answer right now. Try again shortly.',
            ]);
    }

    public function test_chat_returns_busy_when_gemini_rate_limits(): void
    {
        config(['services.gemini.api_key' => 'test-gemini-key']);

        Http::preventStrayRequests();
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'error' => ['message' => 'rate limited'],
            ], 429),
        ]);

        $this->postJson(route('nyuki.chat'), [
            'message' => "what's their phone number?",
        ])
            ->assertStatus(429)
            ->assertJsonPath('code', 'busy')
            ->assertJsonFragment([
                'message' => 'Nyuki peeked left, then right, and still needs a second. Try again in a moment.',
            ]);
    }

    public function test_chat_matches_partial_case_insensitive_listing_names(): void
    {
        config([
            'services.gemini.api_key' => 'test-gemini-key',
            'services.gemini.model' => 'gemini-2.5-flash',
        ]);

        $owner = User::factory()->create();
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 2,
        ]);

        $listing = Listing::query()->create([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'title' => 'Olepangi Farm',
            'slug' => 'olepangi-farm',
            'location' => 'Timau',
            'description' => 'Farm stay with highland views and cottage units.',
            'phone' => '0700000000',
            'hours' => ['mon' => '08:00-18:00'],
            'amenities' => ['WiFi', 'Parking'],
            'image_url' => '/storage/listings/olepangi.jpg',
            'status' => 'published',
            'tier' => 'premium',
            'is_published' => true,
            'claim_status' => 'claimed',
        ]);

        Http::preventStrayRequests();
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [[
                    'content' => [
                        'parts' => [[
                            'text' => 'Olepangi Farm is a Timau stay with cottages and highland views.',
                        ]],
                    ],
                ]],
            ], 200),
        ]);

        $this->postJson(route('nyuki.chat'), [
            'message' => 'tell me about OLEPANGI',
        ])
            ->assertOk()
            ->assertJsonPath('citations.0.slug', $listing->slug)
            ->assertJsonPath('citations.0.image', '/storage/listings/olepangi.jpg');

        Http::assertSent(function ($request) {
            $encoded = json_encode($request->data());

            return is_string($encoded)
                && str_contains($encoded, 'Olepangi Farm')
                && str_contains($encoded, '0700000000')
                && str_contains($encoded, 'WiFi');
        });
    }
}
