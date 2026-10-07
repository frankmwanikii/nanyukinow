<?php

namespace App\Support;

use App\Models\CommunicationCampaign;
use App\Models\CommunicationLog;
use App\Models\Conversation;
use App\Models\NewsletterSubscriber;
use App\Models\User;
use Illuminate\Support\Collection;

class AdminCommunications
{
    /**
     * @return Collection<int, array{email: string, name: string, phone: ?string}>
     */
    public static function recipientsFor(string $audience): Collection
    {
        return match ($audience) {
            CommunicationCampaign::AUDIENCE_NEWSLETTER => NewsletterSubscriber::query()
                ->orderBy('email')
                ->get(['email'])
                ->map(fn (NewsletterSubscriber $subscriber) => [
                    'email' => strtolower(trim((string) $subscriber->email)),
                    'name' => strtolower(trim((string) $subscriber->email)),
                    'phone' => null,
                ])
                ->filter(fn (array $row) => $row['email'] !== '')
                ->unique('email')
                ->values(),
            CommunicationCampaign::AUDIENCE_PLAN_FREE => self::membersByPlan(Membership::FREE),
            CommunicationCampaign::AUDIENCE_PLAN_STANDARD => self::membersByPlan(Membership::STANDARD),
            CommunicationCampaign::AUDIENCE_PLAN_PREMIUM => self::membersByPlan(Membership::PREMIUM),
            default => self::allMembers(),
        };
    }

    /**
     * @return Collection<int, array{email: string, name: string, phone: ?string}>
     */
    public static function allMembers(): Collection
    {
        return User::query()
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone', 'plan', 'plan_expires_at'])
            ->map(fn (User $user) => self::mapUser($user))
            ->filter(fn (array $row) => $row['email'] !== '')
            ->unique('email')
            ->values();
    }

    /**
     * @return Collection<int, array{email: string, name: string, phone: ?string}>
     */
    public static function membersByPlan(string $plan): Collection
    {
        $plan = Membership::normalize($plan);

        return User::query()
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone', 'plan', 'plan_expires_at'])
            ->filter(fn (User $user) => $user->effectivePlan() === $plan)
            ->map(fn (User $user) => self::mapUser($user))
            ->filter(fn (array $row) => $row['email'] !== '')
            ->unique('email')
            ->values();
    }

    /**
     * @return array{
     *     inbox: int,
     *     inbox_unread: int,
     *     sent: int,
     *     drafts: int,
     *     starred: int,
     *     label_read: int,
     *     label_closed: int,
     *     newsletter: int,
     *     subscribers: int,
     *     members: int,
     *     free: int,
     *     featured: int,
     *     premium: int
     * }
     */
    public static function mailCounts(): array
    {
        $planCounts = [
            Membership::FREE => 0,
            Membership::STANDARD => 0,
            Membership::PREMIUM => 0,
        ];

        $users = User::query()
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->get(['id', 'plan', 'plan_expires_at']);

        foreach ($users as $user) {
            $planCounts[$user->effectivePlan()]++;
        }

        return [
            'inbox' => Conversation::query()->count(),
            'inbox_unread' => Conversation::query()->where('admin_status', 'new')->count(),
            'sent' => CommunicationLog::query()->count(),
            'drafts' => CommunicationCampaign::query()->where('status', CommunicationCampaign::STATUS_DRAFT)->count(),
            'starred' => Conversation::query()->where('starred', true)->count()
                + CommunicationLog::query()->where('starred', true)->count(),
            'label_read' => Conversation::query()->where('admin_status', 'read')->count(),
            'label_closed' => Conversation::query()->where('admin_status', 'closed')->count(),
            'newsletter' => NewsletterSubscriber::query()->count(),
            'subscribers' => NewsletterSubscriber::query()->count(),
            'members' => $users->count(),
            'free' => $planCounts[Membership::FREE],
            'featured' => $planCounts[Membership::STANDARD],
            'premium' => $planCounts[Membership::PREMIUM],
        ];
    }

    /**
     * @return array{email: string, name: string, phone: ?string}
     */
    private static function mapUser(User $user): array
    {
        return [
            'email' => strtolower(trim((string) $user->email)),
            'name' => trim((string) $user->name) ?: (string) $user->email,
            'phone' => filled($user->phone) ? trim((string) $user->phone) : null,
        ];
    }
}
