<?php

namespace App\Notifications;

use App\Models\Listing;
use App\Models\ListingClaim;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\MailMessage;
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

    public function toMail(object $notifiable): MailMessage
    {
        $approved = $this->outcome === 'approved';
        $name = $notifiable->name
            ?? $this->claim->fullName()
            ?: 'there';

        $mail = (new MailMessage)
            ->subject($approved
                ? 'Your claim for “'.$this->listing->title.'” was approved'
                : 'Update on your claim for “'.$this->listing->title.'”')
            ->greeting('Hello '.$name.',')
            ->line($approved
                ? 'Good news — your ownership claim for “'.$this->listing->title.'” was approved. You can manage the listing from your account.'
                : 'Your ownership claim for “'.$this->listing->title.'” was not approved.');

        if (! $approved && filled($this->claim->admin_notes)) {
            $mail->line('Note from the team: '.$this->claim->admin_notes);
        }

        return $mail
            ->action(
                $approved ? 'Open account' : 'View listing',
                $approved ? route('account.index') : route('listings.show', $this->listing->slug),
            )
            ->line('Thank you for helping keep Nanyuki Now accurate.');
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
