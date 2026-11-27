<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListingPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_cannot_edit_another_members_listing(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $listing = $this->makeListing($owner);

        $this->actingAs($intruder)
            ->get(route('account.listings.edit', $listing))
            ->assertForbidden();
    }

    public function test_owner_can_edit_their_listing(): void
    {
        $owner = User::factory()->create();
        $listing = $this->makeListing($owner);

        $this->actingAs($owner)
            ->get(route('account.listings.edit', $listing))
            ->assertOk();
    }

    public function test_admin_can_edit_any_listing_via_policy(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->create(['is_admin' => true]);
        $listing = $this->makeListing($owner);

        $this->assertTrue($admin->can('update', $listing));
        $this->assertFalse($owner->can('update', $this->makeListing(User::factory()->create())));
    }

    private function makeListing(User $user): Listing
    {
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay-'.uniqid(),
            'sort_order' => 1,
        ]);

        return Listing::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Test Lodge',
            'slug' => 'test-lodge-'.uniqid(),
            'status' => 'draft',
            'tier' => 'free',
            'is_published' => false,
        ]);
    }
}
