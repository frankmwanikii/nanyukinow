<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\Location;
use App\Models\SitePage;
use App\Support\CategoryKey;
use App\Support\ListingOutbound;
use App\Support\ListingPayload;
use App\Support\ListingSearch;
use App\Support\PublishedListingsCatalogue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class ListingController extends Controller
{
    public function home(): Response
    {
        $page = SitePage::findBySlug('home')?->toPublicArray();

        return Inertia::render('Home', [
            'featured' => $this->featuredCards(),
            'trending' => Inertia::defer(fn () => $this->trendingCards(), 'below'),
            'goldList' => Inertia::defer(fn () => $this->goldListCards(), 'below'),
            'airbnbs' => Inertia::defer(fn () => $this->airbnbCards(), 'below'),
            'wildlifeSafaris' => Inertia::defer(fn () => $this->wildlifeCards(), 'below'),
            'page' => $page,
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

        return Inertia::render('Explore', [
            'listings' => PublishedListingsCatalogue::cards(),
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

        $cacheKey = 'listings.search.'.md5(mb_strtolower($q).'|'.$limit);

        /** @var array{q: string, results: list<array<string, mixed>>, count: int, explore_href: string} $payload */
        $payload = Cache::remember($cacheKey, 30, function () use ($q, $limit) {
            $results = ListingSearch::suggestions($q, $limit);

            return [
                'q' => $q,
                'results' => $results,
                'count' => count($results),
                'explore_href' => route('explore', ['q' => $q]),
            ];
        });

        return response()->json($payload);
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

        $categoryKey = CategoryKey::fromSlug($listing->category?->slug);

        $related = collect(PublishedListingsCatalogue::cards())
            ->filter(function (array $card) use ($listing, $categoryKey) {
                if ((int) $card['id'] === (int) $listing->id) {
                    return false;
                }

                return ($card['categoryKey'] ?? null) === $categoryKey;
            })
            ->take(6)
            ->values()
            ->all();

        if ($related === []) {
            $relatedModels = ListingSearch::publishedQuery()
                ->where('id', '!=', $listing->id)
                ->when(
                    $listing->category_id,
                    fn ($query) => $query->where('category_id', $listing->category_id),
                )
                ->orderByDesc('priority')
                ->orderByDesc('rating')
                ->limit(6)
                ->get();

            $related = ListingPayload::cards($relatedModels);
        }

        return Inertia::render('Listings/Show', [
            'slug' => $listing->slug,
            'listing' => ListingPayload::fromModel($listing),
            'related' => $related,
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

    /**
     * @return list<array<string, mixed>>
     */
    private function featuredCards(): array
    {
        return PublishedListingsCatalogue::featuredCards(12);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function trendingCards(): array
    {
        $cards = collect(PublishedListingsCatalogue::cards())
            ->unique(fn (array $card) => $card['id'] ?? $card['slug'] ?? null)
            ->values();

        $trending = $cards
            ->filter(fn (array $card) => (bool) ($card['is_trending'] ?? false))
            ->take(12)
            ->values()
            ->all();

        if ($trending === []) {
            return $cards->take(8)->values()->all();
        }

        return $trending;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function goldListCards(): array
    {
        return array_slice(PublishedListingsCatalogue::cards(), 0, 24);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function airbnbCards(): array
    {
        return collect(PublishedListingsCatalogue::cards())
            ->filter(fn (array $card) => in_array($card['categoryKey'] ?? null, ['stay', 'properties'], true))
            ->take(12)
            ->values()
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function wildlifeCards(): array
    {
        return collect(PublishedListingsCatalogue::cards())
            ->filter(fn (array $card) => ($card['categoryKey'] ?? null) === 'thingsToDo')
            ->take(12)
            ->values()
            ->all();
    }
}
