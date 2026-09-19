<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\InitiateUpgradePaymentRequest;
use App\Http\Requests\Account\StoreUpgradeRequest;
use App\Models\PlanUpgrade;
use App\Models\PricingPlan;
use App\Models\SiteSetting;
use App\Support\Membership;
use App\Support\PaymentGateway;
use App\Support\PaymentMethods;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UpgradeController extends Controller
{
    public function create(Request $request): Response
    {
        $user = $request->user();

        $pending = PlanUpgrade::query()
            ->where('user_id', $user->id)
            ->where('status', PlanUpgrade::STATUS_PENDING)
            ->latest()
            ->first();

        return Inertia::render('Account/Upgrade', [
            'plan' => Membership::planSummary($user),
            'plans' => Membership::publicPlans(),
            'pendingUpgrade' => $pending?->toMemberArray(),
            'paymentMethods' => PaymentMethods::memberOptions(),
            'upgradeContact' => [
                'whatsapp' => SiteSetting::getValue('upgrade_whatsapp', ''),
                'phone' => SiteSetting::getValue('contact_phone', ''),
                'email' => SiteSetting::getValue('contact_email', 'hello@nanyukinow.co.ke'),
                'mpesa_paybill' => SiteSetting::getValue('upgrade_mpesa_paybill', '542542'),
                'mpesa_account' => SiteSetting::getValue('upgrade_mpesa_account', '451220'),
                'intasend_note' => SiteSetting::getValue(
                    'upgrade_intasend_note',
                    'Complete payment in IntaSend, then paste your IntaSend transaction / invoice ID below.',
                ),
                'paypal_note' => SiteSetting::getValue(
                    'upgrade_paypal_note',
                    'Send payment via PayPal, then paste your PayPal transaction ID below.',
                ),
                'paypal_email' => SiteSetting::getValue('upgrade_paypal_email', ''),
                'instructions' => SiteSetting::getValue(
                    'upgrade_instructions',
                    'Choose a plan, pick how you want to pay, then submit your payment reference. We activate your plan after verifying payment.',
                ),
            ],
        ]);
    }

    public function initiate(InitiateUpgradePaymentRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();
        $toPlan = Membership::normalize($data['to_plan']);
        $method = $data['payment_method'];
        $current = $user->effectivePlan();

        if ($toPlan === Membership::FREE || $toPlan === $current) {
            return response()->json([
                'ok' => false,
                'message' => 'Choose a higher plan than your current one.',
                'can_retry' => false,
            ], 422);
        }

        if ($current === Membership::PREMIUM) {
            return response()->json([
                'ok' => false,
                'message' => 'You are already on Premium.',
                'can_retry' => false,
            ], 422);
        }

        PricingPlan::ensureDefaults();
        $pricing = PricingPlan::query()->where('key', $toPlan)->first();

        $payload = [
            'user_id' => $user->id,
            'to_plan' => $toPlan,
            'payment_method' => $method,
            'amount' => (float) ($data['amount'] ?? $pricing?->price_amount ?? 0),
            'currency' => $data['currency'] ?? $pricing?->currency ?? 'KES',
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'return_url' => $data['return_url'] ?? route('account.billing'),
            'cancel_url' => $data['cancel_url'] ?? route('account.upgrade'),
        ];

        $result = match ($method) {
            PaymentMethods::MPESA => PaymentGateway::initiateMpesa($payload),
            PaymentMethods::PAYPAL => PaymentGateway::initiatePaypal($payload),
            default => [
                'ok' => false,
                'message' => 'Payment failed. Please try again.',
            ],
        };

        if (! ($result['ok'] ?? false)) {
            return response()->json([
                'ok' => false,
                'message' => $result['message'] ?? 'Payment failed. Please try again.',
                'can_retry' => true,
            ], 422);
        }

        return response()->json([
            'ok' => true,
            'checkout_url' => $result['checkout_url'] ?? null,
            'provider_ref' => $result['provider_ref'] ?? null,
            'message' => $result['message'] ?? null,
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

        $rank = [Membership::FREE => 0, Membership::STANDARD => 1, Membership::PREMIUM => 2];
        if (($rank[$toPlan] ?? 0) <= ($rank[$current] ?? 0)) {
            return back()->withErrors(['to_plan' => 'Choose a higher plan than your current one.']);
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
            'payment_method' => $request->validated('payment_method'),
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
