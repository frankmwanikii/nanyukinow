<?php

namespace Tests\Feature;

use App\Models\PlanUpgrade;
use App\Models\PricingPlan;
use App\Models\User;
use App\Support\Membership;
use App\Support\PlanUpgradeApproval;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class TrialPaidPlanDeferralTest extends TestCase
{
    use RefreshDatabase;

    private function trialUser(): User
    {
        return User::factory()->create([
            'plan' => Membership::PREMIUM,
            'plan_is_trial' => true,
            'premium_trial_claimed_at' => now()->subDay(),
            'trial_banner_dismissed_at' => now()->subDay(),
            'plan_started_at' => now()->subDay(),
            'plan_expires_at' => now()->addDays(40),
            'last_paid_plan' => null,
        ]);
    }

    public function test_approving_paid_plan_during_trial_keeps_trial_and_schedules_start(): void
    {
        Notification::fake();
        PricingPlan::ensureDefaults();
        $user = $this->trialUser();
        $trialEnds = $user->plan_expires_at->copy();

        $upgrade = PlanUpgrade::query()->create([
            'user_id' => $user->id,
            'from_plan' => Membership::PREMIUM,
            'to_plan' => Membership::STANDARD,
            'amount' => 2500,
            'currency' => 'KES',
            'billing_period' => 'month',
            'status' => PlanUpgrade::STATUS_PENDING,
            'payment_reference' => 'TRIAL-KEEP-1',
            'payment_method' => 'mpesa',
        ]);

        $this->assertTrue(PlanUpgradeApproval::approve($upgrade));

        $user->refresh();

        $this->assertTrue((bool) $user->plan_is_trial);
        $this->assertSame(Membership::PREMIUM, $user->plan);
        $this->assertTrue($user->plan_expires_at->equalTo($trialEnds));
        $this->assertSame(Membership::STANDARD, $user->scheduled_plan);
        $this->assertSame(30, (int) $user->scheduled_plan_days);
        $this->assertTrue($user->scheduled_plan_at->equalTo($trialEnds));

        $summary = Membership::planSummary($user);
        $this->assertTrue($summary['is_trial']);
        $this->assertSame(Membership::STANDARD, $summary['scheduled_plan']);
        $this->assertSame('Standard', $summary['scheduled_plan_label']);
    }

    public function test_scheduled_paid_plan_starts_when_trial_expires(): void
    {
        Notification::fake();
        PricingPlan::ensureDefaults();
        $user = $this->trialUser();
        $user->forceFill([
            'plan_expires_at' => now()->subMinute(),
            'scheduled_plan' => Membership::STANDARD,
            'scheduled_plan_days' => 30,
            'scheduled_plan_at' => now()->subMinute(),
        ])->save();

        $this->assertFalse(Membership::expireToFree($user));

        $user->refresh();

        $this->assertFalse((bool) $user->plan_is_trial);
        $this->assertSame(Membership::STANDARD, $user->plan);
        $this->assertSame(Membership::STANDARD, $user->last_paid_plan);
        $this->assertNull($user->scheduled_plan);
        $this->assertNull($user->scheduled_plan_days);
        $this->assertNull($user->scheduled_plan_at);
        $this->assertTrue($user->plan_expires_at->isAfter(now()->addDays(28)));
    }

    public function test_membership_process_renewals_activates_due_scheduled_plans(): void
    {
        $user = $this->trialUser();
        $user->forceFill([
            'plan_expires_at' => now()->subMinute(),
            'scheduled_plan' => Membership::PREMIUM,
            'scheduled_plan_days' => 30,
            'scheduled_plan_at' => now()->subMinute(),
        ])->save();

        $this->artisan('membership:process-renewals')
            ->assertSuccessful();

        $user->refresh();

        $this->assertSame(Membership::PREMIUM, $user->plan);
        $this->assertFalse((bool) $user->plan_is_trial);
        $this->assertNull($user->scheduled_plan);
        $this->assertTrue($user->plan_expires_at->isFuture());
    }
}
