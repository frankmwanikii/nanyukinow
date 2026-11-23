<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminListingMenuUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_upload_editor_media_for_menus(): void
    {
        Storage::fake('public');
        $admin = User::factory()->admin()->create();
        $image = UploadedFile::fake()->image('menu.jpg', 800, 1200);

        $this->actingAs($admin)
            ->postJson(route('admin.listings.editor-media'), [
                'image' => $image,
            ])
            ->assertCreated()
            ->assertJsonStructure(['url']);
    }

    public function test_admin_can_persist_eat_drink_menus_on_free_listing(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $category = Category::query()->create([
            'name' => 'Eat & Drink',
            'slug' => 'eatDrink',
            'sort_order' => 1,
        ]);

        $listing = Listing::query()->create([
            'title' => 'Shades Restaurant',
            'slug' => 'shades-restaurant-menus',
            'category_id' => $category->id,
            'status' => 'published',
            'tier' => 'free',
            'claim_status' => 'unclaimed',
            'is_published' => true,
            'priority' => 0,
            'details' => [],
        ]);

        $this->actingAs($admin)
            ->put(route('admin.listings.update', $listing), [
                'title' => 'Shades Restaurant',
                'slug' => 'shades-restaurant-menus',
                'category_id' => $category->id,
                'status' => 'published',
                'tier' => 'free',
                'claim_status' => 'unclaimed',
                'is_published' => true,
                'priority' => 0,
                'details' => json_encode([
                    'menus' => [
                        [
                            'title' => 'Lunch menu',
                            'images' => ['/storage/listings/editor/menu.webp'],
                        ],
                    ],
                ], JSON_THROW_ON_ERROR),
            ])
            ->assertRedirect();

        $listing->refresh();

        $this->assertSame('free', $listing->tier);
        $this->assertIsArray($listing->details['menus'] ?? null);
        $this->assertSame('Lunch menu', $listing->details['menus'][0]['title']);
        $this->assertSame(
            ['/storage/listings/editor/menu.webp'],
            $listing->details['menus'][0]['images'],
        );
    }
}
