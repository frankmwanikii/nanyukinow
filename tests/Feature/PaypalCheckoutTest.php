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
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class PaypalCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_return_from_paypal_captures_the_order_and_activates_the_plan(): void
    {
        Notification::fake();
        [$user, $upgrade] = $this->startPaypalCheckout();
        [$amount, $currency] = PaymentGateway::paypalChargeAmount((float) $upgrade->amount, (string) $upgrade->currency);

        Http::fake([
            'api-m.sandbox.paypal.com/v1/oauth2/token' => Http::response(['access_token' => 'TEST_TOKEN'], 200),
            'api-m.sandbox.paypal.com/v2/checkout/orders/ORDER-SANDBOX-1/capture' => Http::response(
                $this->completedOrder($user, $amount, $currency),
                201,
            ),
        ]);

        $this->actingAs($user)
            ->get(route('account.upgrade.paypal.return', ['token' => 'ORDER-SANDBOX-1']))
            ->assertRedirect(route('account.billing'));

        $user->refresh();
        $upgrade->refresh();

        $this->assertSame(Membership::STANDARD, $user->plan);
        $this->assertSame(PlanUpgrade::STATUS_APPROVED, $upgrade->status);
        $this->assertSame('CAP-1', $upgrade->payment_reference);
        Notification::assertSentTo($user, PlanUpgradeReviewedNotification::class);
    }

    public function test_capture_webhook_activates_the_plan_when_paypal_confirms_it(): void
    {
        Notification::fake();
        [$user, $upgrade] = $this->startPaypalCheckout();
        [$amount, $currency] = PaymentGateway::paypalChargeAmount((float) $upgrade->amount, (string) $upgrade->currency);

        $this->fakePaypalWebhookApis([
            'api-m.sandbox.paypal.com/v2/checkout/orders/ORDER-SANDBOX-1' => Http::response(
                $this->completedOrder($user, $amount, $currency),
                200,
            ),
        ]);

        $this->postSignedPaypalWebhook([
            'event_type' => 'PAYMENT.CAPTURE.COMPLETED',
            'resource' => [
                'id' => 'CAP-1',
                'status' => 'COMPLETED',
                'supplementary_data' => [
                    'related_ids' => ['order_id' => 'ORDER-SANDBOX-1'],
                ],
            ],
        ])->assertOk()->assertJson(['received' => true]);

        $this->assertSame(Membership::STANDARD, $user->fresh()->plan);
        Notification::assertSentTo($user, PlanUpgradeReviewedNotification::class);
    }

    public function test_repeated_capture_webhook_does_not_extend_the_plan(): void
    {
        Notification::fake();
        $this->freezeTime();
        [$user, $upgrade] = $this->startPaypalCheckout();
        [$amount, $currency] = PaymentGateway::paypalChargeAmount((float) $upgrade->amount, (string) $upgrade->currency);

        $this->fakePaypalWebhookApis([
            'api-m.sandbox.paypal.com/v2/checkout/orders/ORDER-SANDBOX-1' => Http::response(
                $this->completedOrder($user, $amount, $currency),
                200,
            ),
        ]);

        $payload = [
            'event_type' => 'PAYMENT.CAPTURE.COMPLETED',
            'resource' => [
                'supplementary_data' => [
                    'related_ids' => ['order_id' => 'ORDER-SANDBOX-1'],
                ],
            ],
        ];

        $this->postSignedPaypalWebhook($payload)->assertOk();
        $expiresAt = $user->fresh()->plan_expires_at;
        $this->postSignedPaypalWebhook($payload)->assertOk();

        $this->assertTrue($user->fresh()->plan_expires_at->equalTo($expiresAt));
        Notification::assertSentToTimes($user, PlanUpgradeReviewedNotification::class, 1);
    }

    public function test_mismatched_paypal_amount_does_not_activate_the_plan(): void
    {
        [$user] = $this->startPaypalCheckout();

        $this->fakePaypalWebhookApis([
            'api-m.sandbox.paypal.com/v2/checkout/orders/ORDER-SANDBOX-1' => Http::response(
                $this->completedOrder($user, '1.00', 'USD'),
                200,
            ),
        ]);

        $this->postSignedPaypalWebhook([
            'event_type' => 'PAYMENT.CAPTURE.COMPLETED',
            'resource' => [
                'supplementary_data' => [
                    'related_ids' => ['order_id' => 'ORDER-SANDBOX-1'],
                ],
            ],
        ])->assertOk();

        $this->assertNotSame(Membership::STANDARD, $user->fresh()->plan);
        $this->assertDatabaseHas('plan_upgrades', [
            'user_id' => $user->id,
            'status' => PlanUpgrade::STATUS_PENDING,
        ]);
    }

    public function test_denied_webhook_cancels_the_pending_upgrade(): void
    {
        [$user] = $this->startPaypalCheckout();

        $this->fakePaypalWebhookApis();

        $this->postSignedPaypalWebhook([
            'event_type' => 'PAYMENT.CAPTURE.DENIED',
            'resource' => [
                'supplementary_data' => [
                    'related_ids' => ['order_id' => 'ORDER-SANDBOX-1'],
                ],
            ],
        ])->assertOk();

        $this->assertDatabaseHas('plan_upgrades', [
            'user_id' => $user->id,
            'status' => PlanUpgrade::STATUS_CANCELLED,
        ]);
    }

    public function test_webhook_returns_503_when_paypal_cannot_confirm_the_order(): void
    {
        [$user] = $this->startPaypalCheckout();

        Http::preventStrayRequests();
        Http::fake([
            'api-m.sandbox.paypal.com/v1/oauth2/token' => Http::response(['access_token' => 'TEST_TOKEN'], 200),
            'api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature' => Http::response([
                'verification_status' => 'SUCCESS',
            ], 200),
            'api-m.sandbox.paypal.com/v2/checkout/orders/*' => Http::failedConnection(),
        ]);
        $this->seedPaypalWebhookId();

        $this->postSignedPaypalWebhook([
            'event_type' => 'PAYMENT.CAPTURE.COMPLETED',
            'resource' => [
                'supplementary_data' => [
                    'related_ids' => ['order_id' => 'ORDER-SANDBOX-1'],
                ],
            ],
        ])->assertStatus(503);

        $this->assertDatabaseHas('plan_upgrades', [
            'user_id' => $user->id,
            'status' => PlanUpgrade::STATUS_PENDING,
        ]);
    }

    public function test_webhook_rejects_an_invalid_payload(): void
    {
        $this->fakePaypalWebhookApis();

        $this->postSignedPaypalWebhook([])
            ->assertStatus(400)
            ->assertJson(['error' => 'Invalid payload']);
    }

    /**
     * @return array{0: User, 1: PlanUpgrade}
     */
    private function startPaypalCheckout(): array
    {
        PricingPlan::ensureDefaults();

        Http::preventStrayRequests();
        Http::fake([
            'api-m.sandbox.paypal.com/v1/oauth2/token' => Http::response(['access_token' => 'TEST_TOKEN'], 200),
            'api-m.sandbox.paypal.com/v2/checkout/orders' => Http::response([
                'id' => 'ORDER-SANDBOX-1',
                'status' => 'CREATED',
                'links' => [
                    ['rel' => 'approve', 'href' => 'https://www.sandbox.paypal.com/checkoutnow?token=ORDER-SANDBOX-1'],
                ],
            ], 201),
        ]);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('account.upgrade.pay'), [
                'to_plan' => Membership::STANDARD,
                'payment_method' => 'paypal',
                'email' => 'buyer@example.com',
                'amount' => 2500,
                'currency' => 'KES',
            ])
            ->assertOk();

        Http::assertSent(function (Request $request) {
            return str_ends_with($request->url(), '/v2/checkout/orders')
                && str_contains((string) $request['application_context']['return_url'], '/account/upgrade/paypal/return');
        });

        $upgrade = PlanUpgrade::query()->where('user_id', $user->id)->firstOrFail();

        return [$user, $upgrade];
    }

    /**
     * @return array<string, mixed>
     */
    private function completedOrder(User $user, string $amount, string $currency): array
    {
        return [
            'id' => 'ORDER-SANDBOX-1',
            'status' => 'COMPLETED',
            'purchase_units' => [[
                'custom_id' => (string) $user->id,
                'amount' => [
                    'currency_code' => $currency,
                    'value' => $amount,
                ],
                'payments' => [
                    'captures' => [[
                        'id' => 'CAP-1',
                        'status' => 'COMPLETED',
                    ]],
                ],
            ]],
        ];
    }

    /**
     * @param  array<string, mixed>  $extraFakes
     */
    private function fakePaypalWebhookApis(array $extraFakes = []): void
    {
        $this->seedPaypalWebhookId();
        Http::fake(array_merge([
            'api-m.sandbox.paypal.com/v1/oauth2/token' => Http::response(['access_token' => 'TEST_TOKEN'], 200),
            'api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature' => Http::response([
                'verification_status' => 'SUCCESS',
            ], 200),
        ], $extraFakes));
    }

    private function seedPaypalWebhookId(): void
    {
        SiteSetting::query()->updateOrCreate(
            ['key' => 'paypal_mode'],
            [
                'group' => 'payments',
                'label' => 'PayPal mode',
                'type' => 'select',
                'value' => 'sandbox',
                'sort_order' => 10,
            ],
        );
        SiteSetting::query()->updateOrCreate(
            ['key' => 'paypal_sandbox_webhook_id'],
            [
                'group' => 'payments',
                'label' => 'PayPal sandbox webhook ID',
                'type' => 'text',
                'value' => 'WH-TEST-123',
                'sort_order' => 15,
            ],
        );
        SiteSetting::forgetCache();
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function postSignedPaypalWebhook(array $payload): TestResponse
    {
        $raw = json_encode($payload, JSON_THROW_ON_ERROR);

        return $this->call(
            'POST',
            route('webhooks.paypal'),
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_PAYPAL_AUTH_ALGO' => 'SHA256withRSA',
                'HTTP_PAYPAL_CERT_URL' => 'https://api.sandbox.paypal.com/v1/notifications/certs/CERT-1',
                'HTTP_PAYPAL_TRANSMISSION_ID' => 'tx-'.bin2hex(random_bytes(3)),
                'HTTP_PAYPAL_TRANSMISSION_SIG' => 'sig',
                'HTTP_PAYPAL_TRANSMISSION_TIME' => '2026-01-01T00:00:00Z',
            ],
            $raw,
        );
    }
}
