<?php

namespace App\Support;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class MemberMessages
{
    /**
     * @return array{unread_count: int, recent: list<array<string, mixed>>}
     */
    public static function forUser(?User $user): array
    {
        if (! $user) {
            return [
                'unread_count' => 0,
                'recent' => [],
            ];
        }

        $conversations = self::conversationsQuery($user)
            ->with(['latestMessage.user', 'listing:id,title,slug'])
            ->limit(8)
            ->get();

        return [
            'unread_count' => self::unreadCount($user),
            'recent' => $conversations
                ->map(fn (Conversation $c) => self::transformSummary($c, $user))
                ->values()
                ->all(),
        ];
    }

    public static function unreadCount(User $user): int
    {
        return self::conversationsQuery($user)
            ->get()
            ->filter(fn (Conversation $c) => self::isUnread($c, $user))
            ->count();
    }

    /**
     * @return Builder<Conversation>
     */
    public static function conversationsQuery(User $user)
    {
        return Conversation::query()
            ->whereHas('participants', fn ($q) => $q->where('users.id', $user->id))
            ->with(['participants' => fn ($q) => $q->where('users.id', $user->id)])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id');
    }

    public static function isUnread(Conversation $conversation, User $user): bool
    {
        $pivot = $conversation->participants->firstWhere('id', $user->id)?->pivot;
        $lastRead = $pivot?->last_read_at;
        $lastMessageAt = $conversation->last_message_at;

        if (! $lastMessageAt) {
            return false;
        }

        if (! $lastRead) {
            return true;
        }

        return $lastMessageAt->gt($lastRead);
    }

    /**
     * @return array<string, mixed>
     */
    public static function transformSummary(Conversation $conversation, User $user): array
    {
        $latest = $conversation->latestMessage;
        $listing = $conversation->listing;

        $title = $listing?->title
            ?: ($conversation->subject ?: 'Message');

        $preview = $latest?->body
            ? Str::limit(
                trim(preg_replace('/\s+/', ' ', strip_tags(html_entity_decode($latest->body, ENT_QUOTES | ENT_HTML5, 'UTF-8'))) ?? ''),
                110,
            )
            : '';

        $from = $latest?->senderName() ?? 'Someone';

        return [
            'id' => $conversation->id,
            'title' => $title,
            'body' => $preview,
            'from' => $from,
            'listing_title' => $listing?->title,
            'unread' => self::isUnread($conversation, $user),
            'created_at' => $latest?->created_at?->toIso8601String()
                ?: $conversation->last_message_at?->toIso8601String(),
            'created_ago' => $latest?->created_at?->diffForHumans()
                ?: $conversation->last_message_at?->diffForHumans()
                ?: '',
            'url' => route('account.messages.show', $conversation),
            'avatar_url' => UserAvatar::normalize($latest?->user?->avatar_url),
            'initials' => self::initials($from),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function transformMessage(Message $message, User $viewer): array
    {
        $name = $message->senderName();

        return [
            'id' => $message->id,
            'body' => $message->body,
            'mine' => $message->user_id === $viewer->id,
            'sender_name' => $name,
            'guest_email' => $message->guest_email,
            'guest_phone' => $message->guest_phone,
            'avatar_url' => UserAvatar::normalize($message->user?->avatar_url),
            'initials' => self::initials($name),
            'created_at' => $message->created_at?->toIso8601String(),
            'created_ago' => $message->created_at?->diffForHumans(),
        ];
    }

    private static function initials(string $name): string
    {
        $parts = preg_split('/\s+/', trim($name)) ?: [];
        $parts = array_values(array_filter($parts));

        if (count($parts) === 0) {
            return 'M';
        }

        if (count($parts) === 1) {
            return strtoupper(substr($parts[0], 0, 2));
        }

        return strtoupper(substr($parts[0], 0, 1).substr($parts[1], 0, 1));
    }
}
