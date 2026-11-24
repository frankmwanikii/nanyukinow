<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlanUpgrade;
use App\Models\User;
use App\Notifications\PlanUpgradeReviewedNotification;
use App\Support\Membership;
use App\Support\PlanUpgradeApproval;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UpgradeController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString() ?: 'pending';

        $query = PlanUpgrade::query()
            ->with(['user:id,name,email,username,plan', 'reviewer:id,name'])
            ->latest();

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $payments = $query
            ->paginate(20)
            ->withQueryString()
            ->through(fn (PlanUpgrade $upgrade) => $upgrade->toAdminArray());

        $pendingQuery = PlanUpgrade::query()->where('status', PlanUpgrade::STATUS_PENDING);
        $approvedQuery = PlanUpgrade::query()->where('status', PlanUpgrade::STATUS_APPROVED);

        return Inertia::render('Admin/Finance/Index', [
            'payments' => $payments,
            'filters' => [
                'status' => $status,
            ],
            'counts' => [
                'pending' => (clone $pendingQuery)->count(),
                'approved' => (clone $approvedQuery)->count(),
                'rejected' => PlanUpgrade::query()->where('status', PlanUpgrade::STATUS_REJECTED)->count(),
                'all' => PlanUpgrade::query()->count(),
            ],
            'stats' => [
                'pending_count' => (clone $pendingQuery)->count(),
                'pending_amount' => (int) (clone $pendingQuery)->sum('amount'),
                'approved_count' => (clone $approvedQuery)->count(),
                'approved_amount' => (int) (clone $approvedQuery)->sum('amount'),
                'month_revenue' => (int) PlanUpgrade::query()
                    ->where('status', PlanUpgrade::STATUS_APPROVED)
                    ->where('reviewed_at', '>=', now()->startOfMonth())
                    ->sum('amount'),
                'currency' => 'KES',
            ],
        ]);
    }

    public function approve(Request $request, PlanUpgrade $upgrade): RedirectResponse
    {
        abort_unless($upgrade->status === PlanUpgrade::STATUS_PENDING, 422);

        $data = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:1000'],
            'duration_days' => ['nullable', 'integer', 'min:1', 'max:366'],
        ]);

        $user = User::query()->findOrFail($upgrade->user_id);

        PlanUpgradeApproval::approve(
            $upgrade,
            $request->user()->id,
            $data['admin_notes'] ?? null,
            $data['duration_days'] ?? null,
        );

        return back()->with(
            'success',
            'Payment approved — '.$user->name.' is now on '.Membership::label($upgrade->to_plan).'.',
        );
    }

    public function reject(Request $request, PlanUpgrade $upgrade): RedirectResponse
    {
        abort_unless($upgrade->status === PlanUpgrade::STATUS_PENDING, 422);

        $data = $request->validate([
            'admin_notes' => ['required', 'string', 'max:1000'],
        ]);

        $upgrade->update([
            'status' => PlanUpgrade::STATUS_REJECTED,
            'admin_notes' => $data['admin_notes'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $upgrade->user?->notify(new PlanUpgradeReviewedNotification($upgrade->fresh()));

        return back()->with('success', 'Payment rejected.');
    }

    public function updateUserPlan(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'plan' => ['required', Rule::in([Membership::FREE, Membership::STANDARD, Membership::PREMIUM])],
            'duration_days' => ['nullable', 'integer', 'min:1', 'max:366'],
            'billing_period' => ['nullable', Rule::in(['month', 'year', 'one_time'])],
        ]);

        $user = User::query()->findOrFail($data['user_id']);
        $days = $data['duration_days']
            ?? Membership::durationDaysForPeriod($data['billing_period'] ?? 'month');

        Membership::activate($user, $data['plan'], $days);

        return back()->with('success', 'Member plan updated.');
    }
}
