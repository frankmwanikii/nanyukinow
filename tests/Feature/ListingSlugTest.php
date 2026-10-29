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

    public function test_generic_fallback_slugs_are_detected(): void
    {
        $this->assertTrue(ListingSlug::isGeneric('listing'));
        $this->assertTrue(ListingSlug::isGeneric('listing-2'));
        $this->assertFalse(ListingSlug::isGeneric('listing-two'));
        $this->assertFalse(ListingSlug::isGeneric('frayo'));
    }

    public function test_slug_is_built_from_listing_title(): void
    {
        $this->assertSame('frayo', ListingSlug::make('Frayo'));
        $this->assertSame('test-airbnb', ListingSlug::make('Test Airbnb'));
    }

    public function test_generic_fallback_slug_is_replaced_by_the_title(): void
    {
        $this->assertSame('fraittech', ListingSlug::make('Fraittech', null, 'listing-2'));
        $this->assertSame('frayo', ListingSlug::make('Frayo', null, 'listing'));
    }

    public function test_slug_follows_the_title_when_the_listing_is_renamed(): void
    {
        $listing = $this->listing(title: 'Fraittech', slug: 'fraittech');

        $this->actingAs($listing->user)
            ->put(route('account.listings.update', $listing->slug), [
                'title' => 'Fraittech Tech',
                'category_id' => $listing->category_id,
                'location' => 'Nanyuki',
                'tier' => 'free',
            ])
            ->assertRedirect();

        $listing->refresh();
        $this->assertSame('fraittech-tech', $listing->slug);
    }

    public function test_custom_slug_is_preserved_when_the_listing_is_renamed(): void
    {
        $listing = $this->listing(title: 'Fraittech', slug: 'fraittech-nairobi');

        $this->actingAs($listing->user)
            ->put(route('account.listings.update', $listing->slug), [
                'title' => 'Fraittech Tech',
                'category_id' => $listing->category_id,
                'location' => 'Nanyuki',
                'tier' => 'free',
            ])
            ->assertRedirect();

        $listing->refresh();
        $this->assertSame('fraittech-nairobi', $listing->slug);
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

    public function test_admin_save_replaces_generic_slug_with_title(): void
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
            'title' => 'Fraittech',
            'slug' => 'listing-2',
            'location' => 'Nanyuki',
            'status' => 'published',
            'tier' => 'free',
            'is_published' => true,
            'claim_status' => 'claimed',
        ]);

        $this->actingAs($admin)
            ->put(route('admin.listings.update', $listing->slug), [
                'title' => 'Fraittech',
                'slug' => 'listing-2',
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
        $this->assertSame('fraittech', $listing->slug);

        $this->get(route('listings.show', 'fraittech'))->assertOk();
    }

    private function listing(string $title, string $slug): Listing
    {
        $user = User::factory()->create();
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);

        return Listing::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => $title,
            'slug' => $slug,
            'location' => 'Nanyuki',
            'status' => 'published',
            'tier' => 'free',
            'is_published' => true,
            'claim_status' => 'claimed',
        ]);
    }
}
