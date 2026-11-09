<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\ListingReview;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListingReviewTest extends TestCase
{
    use RefreshDatabase;

    private function makeListing(array $overrides = []): Listing
    {
        $category = Category::query()->create([
            'name' => 'Things to do',
            'slug' => 'things-to-do',
            'sort_order' => 1,
        ]);

        return Listing::query()->create(array_merge([
            'user_id' => User::factory()->create()->id,
            'category_id' => $category->id,
            'title' => 'Ol Pejeta Conservancy',
            'slug' => 'ol-pejeta-conservancy',
            'location' => 'Nanyuki',
            'status' => 'published',
            'tier' => 'premium',
            'is_published' => true,
            'published_at' => now(),
        ], $overrides));
    }

    public function test_guests_are_redirected_when_posting_a_review(): void
    {
        $listing = $this->makeListing();

        $this->post(route('listings.reviews.store', $listing), [
            'rating' => 5,
            'body' => 'Wonderful wildlife experience.',
        ])->assertRedirect(route('login'));

        $this->assertDatabaseCount('listing_reviews', 0);
    }

    public function test_authenticated_member_can_post_a_review(): void
    {
        $listing = $this->makeListing();
        $member = User::factory()->create();

        $this->actingAs($member)
            ->post(route('listings.reviews.store', $listing), [
                'rating' => 5,
                'body' => 'Wonderful wildlife experience.',
            ])
            ->assertRedirect(route('listings.show', $listing->slug).'#reviews');

        $this->assertDatabaseHas('listing_reviews', [
            'listing_id' => $listing->id,
            'user_id' => $member->id,
            'rating' => 5,
            'body' => 'Wonderful wildlife experience.',
        ]);

        $this->assertSame(5.0, (float) $listing->fresh()->rating);
    }

    public function test_listing_show_includes_reviews_payload(): void
    {
        $listing = $this->makeListing();
        $member = User::factory()->create(['name' => 'Amina Wanjiku']);

        ListingReview::query()->create([
            'listing_id' => $listing->id,
            'user_id' => $member->id,
            'rating' => 4,
            'body' => 'Great guides and open savannahs.',
        ]);

        ListingReview::syncListingRating($listing);

        $this->get(route('listings.show', $listing->slug))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Listings/Show')
                ->where('listing.reviewSummary.count', 1)
                ->where('listing.reviews.0.name', 'Amina Wanjiku')
                ->where('listing.reviews.0.rating', 4)
                ->where('listing.reviews.0.body', 'Great guides and open savannahs.')
                ->where('listing.rating', 4)
            );
    }

    public function test_review_requires_rating_and_body(): void
    {
        $listing = $this->makeListing();
        $member = User::factory()->create();

        $this->actingAs($member)
            ->from(route('listings.show', ['slug' => $listing->slug, 'tab' => 'reviews']))
            ->post(route('listings.reviews.store', $listing), [])
            ->assertRedirect(route('listings.show', ['slug' => $listing->slug, 'tab' => 'reviews']))
            ->assertSessionHasErrors(['rating', 'body']);
    }

    public function test_review_rejects_body_over_400_words(): void
    {
        $listing = $this->makeListing();
        $member = User::factory()->create();
        $body = implode(' ', array_fill(0, 401, 'wildlife'));

        $this->actingAs($member)
            ->from(route('listings.show', ['slug' => $listing->slug, 'tab' => 'reviews']))
            ->post(route('listings.reviews.store', $listing), [
                'rating' => 5,
                'body' => $body,
            ])
            ->assertRedirect(route('listings.show', ['slug' => $listing->slug, 'tab' => 'reviews']))
            ->assertSessionHasErrors([
                'body' => 'Reviews can be at most 400 words.',
            ]);

        $this->assertDatabaseCount('listing_reviews', 0);
    }

    public function test_member_cannot_review_same_listing_twice(): void
    {
        $listing = $this->makeListing();
        $member = User::factory()->create();

        ListingReview::query()->create([
            'listing_id' => $listing->id,
            'user_id' => $member->id,
            'rating' => 4,
            'body' => 'Already left feedback here.',
        ]);

        $this->actingAs($member)
            ->from(route('listings.show', ['slug' => $listing->slug, 'tab' => 'reviews']))
            ->post(route('listings.reviews.store', $listing), [
                'rating' => 5,
                'body' => 'Trying to post another review.',
            ])
            ->assertRedirect(route('listings.show', ['slug' => $listing->slug, 'tab' => 'reviews']))
            ->assertSessionHasErrors('body');

        $this->assertDatabaseCount('listing_reviews', 1);
    }

    public function test_owner_cannot_review_own_listing(): void
    {
        $owner = User::factory()->create();
        $listing = $this->makeListing(['user_id' => $owner->id]);

        $this->actingAs($owner)
            ->from(route('listings.show', ['slug' => $listing->slug, 'tab' => 'reviews']))
            ->post(route('listings.reviews.store', $listing), [
                'rating' => 5,
                'body' => 'This is my own place honestly.',
            ])
            ->assertRedirect(route('listings.show', ['slug' => $listing->slug, 'tab' => 'reviews']))
            ->assertSessionHasErrors('body');

        $this->assertDatabaseCount('listing_reviews', 0);
    }
}
