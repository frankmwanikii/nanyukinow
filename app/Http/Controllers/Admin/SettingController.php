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

        $settings = SiteSetting::query()
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
            ['group' => 'home', 'key' => 'hero_image', 'label' => 'Hero image', 'type' => 'image', 'value' => '', 'help' => 'Main homepage hero background.', 'sort_order' => 1],
            ['group' => 'home', 'key' => 'hero_headline', 'label' => 'Hero headline', 'type' => 'text', 'value' => 'Explore Nanyuki', 'help' => null, 'sort_order' => 2],
            ['group' => 'home', 'key' => 'hero_subtext', 'label' => 'Hero subtext', 'type' => 'textarea', 'value' => 'Places, stays, and stories from the highland town.', 'help' => null, 'sort_order' => 3],
            ['group' => 'home', 'key' => 'cta_label', 'label' => 'Primary CTA label', 'type' => 'text', 'value' => 'Explore listings', 'help' => null, 'sort_order' => 4],
            ['group' => 'home', 'key' => 'cta_url', 'label' => 'Primary CTA URL', 'type' => 'text', 'value' => '/explore', 'help' => null, 'sort_order' => 5],
            ['group' => 'pages', 'key' => 'contact_email', 'label' => 'Contact email', 'type' => 'text', 'value' => 'hello@nanyukinow.co.ke', 'help' => null, 'sort_order' => 1],
            ['group' => 'pages', 'key' => 'contact_phone', 'label' => 'Contact phone', 'type' => 'text', 'value' => '', 'help' => null, 'sort_order' => 2],
            ['group' => 'pages', 'key' => 'footer_blurb', 'label' => 'Footer blurb', 'type' => 'textarea', 'value' => 'Nanyuki Now — your local directory for places worth knowing.', 'help' => null, 'sort_order' => 3],
            ['group' => 'billing', 'key' => 'upgrade_whatsapp', 'label' => 'Upgrade WhatsApp', 'type' => 'text', 'value' => '', 'help' => 'WhatsApp number members can message after paying (e.g. 2547…).', 'sort_order' => 1],
            ['group' => 'billing', 'key' => 'upgrade_mpesa_paybill', 'label' => 'M-Pesa Paybill / Till', 'type' => 'text', 'value' => '', 'help' => 'Shown on the public pricing & upgrade pages.', 'sort_order' => 2],
            ['group' => 'billing', 'key' => 'upgrade_mpesa_account', 'label' => 'M-Pesa account reference', 'type' => 'text', 'value' => 'PLAN', 'help' => 'Account number members should use with Paybill.', 'sort_order' => 3],
            ['group' => 'billing', 'key' => 'upgrade_instructions', 'label' => 'Upgrade instructions', 'type' => 'textarea', 'value' => 'Pay via M-Pesa, then submit your upgrade request with the payment confirmation code. An admin will activate your plan after verifying payment.', 'help' => 'Shown to members when upgrading.', 'sort_order' => 4],
            ['group' => 'social', 'key' => 'facebook_url', 'label' => 'Facebook', 'type' => 'text', 'value' => '', 'help' => null, 'sort_order' => 1],
            ['group' => 'social', 'key' => 'instagram_url', 'label' => 'Instagram', 'type' => 'text', 'value' => '', 'help' => null, 'sort_order' => 2],
            ['group' => 'social', 'key' => 'twitter_url', 'label' => 'X / Twitter', 'type' => 'text', 'value' => '', 'help' => null, 'sort_order' => 3],
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
            ['group' => 'billing', 'key' => 'upgrade_mpesa_paybill', 'label' => 'M-Pesa Paybill / Till', 'type' => 'text', 'value' => '', 'help' => 'Shown on the public pricing & upgrade pages.', 'sort_order' => 2],
            ['group' => 'billing', 'key' => 'upgrade_mpesa_account', 'label' => 'M-Pesa account reference', 'type' => 'text', 'value' => 'PLAN', 'help' => 'Account number members should use with Paybill.', 'sort_order' => 3],
            ['group' => 'billing', 'key' => 'upgrade_instructions', 'label' => 'Upgrade instructions', 'type' => 'textarea', 'value' => 'Pay via M-Pesa, then submit your upgrade request with the payment confirmation code. An admin will activate your plan after verifying payment.', 'help' => 'Shown to members when upgrading.', 'sort_order' => 4],
        ];

        foreach ($billing as $row) {
            SiteSetting::query()->firstOrCreate(
                ['key' => $row['key']],
                $row,
            );
        }
    }
}
