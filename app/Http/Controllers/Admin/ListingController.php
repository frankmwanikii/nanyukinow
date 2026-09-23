<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ListingRequest;
use App\Models\Amenity;
use App\Models\Category;
use App\Models\Listing;
use App\Models\Location;
use App\Models\User;
use App\Notifications\ListingReviewedNotification;
use App\Support\CategoryKey;
use App\Support\ListingMedia;
use App\Support\ListingPayload;
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

        $perPage = (int) $request->integer('per_page', 15);
        if (! in_array($perPage, [10, 15, 25, 50], true)) {
            $perPage = 15;
        }

        $listings = Listing::query()
            ->with(['category:id,name,slug', 'user:id,name'])
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
            ->paginate($perPage)
            ->withQueryString()
            ->through(function (Listing $listing) {
                // Same public shape as Home/Explore/Show so cards match the website.
                $public = ListingPayload::fromModel($listing);

                return array_merge($public, [
                    'image_url' => $public['image'],
                    'status' => $listing->status,
                    'views_count' => $listing->views_count,
                    'is_published' => $listing->is_published,
                    'owner' => $listing->user?->name,
                    'expires_at' => $listing->expires_at?->toIso8601String(),
                    'expiry_label' => $listing->expiryLabel(),
                    'is_expired' => $listing->isExpired(),
                    'updated_at' => $listing->updated_at?->toIso8601String(),
                ]);
            });

        $stats = [
            'published' => Listing::query()
                ->where(function ($q) {
                    $q->where('status', 'published')
                        ->orWhere('is_published', true);
                })
                ->count(),
            'premium' => Listing::query()->where('tier', 'premium')->count(),
            'pending' => Listing::query()->where('status', 'pending')->count(),
            'expiring_soon' => Listing::query()
                ->whereNotNull('expires_at')
                ->whereBetween('expires_at', [now(), now()->addDays(14)])
                ->count(),
        ];

        return Inertia::render('Admin/Listings/Index', [
            'listings' => $listings,
            'stats' => $stats,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
                'tier' => $request->string('tier')->toString(),
                'category_id' => $request->input('category_id'),
                'expiry' => $request->string('expiry')->toString(),
                'featured' => $request->boolean('featured'),
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
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
            'categories' => $this->categories(),
            'amenities' => $this->amenitiesPayload(),
            'mapsApiKey' => config('services.google.maps_key') ?: env('VITE_GOOGLE_MAPS_API_KEY'),
            'plan' => null,
            'allowedTiers' => ['free', 'featured', 'premium'],
            'isDraft' => false,
            'owners' => User::query()->orderBy('name')->get(['id', 'name', 'email']),
            'statuses' => ['draft', 'pending', 'published', 'expired', 'archived'],
            'claimStatuses' => ['unclaimed', 'pending', 'claimed'],
        ]);
    }

    public function store(ListingRequest $request): RedirectResponse
    {
        $data = $this->prepareData($request->validated(), $request);
        $listing = Listing::query()->create($data);

        return redirect()
            ->route('admin.listings.edit', $listing->slug)
            ->with('success', $this->flashMessageFor($listing));
    }

    public function edit(Listing $listing): Response
    {
        $listing->load(['category:id,name', 'user:id,name']);

        return Inertia::render('Admin/Listings/Form', [
            'listing' => [
                'id' => $listing->id,
                'user_id' => $listing->user_id,
                'category_id' => $listing->category_id,
                'subcategory' => $listing->subcategory,
                'property_type' => $listing->property_type,
                'title' => $listing->title,
                'slug' => $listing->slug,
                'location' => $listing->location,
                'city' => $listing->city,
                'tagline' => $listing->tagline,
                'description' => $listing->description,
                'phone' => $listing->phone,
                'whatsapp' => $listing->whatsapp,
                'email' => $listing->email,
                'website' => $listing->website,
                'address' => $listing->address,
                'venue' => $listing->venue,
                'latitude' => $listing->latitude,
                'longitude' => $listing->longitude,
                'price_range' => $listing->price_range,
                'image_url' => $listing->image_url,
                'logo_url' => $listing->logo_url,
                'event_poster_url' => $listing->event_poster_url,
                'gallery' => $listing->gallery ?? [],
                'amenities' => $listing->amenities ?? [],
                'hours' => $listing->hours ?? [],
                'social_links' => $listing->social_links ?? [],
                'details' => $listing->details ?? [],
                'start_at' => $listing->start_at?->format('Y-m-d\TH:i'),
                'end_at' => $listing->end_at?->format('Y-m-d\TH:i'),
                'ticket_price' => $listing->ticket_price,
                'early_bird_price' => $listing->early_bird_price,
                'gate_price' => $listing->gate_price,
                'ticket_url' => $listing->ticket_url,
                'tier' => $listing->tier,
                'status' => $listing->status,
                'claim_status' => $listing->claim_status,
                'priority' => $listing->priority,
                'expires_at' => $listing->expires_at?->format('Y-m-d\TH:i'),
                'published_at' => $listing->published_at?->format('Y-m-d\TH:i'),
                'is_published' => $listing->is_published,
                'is_featured' => $listing->is_featured,
                'is_trending' => $listing->is_trending,
            ],
            'categories' => $this->categories(),
            'amenities' => $this->amenitiesPayload(),
            'mapsApiKey' => config('services.google.maps_key') ?: env('VITE_GOOGLE_MAPS_API_KEY'),
            'plan' => null,
            'allowedTiers' => ['free', 'featured', 'premium'],
            'isDraft' => false,
            'owners' => User::query()->orderBy('name')->get(['id', 'name', 'email']),
            'statuses' => ['draft', 'pending', 'published', 'expired', 'archived'],
            'claimStatuses' => ['unclaimed', 'pending', 'claimed'],
        ]);
    }

    public function update(ListingRequest $request, Listing $listing): RedirectResponse
    {
        $previousStatus = $listing->status;
        $previousPublished = (bool) $listing->is_published;
        $ownerId = $listing->user_id;

        $data = $this->prepareData($request->validated(), $request, $listing);

        // Keep existing owner unless the admin explicitly posted a new user_id.
        if (! array_key_exists('user_id', $request->validated())) {
            unset($data['user_id']);
        }

        $listing->update($data);

        $listing = $listing->fresh();
        if (! $listing->user_id && $ownerId) {
            $listing->user_id = $ownerId;
            $listing->save();
            $listing = $listing->fresh();
        }

        $this->notifyOwnerOfReview($listing, $previousStatus, $previousPublished);

        return redirect()
            ->route('admin.listings.edit', $listing->slug)
            ->with('success', $this->flashMessageFor($listing));
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

        if ($data['action'] === 'publish') {
            $listings = (clone $query)->with('user')->get();
            $query->update(['is_published' => true, 'status' => 'published']);
            foreach ($listings as $listing) {
                if ($listing->user) {
                    $listing->user->notify(new ListingReviewedNotification($listing, 'published'));
                }
            }
        } else {
            match ($data['action']) {
                'unpublish' => $query->update(['is_published' => false, 'status' => 'draft']),
                'feature' => $query->update(['is_featured' => true, 'tier' => 'featured']),
                'unfeature' => $query->update(['is_featured' => false]),
                'archive' => $query->update(['status' => 'archived', 'is_published' => false]),
                'delete' => $query->delete(),
                default => null,
            };
        }

        return back()->with('success', 'Bulk action completed.');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function prepareData(array $data, Request $request, ?Listing $listing = null): array
    {
        // Handle file uploads (cover, logo, event_poster, gallery_files)
        $galleryUrls = is_array($data['gallery_urls'] ?? null)
            ? array_values(array_filter($data['gallery_urls'], fn ($url) => is_string($url) && $url !== ''))
            : [];

        if ($request->hasFile('gallery_files')) {
            foreach ($request->file('gallery_files') as $file) {
                if ($file) {
                    $galleryUrls[] = ListingMedia::store($file, 'listings/gallery');
                }
            }
        }

        $imageUrl = $data['image_url'] ?? $listing?->image_url;
        if ($request->hasFile('cover')) {
            if ($listing?->image_url) {
                ListingMedia::delete($listing->image_url);
            }
            $imageUrl = ListingMedia::store($request->file('cover'), 'listings/covers');
        }

        $logoUrl = $data['logo_url'] ?? $listing?->logo_url;
        if ($request->hasFile('logo')) {
            if ($listing?->logo_url) {
                ListingMedia::delete($listing->logo_url);
            }
            $logoUrl = ListingMedia::store($request->file('logo'), 'listings/logos');
        }

        $posterUrl = $data['event_poster_url'] ?? $listing?->event_poster_url;
        if ($request->hasFile('event_poster')) {
            if ($listing?->event_poster_url) {
                ListingMedia::delete($listing->event_poster_url);
            }
            $posterUrl = ListingMedia::store($request->file('event_poster'), 'listings/posters');
        }

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

        // Normalize amenities
        if (is_array($data['amenities'] ?? null)) {
            $data['amenities'] = array_values(array_unique(array_filter(
                array_map(fn ($a) => is_string($a) ? trim($a) : '', $data['amenities']),
            )));
        } elseif (isset($data['amenities']) && is_string($data['amenities'])) {
            $data['amenities'] = array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', $data['amenities']) ?: [])));
        }

        // Normalize gallery
        $data['gallery'] = $galleryUrls;

        // Normalize hours (already array or JSON string)
        if (isset($data['hours']) && is_string($data['hours'])) {
            $decoded = json_decode($data['hours'], true);
            $data['hours'] = json_last_error() === JSON_ERROR_NONE ? $decoded : [];
        }

        // Normalize social_links (already array or JSON string)
        if (isset($data['social_links']) && is_string($data['social_links'])) {
            $decoded = json_decode($data['social_links'], true);
            $data['social_links'] = json_last_error() === JSON_ERROR_NONE ? $decoded : [];
        }

        // Normalize details (already array or JSON string)
        if (isset($data['details']) && is_string($data['details'])) {
            $decoded = json_decode($data['details'], true);
            $data['details'] = json_last_error() === JSON_ERROR_NONE ? $decoded : [];
        }

        $data['image_url'] = $imageUrl;
        $data['logo_url'] = $logoUrl;
        $data['event_poster_url'] = $posterUrl;

        return $data;
    }

    /**
     * @return list<array{id:int,name:string,slug:string,key:string}>
     */
    private function categories(): array
    {
        return Category::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn (Category $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'key' => CategoryKey::fromSlug($c->slug),
            ])
            ->all();
    }

    /**
     * @return list<array{id:int,name:string,slug:string,category_key:?string}>
     */
    private function amenitiesPayload(): array
    {
        return Amenity::query()
            ->where('is_active', true)
            ->orderByDesc('usage_count')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'category_key'])
            ->map(fn (Amenity $a) => [
                'id' => $a->id,
                'name' => $a->name,
                'slug' => $a->slug,
                'category_key' => $a->category_key,
            ])
            ->all();
    }

    private function notifyOwnerOfReview(Listing $listing, ?string $previousStatus, bool $previousPublished): void
    {
        if (! $listing->user_id || ! $listing->user) {
            return;
        }

        $becamePublished = $listing->is_published
            && $listing->status === 'published'
            && (! $previousPublished || $previousStatus !== 'published');

        $becameArchived = $listing->status === 'archived' && $previousStatus !== 'archived';

        if ($becamePublished) {
            $listing->user->notify(new ListingReviewedNotification($listing, 'published'));
        } elseif ($becameArchived) {
            $listing->user->notify(new ListingReviewedNotification($listing, 'archived'));
        }
    }

    private function flashMessageFor(Listing $listing): string
    {
        if ($listing->status === 'draft') {
            return 'Draft saved successfully.';
        }

        if ($listing->status === 'published' && $listing->is_published) {
            return 'Listing published successfully.';
        }

        return 'Listing updated successfully.';
    }
}
