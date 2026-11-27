<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureSitePreviewAccess;
use App\Models\Category;
use App\Models\Listing;
use App\Models\Story;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class SitemapTest extends TestCase
{
    use RefreshDatabase;

    public function test_sitemap_lists_only_published_public_urls(): void
    {
        Cache::flush();

        $owner = User::factory()->create();
        $category = Category::query()->create([
            'name' => 'Eat',
            'slug' => 'eat-sitemap',
            'sort_order' => 1,
        ]);

        $publishedListing = Listing::query()->create([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'title' => 'Trout Tree',
            'slug' => 'trout-tree-sitemap',
            'status' => 'published',
            'tier' => 'free',
            'is_published' => true,
            'suppressed_by_plan_expiry' => false,
            'published_at' => now()->subDay(),
        ]);

        Listing::query()->create([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'title' => 'Draft Spot',
            'slug' => 'draft-spot-sitemap',
            'status' => 'draft',
            'tier' => 'free',
            'is_published' => false,
            'suppressed_by_plan_expiry' => false,
        ]);

        $publishedStory = Story::factory()->published()->create([
            'slug' => 'weekend-in-nanyuki-sitemap',
            'title' => 'Weekend in Nanyuki',
        ]);

        Story::factory()->create([
            'slug' => 'unpublished-story-sitemap',
            'title' => 'Unpublished story',
        ]);

        $response = $this->get(route('sitemap'));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml; charset=UTF-8');

        $body = $response->getContent();

        $this->assertStringContainsString(route('home'), $body);
        $this->assertStringContainsString(route('explore'), $body);
        $this->assertStringContainsString(route('pricing'), $body);
        $this->assertStringContainsString(route('stories.index'), $body);
        $this->assertStringContainsString(route('terms'), $body);
        $this->assertStringContainsString(route('privacy'), $body);
        $this->assertStringContainsString(route('listings.show', $publishedListing->slug), $body);
        $this->assertStringContainsString(route('stories.show', $publishedStory->slug), $body);

        $this->assertStringNotContainsString('draft-spot-sitemap', $body);
        $this->assertStringNotContainsString('unpublished-story-sitemap', $body);
        $this->assertStringNotContainsString('/account', $body);
        $this->assertStringNotContainsString('/login', $body);
        $this->assertStringNotContainsString('/nyuki', $body);
        $this->assertStringNotContainsString('/nn-admin', $body);
    }

    public function test_sitemap_stays_reachable_while_preview_gate_is_locked(): void
    {
        Cache::flush();

        $this->withMiddleware(EnsureSitePreviewAccess::class);

        config([
            'site.preview_gate_enabled' => true,
            'site.preview_path' => 'nn-dev-preview',
            'site.preview_session_key' => 'site_preview_unlocked',
        ]);

        $this->get(route('sitemap'))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8');

        $this->get('/')
            ->assertNotFound()
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow');
    }
}
