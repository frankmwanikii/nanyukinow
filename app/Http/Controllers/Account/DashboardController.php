<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\PlanUpgrade;
use App\Support\Membership;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $listings = $user->listings()
            ->with('category:id,name,slug')
            ->latest()
            ->get()
            ->map(fn ($listing) => [
                'id' => $listing->id,
                'title' => $listing->title,
                'slug' => $listing->slug,
                'status' => $listing->status,
                'tier' => $listing->tier,
                'tier_label' => Membership::badgeLabel($listing->tier),
                'is_published' => $listing->is_published,
                'category' => $listing->category?->name,
                'image_url' => $listing->image_url,
                'updated_at' => $listing->updated_at?->toIso8601String(),
                'expires_at' => $listing->expires_at?->toIso8601String(),
                'published_at' => $listing->published_at?->toIso8601String(),
                'is_expired' => $listing->isExpired(),
            ]);

        $bookmarksCount = 0;
        try {
            $bookmarksCount = $user->bookmarkedListings()
                ->published()
                ->count();
        } catch (\Throwable) {
            $bookmarksCount = 0;
        }

        $pendingUpgrade = PlanUpgrade::query()
            ->where('user_id', $user->id)
            ->where('status', PlanUpgrade::STATUS_PENDING)
            ->latest()
            ->first();

        return Inertia::render('Account/Index', [
            'plan' => Membership::planSummary($user),
            'listings' => $listings,
            'bookmarksCount' => $bookmarksCount,
            'pendingUpgrade' => $pendingUpgrade?->toMemberArray(),
        ]);
    }
}
