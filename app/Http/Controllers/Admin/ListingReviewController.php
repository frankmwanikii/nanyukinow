<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ListingReview;
use App\Support\AdminPagination;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class ListingReviewController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString() ?: 'unpublished';
        if (! in_array($status, ['all', 'published', 'unpublished'], true)) {
            $status = 'unpublished';
        }

        $q = $request->string('q')->toString();
        $perPage = AdminPagination::perPage($request, 15);

        $query = ListingReview::query()
            ->with([
                'listing:id,title,slug,image_url,location',
                'user:id,name,email',
            ])
            ->latest();

        if ($status === 'published') {
            $query->where('is_published', true);
        } elseif ($status === 'unpublished') {
            $query->where('is_published', false);
        }

        if ($q !== '') {
            $like = '%'.$q.'%';
            $query->where(function ($inner) use ($like) {
                $inner->where('body', 'like', $like)
                    ->orWhereHas('listing', function ($listing) use ($like) {
                        $listing->where('title', 'like', $like)
                            ->orWhere('slug', 'like', $like);
                    })
                    ->orWhereHas('user', function ($user) use ($like) {
                        $user->where('name', 'like', $like)
                            ->orWhere('email', 'like', $like);
                    });
            });
        }

        $reviews = $query
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (ListingReview $review) => $review->toAdminArray());

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews,
            'filters' => [
                'status' => $status,
                'q' => $q,
                'per_page' => $perPage,
            ],
            'counts' => $this->counts(),
        ]);
    }

    public function publish(ListingReview $listingReview): RedirectResponse
    {
        $listingReview->update(['is_published' => true]);
        $this->resyncRating($listingReview);
        $this->forgetPendingBadge();

        return back()->with('success', 'Review published.');
    }

    public function unpublish(ListingReview $listingReview): RedirectResponse
    {
        $listingReview->update(['is_published' => false]);
        $this->resyncRating($listingReview);
        $this->forgetPendingBadge();

        return back()->with('success', 'Review unpublished.');
    }

    public function destroy(ListingReview $listingReview): RedirectResponse
    {
        $listing = $listingReview->listing()->first();
        $listingReview->delete();

        if ($listing !== null) {
            ListingReview::syncListingRating($listing);
        }

        $this->forgetPendingBadge();

        return back()->with('success', 'Review deleted.');
    }

    private function resyncRating(ListingReview $listingReview): void
    {
        $listing = $listingReview->listing()->first();
        if ($listing !== null) {
            ListingReview::syncListingRating($listing);
        }
    }

    /**
     * @return array{unpublished: int, published: int, all: int}
     */
    private function counts(): array
    {
        return [
            'unpublished' => ListingReview::query()->where('is_published', false)->count(),
            'published' => ListingReview::query()->where('is_published', true)->count(),
            'all' => ListingReview::query()->count(),
        ];
    }

    private function forgetPendingBadge(): void
    {
        try {
            Cache::forget('admin.badge.pending_reviews');
            Cache::forget('admin.dashboard.overview');
        } catch (\Throwable) {
            // Cache store may be unavailable; ignore.
        }
    }
}
