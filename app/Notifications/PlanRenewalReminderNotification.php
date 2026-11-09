<?php

namespace App\Notifications;

use App\Mail\PlanRenewalReminderMail;
use App\Support\Membership;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class PlanRenewalReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $planKey,
        public int $daysLeft,
        public ?string $expiresAt = null,
        public ?string $billingPeriod = null,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): PlanRenewalReminderMail
    {
        $email = (string) ($notifiable->email ?? '');

        return (new PlanRenewalReminderMail(
            planKey: $this->planKey,
            daysLeft: $this->daysLeft,
            userName: (string) ($notifiable->name ?? ''),
            expiresAt: $this->expiresAt,
            billingPeriod: $this->billingPeriod,
        ))->to($email);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $label = Membership::label($this->planKey);

        return [
            'type' => 'plan_renewal_reminder',
            'title' => 'Renew your '.$label.' plan',
            'body' => $this->daysLeft <= 3
                ? "Your {$label} plan expires in {$this->daysLeft} days. Renew to keep your listings visible."
                : "Your {$label} plan expires in {$this->daysLeft} days. Renew on time so your listings stay live.",
            'action_url' => route('account.upgrade', [
                'plan' => Membership::normalize($this->planKey),
                'billing' => $this->billingPeriod === 'year' ? 'year' : 'month',
                'renew' => 1,
            ]),
            'action_label' => 'Renew plan',
            'plan' => Membership::normalize($this->planKey),
            'days_left' => $this->daysLeft,
            'icon' => 'alert',
            'sender_name' => 'Nanyuki Now',
            'sender_avatar' => '/images/logo.png',
        ];
    }
}
