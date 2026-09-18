<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\StoreListingRequest;
use App\Http\Requests\Account\UpdateListingRequest;
use App\Models\Category;
use App\Models\Listing;
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

        if (! Membership::canCreateListing($user)) {
            return redirect()
                ->route('account.index')
                ->with('error', 'You have reached your listing limit. Upgrade your plan to add more.');
        }

        return Inertia::render('Account/Listings/Form', [
            'listing' => null,
            'categories' => $this->categories(),
            'plan' => Membership::planSummary($user),
            'allowedTiers' => Membership::allowedTiers($user->effectivePlan()),
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

        $listing = Listing::query()->create([
            ...$data,
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

        return redirect()
            ->route('account.index')
            ->with('success', "“{$listing->title}” submitted for review.");
    }

    public function edit(Request $request, Listing $listing): Response|RedirectResponse
    {
        $this->authorizeOwner($request, $listing);

        return Inertia::render('Account/Listings/Form', [
            'listing' => [
                'id' => $listing->id,
                'title' => $listing->title,
                'slug' => $listing->slug,
                'category_id' => $listing->category_id,
                'location' => $listing->location,
                'tagline' => $listing->tagline,
                'description' => $listing->description,
                'phone' => $listing->phone,
                'whatsapp' => $listing->whatsapp,
                'email' => $listing->email,
                'website' => $listing->website,
                'address' => $listing->address,
                'image_url' => $listing->image_url,
                'tier' => $listing->tier,
                'status' => $listing->status,
                'is_published' => $listing->is_published,
            ],
            'categories' => $this->categories(),
            'plan' => Membership::planSummary($request->user()),
            'allowedTiers' => Membership::allowedTiers($request->user()->effectivePlan()),
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

        $listing->update([
            ...$data,
            'tier' => $tier,
            'is_featured' => in_array($tier, [Membership::STANDARD, Membership::PREMIUM], true),
            'priority' => $tier === Membership::PREMIUM ? 20 : ($tier === Membership::STANDARD ? 10 : 0),
        ]);

        return redirect()
            ->route('account.index')
            ->with('success', 'Listing updated.');
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
     * @return list<array{id:int,name:string,slug:string}>
     */
    private function categories(): array
    {
        if (! Category::query()->exists()) {
            foreach ([
                ['name' => 'Eat & Drink', 'slug' => 'eat-drink', 'sort_order' => 1],
                ['name' => 'Stay', 'slug' => 'stay', 'sort_order' => 2],
                ['name' => 'Things to do', 'slug' => 'things-to-do', 'sort_order' => 3],
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
