<?php

namespace Tests\Feature;

use App\Models\Amenity;
use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AccountListingFormTest extends TestCase
{
    use RefreshDatabase;

    private function seedCategories(): void
    {
        foreach ([
            ['name' => 'Eat & Drink', 'slug' => 'eatDrink', 'sort_order' => 1],
            ['name' => 'Stay', 'slug' => 'stay', 'sort_order' => 2],
            ['name' => 'Things to do', 'slug' => 'thingsToDo', 'sort_order' => 3],
            ['name' => 'Services', 'slug' => 'services', 'sort_order' => 4],
            ['name' => 'Shopping', 'slug' => 'shopping', 'sort_order' => 5],
            ['name' => 'Properties', 'slug' => 'properties', 'sort_order' => 6],
            ['name' => 'Events', 'slug' => 'events', 'sort_order' => 7],
        ] as $row) {
            Category::query()->create($row);
        }
    }

    public function test_create_page_includes_amenities_and_maps_key(): void
    {
        $this->seedCategories();
        Amenity::query()->create([
            'name' => 'Free Wi‑Fi',
            'slug' => 'wifi',
            'is_active' => true,
        ]);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('account.listings.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Listings/Form')
                ->has('categories', 7)
                ->has('amenities')
                ->has('mapsApiKey')
                ->has('allowedTiers'));
    }

    public function test_user_can_store_property_listing_with_category_fields(): void
    {
        Storage::fake('public');
        $this->seedCategories();

        $user = User::factory()->create();
        $category = Category::query()->where('slug', 'properties')->firstOrFail();
        $cover = UploadedFile::fake()->image('cover.jpg', 800, 600);

        $response = $this->actingAs($user)->post(route('account.listings.store'), [
            'title' => 'Cedar Grove Estate',
            'category_id' => $category->id,
            'subcategory' => 'For Sale',
            'property_type' => 'Villa',
            'location' => 'Timau',
            'city' => 'Nanyuki',
            'address' => 'Timau Road',
            'tagline' => 'Mountain views',
            'description' => '<p>Spacious villa</p>',
            'phone' => '0712345678',
            'latitude' => -0.072,
            'longitude' => 37.048,
            'tier' => 'free',
            'amenities' => json_encode(['parking', 'security']),
            'details' => json_encode([
                'bedrooms' => '4',
                'bathrooms' => '3',
                'price' => 'KES 18M',
                'payments' => ['Bank transfer'],
            ]),
            'cover' => $cover,
            'gallery_urls' => json_encode([]),
            'social_links' => json_encode([]),
        ]);

        $response->assertRedirect(route('account.index'));

        $listing = Listing::query()->where('title', 'Cedar Grove Estate')->first();
        $this->assertNotNull($listing);
        $this->assertSame('For Sale', $listing->subcategory);
        $this->assertSame('Villa', $listing->property_type);
        $this->assertSame('pending', $listing->status);
        $this->assertSame(['parking', 'security'], $listing->amenities);
        $this->assertSame('4', $listing->details['bedrooms']);
        $this->assertNotEmpty($listing->image_url);
        $this->assertEqualsWithDelta(-0.072, $listing->latitude, 0.0001);
    }

    public function test_user_can_store_event_listing(): void
    {
        Storage::fake('public');
        $this->seedCategories();

        $user = User::factory()->create();
        $category = Category::query()->where('slug', 'events')->firstOrFail();

        $this->actingAs($user)->post(route('account.listings.store'), [
            'title' => 'Nanyuki Jazz Night',
            'category_id' => $category->id,
            'subcategory' => 'Music & Entertainment',
            'location' => 'Nanyuki',
            'venue' => 'Town Terrace',
            'start_at' => '2026-10-01T19:00',
            'end_at' => '2026-10-01T22:00',
            'ticket_price' => 'From KES 1,200',
            'tier' => 'free',
            'details' => json_encode([
                'organiser' => 'Nanyuki Arts',
                'age_limit' => '18+',
                'payments' => ['M-Pesa', 'Cash'],
            ]),
            'amenities' => json_encode(['parking']),
            'cover' => UploadedFile::fake()->image('poster.jpg'),
            'gallery_urls' => json_encode([]),
            'social_links' => json_encode([]),
        ])->assertRedirect(route('account.index'));

        $listing = Listing::query()->where('title', 'Nanyuki Jazz Night')->first();
        $this->assertNotNull($listing);
        $this->assertSame('Town Terrace', $listing->venue);
        $this->assertSame('From KES 1,200', $listing->ticket_price);
        $this->assertNotNull($listing->start_at);
    }

    public function test_custom_amenity_can_be_created(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('account.amenities.store'), [
                'name' => 'Rooftop terrace',
                'category_key' => 'eatDrink',
            ])
            ->assertCreated()
            ->assertJsonPath('amenity.name', 'Rooftop terrace')
            ->assertJsonPath('amenity.category_key', 'eatDrink');

        $this->assertDatabaseHas('amenities', [
            'name' => 'Rooftop terrace',
            'category_key' => 'eatDrink',
        ]);
    }
}
