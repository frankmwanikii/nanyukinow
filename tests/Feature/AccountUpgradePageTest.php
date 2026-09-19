<?php

namespace Tests\Feature;

use App\Models\PlanUpgrade;
use App\Models\PricingPlan;
use App\Models\SiteSetting;
use App\Models\User;
use App\Support\Membership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class AccountUpgradePageTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_can_open_upgrade_page(): void
    {
        PricingPlan::ensureDefaults();
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('account.upgrade'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Upgrade')
                ->has('plans', 3)
                ->has('paymentMethods', 3)
                ->has('upgradeContact')
                ->has('plan'));
    }

    public function test_upgrade_page_recovers_from_corrupt_settings_cache(): void
    {
        PricingPlan::ensureDefaults();
        SiteSetting::query()->create([
            'group' => 'billing',
            'key' => 'upgrade_instructions',
            'label' => 'Upgrade instructions',
            'type' => 'textarea',
            'value' => 'Pay via M-Pesa then submit.',
            'sort_order' => 1,
        ]);

        Cache::forever('site_settings', (object) ['broken' => true]);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('account.upgrade'))
            ->assertOk();
    }

    public function test_member_can_submit_upgrade_with_paypal_and_intasend(): void
    {
        PricingPlan::ensureDefaults();
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('account.upgrade.store'), [
                'to_plan' => Membership::PREMIUM,
                'payment_reference' => 'PAYPAL-TX-99',
                'payment_method' => 'paypal',
            ])
            ->assertRedirect(route('account.index'));

        $this->assertDatabaseHas('plan_upgrades', [
            'user_id' => $user->id,
            'to_plan' => Membership::PREMIUM,
            'payment_method' => 'paypal',
            'payment_reference' => 'PAYPAL-TX-99',
            'status' => PlanUpgrade::STATUS_PENDING,
        ]);

        PlanUpgrade::query()->where('user_id', $user->id)->update([
            'status' => PlanUpgrade::STATUS_CANCELLED,
        ]);

        $this->actingAs($user)
            ->post(route('account.upgrade.store'), [
                'to_plan' => Membership::STANDARD,
                'payment_reference' => 'INTA-INV-1',
                'payment_method' => 'intasend',
            ])
            ->assertRedirect(route('account.index'));

        $this->assertDatabaseHas('plan_upgrades', [
            'user_id' => $user->id,
            'to_plan' => Membership::STANDARD,
            'payment_method' => 'intasend',
            'status' => PlanUpgrade::STATUS_PENDING,
        ]);
    }

    public function test_upgrade_requires_payment_method(): void
    {
        PricingPlan::ensureDefaults();
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('account.upgrade.store'), [
                'to_plan' => Membership::STANDARD,
                'payment_reference' => 'ABC',
            ])
            ->assertSessionHasErrors('payment_method');
    }
}
