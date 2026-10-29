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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

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
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $body = trim($data['body']);

        $message = $conversation->messages()->create([
            'user_id' => $user->id,
            'body' => $body,
        ]);

        $conversation->forceFill(['last_message_at' => $message->created_at])->save();

        $conversation->participants()->updateExistingPivot($user->id, [
            'last_read_at' => now(),
        ]);

        $this->emailGuestReply($conversation, $user, $body);

        return redirect()
            ->route('account.messages.show', $conversation)
            ->with('success', 'Message sent.');
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
            'messages' => fn ($q) => $q->oldest()->with('user'),
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
                ->map(fn (Message $m) => MemberMessages::transformMessage($m, $user))
                ->values()
                ->all(),
        ];
    }
}
