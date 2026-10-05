<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminListingDraftTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_autosave_and_update_listing_draft(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::query()->create([
            'name' => 'Eat & Drink',
            'slug' => 'eatDrink',
            'sort_order' => 1,
        ]);

        $create = $this->actingAs($admin)->postJson(route('admin.listings.draft'), [
            'category_id' => $category->id,
            'title' => 'Admin Cafe Draft',
            'location' => 'Nanyuki',
            'tier' => 'free',
        ]);

        $create->assertOk()->assertJsonPath('listing.status', 'draft');
        $id = $create->json('listing.id');
        $slug = $create->json('listing.slug');

        $this->assertNotNull($id);
        $this->assertNotEmpty($slug);

        $this->actingAs($admin)->postJson(route('admin.listings.draft.update', $slug), [
            'category_id' => $category->id,
            'title' => 'Admin Cafe Draft Updated',
            'location' => 'Nanyuki, Timau',
            'description' => '<p>Hello <strong>admin</strong></p>',
            'tier' => 'featured',
            'priority' => 2,
        ])->assertOk()
            ->assertJsonPath('listing.title', 'Admin Cafe Draft Updated')
            ->assertJsonPath('listing.location', 'Nanyuki, Timau')
            ->assertJsonPath('listing.description', '<p>Hello <strong>admin</strong></p>')
            ->assertJsonPath('listing.status', 'draft')
            ->assertJsonPath('listing.tier', 'featured');

        $this->assertDatabaseHas('listings', [
            'id' => $id,
            'status' => 'draft',
            'is_published' => false,
            'title' => 'Admin Cafe Draft Updated',
            'description' => '<p>Hello <strong>admin</strong></p>',
            'tier' => 'featured',
        ]);
    }

    public function test_admin_cannot_autosave_published_listing_via_draft_route(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);

        $listing = Listing::query()->create([
            'title' => 'Published Stay',
            'slug' => 'published-stay',
            'category_id' => $category->id,
            'status' => 'published',
            'tier' => 'free',
            'claim_status' => 'unclaimed',
            'is_published' => true,
            'priority' => 1,
        ]);

        $this->actingAs($admin)->postJson(route('admin.listings.draft.update', $listing), [
            'category_id' => $category->id,
            'title' => 'Should Not Save',
            'tier' => 'free',
        ])->assertStatus(422);

        $this->assertDatabaseHas('listings', [
            'id' => $listing->id,
            'title' => 'Published Stay',
            'status' => 'published',
        ]);
    }
}
