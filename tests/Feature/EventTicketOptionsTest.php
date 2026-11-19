<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use App\Support\Membership;
use App\Support\TicketOptions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EventTicketOptionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_ticket_options_summary_and_legacy_hydration(): void
    {
        $this->assertSame('KES 1,200', TicketOptions::summary([
            ['name' => 'General', 'amount' => 1200],
        ]));

        $this->assertSame('From KES 800', TicketOptions::summary([
            ['name' => 'Early bird', 'amount' => 800],
            ['name' => 'Gate', 'amount' => 1500],
        ]));

        $legacy = TicketOptions::fromLegacy('From KES 1,200', 'KES 800', 'KES 1,500');
        $this->assertSame('Early bird', $legacy[0]['name']);
        $this->assertSame(800, $legacy[0]['amount']);
        $this->assertSame('Gate ticket', $legacy[1]['name']);
        $this->assertSame(1500, $legacy[1]['amount']);
    }

    public function test_user_can_store_event_with_multiple_ticket_options(): void
    {
        Storage::fake('public');
        $this->seedCategories();

        $user = User::factory()->create([
            'plan' => Membership::STANDARD,
        ]);
        $category = Category::query()->where('slug', 'events')->firstOrFail();

        $this->actingAs($user)->post(route('account.listings.store'), [
            'title' => 'Highland Jazz Night',
            'category_id' => $category->id,
            'subcategory' => json_encode(['Music & Entertainment']),
            'location' => 'Nanyuki',
            'venue' => 'Town Terrace',
            'start_at' => '2026-12-01T19:00',
            'end_at' => '2026-12-01T22:00',
            'ticket_options' => json_encode([
                ['name' => 'Early bird', 'amount' => 1500],
                ['name' => 'Gate', 'amount' => 2500],
            ]),
            'tier' => Membership::STANDARD,
            'details' => json_encode([
                'organiser' => 'Nanyuki Arts',
            ]),
            'amenities' => json_encode([]),
            'event_poster' => UploadedFile::fake()->image('poster.jpg', 900, 1200),
            'gallery_urls' => json_encode([]),
            'social_links' => json_encode([]),
        ])->assertRedirect(route('account.listings.index'));

        $listing = Listing::query()->where('title', 'Highland Jazz Night')->first();
        $this->assertNotNull($listing);
        $this->assertSame([
            ['name' => 'Early bird', 'amount' => 1500],
            ['name' => 'Gate', 'amount' => 2500],
        ], $listing->ticket_options);
        $this->assertSame('From KES 1,500', $listing->ticket_price);
        $this->assertNull($listing->early_bird_price);
        $this->assertNull($listing->gate_price);
        $this->assertNotNull($listing->event_poster_url);
        $this->assertSame($listing->event_poster_url, $listing->image_url);
    }

    public function test_event_cover_mirrors_poster_when_only_cover_uploaded(): void
    {
        Storage::fake('public');
        $this->seedCategories();

        $user = User::factory()->create([
            'plan' => Membership::STANDARD,
        ]);
        $category = Category::query()->where('slug', 'events')->firstOrFail();

        $this->actingAs($user)->post(route('account.listings.store'), [
            'title' => 'Cover Only Night',
            'category_id' => $category->id,
            'subcategory' => json_encode(['Music & Entertainment']),
            'location' => 'Nanyuki',
            'venue' => 'Town Terrace',
            'start_at' => '2026-12-02T19:00',
            'end_at' => '2026-12-02T22:00',
            'ticket_options' => json_encode([
                ['name' => 'Gate', 'amount' => 1000],
            ]),
            'tier' => Membership::STANDARD,
            'details' => json_encode([]),
            'amenities' => json_encode([]),
            'cover' => UploadedFile::fake()->image('cover.jpg', 1200, 800),
            'gallery_urls' => json_encode([]),
            'social_links' => json_encode([]),
        ])->assertRedirect(route('account.listings.index'));

        $listing = Listing::query()->where('title', 'Cover Only Night')->first();
        $this->assertNotNull($listing);
        $this->assertNotNull($listing->image_url);
        $this->assertSame($listing->image_url, $listing->event_poster_url);
    }

    private function seedCategories(): void
    {
        foreach ([
            ['name' => 'Events', 'slug' => 'events', 'sort_order' => 7],
        ] as $row) {
            Category::query()->create($row);
        }
    }
}
