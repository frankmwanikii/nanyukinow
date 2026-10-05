<?php

namespace App\Support;

use App\Models\PricingPlan;
use App\Models\User;
use Illuminate\Support\Collection;

class Membership
{
    public const FREE = 'free';

    public const STANDARD = 'featured';

    public const PREMIUM = 'premium';

    /** Below-hero marquee / homepage spotlight. */
    public const PROMOTED_PRIORITY = 4;

    /** @var array<string, int> */
    public const DEFAULT_LIMITS = [
        self::FREE => 1,
        self::STANDARD => 3,
        self::PREMIUM => 10,
    ];

    /** @var array<string, string> */
    public const LABELS = [
        self::FREE => 'Free',
        self::STANDARD => 'Standard',
        self::PREMIUM => 'Premium',
    ];

    /** @var array<string, string> */
    public const BADGE_LABELS = [
        self::FREE => 'Free',
        self::STANDARD => 'Standard',
        self::PREMIUM => 'Premium',
    ];

    /**
     * Sort priority from membership tier (higher sorts first via orderByDesc).
     * Free = 1 (no badge), Standard = 2 (green bolt), Premium = 3 (yellow bolt).
     * Promoted (4) is set separately by admins for below-hero placement.
     */
    public static function listingPriority(?string $tier): int
    {
        return match (self::normalize($tier)) {
            self::PREMIUM => 3,
            self::STANDARD => 2,
            default => 1,
        };
    }

    public static function isPromotedPriority(?int $priority): bool
    {
        return (int) $priority >= self::PROMOTED_PRIORITY;
    }

    public static function normalize(?string $plan): string
    {
        $plan = $plan ?: self::FREE;

        return array_key_exists($plan, self::DEFAULT_LIMITS) ? $plan : self::FREE;
    }

    public static function label(?string $plan): string
    {
        return self::LABELS[self::normalize($plan)] ?? 'Free';
    }

    public static function badgeLabel(?string $plan): string
    {
        return self::BADGE_LABELS[self::normalize($plan)] ?? 'Free';
    }

    public static function listingLimit(?string $plan): int
    {
        $plan = self::normalize($plan);

        $fromDb = PricingPlan::query()->where('key', $plan)->value('listing_limit');

        if ($fromDb !== null) {
            return max(0, (int) $fromDb);
        }

        return self::DEFAULT_LIMITS[$plan];
    }

    /**
     * @return list<string>
     */
    public static function allowedTiers(?string $plan): array
    {
        return match (self::normalize($plan)) {
            self::PREMIUM => [self::FREE, self::STANDARD, self::PREMIUM],
            self::STANDARD => [self::FREE, self::STANDARD],
            default => [self::FREE],
        };
    }

    public static function canCreateListing(User $user): bool
    {
        $limit = self::listingLimit($user->effectivePlan());

        return self::activeListingCount($user) < $limit;
    }

    public static function remainingSlots(User $user): int
    {
        $limit = self::listingLimit($user->effectivePlan());

        return max(0, $limit - self::activeListingCount($user));
    }

    /** Count listings that consume a plan slot (drafts do not). */
    public static function activeListingCount(User $user): int
    {
        return $user->listings()
            ->where(function ($query) {
                $query->whereNull('status')
                    ->orWhere('status', '!=', 'draft');
            })
            ->count();
    }

    public static function canUseTier(User $user, string $tier): bool
    {
        return in_array(self::normalize($tier), self::allowedTiers($user->effectivePlan()), true);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public static function publicPlans(): Collection
    {
        PricingPlan::ensureDefaults();

        return PricingPlan::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (PricingPlan $plan) => [
                ...$plan->toAdminArray(),
                'public_name' => self::label($plan->key),
                'badge_label' => self::badgeLabel($plan->key),
                'listing_limit' => (int) ($plan->listing_limit ?: self::listingLimit($plan->key)),
            ])
            ->values();
    }

    public static function assignFree(User $user): void
    {
        if ($user->plan) {
            return;
        }

        $user->forceFill([
            'plan' => self::FREE,
            'plan_started_at' => now(),
            'plan_expires_at' => null,
        ])->save();
    }

    /**
     * Days of access granted for a billing period when activating a paid plan.
     */
    public static function durationDaysForPeriod(?string $period): int
    {
        return match ($period) {
            'year' => 365,
            'one_time' => 365,
            default => 30,
        };
    }

    /**
     * Activate (or change) a member's plan and boost existing listings to match.
     */
    public static function activate(User $user, string $plan, ?int $days = 30): void
    {
        $plan = self::normalize($plan);
        $days = max(1, $days ?? 30);

        $user->forceFill([
            'plan' => $plan,
            'plan_started_at' => now(),
            'plan_expires_at' => $plan === self::FREE ? null : now()->addDays($days),
        ])->save();

        if ($plan === self::FREE) {
            return;
        }

        $lowerTiers = match ($plan) {
            self::PREMIUM => [self::FREE, self::STANDARD],
            self::STANDARD => [self::FREE],
            default => [],
        };

        if ($lowerTiers === []) {
            return;
        }

        $user->listings()
            ->whereIn('tier', $lowerTiers)
            ->get()
            ->each(function ($listing) use ($plan): void {
                $updates = [
                    'tier' => $plan,
                    'is_featured' => true,
                ];

                // Don't demote admin-promoted (below-hero) listings.
                if (! self::isPromotedPriority($listing->priority)) {
                    $updates['priority'] = self::listingPriority($plan);
                }

                $listing->update($updates);
            });
    }

    public static function planSummary(User $user): array
    {
        $plan = $user->effectivePlan();
        $limit = self::listingLimit($plan);
        $used = self::activeListingCount($user);
        $startedAt = $user->plan_started_at;
        $expiresAt = $user->plan_expires_at;
        $isExpired = $user->planIsExpired();
        $isPaid = $plan !== self::FREE && $expiresAt !== null;

        $daysRemaining = null;
        $daysTotal = null;
        $daysUsed = null;
        $usagePercent = null;

        if ($isPaid) {
            if ($expiresAt->isPast()) {
                $daysRemaining = 0;
            } else {
                $daysRemaining = (int) now()->startOfDay()->diffInDays($expiresAt->copy()->startOfDay());
            }

            if ($startedAt && $expiresAt->greaterThan($startedAt)) {
                $daysTotal = max(1, (int) $startedAt->copy()->startOfDay()->diffInDays($expiresAt->copy()->startOfDay()));
                $elapsed = (int) $startedAt->copy()->startOfDay()->diffInDays(now()->startOfDay());
                $daysUsed = min($daysTotal, max(0, $elapsed));
                $usagePercent = (int) round(min(100, max(0, ($daysUsed / $daysTotal) * 100)));
            }
        }

        $status = match (true) {
            $plan === self::FREE => 'free',
            $isExpired => 'expired',
            $daysRemaining !== null && $daysRemaining <= 7 => 'expiring_soon',
            default => 'active',
        };

        return [
            'key' => $plan,
            'label' => self::label($plan),
            'badge_label' => self::badgeLabel($plan),
            'listing_limit' => $limit,
            'listings_used' => $used,
            'listings_remaining' => max(0, $limit - $used),
            'can_create' => $used < $limit,
            'allowed_tiers' => self::allowedTiers($plan),
            'started_at' => $startedAt?->toIso8601String(),
            'expires_at' => $expiresAt?->toIso8601String(),
            'is_expired' => $isExpired,
            'is_paid' => $isPaid,
            'status' => $status,
            'days_remaining' => $daysRemaining,
            'days_total' => $daysTotal,
            'days_used' => $daysUsed,
            'period_percent' => $usagePercent,
        ];
    }
}
