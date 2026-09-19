<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\PlanUpgrade;
use App\Models\PricingPlan;
use App\Models\User;
use App\Notifications\ListingReviewedNotification;
use App\Notifications\PlanUpgradeReviewedNotification;
use App\Notifications\WelcomeMemberNotification;
use App\Support\Membership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class MemberNotificationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_sends_welcome_notification(): void
    {
        $this->post('/register', [
            'name' => 'Alert User',
            'username' => 'alert_user',
            'email' => 'alert@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect(route('account.index'));

        $user = User::query()->where('email', 'alert@example.com')->first();
        $this->assertNotNull($user);
        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $user->id,
            'notifiable_type' => User::class,
            'type' => WelcomeMemberNotification::class,
        ]);
    }

    public function test_member_sees_notifications_in_shared_props(): void
    {
        $user = User::factory()->create();
        $user->notify(new WelcomeMemberNotification);

        $this->actingAs($user)
            ->get(route('account.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('notifications.unread_count')
                ->where('notifications.unread_count', 1)
                ->has('notifications.recent', 1));
    }

    public function test_member_can_mark_notification_read(): void
    {
        $user = User::factory()->create();
        $user->notify(new WelcomeMemberNotification);
        $notification = $user->notifications()->first();

        $this->actingAs($user)
            ->post(route('account.notifications.read', $notification->id))
            ->assertRedirect(route('account.messages', [
                'tab' => 'alerts',
                'n' => $notification->id,
            ]));

        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_admin_approve_upgrade_notifies_member(): void
    {
        PricingPlan::ensureDefaults();
        $user = User::factory()->create();
        $admin = User::factory()->admin()->create();

        $upgrade = PlanUpgrade::query()->create([
            'user_id' => $user->id,
            'from_plan' => Membership::FREE,
            'to_plan' => Membership::STANDARD,
            'amount' => 2500,
            'currency' => 'KES',
            'billing_period' => 'month',
            'status' => PlanUpgrade::STATUS_PENDING,
            'payment_reference' => 'TEST123',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.upgrades.approve', $upgrade), [
                'duration_days' => 30,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $user->id,
            'type' => PlanUpgradeReviewedNotification::class,
        ]);
    }

    public function test_publishing_listing_notifies_owner(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);

        $listing = Listing::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Notify Lodge',
            'slug' => 'notify-lodge',
            'status' => 'pending',
            'tier' => 'free',
            'claim_status' => 'claimed',
            'is_published' => false,
        ]);

        $this->actingAs($admin)
            ->put(route('admin.listings.update', $listing), [
                'user_id' => $user->id,
                'title' => 'Notify Lodge',
                'slug' => 'notify-lodge',
                'category_id' => $category->id,
                'status' => 'published',
                'tier' => 'free',
                'claim_status' => 'claimed',
                'is_published' => true,
                'is_featured' => false,
                'is_trending' => false,
                'priority' => 0,
            ])
            ->assertRedirect(route('admin.listings.edit', $listing));

        $this->assertTrue($listing->fresh()->is_published);
        $this->assertSame($user->id, $listing->fresh()->user_id);

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $user->id,
            'type' => ListingReviewedNotification::class,
        ]);
    }
}
