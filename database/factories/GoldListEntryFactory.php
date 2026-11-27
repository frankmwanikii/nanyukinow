<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\GoldListEntry;
use App\Models\Listing;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GoldListEntry>
 */
class GoldListEntryFactory extends Factory
{
    protected $model = GoldListEntry::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'listing_id' => function () {
                $category = Category::query()->firstOrCreate(
                    ['slug' => 'eatDrink'],
                    ['name' => 'Eat & Drink', 'sort_order' => 1],
                );

                return Listing::query()->create([
                    'category_id' => $category->id,
                    'title' => fake()->unique()->company(),
                    'slug' => fake()->unique()->slug(3),
                    'status' => 'published',
                    'is_published' => true,
                    'published_at' => now(),
                    'tier' => 'free',
                    'priority' => 1,
                ])->id;
            },
            'position' => 0,
        ];
    }

    public function forListing(Listing $listing): static
    {
        return $this->state(fn () => [
            'listing_id' => $listing->id,
        ]);
    }

    public function atPosition(int $position): static
    {
        return $this->state(fn () => [
            'position' => $position,
        ]);
    }
}
