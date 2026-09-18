<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class WelcomeMemberNotification extends Notification
{
    use Queueable;

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
        return [
            'type' => 'welcome',
            'title' => 'Welcome to Nanyuki Now',
            'body' => 'You’re on the Free plan — add your first listing and get discovered. Upgrade anytime for Featured or Premium placement.',
            'action_url' => route('account.listings.create'),
            'action_label' => 'Add a listing',
            'icon' => 'sparkles',
        ];
    }
}
