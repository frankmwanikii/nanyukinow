<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\Location;
use App\Models\SitePage;
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

        // Below-hero strip: promoted only — fall back to premium then standard.
        if ($featured === []) {
            $featured = ListingPayload::collection(
                $published
                    ->filter(fn ($listing) => (int) $listing->priority >= 3)
                    ->take(12)
                    ->values()
            );
        }
        if ($featured === []) {
            $featured = array_slice($payload, 0, 6);
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
}
