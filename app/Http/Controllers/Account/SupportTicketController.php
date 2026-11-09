<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\StoreSupportTicketRequest;
use App\Models\SupportTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupportTicketController extends Controller
{
    public function index(Request $request): Response
    {
        $tickets = $request->user()
            ->supportTickets()
            ->latest('id')
            ->get()
            ->map(fn (SupportTicket $ticket) => $ticket->toMemberArray())
            ->values()
            ->all();

        return Inertia::render('Account/Tickets/Index', [
            'tickets' => $tickets,
            'priorities' => collect(SupportTicket::PRIORITIES)
                ->map(fn (string $priority) => [
                    'value' => $priority,
                    'label' => SupportTicket::priorityLabel($priority),
                ])
                ->values()
                ->all(),
        ]);
    }

    public function store(StoreSupportTicketRequest $request): RedirectResponse
    {
        $ticket = $request->user()->supportTickets()->create([
            ...$request->validated(),
            'status' => SupportTicket::STATUS_OPEN,
        ]);

        return redirect()
            ->route('account.tickets.show', $ticket)
            ->with('success', 'Ticket '.$ticket->reference().' opened. Our team will follow up soon.');
    }

    public function show(Request $request, SupportTicket $ticket): Response
    {
        abort_unless((int) $ticket->user_id === (int) $request->user()->id, 403);

        return Inertia::render('Account/Tickets/Show', [
            'ticket' => $ticket->toMemberArray(),
        ]);
    }
}
