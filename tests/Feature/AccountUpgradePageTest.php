<?php

namespace Tests\Feature;

use App\Models\PlanUpgrade;
use App\Models\PricingPlan;
use App\Models\SiteSetting;
use App\Models\User;
use App\Support\Membership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
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
            ->assertHeader('X-LiteSpeed-Cache-Control', 'no-cache')
            ->assertInertia(fn ($page) => $page
                ->component('Account/Upgrade')
                ->has('plans', 3)
                ->has('plansByCategory')
                ->has('categories')
                ->has('paymentMethods', 2)
                ->has('upgradeContact')
                ->where('initialBilling', 'month')
                ->has('plan'));
    }

    public function test_upgrade_status_returns_401_for_guests(): void
    {
        $this->getJson(route('account.upgrade.status'))
            ->assertUnauthorized();
    }

    public function test_upgrade_status_ignores_another_members_payment(): void
    {
        $member = User::factory()->create();
        $other = User::factory()->create();

        PlanUpgrade::query()->create([
            'user_id' => $other->id,
            'from_plan' => Membership::FREE,
            'to_plan' => Membership::PREMIUM,
            'amount' => 5,
            'currency' => 'KES',
            'billing_period' => 'month',
            'status' => PlanUpgrade::STATUS_PENDING,
            'payment_reference' => 'OTHERMEMBER1',
            'payment_method' => 'mpesa',
        ]);

        $this->actingAs($member)
            ->getJson(route('account.upgrade.status'))
            ->assertOk()
            ->assertExactJson([
                'status' => 'none',
                'plan' => Membership::FREE,
                'message' => null,
            ]);
    }

    public function test_upgrade_status_reports_the_signed_in_members_pending_payment(): void
    {
        $member = User::factory()->create();

        PlanUpgrade::query()->create([
            'user_id' => $member->id,
            'from_plan' => Membership::FREE,
            'to_plan' => Membership::PREMIUM,
            'amount' => 5,
            'currency' => 'KES',
            'billing_period' => 'month',
            'status' => PlanUpgrade::STATUS_PENDING,
            'payment_reference' => 'MEMBERPAY1',
            'payment_method' => 'mpesa',
        ]);

        $this->actingAs($member)
            ->getJson(route('account.upgrade.status'))
            ->assertOk()
            ->assertExactJson([
                'status' => PlanUpgrade::STATUS_PENDING,
                'plan' => Membership::FREE,
                'message' => null,
            ]);
    }

    public function test_inertia_upgrade_response_is_not_stored(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('account.upgrade'), [
                'X-Inertia' => 'true',
            ])
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertHeader('X-LiteSpeed-Cache-Control', 'no-cache');
    }

    public function test_member_on_monthly_can_request_same_tier_yearly_upgrade(): void
    {
        PricingPlan::ensureDefaults();
        $user = User::factory()->standard()->create([
            'plan_started_at' => now(),
            'plan_expires_at' => now()->addDays(30),
        ]);

        PlanUpgrade::query()->create([
            'user_id' => $user->id,
            'from_plan' => Membership::FREE,
            'to_plan' => Membership::STANDARD,
            'amount' => 300,
            'currency' => 'KES',
            'billing_period' => 'month',
            'status' => PlanUpgrade::STATUS_APPROVED,
            'payment_reference' => 'MONTHLYSTD1',
            'payment_method' => 'mpesa',
            'reviewed_at' => now(),
        ]);

        $this->actingAs($user)
            ->post(route('account.upgrade.store'), [
                'to_plan' => Membership::STANDARD,
                'billing_period' => 'year',
                'payment_reference' => 'YEARLYSWITCH1',
                'payment_method' => 'mpesa',
            ])
            ->assertRedirect(route('account.index'));

        $this->assertDatabaseHas('plan_upgrades', [
            'user_id' => $user->id,
            'to_plan' => Membership::STANDARD,
            'billing_period' => 'year',
            'status' => PlanUpgrade::STATUS_PENDING,
            'payment_reference' => 'YEARLYSWITCH1',
        ]);
    }

    public function test_upgrade_page_respects_yearly_billing_query(): void
    {
        PricingPlan::ensureDefaults();
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('account.upgrade', ['billing' => 'year']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Account/Upgrade')
                ->where('initialBilling', 'year')
                ->where('plans.1.yearly_price_amount', fn ($v) => $v !== null));
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

    public function test_live_mpesa_pay_fails_until_daraja_is_configured(): void
    {
        PricingPlan::ensureDefaults();
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('account.upgrade.pay'), [
                'to_plan' => Membership::STANDARD,
                'payment_method' => 'mpesa',
                'phone' => '0712345678',
                'amount' => 2500,
                'currency' => 'KES',
            ])
            ->assertUnprocessable()
            ->assertJson([
                'ok' => false,
                'message' => 'Payment failed. Please try again.',
                'can_retry' => true,
            ]);
    }

    public function test_intasend_provider_fails_until_keys_are_configured(): void
    {
        PricingPlan::ensureDefaults();
        SiteSetting::query()->create([
            'group' => 'payments',
            'key' => 'mobile_money_provider',
            'label' => 'M-Pesa checkout provider',
            'type' => 'select',
            'value' => 'intasend',
            'sort_order' => 0,
        ]);
        SiteSetting::forgetCache();

        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('account.upgrade.pay'), [
                'to_plan' => Membership::STANDARD,
                'payment_method' => 'mpesa',
                'phone' => '0712345678',
                'amount' => 2500,
                'currency' => 'KES',
            ])
            ->assertUnprocessable()
            ->assertJson([
                'ok' => false,
                'message' => 'Payment failed. Please try again.',
                'can_retry' => true,
            ]);
    }

    public function test_intasend_provider_initiates_stk_when_configured(): void
    {
        PricingPlan::ensureDefaults();
        SiteSetting::query()->create([
            'group' => 'payments',
            'key' => 'mobile_money_provider',
            'label' => 'M-Pesa checkout provider',
            'type' => 'select',
            'value' => 'intasend',
            'sort_order' => 0,
        ]);
        SiteSetting::query()->create([
            'group' => 'payments',
            'key' => 'intasend_mode',
            'label' => 'IntaSend mode',
            'type' => 'select',
            'value' => 'sandbox',
            'sort_order' => 20,
        ]);
        SiteSetting::query()->create([
            'group' => 'payments',
            'key' => 'intasend_sandbox_secret_key',
            'label' => 'IntaSend sandbox secret key',
            'type' => 'password',
            'value' => 'ISSecretKey_test_xxx',
            'sort_order' => 22,
        ]);
        SiteSetting::query()->create([
            'group' => 'payments',
            'key' => 'intasend_sandbox_public_key',
            'label' => 'IntaSend sandbox public key',
            'type' => 'text',
            'value' => 'ISPubKey_test_xxx',
            'sort_order' => 21,
        ]);
        SiteSetting::forgetCache();

        Http::fake([
            'sandbox.intasend.com/api/v1/payment/mpesa-stk-push/' => Http::response([
                'invoice' => [
                    'invoice_id' => 'INTA-INV-99',
                    'state' => 'PENDING',
                ],
            ], 200),
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
            ->assertOk()
            ->assertJson([
                'ok' => true,
                'provider_ref' => 'INTA-INV-99',
            ]);
    }

    public function test_palpluss_provider_fails_until_api_key_is_configured(): void
    {
        PricingPlan::ensureDefaults();
        $this->configurePalpluss(apiKey: '');

        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('account.upgrade.pay'), [
                'to_plan' => Membership::STANDARD,
                'payment_method' => 'mpesa',
                'phone' => '0712345678',
                'amount' => 2500,
                'currency' => 'KES',
            ])
            ->assertUnprocessable()
            ->assertJson([
                'ok' => false,
                'message' => 'Payment failed. Please try again.',
                'can_retry' => true,
            ]);
    }

    public function test_palpluss_provider_initiates_stk_when_configured(): void
    {
        PricingPlan::ensureDefaults();
        $this->configurePalpluss(channelId: '8b3f1a2c-0000-0000-0000-000000000000');

        Http::preventStrayRequests();
        Http::fake([
            'api.palpluss.com/v1/payments/stk' => Http::response([
                'success' => true,
                'data' => [
                    'transactionId' => 'fa98a577-95ea-4a8f-8467-1fbe74f5d6f4',
                    'status' => 'PENDING',
                ],
                'requestId' => 'c1b2a3d4-0000-0000-0000-000000000000',
            ], 200),
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
            ->assertOk()
            ->assertJson([
                'ok' => true,
                'provider_ref' => 'fa98a577-95ea-4a8f-8467-1fbe74f5d6f4',
                'message' => 'Check your phone and approve the M-Pesa prompt. Your plan activates as soon as the payment succeeds.',
            ]);

        $this->assertDatabaseHas('plan_upgrades', [
            'user_id' => $user->id,
            'status' => 'pending',
            'payment_reference' => 'fa98a577-95ea-4a8f-8467-1fbe74f5d6f4',
            'payment_method' => 'mpesa',
            'to_plan' => Membership::STANDARD,
        ]);

        Http::assertSent(function (Request $request) {
            $authorization = $request->header('Authorization')[0] ?? '';

            return $request->url() === 'https://api.palpluss.com/v1/payments/stk'
                && $authorization === 'Basic '.base64_encode('pk_test_xxx:')
                && $request['phone'] === '254712345678'
                && $request['amount'] === 2500
                && $request['channelId'] === '8b3f1a2c-0000-0000-0000-000000000000'
                && $request['accountReference'] === 'NANYUKINOW'
                && $request['transactionDesc'] === 'Nanyuki Now'
                && str_ends_with((string) $request['callbackUrl'], '/webhooks/palpluss');
        });
    }

    public function test_premium_member_can_renew_current_plan_via_palpluss_stk(): void
    {
        PricingPlan::ensureDefaults();
        $this->configurePalpluss();

        Http::preventStrayRequests();
        Http::fake([
            'api.palpluss.com/v1/payments/stk' => Http::response([
                'success' => true,
                'data' => [
                    'transactionId' => '1c2fdb6e-36d7-4fb8-a84b-9d01ceac9d76',
                    'status' => 'PENDING',
                ],
            ], 200),
        ]);

        $user = User::factory()->premium()->create([
            'plan_expires_at' => now()->addDays(5),
        ]);

        $this->actingAs($user)
            ->postJson(route('account.upgrade.pay'), [
                'to_plan' => Membership::PREMIUM,
                'billing_period' => 'month',
                'payment_method' => 'mpesa',
                'phone' => '0712345678',
            ])
            ->assertOk()
            ->assertJson([
                'ok' => true,
                'provider_ref' => '1c2fdb6e-36d7-4fb8-a84b-9d01ceac9d76',
            ]);

        $this->assertDatabaseHas('plan_upgrades', [
            'user_id' => $user->id,
            'from_plan' => Membership::PREMIUM,
            'to_plan' => Membership::PREMIUM,
            'status' => 'pending',
            'payment_reference' => '1c2fdb6e-36d7-4fb8-a84b-9d01ceac9d76',
        ]);

        Http::assertSent(fn (Request $request) => $request->url() === 'https://api.palpluss.com/v1/payments/stk');
    }

    public function test_premium_member_can_renew_again_while_still_on_premium(): void
    {
        PricingPlan::ensureDefaults();
        $this->configurePalpluss();

        Http::fake([
            'api.palpluss.com/v1/payments/stk' => Http::response([
                'success' => true,
                'data' => [
                    'transactionId' => 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
                    'status' => 'PENDING',
                ],
            ], 200),
        ]);

        $user = User::factory()->premium()->create([
            'plan_started_at' => now()->subDays(5),
            'plan_expires_at' => now()->addDays(40),
        ]);

        $this->actingAs($user)
            ->postJson(route('account.upgrade.pay'), [
                'to_plan' => Membership::PREMIUM,
                'billing_period' => 'month',
                'payment_method' => 'mpesa',
                'phone' => '0742451220',
            ])
            ->assertOk()
            ->assertJson(['ok' => true]);

        $this->assertTrue(Membership::isRenewal($user, Membership::PREMIUM, 'month'));
    }

    public function test_palpluss_live_provider_uses_live_api_and_hides_provider_errors(): void
    {
        PricingPlan::ensureDefaults();
        $this->configurePalpluss(mode: 'live', apiKey: 'pk_live_xxx');

        Http::preventStrayRequests();
        Http::fake([
            'api.palpluss.com/v1/payments/stk' => Http::response([
                'success' => false,
                'error' => [
                    'message' => 'Invalid or revoked API key.',
                    'code' => 'INVALID_API_KEY',
                ],
            ], 401),
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
            ->assertUnprocessable()
            ->assertJson([
                'ok' => false,
                'message' => 'Payment failed. Please try again.',
                'can_retry' => true,
            ]);

        Http::assertSent(fn (Request $request) => $request->url() === 'https://api.palpluss.com/v1/payments/stk'
            && ($request->header('Authorization')[0] ?? '') === 'Basic '.base64_encode('pk_live_xxx:'));
    }

    public function test_live_paypal_pay_creates_sandbox_checkout(): void
    {
        PricingPlan::ensureDefaults();
        $user = User::factory()->create();

        Http::fake([
            'api-m.sandbox.paypal.com/v1/oauth2/token' => Http::response([
                'access_token' => 'TEST_TOKEN',
                'token_type' => 'Bearer',
            ], 200),
            'api-m.sandbox.paypal.com/v2/checkout/orders' => Http::response([
                'id' => 'ORDER-SANDBOX-1',
                'status' => 'CREATED',
                'links' => [
                    [
                        'rel' => 'approve',
                        'href' => 'https://www.sandbox.paypal.com/checkoutnow?token=ORDER-SANDBOX-1',
                    ],
                ],
            ], 201),
        ]);

        $this->actingAs($user)
            ->postJson(route('account.upgrade.pay'), [
                'to_plan' => Membership::PREMIUM,
                'payment_method' => 'paypal',
                'email' => 'buyer@example.com',
                'amount' => 5000,
                'currency' => 'USD',
            ])
            ->assertOk()
            ->assertJson([
                'ok' => true,
                'provider_ref' => 'ORDER-SANDBOX-1',
                'checkout_url' => 'https://www.sandbox.paypal.com/checkoutnow?token=ORDER-SANDBOX-1',
            ]);
    }

    public function test_paypal_converts_kes_to_usd_for_checkout(): void
    {
        PricingPlan::ensureDefaults();
        $user = User::factory()->create();

        Http::fake([
            'api-m.sandbox.paypal.com/v1/oauth2/token' => Http::response([
                'access_token' => 'TEST_TOKEN',
                'token_type' => 'Bearer',
            ], 200),
            'api-m.sandbox.paypal.com/v2/checkout/orders' => Http::response([
                'id' => 'ORDER-KES-USD',
                'status' => 'CREATED',
                'links' => [
                    [
                        'rel' => 'approve',
                        'href' => 'https://www.sandbox.paypal.com/checkoutnow?token=ORDER-KES-USD',
                    ],
                ],
            ], 201),
        ]);

        $this->actingAs($user)
            ->postJson(route('account.upgrade.pay'), [
                'to_plan' => Membership::STANDARD,
                'payment_method' => 'paypal',
                'email' => 'buyer@example.com',
                'amount' => 2500,
                'currency' => 'KES',
            ])
            ->assertOk()
            ->assertJson([
                'ok' => true,
                'provider_ref' => 'ORDER-KES-USD',
            ]);

        Http::assertSent(function ($request) {
            if (! str_contains($request->url(), '/v2/checkout/orders')) {
                return false;
            }

            $amount = $request['purchase_units'][0]['amount'] ?? [];

            return ($amount['currency_code'] ?? null) === 'USD'
                && ($amount['value'] ?? null) === '19.23';
        });
    }

    public function test_live_paypal_pay_fails_when_oauth_rejects(): void
    {
        PricingPlan::ensureDefaults();
        $user = User::factory()->create();

        Http::fake([
            'api-m.sandbox.paypal.com/v1/oauth2/token' => Http::response([
                'error' => 'invalid_client',
            ], 401),
        ]);

        $this->actingAs($user)
            ->postJson(route('account.upgrade.pay'), [
                'to_plan' => Membership::PREMIUM,
                'payment_method' => 'paypal',
                'email' => 'buyer@example.com',
                'amount' => 5000,
                'currency' => 'USD',
            ])
            ->assertUnprocessable()
            ->assertJson([
                'ok' => false,
                'can_retry' => true,
            ]);
    }

    public function test_paypal_pay_requires_email(): void
    {
        PricingPlan::ensureDefaults();
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('account.upgrade.pay'), [
                'to_plan' => Membership::STANDARD,
                'payment_method' => 'paypal',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_mpesa_pay_requires_phone(): void
    {
        PricingPlan::ensureDefaults();
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('account.upgrade.pay'), [
                'to_plan' => Membership::STANDARD,
                'payment_method' => 'mpesa',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['phone']);
    }

    private function configurePalpluss(string $mode = 'sandbox', string $apiKey = 'pk_test_xxx', ?string $channelId = null): void
    {
        $prefix = $mode === 'live' ? 'palpluss_live_' : 'palpluss_sandbox_';

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
            'value' => $mode,
            'sort_order' => 30,
        ]);
        SiteSetting::query()->create([
            'group' => 'payments',
            'key' => $prefix.'api_key',
            'label' => 'Palpluss API key',
            'type' => 'password',
            'value' => $apiKey,
            'sort_order' => 31,
        ]);

        if ($channelId !== null) {
            SiteSetting::query()->create([
                'group' => 'payments',
                'key' => $prefix.'channel_id',
                'label' => 'Palpluss channel ID',
                'type' => 'text',
                'value' => $channelId,
                'sort_order' => 32,
            ]);
        }

        SiteSetting::forgetCache();
    }
}
