<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\Location;
use App\Models\SitePage;
use App\Support\ListingOutbound;
use App\Support\ListingPayload;
use App\Support\ListingSearch;
use App\Support\Membership;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ListingController extends Controller
{
    public function home(): Response
    {
        $published = ListingSearch::publishedQuery()
            ->orderByDesc('priority')
            ->orderByDesc('rating')
            ->orderByDesc('id')
            ->get();

        $payload = ListingPayload::collection($published);

        // Below-hero strip: priority 4 (Promoted) only — empty when none exist.
        $featured = ListingPayload::collection(
            $published
                ->filter(fn ($listing) => Membership::isPromotedPriority($listing->priority))
                ->take(12)
                ->values()
        );

        $trending = ListingPayload::collection(
            $published->where('is_trending', true)->take(12)->values()
        );

        if ($trending === []) {
            $trending = array_slice($payload, 0, 8);
        }

        return Inertia::render('Home', [
            'listings' => $payload,
            'featured' => $featured,
            'trending' => $trending,
            'goldList' => array_slice($payload, 0, 24),
            'page' => SitePage::findBySlug('home')?->toPublicArray(),
        ]);
    }

    public function explore(Request $request): Response
    {
        $location = $request->string('location')->toString() ?: null;
        $allowed = Location::query()
            ->active()
            ->ordered()
            ->pluck('name')
            ->all();

        if ($allowed === []) {
            $allowed = ['Nanyuki', 'Timau', 'Naromoru'];
        }

        $listings = ListingSearch::publishedQuery()
            ->orderByDesc('priority')
            ->orderByDesc('rating')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Explore', [
            'listings' => ListingPayload::collection($listings),
            'locations' => $allowed,
            'category' => $request->string('category')->toString() ?: null,
            'subcategory' => $request->string('subcategory')->toString() ?: null,
            'propertyType' => $request->string('propertyType')->toString() ?: null,
            'q' => $request->string('q')->toString() ?: null,
            'location' => in_array($location, $allowed, true) ? $location : null,
            'page' => SitePage::findBySlug('explore')?->toPublicArray(),
        ]);
    }

    /**
     * Live autocomplete / typeahead against every published listing.
     */
    public function search(Request $request): JsonResponse
    {
        $data = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:20'],
        ]);

        $q = trim((string) ($data['q'] ?? ''));
        $limit = (int) ($data['limit'] ?? 8);

        if ($q === '') {
            return response()->json([
                'q' => '',
                'results' => [],
                'count' => 0,
            ]);
        }

        $results = ListingSearch::suggestions($q, $limit);

        return response()->json([
            'q' => $q,
            'results' => $results,
            'count' => count($results),
            'explore_href' => route('explore', ['q' => $q]),
        ]);
    }

    public function show(Request $request, string $slug): Response
    {
        $listing = Listing::query()
            ->with('category')
            ->where('slug', $slug)
            ->firstOrFail();

        $user = $request->user();
        $canPreview = $user
            && ($user->isAdmin() || (int) $user->id === (int) $listing->user_id);

        if (! $listing->is_published && ! $canPreview) {
            abort(404);
        }

        if ($listing->isExpired() && ! $canPreview) {
            abort(404);
        }

        $related = ListingSearch::publishedQuery()
            ->where('id', '!=', $listing->id)
            ->when(
                $listing->category_id,
                fn ($query) => $query->where('category_id', $listing->category_id),
            )
            ->orderByDesc('priority')
            ->orderByDesc('rating')
            ->limit(6)
            ->get();

        return Inertia::render('Listings/Show', [
            'slug' => $listing->slug,
            'listing' => ListingPayload::fromModel($listing),
            'related' => ListingPayload::collection($related),
            'preview' => ! $listing->is_published,
            'previewStatus' => $listing->status,
        ]);
    }

    /**
     * Open a listing website inside Nanyuki Now so visitors are not sent away.
     */
    public function visit(Request $request, string $slug): Response
    {
        $listing = Listing::query()
            ->with('category')
            ->where('slug', $slug)
            ->firstOrFail();

        $user = $request->user();
        $canPreview = $user
            && ($user->isAdmin() || (int) $user->id === (int) $listing->user_id);

        if (! $listing->is_published && ! $canPreview) {
            abort(404);
        }

        if ($listing->isExpired() && ! $canPreview) {
            abort(404);
        }

        $resolved = ListingOutbound::resolve(
            $listing,
            $request->string('url')->toString() ?: null,
        );

        if ($resolved === null) {
            abort(404);
        }

        return Inertia::render('Listings/Visit', [
            'listing' => [
                'id' => $listing->id,
                'title' => $listing->title,
                'slug' => $listing->slug,
                'image' => $listing->image_url,
                'location' => $listing->location,
            ],
            'url' => $resolved['url'],
            'label' => $resolved['label'],
            'links' => ListingOutbound::linksFor($listing),
        ]);
    }

    /**
     * Toggle a listing like for this browser session and return the live count.
     */
    public function like(Request $request, Listing $listing): JsonResponse
    {
        if (! $listing->is_published || $listing->isExpired()) {
            abort(404);
        }

        $key = 'liked_listing_ids';
        /** @var list<int> $likedIds */
        $likedIds = array_map('intval', $request->session()->get($key, []));
        $id = (int) $listing->id;
        $currentlyLiked = in_array($id, $likedIds, true);
        $wantLiked = $request->boolean('liked', ! $currentlyLiked);

        if ($wantLiked && ! $currentlyLiked) {
            $listing->increment('likes_count');
            $likedIds[] = $id;
            $request->session()->put($key, array_values(array_unique($likedIds)));
        } elseif (! $wantLiked && $currentlyLiked) {
            if ((int) $listing->likes_count > 0) {
                $listing->decrement('likes_count');
            }
            $request->session()->put(
                $key,
                array_values(array_filter($likedIds, fn (int $value) => $value !== $id)),
            );
        }

        $listing->refresh();

        return response()->json([
            'liked' => $wantLiked,
            'likesCount' => (int) $listing->likes_count,
        ]);
    }

    /**
     * Toggle a bookmark for the authenticated member.
     */
    public function bookmark(Request $request, Listing $listing): JsonResponse
    {
        $user = $request->user();
        abort_unless($user, 401);

        if (! $listing->is_published || $listing->isExpired()) {
            abort(404);
        }

        $wantBookmarked = $request->boolean('bookmarked');
        $exists = $user->bookmarkedListings()->where('listings.id', $listing->id)->exists();

        if ($wantBookmarked && ! $exists) {
            $user->bookmarkedListings()->attach($listing->id);
            $bookmarked = true;
        } elseif (! $wantBookmarked && $exists) {
            $user->bookmarkedListings()->detach($listing->id);
            $bookmarked = false;
        } else {
            $bookmarked = $exists;
        }

        return response()->json([
            'bookmarked' => $bookmarked,
            'listingId' => (int) $listing->id,
        ]);
    }
}
