<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBroadcastRequest;
use App\Mail\AdminBroadcastMail;
use App\Models\CommunicationCampaign;
use App\Models\CommunicationLog;
use App\Models\Conversation;
use App\Models\NewsletterSubscriber;
use App\Models\User;
use App\Support\AdminCommunications;
use App\Support\AdminNotifications;
use App\Support\SafeHtml;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class MessageController extends Controller
{
    public function index(Request $request): Response
    {
        $folder = $request->string('folder')->toString();
        if (! in_array($folder, ['inbox', 'starred', 'sent', 'drafts', 'newsletter', 'subscribers', 'compose'], true)) {
            $folder = 'inbox';
        }

        $statusFilter = $request->string('status')->toString();
        if (! in_array($statusFilter, ['new', 'read', 'closed'], true)) {
            $statusFilter = '';
        }

        $composeMode = $request->string('compose')->toString();
        if (! in_array($composeMode, ['group', 'contact', 'email'], true)) {
            $composeMode = 'group';
        }

        $search = trim($request->string('q')->toString());
        $counts = AdminCommunications::mailCounts();
        $selectedId = $request->integer('id');

        $messages = ['data' => [], 'links' => [], 'meta' => ['total' => 0]];
        $selected = null;

        if ($folder === 'subscribers') {
            $query = NewsletterSubscriber::query()->orderByDesc('subscribed_at');
            if ($search !== '') {
                $query->where('email', 'like', '%'.$search.'%');
            }
            $messages = $query->paginate(30)->withQueryString()->through(fn (NewsletterSubscriber $row) => [
                'id' => $row->id,
                'folder' => 'subscribers',
                'name' => $row->email,
                'email' => $row->email,
                'subject' => 'Newsletter subscriber',
                'snippet' => $row->subscribed_at?->format('M j, Y') ?? '',
                'date' => $row->subscribed_at?->toIso8601String(),
                'date_short' => $row->subscribed_at?->format('M j') ?? '',
                'starred' => false,
                'status' => 'read',
                'unread' => false,
            ]);
        } elseif ($folder === 'newsletter') {
            $messages = CommunicationCampaign::query()
                ->where('audience', CommunicationCampaign::AUDIENCE_NEWSLETTER)
                ->where('status', '!=', CommunicationCampaign::STATUS_DRAFT)
                ->when($search !== '', function ($q) use ($search) {
                    $q->where(function ($inner) use ($search) {
                        $inner->where('subject', 'like', '%'.$search.'%')
                            ->orWhere('body', 'like', '%'.$search.'%');
                    });
                })
                ->orderByDesc('sent_at')
                ->orderByDesc('id')
                ->paginate(30)
                ->withQueryString()
                ->through(fn (CommunicationCampaign $campaign) => [
                    'id' => $campaign->id,
                    'folder' => 'newsletter',
                    'name' => 'Newsletter',
                    'email' => null,
                    'subject' => $campaign->subject,
                    'snippet' => $this->plainSnippet($campaign->body),
                    'date' => $campaign->sent_at?->toIso8601String() ?? $campaign->created_at?->toIso8601String(),
                    'date_short' => ($campaign->sent_at ?? $campaign->created_at)?->format('M j') ?? '',
                    'starred' => false,
                    'status' => $campaign->status,
                    'unread' => false,
                    'body' => $campaign->body,
                    'sent_count' => $campaign->sent_count,
                    'recipient_count' => $campaign->recipient_count,
                ]);
        } elseif ($folder === 'drafts') {
            $messages = CommunicationCampaign::query()
                ->where('status', CommunicationCampaign::STATUS_DRAFT)
                ->when($search !== '', function ($q) use ($search) {
                    $q->where(function ($inner) use ($search) {
                        $inner->where('subject', 'like', '%'.$search.'%')
                            ->orWhere('body', 'like', '%'.$search.'%');
                    });
                })
                ->orderByDesc('updated_at')
                ->paginate(30)
                ->withQueryString()
                ->through(fn (CommunicationCampaign $campaign) => [
                    'id' => $campaign->id,
                    'folder' => 'drafts',
                    'name' => $campaign->audienceLabel(),
                    'email' => null,
                    'subject' => $campaign->subject ?: '(No subject)',
                    'snippet' => $this->plainSnippet($campaign->body),
                    'date' => $campaign->updated_at?->toIso8601String(),
                    'date_short' => $campaign->updated_at?->format('M j') ?? '',
                    'starred' => false,
                    'status' => 'draft',
                    'unread' => false,
                    'body' => $campaign->body,
                    'audience' => $campaign->audience,
                    'channel' => $campaign->channel,
                ]);
        } elseif ($folder === 'sent' || ($folder === 'starred' && $request->boolean('sent_only'))) {
            $query = CommunicationLog::query()->orderByDesc('sent_at')->orderByDesc('id');
            if ($folder === 'starred') {
                $query->where('starred', true);
            }
            if ($search !== '') {
                $query->where(function ($q) use ($search) {
                    $q->where('recipient_email', 'like', '%'.$search.'%')
                        ->orWhere('recipient_name', 'like', '%'.$search.'%')
                        ->orWhere('subject', 'like', '%'.$search.'%')
                        ->orWhere('body', 'like', '%'.$search.'%');
                });
            }
            $messages = $query->paginate(30)->withQueryString()->through(fn (CommunicationLog $log) => [
                'id' => $log->id,
                'folder' => 'sent',
                'name' => $log->recipient_name ?: $log->recipient_email,
                'email' => $log->recipient_email,
                'subject' => $log->subject,
                'snippet' => $this->plainSnippet($log->body),
                'date' => $log->sent_at?->toIso8601String(),
                'date_short' => $log->sent_at?->format('M j') ?? '',
                'starred' => (bool) $log->starred,
                'status' => $log->status === 'sent' ? 'read' : $log->status,
                'unread' => false,
                'body' => $log->body,
                'channel' => $log->channel,
            ]);

            if ($selectedId > 0) {
                $log = CommunicationLog::query()->find($selectedId);
                if ($log) {
                    $selected = [
                        'id' => $log->id,
                        'folder' => 'sent',
                        'subject' => $log->subject,
                        'name' => $log->recipient_name ?: $log->recipient_email,
                        'email' => $log->recipient_email,
                        'body' => $log->body,
                        'date' => $log->sent_at?->toIso8601String(),
                        'starred' => (bool) $log->starred,
                        'status' => $log->status,
                        'channel' => $log->channel,
                    ];
                }
            }
        } elseif (in_array($folder, ['inbox', 'starred'], true) || $statusFilter !== '') {
            $listFolder = $folder === 'starred' ? 'starred' : 'inbox';
            $query = Conversation::query()
                ->with(['listing:id,title,slug', 'latestMessage'])
                ->orderByDesc('last_message_at')
                ->orderByDesc('id');

            if ($listFolder === 'starred') {
                $query->where('starred', true);
            }
            if ($statusFilter !== '') {
                $query->where('admin_status', $statusFilter);
            }
            if ($search !== '') {
                $query->where(function ($q) use ($search) {
                    $q->where('subject', 'like', '%'.$search.'%')
                        ->orWhereHas('latestMessage', function ($message) use ($search) {
                            $message->where('body', 'like', '%'.$search.'%')
                                ->orWhere('guest_name', 'like', '%'.$search.'%')
                                ->orWhere('guest_email', 'like', '%'.$search.'%');
                        })
                        ->orWhereHas('listing', fn ($listing) => $listing->where('title', 'like', '%'.$search.'%'));
                });
            }

            $messages = $query->paginate(30)->withQueryString()->through(function (Conversation $conversation) {
                $latest = $conversation->latestMessage;
                $subject = $conversation->subject
                    ?: ($conversation->listing?->title ? 'Inquiry · '.$conversation->listing->title : 'Inquiry');
                $body = (string) ($latest?->body ?? '');

                return [
                    'id' => $conversation->id,
                    'folder' => 'inbox',
                    'name' => $latest?->senderName() ?? 'Guest',
                    'email' => $latest?->guest_email,
                    'subject' => $subject,
                    'snippet' => $this->plainSnippet($body),
                    'date' => $conversation->last_message_at?->toIso8601String()
                        ?? $conversation->created_at?->toIso8601String(),
                    'date_short' => ($conversation->last_message_at ?? $conversation->created_at)?->format('M j') ?? '',
                    'starred' => (bool) $conversation->starred,
                    'status' => $conversation->admin_status ?: 'new',
                    'unread' => ($conversation->admin_status ?: 'new') === 'new',
                ];
            });

            if ($selectedId > 0) {
                $conversation = Conversation::query()
                    ->with([
                        'listing:id,title,slug',
                        'messages' => fn ($q) => $q->reorder()->oldest('created_at')->oldest('id')->with('user:id,name,email'),
                    ])
                    ->find($selectedId);

                if ($conversation) {
                    if (($conversation->admin_status ?: 'new') === 'new') {
                        $conversation->update(['admin_status' => 'read']);
                    }

                    $selected = [
                        'id' => $conversation->id,
                        'folder' => 'inbox',
                        'subject' => $conversation->subject
                            ?: ($conversation->listing?->title ? 'Inquiry · '.$conversation->listing->title : 'Inquiry'),
                        'listing' => $conversation->listing
                            ? [
                                'title' => $conversation->listing->title,
                                'slug' => $conversation->listing->slug,
                            ]
                            : null,
                        'starred' => (bool) $conversation->starred,
                        'status' => $conversation->admin_status ?: 'read',
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
        }

        $contacts = User::query()
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->orderBy('name')
            ->limit(200)
            ->get(['id', 'name', 'email'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ])
            ->values();

        return Inertia::render('Admin/Messages/Index', [
            'folder' => $folder,
            'statusFilter' => $statusFilter,
            'composeMode' => $composeMode,
            'q' => $search,
            'prefillTo' => trim($request->string('to')->toString()),
            'counts' => $counts,
            'messages' => $messages,
            'selected' => $selected,
            'contacts' => $contacts,
        ]);
    }

    public function store(StoreBroadcastRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $intent = $data['intent'] ?? 'send';
        $channel = $data['channel'];
        $mode = $data['mode'];
        $data['body'] = SafeHtml::sanitizeMessage($data['body'] ?? '');

        if (SafeHtml::plainTextLength($data['body']) < 1) {
            throw ValidationException::withMessages([
                'body' => 'Write a message before sending.',
            ]);
        }

        if ($intent === 'draft') {
            CommunicationCampaign::query()->create([
                'user_id' => $request->user()->id,
                'channel' => $channel,
                'audience' => $data['audience'] ?? CommunicationCampaign::AUDIENCE_ALL_MEMBERS,
                'subject' => $data['subject'],
                'body' => $data['body'],
                'status' => CommunicationCampaign::STATUS_DRAFT,
                'recipient_count' => 0,
                'sent_count' => 0,
                'failed_count' => 0,
                'sent_at' => null,
            ]);

            return redirect()
                ->route('admin.messages.index', ['folder' => 'drafts'])
                ->with('success', 'Draft saved.');
        }

        if ($mode === 'single') {
            $recipients = collect([[
                'email' => strtolower(trim((string) $data['to_email'])),
                'name' => trim((string) ($data['to_name'] ?? '')) ?: (string) $data['to_email'],
                'phone' => null,
            ]]);
            $audience = CommunicationCampaign::AUDIENCE_ALL_MEMBERS;
        } else {
            $audience = $data['audience'] ?? CommunicationCampaign::AUDIENCE_ALL_MEMBERS;
            $recipients = AdminCommunications::recipientsFor($audience);
        }

        if ($channel === CommunicationCampaign::CHANNEL_SMS) {
            $recipients = $recipients
                ->filter(fn (array $row) => filled($row['phone'] ?? null))
                ->values();
        }

        if ($recipients->isEmpty()) {
            return back()
                ->withInput()
                ->with('error', $channel === CommunicationCampaign::CHANNEL_SMS
                    ? 'No recipients with a phone number in that audience yet.'
                    : 'No recipients found.');
        }

        $campaign = CommunicationCampaign::query()->create([
            'user_id' => $request->user()->id,
            'channel' => $channel,
            'audience' => $audience,
            'subject' => $data['subject'],
            'body' => $data['body'],
            'status' => CommunicationCampaign::STATUS_SENT,
            'recipient_count' => $recipients->count(),
            'sent_count' => 0,
            'failed_count' => 0,
            'sent_at' => now(),
        ]);

        if ($channel === CommunicationCampaign::CHANNEL_SMS) {
            foreach ($recipients as $recipient) {
                CommunicationLog::query()->create([
                    'campaign_id' => $campaign->id,
                    'user_id' => $request->user()->id,
                    'channel' => $channel,
                    'recipient_email' => $recipient['email'],
                    'recipient_name' => $recipient['name'],
                    'subject' => $data['subject'],
                    'body' => $data['body'],
                    'status' => 'failed',
                    'sent_at' => now(),
                ]);
            }

            $campaign->update([
                'status' => CommunicationCampaign::STATUS_FAILED,
                'failed_count' => $recipients->count(),
            ]);

            return redirect()
                ->route('admin.messages.index', ['folder' => 'sent'])
                ->with('error', 'SMS isn’t connected yet — messages were logged but not delivered. Use Email for now.');
        }

        $sent = 0;
        $failed = 0;

        foreach ($recipients as $recipient) {
            $ok = false;
            try {
                Mail::to($recipient['email'])->send(new AdminBroadcastMail(
                    subjectLine: $data['subject'],
                    bodyText: $data['body'],
                    recipientName: $recipient['name'],
                ));
                $ok = true;
                $sent++;
            } catch (Throwable $e) {
                $failed++;
                Log::warning('Admin broadcast failed', [
                    'email' => $recipient['email'],
                    'error' => $e->getMessage(),
                ]);
            }

            CommunicationLog::query()->create([
                'campaign_id' => $campaign->id,
                'user_id' => $request->user()->id,
                'channel' => $channel,
                'recipient_email' => $recipient['email'],
                'recipient_name' => $recipient['name'],
                'subject' => $data['subject'],
                'body' => $data['body'],
                'status' => $ok ? 'sent' : 'failed',
                'sent_at' => now(),
            ]);
        }

        $campaign->update([
            'status' => match (true) {
                $sent === 0 => CommunicationCampaign::STATUS_FAILED,
                $failed > 0 => CommunicationCampaign::STATUS_PARTIAL,
                default => CommunicationCampaign::STATUS_SENT,
            },
            'sent_count' => $sent,
            'failed_count' => $failed,
        ]);

        $message = $failed > 0
            ? "Sent {$sent} of {$recipients->count()} messages ({$failed} failed)."
            : "Sent to {$sent} recipient".($sent === 1 ? '' : 's').'.';

        return redirect()
            ->route('admin.messages.index', ['folder' => 'sent'])
            ->with($failed > 0 && $sent === 0 ? 'error' : 'success', $message);
    }

    public function readAll(): RedirectResponse
    {
        $updated = AdminNotifications::markMessagesRead();

        return back()->with(
            'success',
            $updated > 0
                ? 'Inbox messages marked as read.'
                : 'No unread inbox messages.',
        );
    }

    public function star(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'folder' => ['required', 'string', 'in:inbox,sent'],
            'id' => ['required', 'integer', 'min:1'],
        ]);

        if ($data['folder'] === 'sent') {
            $log = CommunicationLog::query()->findOrFail($data['id']);
            $log->update(['starred' => ! $log->starred]);
        } else {
            $conversation = Conversation::query()->findOrFail($data['id']);
            $conversation->update(['starred' => ! $conversation->starred]);
        }

        return back();
    }

    public function label(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'min:1'],
            'status' => ['required', 'string', 'in:new,read,closed'],
        ]);

        Conversation::query()
            ->whereIn('id', $data['ids'])
            ->update(['admin_status' => $data['status']]);

        return back()->with('success', 'Label updated.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'folder' => ['required', 'string', 'in:inbox,sent,drafts'],
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'min:1'],
        ]);

        if ($data['folder'] === 'sent') {
            CommunicationLog::query()->whereIn('id', $data['ids'])->delete();
        } elseif ($data['folder'] === 'drafts') {
            CommunicationCampaign::query()
                ->where('status', CommunicationCampaign::STATUS_DRAFT)
                ->whereIn('id', $data['ids'])
                ->delete();
        } else {
            Conversation::query()->whereIn('id', $data['ids'])->each(function (Conversation $conversation) {
                $conversation->messages()->delete();
                $conversation->participants()->detach();
                $conversation->delete();
            });
        }

        return back()->with('success', 'Deleted.');
    }

    private function plainSnippet(?string $body, int $limit = 80): string
    {
        $plain = html_entity_decode(strip_tags((string) $body), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $plain = preg_replace('/\s+/', ' ', $plain) ?? '';

        return Str::limit(trim($plain), $limit);
    }
}
