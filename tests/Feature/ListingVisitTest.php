<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListingVisitTest extends TestCase
{
    use RefreshDatabase;

    private function makeListing(array $overrides = []): Listing
    {
        $owner = User::factory()->create();
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);

        return Listing::query()->create(array_merge([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'title' => 'Frayo',
            'slug' => 'frayo',
            'location' => 'Nanyuki',
            'status' => 'published',
            'tier' => 'free',
            'is_published' => true,
            'claim_status' => 'claimed',
            'website' => 'https://example.com/stay',
            'social_links' => [
                'links' => [
                    ['label' => 'Booking', 'url' => 'https://book.example.com'],
                ],
            ],
        ], $overrides));
    }

    public function test_visit_page_embeds_listing_website_on_nanyuki_now(): void
    {
        $listing = $this->makeListing();

        $this->get(route('listings.visit', $listing->slug))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Listings/Visit')
                ->where('url', 'https://example.com/stay')
                ->where('listing.slug', 'frayo')
                ->where('label', 'Website')
            );
    }

    public function test_visit_page_only_allows_urls_registered_on_the_listing(): void
    {
        $listing = $this->makeListing();

        $this->get(route('listings.visit', [
            'slug' => $listing->slug,
            'url' => 'https://book.example.com',
        ]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('url', 'https://book.example.com')
                ->where('label', 'Booking')
            );

        // Unknown URL falls back to the primary website (no open redirect).
        $this->get(route('listings.visit', [
            'slug' => $listing->slug,
            'url' => 'https://evil.example',
        ]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('url', 'https://example.com/stay')
            );
    }

    public function test_visit_page_404s_when_listing_has_no_website(): void
    {
        $listing = $this->makeListing([
            'website' => null,
            'social_links' => [],
        ]);

        $this->get(route('listings.visit', $listing->slug))->assertNotFound();
    }
}
