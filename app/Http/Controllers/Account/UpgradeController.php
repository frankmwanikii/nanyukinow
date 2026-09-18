<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\StoreUpgradeRequest;
use App\Models\PlanUpgrade;
use App\Models\PricingPlan;
use App\Models\SiteSetting;
use App\Support\Membership;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UpgradeController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $current = $user->effectivePlan();

        if ($current === Membership::PREMIUM) {
            return redirect()
                ->route('account.index')
                ->with('success', 'You are already on Premium.');
        }

        $pending = PlanUpgrade::query()
            ->where('user_id', $user->id)
            ->where('status', PlanUpgrade::STATUS_PENDING)
            ->latest()
            ->first();

        PricingPlan::ensureDefaults();

        $plans = PricingPlan::query()
            ->whereIn('key', [Membership::STANDARD, Membership::PREMIUM])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn (PricingPlan $plan) => $plan->toAdminArray())
            ->values();

        return Inertia::render('Account/Upgrade', [
            'plan' => Membership::planSummary($user),
            'plans' => $plans,
            'pendingUpgrade' => $pending?->toMemberArray(),
            'upgradeContact' => [
                'whatsapp' => SiteSetting::getValue('upgrade_whatsapp', ''),
                'phone' => SiteSetting::getValue('contact_phone', ''),
                'email' => SiteSetting::getValue('contact_email', 'hello@nanyukinow.co.ke'),
                'mpesa_paybill' => SiteSetting::getValue('upgrade_mpesa_paybill', ''),
                'mpesa_account' => SiteSetting::getValue('upgrade_mpesa_account', 'PLAN'),
                'instructions' => SiteSetting::getValue(
                    'upgrade_instructions',
                    'Pay via M-Pesa using the details below, then submit this form with your M-Pesa confirmation code. We activate plans after verifying payment.',
                ),
            ],
        ]);
    }

    public function store(StoreUpgradeRequest $request): RedirectResponse
    {
        $user = $request->user();
        $toPlan = Membership::normalize($request->validated('to_plan'));
        $current = $user->effectivePlan();

        if ($toPlan === Membership::FREE || $toPlan === $current) {
            return back()->withErrors(['to_plan' => 'Choose a higher plan than your current one.']);
        }

        if ($current === Membership::PREMIUM) {
            return back()->with('error', 'You are already on Premium.');
        }

        if ($current === Membership::STANDARD && $toPlan === Membership::STANDARD) {
            return back()->withErrors(['to_plan' => 'You are already on Standard. Choose Premium.']);
        }

        $existing = PlanUpgrade::query()
            ->where('user_id', $user->id)
            ->where('status', PlanUpgrade::STATUS_PENDING)
            ->exists();

        if ($existing) {
            return back()->with('error', 'You already have a pending upgrade request.');
        }

        PricingPlan::ensureDefaults();
        $pricing = PricingPlan::query()->where('key', $toPlan)->first();

        PlanUpgrade::query()->create([
            'user_id' => $user->id,
            'from_plan' => $current,
            'to_plan' => $toPlan,
            'amount' => (int) ($pricing?->price_amount ?? 0),
            'currency' => $pricing?->currency ?? 'KES',
            'billing_period' => $pricing?->billing_period ?? 'month',
            'status' => PlanUpgrade::STATUS_PENDING,
            'payment_reference' => $request->validated('payment_reference'),
            'payment_method' => $request->validated('payment_method') ?: 'mpesa',
            'member_notes' => $request->validated('member_notes'),
        ]);

        return redirect()
            ->route('account.index')
            ->with('success', 'Upgrade request submitted. We will confirm payment and activate your plan.');
    }

    public function cancel(Request $request, PlanUpgrade $upgrade): RedirectResponse
    {
        abort_unless((int) $upgrade->user_id === (int) $request->user()->id, 403);
        abort_unless($upgrade->status === PlanUpgrade::STATUS_PENDING, 422);

        $upgrade->update(['status' => PlanUpgrade::STATUS_CANCELLED]);

        return back()->with('success', 'Upgrade request cancelled.');
    }
}
