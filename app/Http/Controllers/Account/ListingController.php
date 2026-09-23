<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\SaveListingDraftRequest;
use App\Http\Requests\Account\StoreListingRequest;
use App\Http\Requests\Account\UpdateListingRequest;
use App\Models\Amenity;
use App\Models\Category;
use App\Models\Listing;
use App\Support\CategoryKey;
use App\Support\ListingMedia;
use App\Support\Membership;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ListingController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        $draft = Listing::query()
            ->where('user_id', $user->id)
            ->where('status', 'draft')
            ->latest('updated_at')
            ->first();

        if (! $draft && ! Membership::canCreateListing($user)) {
            return redirect()
                ->route('account.index')
                ->with('error', 'You have reached your listing limit. Upgrade your plan to add more.');
        }

        return Inertia::render('Account/Listings/Form', [
            'listing' => $draft ? $this->listingFormPayload($draft) : null,
            'categories' => $this->categories(),
            'amenities' => $this->amenitiesPayload(),
            'mapsApiKey' => config('services.google.maps_key') ?: env('VITE_GOOGLE_MAPS_API_KEY'),
            'plan' => Membership::planSummary($user),
            'allowedTiers' => Membership::allowedTiers($user->effectivePlan()),
            'isDraft' => (bool) $draft,
        ]);
    }

    public function saveDraft(SaveListingDraftRequest $request, ?Listing $listing = null): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();

        if ($listing) {
            $this->authorizeOwner($request, $listing);
            abort_unless($listing->status === 'draft', 422, 'Only drafts can be auto-saved this way.');
        } else {
            $listing = Listing::query()
                ->where('user_id', $user->id)
                ->where('status', 'draft')
                ->latest('updated_at')
                ->first();
        }

        $data = $request->validated();
        $tier = Membership::normalize($data['tier'] ?? $user->effectivePlan());

        if (! Membership::canUseTier($user, $tier)) {
            $tier = Membership::FREE;
        }

        if (! $listing) {
            if (! Membership::canCreateListing($user)) {
                return response()->json([
                    'message' => 'Listing limit reached.',
                ], 422);
            }

            $title = trim((string) ($data['title'] ?? '')) ?: 'Untitled draft';

            $listing = Listing::query()->create([
                'user_id' => $user->id,
                'title' => $title,
                'slug' => $this->uniqueSlug($title.'-draft-'.$user->id),
                'category_id' => $data['category_id'] ?? null,
                'location' => $data['location'] ?? 'Nanyuki',
                'tier' => $tier,
                'status' => 'draft',
                'claim_status' => 'claimed',
                'is_published' => false,
                'is_featured' => false,
                'is_trending' => false,
                'priority' => 0,
            ]);
        }

        $payload = $this->buildListingPayload($request, [
            ...$data,
            'title' => trim((string) ($data['title'] ?? '')) ?: $listing->title ?: 'Untitled draft',
            'category_id' => $data['category_id'] ?? $listing->category_id,
        ], $listing);

        $listing->update([
            ...$payload,
            'tier' => $tier,
            'status' => 'draft',
            'is_published' => false,
        ]);

        return response()->json([
            'listing' => $this->listingFormPayload($listing->fresh()),
            'saved_at' => now()->toIso8601String(),
        ]);
    }

    public function store(StoreListingRequest $request): RedirectResponse
    {
        $user = $request->user();

        if (! Membership::canCreateListing($user)) {
            return back()->with('error', 'You have reached your listing limit. Upgrade to add more listings.');
        }

        $data = $request->validated();
        $tier = Membership::normalize($data['tier']);

        if (! Membership::canUseTier($user, $tier)) {
            return back()->withErrors(['tier' => 'Your plan does not include that listing tier.']);
        }

        $payload = $this->buildListingPayload($request, $data);

        $listing = Listing::query()->create([
            ...$payload,
            'user_id' => $user->id,
            'slug' => $this->uniqueSlug($data['title']),
            'tier' => $tier,
            'status' => 'pending',
            'claim_status' => 'claimed',
            'is_published' => false,
            'is_featured' => in_array($tier, [Membership::STANDARD, Membership::PREMIUM], true),
            'is_trending' => false,
            'priority' => $tier === Membership::PREMIUM ? 20 : ($tier === Membership::STANDARD ? 10 : 0),
        ]);

        $this->bumpAmenityUsage($payload['amenities'] ?? []);

        return redirect()
            ->route('account.index')
            ->with('success', "“{$listing->title}” submitted for review.");
    }

    public function edit(Request $request, Listing $listing): Response|RedirectResponse
    {
        $this->authorizeOwner($request, $listing);

        return Inertia::render('Account/Listings/Form', [
            'listing' => $this->listingFormPayload($listing),
            'categories' => $this->categories(),
            'amenities' => $this->amenitiesPayload(),
            'mapsApiKey' => config('services.google.maps_key') ?: env('VITE_GOOGLE_MAPS_API_KEY'),
            'plan' => Membership::planSummary($request->user()),
            'allowedTiers' => Membership::allowedTiers($request->user()->effectivePlan()),
            'isDraft' => $listing->status === 'draft',
        ]);
    }

    public function update(UpdateListingRequest $request, Listing $listing): RedirectResponse
    {
        $this->authorizeOwner($request, $listing);

        $data = $request->validated();
        $tier = Membership::normalize($data['tier']);

        if (! Membership::canUseTier($request->user(), $tier)) {
            return back()->withErrors(['tier' => 'Your plan does not include that listing tier.']);
        }

        $payload = $this->buildListingPayload($request, $data, $listing);
        $wasDraft = $listing->status === 'draft';

        $listing->update([
            ...$payload,
            'tier' => $tier,
            'status' => $wasDraft ? 'pending' : $listing->status,
            'is_published' => $wasDraft ? false : $listing->is_published,
            'is_featured' => in_array($tier, [Membership::STANDARD, Membership::PREMIUM], true),
            'priority' => $tier === Membership::PREMIUM ? 20 : ($tier === Membership::STANDARD ? 10 : 0),
        ]);

        $this->bumpAmenityUsage($payload['amenities'] ?? []);

        return redirect()
            ->route('account.index')
            ->with(
                'success',
                $wasDraft
                    ? "“{$listing->title}” submitted for review."
                    : 'Listing updated.',
            );
    }

    public function destroy(Request $request, Listing $listing): RedirectResponse
    {
        $this->authorizeOwner($request, $listing);

        $title = $listing->title;
        $listing->delete();

        return redirect()
            ->route('account.index')
            ->with('success', "“{$title}” deleted.");
    }

    private function authorizeOwner(Request $request, Listing $listing): void
    {
        abort_unless(
            (int) $listing->user_id === (int) $request->user()->id,
            403,
        );
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function buildListingPayload(Request $request, array $data, ?Listing $existing = null): array
    {
        $galleryUrls = array_values(array_filter(
            $data['gallery_urls'] ?? [],
            fn ($url) => is_string($url) && $url !== '',
        ));

        if ($request->hasFile('gallery_files')) {
            foreach ($request->file('gallery_files') as $file) {
                if ($file) {
                    $galleryUrls[] = ListingMedia::store($file, 'listings/gallery');
                }
            }
        }

        $imageUrl = $data['image_url'] ?? $existing?->image_url;
        if ($request->hasFile('cover')) {
            if ($existing?->image_url) {
                ListingMedia::delete($existing->image_url);
            }
            $imageUrl = ListingMedia::store($request->file('cover'), 'listings/covers');
        }

        $logoUrl = $data['logo_url'] ?? $existing?->logo_url;
        if ($request->hasFile('logo')) {
            if ($existing?->logo_url) {
                ListingMedia::delete($existing->logo_url);
            }
            $logoUrl = ListingMedia::store($request->file('logo'), 'listings/logos');
        }

        $posterUrl = $data['event_poster_url'] ?? $existing?->event_poster_url;
        if ($request->hasFile('event_poster')) {
            if ($existing?->event_poster_url) {
                ListingMedia::delete($existing->event_poster_url);
            }
            $posterUrl = ListingMedia::store($request->file('event_poster'), 'listings/posters');
        }

        $amenities = array_values(array_unique(array_filter(
            array_map(fn ($a) => is_string($a) ? trim($a) : '', $data['amenities'] ?? []),
        )));

        return [
            'title' => $data['title'] ?? $existing?->title ?? 'Untitled draft',
            'category_id' => $data['category_id'] ?? $existing?->category_id,
            'subcategory' => $data['subcategory'] ?? null,
            'property_type' => $data['property_type'] ?? null,
            'location' => $data['location'] ?? null,
            'city' => $data['city'] ?? null,
            'tagline' => $data['tagline'] ?? $existing?->tagline,
            'description' => array_key_exists('description', $data)
                ? $data['description']
                : $existing?->description,
            'phone' => $data['phone'] ?? null,
            'whatsapp' => $data['whatsapp'] ?? null,
            'email' => $data['email'] ?? null,
            'website' => $data['website'] ?? null,
            'address' => $data['address'] ?? null,
            'venue' => $data['venue'] ?? null,
            'latitude' => isset($data['latitude']) ? (float) $data['latitude'] : null,
            'longitude' => isset($data['longitude']) ? (float) $data['longitude'] : null,
            'price_range' => $data['price_range'] ?? null,
            'image_url' => $imageUrl,
            'logo_url' => $logoUrl,
            'event_poster_url' => $posterUrl,
            'gallery' => $galleryUrls,
            'amenities' => $amenities,
            'hours' => $data['hours'] ?? null,
            'social_links' => $data['social_links'] ?? null,
            'details' => $data['details'] ?? null,
            'start_at' => $data['start_at'] ?? null,
            'end_at' => $data['end_at'] ?? null,
            'ticket_price' => $data['ticket_price'] ?? null,
            'early_bird_price' => $data['early_bird_price'] ?? null,
            'gate_price' => $data['gate_price'] ?? null,
            'ticket_url' => $data['ticket_url'] ?? null,
        ];
    }

    /**
     * @param  list<string>  $amenities
     */
    private function bumpAmenityUsage(array $amenities): void
    {
        foreach ($amenities as $slugOrName) {
            $amenity = Amenity::query()
                ->where(function ($query) use ($slugOrName) {
                    $query->where('slug', $slugOrName)
                        ->orWhereRaw('LOWER(name) = ?', [mb_strtolower($slugOrName)]);
                })
                ->first();

            if ($amenity) {
                $amenity->increment('usage_count');
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function listingFormPayload(Listing $listing): array
    {
        return [
            'id' => $listing->id,
            'title' => $listing->title,
            'slug' => $listing->slug,
            'category_id' => $listing->category_id,
            'subcategory' => $listing->subcategory,
            'property_type' => $listing->property_type,
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
            'is_published' => $listing->is_published,
        ];
    }

    /**
     * @return list<array{id:int,name:string,slug:string,key:string}>
     */
    private function categories(): array
    {
        if (! Category::query()->exists()) {
            foreach ([
                ['name' => 'Eat & Drink', 'slug' => 'eatDrink', 'sort_order' => 1],
                ['name' => 'Stay', 'slug' => 'stay', 'sort_order' => 2],
                ['name' => 'Things to do', 'slug' => 'thingsToDo', 'sort_order' => 3],
                ['name' => 'Services', 'slug' => 'services', 'sort_order' => 4],
                ['name' => 'Shopping', 'slug' => 'shopping', 'sort_order' => 5],
                ['name' => 'Properties', 'slug' => 'properties', 'sort_order' => 6],
                ['name' => 'Events', 'slug' => 'events', 'sort_order' => 7],
            ] as $row) {
                Category::query()->firstOrCreate(['slug' => $row['slug']], $row);
            }
        }

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

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title) ?: 'listing';
        $slug = $base;
        $i = 1;

        while (Listing::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i;
            $i++;
        }

        return $slug;
    }
}
