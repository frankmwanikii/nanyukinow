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
