<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Support\ListingPayload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class BookmarkController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $bookmarks = [];
        try {
            $bookmarks = $user->bookmarkedListings()
                ->with('category:id,name,slug')
                ->published()
                ->get()
                ->map(fn ($listing) => [
                    ...ListingPayload::fromModel($listing),
                    'bookmarked_at' => $listing->pivot?->created_at?->toIso8601String(),
                ])
                ->values()
                ->all();
        } catch (\Throwable) {
            $bookmarks = [];
        }

        return Inertia::render('Account/Bookmarks', [
            'bookmarks' => $bookmarks,
        ]);
    }

    public function destroyAll(Request $request): RedirectResponse
    {
        $user = $request->user();

        $user->bookmarkedListings()->detach();
        Cache::forget('user.'.$user->id.'.bookmark_ids');

        return redirect()
            ->route('account.bookmarks')
            ->with('success', 'All bookmarks removed.');
    }
}
