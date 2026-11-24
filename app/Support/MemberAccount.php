<?php

namespace App\Support;

use App\Models\Listing;
use App\Models\ListingClaim;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MemberAccount
{
    /**
     * Permanently remove a member and invalidate any active sign-in state.
     * Their listings stay in the catalogue as unclaimed places. Finished public
     * listings remain published; unfinished ones stay off the site as drafts.
     */
    public static function delete(User $user): void
    {
        DB::transaction(function () use ($user): void {
            self::releaseListings($user);
            self::rejectPendingClaims($user);

            UserAvatar::delete($user->avatar_url);

            DB::table(config('session.table', 'sessions'))
                ->where('user_id', $user->id)
                ->delete();

            $user->forceFill([
                'remember_token' => null,
            ])->saveQuietly();

            $user->delete();
        });
    }

    private static function releaseListings(User $user): void
    {
        $listingIds = $user->listings()->pluck('id');

        if ($listingIds->isEmpty()) {
            return;
        }

        Listing::query()
            ->whereIn('id', $listingIds)
            ->where('is_published', true)
            ->where(function ($query): void {
                $query->whereNull('status')->orWhere('status', 'published');
            })
            ->update([
                'user_id' => null,
                'claim_status' => 'unclaimed',
                'claim_grace_ends_at' => null,
            ]);

        $unfinished = Listing::query()
            ->whereIn('id', $listingIds)
            ->where(function ($query): void {
                $query->where('is_published', false)
                    ->orWhere(function ($inner): void {
                        $inner->whereNotNull('status')
                            ->where('status', '!=', 'published');
                    });
            });

        (clone $unfinished)
            ->where('status', 'archived')
            ->update([
                'user_id' => null,
                'claim_status' => 'unclaimed',
                'claim_grace_ends_at' => null,
                'is_published' => false,
                'status' => 'archived',
            ]);

        (clone $unfinished)
            ->where(function ($query): void {
                $query->whereNull('status')->orWhere('status', '!=', 'archived');
            })
            ->update([
                'user_id' => null,
                'claim_status' => 'unclaimed',
                'claim_grace_ends_at' => null,
                'is_published' => false,
                'status' => 'draft',
            ]);

        PublishedListingsCatalogue::forget();
    }

    private static function rejectPendingClaims(User $user): void
    {
        ListingClaim::query()
            ->where('user_id', $user->id)
            ->where('status', ListingClaim::STATUS_PENDING)
            ->update([
                'status' => ListingClaim::STATUS_REJECTED,
                'admin_notes' => 'Closed because the member account was deleted.',
                'reviewed_at' => now(),
            ]);
    }
}
