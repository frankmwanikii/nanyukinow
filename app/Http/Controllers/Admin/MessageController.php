<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBroadcastRequest;
use App\Mail\AdminBroadcastMail;
use App\Models\CommunicationCampaign;
use App\Models\Conversation;
use App\Support\AdminCommunications;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class MessageController extends Controller
{
    public function index(Request $request): Response
    {
        $tab = $request->string('tab')->toString();
        if (! in_array($tab, ['inbox', 'sent', 'compose'], true)) {
            $tab = 'inbox';
        }

        $counts = AdminCommunications::audienceCounts();

        $inbox = $tab === 'inbox'
            ? Conversation::query()
                ->with([
                    'listing:id,title,slug',
                    'latestMessage',
                ])
                ->withCount('messages')
                ->orderByDesc('last_message_at')
                ->orderByDesc('id')
                ->paginate(20)
                ->withQueryString()
                ->through(fn (Conversation $conversation) => [
                    'id' => $conversation->id,
                    'subject' => $conversation->subject
                        ?: ($conversation->listing?->title ? 'Inquiry · '.$conversation->listing->title : 'Inquiry'),
                    'listing' => $conversation->listing
                        ? [
                            'id' => $conversation->listing->id,
                            'title' => $conversation->listing->title,
                            'slug' => $conversation->listing->slug,
                        ]
                        : null,
                    'preview' => Str::limit(
                        (string) ($conversation->latestMessage?->body ?? ''),
                        120,
                    ),
                    'from' => $conversation->latestMessage?->senderName() ?? 'Guest',
                    'email' => $conversation->latestMessage?->guest_email,
                    'phone' => $conversation->latestMessage?->guest_phone,
                    'messages_count' => $conversation->messages_count,
                    'last_message_at' => $conversation->last_message_at?->toIso8601String()
                        ?? $conversation->created_at?->toIso8601String(),
                ])
            : ['data' => [], 'links' => [], 'meta' => ['total' => $counts['inbox']]];

        $sent = $tab === 'sent'
            ? CommunicationCampaign::query()
                ->with('author:id,name')
                ->orderByDesc('sent_at')
                ->orderByDesc('id')
                ->paginate(20)
                ->withQueryString()
                ->through(fn (CommunicationCampaign $campaign) => [
                    'id' => $campaign->id,
                    'channel' => $campaign->channel,
                    'audience' => $campaign->audience,
                    'audience_label' => $campaign->audienceLabel(),
                    'subject' => $campaign->subject,
                    'body' => $campaign->body,
                    'status' => $campaign->status,
                    'recipient_count' => $campaign->recipient_count,
                    'sent_count' => $campaign->sent_count,
                    'failed_count' => $campaign->failed_count,
                    'sent_at' => $campaign->sent_at?->toIso8601String(),
                    'author' => $campaign->author?->name,
                ])
            : [
                'data' => [],
                'links' => [],
                'meta' => [
                    'total' => CommunicationCampaign::query()->count(),
                ],
            ];

        $selectedId = $request->integer('conversation');
        $selected = null;

        if ($selectedId > 0) {
            $conversation = Conversation::query()
                ->with([
                    'listing:id,title,slug',
                    'messages' => fn ($q) => $q->oldest()->with('user:id,name'),
                ])
                ->find($selectedId);

            if ($conversation) {
                $selected = [
                    'id' => $conversation->id,
                    'subject' => $conversation->subject
                        ?: ($conversation->listing?->title ? 'Inquiry · '.$conversation->listing->title : 'Inquiry'),
                    'listing' => $conversation->listing
                        ? [
                            'id' => $conversation->listing->id,
                            'title' => $conversation->listing->title,
                            'slug' => $conversation->listing->slug,
                        ]
                        : null,
                    'messages' => $conversation->messages->map(fn ($message) => [
                        'id' => $message->id,
                        'body' => $message->body,
                        'from' => $message->senderName(),
                        'email' => $message->guest_email ?: $message->user?->email,
                        'phone' => $message->guest_phone,
                        'is_guest' => $message->user_id === null,
                        'created_at' => $message->created_at?->toIso8601String(),
                    ])->values(),
                ];
            }
        }

        return Inertia::render('Admin/Messages/Index', [
            'tab' => $tab,
            'counts' => $counts,
            'inbox' => $inbox,
            'sent' => $sent,
            'selected' => $selected,
        ]);
    }

    public function store(StoreBroadcastRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $channel = $data['channel'];
        $audience = $data['audience'];
        $recipients = AdminCommunications::recipientsFor($audience);

        if ($channel === CommunicationCampaign::CHANNEL_SMS) {
            $recipients = $recipients
                ->filter(fn (array $row) => filled($row['phone']))
                ->values();
        }

        if ($recipients->isEmpty()) {
            return back()
                ->withInput()
                ->with('error', $channel === CommunicationCampaign::CHANNEL_SMS
                    ? 'No recipients with a phone number in that audience yet.'
                    : 'No recipients found for that audience.');
        }

        if ($channel === CommunicationCampaign::CHANNEL_SMS) {
            $campaign = CommunicationCampaign::query()->create([
                'user_id' => $request->user()->id,
                'channel' => $channel,
                'audience' => $audience,
                'subject' => $data['subject'],
                'body' => $data['body'],
                'status' => CommunicationCampaign::STATUS_FAILED,
                'recipient_count' => $recipients->count(),
                'sent_count' => 0,
                'failed_count' => $recipients->count(),
                'sent_at' => now(),
            ]);

            return redirect()
                ->route('admin.messages.index', ['tab' => 'sent'])
                ->with('error', "SMS isn’t connected yet — campaign #{$campaign->id} was saved but not delivered. Use Email for now.");
        }

        $sent = 0;
        $failed = 0;

        foreach ($recipients as $recipient) {
            try {
                Mail::to($recipient['email'])->send(new AdminBroadcastMail(
                    subjectLine: $data['subject'],
                    bodyText: $data['body'],
                    recipientName: $recipient['name'],
                ));
                $sent++;
            } catch (Throwable $e) {
                $failed++;
                Log::warning('Admin broadcast failed', [
                    'email' => $recipient['email'],
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $status = match (true) {
            $sent === 0 => CommunicationCampaign::STATUS_FAILED,
            $failed > 0 => CommunicationCampaign::STATUS_PARTIAL,
            default => CommunicationCampaign::STATUS_SENT,
        };

        CommunicationCampaign::query()->create([
            'user_id' => $request->user()->id,
            'channel' => $channel,
            'audience' => $audience,
            'subject' => $data['subject'],
            'body' => $data['body'],
            'status' => $status,
            'recipient_count' => $recipients->count(),
            'sent_count' => $sent,
            'failed_count' => $failed,
            'sent_at' => now(),
        ]);

        $message = $failed > 0
            ? "Sent {$sent} of {$recipients->count()} messages ({$failed} failed)."
            : "Sent to {$sent} recipient".($sent === 1 ? '' : 's').'.';

        return redirect()
            ->route('admin.messages.index', ['tab' => 'sent'])
            ->with($failed > 0 && $sent === 0 ? 'error' : 'success', $message);
    }
}
