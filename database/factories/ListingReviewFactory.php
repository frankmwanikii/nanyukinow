<?php

namespace Database\Factories;

use App\Models\ListingReview;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ListingReview>
 */
class ListingReviewFactory extends Factory
{
    protected $model = ListingReview::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'rating' => fake()->numberBetween(1, 5),
            'body' => fake()->paragraph(),
            'is_published' => true,
        ];
    }

    public function unpublished(): static
    {
        return $this->state(fn () => [
            'is_published' => false,
        ]);
    }

    public function published(): static
    {
        return $this->state(fn () => [
            'is_published' => true,
        ]);
    }
}
