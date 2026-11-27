<?php

namespace Tests\Feature;

use App\Models\PlanUpgrade;
use App\Models\PricingPlan;
use App\Models\SiteSetting;
use App\Models\User;
use App\Notifications\PlanUpgradeReviewedNotification;
use App\Support\Membership;
use App\Support\PaymentGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PaystackCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_live_paystack_pay_sends_mpesa_charge_without_redirect(): void
    {
        $this->seedPaystackCredentials();
        PricingPlan::ensureDefaults();

        Http::preventStrayRequests();
        Http::fake([
            'api.paystack.co/charge' => Http::response([
                'status' => true,
                'message' => 'Charge attempted',
                'data' => [
                    'reference' => 'nnup_1_abcdef',
                    'status' => 'pay_offline',
                    'display_text' => 'Please complete authorization process on your mobile phone',
                ],
            ], 200),
        ]);

        $user = User::factory()->create(['email' => 'member@nanyukinow.test']);

        $this->actingAs($user)
            ->postJson(route('account.upgrade.pay'), [
                'to_plan' => Membership::STANDARD,
                'payment_method' => 'paystack',
                'paystack_mode' => 'mpesa',
                'phone' => '0742451220',
            ])
            ->assertOk()
            ->assertJson([
                'ok' => true,
                'checkout_url' => null,
                'provider_ref' => 'nnup_1_abcdef',
            ]);

        Http::assertSent(function (Request $request) use ($user) {
            return $request->url() === 'https://api.paystack.co/charge'
                && $request['email'] === 'member@nanyukinow.test'
                && (int) $request['amount'] === PaymentGateway::paystackAmountSubunits(2500, 'KES')
                && ($request['mobile_money']['provider'] ?? null) === 'mpesa'
                && ($request['mobile_money']['phone'] ?? null) === '+254742451220'
                && ($request['metadata']['user_id'] ?? null) === (string) $user->id;
        });

        $this->assertDatabaseHas('plan_upgrades', [
            'user_id' => $user->id,
            'payment_method' => 'paystack',
            'payment_reference' => 'nnup_1_abcdef',
            'status' => PlanUpgrade::STATUS_PENDING,
        ]);
    }

    public function test_return_from_paystack_verifies_and_activates_the_plan(): void
    {
        Notification::fake();
        [$user, $upgrade] = $this->startPaystackCheckout();
        $amount = PaymentGateway::paystackAmountSubunits((float) $upgrade->amount, (string) $upgrade->currency);

        Http::fake([
            'api.paystack.co/transaction/verify/*' => Http::response(
                $this->successfulTransaction($user, $upgrade->payment_reference, $amount, (string) $upgrade->currency),
                200,
            ),
        ]);

        $this->actingAs($user)
            ->get(route('account.upgrade.paystack.return', ['reference' => $upgrade->payment_reference]))
            ->assertRedirect(route('account.billing'));

        $user->refresh();
        $upgrade->refresh();

        $this->assertSame(Membership::STANDARD, $user->plan);
        $this->assertSame(PlanUpgrade::STATUS_APPROVED, $upgrade->status);
        Notification::assertSentTo($user, PlanUpgradeReviewedNotification::class);
    }

    public function test_charge_success_webhook_activates_the_plan(): void
    {
        Notification::fake();
        [$user, $upgrade] = $this->startPaystackCheckout();
        $amount = PaymentGateway::paystackAmountSubunits((float) $upgrade->amount, (string) $upgrade->currency);
        $reference = $upgrade->payment_reference;

        Http::fake([
            'api.paystack.co/transaction/verify/*' => Http::response(
                $this->successfulTransaction($user, $reference, $amount, (string) $upgrade->currency),
                200,
            ),
        ]);

        $payload = [
            'event' => 'charge.success',
            'data' => [
                'reference' => $reference,
                'status' => 'success',
                'amount' => $amount,
                'currency' => 'KES',
            ],
        ];
        $raw = json_encode($payload, JSON_THROW_ON_ERROR);
        $signature = hash_hmac('sha512', $raw, 'sk_test_paystack_secret');

        $this->call(
            'POST',
            route('webhooks.paystack'),
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_PAYSTACK_SIGNATURE' => $signature,
            ],
            $raw,
        )->assertOk()->assertJson(['received' => true]);

        $this->assertSame(Membership::STANDARD, $user->fresh()->plan);
        Notification::assertSentTo($user, PlanUpgradeReviewedNotification::class);
    }

    public function test_webhook_rejects_invalid_signature(): void
    {
        $this->seedPaystackCredentials();

        $payload = json_encode(['event' => 'charge.success', 'data' => ['reference' => 'nnup_x']], JSON_THROW_ON_ERROR);

        $this->call(
            'POST',
            route('webhooks.paystack'),
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_PAYSTACK_SIGNATURE' => 'bad-signature',
            ],
            $payload,
        )->assertStatus(401)->assertJson(['error' => 'Invalid signature']);
    }

    public function test_mismatched_paystack_amount_does_not_activate_the_plan(): void
    {
        [$user, $upgrade] = $this->startPaystackCheckout();

        Http::fake([
            'api.paystack.co/transaction/verify/*' => Http::response(
                $this->successfulTransaction($user, $upgrade->payment_reference, 100, 'KES'),
                200,
            ),
        ]);

        $this->get(route('account.upgrade.paystack.return', ['reference' => $upgrade->payment_reference]))
            ->assertRedirect(route('account.upgrade'));

        $this->assertNotSame(Membership::STANDARD, $user->fresh()->plan);
        $this->assertDatabaseHas('plan_upgrades', [
            'user_id' => $user->id,
            'status' => PlanUpgrade::STATUS_PENDING,
        ]);
    }

    public function test_failed_webhook_cancels_the_pending_upgrade(): void
    {
        [$user, $upgrade] = $this->startPaystackCheckout();
        $payload = [
            'event' => 'charge.failed',
            'data' => [
                'reference' => $upgrade->payment_reference,
                'status' => 'failed',
            ],
        ];
        $raw = json_encode($payload, JSON_THROW_ON_ERROR);
        $signature = hash_hmac('sha512', $raw, 'sk_test_paystack_secret');

        $this->call(
            'POST',
            route('webhooks.paystack'),
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_PAYSTACK_SIGNATURE' => $signature,
            ],
            $raw,
        )->assertOk();

        $this->assertDatabaseHas('plan_upgrades', [
            'user_id' => $user->id,
            'status' => PlanUpgrade::STATUS_CANCELLED,
        ]);
    }

    public function test_paystack_mpesa_requires_phone(): void
    {
        $this->seedPaystackCredentials();
        PricingPlan::ensureDefaults();
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('account.upgrade.pay'), [
                'to_plan' => Membership::STANDARD,
                'payment_method' => 'paystack',
                'paystack_mode' => 'mpesa',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_paystack_card_unavailable_channel_returns_clear_message(): void
    {
        $this->seedPaystackCredentials();
        PricingPlan::ensureDefaults();

        Http::preventStrayRequests();
        Http::fake([
            'api.paystack.co/transaction/initialize' => Http::response([
                'status' => false,
                'message' => 'No active channel to process transaction. Please contact merchant',
                'type' => 'validation_error',
                'code' => 'invalid_params',
            ], 400),
        ]);

        $user = User::factory()->create(['email' => 'card@nanyukinow.test']);

        $this->actingAs($user)
            ->postJson(route('account.upgrade.pay'), [
                'to_plan' => Membership::STANDARD,
                'payment_method' => 'paystack',
                'paystack_mode' => 'card',
            ])
            ->assertStatus(422)
            ->assertJsonFragment([
                'ok' => false,
            ])
            ->assertJsonPath('message', fn (string $message) => str_contains($message, 'Card is not enabled'));
    }

    public function test_live_paystack_card_returns_access_code_for_popup(): void
    {
        $this->seedPaystackCredentials();
        PricingPlan::ensureDefaults();

        Http::preventStrayRequests();
        Http::fake([
            'api.paystack.co/transaction/initialize' => Http::response([
                'status' => true,
                'message' => 'Authorization URL created',
                'data' => [
                    'authorization_url' => 'https://checkout.paystack.com/card_demo',
                    'access_code' => 'card_demo_access',
                    'reference' => 'nnup_2_cardref',
                ],
            ], 200),
        ]);

        $user = User::factory()->create(['email' => 'card@nanyukinow.test']);

        $this->actingAs($user)
            ->postJson(route('account.upgrade.pay'), [
                'to_plan' => Membership::STANDARD,
                'payment_method' => 'paystack',
                'paystack_mode' => 'card',
            ])
            ->assertOk()
            ->assertJson([
                'ok' => true,
                'access_code' => 'card_demo_access',
                'checkout_url' => null,
                'provider_ref' => 'nnup_2_cardref',
            ]);

        Http::assertSent(function (Request $request) use ($user) {
            return $request->url() === 'https://api.paystack.co/transaction/initialize'
                && $request['email'] === 'card@nanyukinow.test'
                && (int) $request['amount'] === PaymentGateway::paystackAmountSubunits(2500, 'KES')
                && ($request['channels'] ?? null) === ['card']
                && ($request['metadata']['user_id'] ?? null) === (string) $user->id
                && ($request['metadata']['paystack_mode'] ?? null) === 'card';
        });

        $this->assertDatabaseHas('plan_upgrades', [
            'user_id' => $user->id,
            'payment_method' => 'paystack',
            'payment_reference' => 'nnup_2_cardref',
            'status' => PlanUpgrade::STATUS_PENDING,
        ]);
    }

    /**
     * @return array{0: User, 1: PlanUpgrade}
     */
    private function startPaystackCheckout(): array
    {
        $this->seedPaystackCredentials();
        PricingPlan::ensureDefaults();

        Http::preventStrayRequests();
        Http::fake([
            'api.paystack.co/charge' => Http::response([
                'status' => true,
                'data' => [
                    'reference' => 'nnup_9_sandbox1',
                    'status' => 'pay_offline',
                    'display_text' => 'Please complete authorization process on your mobile phone',
                ],
            ], 200),
        ]);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('account.upgrade.pay'), [
                'to_plan' => Membership::STANDARD,
                'payment_method' => 'paystack',
                'phone' => '0742451220',
            ])
            ->assertOk();

        $upgrade = PlanUpgrade::query()->where('user_id', $user->id)->firstOrFail();

        return [$user, $upgrade];
    }

    private function seedPaystackCredentials(): void
    {
        SiteSetting::query()->updateOrCreate(
            ['key' => 'paystack_mode'],
            [
                'group' => 'payments',
                'label' => 'Paystack mode',
                'type' => 'select',
                'value' => 'sandbox',
                'sort_order' => 20,
            ],
        );
        SiteSetting::query()->updateOrCreate(
            ['key' => 'paystack_sandbox_secret_key'],
            [
                'group' => 'payments',
                'label' => 'Paystack sandbox secret key',
                'type' => 'password',
                'value' => 'sk_test_paystack_secret',
                'sort_order' => 23,
            ],
        );
        SiteSetting::query()->updateOrCreate(
            ['key' => 'enabled_checkout_methods'],
            [
                'group' => 'payments',
                'label' => 'Enabled checkout methods',
                'type' => 'text',
                'value' => 'mpesa,paypal,paystack',
                'sort_order' => 0,
            ],
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function successfulTransaction(User $user, string $reference, int $amount, string $currency): array
    {
        return [
            'status' => true,
            'message' => 'Verification successful',
            'data' => [
                'status' => 'success',
                'reference' => $reference,
                'amount' => $amount,
                'currency' => $currency,
                'metadata' => [
                    'user_id' => (string) $user->id,
                ],
            ],
        ];
    }
}
