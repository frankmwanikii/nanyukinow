<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Support\PublishedListingsCatalogue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class PublishedListingsCatalogueTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalogue_is_cached_and_invalidated_on_listing_save(): void
    {
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);

        Listing::query()->create([
            'category_id' => $category->id,
            'title' => 'Cached Lodge',
            'slug' => 'cached-lodge',
            'status' => 'published',
            'is_published' => true,
            'published_at' => now(),
            'rating' => 4.2,
            'tier' => 'free',
            'priority' => 1,
        ]);

        PublishedListingsCatalogue::forget();
        Cache::flush();

        $first = PublishedListingsCatalogue::cards();
        $this->assertCount(1, $first);
        $this->assertSame('Cached Lodge', $first[0]['title']);
        $this->assertArrayNotHasKey('description', $first[0]);
        $this->assertArrayNotHasKey('gallery', $first[0]);

        $listing = Listing::query()->where('slug', 'cached-lodge')->firstOrFail();
        $listing->title = 'Renamed Lodge';
        $listing->save();

        $second = PublishedListingsCatalogue::cards();
        $this->assertSame('Renamed Lodge', $second[0]['title']);
    }

    public function test_explore_serves_card_payloads(): void
    {
        PublishedListingsCatalogue::forget();
        Cache::flush();

        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);

        Listing::query()->create([
            'category_id' => $category->id,
            'title' => 'Card Lodge',
            'slug' => 'card-lodge',
            'location' => 'Nanyuki',
            'status' => 'published',
            'is_published' => true,
            'published_at' => now(),
            'description' => '<p>Long description that should not ship on explore cards.</p>',
            'gallery' => [['url' => '/storage/x.jpg']],
            'amenities' => ['wifi'],
            'rating' => 4.8,
            'tier' => 'free',
            'priority' => 1,
        ]);

        $this->get(route('explore'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Explore')
                ->loadDeferredProps(fn (AssertableInertia $reload) => $reload
                    ->has('listings', 1)
                    ->where('listings.0.title', 'Card Lodge')
                    ->missing('listings.0.description')
                    ->missing('listings.0.gallery')));
    }
}
