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
            'bookmarksCount' => $bookmarksCount,
            'pendingUpgrade' => $pendingUpgrade?->toMemberArray(),
        ]);
    }
}
