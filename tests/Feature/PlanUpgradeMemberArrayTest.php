<?php

namespace Tests\Feature;

use App\Models\PlanUpgrade;
use App\Models\User;
use App\Support\Membership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlanUpgradeMemberArrayTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_payload_hides_palpluss_tracking_uuid_while_stk_is_pending(): void
    {
        $user = User::factory()->create();
        $upgrade = PlanUpgrade::query()->create([
            'user_id' => $user->id,
            'from_plan' => Membership::FREE,
            'to_plan' => Membership::STANDARD,
            'amount' => 2500,
            'currency' => 'KES',
            'billing_period' => 'month',
            'status' => PlanUpgrade::STATUS_PENDING,
            'payment_reference' => '1c2fdb6e-36d7-4fb8-a84b-9d01ceac9d76',
            'payment_method' => 'mpesa',
        ]);

        $payload = $upgrade->toMemberArray();

        $this->assertNull($payload['payment_reference']);
        $this->assertTrue($payload['awaiting_mpesa_prompt']);
    }

    public function test_member_payload_keeps_typed_mpesa_references(): void
    {
        $user = User::factory()->create();
        $upgrade = PlanUpgrade::query()->create([
            'user_id' => $user->id,
            'from_plan' => Membership::FREE,
            'to_plan' => Membership::STANDARD,
            'amount' => 2500,
            'currency' => 'KES',
            'billing_period' => 'month',
            'status' => PlanUpgrade::STATUS_PENDING,
            'payment_reference' => 'QJX7TESTCODE',
            'payment_method' => 'mpesa',
        ]);

        $payload = $upgrade->toMemberArray();

        $this->assertSame('QJX7TESTCODE', $payload['payment_reference']);
        $this->assertFalse($payload['awaiting_mpesa_prompt']);
    }

    public function test_billing_page_does_not_expose_palpluss_uuid_on_pending_upgrade(): void
    {
        $user = User::factory()->create();
        PlanUpgrade::query()->create([
            'user_id' => $user->id,
            'from_plan' => Membership::FREE,
            'to_plan' => Membership::STANDARD,
            'amount' => 2500,
            'currency' => 'KES',
            'billing_period' => 'month',
            'status' => PlanUpgrade::STATUS_PENDING,
            'payment_reference' => '1c2fdb6e-36d7-4fb8-a84b-9d01ceac9d76',
            'payment_method' => 'mpesa',
        ]);

        $this->actingAs($user)
            ->get(route('account.billing'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Billing')
                ->where('pendingUpgrade.payment_reference', null)
                ->where('pendingUpgrade.awaiting_mpesa_prompt', true)
                ->where('pendingUpgrade.to_label', 'Standard'));
    }
}
