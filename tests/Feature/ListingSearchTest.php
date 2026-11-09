<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use App\Support\PublishedListingsCatalogue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ListingSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_search_finds_admin_published_listings(): void
    {
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);

        Listing::query()->create([
            'user_id' => User::factory()->create()->id,
            'category_id' => $category->id,
            'title' => 'Frayo Homestay',
            'slug' => 'frayo-homestay',
            'location' => 'Nanyuki',
            'tagline' => 'Home is where the heart is',
            'description' => 'Quiet cottage near town',
            'status' => 'published',
            'tier' => 'free',
            'is_published' => true,
            'published_at' => now(),
        ]);

        Listing::query()->create([
            'user_id' => User::factory()->create()->id,
            'category_id' => $category->id,
            'title' => 'Hidden Draft',
            'slug' => 'hidden-draft',
            'status' => 'draft',
            'is_published' => false,
        ]);

        $this->getJson(route('listings.search', ['q' => 'Frayo']))
            ->assertOk()
            ->assertJsonPath('count', 1)
            ->assertJsonPath('results.0.title', 'Frayo Homestay')
            ->assertJsonPath('results.0.slug', 'frayo-homestay');

        $this->getJson(route('listings.search', ['q' => 'heart cottage']))
            ->assertOk()
            ->assertJsonPath('count', 1)
            ->assertJsonPath('results.0.title', 'Frayo Homestay');

        $this->getJson(route('listings.search', ['q' => 'Hidden']))
            ->assertOk()
            ->assertJsonPath('count', 0);
    }

    public function test_public_search_matches_titles_without_spaces(): void
    {
        $category = Category::query()->create([
            'name' => 'Things to do',
            'slug' => 'things-to-do',
            'sort_order' => 1,
        ]);

        Listing::query()->create([
            'user_id' => User::factory()->create()->id,
            'category_id' => $category->id,
            'title' => 'Ol Pejeta Conservancy',
            'slug' => 'ol-pejeta-conservancy',
            'location' => 'Nanyuki',
            'status' => 'published',
            'tier' => 'free',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $this->getJson(route('listings.search', ['q' => 'olpejeta']))
            ->assertOk()
            ->assertJsonPath('count', 1)
            ->assertJsonPath('results.0.title', 'Ol Pejeta Conservancy');
    }

    public function test_explore_includes_published_admin_listings(): void
    {
        PublishedListingsCatalogue::forget();

        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);

        Listing::query()->create([
            'user_id' => User::factory()->create()->id,
            'category_id' => $category->id,
            'title' => 'Admin Lodge',
            'slug' => 'admin-lodge',
            'location' => 'Timau',
            'status' => 'published',
            'is_published' => true,
            'published_at' => now(),
            'rating' => 4.5,
        ]);

        $this->get(route('explore', ['q' => 'Admin Lodge']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Explore')
                ->where('q', 'Admin Lodge')
                ->loadDeferredProps(fn (AssertableInertia $reload) => $reload
                    ->has('listings')
                    ->where('listings.0.title', 'Admin Lodge')));
    }
}
