<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use App\Support\ListingSlug;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListingSlugTest extends TestCase
{
    use RefreshDatabase;

    public function test_placeholder_slugs_are_detected(): void
    {
        $this->assertTrue(ListingSlug::isPlaceholder('untitled-draft-draft-2'));
        $this->assertTrue(ListingSlug::isPlaceholder('frayo-draft-5'));
        $this->assertTrue(ListingSlug::isPlaceholder(''));
        $this->assertFalse(ListingSlug::isPlaceholder('frayo'));
        $this->assertFalse(ListingSlug::isPlaceholder('sportsman-arms-hotel'));
    }

    public function test_slug_is_built_from_listing_title(): void
    {
        $this->assertSame('frayo', ListingSlug::make('Frayo'));
        $this->assertSame('test-airbnb', ListingSlug::make('Test Airbnb'));
    }

    public function test_admin_save_replaces_draft_slug_with_title(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);

        $listing = Listing::query()->create([
            'user_id' => $admin->id,
            'category_id' => $category->id,
            'title' => 'Frayo',
            'slug' => 'untitled-draft-draft-2',
            'location' => 'Nanyuki',
            'status' => 'published',
            'tier' => 'free',
            'is_published' => true,
            'claim_status' => 'claimed',
        ]);

        $this->actingAs($admin)
            ->put(route('admin.listings.update', $listing->slug), [
                'title' => 'Frayo',
                'slug' => 'untitled-draft-draft-2',
                'category_id' => $category->id,
                'status' => 'published',
                'tier' => 'free',
                'claim_status' => 'claimed',
                'is_published' => true,
                'is_featured' => false,
                'is_trending' => false,
                'priority' => 0,
                'location' => 'Nanyuki',
                'gallery' => [],
                'amenities' => [],
            ])
            ->assertRedirect();

        $listing->refresh();
        $this->assertSame('frayo', $listing->slug);

        $this->get(route('listings.show', 'frayo'))->assertOk();
    }
}
