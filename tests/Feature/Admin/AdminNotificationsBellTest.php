<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Conversation;
use App\Models\Listing;
use App\Models\ListingClaim;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminNotificationsBellTest extends TestCase
{
    use RefreshDatabase;

    private function makeListing(array $overrides = []): Listing
    {
        $category = Category::query()->first()
            ?? Category::query()->create([
                'name' => 'Eat & Drink',
                'slug' => 'eat-drink',
                'is_active' => true,
                'sort_order' => 1,
            ]);

        return Listing::query()->create(array_merge([
            'category_id' => $category->id,
            'title' => 'Cedar Cafe',
            'slug' => 'cedar-cafe-admin-inbox',
            'location' => 'Nanyuki',
            'status' => 'pending',
            'is_published' => false,
        ], $overrides));
    }

    public function test_admin_pages_share_inbox_messages_and_task_alerts(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $listing = $this->makeListing();

        ListingClaim::query()->create([
            'listing_id' => $listing->id,
            'first_name' => 'Jane',
            'last_name' => 'Wanjiru',
            'email' => 'jane@example.com',
            'phone' => '0700',
            'reason' => 'Owner',
            'status' => ListingClaim::STATUS_PENDING,
        ]);

        $conversation = Conversation::query()->create([
            'listing_id' => $listing->id,
            'subject' => 'Table for two',
            'admin_status' => 'new',
            'last_message_at' => now(),
        ]);

        Message::query()->create([
            'conversation_id' => $conversation->id,
            'guest_name' => 'Alex Guest',
            'guest_email' => 'alex@example.com',
            'body' => 'Do you have a table tonight?',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('adminInbox')
                ->where('adminInbox.message_unread', 1)
                ->where('adminInbox.alert_count', fn ($count) => $count >= 2)
                ->has('adminInbox.messages', 1)
                ->where('adminInbox.messages.0.from', 'Alex Guest')
                ->where('adminInbox.alerts', fn ($alerts) => collect($alerts)
                    ->contains(fn ($alert) => ($alert['id'] ?? null) === 'pending-claims'))
                ->where('adminInbox.alerts', fn ($alerts) => collect($alerts)
                    ->contains(fn ($alert) => ($alert['id'] ?? null) === 'pending-listings'))
                ->etc());
    }

    public function test_admin_can_mark_all_inbox_messages_read(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $conversation = Conversation::query()->create([
            'subject' => 'Hello',
            'admin_status' => 'new',
            'last_message_at' => now(),
        ]);

        Message::query()->create([
            'conversation_id' => $conversation->id,
            'guest_name' => 'Alex Guest',
            'guest_email' => 'alex@example.com',
            'body' => 'Hello there',
        ]);

        $this->actingAs($admin)
            ->from(route('admin.dashboard'))
            ->post(route('admin.messages.read-all'))
            ->assertRedirect(route('admin.dashboard'));

        $this->assertDatabaseHas('conversations', [
            'id' => $conversation->id,
            'admin_status' => 'read',
        ]);
    }
}
