<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\PlanRenewalReminderNotification;
use App\Support\Membership;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

#[Signature('membership:process-renewals')]
#[Description('Send plan renewal reminders and hide listings when paid plans expire')]
class ProcessMembershipRenewalsCommand extends Command
{
    public function handle(): int
    {
        $reminders7 = $this->sendReminders(daysLeft: 7, column: 'plan_renewal_reminder_7d_sent_at');
        $reminders3 = $this->sendReminders(daysLeft: 3, column: 'plan_renewal_reminder_3d_sent_at');
        $expired = $this->expirePaidPlans();

        $this->info("Reminders (7d): {$reminders7}");
        $this->info("Reminders (3d): {$reminders3}");
        $this->info("Expired to Free: {$expired}");

        return self::SUCCESS;
    }

    private function sendReminders(int $daysLeft, string $column): int
    {
        $targetDate = now()->startOfDay()->addDays($daysLeft)->toDateString();
        $sent = 0;

        User::query()
            ->whereNotNull('plan_expires_at')
            ->where('plan', '!=', Membership::FREE)
            ->whereDate('plan_expires_at', $targetDate)
            ->whereNull($column)
            ->orderBy('id')
            ->chunkById(100, function ($users) use ($daysLeft, $column, &$sent): void {
                foreach ($users as $user) {
                    $planKey = Membership::normalize($user->plan);
                    if ($planKey === Membership::FREE) {
                        continue;
                    }

                    Notification::send($user, new PlanRenewalReminderNotification(
                        planKey: $planKey,
                        daysLeft: $daysLeft,
                        expiresAt: $user->plan_expires_at?->timezone(config('app.timezone'))->format('j M Y'),
                        billingPeriod: Membership::billingPeriodFor($user, $planKey),
                    ));

                    $user->forceFill([$column => now()])->save();
                    $sent++;
                }
            });

        return $sent;
    }

    private function expirePaidPlans(): int
    {
        $expired = 0;

        User::query()
            ->whereNotNull('plan_expires_at')
            ->where('plan_expires_at', '<=', now())
            ->where(function ($query) {
                $query->where('plan', '!=', Membership::FREE)
                    ->orWhereNotNull('last_paid_plan');
            })
            ->orderBy('id')
            ->chunkById(100, function ($users) use (&$expired): void {
                foreach ($users as $user) {
                    $hasVisiblePaidContent = $user->listings()
                        ->where('is_published', true)
                        ->where('suppressed_by_plan_expiry', false)
                        ->exists();

                    $stillMarkedPaid = Membership::normalize($user->plan) !== Membership::FREE;

                    if (! $stillMarkedPaid && ! $hasVisiblePaidContent) {
                        continue;
                    }

                    if (Membership::expireToFree($user)) {
                        $expired++;
                    }
                }
            });

        return $expired;
    }
}
