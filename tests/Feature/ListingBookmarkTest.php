<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListingBookmarkTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_bookmark(): void
    {
        $listing = $this->makeListing();

        $this->postJson(route('listings.bookmark', $listing->slug), [
            'bookmarked' => true,
        ])->assertUnauthorized();
    }

    public function test_member_can_bookmark_and_see_on_bookmarks_page(): void
    {
        $user = User::factory()->create();
        $listing = $this->makeListing();

        $this->actingAs($user)
            ->postJson(route('listings.bookmark', $listing->slug), [
                'bookmarked' => true,
            ])
            ->assertOk()
            ->assertJson([
                'bookmarked' => true,
                'listingId' => $listing->id,
            ]);

        $this->assertDatabaseHas('listing_bookmarks', [
            'user_id' => $user->id,
            'listing_id' => $listing->id,
        ]);

        $this->actingAs($user)
            ->get(route('account.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Index')
                ->where('bookmarksCount', 1));

        $this->actingAs($user)
            ->get(route('account.bookmarks'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Bookmarks')
                ->has('bookmarks', 1)
                ->where('bookmarks.0.id', $listing->id));
    }

    public function test_member_can_remove_bookmark(): void
    {
        $user = User::factory()->create();
        $listing = $this->makeListing();
        $user->bookmarkedListings()->attach($listing->id);

        $this->actingAs($user)
            ->postJson(route('listings.bookmark', $listing->slug), [
                'bookmarked' => false,
            ])
            ->assertOk()
            ->assertJson(['bookmarked' => false]);

        $this->assertDatabaseMissing('listing_bookmarks', [
            'user_id' => $user->id,
            'listing_id' => $listing->id,
        ]);
    }

    public function test_member_can_remove_all_bookmarks(): void
    {
        $user = User::factory()->create();
        $first = $this->makeListing();
        $second = $this->makeListing([
            'title' => 'Second Lodge',
            'slug' => 'second-lodge',
        ]);
        $user->bookmarkedListings()->attach([$first->id, $second->id]);

        $this->actingAs($user)
            ->from(route('account.bookmarks'))
            ->delete(route('account.bookmarks.destroy-all'))
            ->assertRedirect(route('account.bookmarks'));

        $this->assertDatabaseMissing('listing_bookmarks', [
            'user_id' => $user->id,
            'listing_id' => $first->id,
        ]);
        $this->assertDatabaseMissing('listing_bookmarks', [
            'user_id' => $user->id,
            'listing_id' => $second->id,
        ]);

        $this->actingAs($user)
            ->get(route('account.bookmarks'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Bookmarks')
                ->has('bookmarks', 0));
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function makeListing(array $overrides = []): Listing
    {
        $category = Category::query()->firstOrCreate(
            ['slug' => 'stay'],
            [
                'name' => 'Stay',
                'sort_order' => 1,
            ],
        );

        return Listing::query()->create(array_merge([
            'category_id' => $category->id,
            'title' => 'Bookmark Lodge',
            'slug' => 'bookmark-lodge',
            'status' => 'published',
            'is_published' => true,
            'tier' => 'free',
            'priority' => 1,
        ], $overrides));
    }
}
