<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        $this->ensureDefaults();
        $this->ensureBillingDefaults();
        $this->ensurePaymentGatewayDefaults();
        $this->ensureSocialDefaults();

        $settings = SiteSetting::query()
            ->whereIn('group', ['branding', 'pages', 'billing', 'payments', 'social', 'seo'])
            ->orderBy('group')
            ->orderBy('sort_order')
            ->get()
            ->groupBy('group')
            ->map(fn ($group) => $group->map(fn (SiteSetting $setting) => [
                'id' => $setting->id,
                'key' => $setting->key,
                'label' => $setting->label,
                'type' => $setting->type,
                'value' => $setting->value,
                'help' => $setting->help,
                'options' => $this->optionsFor($setting->key),
            ])->values());

        return Inertia::render('Admin/Settings/Index', [
            'groupedSettings' => $settings,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string', 'exists:site_settings,key'],
            'settings.*.value' => ['nullable', 'string'],
        ]);

        foreach ($data['settings'] as $row) {
            SiteSetting::query()
                ->where('key', $row['key'])
                ->update(['value' => $row['value']]);
        }

        SiteSetting::forgetCache();

        return back()->with('success', 'Site settings saved.');
    }

    private function ensureDefaults(): void
    {
        if (SiteSetting::query()->exists()) {
            return;
        }

        $defaults = [
            ['group' => 'branding', 'key' => 'site_name', 'label' => 'Site name', 'type' => 'text', 'value' => 'Nanyuki Now', 'help' => 'Shown in the header and browser title.', 'sort_order' => 1],
            ['group' => 'branding', 'key' => 'site_tagline', 'label' => 'Tagline', 'type' => 'text', 'value' => 'Discover Nanyuki', 'help' => 'Short supporting line under the brand.', 'sort_order' => 2],
            ['group' => 'branding', 'key' => 'logo_url', 'label' => 'Logo URL', 'type' => 'image', 'value' => '/images/logo.png', 'help' => 'Primary logo image path or URL.', 'sort_order' => 3],
            ['group' => 'branding', 'key' => 'favicon_url', 'label' => 'Favicon URL', 'type' => 'image', 'value' => '/favicon.ico', 'help' => null, 'sort_order' => 4],
            ['group' => 'pages', 'key' => 'contact_email', 'label' => 'Contact email', 'type' => 'text', 'value' => 'hello@nanyukinow.co.ke', 'help' => null, 'sort_order' => 1],
            ['group' => 'pages', 'key' => 'contact_phone', 'label' => 'Contact phone', 'type' => 'text', 'value' => '', 'help' => null, 'sort_order' => 2],
            ['group' => 'pages', 'key' => 'footer_blurb', 'label' => 'Footer blurb', 'type' => 'textarea', 'value' => 'Nanyuki Now — your local directory for places worth knowing.', 'help' => null, 'sort_order' => 3],
            ['group' => 'billing', 'key' => 'upgrade_whatsapp', 'label' => 'Upgrade WhatsApp', 'type' => 'text', 'value' => '', 'help' => 'WhatsApp number members can message after paying (e.g. 2547…).', 'sort_order' => 1],
            ['group' => 'billing', 'key' => 'upgrade_mpesa_paybill', 'label' => 'M-Pesa Paybill / Till', 'type' => 'text', 'value' => '542542', 'help' => 'Shown on the public pricing & upgrade pages.', 'sort_order' => 2],
            ['group' => 'billing', 'key' => 'upgrade_mpesa_account', 'label' => 'M-Pesa account reference', 'type' => 'text', 'value' => '451220', 'help' => 'Account number members should use with Paybill.', 'sort_order' => 3],
            ['group' => 'billing', 'key' => 'upgrade_paypal_email', 'label' => 'PayPal email', 'type' => 'text', 'value' => '', 'help' => 'Shown when members choose PayPal.', 'sort_order' => 4],
            ['group' => 'billing', 'key' => 'upgrade_intasend_note', 'label' => 'IntaSend instructions', 'type' => 'textarea', 'value' => 'Complete payment in IntaSend, then paste your IntaSend transaction / invoice ID.', 'help' => null, 'sort_order' => 5],
            ['group' => 'billing', 'key' => 'upgrade_paypal_note', 'label' => 'PayPal instructions', 'type' => 'textarea', 'value' => 'Send payment via PayPal, then paste your PayPal transaction ID.', 'help' => null, 'sort_order' => 6],
            ['group' => 'billing', 'key' => 'upgrade_instructions', 'label' => 'Upgrade instructions', 'type' => 'textarea', 'value' => 'Choose a plan, pick how you want to pay (M-Pesa, IntaSend, or PayPal), then submit your payment reference. We’ll activate your plan after verifying payment.', 'help' => 'Shown to members when upgrading.', 'sort_order' => 7],
            ['group' => 'social', 'key' => 'facebook_url', 'label' => 'Facebook', 'type' => 'text', 'value' => '', 'help' => null, 'sort_order' => 1],
            ['group' => 'social', 'key' => 'instagram_url', 'label' => 'Instagram', 'type' => 'text', 'value' => '', 'help' => null, 'sort_order' => 2],
            ['group' => 'social', 'key' => 'twitter_url', 'label' => 'X / Twitter', 'type' => 'text', 'value' => '', 'help' => null, 'sort_order' => 3],
            ['group' => 'social', 'key' => 'youtube_url', 'label' => 'YouTube', 'type' => 'text', 'value' => '', 'help' => null, 'sort_order' => 4],
            ['group' => 'seo', 'key' => 'meta_description', 'label' => 'Default meta description', 'type' => 'textarea', 'value' => 'Discover listings, stays, and stories in Nanyuki.', 'help' => null, 'sort_order' => 1],
            ['group' => 'seo', 'key' => 'og_image', 'label' => 'Default share image', 'type' => 'image', 'value' => '', 'help' => 'Open Graph / social preview image.', 'sort_order' => 2],
        ];

        foreach ($defaults as $row) {
            SiteSetting::query()->create($row);
        }
    }

    private function ensureBillingDefaults(): void
    {
        $billing = [
            ['group' => 'billing', 'key' => 'upgrade_whatsapp', 'label' => 'Upgrade WhatsApp', 'type' => 'text', 'value' => '', 'help' => 'WhatsApp number members can message after paying (e.g. 2547…).', 'sort_order' => 1],
            ['group' => 'billing', 'key' => 'upgrade_mpesa_paybill', 'label' => 'M-Pesa Paybill / Till', 'type' => 'text', 'value' => '542542', 'help' => 'Shown on the public pricing & upgrade pages.', 'sort_order' => 2],
            ['group' => 'billing', 'key' => 'upgrade_mpesa_account', 'label' => 'M-Pesa account reference', 'type' => 'text', 'value' => '451220', 'help' => 'Account number members should use with Paybill.', 'sort_order' => 3],
            ['group' => 'billing', 'key' => 'upgrade_paypal_email', 'label' => 'PayPal email', 'type' => 'text', 'value' => '', 'help' => 'Shown when members choose PayPal.', 'sort_order' => 4],
            ['group' => 'billing', 'key' => 'upgrade_intasend_note', 'label' => 'IntaSend instructions', 'type' => 'textarea', 'value' => 'Complete payment in IntaSend, then paste your IntaSend transaction / invoice ID.', 'help' => null, 'sort_order' => 5],
            ['group' => 'billing', 'key' => 'upgrade_paypal_note', 'label' => 'PayPal instructions', 'type' => 'textarea', 'value' => 'Send payment via PayPal, then paste your PayPal transaction ID.', 'help' => null, 'sort_order' => 6],
            ['group' => 'billing', 'key' => 'upgrade_instructions', 'label' => 'Upgrade instructions', 'type' => 'textarea', 'value' => 'Choose a plan, pick how you want to pay (M-Pesa, IntaSend, or PayPal), then submit your payment reference. We’ll activate your plan after verifying payment.', 'help' => 'Shown to members when upgrading.', 'sort_order' => 7],
        ];

        foreach ($billing as $row) {
            SiteSetting::query()->firstOrCreate(
                ['key' => $row['key']],
                $row,
            );
        }
    }

    private function ensurePaymentGatewayDefaults(): void
    {
        $payments = [
            [
                'group' => 'payments',
                'key' => 'mobile_money_provider',
                'label' => 'M-Pesa checkout provider',
                'type' => 'select',
                'value' => 'mpesa',
                'help' => 'Members still see M-Pesa. Choose whether STK runs through Safaricom Daraja or IntaSend.',
                'sort_order' => 0,
            ],
            [
                'group' => 'payments',
                'key' => 'paypal_mode',
                'label' => 'PayPal mode',
                'type' => 'select',
                'value' => 'sandbox',
                'help' => 'Sandbox for testing. Switch to Live only with production credentials.',
                'sort_order' => 1,
            ],
            [
                'group' => 'payments',
                'key' => 'paypal_sandbox_client_id',
                'label' => 'PayPal sandbox client ID',
                'type' => 'text',
                'value' => 'BAArAU7QuOwie6GylyZKkHtHBsUIvyjvKrJX-UPEurvQOic1-upqESJEfsT950Bc4YcpCz7mBdCw1-qO2Y',
                'help' => 'From PayPal Developer → Sandbox apps.',
                'sort_order' => 2,
            ],
            [
                'group' => 'payments',
                'key' => 'paypal_sandbox_secret',
                'label' => 'PayPal sandbox secret',
                'type' => 'password',
                'value' => 'EOFR-tNNYN4XtEH49K8Ej82xJGNvCnAtRFZMwjMXiZpAH6MgFsS4Mwds_uDQjQJHQv4_rOoRuNfrT35h',
                'help' => 'Keep private. Used only when PayPal mode is Sandbox.',
                'sort_order' => 3,
            ],
            [
                'group' => 'payments',
                'key' => 'paypal_live_client_id',
                'label' => 'PayPal live client ID',
                'type' => 'text',
                'value' => '',
                'help' => 'Production app client ID. Used when mode is Live.',
                'sort_order' => 4,
            ],
            [
                'group' => 'payments',
                'key' => 'paypal_live_secret',
                'label' => 'PayPal live secret',
                'type' => 'password',
                'value' => '',
                'help' => 'Production secret. Used when mode is Live.',
                'sort_order' => 5,
            ],
            [
                'group' => 'payments',
                'key' => 'paypal_checkout_currency',
                'label' => 'PayPal charge currency',
                'type' => 'text',
                'value' => 'USD',
                'help' => 'Currency sent to PayPal (KES is not supported on most accounts). Plans in KES are converted.',
                'sort_order' => 6,
            ],
            [
                'group' => 'payments',
                'key' => 'paypal_kes_per_usd',
                'label' => 'KES per 1 USD (PayPal)',
                'type' => 'text',
                'value' => '130',
                'help' => 'Used to convert plan prices from KES to USD for PayPal checkout. Example: 2500 KES ÷ 130 ≈ $19.23.',
                'sort_order' => 7,
            ],
            [
                'group' => 'payments',
                'key' => 'mpesa_mode',
                'label' => 'M-Pesa (Daraja) mode',
                'type' => 'select',
                'value' => 'sandbox',
                'help' => 'Used when M-Pesa checkout provider is set to M-Pesa (Daraja).',
                'sort_order' => 10,
            ],
            [
                'group' => 'payments',
                'key' => 'mpesa_sandbox_consumer_key',
                'label' => 'M-Pesa sandbox consumer key',
                'type' => 'text',
                'value' => '',
                'help' => 'From Daraja portal → Sandbox app.',
                'sort_order' => 11,
            ],
            [
                'group' => 'payments',
                'key' => 'mpesa_sandbox_consumer_secret',
                'label' => 'M-Pesa sandbox consumer secret',
                'type' => 'password',
                'value' => '',
                'help' => null,
                'sort_order' => 12,
            ],
            [
                'group' => 'payments',
                'key' => 'mpesa_sandbox_shortcode',
                'label' => 'M-Pesa sandbox shortcode',
                'type' => 'text',
                'value' => '',
                'help' => 'Usually 174379 for Daraja sandbox Lipa Na M-Pesa.',
                'sort_order' => 13,
            ],
            [
                'group' => 'payments',
                'key' => 'mpesa_sandbox_passkey',
                'label' => 'M-Pesa sandbox passkey',
                'type' => 'password',
                'value' => '',
                'help' => 'Lipa Na M-Pesa Online passkey from Daraja.',
                'sort_order' => 14,
            ],
            [
                'group' => 'payments',
                'key' => 'mpesa_live_consumer_key',
                'label' => 'M-Pesa live consumer key',
                'type' => 'text',
                'value' => '',
                'help' => null,
                'sort_order' => 15,
            ],
            [
                'group' => 'payments',
                'key' => 'mpesa_live_consumer_secret',
                'label' => 'M-Pesa live consumer secret',
                'type' => 'password',
                'value' => '',
                'help' => null,
                'sort_order' => 16,
            ],
            [
                'group' => 'payments',
                'key' => 'mpesa_live_shortcode',
                'label' => 'M-Pesa live shortcode / paybill',
                'type' => 'text',
                'value' => '',
                'help' => 'Your production Paybill or Till for STK push.',
                'sort_order' => 17,
            ],
            [
                'group' => 'payments',
                'key' => 'mpesa_live_passkey',
                'label' => 'M-Pesa live passkey',
                'type' => 'password',
                'value' => '',
                'help' => null,
                'sort_order' => 18,
            ],
            [
                'group' => 'payments',
                'key' => 'mpesa_callback_url',
                'label' => 'M-Pesa STK callback URL',
                'type' => 'text',
                'value' => '',
                'help' => 'Optional. Leave blank to use the default /webhooks/mpesa/stk on this site.',
                'sort_order' => 19,
            ],
            [
                'group' => 'payments',
                'key' => 'intasend_mode',
                'label' => 'IntaSend mode',
                'type' => 'select',
                'value' => 'sandbox',
                'help' => 'Used when M-Pesa checkout provider is set to IntaSend.',
                'sort_order' => 20,
            ],
            [
                'group' => 'payments',
                'key' => 'intasend_sandbox_public_key',
                'label' => 'IntaSend sandbox public key',
                'type' => 'text',
                'value' => '',
                'help' => 'ISPubKey_test_… from IntaSend sandbox.',
                'sort_order' => 21,
            ],
            [
                'group' => 'payments',
                'key' => 'intasend_sandbox_secret_key',
                'label' => 'IntaSend sandbox secret key',
                'type' => 'password',
                'value' => '',
                'help' => 'ISSecretKey_test_… Keep private.',
                'sort_order' => 22,
            ],
            [
                'group' => 'payments',
                'key' => 'intasend_live_public_key',
                'label' => 'IntaSend live public key',
                'type' => 'text',
                'value' => '',
                'help' => 'ISPubKey_live_…',
                'sort_order' => 23,
            ],
            [
                'group' => 'payments',
                'key' => 'intasend_live_secret_key',
                'label' => 'IntaSend live secret key',
                'type' => 'password',
                'value' => '',
                'help' => 'ISSecretKey_live_… Keep private.',
                'sort_order' => 24,
            ],
        ];

        foreach ($payments as $row) {
            SiteSetting::query()->firstOrCreate(
                ['key' => $row['key']],
                $row,
            );
        }
    }

    private function ensureSocialDefaults(): void
    {
        $social = [
            ['group' => 'social', 'key' => 'facebook_url', 'label' => 'Facebook', 'type' => 'text', 'value' => '', 'help' => null, 'sort_order' => 1],
            ['group' => 'social', 'key' => 'instagram_url', 'label' => 'Instagram', 'type' => 'text', 'value' => '', 'help' => null, 'sort_order' => 2],
            ['group' => 'social', 'key' => 'twitter_url', 'label' => 'X / Twitter', 'type' => 'text', 'value' => '', 'help' => null, 'sort_order' => 3],
            ['group' => 'social', 'key' => 'youtube_url', 'label' => 'YouTube', 'type' => 'text', 'value' => '', 'help' => null, 'sort_order' => 4],
        ];

        foreach ($social as $row) {
            SiteSetting::query()->firstOrCreate(
                ['key' => $row['key']],
                $row,
            );
        }
    }

    /**
     * @return list<array{value: string, label: string}>|null
     */
    private function optionsFor(string $key): ?array
    {
        return match ($key) {
            'mobile_money_provider' => [
                ['value' => 'mpesa', 'label' => 'M-Pesa (Safaricom Daraja)'],
                ['value' => 'intasend', 'label' => 'IntaSend'],
            ],
            'paypal_mode', 'mpesa_mode', 'intasend_mode' => [
                ['value' => 'sandbox', 'label' => 'Sandbox (test)'],
                ['value' => 'live', 'label' => 'Live (production)'],
            ],
            default => null,
        };
    }
}
