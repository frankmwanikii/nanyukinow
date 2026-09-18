<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\Location;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function index(): Response
    {
        $locations = Location::query()
            ->ordered()
            ->get()
            ->map(function (Location $location) {
                return [
                    'id' => $location->id,
                    'name' => $location->name,
                    'slug' => $location->slug,
                    'sort_order' => $location->sort_order,
                    'is_active' => $location->is_active,
                    'listings_count' => Listing::query()->where('location', $location->name)->count(),
                    'updated_at' => $location->updated_at?->toIso8601String(),
                ];
            });

        return Inertia::render('Admin/Locations/Index', [
            'locations' => $locations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120', 'unique:locations,slug'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $data['slug'] = Str::slug($data['slug'] ?: $data['name']);
        $data['sort_order'] = $data['sort_order'] ?? 0;
        $data['is_active'] = $request->boolean('is_active', true);

        Location::query()->create($data);

        return back()->with('success', 'Location created.');
    }

    public function update(Request $request, Location $location): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120', Rule::unique('locations', 'slug')->ignore($location->id)],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $previousName = $location->name;
        $data['slug'] = Str::slug($data['slug'] ?: $data['name']);
        $data['sort_order'] = $data['sort_order'] ?? $location->sort_order;
        $data['is_active'] = $request->boolean('is_active', $location->is_active);

        $location->update($data);

        if ($previousName !== $location->name) {
            Listing::query()
                ->where('location', $previousName)
                ->update(['location' => $location->name]);
        }

        return back()->with('success', 'Location updated.');
    }

    public function destroy(Location $location): RedirectResponse
    {
        if (Listing::query()->where('location', $location->name)->exists()) {
            return back()->with('error', 'Move or retag listings in this location first.');
        }

        $location->delete();

        return back()->with('success', 'Location deleted.');
    }
}
