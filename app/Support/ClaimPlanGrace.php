<?php

namespace App\Support;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Support\Carbon;

class ClaimPlanGrace
{
    public static function days(): int
    {
        return max(1, (int) config('site.claim_plan_grace_days', 30));
    }

    public static function isElevated(Listing $listing): bool
    {
        if (Membership::normalize($listing->tier) !== Membership::FREE) {
            return true;
        }

        if ((bool) $listing->is_featured) {
            return true;
        }

        return (int) $listing->priority > Membership::listingPriority(Membership::FREE);
    }

    public static function endsAt(?Carbon $from = null): Carbon
    {
        return ($from ?? now())->copy()->addDays(self::days());
    }

    /**
     * Start the post-claim plan grace window when the listing still has paid placement.
     */
    public static function startIfNeeded(Listing $listing): void
    {
        if (! self::isElevated($listing)) {
            $listing->claim_grace_ends_at = null;

            return;
        }

        $listing->claim_grace_ends_at = self::endsAt();
    }

    public static function isActive(Listing $listing): bool
    {
        return $listing->claim_grace_ends_at !== null
            && $listing->claim_grace_ends_at->isFuture()
            && self::isElevated($listing);
    }

    /**
     * Demote due claim-grace listings to Free while keeping verified status.
     */
    public static function expireDue(): int
    {
        $expired = 0;

        Listing::query()
            ->whereNotNull('claim_grace_ends_at')
            ->where('claim_grace_ends_at', '<=', now())
            ->orderBy('id')
            ->chunkById(100, function ($listings) use (&$expired): void {
                foreach ($listings as $listing) {
                    if (! self::isElevated($listing)) {
                        $listing->forceFill(['claim_grace_ends_at' => null])->save();

                        continue;
                    }

                    $listing->forceFill([
                        'tier' => Membership::FREE,
                        'priority' => Membership::listingPriority(Membership::FREE),
                        'is_featured' => false,
                        'claim_grace_ends_at' => null,
                    ])->save();

                    $expired++;
                }
            });

        return $expired;
    }

    /**
     * Clear grace once the owner pays for a plan so we do not demote paid placement.
     */
    public static function clearForUserListings(User $user): void
    {
        $user->listings()
            ->whereNotNull('claim_grace_ends_at')
            ->update(['claim_grace_ends_at' => null]);
    }
}
