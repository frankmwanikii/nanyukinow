<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\PricingPlan;
use App\Models\User;
use App\Notifications\PlanRenewalReminderNotification;
use App\Support\Membership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ProcessMembershipRenewalsTest extends TestCase
{
    use RefreshDatabase;

    public function test_sends_seven_and_three_day_renewal_reminders_once(): void
    {
        Notification::fake();
        PricingPlan::ensureDefaults();

        $seven = User::factory()->standard()->create([
            'plan_expires_at' => now()->addDays(7)->setTime(15, 0),
        ]);
        $three = User::factory()->premium()->create([
            'plan_expires_at' => now()->addDays(3)->setTime(9, 0),
        ]);
        $other = User::factory()->standard()->create([
            'plan_expires_at' => now()->addDays(10),
        ]);

        $this->artisan('membership:process-renewals')->assertSuccessful();

        Notification::assertSentTo($seven, PlanRenewalReminderNotification::class, function (PlanRenewalReminderNotification $notification): bool {
            return $notification->daysLeft === 7
                && $notification->planKey === Membership::STANDARD;
        });
        Notification::assertSentTo($three, PlanRenewalReminderNotification::class, function (PlanRenewalReminderNotification $notification): bool {
            return $notification->daysLeft === 3
                && $notification->planKey === Membership::PREMIUM;
        });
        Notification::assertNotSentTo($other, PlanRenewalReminderNotification::class);

        $this->assertNotNull($seven->fresh()->plan_renewal_reminder_7d_sent_at);
        $this->assertNotNull($three->fresh()->plan_renewal_reminder_3d_sent_at);

        Notification::fake();
        $this->artisan('membership:process-renewals')->assertSuccessful();
        Notification::assertNothingSent();
    }

    public function test_expired_paid_plan_hides_listings_without_deleting_and_renewal_restores_them(): void
    {
        PricingPlan::ensureDefaults();
        $user = User::factory()->standard()->create([
            'plan_expires_at' => now()->subDay(),
        ]);
        $category = Category::query()->create([
            'name' => 'Stay',
            'slug' => 'stay',
            'sort_order' => 1,
        ]);
        $listing = Listing::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Lodge',
            'slug' => 'lodge-renewal',
            'status' => 'published',
            'tier' => Membership::STANDARD,
            'is_published' => true,
            'is_featured' => true,
        ]);

        $this->artisan('membership:process-renewals')->assertSuccessful();

        $user->refresh();
        $listing->refresh();

        $this->assertSame(Membership::FREE, $user->plan);
        $this->assertSame(Membership::STANDARD, $user->last_paid_plan);
        $this->assertSame(Membership::FREE, $user->effectivePlan());
        $this->assertFalse($listing->is_published);
        $this->assertTrue($listing->suppressed_by_plan_expiry);
        $this->assertTrue(Listing::query()->published()->whereKey($listing->id)->doesntExist());
        $this->assertDatabaseHas('listings', [
            'id' => $listing->id,
            'title' => 'Lodge',
        ]);

        Membership::activate($user, Membership::STANDARD, 30);

        $user->refresh();
        $listing->refresh();

        $this->assertSame(Membership::STANDARD, $user->plan);
        $this->assertSame(Membership::STANDARD, $user->effectivePlan());
        $this->assertTrue($listing->is_published);
        $this->assertFalse($listing->suppressed_by_plan_expiry);
        $this->assertTrue(Listing::query()->published()->whereKey($listing->id)->exists());
        $this->assertTrue($user->plan_expires_at->isAfter(now()->addDays(28)));
    }

    public function test_renewing_active_plan_extends_from_current_expiry(): void
    {
        PricingPlan::ensureDefaults();
        $expires = now()->addDays(10);
        $user = User::factory()->standard()->create([
            'plan_started_at' => now()->subDays(20),
            'plan_expires_at' => $expires,
        ]);

        Membership::activate($user, Membership::STANDARD, 30);
        $user->refresh();

        $this->assertTrue($user->plan_expires_at->between(
            $expires->copy()->addDays(29),
            $expires->copy()->addDays(31),
        ));
    }

    public function test_dashboard_shows_renew_plan_for_expiring_member(): void
    {
        PricingPlan::ensureDefaults();
        $user = User::factory()->standard()->create([
            'plan_expires_at' => now()->addDays(5),
        ]);

        $this->actingAs($user)
            ->get(route('account.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Index')
                ->where('plan.can_renew', true)
                ->where('plan.renew_plan', Membership::STANDARD)
                ->where('plan.status', 'expiring_soon'));
    }

    public function test_member_can_submit_renewal_for_current_plan(): void
    {
        PricingPlan::ensureDefaults();
        $user = User::factory()->standard()->create([
            'plan_expires_at' => now()->addDays(5),
        ]);

        $this->actingAs($user)
            ->post(route('account.upgrade.store'), [
                'to_plan' => Membership::STANDARD,
                'billing_period' => 'month',
                'payment_reference' => 'RENEW12345',
                'payment_method' => 'mpesa',
            ])
            ->assertRedirect(route('account.index'));

        $this->assertDatabaseHas('plan_upgrades', [
            'user_id' => $user->id,
            'to_plan' => Membership::STANDARD,
            'payment_reference' => 'RENEW12345',
            'status' => 'pending',
        ]);
    }
}
