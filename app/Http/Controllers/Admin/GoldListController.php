<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GoldListEntry;
use App\Models\Listing;
use App\Support\GoldList;
use App\Support\ListingSearch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GoldListController extends Controller
{
    public function index(): Response
    {
        $entries = GoldListEntry::query()
            ->with(['listing.category:id,name,slug'])
            ->orderBy('position')
            ->orderBy('id')
            ->get()
            ->map(fn (GoldListEntry $entry) => $this->entryPayload($entry))
            ->values()
            ->all();

        return Inertia::render('Admin/GoldList/Index', [
            'entries' => $entries,
            'limit' => GoldList::LIMIT,
            'searchUrl' => route('admin.gold-list.search'),
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $q = trim($request->string('q')->toString());
        $pinnedIds = GoldListEntry::query()->pluck('listing_id');

        $query = ListingSearch::publishedQuery()
            ->whereNotIn('id', $pinnedIds);

        if ($q !== '') {
            ListingSearch::apply($query, $q);
        }

        $listings = $query
            ->orderByDesc('priority')
            ->orderByDesc('rating')
            ->orderByDesc('id')
            ->limit(12)
            ->get()
            ->map(fn (Listing $listing) => [
                'id' => $listing->id,
                'title' => $listing->title,
                'slug' => $listing->slug,
                'location' => $listing->location,
                'category' => $listing->category?->name,
                'image' => $listing->image_url,
                'tier' => $listing->tier,
                'priority' => $listing->priority,
            ])
            ->values()
            ->all();

        return response()->json(['listings' => $listings]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'listing_id' => [
                'required',
                'integer',
                Rule::exists('listings', 'id'),
                Rule::unique('gold_list_entries', 'listing_id'),
            ],
        ]);

        $listing = ListingSearch::publishedQuery()
            ->whereKey($data['listing_id'])
            ->first();

        if ($listing === null) {
            return back()->withErrors([
                'listing_id' => 'Only published listings can be pinned.',
            ]);
        }

        $nextPosition = ((int) GoldListEntry::query()->max('position')) + 1;

        GoldListEntry::query()->create([
            'listing_id' => $listing->id,
            'position' => $nextPosition,
        ]);

        return back()->with('success', 'Listing pinned to the Gold List.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'order' => ['required', 'array'],
            'order.*.id' => ['required', 'integer', 'exists:gold_list_entries,id'],
            'order.*.position' => ['required', 'integer', 'min:0'],
        ]);

        DB::transaction(function () use ($data) {
            foreach ($data['order'] as $row) {
                GoldListEntry::query()
                    ->whereKey($row['id'])
                    ->update(['position' => $row['position']]);
            }
        });

        return back()->with('success', 'Gold List order saved.');
    }

    public function destroy(GoldListEntry $goldListEntry): RedirectResponse
    {
        $goldListEntry->delete();

        return back()->with('success', 'Pin removed from the Gold List.');
    }

    /**
     * @return array<string, mixed>
     */
    private function entryPayload(GoldListEntry $entry): array
    {
        $listing = $entry->listing;

        return [
            'id' => $entry->id,
            'position' => $entry->position,
            'listing_id' => $entry->listing_id,
            'title' => $listing?->title ?? 'Missing listing',
            'slug' => $listing?->slug,
            'location' => $listing?->location,
            'category' => $listing?->category?->name,
            'image' => $listing?->image_url,
            'tier' => $listing?->tier,
            'priority' => $listing?->priority,
            'is_published' => $listing !== null
                && $listing->is_published
                && ! $listing->suppressed_by_plan_expiry
                && ($listing->status === null || $listing->status === 'published')
                && ! $listing->isExpired(),
        ];
    }
}
