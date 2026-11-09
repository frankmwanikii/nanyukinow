<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Mail\ListingOwnerReplyMail;
use App\Models\Conversation;
use App\Models\Message;
use App\Support\MemberMessages;
use App\Support\MemberNotifications;
use App\Support\UserAvatar;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MessageController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->inbox($request);
    }

    public function show(Request $request, Conversation $conversation): Response
    {
        $user = $request->user();
        abort_unless($conversation->isParticipant($user), 403);

        return $this->inbox($request, $conversation);
    }

    public function reply(Request $request, Conversation $conversation): RedirectResponse
    {
        $user = $request->user();
        abort_unless($conversation->isParticipant($user), 403);

        $data = $request->validate([
            'body' => ['nullable', 'string', 'max:5000'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => [
                'file',
                'max:8192',
                'mimes:jpg,jpeg,png,webp,gif,pdf,doc,docx',
            ],
        ]);

        $body = trim((string) ($data['body'] ?? ''));
        $uploads = $request->file('attachments', []) ?: [];

        if ($body === '' && $uploads === []) {
            throw ValidationException::withMessages([
                'body' => 'Write a reply or attach a file.',
            ]);
        }

        $attachments = $this->storeAttachments(
            $uploads,
            $user->id,
            $conversation->id,
        );

        $message = $conversation->messages()->create([
            'user_id' => $user->id,
            'body' => $body !== '' ? $body : '',
            'attachments' => $attachments !== [] ? $attachments : null,
        ]);

        $conversation->forceFill(['last_message_at' => $message->created_at])->save();

        $conversation->participants()->updateExistingPivot($user->id, [
            'last_read_at' => now(),
        ]);

        if ($body !== '') {
            $this->emailGuestReply($conversation, $user, $body);
        }

        return redirect()
            ->route('account.messages.show', $conversation)
            ->with('success', 'Message sent.');
    }

    public function downloadAttachment(
        Request $request,
        Conversation $conversation,
        Message $message,
        int $index,
    ): StreamedResponse|BinaryFileResponse {
        $user = $request->user();
        abort_unless($conversation->isParticipant($user), 403);
        abort_unless((int) $message->conversation_id === (int) $conversation->id, 404);

        $attachments = is_array($message->attachments) ? $message->attachments : [];
        $file = $attachments[$index] ?? null;
        abort_unless(is_array($file) && filled($file['path'] ?? null), 404);
        abort_unless(Storage::disk('local')->exists($file['path']), 404);

        $name = $file['name'] ?? 'attachment';
        $mime = $file['mime'] ?? Storage::disk('local')->mimeType($file['path']);
        $forceDownload = $request->boolean('download');

        if (! $forceDownload && $this->attachmentIsPreviewable($mime)) {
            return Storage::disk('local')->response(
                $file['path'],
                $name,
                [
                    'Content-Type' => $mime ?: 'application/octet-stream',
                    'X-Content-Type-Options' => 'nosniff',
                ],
                'inline',
            );
        }

        return Storage::disk('local')->download($file['path'], $name);
    }

    private function attachmentIsPreviewable(?string $mime): bool
    {
        if (! is_string($mime) || $mime === '') {
            return false;
        }

        return str_starts_with($mime, 'image/') || $mime === 'application/pdf';
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $user = $request->user();

        $ids = MemberMessages::conversationsQuery($user)->pluck('conversations.id');

        if ($ids->isNotEmpty()) {
            DB::table('conversation_participants')
                ->where('user_id', $user->id)
                ->whereIn('conversation_id', $ids)
                ->update(['last_read_at' => now()]);
        }

        $user->unreadNotifications->markAsRead();

        return back()->with('success', 'All caught up.');
    }

    public function destroy(Request $request, Conversation $conversation): RedirectResponse
    {
        $user = $request->user();
        abort_unless($conversation->isParticipant($user), 403);

        $conversation->participants()->detach($user->id);

        if ($conversation->participants()->count() === 0) {
            $conversation->messages()->delete();
            $conversation->delete();
        }

        return redirect()
            ->route('account.messages', ['tab' => 'chats'])
            ->with('success', 'Chat deleted.');
    }

    public function destroyAlert(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()
            ->notifications()
            ->whereKey($id)
            ->firstOrFail();

        $notification->delete();

        return redirect()
            ->route('account.messages', ['tab' => 'alerts'])
            ->with('success', 'Alert deleted.');
    }

    private function inbox(Request $request, ?Conversation $activeConversation = null): Response
    {
        $user = $request->user();
        $tab = $request->string('tab')->toString() ?: 'all';
        if (! in_array($tab, ['all', 'chats', 'alerts'], true)) {
            $tab = 'all';
        }
        $search = trim($request->string('q')->toString());
        $notificationId = $request->string('n')->toString();

        $conversations = MemberMessages::conversationsQuery($user)
            ->with(['latestMessage.user', 'listing:id,title,slug'])
            ->limit(60)
            ->get()
            ->map(fn (Conversation $c) => MemberMessages::transformSummary($c, $user))
            ->values();

        $notifications = $user->notifications()
            ->latest()
            ->limit(60)
            ->get()
            ->map(fn ($n) => MemberNotifications::transform($n))
            ->values();

        if ($search !== '') {
            $needle = mb_strtolower($search);
            $conversations = $conversations->filter(function (array $item) use ($needle) {
                return str_contains(mb_strtolower($item['from'].' '.$item['title'].' '.$item['body']), $needle);
            })->values();

            $notifications = $notifications->filter(function (array $item) use ($needle) {
                return str_contains(mb_strtolower($item['title'].' '.$item['body']), $needle);
            })->values();
        }

        $active = null;
        $activeType = null;

        if ($activeConversation) {
            $activeType = 'chat';
            $active = $this->conversationPayload($activeConversation, $user);
            $activeConversation->participants()->updateExistingPivot($user->id, [
                'last_read_at' => now(),
            ]);
        } elseif ($notificationId !== '') {
            $notification = $user->notifications()->whereKey($notificationId)->first();
            if ($notification) {
                if ($notification->read_at === null) {
                    $notification->markAsRead();
                    $notifications = $user->notifications()
                        ->latest()
                        ->limit(60)
                        ->get()
                        ->map(fn ($n) => MemberNotifications::transform($n))
                        ->values();

                    if ($search !== '') {
                        $needle = mb_strtolower($search);
                        $notifications = $notifications->filter(function (array $item) use ($needle) {
                            return str_contains(mb_strtolower($item['title'].' '.$item['body']), $needle);
                        })->values();
                    }
                }
                $activeType = 'alert';
                $active = MemberNotifications::transform($notification->fresh());
            }
        }

        $chatUnread = MemberMessages::unreadCount($user);
        $alertUnread = $user->unreadNotifications()->count();

        return Inertia::render('Account/Messages/Index', [
            'tab' => $tab,
            'q' => $search,
            'conversations' => $conversations,
            'notifications' => $notifications,
            'activeType' => $activeType,
            'active' => $active,
            'unread' => [
                'chats' => $chatUnread,
                'alerts' => $alertUnread,
                'total' => $chatUnread + $alertUnread,
            ],
        ]);
    }

    /**
     * @param  array<int, UploadedFile>  $uploads
     * @return list<array{path: string, name: string, mime: ?string, size: ?int}>
     */
    private function storeAttachments(array $uploads, int $userId, int $conversationId): array
    {
        $stored = [];
        $directory = 'message-attachments/'.$userId.'/'.$conversationId;
        $absolute = storage_path('app/private/'.$directory);

        if (! is_dir($absolute) && ! @mkdir($absolute, 0775, true) && ! is_dir($absolute)) {
            throw ValidationException::withMessages([
                'attachments' => 'Could not save the attached files. Try again.',
            ]);
        }

        foreach ($uploads as $upload) {
            if (! $upload) {
                continue;
            }

            try {
                $path = $upload->store($directory, 'local');
            } catch (\Throwable) {
                throw ValidationException::withMessages([
                    'attachments' => 'Could not save one of the attached files. Try again.',
                ]);
            }

            if (! is_string($path) || $path === '') {
                throw ValidationException::withMessages([
                    'attachments' => 'Could not save one of the attached files. Try again.',
                ]);
            }

            $stored[] = [
                'path' => $path,
                'name' => $upload->getClientOriginalName() ?: 'attachment',
                'mime' => $upload->getClientMimeType(),
                'size' => $upload->getSize() ?: null,
            ];
        }

        return $stored;
    }

    private function emailGuestReply(Conversation $conversation, $owner, string $body): void
    {
        $conversation->loadMissing(['listing', 'messages']);

        $guestMessage = $conversation->messages
            ->first(fn (Message $m) => filled($m->guest_email));

        $guestEmail = $guestMessage?->guest_email;
        if (! filled($guestEmail) || ! $conversation->listing) {
            return;
        }

        $guestName = $guestMessage?->guest_name ?: 'there';

        try {
            Mail::to($guestEmail, $guestName)->send(new ListingOwnerReplyMail(
                listing: $conversation->listing,
                ownerName: $owner->name,
                ownerEmail: $owner->email,
                guestName: $guestName,
                messageBody: $body,
            ));
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function conversationPayload(Conversation $conversation, $user): array
    {
        $conversation->load([
            'listing:id,title,slug',
            'messages' => fn ($q) => $q->reorder()->oldest('created_at')->oldest('id')->with('user'),
        ]);

        $otherParticipants = $conversation->participants()
            ->where('users.id', '!=', $user->id)
            ->get(['users.id', 'users.name', 'users.avatar_url']);

        $guest = $conversation->messages
            ->first(fn (Message $m) => filled($m->guest_name) || filled($m->guest_email));

        return [
            'id' => $conversation->id,
            'subject' => $conversation->subject,
            'listing' => $conversation->listing
                ? [
                    'id' => $conversation->listing->id,
                    'title' => $conversation->listing->title,
                    'slug' => $conversation->listing->slug,
                    'url' => route('listings.show', $conversation->listing->slug),
                ]
                : null,
            'counterpart' => $otherParticipants->first()
                ? [
                    'name' => $otherParticipants->first()->name,
                    'avatar_url' => UserAvatar::normalize($otherParticipants->first()->avatar_url),
                ]
                : [
                    'name' => $guest?->senderName() ?: 'Guest',
                    'avatar_url' => null,
                    'email' => $guest?->guest_email,
                    'phone' => $guest?->guest_phone,
                ],
            'messages' => $conversation->messages
                ->sortBy([
                    ['created_at', 'asc'],
                    ['id', 'asc'],
                ])
                ->values()
                ->map(fn (Message $m) => MemberMessages::transformMessage($m, $user))
                ->all(),
        ];
    }
}
