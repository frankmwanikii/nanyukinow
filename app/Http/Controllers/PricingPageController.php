<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use App\Support\Membership;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PricingPageController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Pricing', [
            'plans' => Membership::publicPlans(),
            'currentPlan' => $user ? Membership::planSummary($user) : null,
            'upgradeContact' => [
                'whatsapp' => SiteSetting::getValue('upgrade_whatsapp', ''),
                'phone' => SiteSetting::getValue('contact_phone', ''),
                'email' => SiteSetting::getValue('contact_email', 'hello@nanyukinow.co.ke'),
                'mpesa_paybill' => SiteSetting::getValue('upgrade_mpesa_paybill', '542542'),
                'mpesa_account' => SiteSetting::getValue('upgrade_mpesa_account', '451220'),
                'instructions' => SiteSetting::getValue(
                    'upgrade_instructions',
                    'Choose a plan, pick how you want to pay, then submit your payment reference. We’ll activate your plan after verifying payment.',
                ),
            ],
        ]);
    }
}
