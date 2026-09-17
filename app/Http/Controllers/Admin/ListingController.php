<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ListingRequest;
use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ListingController extends Controller
{
    public function index(Request $request): Response
    {
        $sort = $request->string('sort')->toString() ?: 'updated_at';
        $direction = $request->string('direction')->toString() === 'asc' ? 'asc' : 'desc';
        $allowedSorts = [
            'title', 'status', 'tier', 'priority', 'expires_at',
            'created_at', 'updated_at', 'rating', 'views_count',
        ];

        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'updated_at';
        }

        $listings = Listing::query()
            ->with(['category:id,name', 'user:id,name'])
            ->when($request->filled('q'), function ($query) use ($request) {
                $q = '%'.$request->string('q').'%';
                $query->where(function ($inner) use ($q) {
                    $inner->where('title', 'like', $q)
                        ->orWhere('location', 'like', $q)
                        ->orWhere('slug', 'like', $q)
                        ->orWhere('phone', 'like', $q);
                });
            })
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('tier'), fn ($q) => $q->where('tier', $request->string('tier')))
            ->when($request->filled('category_id'), fn ($q) => $q->where('category_id', $request->integer('category_id')))
            ->when($request->string('expiry')->toString() === 'expired', fn ($q) => $q->whereNotNull('expires_at')->where('expires_at', '<', now()))
            ->when($request->string('expiry')->toString() === 'soon', fn ($q) => $q->whereBetween('expires_at', [now(), now()->addDays(14)]))
            ->when($request->string('expiry')->toString() === 'none', fn ($q) => $q->whereNull('expires_at'))
            ->when($request->boolean('featured'), fn ($q) => $q->where('is_featured', true))
            ->orderBy($sort, $direction)
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Listing $listing) => [
                'id' => $listing->id,
                'title' => $listing->title,
                'slug' => $listing->slug,
                'location' => $listing->location,
                'image_url' => $listing->image_url,
                'status' => $listing->status,
                'tier' => $listing->tier,
                'priority' => $listing->priority,
                'rating' => $listing->rating,
                'views_count' => $listing->views_count,
                'is_featured' => $listing->is_featured,
                'is_trending' => $listing->is_trending,
                'is_published' => $listing->is_published,
                'category' => $listing->category?->name,
                'owner' => $listing->user?->name,
                'expires_at' => $listing->expires_at?->toIso8601String(),
                'expiry_label' => $listing->expiryLabel(),
                'is_expired' => $listing->isExpired(),
                'updated_at' => $listing->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('Admin/Listings/Index', [
            'listings' => $listings,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
                'tier' => $request->string('tier')->toString(),
                'category_id' => $request->input('category_id'),
                'expiry' => $request->string('expiry')->toString(),
                'featured' => $request->boolean('featured'),
                'sort' => $sort,
                'direction' => $direction,
            ],
            'categories' => Category::query()->orderBy('sort_order')->orderBy('name')->get(['id', 'name']),
            'statuses' => ['draft', 'pending', 'published', 'expired', 'archived'],
            'tiers' => ['free', 'featured', 'premium'],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Listings/Form', [
            'listing' => null,
            'categories' => Category::query()->orderBy('sort_order')->orderBy('name')->get(['id', 'name']),
            'owners' => User::query()->orderBy('name')->get(['id', 'name', 'email']),
            'statuses' => ['draft', 'pending', 'published', 'expired', 'archived'],
            'tiers' => ['free', 'featured', 'premium'],
            'claimStatuses' => ['unclaimed', 'pending', 'claimed'],
        ]);
    }

    public function store(ListingRequest $request): RedirectResponse
    {
        $data = $this->prepareData($request->validated());
        $listing = Listing::query()->create($data);

        return redirect()
            ->route('admin.listings.edit', $listing)
            ->with('success', 'Listing created successfully.');
    }

    public function edit(Listing $listing): Response
    {
        $listing->load(['category:id,name', 'user:id,name']);

        return Inertia::render('Admin/Listings/Form', [
            'listing' => [
                'id' => $listing->id,
                'user_id' => $listing->user_id,
                'category_id' => $listing->category_id,
                'title' => $listing->title,
                'slug' => $listing->slug,
                'location' => $listing->location,
                'description' => $listing->description,
                'tagline' => $listing->tagline,
                'phone' => $listing->phone,
                'email' => $listing->email,
                'website' => $listing->website,
                'whatsapp' => $listing->whatsapp,
                'address' => $listing->address,
                'city' => $listing->city,
                'latitude' => $listing->latitude,
                'longitude' => $listing->longitude,
                'image_url' => $listing->image_url,
                'logo_url' => $listing->logo_url,
                'rating' => $listing->rating,
                'status' => $listing->status,
                'tier' => $listing->tier,
                'priority' => $listing->priority,
                'views_count' => $listing->views_count,
                'price_range' => $listing->price_range,
                'gallery' => $listing->gallery ?? [],
                'hours' => $listing->hours ?? [],
                'amenities' => $listing->amenities ?? [],
                'social_links' => $listing->social_links ?? [],
                'expires_at' => $listing->expires_at?->format('Y-m-d\TH:i'),
                'published_at' => $listing->published_at?->format('Y-m-d\TH:i'),
                'claim_status' => $listing->claim_status,
                'is_featured' => $listing->is_featured,
                'is_trending' => $listing->is_trending,
                'is_published' => $listing->is_published,
            ],
            'categories' => Category::query()->orderBy('sort_order')->orderBy('name')->get(['id', 'name']),
            'owners' => User::query()->orderBy('name')->get(['id', 'name', 'email']),
            'statuses' => ['draft', 'pending', 'published', 'expired', 'archived'],
            'tiers' => ['free', 'featured', 'premium'],
            'claimStatuses' => ['unclaimed', 'pending', 'claimed'],
        ]);
    }

    public function update(ListingRequest $request, Listing $listing): RedirectResponse
    {
        $listing->update($this->prepareData($request->validated(), $listing));

        return redirect()
            ->route('admin.listings.edit', $listing)
            ->with('success', 'Listing updated successfully.');
    }

    public function destroy(Listing $listing): RedirectResponse
    {
        $listing->delete();

        return redirect()
            ->route('admin.listings.index')
            ->with('success', 'Listing deleted.');
    }

    public function bulk(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:listings,id'],
            'action' => ['required', 'in:publish,unpublish,feature,unfeature,delete,archive'],
        ]);

        $query = Listing::query()->whereIn('id', $data['ids']);

        match ($data['action']) {
            'publish' => $query->update(['is_published' => true, 'status' => 'published']),
            'unpublish' => $query->update(['is_published' => false, 'status' => 'draft']),
            'feature' => $query->update(['is_featured' => true, 'tier' => 'featured']),
            'unfeature' => $query->update(['is_featured' => false]),
            'archive' => $query->update(['status' => 'archived', 'is_published' => false]),
            'delete' => $query->delete(),
        };

        return back()->with('success', 'Bulk action completed.');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function prepareData(array $data, ?Listing $listing = null): array
    {
        $data['slug'] = Str::slug($data['slug'] ?: $data['title']);

        if (Listing::query()
            ->when($listing, fn ($q) => $q->where('id', '!=', $listing->id))
            ->where('slug', $data['slug'])
            ->exists()
        ) {
            $data['slug'] .= '-'.Str::lower(Str::random(4));
        }

        $data['is_featured'] = (bool) ($data['is_featured'] ?? false);
        $data['is_trending'] = (bool) ($data['is_trending'] ?? false);
        $data['is_published'] = (bool) ($data['is_published'] ?? false);

        if (($data['tier'] ?? 'free') === 'featured' || ($data['tier'] ?? '') === 'premium') {
            $data['is_featured'] = true;
        }

        if ($data['is_published'] && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        foreach (['gallery', 'amenities'] as $jsonList) {
            if (isset($data[$jsonList]) && is_string($data[$jsonList])) {
                $data[$jsonList] = array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', $data[$jsonList]) ?: [])));
            }
        }

        if (isset($data['hours']) && is_string($data['hours'])) {
            $decoded = json_decode($data['hours'], true);
            $data['hours'] = json_last_error() === JSON_ERROR_NONE ? $decoded : [];
        }

        if (isset($data['social_links']) && is_string($data['social_links'])) {
            $decoded = json_decode($data['social_links'], true);
            $data['social_links'] = json_last_error() === JSON_ERROR_NONE ? $decoded : [];
        }

        return $data;
    }
}
