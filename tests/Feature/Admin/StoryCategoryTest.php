<?php

namespace Tests\Feature\Admin;

use App\Models\Story;
use App\Models\StoryCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoryCategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_and_update_story_category(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.story-categories.store'), [
                'name' => 'Travel Tips',
                'sort_order' => 1,
            ])
            ->assertRedirect();

        $category = StoryCategory::query()->where('slug', 'travel-tips')->first();
        $this->assertNotNull($category);

        $this->actingAs($admin)
            ->put(route('admin.story-categories.update', $category), [
                'name' => 'Travel Guides',
                'sort_order' => 2,
            ])
            ->assertRedirect();

        $category->refresh();
        $this->assertSame('Travel Guides', $category->name);
        $this->assertSame('travel-guides', $category->slug);
        $this->assertSame(2, $category->sort_order);
    }

    public function test_renaming_category_syncs_story_labels(): void
    {
        $admin = User::factory()->admin()->create();
        $category = StoryCategory::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);
        $story = Story::factory()->withCategory($category)->create([
            'title' => 'Cabin Guide',
            'slug' => 'cabin-guide',
        ]);

        $this->actingAs($admin)
            ->put(route('admin.story-categories.update', $category), [
                'name' => 'Lodging',
                'sort_order' => 1,
            ])
            ->assertRedirect();

        $this->assertSame('Lodging', $story->fresh()->category);
    }

    public function test_cannot_delete_category_with_stories(): void
    {
        $admin = User::factory()->admin()->create();
        $category = StoryCategory::query()->create([
            'name' => 'Shopping',
            'slug' => 'shopping',
            'sort_order' => 1,
        ]);
        Story::factory()->withCategory($category)->create();

        $this->actingAs($admin)
            ->from(route('admin.story-categories.index'))
            ->delete(route('admin.story-categories.destroy', $category))
            ->assertRedirect(route('admin.story-categories.index'))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('story_categories', ['id' => $category->id]);
    }

    public function test_admin_can_delete_empty_category(): void
    {
        $admin = User::factory()->admin()->create();
        $category = StoryCategory::query()->create([
            'name' => 'Weather',
            'slug' => 'weather',
            'sort_order' => 1,
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.story-categories.destroy', $category))
            ->assertRedirect(route('admin.story-categories.index'));

        $this->assertDatabaseMissing('story_categories', ['id' => $category->id]);
    }
}
