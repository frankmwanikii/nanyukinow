<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\PlanUpgrade;
use App\Models\PricingPlan;
use App\Models\SiteSetting;
use App\Models\User;
use App\Notifications\PlanUpgradeReviewedNotification;
use App\Support\Membership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PalplussWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_rejects_an_invalid_payload(): void
    {
        $this->postJson(route('webhooks.palpluss'), [
            'event' => 'transaction.updated',
        ])
            ->assertStatus(400)
            ->assertJson(['error' => 'Invalid payload']);
    }

    public function test_webhook_acknowledges_an_unknown_transaction(): void
    {
        $this->postJson(route('webhooks.palpluss'), $this->successPayload())
            ->assertOk()
            ->assertJson(['received' => true]);

        $this->assertDatabaseCount('plan_upgrades', 0);
    }

    public function test_confirmed_palpluss_payment_activates_the_member_plan(): void
    {
        Notification::fake();
        $user = $this->startPalplussUpgrade();
        $upgrade = PlanUpgrade::query()->firstOrFail();

        Http::fake([
            'sandbox.palpluss.com/v1/transactions/*' => Http::response([
                'success' => true,
                'data' => [
                    'transactionId' => 'fa98a577-95ea-4a8f-8467-1fbe74f5d6f4',
                    'status' => 'SUCCESS',
                    'amount' => $upgrade->amount,
                    'currency' => 'KES',
                ],
            ]),
        ]);

        $this->postJson(route('webhooks.palpluss'), $this->successPayload())
            ->assertOk()
            ->assertJson(['received' => true]);

        $user->refresh();
        $upgrade->refresh();

        $this->assertSame(Membership::STANDARD, $user->plan);
        $this->assertNotNull($user->plan_expires_at);
        $this->assertSame(PlanUpgrade::STATUS_APPROVED, $upgrade->status);
        $this->assertSame('LGR019G3J2', $upgrade->payment_reference);
        Notification::assertSentTo($user, PlanUpgradeReviewedNotification::class);
    }

    public function test_repeated_success_webhook_does_not_extend_the_plan(): void
    {
        Notification::fake();
        $this->freezeTime();
        $user = $this->startPalplussUpgrade();
        $upgrade = PlanUpgrade::query()->firstOrFail();

        Http::fake([
            'sandbox.palpluss.com/v1/transactions/*' => Http::response([
                'success' => true,
                'data' => [
                    'status' => 'SUCCESS',
                    'amount' => $upgrade->amount,
                ],
            ]),
        ]);

        $this->postJson(route('webhooks.palpluss'), $this->successPayload())->assertOk();
        $expiresAt = $user->fresh()->plan_expires_at;

        $this->postJson(route('webhooks.palpluss'), $this->successPayload())->assertOk();

        $this->assertTrue($user->fresh()->plan_expires_at->equalTo($expiresAt));
        Notification::assertSentToTimes($user, PlanUpgradeReviewedNotification::class, 1);
    }

    public function test_mismatched_amount_does_not_activate_the_plan(): void
    {
        $user = $this->startPalplussUpgrade();

        Http::fake([
            'sandbox.palpluss.com/v1/transactions/*' => Http::response([
                'success' => true,
                'data' => [
                    'status' => 'SUCCESS',
                    'amount' => 1,
                ],
            ]),
        ]);

        $this->postJson(route('webhooks.palpluss'), $this->successPayload())
            ->assertOk()
            ->assertJson(['received' => true]);

        $this->assertNotSame(Membership::STANDARD, $user->fresh()->plan);
        $this->assertDatabaseHas('plan_upgrades', [
            'user_id' => $user->id,
            'status' => PlanUpgrade::STATUS_PENDING,
        ]);
    }

    public function test_failed_webhook_cancels_the_pending_upgrade(): void
    {
        $user = $this->startPalplussUpgrade();

        $this->postJson(route('webhooks.palpluss'), [
            'event_type' => 'transaction.cancelled',
            'transaction' => [
                'id' => 'fa98a577-95ea-4a8f-8467-1fbe74f5d6f4',
                'status' => 'CANCELLED',
            ],
        ])->assertOk();

        $this->assertNotSame(Membership::STANDARD, $user->fresh()->plan);
        $this->assertDatabaseHas('plan_upgrades', [
            'user_id' => $user->id,
            'status' => PlanUpgrade::STATUS_CANCELLED,
        ]);
    }

    public function test_webhook_returns_503_when_palpluss_cannot_confirm_the_transaction(): void
    {
        $user = $this->startPalplussUpgrade();

        Http::preventStrayRequests();
        Http::fake([
            'sandbox.palpluss.com/v1/transactions/*' => Http::failedConnection(),
        ]);

        $this->postJson(route('webhooks.palpluss'), $this->successPayload())
            ->assertStatus(503);

        $this->assertNotSame(Membership::STANDARD, $user->fresh()->plan);
        $this->assertDatabaseHas('plan_upgrades', [
            'user_id' => $user->id,
            'status' => PlanUpgrade::STATUS_PENDING,
        ]);
    }

    public function test_upgrade_status_activates_the_plan_and_updates_the_listing(): void
    {
        Notification::fake();
        PricingPlan::ensureDefaults();
        $this->configurePalpluss();
        $user = User::factory()->create();
        $category = Category::query()->create([
            'name' => 'Shop',
            'slug' => 'shop-'.uniqid(),
            'sort_order' => 1,
        ]);
        $listing = Listing::query()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Quickmart',
            'slug' => 'quickmart-'.uniqid(),
            'status' => 'published',
            'tier' => Membership::FREE,
            'claim_status' => 'claimed',
            'is_published' => true,
            'is_featured' => false,
        ]);
        PlanUpgrade::query()->create([
            'user_id' => $user->id,
            'from_plan' => Membership::FREE,
            'to_plan' => Membership::PREMIUM,
            'amount' => 5,
            'currency' => 'KES',
            'billing_period' => 'month',
            'status' => PlanUpgrade::STATUS_PENDING,
            'payment_reference' => '2097de97-1efe-4aea-a31a-ac9eef326f27',
            'payment_method' => 'mpesa',
        ]);

        Http::preventStrayRequests();
        Http::fake([
            'sandbox.palpluss.com/v1/transactions/*' => Http::response([
                'success' => true,
                'data' => [
                    'status' => 'SUCCESS',
                    'amount' => 5,
                    'mpesa_receipt' => 'UKE1234567',
                ],
            ]),
        ]);

        $this->actingAs($user)
            ->getJson(route('account.upgrade.status'))
            ->assertOk()
            ->assertExactJson([
                'status' => PlanUpgrade::STATUS_APPROVED,
                'plan' => Membership::PREMIUM,
            ]);

        $listing->refresh();
        $this->assertSame(Membership::PREMIUM, $listing->tier);
        $this->assertTrue($listing->is_featured);
        $this->assertSame(3, $listing->priority);
        $this->assertSame(Membership::PREMIUM, $user->fresh()->plan);
    }

    public function test_upgrade_status_waits_while_the_palpluss_payment_is_still_pending(): void
    {
        PricingPlan::ensureDefaults();
        $this->configurePalpluss();
        $user = User::factory()->create();
        PlanUpgrade::query()->create([
            'user_id' => $user->id,
            'from_plan' => Membership::FREE,
            'to_plan' => Membership::PREMIUM,
            'amount' => 5,
            'currency' => 'KES',
            'billing_period' => 'month',
            'status' => PlanUpgrade::STATUS_PENDING,
            'payment_reference' => '2097de97-1efe-4aea-a31a-ac9eef326f27',
            'payment_method' => 'mpesa',
        ]);

        Http::preventStrayRequests();
        Http::fake([
            'sandbox.palpluss.com/v1/transactions/*' => Http::response([
                'success' => true,
                'data' => [
                    'status' => 'PENDING',
                    'amount' => 5,
                ],
            ]),
        ]);

        $this->actingAs($user)
            ->getJson(route('account.upgrade.status'))
            ->assertOk()
            ->assertExactJson([
                'status' => PlanUpgrade::STATUS_PENDING,
                'plan' => Membership::FREE,
            ]);
    }

    public function test_upgrade_status_does_not_confirm_a_typed_payment_reference(): void
    {
        $user = User::factory()->create();
        PlanUpgrade::query()->create([
            'user_id' => $user->id,
            'from_plan' => Membership::FREE,
            'to_plan' => Membership::PREMIUM,
            'amount' => 5,
            'currency' => 'KES',
            'billing_period' => 'month',
            'status' => PlanUpgrade::STATUS_PENDING,
            'payment_reference' => 'MPESA12345',
            'payment_method' => 'mpesa',
        ]);

        Http::preventStrayRequests();

        $this->actingAs($user)
            ->getJson(route('account.upgrade.status'))
            ->assertOk()
            ->assertExactJson([
                'status' => PlanUpgrade::STATUS_PENDING,
                'plan' => Membership::FREE,
            ]);
    }

    public function test_scheduled_confirmation_activates_a_succeeded_payment(): void
    {
        Notification::fake();
        PricingPlan::ensureDefaults();
        $this->configurePalpluss();
        $user = User::factory()->create();
        PlanUpgrade::query()->create([
            'user_id' => $user->id,
            'from_plan' => Membership::FREE,
            'to_plan' => Membership::STANDARD,
            'amount' => 2500,
            'currency' => 'KES',
            'billing_period' => 'month',
            'status' => PlanUpgrade::STATUS_PENDING,
            'payment_reference' => 'fa98a577-95ea-4a8f-8467-1fbe74f5d6f4',
            'payment_method' => 'mpesa',
        ]);

        Http::preventStrayRequests();
        Http::fake([
            'sandbox.palpluss.com/v1/transactions/*' => Http::response([
                'success' => true,
                'data' => [
                    'status' => 'SUCCESS',
                    'amount' => 2500,
                ],
            ]),
        ]);

        $this->artisan('payments:confirm-palpluss')->assertSuccessful();

        $this->assertSame(Membership::STANDARD, $user->fresh()->plan);
        $this->assertDatabaseHas('plan_upgrades', [
            'user_id' => $user->id,
            'status' => PlanUpgrade::STATUS_APPROVED,
        ]);
    }

    private function startPalplussUpgrade(): User
    {
        PricingPlan::ensureDefaults();
        $this->configurePalpluss();

        Http::preventStrayRequests();
        Http::fake([
            'sandbox.palpluss.com/v1/payments/stk' => Http::response([
                'success' => true,
                'data' => [
                    'transactionId' => 'fa98a577-95ea-4a8f-8467-1fbe74f5d6f4',
                    'status' => 'PENDING',
                ],
            ]),
        ]);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('account.upgrade.pay'), [
                'to_plan' => Membership::STANDARD,
                'payment_method' => 'mpesa',
                'phone' => '0712345678',
                'amount' => 2500,
                'currency' => 'KES',
            ])
            ->assertOk();

        return $user;
    }

    /**
     * @return array<string, mixed>
     */
    private function successPayload(): array
    {
        return [
            'event' => 'transaction.updated',
            'event_type' => 'transaction.success',
            'transaction' => [
                'id' => 'fa98a577-95ea-4a8f-8467-1fbe74f5d6f4',
                'status' => 'SUCCESS',
                'external_reference' => 'NANYUKINOW',
                'mpesa_receipt' => 'LGR019G3J2',
            ],
        ];
    }

    private function configurePalpluss(): void
    {
        SiteSetting::query()->create([
            'group' => 'payments',
            'key' => 'mobile_money_provider',
            'label' => 'M-Pesa checkout provider',
            'type' => 'select',
            'value' => 'palpluss',
            'sort_order' => 0,
        ]);
        SiteSetting::query()->create([
            'group' => 'payments',
            'key' => 'palpluss_mode',
            'label' => 'Palpluss mode',
            'type' => 'select',
            'value' => 'sandbox',
            'sort_order' => 30,
        ]);
        SiteSetting::query()->create([
            'group' => 'payments',
            'key' => 'palpluss_sandbox_api_key',
            'label' => 'Palpluss API key',
            'type' => 'password',
            'value' => 'pp_test_xxx',
            'sort_order' => 31,
        ]);
        SiteSetting::forgetCache();
    }
}
