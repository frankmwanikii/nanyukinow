<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminListingTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_listing_with_expiry(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.listings.store'), [
                'title' => 'Mount Kenya Lodge',
                'slug' => 'mount-kenya-lodge',
                'category_id' => $category->id,
                'status' => 'published',
                'tier' => 'featured',
                'claim_status' => 'unclaimed',
                'is_published' => true,
                'is_featured' => true,
                'is_trending' => false,
                'priority' => 1,
                'expires_at' => now()->addMonth()->format('Y-m-d H:i:s'),
                'gallery' => ['https://example.com/a.jpg'],
                'amenities' => ['WiFi', 'Parking'],
            ])
            ->assertRedirect();

        $listing = Listing::query()->where('slug', 'mount-kenya-lodge')->first();

        $this->assertNotNull($listing);
        $this->assertTrue($listing->is_featured);
        $this->assertEquals('featured', $listing->tier);
        $this->assertSame(1, $listing->priority);
        $this->assertNotNull($listing->expires_at);
    }

    public function test_admin_listings_index_filters_expired(): void
    {
        $admin = User::factory()->admin()->create();

        Listing::query()->create([
            'title' => 'Expired Spot',
            'slug' => 'expired-spot',
            'status' => 'published',
            'tier' => 'free',
            'claim_status' => 'unclaimed',
            'is_published' => true,
            'expires_at' => now()->subDay(),
        ]);

        Listing::query()->create([
            'title' => 'Fresh Spot',
            'slug' => 'fresh-spot',
            'status' => 'published',
            'tier' => 'free',
            'claim_status' => 'unclaimed',
            'is_published' => true,
            'expires_at' => now()->addMonth(),
        ]);

        $this->actingAs($admin)
            ->get(route('admin.listings.index', ['expiry' => 'expired']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Listings/Index')
                ->has('listings.data', 1)
                ->where('listings.data.0.slug', 'expired-spot'));
    }
}
