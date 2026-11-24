<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ListingRequest;
use App\Http\Requests\Admin\SaveListingDraftRequest;
use App\Models\Amenity;
use App\Models\Category;
use App\Models\Listing;
use App\Models\StayGallerySpace;
use App\Models\User;
use App\Notifications\ListingReviewedNotification;
use App\Support\CategoryKey;
use App\Support\CategoryTaxonomy;
use App\Support\EatDrinkTierFeatures;
use App\Support\EventsTierFeatures;
use App\Support\ListingEditLock;
use App\Support\ListingGallery;
use App\Support\ListingMedia;
use App\Support\ListingPayload;
use App\Support\ListingSlug;
use App\Support\Membership;
use App\Support\PropertiesTierFeatures;
use App\Support\ServicesTierFeatures;
use App\Support\ShoppingTierFeatures;
use App\Support\StayTierFeatures;
use App\Support\ThingsToDoTierFeatures;
use App\Support\TicketOptions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        $paginator = Listing::query()
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
            ->withQueryString();

        $editors = ListingEditLock::editorsFor(
            $paginator->getCollection()->pluck('id')->map(fn ($id) => (int) $id)->all(),
        );

        $listings = $paginator->through(function (Listing $listing) use ($editors) {
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
                'editing_by' => $editors[$listing->id] ?? null,
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
            'owners' => User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'email'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ])
                ->values()
                ->all(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Listings/Form', [
            'listing' => null,
            'editLock' => null,
            'categories' => $this->categories(),
            'amenities' => $this->amenitiesPayload(),
            'stayGallerySpaces' => $this->stayGallerySpacesPayload(),
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

    public function saveDraft(SaveListingDraftRequest $request, ?Listing $listing = null): JsonResponse
    {
        if ($listing) {
            abort_unless($listing->status === 'draft', 422, 'Only drafts can be auto-saved this way.');
            ListingEditLock::assertWritable($listing, $request->user());
        }

        $data = $request->validated();
        $title = trim((string) ($data['title'] ?? '')) ?: 'Untitled draft';
        $tier = Membership::normalize($data['tier'] ?? Membership::FREE);

        if (! $listing) {
            $listing = Listing::query()->create([
                'user_id' => $data['user_id'] ?? null,
                'title' => $title,
                'slug' => ListingSlug::make($title),
                'category_id' => $data['category_id'] ?? null,
                'location' => $data['location'] ?? 'Nanyuki',
                'tier' => $tier,
                'status' => 'draft',
                'claim_status' => $data['claim_status'] ?? 'unclaimed',
                'is_published' => false,
                'is_featured' => false,
                'is_trending' => false,
                'priority' => isset($data['priority'])
                    ? (int) $data['priority']
                    : Membership::listingPriority($tier),
            ]);
        }

        $prepared = $this->prepareData([
            ...$data,
            'title' => $title,
            'slug' => $listing->slug,
            'category_id' => $data['category_id'] ?? $listing->category_id,
            'tier' => $data['tier'] ?? $listing->tier,
            'status' => 'draft',
            'claim_status' => $data['claim_status'] ?? $listing->claim_status ?? 'unclaimed',
            'priority' => $data['priority'] ?? $listing->priority ?? Membership::listingPriority($tier),
            'is_published' => false,
            'is_featured' => (bool) ($listing->is_featured),
            'is_trending' => (bool) ($listing->is_trending),
            'user_id' => array_key_exists('user_id', $data) ? $data['user_id'] : $listing->user_id,
        ], $request, $listing);

        $prepared['status'] = 'draft';
        $prepared['is_published'] = false;
        // Keep the draft slug stable while autosaving so in-flight posts to the
        // previous slug do not 404 after a title change.
        $prepared['slug'] = $listing->slug ?: ListingSlug::make($title, $listing->id);

        $listing->update($prepared);

        return response()->json([
            'listing' => $this->listingFormPayload($listing->fresh()),
            'saved_at' => now()->toIso8601String(),
        ]);
    }

    public function edit(Request $request, Listing $listing): Response
    {
        $listing->load(['category:id,name', 'user:id,name']);

        $editLock = ListingEditLock::acquire($listing, $request->user());

        return Inertia::render('Admin/Listings/Form', [
            'editLock' => $editLock,
            'listing' => [
                'id' => $listing->id,
                'user_id' => $listing->user_id,
                'category_id' => $listing->category_id,
                'subcategory' => $listing->subcategory ?: [],
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
                'image_url' => ListingMedia::normalizePublicUrl($listing->image_url),
                'logo_url' => ListingMedia::normalizePublicUrl($listing->logo_url),
                'event_poster_url' => ListingMedia::normalizePublicUrl($listing->event_poster_url),
                'gallery' => $listing->gallery ?? [],
                'amenities' => $listing->amenities ?? [],
                'hours' => $listing->hours ?? [],
                'social_links' => $listing->social_links ?? [],
                'details' => $listing->details ?? [],
                'start_at' => $listing->start_at?->format('Y-m-d\TH:i'),
                'end_at' => $listing->end_at?->format('Y-m-d\TH:i'),
                'ticket_options' => TicketOptions::forForm(
                    $listing->ticket_options,
                    $listing->ticket_price,
                    $listing->early_bird_price,
                    $listing->gate_price,
                ),
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
                'is_verified' => $listing->is_verified,
                'is_featured' => $listing->is_featured,
                'is_trending' => $listing->is_trending,
            ],
            'categories' => $this->categories(),
            'amenities' => $this->amenitiesPayload(),
            'stayGallerySpaces' => $this->stayGallerySpacesPayload(),
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
        if ($conflict = ListingEditLock::conflictMessage($listing, $request->user())) {
            return redirect()
                ->route('admin.listings.edit', $listing->slug)
                ->with('error', $conflict);
        }

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

    public function destroy(Request $request, Listing $listing): RedirectResponse
    {
        if ($conflict = ListingEditLock::conflictMessage($listing, $request->user())) {
            return redirect()
                ->route('admin.listings.index')
                ->with('error', $conflict);
        }

        ListingEditLock::release($listing, $request->user());
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
            'action' => ['required', 'in:publish,unpublish,feature,unfeature,promote,unpromote,delete,archive,assign'],
            'user_id' => ['required_if:action,assign', 'nullable', 'integer', 'exists:users,id'],
        ]);

        $ids = array_values(array_map('intval', $data['ids']));
        $editors = ListingEditLock::editorsFor($ids);
        $userId = (int) $request->user()->id;
        $allowedIds = array_values(array_filter(
            $ids,
            fn (int $id): bool => ! isset($editors[$id]) || (int) $editors[$id]['id'] === $userId,
        ));
        $skipped = count($ids) - count($allowedIds);

        if ($allowedIds === []) {
            return back()->with(
                'error',
                'No listings were changed. Another admin is editing the selected listing'.($skipped === 1 ? '' : 's').'.',
            );
        }

        $query = Listing::query()->whereIn('id', $allowedIds);

        if ($data['action'] === 'publish') {
            $listings = (clone $query)->with('user')->get();
            $query->update(['is_published' => true, 'status' => 'published']);
            foreach ($listings as $listing) {
                if ($listing->user) {
                    $listing->user->notify(new ListingReviewedNotification($listing, 'published'));
                }
            }
        } elseif ($data['action'] === 'assign') {
            $ownerId = (int) $data['user_id'];
            $owner = User::query()->findOrFail($ownerId);
            $query->update(['user_id' => $owner->id]);
        } else {
            match ($data['action']) {
                'unpublish' => $query->update(['is_published' => false, 'status' => 'draft']),
                'feature' => $query->update([
                    'is_featured' => true,
                    'tier' => Membership::STANDARD,
                    'priority' => Membership::listingPriority(Membership::STANDARD),
                ]),
                'unfeature' => $query->update([
                    'is_featured' => false,
                    'tier' => Membership::FREE,
                    'priority' => Membership::listingPriority(Membership::FREE),
                ]),
                'promote' => $query->update(['priority' => Membership::PROMOTED_PRIORITY]),
                'unpromote' => $query->get()->each(function (Listing $listing): void {
                    $listing->update([
                        'priority' => Membership::listingPriority($listing->tier),
                    ]);
                }),
                'archive' => $query->update(['status' => 'archived', 'is_published' => false]),
                'delete' => $query->delete(),
                default => null,
            };
        }

        if ($data['action'] === 'assign') {
            $assigned = count($allowedIds);
            $message = $assigned === 1
                ? '1 listing assigned to '.$owner->name.'.'
                : $assigned.' listings assigned to '.$owner->name.'.';

            if ($skipped > 0) {
                $message .= ' '.$skipped.' listing'.($skipped === 1 ? ' was' : 's were').' skipped because another admin is editing.';
            }

            return back()->with('success', $message);
        }

        if ($skipped > 0) {
            return back()->with(
                'success',
                'Bulk action completed. '.$skipped.' listing'.($skipped === 1 ? ' was' : 's were').' skipped because another admin is editing.',
            );
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
        $galleryEntries = is_array($data['gallery_urls'] ?? null) ? $data['gallery_urls'] : [];
        $galleryFiles = $request->hasFile('gallery_files')
            ? array_values(array_filter($request->file('gallery_files') ?: []))
            : [];
        $galleryFileMeta = is_array($data['gallery_file_meta'] ?? null)
            ? $data['gallery_file_meta']
            : [];
        $galleryUrls = ListingGallery::fromRequest($galleryEntries, $galleryFiles, $galleryFileMeta);

        $imageUrl = ListingMedia::persistPublicUrl($data['image_url'] ?? null, 'listings/covers')
            ?? ListingMedia::normalizePublicUrl($listing?->image_url);
        if ($request->hasFile('cover')) {
            if ($listing?->image_url) {
                ListingMedia::delete($listing->image_url);
            }
            $imageUrl = ListingMedia::storeOrFail($request->file('cover'), 'listings/covers', 'cover');
        }

        $logoUrl = ListingMedia::persistPublicUrl($data['logo_url'] ?? null, 'listings/logos')
            ?? ListingMedia::normalizePublicUrl($listing?->logo_url);
        if ($request->hasFile('logo')) {
            if ($listing?->logo_url) {
                ListingMedia::delete($listing->logo_url);
            }
            $logoUrl = ListingMedia::storeOrFail($request->file('logo'), 'listings/logos', 'logo');
        }

        $posterUrl = ListingMedia::persistPublicUrl($data['event_poster_url'] ?? null, 'listings/posters')
            ?? ListingMedia::normalizePublicUrl($listing?->event_poster_url);
        if ($request->hasFile('event_poster')) {
            if ($listing?->event_poster_url) {
                ListingMedia::delete($listing->event_poster_url);
            }
            $posterUrl = ListingMedia::storeOrFail(
                $request->file('event_poster'),
                'listings/posters',
                'event_poster',
            );
        }

        $data['slug'] = ListingSlug::resolve(
            (string) ($data['title'] ?? 'listing'),
            $listing?->id,
            $listing?->slug,
            $listing?->title,
            isset($data['slug']) ? (string) $data['slug'] : null,
        );

        $data['is_verified'] = (bool) ($data['is_verified'] ?? false);
        $data['is_featured'] = (bool) ($data['is_featured'] ?? false);
        $data['is_trending'] = (bool) ($data['is_trending'] ?? false);
        $data['is_published'] = (bool) ($data['is_published'] ?? false);

        $tier = Membership::normalize($data['tier'] ?? Membership::FREE);
        $requestedPriority = isset($data['priority']) ? (int) $data['priority'] : null;

        // Plan and priority 1–3 are the same scale. Priority 4 = Promoted (keeps plan).
        if ($requestedPriority === Membership::PROMOTED_PRIORITY) {
            $data['tier'] = $tier;
            $data['priority'] = Membership::PROMOTED_PRIORITY;
        } elseif (($tierFromPriority = Membership::tierFromPriority($requestedPriority)) !== null) {
            $data['tier'] = $tierFromPriority;
            $data['priority'] = $requestedPriority;
            $tier = $tierFromPriority;
        } else {
            $data['tier'] = $tier;
            $data['priority'] = Membership::listingPriority($tier);
        }

        if (in_array($tier, [Membership::STANDARD, Membership::PREMIUM], true)) {
            $data['is_featured'] = true;
        } elseif ($data['tier'] === Membership::FREE) {
            $data['is_featured'] = false;
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
        if (isset($data['social_links']) && is_array($data['social_links'])) {
            $data['social_links'] = $this->normalizeSocialLinks($data['social_links']);
        }

        // Normalize details (already array or JSON string)
        if (isset($data['details']) && is_string($data['details'])) {
            $decoded = json_decode($data['details'], true);
            $data['details'] = json_last_error() === JSON_ERROR_NONE ? $decoded : [];
        }

        $data['logo_url'] = $logoUrl;

        $categorySlug = isset($data['category_id'])
            ? Category::query()->whereKey($data['category_id'])->value('slug')
            : $listing?->category?->slug;
        $categoryKey = CategoryKey::fromSlug($categorySlug);

        if ($categoryKey === 'events') {
            [$imageUrl, $posterUrl] = ListingMedia::syncEventCoverAndPoster(
                $imageUrl,
                $posterUrl,
            );
        }

        $data['image_url'] = $imageUrl;
        $data['event_poster_url'] = $posterUrl;

        // Admins may attach Eat & Drink menus even when the listing is still Free;
        // normalize with at least Standard caps so the pages are not stripped.
        $adminMenus = null;
        if (
            $categoryKey === 'eatDrink'
            && isset($data['details']['menus'])
            && is_array($data['details']['menus'])
        ) {
            $adminMenus = $data['details']['menus'];
        }

        $data = TicketOptions::applyToListingPayload($data);

        $data = EatDrinkTierFeatures::applyToPayload($data, $tier, $categoryKey);
        $data = StayTierFeatures::applyToPayload($data, $tier, $categoryKey);
        $data = ShoppingTierFeatures::applyToPayload($data, $tier, $categoryKey);
        $data = PropertiesTierFeatures::applyToPayload($data, $tier, $categoryKey);
        $data = ThingsToDoTierFeatures::applyToPayload($data, $tier, $categoryKey);
        $data = ServicesTierFeatures::applyToPayload($data, $tier, $categoryKey);

        $data = EventsTierFeatures::applyToPayload($data, $tier, $categoryKey);

        if ($adminMenus !== null) {
            $menuTier = EatDrinkTierFeatures::tierMeets($tier, Membership::STANDARD)
                ? $tier
                : Membership::STANDARD;
            $normalizedMenus = EatDrinkTierFeatures::normalizeMenus($adminMenus, $menuTier);
            $details = is_array($data['details'] ?? null) ? $data['details'] : [];
            if ($normalizedMenus === []) {
                unset($details['menus']);
            } else {
                $details['menus'] = $normalizedMenus;
            }
            $data['details'] = $details === [] ? null : $details;
        }

        return $data;
    }

    /**
     * @param  array<string, mixed>  $social
     * @return array<string, mixed>
     */
    private function normalizeSocialLinks(array $social): array
    {
        $links = [];
        foreach ($social['links'] ?? [] as $item) {
            if (! is_array($item)) {
                continue;
            }
            $url = trim((string) ($item['url'] ?? ''));
            if ($url === '') {
                continue;
            }
            $label = trim((string) ($item['label'] ?? ''));
            $links[] = [
                'label' => $label !== '' ? $label : 'Website',
                'url' => $url,
            ];
        }

        return [
            'instagram' => filled($social['instagram'] ?? null) ? trim((string) $social['instagram']) : null,
            'facebook' => filled($social['facebook'] ?? null) ? trim((string) $social['facebook']) : null,
            'tiktok' => filled($social['tiktok'] ?? null) ? trim((string) $social['tiktok']) : null,
            'youtube' => filled($social['youtube'] ?? null) ? trim((string) $social['youtube']) : null,
            'links' => $links,
        ];
    }

    /**
     * @return list<array{id:int,name:string,slug:string,key:string}>
     */
    private function categories(): array
    {
        $byKey = CategoryTaxonomy::subcategoriesByKey();

        return Category::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(function (Category $c) use ($byKey) {
                $key = CategoryKey::fromSlug($c->slug);

                return [
                    'id' => $c->id,
                    'name' => $c->name,
                    'slug' => $c->slug,
                    'key' => $key,
                    'subcategories' => $key ? ($byKey[$key] ?? []) : [],
                ];
            })
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
            ->get(['id', 'name', 'slug', 'icon_key', 'category_key'])
            ->map(fn (Amenity $a) => [
                'id' => $a->id,
                'name' => $a->name,
                'slug' => $a->slug,
                'icon_key' => $a->icon_key,
                'category_key' => $a->category_key,
            ])
            ->all();
    }

    /**
     * @return list<array{id:int,name:string,slug:string}>
     */
    private function stayGallerySpacesPayload(): array
    {
        return StayGallerySpace::query()
            ->where('is_active', true)
            ->orderByDesc('usage_count')
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn (StayGallerySpace $space) => [
                'id' => $space->id,
                'name' => $space->name,
                'slug' => $space->slug,
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

    /**
     * @return array<string, mixed>
     */
    private function listingFormPayload(Listing $listing): array
    {
        return [
            'id' => $listing->id,
            'user_id' => $listing->user_id,
            'title' => $listing->title,
            'slug' => $listing->slug,
            'category_id' => $listing->category_id,
            'subcategory' => $listing->subcategory ?: [],
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
            'image_url' => ListingMedia::normalizePublicUrl($listing->image_url),
            'logo_url' => ListingMedia::normalizePublicUrl($listing->logo_url),
            'event_poster_url' => ListingMedia::normalizePublicUrl($listing->event_poster_url),
            'gallery' => $listing->gallery ?? [],
            'amenities' => $listing->amenities ?? [],
            'hours' => $listing->hours ?? [],
            'social_links' => $listing->social_links ?? [],
            'details' => $listing->details ?? [],
            'start_at' => $listing->start_at?->format('Y-m-d\TH:i'),
            'end_at' => $listing->end_at?->format('Y-m-d\TH:i'),
            'ticket_options' => TicketOptions::forForm(
                $listing->ticket_options,
                $listing->ticket_price,
                $listing->early_bird_price,
                $listing->gate_price,
            ),
            'ticket_price' => $listing->ticket_price,
            'early_bird_price' => $listing->early_bird_price,
            'gate_price' => $listing->gate_price,
            'ticket_url' => $listing->ticket_url,
            'tier' => $listing->tier,
            'status' => $listing->status,
            'claim_status' => $listing->claim_status,
            'priority' => $listing->priority,
            'is_published' => $listing->is_published,
            'is_verified' => $listing->is_verified,
            'is_featured' => $listing->is_featured,
            'is_trending' => $listing->is_trending,
        ];
    }
}
