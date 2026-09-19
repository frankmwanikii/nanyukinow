<?php

namespace App\Notifications;

use App\Models\Listing;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ListingReviewedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Listing $listing,
        public string $outcome,
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
        $published = $this->outcome === 'published';

        return [
            'type' => 'listing_reviewed',
            'title' => $published ? 'Listing approved' : 'Listing update',
            'body' => $published
                ? "“{$this->listing->title}” is now live on Nanyuki Now."
                : "“{$this->listing->title}” status is now {$this->outcome}.",
            'action_url' => route('account.index'),
            'action_label' => 'View account',
            'listing_id' => $this->listing->id,
            'listing_title' => $this->listing->title,
            'outcome' => $this->outcome,
            'icon' => $published ? 'check' : 'listing',
            'sender_name' => 'Nanyuki Now',
            'sender_avatar' => '/images/logo.png',
        ];
    }
}
