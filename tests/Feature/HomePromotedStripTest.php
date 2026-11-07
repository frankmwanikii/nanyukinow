<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Support\Membership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomePromotedStripTest extends TestCase
{
    use RefreshDatabase;

    private function makeListing(string $slug, int $priority): Listing
    {
        $category = Category::query()->firstOrCreate(
            ['slug' => 'eatDrink'],
            ['name' => 'Eat & Drink', 'sort_order' => 1],
        );

        return Listing::query()->create([
            'category_id' => $category->id,
            'title' => ucfirst($slug),
            'slug' => $slug,
            'status' => 'published',
            'is_published' => true,
            'tier' => match ($priority) {
                3 => Membership::PREMIUM,
                2 => Membership::STANDARD,
                default => Membership::FREE,
            },
            'priority' => $priority,
        ]);
    }

    public function test_home_featured_includes_only_promoted_priority_listings(): void
    {
        $promoted = $this->makeListing('promoted-cafe', Membership::PROMOTED_PRIORITY);
        $this->makeListing('premium-cafe', 3);
        $this->makeListing('standard-cafe', 2);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Home')
                ->has('featured', 1)
                ->where('featured.0.id', $promoted->id));
    }

    public function test_home_featured_is_empty_when_no_promoted_listings_exist(): void
    {
        $this->makeListing('premium-only', 3);
        $this->makeListing('standard-only', 2);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Home')
                ->has('featured', 0));
    }

    public function test_home_does_not_embed_full_listings_catalogue(): void
    {
        $this->makeListing('promoted-cafe', Membership::PROMOTED_PRIORITY);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Home')
                ->missing('listings')
                ->has('featured', 1)
                ->where('featured.0.slug', 'promoted-cafe')
                ->missing('featured.0.description')
                ->missing('featured.0.gallery'));
    }
}
