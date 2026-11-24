<?php

namespace App\Support;

use App\Models\Conversation;
use App\Models\Listing;
use App\Models\ListingClaim;
use App\Models\ListingReport;
use App\Models\PlanUpgrade;
use App\Models\SupportTicket;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Throwable;

class AdminNotifications
{
    /**
     * @return array{
     *     unread_count: int,
     *     message_unread: int,
     *     alert_count: int,
     *     messages: list<array<string, mixed>>,
     *     alerts: list<array<string, mixed>>
     * }
     */
    public static function inbox(): array
    {
        try {
            $messageUnread = (int) Cache::remember(
                'admin.badge.inbox_messages',
                30,
                fn () => Conversation::query()->where('admin_status', 'new')->count(),
            );

            $pendingListings = (int) Cache::remember(
                'admin.badge.pending_listings',
                30,
                fn () => Listing::query()->where('status', 'pending')->count(),
            );

            $pendingClaims = (int) Cache::remember(
                'admin.badge.pending_claims',
                30,
                fn () => ListingClaim::query()
                    ->where('status', ListingClaim::STATUS_PENDING)
                    ->count(),
            );

            $pendingReports = (int) Cache::remember(
                'admin.badge.pending_reports',
                30,
                fn () => ListingReport::query()
                    ->where('status', ListingReport::STATUS_PENDING)
                    ->count(),
            );

            $pendingUpgrades = (int) Cache::remember(
                'admin.badge.pending_upgrades',
                30,
                fn () => PlanUpgrade::query()
                    ->where('status', PlanUpgrade::STATUS_PENDING)
                    ->count(),
            );

            $openTickets = (int) Cache::remember(
                'admin.badge.open_tickets',
                30,
                fn () => SupportTicket::query()
                    ->where('status', SupportTicket::STATUS_OPEN)
                    ->count(),
            );

            $alerts = array_values(array_filter([
                self::alert(
                    'pending-listings',
                    $pendingListings,
                    $pendingListings === 1
                        ? '1 listing awaiting review'
                        : "{$pendingListings} listings awaiting review",
                    'Member submissions waiting for approval',
                    route('admin.listings.index', ['status' => 'pending']),
                ),
                self::alert(
                    'pending-claims',
                    $pendingClaims,
                    $pendingClaims === 1
                        ? '1 ownership claim to review'
                        : "{$pendingClaims} ownership claims to review",
                    'Claim requests from the public',
                    route('admin.claims.index'),
                ),
                self::alert(
                    'pending-reports',
                    $pendingReports,
                    $pendingReports === 1
                        ? '1 listing report open'
                        : "{$pendingReports} listing reports open",
                    'Reports filed from the public site',
                    route('admin.reports.index'),
                ),
                self::alert(
                    'open-tickets',
                    $openTickets,
                    $openTickets === 1
                        ? '1 support ticket open'
                        : "{$openTickets} support tickets open",
                    'Member concerns waiting for a reply',
                    route('admin.tickets.index', ['status' => 'open']),
                ),
                self::alert(
                    'pending-upgrades',
                    $pendingUpgrades,
                    $pendingUpgrades === 1
                        ? '1 payment waiting in finance'
                        : "{$pendingUpgrades} payments waiting in finance",
                    'Membership upgrades awaiting confirmation',
                    route('admin.finance.index'),
                ),
            ]));

            $messages = Conversation::query()
                ->with([
                    'listing:id,title,slug',
                    'latestMessage.user:id,name,avatar_url',
                ])
                ->whereNotNull('last_message_at')
                ->orderByDesc('last_message_at')
                ->limit(5)
                ->get()
                ->map(fn (Conversation $conversation) => self::transformMessage($conversation))
                ->values()
                ->all();

            $alertCount = count($alerts);

            return [
                'unread_count' => $messageUnread + $alertCount,
                'message_unread' => $messageUnread,
                'alert_count' => $alertCount,
                'messages' => $messages,
                'alerts' => $alerts,
            ];
        } catch (Throwable) {
            return [
                'unread_count' => 0,
                'message_unread' => 0,
                'alert_count' => 0,
                'messages' => [],
                'alerts' => [],
            ];
        }
    }

    public static function markMessagesRead(): int
    {
        $updated = Conversation::query()
            ->where('admin_status', 'new')
            ->update(['admin_status' => 'read']);

        Cache::forget('admin.badge.inbox_messages');

        return $updated;
    }

    /**
     * @return array<string, mixed>|null
     */
    private static function alert(
        string $id,
        int $count,
        string $title,
        string $body,
        string $url,
    ): ?array {
        if ($count < 1) {
            return null;
        }

        return [
            'id' => $id,
            'title' => $title,
            'body' => $body,
            'url' => $url,
            'count' => $count,
            'unread' => true,
            'created_ago' => 'Needs attention',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function transformMessage(Conversation $conversation): array
    {
        $latest = $conversation->latestMessage;
        $listing = $conversation->listing;
        $from = $latest?->senderName() ?? 'Guest';
        $subject = $conversation->subject
            ?: ($listing?->title ? 'Inquiry · '.$listing->title : 'Inquiry');
        $body = (string) ($latest?->body ?? '');
        $preview = $body !== ''
            ? Str::limit(
                trim(preg_replace('/\s+/', ' ', strip_tags(html_entity_decode($body, ENT_QUOTES | ENT_HTML5, 'UTF-8'))) ?? ''),
                110,
            )
            : $subject;

        return [
            'id' => $conversation->id,
            'from' => $from,
            'title' => $subject,
            'body' => $preview,
            'unread' => ($conversation->admin_status ?: 'new') === 'new',
            'created_ago' => $conversation->last_message_at?->diffForHumans()
                ?: $conversation->created_at?->diffForHumans()
                ?: '',
            'url' => route('admin.messages.index', [
                'folder' => 'inbox',
                'id' => $conversation->id,
            ]),
            'avatar_url' => UserAvatar::publicUrl($latest?->user?->avatar_url),
        ];
    }
}
