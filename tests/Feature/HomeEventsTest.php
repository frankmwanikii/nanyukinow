<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class HomeEventsTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_events_includes_only_event_listings_upcoming_first(): void
    {
        $events = Category::query()->create([
            'name' => 'Events',
            'slug' => 'events',
            'sort_order' => 7,
        ]);

        $eat = Category::query()->create([
            'name' => 'Eat & Drink',
            'slug' => 'eatDrink',
            'sort_order' => 1,
        ]);

        Listing::query()->create([
            'category_id' => $events->id,
            'title' => 'Past Market Day',
            'slug' => 'past-market-day',
            'status' => 'published',
            'is_published' => true,
            'published_at' => now(),
            'start_at' => now()->subDays(3),
            'end_at' => now()->subDays(3)->addHours(4),
            'tier' => 'free',
            'priority' => 1,
        ]);

        Listing::query()->create([
            'category_id' => $events->id,
            'title' => 'Weekend Garden Dinner',
            'slug' => 'weekend-garden-dinner',
            'status' => 'published',
            'is_published' => true,
            'published_at' => now(),
            'start_at' => now()->addDays(2),
            'end_at' => now()->addDays(2)->addHours(5),
            'tier' => 'premium',
            'priority' => 3,
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

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Home')
                ->loadDeferredProps(fn (AssertableInertia $reload) => $reload
                    ->has('events', 2)
                    ->where('events.0.slug', 'weekend-garden-dinner')
                    ->where('events.1.slug', 'past-market-day')));
    }
}
