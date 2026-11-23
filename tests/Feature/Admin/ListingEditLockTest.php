<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use App\Support\ListingEditLock;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ListingEditLockTest extends TestCase
{
    use RefreshDatabase;

    public function test_opening_edit_acquires_lock_for_current_admin(): void
    {
        [$admin, $listing] = $this->adminAndListing();

        $this->actingAs($admin)
            ->get(route('admin.listings.edit', $listing))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Listings/Form')
                ->where('editLock.held', true)
                ->where('editLock.editor.id', $admin->id)
                ->where('editLock.editor.name', $admin->name)
                ->has('editLock.token')
            );
    }

    public function test_second_admin_sees_who_is_editing_and_cannot_save(): void
    {
        [$adminA, $listing] = $this->adminAndListing('Alice Admin');
        $adminB = User::factory()->admin()->create(['name' => 'Bob Admin']);

        $lock = ListingEditLock::acquire($listing, $adminA);
        $this->assertTrue($lock['held']);

        $this->actingAs($adminB)
            ->get(route('admin.listings.edit', $listing))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('editLock.held', false)
                ->where('editLock.editor.name', 'Alice Admin')
            );

        $this->actingAs($adminB)
            ->put(route('admin.listings.update', $listing), [
                'title' => 'Changed by Bob',
                'slug' => $listing->slug,
                'category_id' => $listing->category_id,
                'status' => 'published',
                'tier' => 'featured',
                'claim_status' => 'claimed',
                'is_published' => true,
                'is_featured' => true,
                'is_trending' => false,
                'priority' => 2,
            ])
            ->assertRedirect(route('admin.listings.edit', $listing))
            ->assertSessionHas('error');

        $this->assertSame('Forest Lodge', $listing->fresh()->title);
    }

    public function test_heartbeat_keeps_lock_and_release_frees_it(): void
    {
        [$adminA, $listing] = $this->adminAndListing('Alice Admin');
        $adminB = User::factory()->admin()->create(['name' => 'Bob Admin']);

        $lock = ListingEditLock::acquire($listing, $adminA);

        $this->actingAs($adminA)
            ->postJson(route('admin.listings.edit-lock', $listing), [
                'token' => $lock['token'],
            ])
            ->assertOk()
            ->assertJson([
                'held' => true,
                'token' => $lock['token'],
            ]);

        $this->actingAs($adminB)
            ->postJson(route('admin.listings.edit-lock', $listing))
            ->assertStatus(409)
            ->assertJson([
                'held' => false,
                'editor' => [
                    'name' => 'Alice Admin',
                ],
            ]);

        $this->actingAs($adminA)
            ->post(route('admin.listings.edit-lock.release', $listing), [
                'token' => $lock['token'],
            ])
            ->assertOk();

        $this->actingAs($adminB)
            ->postJson(route('admin.listings.edit-lock', $listing))
            ->assertOk()
            ->assertJson([
                'held' => true,
                'editor' => [
                    'id' => $adminB->id,
                    'name' => 'Bob Admin',
                ],
            ]);
    }

    public function test_listings_index_shows_who_is_editing(): void
    {
        [$admin, $listing] = $this->adminAndListing('Alice Admin');
        ListingEditLock::acquire($listing, $admin);

        $this->actingAs($admin)
            ->get(route('admin.listings.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Listings/Index')
                ->has('listings.data', 1)
                ->where('listings.data.0.editing_by.name', 'Alice Admin')
                ->where('listings.data.0.editing_by.id', $admin->id)
            );
    }

    public function test_bulk_skips_listings_locked_by_another_admin(): void
    {
        [$adminA, $listing] = $this->adminAndListing('Alice Admin');
        $adminB = User::factory()->admin()->create(['name' => 'Bob Admin']);
        ListingEditLock::acquire($listing, $adminA);

        $this->actingAs($adminB)
            ->post(route('admin.listings.bulk'), [
                'ids' => [$listing->id],
                'action' => 'archive',
            ])
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertSame('published', $listing->fresh()->status);
        $this->assertTrue((bool) $listing->fresh()->is_published);
    }

    public function test_expired_lock_can_be_taken_by_another_admin(): void
    {
        [$adminA, $listing] = $this->adminAndListing('Alice Admin');
        $adminB = User::factory()->admin()->create(['name' => 'Bob Admin']);

        ListingEditLock::acquire($listing, $adminA);
        Cache::forget(ListingEditLock::cacheKey($listing->id));

        $this->actingAs($adminB)
            ->get(route('admin.listings.edit', $listing))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('editLock.held', true)
                ->where('editLock.editor.id', $adminB->id)
            );
    }

    /**
     * @return array{0: User, 1: Listing}
     */
    private function adminAndListing(string $adminName = 'Admin'): array
    {
        $admin = User::factory()->admin()->create(['name' => $adminName]);
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);
        $listing = Listing::query()->create([
            'title' => 'Forest Lodge',
            'slug' => 'forest-lodge',
            'category_id' => $category->id,
            'status' => 'published',
            'tier' => 'featured',
            'claim_status' => 'claimed',
            'is_published' => true,
            'is_featured' => true,
            'priority' => 2,
        ]);

        return [$admin, $listing];
    }
}
