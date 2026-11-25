<?php

namespace Database\Factories;

use App\Models\Story;
use App\Models\StoryCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Story>
 */
class StoryFactory extends Factory
{
    protected $model = Story::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->unique()->sentence(4);

        return [
            'user_id' => User::factory(),
            'title' => $title,
            'subtitle' => fake()->optional()->sentence(8),
            'slug' => Str::slug($title).'-'.fake()->unique()->numerify('###'),
            'story_category_id' => null,
            'category' => null,
            'excerpt' => fake()->sentence(12),
            'image_url' => 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
            'author' => 'Nanyuki Now',
            'read_minutes' => fake()->numberBetween(3, 8),
            'body' => '<p>'.e(fake()->paragraph()).'</p><p>'.e(fake()->paragraph()).'</p>',
            'sections' => [],
            'pro_tip' => null,
            'is_published' => false,
            'is_featured' => false,
            'views' => 0,
            'published_at' => null,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
            'published_at' => now()->subDay(),
        ]);
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }

    public function withCategory(?StoryCategory $category = null): static
    {
        return $this->state(function () use ($category) {
            $resolved = $category ?? StoryCategory::query()->create([
                'name' => 'Travel Tips',
                'slug' => 'travel-tips-'.Str::random(5),
                'sort_order' => 0,
            ]);

            return [
                'story_category_id' => $resolved->id,
                'category' => $resolved->name,
            ];
        });
    }
}
