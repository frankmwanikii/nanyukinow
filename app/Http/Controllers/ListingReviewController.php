<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreListingReviewRequest;
use App\Models\Listing;
use App\Models\ListingReview;
use Illuminate\Http\RedirectResponse;

class ListingReviewController extends Controller
{
    public function store(StoreListingReviewRequest $request, Listing $listing): RedirectResponse
    {
        $user = $request->user();

        if (! $listing->is_published || $listing->isExpired()) {
            abort(404);
        }

        if ((int) $listing->user_id === (int) $user->id) {
            return back()->withErrors([
                'body' => 'You can’t review your own listing.',
            ]);
        }

        $existing = ListingReview::query()
            ->where('listing_id', $listing->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($existing) {
            return back()->withErrors([
                'body' => 'You already reviewed this listing.',
            ]);
        }

        ListingReview::query()->create([
            'listing_id' => $listing->id,
            'user_id' => $user->id,
            'rating' => (int) $request->validated('rating'),
            'body' => trim($request->validated('body')),
        ]);

        ListingReview::syncListingRating($listing);

        return redirect()
            ->to(route('listings.show', $listing->slug).'#reviews')
            ->with('success', 'Thanks for your review.');
    }
}
