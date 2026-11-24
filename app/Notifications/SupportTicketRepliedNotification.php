<?php

namespace App\Notifications;

use App\Models\SupportTicket;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SupportTicketRepliedNotification extends Notification
{
    use Queueable;

    public function __construct(public SupportTicket $ticket) {}

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
        $closed = $this->ticket->status === SupportTicket::STATUS_CLOSED;

        return [
            'type' => 'support_ticket_replied',
            'title' => $closed ? 'Support ticket closed' : 'Support ticket reply',
            'body' => $closed
                ? "We replied to {$this->ticket->reference()} and closed the ticket."
                : "We replied to your ticket {$this->ticket->reference()}.",
            'action_url' => route('account.tickets.show', $this->ticket),
            'action_label' => 'View ticket',
            'ticket_id' => $this->ticket->id,
            'ticket_reference' => $this->ticket->reference(),
            'icon' => 'check',
            'sender_name' => 'Nanyuki Now',
            'sender_avatar' => '/images/logo.png',
        ];
    }
}
