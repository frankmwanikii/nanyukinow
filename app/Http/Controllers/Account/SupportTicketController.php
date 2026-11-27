<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\StoreSupportTicketRequest;
use App\Models\SupportTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
        $data = $request->safe()->only(['subject', 'body', 'priority']);
        $attachment = [
            'attachment_path' => null,
            'attachment_name' => null,
            'attachment_mime' => null,
            'attachment_size' => null,
        ];

        if ($request->hasFile('attachment')) {
            $upload = $request->file('attachment');
            $path = $upload->store(
                'support-tickets/'.$request->user()->id,
                'local',
            );

            $attachment = [
                'attachment_path' => $path,
                'attachment_name' => $upload->getClientOriginalName() ?: 'attachment',
                'attachment_mime' => $upload->getClientMimeType(),
                'attachment_size' => $upload->getSize() ?: null,
            ];
        }

        $ticket = $request->user()->supportTickets()->create([
            ...$data,
            ...$attachment,
            'status' => SupportTicket::STATUS_OPEN,
        ]);

        return redirect()
            ->route('account.tickets.show', $ticket)
            ->with('success', 'Ticket '.$ticket->reference().' opened. Our team will follow up soon.');
    }

    public function show(Request $request, SupportTicket $ticket): Response
    {
        $this->authorize('view', $ticket);

        return Inertia::render('Account/Tickets/Show', [
            'ticket' => $ticket->toMemberArray(),
        ]);
    }

    public function downloadAttachment(Request $request, SupportTicket $ticket): StreamedResponse
    {
        $this->authorize('downloadAttachment', $ticket);
        abort_unless(Storage::disk('local')->exists($ticket->attachment_path), 404);

        return Storage::disk('local')->download(
            $ticket->attachment_path,
            $ticket->attachment_name ?: 'attachment',
        );
    }
}
