<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\PlanUpgrade;
use App\Support\Membership;
use App\Support\PaymentMethods;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $pending = PlanUpgrade::query()
            ->where('user_id', $user->id)
            ->where('status', PlanUpgrade::STATUS_PENDING)
            ->latest()
            ->first();

        $history = PlanUpgrade::query()
            ->where('user_id', $user->id)
            ->whereIn('status', [
                PlanUpgrade::STATUS_APPROVED,
                PlanUpgrade::STATUS_REJECTED,
                PlanUpgrade::STATUS_CANCELLED,
                PlanUpgrade::STATUS_PENDING,
            ])
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (PlanUpgrade $upgrade) => [
                ...$upgrade->toMemberArray(),
                'payment_method_label' => collect(PaymentMethods::options())
                    ->firstWhere('value', $upgrade->payment_method)['label']
                    ?? $upgrade->payment_method,
            ])
            ->values();

        return Inertia::render('Account/Billing', [
            'plan' => Membership::planSummary($user),
            'pendingUpgrade' => $pending?->toMemberArray(),
            'history' => $history,
        ]);
    }
}
