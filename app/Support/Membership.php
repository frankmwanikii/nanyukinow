<?php

namespace App\Support;

use App\Models\PlanUpgrade;
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

    /**
     * Plan tier that matches a listing priority of 1–3.
     * Priority 4 (Promoted) has no plan change — returns null.
     */
    public static function tierFromPriority(?int $priority): ?string
    {
        return match ((int) $priority) {
            3 => self::PREMIUM,
            2 => self::STANDARD,
            1 => self::FREE,
            default => null,
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

        $fromDb = PricingPlan::query()->where('key', $plan)->max('listing_limit');

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
    public static function publicPlans(?string $categoryKey = null): Collection
    {
        $normalized = CategoryKey::fromSlug($categoryKey) ?? (CategoryKey::keys()[0] ?? null);

        if ($normalized === null) {
            return collect();
        }

        PricingPlan::ensureDefaultsForCategory($normalized);

        return PricingPlan::query()
            ->forCategory($normalized)
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

    /**
     * @return array<string, list<array<string, mixed>>>
     */
    public static function publicPlansByCategory(): array
    {
        $grouped = [];

        foreach (CategoryKey::keys() as $key) {
            $grouped[$key] = self::publicPlans($key)->all();
        }

        return $grouped;
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
     * Paid plan the member should renew (active paid, soft-expired paid, or last paid after expiry).
     */
    public static function renewPlanFor(User $user): ?string
    {
        $stored = self::normalize($user->plan);

        if ($stored !== self::FREE) {
            return $stored;
        }

        $lastPaid = self::normalize($user->last_paid_plan ?? null);

        return $lastPaid !== self::FREE ? $lastPaid : null;
    }

    /**
     * True when the member is paying to renew the same paid plan they already have or just lost.
     */
    public static function isRenewal(User $user, string $toPlan, ?string $billingPeriod = null): bool
    {
        $renewPlan = self::renewPlanFor($user);

        if ($renewPlan === null) {
            return false;
        }

        return self::normalize($toPlan) === $renewPlan;
    }

    /**
     * Billing period to preselect when renewing.
     */
    public static function renewBillingPeriodFor(User $user): string
    {
        $renewPlan = self::renewPlanFor($user);

        if ($renewPlan === null) {
            return 'month';
        }

        $period = self::billingPeriodFor($user, $renewPlan);

        if ($period === null && $user->last_paid_plan) {
            $upgrade = PlanUpgrade::query()
                ->where('user_id', $user->id)
                ->where('to_plan', $renewPlan)
                ->where('status', PlanUpgrade::STATUS_APPROVED)
                ->latest('reviewed_at')
                ->latest('id')
                ->first();

            if ($upgrade && in_array($upgrade->billing_period, ['month', 'year', 'one_time'], true)) {
                $period = $upgrade->billing_period === 'year' || $upgrade->billing_period === 'one_time'
                    ? 'year'
                    : 'month';
            }
        }

        return $period === 'year' ? 'year' : 'month';
    }

    /**
     * Drop an expired paid member to Free and hide their listings without deleting them.
     */
    public static function expireToFree(User $user): bool
    {
        if (! $user->planIsExpired()) {
            return false;
        }

        $stored = self::normalize($user->plan);
        $lastPaid = $stored !== self::FREE
            ? $stored
            : self::normalize($user->last_paid_plan ?? null);

        if ($lastPaid === self::FREE) {
            return false;
        }

        $user->forceFill([
            'last_paid_plan' => $lastPaid,
            'plan' => self::FREE,
            'plan_renewal_reminder_7d_sent_at' => null,
            'plan_renewal_reminder_3d_sent_at' => null,
        ])->save();

        $user->listings()
            ->where(function ($query) {
                $query->where('is_published', true)
                    ->orWhere('suppressed_by_plan_expiry', true);
            })
            ->where(function ($query) {
                $query->whereNull('status')
                    ->orWhere('status', '!=', 'draft');
            })
            ->update([
                'is_published' => false,
                'suppressed_by_plan_expiry' => true,
            ]);

        return true;
    }

    /**
     * Restore listings hidden by plan expiry after a successful renewal.
     */
    public static function restoreSuppressedListings(User $user): void
    {
        $user->listings()
            ->where('suppressed_by_plan_expiry', true)
            ->update([
                'is_published' => true,
                'suppressed_by_plan_expiry' => false,
                'status' => 'published',
                'published_at' => now(),
            ]);
    }

    /**
     * Activate (or change) a member's plan and boost existing listings to match.
     * Renewing the same active plan extends from the current expiry so unused days are kept.
     */
    public static function activate(User $user, string $plan, ?int $days = 30): void
    {
        $plan = self::normalize($plan);
        $days = max(1, $days ?? 30);

        if ($plan === self::FREE) {
            $user->forceFill([
                'plan' => self::FREE,
                'plan_started_at' => now(),
                'plan_expires_at' => null,
                'plan_renewal_reminder_7d_sent_at' => null,
                'plan_renewal_reminder_3d_sent_at' => null,
            ])->save();

            return;
        }

        $sameActivePlan = self::normalize($user->plan) === $plan
            && $user->plan_expires_at !== null
            && $user->plan_expires_at->isFuture();

        if ($sameActivePlan) {
            $expiresAt = $user->plan_expires_at->copy()->addDays($days);
            $startedAt = $user->plan_started_at ?? now();
        } else {
            $startedAt = now();
            $expiresAt = now()->addDays($days);
        }

        $user->forceFill([
            'plan' => $plan,
            'last_paid_plan' => $plan,
            'plan_started_at' => $startedAt,
            'plan_expires_at' => $expiresAt,
            'plan_renewal_reminder_7d_sent_at' => null,
            'plan_renewal_reminder_3d_sent_at' => null,
        ])->save();

        self::restoreSuppressedListings($user);

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
        $renewPlan = self::renewPlanFor($user);
        $limit = self::listingLimit($plan);
        $used = self::activeListingCount($user);
        $startedAt = $user->plan_started_at;
        $expiresAt = $user->plan_expires_at;
        $isExpired = $user->planIsExpired() || ($plan === self::FREE && $renewPlan !== null && $expiresAt !== null && $expiresAt->isPast());
        $isPaid = $plan !== self::FREE && $expiresAt !== null && $expiresAt->isFuture();
        $displayPlan = $isExpired && $renewPlan ? $renewPlan : $plan;

        $daysRemaining = null;
        $daysTotal = null;
        $daysUsed = null;
        $usagePercent = null;

        if ($isPaid || ($isExpired && $expiresAt && $startedAt)) {
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
            $isExpired && $renewPlan !== null => 'expired',
            $plan === self::FREE => 'free',
            $daysRemaining !== null && $daysRemaining <= 7 => 'expiring_soon',
            default => 'active',
        };

        $renewBillingPeriod = $renewPlan ? self::renewBillingPeriodFor($user) : null;

        return [
            'key' => $plan,
            'label' => self::label($displayPlan),
            'badge_label' => self::badgeLabel($displayPlan),
            'listing_limit' => $limit,
            'listings_used' => $used,
            'listings_remaining' => max(0, $limit - $used),
            'can_create' => $used < $limit,
            'allowed_tiers' => self::allowedTiers($plan),
            'billing_period' => $isPaid ? self::billingPeriodFor($user, $plan) : $renewBillingPeriod,
            'started_at' => $startedAt?->toIso8601String(),
            'expires_at' => $expiresAt?->toIso8601String(),
            'is_expired' => $isExpired,
            'is_paid' => $isPaid,
            'status' => $status,
            'days_remaining' => $daysRemaining,
            'days_total' => $daysTotal,
            'days_used' => $daysUsed,
            'period_percent' => $usagePercent,
            'renew_plan' => $renewPlan,
            'renew_billing_period' => $renewBillingPeriod,
            'can_renew' => $renewPlan !== null,
        ];
    }

    /**
     * Billing period the member currently has for their active paid plan.
     * Free returns null. Falls back to duration inference when no upgrade row exists.
     */
    public static function billingPeriodFor(User $user, ?string $plan = null): ?string
    {
        $plan = self::normalize($plan ?? $user->effectivePlan());

        if ($plan === self::FREE) {
            $plan = self::normalize($user->last_paid_plan ?? null);
        }

        if ($plan === self::FREE) {
            return null;
        }

        $upgrade = PlanUpgrade::query()
            ->where('user_id', $user->id)
            ->where('to_plan', $plan)
            ->where('status', PlanUpgrade::STATUS_APPROVED)
            ->latest('reviewed_at')
            ->latest('id')
            ->first();

        if ($upgrade && in_array($upgrade->billing_period, ['month', 'year', 'one_time'], true)) {
            return $upgrade->billing_period === 'year' || $upgrade->billing_period === 'one_time'
                ? 'year'
                : 'month';
        }

        $startedAt = $user->plan_started_at;
        $expiresAt = $user->plan_expires_at;

        if ($startedAt && $expiresAt && $expiresAt->greaterThan($startedAt)) {
            $days = (int) $startedAt->copy()->startOfDay()->diffInDays($expiresAt->copy()->startOfDay());

            return $days >= 180 ? 'year' : 'month';
        }

        return 'month';
    }

    /**
     * True when the member already owns this tier on monthly and is paying to switch it to yearly.
     */
    public static function isBillingPeriodUpgrade(User $user, string $toPlan, ?string $billingPeriod): bool
    {
        $current = self::normalize($user->effectivePlan());
        $toPlan = self::normalize($toPlan);

        if ($toPlan === self::FREE || $toPlan !== $current) {
            return false;
        }

        return self::billingPeriodFor($user, $current) === 'month'
            && $billingPeriod === 'year';
    }
}
