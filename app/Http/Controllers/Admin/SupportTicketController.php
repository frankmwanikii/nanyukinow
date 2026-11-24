<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReplySupportTicketRequest;
use App\Models\SupportTicket;
use App\Notifications\SupportTicketRepliedNotification;
use App\Support\AdminPagination;
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
        $status = $request->string('status')->toString() ?: 'open';
        if (! in_array($status, ['all', 'open', 'answered', 'closed'], true)) {
            $status = 'open';
        }

        $priority = $request->string('priority')->toString();
        if ($priority !== '' && ! in_array($priority, SupportTicket::PRIORITIES, true)) {
            $priority = '';
        }

        $q = $request->string('q')->toString();
        $perPage = AdminPagination::perPage($request, 15);

        $query = SupportTicket::query()
            ->with([
                'user:id,name,email',
                'reviewer:id,name',
            ])
            ->latest();

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($priority !== '') {
            $query->where('priority', $priority);
        }

        if ($q !== '') {
            $like = '%'.$q.'%';
            $query->where(function ($inner) use ($like, $q) {
                $inner->where('subject', 'like', $like)
                    ->orWhere('body', 'like', $like)
                    ->orWhere('admin_reply', 'like', $like)
                    ->orWhereHas('user', function ($user) use ($like) {
                        $user->where('name', 'like', $like)
                            ->orWhere('email', 'like', $like);
                    });

                if (preg_match('/^TKT-?0*(\d+)$/i', $q, $matches) === 1) {
                    $inner->orWhere('id', (int) $matches[1]);
                } elseif (ctype_digit($q)) {
                    $inner->orWhere('id', (int) $q);
                }
            });
        }

        $tickets = $query
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (SupportTicket $ticket) => $ticket->toAdminArray());

        return Inertia::render('Admin/Tickets/Index', [
            'tickets' => $tickets,
            'filters' => [
                'q' => $q,
                'status' => $status,
                'priority' => $priority,
                'per_page' => $perPage,
            ],
            'counts' => $this->counts(),
            'priorities' => collect(SupportTicket::PRIORITIES)
                ->map(fn (string $value) => [
                    'value' => $value,
                    'label' => SupportTicket::priorityLabel($value),
                ])
                ->values()
                ->all(),
        ]);
    }

    public function show(SupportTicket $ticket): Response
    {
        $ticket->load([
            'user:id,name,email',
            'reviewer:id,name',
        ]);

        return Inertia::render('Admin/Tickets/Show', [
            'ticket' => $ticket->toAdminArray(),
            'counts' => $this->counts(),
        ]);
    }

    public function reply(ReplySupportTicketRequest $request, SupportTicket $ticket): RedirectResponse
    {
        $data = $request->validated();
        $close = (bool) ($data['close'] ?? false);

        $ticket->update([
            'admin_reply' => $data['admin_reply'],
            'status' => $close ? SupportTicket::STATUS_CLOSED : SupportTicket::STATUS_ANSWERED,
            'reviewed_by' => $request->user()->id,
            'answered_at' => $ticket->answered_at ?? now(),
            'closed_at' => $close ? now() : null,
        ]);

        $ticket->loadMissing('user');
        if ($ticket->user) {
            $ticket->user->notify(new SupportTicketRepliedNotification($ticket->fresh()));
        }

        return redirect()
            ->route('admin.tickets.show', $ticket)
            ->with('success', $close
                ? 'Reply sent and ticket closed.'
                : 'Reply sent to the member.');
    }

    public function close(Request $request, SupportTicket $ticket): RedirectResponse
    {
        abort_if($ticket->status === SupportTicket::STATUS_CLOSED, 422);

        $ticket->update([
            'status' => SupportTicket::STATUS_CLOSED,
            'reviewed_by' => $request->user()->id,
            'closed_at' => now(),
        ]);

        return redirect()
            ->route('admin.tickets.show', $ticket)
            ->with('success', 'Ticket closed.');
    }

    public function reopen(Request $request, SupportTicket $ticket): RedirectResponse
    {
        abort_unless($ticket->status === SupportTicket::STATUS_CLOSED, 422);

        $ticket->update([
            'status' => filled($ticket->admin_reply)
                ? SupportTicket::STATUS_ANSWERED
                : SupportTicket::STATUS_OPEN,
            'reviewed_by' => $request->user()->id,
            'closed_at' => null,
        ]);

        return redirect()
            ->route('admin.tickets.show', $ticket)
            ->with('success', 'Ticket reopened.');
    }

    public function destroy(SupportTicket $ticket): RedirectResponse
    {
        if ($ticket->hasAttachment() && $ticket->attachment_path) {
            Storage::disk('local')->delete($ticket->attachment_path);
        }

        $ticket->delete();

        return redirect()
            ->route('admin.tickets.index')
            ->with('success', 'Ticket deleted.');
    }

    public function downloadAttachment(Request $request, SupportTicket $ticket): StreamedResponse
    {
        abort_unless($ticket->hasAttachment(), 404);
        abort_unless(Storage::disk('local')->exists($ticket->attachment_path), 404);

        $name = $ticket->attachment_name ?: 'attachment';
        $mime = $ticket->attachment_mime ?: 'application/octet-stream';
        $inline = $request->boolean('inline')
            && str_starts_with((string) $ticket->attachment_mime, 'image/');

        return Storage::disk('local')->response(
            $ticket->attachment_path,
            $name,
            ['Content-Type' => $mime],
            $inline ? 'inline' : 'attachment',
        );
    }

    /**
     * @return array{open: int, answered: int, closed: int, all: int}
     */
    private function counts(): array
    {
        return [
            'open' => SupportTicket::query()->where('status', SupportTicket::STATUS_OPEN)->count(),
            'answered' => SupportTicket::query()->where('status', SupportTicket::STATUS_ANSWERED)->count(),
            'closed' => SupportTicket::query()->where('status', SupportTicket::STATUS_CLOSED)->count(),
            'all' => SupportTicket::query()->count(),
        ];
    }
}
