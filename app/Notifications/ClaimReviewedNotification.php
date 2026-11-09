<?php

namespace App\Notifications;

use App\Mail\ClaimReviewedMail;
use App\Models\Listing;
use App\Models\ListingClaim;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Notification;

class ClaimReviewedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public ListingClaim $claim,
        public Listing $listing,
        public string $outcome,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        if ($notifiable instanceof AnonymousNotifiable) {
            return ['mail'];
        }

        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): ClaimReviewedMail
    {
        $name = $notifiable->name
            ?? $this->claim->fullName()
            ?: 'there';
        $email = (string) ($notifiable->routeNotificationFor('mail')
            ?? $notifiable->email
            ?? '');

        return (new ClaimReviewedMail(
            claim: $this->claim,
            listing: $this->listing,
            outcome: $this->outcome,
            userName: (string) $name,
        ))->to($email);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $approved = $this->outcome === 'approved';

        return [
            'type' => 'claim_reviewed',
            'title' => $approved ? 'Claim approved' : 'Claim update',
            'body' => $approved
                ? "Your claim for “{$this->listing->title}” was approved."
                : "Your claim for “{$this->listing->title}” was not approved.",
            'action_url' => $approved
                ? route('account.index')
                : route('listings.show', $this->listing->slug),
            'action_label' => $approved ? 'View account' : 'View listing',
            'listing_id' => $this->listing->id,
            'listing_title' => $this->listing->title,
            'claim_id' => $this->claim->id,
            'outcome' => $this->outcome,
            'icon' => $approved ? 'check' : 'listing',
            'sender_name' => 'Nanyuki Now',
            'sender_avatar' => '/images/logo.png',
        ];
    }
}
