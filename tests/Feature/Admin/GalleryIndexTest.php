<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GalleryIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_gallery_index_returns_every_matching_image_in_one_page(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);

        $gallery = [];
        for ($i = 1; $i <= 40; $i++) {
            $gallery[] = '/storage/listings/gallery/sportsman-unique-'.$i.'.jpg';
        }

        Listing::query()->create([
            'title' => 'Sportsman Arms Unique Gallery',
            'slug' => 'sportsman-arms-unique-gallery',
            'category_id' => $category->id,
            'user_id' => $admin->id,
            'location' => 'Nanyuki',
            'status' => 'published',
            'tier' => 'featured',
            'is_published' => true,
            'gallery' => $gallery,
            'image_url' => '/storage/listings/covers/sportsman-unique-cover.jpg',
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.gallery.index', [
                'q' => 'sportsman-unique',
                'per_page' => 10,
            ]));

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Gallery/Index')
                ->has('media.data', 41)
                ->where('media.total', 41)
                ->where('media.last_page', 1)
                ->where('media.current_page', 1));
    }

    public function test_admin_gallery_defaults_to_newest_first_and_can_sort_by_name(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);

        $older = Listing::query()->create([
            'title' => 'Older Sort Listing',
            'slug' => 'older-sort-listing',
            'category_id' => $category->id,
            'user_id' => $admin->id,
            'location' => 'Nanyuki',
            'status' => 'published',
            'tier' => 'featured',
            'is_published' => true,
            'image_url' => '/storage/listings/covers/aaa-older-cover.jpg',
            'updated_at' => now()->subDay(),
        ]);
        $older->forceFill(['updated_at' => now()->subDay()])->save();

        $newer = Listing::query()->create([
            'title' => 'Newer Sort Listing',
            'slug' => 'newer-sort-listing',
            'category_id' => $category->id,
            'user_id' => $admin->id,
            'location' => 'Nanyuki',
            'status' => 'published',
            'tier' => 'featured',
            'is_published' => true,
            'image_url' => '/storage/listings/covers/zzz-newer-cover.jpg',
            'updated_at' => now(),
        ]);
        $newer->forceFill(['updated_at' => now()])->save();

        $newest = $this->actingAs($admin)
            ->get(route('admin.gallery.index', [
                'q' => 'cover.jpg',
                'sort' => 'newest',
            ]));

        $newest->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Gallery/Index')
                ->where('filters.sort', 'newest')
                ->where('media.data.0.url', '/storage/listings/covers/zzz-newer-cover.jpg')
                ->where('media.data.1.url', '/storage/listings/covers/aaa-older-cover.jpg'));

        $byName = $this->actingAs($admin)
            ->get(route('admin.gallery.index', [
                'q' => 'cover.jpg',
                'sort' => 'name',
            ]));

        $byName->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Gallery/Index')
                ->where('filters.sort', 'name')
                ->where('media.data.0.url', '/storage/listings/covers/aaa-older-cover.jpg')
                ->where('media.data.1.url', '/storage/listings/covers/zzz-newer-cover.jpg'));
    }

    public function test_admin_gallery_browse_returns_every_matching_image(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);

        $gallery = [];
        for ($i = 1; $i <= 60; $i++) {
            $gallery[] = '/storage/listings/gallery/nanyuki-club-unique-'.$i.'.jpg';
        }

        Listing::query()->create([
            'title' => 'Nanyuki Club Unique Gallery',
            'slug' => 'nanyuki-club-unique-gallery',
            'category_id' => $category->id,
            'user_id' => $admin->id,
            'location' => 'Nanyuki',
            'status' => 'published',
            'tier' => 'premium',
            'is_published' => true,
            'gallery' => $gallery,
        ]);

        $this->actingAs($admin)
            ->getJson(route('admin.gallery.browse', [
                'q' => 'nanyuki-club-unique',
                'limit' => 12,
            ]))
            ->assertOk()
            ->assertJsonPath('total', 60)
            ->assertJsonCount(60, 'items');
    }
}
