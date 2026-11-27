<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPaymentSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_settings_include_mobile_money_provider_switch(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->get(route('admin.settings.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Settings/Index')
                ->has('groupedSettings.payments')
                ->where('groupedSettings.payments.0.key', 'enabled_checkout_methods')
                ->where('groupedSettings.payments.0.value', 'mpesa,paypal,paystack')
                ->where('groupedSettings.payments.1.key', 'mobile_money_provider')
                ->where('groupedSettings.payments.1.value', 'mpesa')
                ->where('groupedSettings.payments.1.options.0.value', 'mpesa')
                ->where('groupedSettings.payments.1.options.1.value', 'intasend')
                ->where('groupedSettings.payments.1.options.2.value', 'palpluss')
                ->etc());
    }

    public function test_admin_can_switch_mobile_money_provider_to_intasend(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)->get(route('admin.settings.index'))->assertOk();

        $this->actingAs($admin)
            ->put(route('admin.settings.update'), [
                'settings' => [
                    ['key' => 'mobile_money_provider', 'value' => 'intasend'],
                    ['key' => 'paypal_mode', 'value' => 'sandbox'],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('site_settings', [
            'key' => 'mobile_money_provider',
            'value' => 'intasend',
        ]);
    }

    public function test_admin_can_switch_mobile_money_provider_to_palpluss(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)->get(route('admin.settings.index'))->assertOk();

        $this->actingAs($admin)
            ->put(route('admin.settings.update'), [
                'settings' => [
                    ['key' => 'mobile_money_provider', 'value' => 'palpluss'],
                    ['key' => 'palpluss_mode', 'value' => 'sandbox'],
                    ['key' => 'palpluss_sandbox_api_key', 'value' => 'pk_test_xxx'],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('site_settings', [
            'key' => 'mobile_money_provider',
            'value' => 'palpluss',
        ]);
        $this->assertDatabaseHas('site_settings', [
            'key' => 'palpluss_sandbox_api_key',
            'value' => 'pk_test_xxx',
        ]);
    }

    public function test_admin_can_switch_paypal_mode_to_live(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)->get(route('admin.settings.index'))->assertOk();

        $this->actingAs($admin)
            ->put(route('admin.settings.update'), [
                'settings' => [
                    ['key' => 'paypal_mode', 'value' => 'live'],
                    ['key' => 'mpesa_mode', 'value' => 'sandbox'],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('site_settings', [
            'key' => 'paypal_mode',
            'value' => 'live',
        ]);
    }
}
