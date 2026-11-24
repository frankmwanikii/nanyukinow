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
                'priority' => 2,
                'expires_at' => now()->addMonth()->format('Y-m-d H:i:s'),
                'gallery' => ['https://example.com/a.jpg'],
                'amenities' => ['WiFi', 'Parking'],
            ])
            ->assertRedirect();

        $listing = Listing::query()->where('slug', 'mount-kenya-lodge')->first();

        $this->assertNotNull($listing);
        $this->assertTrue($listing->is_featured);
        $this->assertEquals('featured', $listing->tier);
        $this->assertSame(2, $listing->priority);
        $this->assertNotNull($listing->expires_at);
    }

    public function test_admin_priority_and_plan_stay_in_sync(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::query()->create([
            'name' => 'Eat & Drink',
            'slug' => 'eatDrink',
            'sort_order' => 1,
        ]);

        $listing = Listing::query()->create([
            'title' => 'Frayo',
            'slug' => 'frayo',
            'category_id' => $category->id,
            'status' => 'published',
            'tier' => 'featured',
            'claim_status' => 'claimed',
            'is_published' => true,
            'is_featured' => true,
            'priority' => 2,
        ]);

        // Priority 4 = Promoted keeps the current plan.
        $this->actingAs($admin)
            ->put(route('admin.listings.update', $listing), [
                'title' => 'Frayo',
                'slug' => 'frayo',
                'category_id' => $category->id,
                'status' => 'published',
                'tier' => 'featured',
                'claim_status' => 'claimed',
                'is_published' => true,
                'is_featured' => true,
                'is_trending' => false,
                'priority' => 4,
            ])
            ->assertRedirect();

        $listing->refresh();
        $this->assertSame(4, $listing->priority);
        $this->assertSame('featured', $listing->tier);

        // Priority 3 upgrades plan to Premium.
        $this->actingAs($admin)
            ->put(route('admin.listings.update', $listing), [
                'title' => 'Frayo',
                'slug' => 'frayo',
                'category_id' => $category->id,
                'status' => 'published',
                'tier' => 'featured',
                'claim_status' => 'claimed',
                'is_published' => true,
                'is_featured' => true,
                'is_trending' => false,
                'priority' => 3,
            ])
            ->assertRedirect();

        $listing->refresh();
        $this->assertSame(3, $listing->priority);
        $this->assertSame('premium', $listing->tier);
        $this->assertTrue($listing->is_featured);

        // Priority 1 downgrades plan to Free.
        $this->actingAs($admin)
            ->put(route('admin.listings.update', $listing), [
                'title' => 'Frayo',
                'slug' => 'frayo',
                'category_id' => $category->id,
                'status' => 'published',
                'tier' => 'premium',
                'claim_status' => 'claimed',
                'is_published' => true,
                'is_featured' => true,
                'is_trending' => false,
                'priority' => 1,
            ])
            ->assertRedirect();

        $listing->refresh();
        $this->assertSame(1, $listing->priority);
        $this->assertSame('free', $listing->tier);
        $this->assertFalse($listing->is_featured);
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

    public function test_admin_listings_index_includes_owners_for_bulk_assign(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create(['name' => 'Amina Otieno', 'email' => 'amina@example.com']);

        $this->actingAs($admin)
            ->get(route('admin.listings.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Listings/Index')
                ->has('owners')
                ->where('owners', fn ($owners) => collect($owners)->contains(
                    fn ($owner) => ($owner['email'] ?? null) === 'amina@example.com',
                )));
    }

    public function test_admin_can_bulk_assign_listings_to_one_user(): void
    {
        $admin = User::factory()->admin()->create();
        $owner = User::factory()->create(['name' => 'Jane Wanjiru']);
        $category = Category::query()->first()
            ?? Category::query()->create([
                'name' => 'Stay',
                'slug' => 'stay-bulk-assign-'.uniqid(),
                'sort_order' => 1,
            ]);

        $suffix = uniqid();
        $first = Listing::query()->create([
            'title' => 'Lodge One',
            'slug' => 'lodge-one-'.$suffix,
            'category_id' => $category->id,
            'status' => 'published',
            'tier' => 'free',
            'claim_status' => 'unclaimed',
            'is_published' => true,
            'user_id' => null,
        ]);
        $second = Listing::query()->create([
            'title' => 'Lodge Two',
            'slug' => 'lodge-two-'.$suffix,
            'category_id' => $category->id,
            'status' => 'published',
            'tier' => 'free',
            'claim_status' => 'unclaimed',
            'is_published' => true,
            'user_id' => null,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.listings.bulk'), [
                'ids' => [$first->id, $second->id],
                'action' => 'assign',
                'user_id' => $owner->id,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSame($owner->id, $first->fresh()->user_id);
        $this->assertSame($owner->id, $second->fresh()->user_id);
    }

    public function test_bulk_assign_requires_user_id(): void
    {
        $admin = User::factory()->admin()->create();
        $listing = Listing::query()->create([
            'title' => 'Unowned Spot',
            'slug' => 'unowned-spot-'.uniqid(),
            'status' => 'published',
            'tier' => 'free',
            'claim_status' => 'unclaimed',
            'is_published' => true,
        ]);

        $this->actingAs($admin)
            ->from(route('admin.listings.index'))
            ->post(route('admin.listings.bulk'), [
                'ids' => [$listing->id],
                'action' => 'assign',
            ])
            ->assertRedirect(route('admin.listings.index'))
            ->assertSessionHasErrors('user_id');
    }
}
