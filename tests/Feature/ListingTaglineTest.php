<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListingTaglineTest extends TestCase
{
    use RefreshDatabase;

    private function makeListing(array $overrides = []): Listing
    {
        $category = Category::query()->create([
            'name' => 'Services',
            'slug' => 'services',
            'sort_order' => 1,
        ]);

        return Listing::query()->create(array_merge([
            'user_id' => User::factory()->create()->id,
            'category_id' => $category->id,
            'title' => 'Fraittech',
            'slug' => 'fraittech',
            'location' => 'Nanyuki',
            'status' => 'published',
            'tier' => 'premium',
            'is_published' => true,
            'published_at' => now(),
        ], $overrides));
    }

    public function test_tagline_is_null_when_only_description_is_set(): void
    {
        $listing = $this->makeListing([
            'description' => '<p><span style="font-size: 16.8px;">Based in Nanyuki, we build brands.</span></p>',
        ]);

        $this->get(route('listings.show', $listing->slug))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Listings/Show')
                ->where('listing.tagline', null)
                ->where('listing.about', '<p><span style="font-size: 16.8px;">Based in Nanyuki, we build brands.</span></p>')
            );
    }

    public function test_tagline_keeps_its_own_text_when_set(): void
    {
        $listing = $this->makeListing([
            'tagline' => 'Strategy first',
            'description' => '<p>Based in Nanyuki, we build brands.</p>',
        ]);

        $this->get(route('listings.show', $listing->slug))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Listings/Show')
                ->where('listing.tagline', 'Strategy first')
            );
    }

    public function test_tagline_is_null_when_neither_tagline_nor_description_is_set(): void
    {
        $listing = $this->makeListing([
            'description' => null,
        ]);

        $this->get(route('listings.show', $listing->slug))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Listings/Show')
                ->where('listing.tagline', null)
            );
    }
}
