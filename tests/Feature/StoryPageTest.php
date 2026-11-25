<?php

namespace Tests\Feature;

use App\Models\Story;
use App\Models\StoryCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoryPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_stories_index_lists_published_stories_only(): void
    {
        $category = StoryCategory::query()->create([
            'name' => 'Travel Tips',
            'slug' => 'travel-tips',
            'sort_order' => 1,
        ]);

        Story::factory()->published()->withCategory($category)->create([
            'title' => 'Published Guide',
            'slug' => 'published-guide',
        ]);
        Story::factory()->withCategory($category)->create([
            'title' => 'Draft Guide',
            'slug' => 'draft-guide',
            'is_published' => false,
            'published_at' => null,
        ]);

        $this->get(route('stories.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Stories/Index')
                ->has('articles', 1)
                ->where('articles.0.slug', 'published-guide')
                ->where('categories.0.name', 'Travel Tips')
                ->where('categories.0.slug', 'travel-tips'));
    }

    public function test_stories_show_renders_article_modern_payload(): void
    {
        $category = StoryCategory::query()->create([
            'name' => 'Shopping',
            'slug' => 'shopping',
            'sort_order' => 1,
        ]);

        $story = Story::factory()->published()->withCategory($category)->create([
            'title' => 'The Nanyuki Shopping Guide',
            'subtitle' => 'Markets and malls',
            'slug' => 'nanyuki-shopping-guide',
            'body' => '<p>First paragraph.</p><p>Second paragraph.</p>',
            'views' => 3,
            'pro_tip' => 'Bargain kindly.',
        ]);

        Story::factory()->published()->featured()->withCategory($category)->create([
            'title' => 'Popular Side Story',
            'slug' => 'popular-side',
            'views' => 40,
        ]);

        $this->get(route('stories.show', $story->slug))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Stories/Show')
                ->where('article.slug', 'nanyuki-shopping-guide')
                ->where('article.subtitle', 'Markets and malls')
                ->where('article.category', 'Shopping')
                ->where('article.views', 4)
                ->where('article.bodyHtml', '<p>First paragraph.</p><p>Second paragraph.</p>')
                ->has('popular')
                ->has('adjacent')
                ->has('categories'));

        $this->assertSame(4, $story->fresh()->views);
    }

    public function test_draft_story_is_not_public(): void
    {
        $story = Story::factory()->create([
            'slug' => 'hidden-draft',
            'is_published' => false,
            'published_at' => null,
        ]);

        $this->get(route('stories.show', $story->slug))->assertNotFound();
    }

    public function test_home_prefers_featured_published_stories(): void
    {
        $admin = User::factory()->admin()->create();
        $category = StoryCategory::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);

        Story::factory()->published()->withCategory($category)->create([
            'user_id' => $admin->id,
            'title' => 'Older Story',
            'slug' => 'older-story',
            'is_featured' => false,
            'published_at' => now()->subDays(2),
        ]);
        Story::factory()->published()->featured()->withCategory($category)->create([
            'user_id' => $admin->id,
            'title' => 'Featured Story',
            'slug' => 'featured-story',
            'published_at' => now()->subDay(),
        ]);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Home')
                ->where('stories.0.slug', 'featured-story'));
    }
}
