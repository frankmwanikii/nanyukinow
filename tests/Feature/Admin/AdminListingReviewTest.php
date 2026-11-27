<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Listing;
use App\Models\ListingReview;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AdminListingReviewTest extends TestCase
{
    use RefreshDatabase;

    private function makeListing(): Listing
    {
        $category = Category::query()->firstOrCreate(
            ['slug' => 'things-to-do'],
            ['name' => 'Things to do', 'sort_order' => 1],
        );

        return Listing::query()->create([
            'user_id' => User::factory()->create()->id,
            'category_id' => $category->id,
            'title' => 'Ol Pejeta Conservancy',
            'slug' => 'ol-pejeta-conservancy-'.uniqid(),
            'location' => 'Nanyuki',
            'status' => 'published',
            'tier' => 'premium',
            'is_published' => true,
            'published_at' => now(),
        ]);
    }

    private function admin(): User
    {
        return User::factory()->create(['is_admin' => true]);
    }

    public function test_guest_cannot_view_reviews_admin(): void
    {
        $this->get(route('admin.reviews.index'))->assertRedirect();
    }

    public function test_admin_can_view_all_reviews_including_unpublished(): void
    {
        $listing = $this->makeListing();
        $member = User::factory()->create(['name' => 'Amina Wanjiku']);

        ListingReview::factory()->published()->create([
            'listing_id' => $listing->id,
            'user_id' => User::factory()->create()->id,
            'rating' => 4,
            'body' => 'Already live review.',
        ]);

        $pending = ListingReview::factory()->unpublished()->create([
            'listing_id' => $listing->id,
            'user_id' => $member->id,
            'rating' => 5,
            'body' => 'Pending wildlife review.',
        ]);

        $this->actingAs($this->admin())
            ->get(route('admin.reviews.index', ['status' => 'all']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Reviews/Index')
                ->has('reviews.data', 2)
                ->where('counts.unpublished', 1)
                ->where('counts.published', 1)
                ->where('counts.all', 2));

        $this->actingAs($this->admin())
            ->get(route('admin.reviews.index', ['status' => 'unpublished']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Reviews/Index')
                ->has('reviews.data', 1)
                ->where('reviews.data.0.id', $pending->id)
                ->where('reviews.data.0.rating', 5)
                ->where('reviews.data.0.body', 'Pending wildlife review.')
                ->where('reviews.data.0.author.name', 'Amina Wanjiku')
                ->where('reviews.data.0.is_published', false));
    }

    public function test_admin_can_publish_unpublish_and_delete_a_review(): void
    {
        $listing = $this->makeListing();
        $review = ListingReview::factory()->unpublished()->create([
            'listing_id' => $listing->id,
            'user_id' => User::factory()->create()->id,
            'rating' => 5,
            'body' => 'Needs approval.',
        ]);

        $admin = $this->admin();

        $this->actingAs($admin)
            ->post(route('admin.reviews.publish', $review))
            ->assertRedirect();

        $this->assertTrue($review->fresh()->is_published);
        $this->assertSame(5.0, (float) $listing->fresh()->rating);

        $this->actingAs($admin)
            ->post(route('admin.reviews.unpublish', $review))
            ->assertRedirect();

        $this->assertFalse($review->fresh()->is_published);
        $this->assertNull($listing->fresh()->rating);

        $this->actingAs($admin)
            ->delete(route('admin.reviews.destroy', $review))
            ->assertRedirect();

        $this->assertDatabaseMissing('listing_reviews', ['id' => $review->id]);
    }

    public function test_dashboard_includes_recent_reviews_section(): void
    {
        $listing = $this->makeListing();
        ListingReview::factory()->unpublished()->create([
            'listing_id' => $listing->id,
            'user_id' => User::factory()->create()->id,
            'rating' => 3,
            'body' => 'Dashboard review row.',
        ]);

        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Dashboard')
                ->where('stats.pending_reviews', 1)
                ->has('recentReviews', 1)
                ->where('recentReviews.0.body', 'Dashboard review row.'));
    }
}
