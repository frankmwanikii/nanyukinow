<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class HomePlacesToEatTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_places_to_eat_includes_only_eat_drink_listings(): void
    {
        $eat = Category::query()->create([
            'name' => 'Eat & Drink',
            'slug' => 'eatDrink',
            'sort_order' => 1,
        ]);

        $stay = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 2,
        ]);

        Listing::query()->create([
            'category_id' => $eat->id,
            'title' => 'Town Cafe',
            'slug' => 'town-cafe',
            'status' => 'published',
            'is_published' => true,
            'published_at' => now(),
            'tier' => 'free',
            'priority' => 1,
        ]);

        Listing::query()->create([
            'category_id' => $stay->id,
            'title' => 'Highland Lodge',
            'slug' => 'highland-lodge',
            'status' => 'published',
            'is_published' => true,
            'published_at' => now(),
            'tier' => 'free',
            'priority' => 1,
        ]);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Home')
                ->loadDeferredProps(fn (AssertableInertia $reload) => $reload
                    ->has('placesToEat', 1)
                    ->where('placesToEat.0.slug', 'town-cafe')));
    }
}
