<?php

namespace Tests\Feature;

use App\Models\PlanUpgrade;
use App\Models\PricingPlan;
use App\Models\SiteSetting;
use App\Models\User;
use App\Support\Membership;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
            ->assertInertia(fn ($page) => $page
                ->component('Account/Upgrade')
                ->has('plans', 3)
                ->has('paymentMethods', 2)
                ->has('upgradeContact')
                ->where('initialBilling', 'month')
                ->has('plan'));
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
}
