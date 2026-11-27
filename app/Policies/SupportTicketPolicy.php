<?php

namespace App\Policies;

use App\Models\SupportTicket;
use App\Models\User;

class SupportTicketPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null;
    }

    public function view(User $user, SupportTicket $ticket): bool
    {
        return (int) $ticket->user_id === (int) $user->id;
    }

    public function downloadAttachment(User $user, SupportTicket $ticket): bool
    {
        return $this->view($user, $ticket) && $ticket->hasAttachment();
    }
}
