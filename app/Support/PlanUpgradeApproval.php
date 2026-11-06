<?php

namespace App\Support;

use App\Models\PlanUpgrade;
use App\Models\User;
use App\Notifications\PlanUpgradeReviewedNotification;
use Illuminate\Support\Facades\DB;

class PlanUpgradeApproval
{
    /**
     * Activate the member plan for a paid upgrade. A repeated call does not extend the plan again.
     */
    public static function approve(PlanUpgrade $upgrade, ?int $reviewerId = null, ?string $adminNotes = null, ?int $durationDays = null): bool
    {
        $activated = DB::transaction(function () use ($upgrade, $reviewerId, $adminNotes, $durationDays): bool {
            $locked = PlanUpgrade::query()->lockForUpdate()->find($upgrade->id);

            if ($locked === null || $locked->status === PlanUpgrade::STATUS_APPROVED) {
                return false;
            }

            if (! in_array($locked->status, [PlanUpgrade::STATUS_PENDING, PlanUpgrade::STATUS_CANCELLED], true)) {
                return false;
            }

            $user = User::query()->findOrFail($locked->user_id);
            $days = $durationDays ?? Membership::durationDaysForPeriod($locked->billing_period);

            Membership::activate($user, $locked->to_plan, $days);

            $locked->update([
                'status' => PlanUpgrade::STATUS_APPROVED,
                'admin_notes' => $adminNotes,
                'reviewed_by' => $reviewerId,
                'reviewed_at' => now(),
            ]);

            PlanUpgrade::query()
                ->where('user_id', $user->id)
                ->where('id', '!=', $locked->id)
                ->where('status', PlanUpgrade::STATUS_PENDING)
                ->update([
                    'status' => PlanUpgrade::STATUS_CANCELLED,
                    'admin_notes' => 'Cancelled automatically when another payment was approved.',
                    'reviewed_by' => $reviewerId,
                    'reviewed_at' => now(),
                ]);

            return true;
        });

        if ($activated) {
            $upgrade->refresh();
            $upgrade->user?->notify(new PlanUpgradeReviewedNotification($upgrade));
        }

        return $activated;
    }
}
