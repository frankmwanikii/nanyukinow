<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListingDraftAutosaveTest extends TestCase
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

    public function test_draft_autosave_keeps_slug_stable_when_title_changes(): void
    {
        $this->seedCategories();
        $user = User::factory()->create(['plan' => 'free']);
        $category = Category::query()->where('slug', 'properties')->firstOrFail();

        $create = $this->actingAs($user)->postJson(route('account.listings.draft'), [
            'category_id' => $category->id,
            'title' => 'Untitled draft',
            'location' => 'Nanyuki',
            'tier' => 'free',
        ]);

        $create->assertOk();
        $slug = $create->json('listing.slug');

        $rename = $this->actingAs($user)->postJson(route('account.listings.draft.update', $slug), [
            'category_id' => $category->id,
            'title' => 'Cedar Apartment',
            'location' => 'Nanyuki',
            'tier' => 'free',
            'subcategory' => ['For Rent'],
            'property_type' => 'Apartment',
        ]);

        $rename->assertOk()
            ->assertJsonPath('listing.slug', $slug)
            ->assertJsonPath('listing.title', 'Cedar Apartment');

        $this->actingAs($user)->postJson(route('account.listings.draft.update', $slug), [
            'category_id' => $category->id,
            'title' => 'Cedar Apartment',
            'location' => 'Nanyuki, Timau',
            'tier' => 'free',
        ])->assertOk()
            ->assertJsonPath('listing.location', 'Nanyuki, Timau')
            ->assertJsonPath('listing.slug', $slug);
    }

    public function test_draft_autosave_accepts_long_geocoded_address(): void
    {
        $this->seedCategories();
        $user = User::factory()->create(['plan' => 'featured']);
        $category = Category::query()->where('slug', 'properties')->firstOrFail();

        $create = $this->actingAs($user)->postJson(route('account.listings.draft'), [
            'category_id' => $category->id,
            'title' => 'Untitled draft',
            'location' => 'Nanyuki',
            'tier' => 'featured',
        ]);
        $create->assertOk();
        $slug = $create->json('listing.slug');

        $longAddress = str_repeat('A', 300);

        $this->actingAs($user)->post(
            route('account.listings.draft.update', $slug),
            [
                'category_id' => $category->id,
                'title' => 'Untitled draft',
                'location' => 'Nanyuki',
                'tier' => 'featured',
                'address' => $longAddress,
                'latitude' => '-0.0167',
                'longitude' => '37.0742',
                'amenities' => '[]',
                'hours' => '[]',
                'details' => '{}',
                'social_links' => '{}',
                'gallery_urls' => '[]',
                'ticket_options' => '[]',
                'start_at' => '',
                'end_at' => '',
            ],
            ['Accept' => 'application/json'],
        )->assertOk()
            ->assertJsonPath('listing.address', str_repeat('A', 255));

        $listing = Listing::query()->where('slug', $slug)->firstOrFail();
        $this->assertSame(255, strlen((string) $listing->address));
        $this->assertNull($listing->start_at);
        $this->assertNull($listing->end_at);
    }
}
