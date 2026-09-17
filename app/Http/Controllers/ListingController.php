<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Support\ListingPayload;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ListingController extends Controller
{
    public function home(): Response
    {
        $published = Listing::query()
            ->with('category')
            ->where('is_published', true)
            ->orderByDesc('rating')
            ->get();

        $payload = ListingPayload::collection($published);

        $featured = ListingPayload::collection(
            $published->where('is_featured', true)->take(12)->values()
        );

        $trending = ListingPayload::collection(
            $published->where('is_trending', true)->take(12)->values()
        );

        if ($trending === []) {
            $trending = array_slice($payload, 0, 8);
        }

        if ($featured === []) {
            $featured = array_slice($payload, 0, 6);
        }

        return Inertia::render('Home', [
            'listings' => $payload,
            'featured' => $featured,
            'trending' => $trending,
            'goldList' => array_slice($payload, 0, 24),
        ]);
    }

    public function explore(Request $request): Response
    {
        $location = $request->string('location')->toString() ?: null;
        $allowed = ['Nanyuki', 'Timau', 'Naromoru'];

        $listings = Listing::query()
            ->with('category')
            ->where('is_published', true)
            ->orderByDesc('rating')
            ->get();

        return Inertia::render('Explore', [
            'listings' => ListingPayload::collection($listings),
            'category' => $request->string('category')->toString() ?: null,
            'subcategory' => $request->string('subcategory')->toString() ?: null,
            'propertyType' => $request->string('propertyType')->toString() ?: null,
            'q' => $request->string('q')->toString() ?: null,
            'location' => in_array($location, $allowed, true) ? $location : null,
        ]);
    }

    public function show(string $slug): Response
    {
        $listing = Listing::query()
            ->with('category')
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        $related = Listing::query()
            ->with('category')
            ->where('is_published', true)
            ->where('id', '!=', $listing->id)
            ->when(
                $listing->category_id,
                fn ($query) => $query->where('category_id', $listing->category_id),
            )
            ->orderByDesc('rating')
            ->limit(6)
            ->get();

        return Inertia::render('Listings/Show', [
            'slug' => $listing->slug,
            'listing' => ListingPayload::fromModel($listing),
            'related' => ListingPayload::collection($related),
        ]);
    }
}
