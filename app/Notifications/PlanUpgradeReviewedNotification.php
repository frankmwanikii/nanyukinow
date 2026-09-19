<?php

namespace App\Notifications;

use App\Models\PlanUpgrade;
use App\Support\Membership;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PlanUpgradeReviewedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public PlanUpgrade $upgrade,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $approved = $this->upgrade->status === PlanUpgrade::STATUS_APPROVED;
        $label = Membership::label($this->upgrade->to_plan);

        return [
            'type' => 'plan_upgrade_reviewed',
            'title' => $approved ? 'Plan upgraded' : 'Upgrade request update',
            'body' => $approved
                ? "Your {$label} plan is active. You can add more listings and unlock better placement."
                : ('Your upgrade to '.$label.' was not approved.'.($this->upgrade->admin_notes ? ' '.$this->upgrade->admin_notes : '')),
            'action_url' => $approved ? route('account.index') : route('account.upgrade'),
            'action_label' => $approved ? 'Open account' : 'Try again',
            'upgrade_id' => $this->upgrade->id,
            'to_plan' => $this->upgrade->to_plan,
            'status' => $this->upgrade->status,
            'icon' => $approved ? 'sparkles' : 'alert',
            'sender_name' => 'Nanyuki Now',
            'sender_avatar' => '/images/logo.png',
        ];
    }
}
