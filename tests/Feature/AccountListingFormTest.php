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
            'subcategory' => json_encode(['For Sale']),
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

        $response->assertRedirect(route('account.listings.index'));

        $listing = Listing::query()->where('title', 'Cedar Grove Estate')->first();
        $this->assertNotNull($listing);
        $this->assertSame(['For Sale'], $listing->subcategory);
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

        $user = User::factory()->create([
            'plan' => 'featured',
        ]);
        $category = Category::query()->where('slug', 'events')->firstOrFail();

        $this->actingAs($user)->post(route('account.listings.store'), [
            'title' => 'Nanyuki Jazz Night',
            'category_id' => $category->id,
            'subcategory' => json_encode(['Music & Entertainment']),
            'location' => 'Nanyuki',
            'venue' => 'Town Terrace',
            'start_at' => '2026-10-01T19:00',
            'end_at' => '2026-10-01T22:00',
            'ticket_options' => json_encode([
                ['name' => 'General admission', 'amount' => 1200],
            ]),
            'tier' => 'featured',
            'details' => json_encode([
                'organiser' => 'Nanyuki Arts',
                'age_limit' => '18+',
                'payments' => ['M-Pesa', 'Cash'],
            ]),
            'amenities' => json_encode(['parking']),
            'cover' => UploadedFile::fake()->image('poster.jpg'),
            'gallery_urls' => json_encode([]),
            'social_links' => json_encode([]),
        ])->assertRedirect(route('account.listings.index'));

        $listing = Listing::query()->where('title', 'Nanyuki Jazz Night')->first();
        $this->assertNotNull($listing);
        $this->assertSame('Town Terrace', $listing->venue);
        $this->assertSame([
            ['name' => 'General admission', 'amount' => 1200],
        ], $listing->ticket_options);
        $this->assertSame('KES 1,200', $listing->ticket_price);
        $this->assertNotNull($listing->start_at);
    }

    public function test_listing_edit_page_uses_slug_in_url(): void
    {
        $this->seedCategories();
        $user = User::factory()->create();
        $category = Category::query()->where('slug', 'stay')->firstOrFail();

        $listing = Listing::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Frayo',
            'slug' => 'frayo',
            'status' => 'published',
            'is_published' => true,
            'tier' => 'free',
            'priority' => 0,
        ]);

        $this->actingAs($user)
            ->get(route('account.listings.edit', $listing->slug))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Listings/Form')
                ->where('listing.slug', 'frayo')
                ->where('listing.title', 'Frayo'));

        $this->assertStringContainsString(
            '/account/listings/frayo/edit',
            route('account.listings.edit', $listing->slug),
        );
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

    public function test_user_can_upload_editor_image(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $image = UploadedFile::fake()->image('inline.jpg', 640, 480);

        $response = $this->actingAs($user)
            ->postJson(route('account.listings.editor-media'), [
                'image' => $image,
            ]);

        $response->assertCreated()->assertJsonStructure(['url']);
        $url = $response->json('url');
        $this->assertStringStartsWith('/storage/listings/editor/', $url);
        Storage::disk('public')->assertExists(
            str_replace('/storage/', '', $url),
        );
    }

    public function test_place_search_includes_local_listings(): void
    {
        $this->seedCategories();
        $user = User::factory()->create();
        $category = Category::query()->where('slug', 'stay')->firstOrFail();

        Listing::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Sportsman Arms Hotel',
            'slug' => 'sportsman-arms-hotel-test',
            'location' => 'Nanyuki',
            'city' => 'Nanyuki',
            'address' => 'Mount Kenya Road',
            'latitude' => 0.0145,
            'longitude' => 37.082,
            'status' => 'published',
            'is_published' => true,
            'tier' => 'free',
        ]);

        $this->actingAs($user)
            ->getJson(route('account.places.search', ['q' => 'Sportsman']))
            ->assertOk()
            ->assertJsonPath('results.0.structured_formatting.main_text', 'Sportsman Arms Hotel')
            ->assertJsonPath('results.0.source', 'local')
            ->assertJsonPath('results.0.badge', null);
    }

    public function test_draft_listing_is_created_and_updated(): void
    {
        $this->seedCategories();
        $user = User::factory()->create();
        $category = Category::query()->where('slug', 'eatDrink')->firstOrFail();

        $create = $this->actingAs($user)->postJson(route('account.listings.draft'), [
            'category_id' => $category->id,
            'title' => 'My Cafe Draft',
            'location' => 'Nanyuki',
            'tier' => 'free',
        ]);

        $create->assertOk()->assertJsonPath('listing.status', 'draft');
        $id = $create->json('listing.id');
        $slug = $create->json('listing.slug');
        $this->assertNotNull($id);
        $this->assertNotEmpty($slug);

        $this->actingAs($user)->postJson(route('account.listings.draft.update', $slug), [
            'category_id' => $category->id,
            'title' => 'My Cafe Draft Updated',
            'location' => 'Nanyuki, Timau',
            'description' => '<p>Hello <strong>world</strong></p>',
            'tier' => 'free',
        ])->assertOk()
            ->assertJsonPath('listing.title', 'My Cafe Draft Updated')
            ->assertJsonPath('listing.location', 'Nanyuki, Timau')
            ->assertJsonPath('listing.description', '<p>Hello <strong>world</strong></p>')
            ->assertJsonPath('listing.status', 'draft');

        $this->assertDatabaseHas('listings', [
            'id' => $id,
            'status' => 'draft',
            'is_published' => false,
            'title' => 'My Cafe Draft Updated',
            'description' => '<p>Hello <strong>world</strong></p>',
        ]);
    }

    public function test_draft_media_upload_persists_real_storage_paths(): void
    {
        Storage::fake('public');
        $this->seedCategories();

        $user = User::factory()->create(['plan' => 'featured']);
        $category = Category::query()->where('slug', 'eatDrink')->firstOrFail();

        $response = $this->actingAs($user)->postJson(route('account.listings.draft'), [
            'category_id' => $category->id,
            'title' => 'Media Cafe',
            'location' => 'Nanyuki',
            'tier' => 'featured',
            'cover' => UploadedFile::fake()->image('cover.jpg', 800, 600),
            'logo' => UploadedFile::fake()->image('logo.png', 200, 200),
            'image_url' => 'blob:https://example.test/preview-cover',
            'logo_url' => '/storage/',
        ]);

        $response->assertOk();

        $imageUrl = $response->json('listing.image_url');
        $logoUrl = $response->json('listing.logo_url');

        $this->assertIsString($imageUrl);
        $this->assertIsString($logoUrl);
        $this->assertStringStartsWith('/storage/listings/covers/', $imageUrl);
        $this->assertStringStartsWith('/storage/listings/logos/', $logoUrl);
        $this->assertNotSame('/storage/', $imageUrl);
        $this->assertNotSame('/storage/', $logoUrl);

        Storage::disk('public')->assertExists(str_replace('/storage/', '', $imageUrl));
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $logoUrl));

        $listing = Listing::query()->findOrFail($response->json('listing.id'));
        $this->assertSame($imageUrl, $listing->image_url);
        $this->assertSame($logoUrl, $listing->logo_url);
    }

    public function test_draft_rejects_incomplete_media_urls_without_files(): void
    {
        $this->seedCategories();
        $user = User::factory()->create();
        $category = Category::query()->where('slug', 'eatDrink')->firstOrFail();

        $response = $this->actingAs($user)->postJson(route('account.listings.draft'), [
            'category_id' => $category->id,
            'title' => 'Broken Media Draft',
            'location' => 'Nanyuki',
            'tier' => 'free',
            'image_url' => '/storage/',
            'logo_url' => 'blob:https://example.test/x',
            'event_poster_url' => '/storage',
        ]);

        $response->assertOk()
            ->assertJsonPath('listing.image_url', null)
            ->assertJsonPath('listing.logo_url', null)
            ->assertJsonPath('listing.event_poster_url', null);
    }
}
