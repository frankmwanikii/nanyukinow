<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountListingsIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_listings_index(): void
    {
        $this->get(route('account.listings.index'))
            ->assertRedirect(route('login'));
    }

    public function test_member_can_view_their_listings_index(): void
    {
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);

        $user = User::factory()->create();
        $other = User::factory()->create();

        Listing::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'My Lodge',
            'slug' => 'my-lodge',
            'location' => 'Nanyuki',
            'tier' => 'free',
            'status' => 'published',
            'claim_status' => 'claimed',
            'is_published' => true,
        ]);

        Listing::query()->create([
            'user_id' => $other->id,
            'category_id' => $category->id,
            'title' => 'Other Lodge',
            'slug' => 'other-lodge',
            'location' => 'Nanyuki',
            'tier' => 'free',
            'status' => 'published',
            'claim_status' => 'claimed',
            'is_published' => true,
        ]);

        $this->actingAs($user)
            ->get(route('account.listings.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Listings/Index')
                ->has('plan')
                ->has('listings', 1)
                ->where('listings.0.title', 'My Lodge'));
    }
}
