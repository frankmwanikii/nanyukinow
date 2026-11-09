<?php

namespace Database\Factories;

use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SupportTicket>
 */
class SupportTicketFactory extends Factory
{
    protected $model = SupportTicket::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'subject' => fake()->sentence(6),
            'body' => fake()->paragraphs(2, true),
            'priority' => fake()->randomElement(SupportTicket::PRIORITIES),
            'status' => SupportTicket::STATUS_OPEN,
        ];
    }

    public function urgent(): static
    {
        return $this->state(fn () => [
            'priority' => SupportTicket::PRIORITY_URGENT,
        ]);
    }

    public function answered(): static
    {
        return $this->state(fn () => [
            'status' => SupportTicket::STATUS_ANSWERED,
            'admin_reply' => fake()->paragraph(),
            'answered_at' => now(),
        ]);
    }
}
