<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlanUpgrade;
use App\Models\User;
use App\Notifications\PlanUpgradeReviewedNotification;
use App\Support\Membership;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        $upgrades = $query
            ->paginate(20)
            ->withQueryString()
            ->through(fn (PlanUpgrade $upgrade) => $upgrade->toAdminArray());

        return Inertia::render('Admin/Upgrades/Index', [
            'upgrades' => $upgrades,
            'filters' => [
                'status' => $status,
            ],
            'counts' => [
                'pending' => PlanUpgrade::query()->where('status', PlanUpgrade::STATUS_PENDING)->count(),
                'approved' => PlanUpgrade::query()->where('status', PlanUpgrade::STATUS_APPROVED)->count(),
                'rejected' => PlanUpgrade::query()->where('status', PlanUpgrade::STATUS_REJECTED)->count(),
                'all' => PlanUpgrade::query()->count(),
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
        $days = $data['duration_days']
            ?? Membership::durationDaysForPeriod($upgrade->billing_period);

        DB::transaction(function () use ($request, $upgrade, $user, $data, $days): void {
            Membership::activate($user, $upgrade->to_plan, $days);

            $upgrade->update([
                'status' => PlanUpgrade::STATUS_APPROVED,
                'admin_notes' => $data['admin_notes'] ?? null,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);

            // Drop any other open requests for this member so they stay on one path.
            PlanUpgrade::query()
                ->where('user_id', $user->id)
                ->where('id', '!=', $upgrade->id)
                ->where('status', PlanUpgrade::STATUS_PENDING)
                ->update([
                    'status' => PlanUpgrade::STATUS_CANCELLED,
                    'admin_notes' => 'Cancelled automatically when another upgrade was approved.',
                    'reviewed_by' => $request->user()->id,
                    'reviewed_at' => now(),
                ]);
        });

        $user->notify(new PlanUpgradeReviewedNotification($upgrade->fresh()));

        return back()->with(
            'success',
            'Upgrade approved — '.$user->name.' is now on '.Membership::label($upgrade->to_plan).'.',
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

        return back()->with('success', 'Upgrade request rejected.');
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
