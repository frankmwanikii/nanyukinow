<?php

namespace App\Support;

use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Collection;

class MemberNotifications
{
    /**
     * @return array{unread_count: int, recent: list<array<string, mixed>>}
     */
    public static function forUser(?\App\Models\User $user): array
    {
        if (! $user) {
            return [
                'unread_count' => 0,
                'recent' => [],
            ];
        }

        $recent = $user->notifications()
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (DatabaseNotification $n) => self::transform($n))
            ->values()
            ->all();

        return [
            'unread_count' => $user->unreadNotifications()->count(),
            'recent' => $recent,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function transform(DatabaseNotification $notification): array
    {
        $data = is_array($notification->data) ? $notification->data : [];

        return [
            'id' => $notification->id,
            'type' => $data['type'] ?? 'general',
            'title' => $data['title'] ?? 'Notification',
            'body' => $data['body'] ?? '',
            'action_url' => $data['action_url'] ?? route('account.index'),
            'action_label' => $data['action_label'] ?? 'View',
            'icon' => $data['icon'] ?? 'bell',
            'read_at' => $notification->read_at?->toIso8601String(),
            'created_at' => $notification->created_at?->toIso8601String(),
            'created_ago' => $notification->created_at?->diffForHumans(),
        ];
    }
}
