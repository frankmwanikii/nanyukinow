<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListingVerifiedBadgeTest extends TestCase
{
    use RefreshDatabase;

    private function makeListing(array $overrides = []): Listing
    {
        $category = Category::query()->firstOrCreate(
            ['slug' => 'eatDrink'],
            ['name' => 'Eat & Drink', 'sort_order' => 1],
        );

        return Listing::query()->create(array_merge([
            'user_id' => User::factory()->create()->id,
            'category_id' => $category->id,
            'title' => 'Verified Cafe',
            'slug' => 'verified-cafe-'.uniqid(),
            'location' => 'Nanyuki',
            'status' => 'published',
            'tier' => 'free',
            'claim_status' => 'claimed',
            'is_verified' => false,
            'is_published' => true,
            'published_at' => now(),
        ], $overrides));
    }

    public function test_listing_show_exposes_verified_flag(): void
    {
        $listing = $this->makeListing(['is_verified' => true]);

        $this->get(route('listings.show', $listing->slug))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Listings/Show')
                ->where('listing.is_verified', true));
    }

    public function test_admin_can_toggle_verified_badge(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $listing = $this->makeListing(['is_verified' => false]);

        $this->actingAs($admin)
            ->put(route('admin.listings.update', $listing), [
                'title' => $listing->title,
                'slug' => $listing->slug,
                'category_id' => $listing->category_id,
                'location' => 'Nanyuki',
                'status' => 'published',
                'tier' => 'free',
                'claim_status' => 'claimed',
                'is_verified' => true,
                'is_published' => true,
                'is_featured' => false,
                'is_trending' => false,
            ])
            ->assertRedirect();

        $this->assertTrue($listing->fresh()->is_verified);
    }
}
