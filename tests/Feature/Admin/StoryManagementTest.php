<?php

namespace Tests\Feature\Admin;

use App\Models\Story;
use App\Models\StoryCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StoryManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_published_story_with_sections(): void
    {
        $admin = User::factory()->admin()->create();
        $category = StoryCategory::query()->create([
            'name' => 'Travel Tips',
            'slug' => 'travel-tips',
            'sort_order' => 1,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.stories.store'), [
                'title' => 'Weekend in Nanyuki',
                'subtitle' => 'A two-day rhythm',
                'slug' => 'weekend-in-nanyuki',
                'story_category_id' => $category->id,
                'excerpt' => 'A short guide.',
                'image_url' => '/images/stories/shopping-hero.webp',
                'author' => 'Nanyuki Now',
                'read_minutes' => 5,
                'body' => '<p>Day one is easy.</p><p>Day two is open country.</p>',
                'pro_tip' => 'Leave buffer time.',
                'is_published' => true,
                'is_featured' => true,
                'sections' => [
                    [
                        'id' => 'day-one',
                        'title' => 'Day one',
                        'paragraphs' => ['Settle in and walk town.'],
                        'list' => [
                            ['title' => 'Coffee', 'text' => 'Start slow.'],
                        ],
                        'image' => '/images/stories/shopping-cedar-mall.webp',
                        'imageAlt' => 'Town cafe',
                    ],
                ],
            ])
            ->assertRedirect();

        $story = Story::query()->where('slug', 'weekend-in-nanyuki')->first();

        $this->assertNotNull($story);
        $this->assertSame($admin->id, $story->user_id);
        $this->assertSame($category->id, $story->story_category_id);
        $this->assertSame('Travel Tips', $story->category);
        $this->assertSame('A two-day rhythm', $story->subtitle);
        $this->assertTrue($story->is_published);
        $this->assertTrue($story->is_featured);
        $this->assertStringContainsString('<p>Day one is easy.</p>', (string) $story->body);
        $this->assertSame('Day one', $story->sections[0]['title']);
        $this->assertSame('Settle in and walk town.', $story->sections[0]['paragraphs'][0]);
    }

    public function test_admin_update_does_not_overwrite_author_user(): void
    {
        $admin = User::factory()->admin()->create();
        $author = User::factory()->create(['is_admin' => false]);
        $category = StoryCategory::query()->create([
            'name' => 'Weather',
            'slug' => 'weather',
            'sort_order' => 1,
        ]);
        $story = Story::factory()->withCategory($category)->create([
            'user_id' => $author->id,
            'title' => 'Highland Weather',
            'slug' => 'highland-weather',
            'is_published' => false,
        ]);

        $this->actingAs($admin)
            ->put(route('admin.stories.update', $story), [
                'title' => 'Highland Weather Updated',
                'slug' => 'highland-weather',
                'story_category_id' => $category->id,
                'body' => '<p>Layers help.</p>',
                'is_published' => true,
                'is_featured' => false,
                'sections' => [],
            ])
            ->assertRedirect(route('admin.stories.edit', $story));

        $story->refresh();

        $this->assertSame($author->id, $story->user_id);
        $this->assertSame('Highland Weather Updated', $story->title);
        $this->assertTrue($story->is_published);
    }

    public function test_admin_can_delete_story(): void
    {
        $admin = User::factory()->admin()->create();
        $story = Story::factory()->create([
            'slug' => 'delete-me',
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.stories.destroy', $story))
            ->assertRedirect(route('admin.stories.index'));

        $this->assertDatabaseMissing('stories', ['id' => $story->id]);
    }

    public function test_published_story_requires_category(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.stories.store'), [
                'title' => 'Missing Category',
                'is_published' => true,
                'body' => '<p>Hello</p>',
            ])
            ->assertSessionHasErrors('story_category_id');
    }

    public function test_admin_can_filter_stories_by_category(): void
    {
        $admin = User::factory()->admin()->create();
        $tips = StoryCategory::query()->create([
            'name' => 'Travel Tips',
            'slug' => 'travel-tips',
            'sort_order' => 1,
        ]);
        $stay = StoryCategory::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 2,
        ]);
        Story::factory()->withCategory($tips)->create(['title' => 'Tips story']);
        Story::factory()->withCategory($stay)->create(['title' => 'Stay story']);

        $this->actingAs($admin)
            ->get(route('admin.stories.index', ['category_id' => $tips->id]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Stories/Index')
                ->has('stories.data', 1)
                ->where('stories.data.0.title', 'Tips story')
                ->where('filters.category_id', (string) $tips->id));
    }

    public function test_admin_can_upload_story_cover(): void
    {
        Storage::fake('public');
        $admin = User::factory()->admin()->create();
        $file = UploadedFile::fake()->image('cover.jpg', 1200, 675);

        $this->actingAs($admin)
            ->post(route('admin.stories.upload'), ['image' => $file])
            ->assertCreated()
            ->assertJsonStructure(['url']);
    }
}
