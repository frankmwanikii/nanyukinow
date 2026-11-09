<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\InitiateUpgradePaymentRequest;
use App\Http\Requests\Account\StoreUpgradeRequest;
use App\Models\PlanUpgrade;
use App\Models\PricingPlan;
use App\Models\SiteSetting;
use App\Models\User;
use App\Support\CategoryKey;
use App\Support\Membership;
use App\Support\PalplussFulfillment;
use App\Support\PaymentGateway;
use App\Support\PaymentMethods;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        $summary = Membership::planSummary($user);

        $billing = $request->string('billing')->toString();
        if (! in_array($billing, ['month', 'year'], true)) {
            $billing = $summary['renew_billing_period'] ?? 'month';
        }

        $initialPlan = Membership::normalize($request->string('plan')->toString());
        if ($initialPlan === Membership::FREE) {
            $initialPlan = $summary['renew_plan'] ?? null;
        }

        return Inertia::render('Account/Upgrade', [
            'plan' => $summary,
            'plans' => Membership::publicPlans(
                CategoryKey::fromSlug($request->string('category')->toString())
            ),
            'plansByCategory' => Membership::publicPlansByCategory(),
            'categories' => CategoryKey::options(),
            'initialCategory' => CategoryKey::fromSlug($request->string('category')->toString()),
            'pendingUpgrade' => $pending?->toMemberArray(),
            'paymentMethods' => PaymentMethods::memberOptions(),
            'initialBilling' => $billing,
            'initialPlan' => $initialPlan && $initialPlan !== Membership::FREE ? $initialPlan : null,
            'forceRenew' => $request->boolean('renew'),
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

    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        PalplussFulfillment::confirmForUser($user);
        $user->refresh();

        $latest = PlanUpgrade::query()
            ->where('user_id', $user->id)
            ->latest('id')
            ->first();

        return response()->json([
            'status' => $latest?->status ?? 'none',
            'plan' => $user->effectivePlan(),
        ]);
    }

    public function initiate(InitiateUpgradePaymentRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();
        $toPlan = Membership::normalize($data['to_plan']);
        $method = $data['payment_method'];
        $billingPeriod = $data['billing_period'] ?? 'month';
        $current = $user->effectivePlan();
        $isPeriodUpgrade = Membership::isBillingPeriodUpgrade($user, $toPlan, $billingPeriod);
        $isRenewal = Membership::isRenewal($user, $toPlan, $billingPeriod);

        if ($toPlan === Membership::FREE || ($toPlan === $current && ! $isPeriodUpgrade && ! $isRenewal)) {
            return response()->json([
                'ok' => false,
                'message' => 'Choose a higher plan than your current one.',
                'can_retry' => false,
            ], 422);
        }

        if ($current === Membership::PREMIUM && ! $isPeriodUpgrade && ! $isRenewal) {
            return response()->json([
                'ok' => false,
                'message' => 'You are already on Premium.',
                'can_retry' => false,
            ], 422);
        }

        PricingPlan::ensureDefaults();
        $pricing = PricingPlan::findForCategory($toPlan, $data['category'] ?? null);
        $amount = $pricing
            ? $pricing->amountForPeriod($billingPeriod)
            : (int) ($data['amount'] ?? 0);

        $payload = [
            'user_id' => $user->id,
            'to_plan' => $toPlan,
            'payment_method' => $method,
            'amount' => (float) $amount,
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

        $providerRef = $result['provider_ref'] ?? null;
        $currency = (string) ($data['currency'] ?? $pricing?->currency ?? 'KES');
        if (is_string($providerRef) && $providerRef !== '') {
            if ($method === PaymentMethods::MPESA && PaymentGateway::mobileMoneyProvider() === PaymentGateway::PROVIDER_PALPLUSS) {
                $this->recordPendingUpgrade($user, $toPlan, $billingPeriod, (int) $amount, $currency, $providerRef, PaymentMethods::MPESA, 'Replaced by a new M-Pesa payment prompt.');
            }

            if ($method === PaymentMethods::PAYPAL) {
                $this->recordPendingUpgrade($user, $toPlan, $billingPeriod, (int) $amount, $currency, $providerRef, PaymentMethods::PAYPAL, 'Replaced by a new PayPal checkout.');
            }
        }

        return response()->json([
            'ok' => true,
            'checkout_url' => $result['checkout_url'] ?? null,
            'provider_ref' => $result['provider_ref'] ?? null,
            'message' => $result['message'] ?? null,
        ]);
    }

    private function recordPendingUpgrade(User $user, string $toPlan, string $billingPeriod, int $amount, string $currency, string $reference, string $paymentMethod, string $replacedNote): void
    {
        DB::transaction(function () use ($user, $toPlan, $billingPeriod, $amount, $currency, $reference, $paymentMethod, $replacedNote): void {
            PlanUpgrade::query()
                ->where('user_id', $user->id)
                ->where('status', PlanUpgrade::STATUS_PENDING)
                ->update([
                    'status' => PlanUpgrade::STATUS_CANCELLED,
                    'admin_notes' => $replacedNote,
                    'reviewed_at' => now(),
                ]);

            PlanUpgrade::query()->create([
                'user_id' => $user->id,
                'from_plan' => $user->effectivePlan(),
                'to_plan' => $toPlan,
                'amount' => $amount,
                'currency' => $currency,
                'billing_period' => $billingPeriod,
                'status' => PlanUpgrade::STATUS_PENDING,
                'payment_reference' => $reference,
                'payment_method' => $paymentMethod,
            ]);
        });
    }

    public function store(StoreUpgradeRequest $request): RedirectResponse
    {
        $user = $request->user();
        $toPlan = Membership::normalize($request->validated('to_plan'));
        $billingPeriod = $request->validated('billing_period') ?? 'month';
        $current = $user->effectivePlan();
        $isPeriodUpgrade = Membership::isBillingPeriodUpgrade($user, $toPlan, $billingPeriod);
        $isRenewal = Membership::isRenewal($user, $toPlan, $billingPeriod);

        if ($toPlan === Membership::FREE || ($toPlan === $current && ! $isPeriodUpgrade && ! $isRenewal)) {
            return back()->withErrors(['to_plan' => 'Choose a higher plan than your current one.']);
        }

        if ($current === Membership::PREMIUM && ! $isPeriodUpgrade && ! $isRenewal) {
            return back()->with('error', 'You are already on Premium.');
        }

        $rank = [Membership::FREE => 0, Membership::STANDARD => 1, Membership::PREMIUM => 2];
        if (! $isPeriodUpgrade && ! $isRenewal && ($rank[$toPlan] ?? 0) <= ($rank[$current] ?? 0)) {
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
        $pricing = PricingPlan::findForCategory(
            $toPlan,
            $request->validated('category') ?? null,
        );

        PlanUpgrade::query()->create([
            'user_id' => $user->id,
            'from_plan' => $current,
            'to_plan' => $toPlan,
            'amount' => $pricing ? $pricing->amountForPeriod($billingPeriod) : 0,
            'currency' => $pricing?->currency ?? 'KES',
            'billing_period' => $billingPeriod,
            'status' => PlanUpgrade::STATUS_PENDING,
            'payment_reference' => $request->validated('payment_reference'),
            'payment_method' => $request->validated('payment_method'),
            'member_notes' => $request->validated('member_notes'),
        ]);

        return redirect()
            ->route('account.index')
            ->with(
                'success',
                $isRenewal
                    ? 'Renewal request submitted. We will confirm payment and extend your plan.'
                    : 'Upgrade request submitted. We will confirm payment and activate your plan.',
            );
    }

    public function cancel(Request $request, PlanUpgrade $upgrade): RedirectResponse
    {
        abort_unless((int) $upgrade->user_id === (int) $request->user()->id, 403);
        abort_unless($upgrade->status === PlanUpgrade::STATUS_PENDING, 422);

        $upgrade->update(['status' => PlanUpgrade::STATUS_CANCELLED]);

        return back()->with('success', 'Upgrade request cancelled.');
    }
}
