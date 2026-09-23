<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Listing;
use App\Support\AdminPagination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = AdminPagination::perPage($request);

        $categories = Category::query()
            ->withCount('listings')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'sort_order' => $category->sort_order,
                'listings_count' => $category->listings_count,
                'updated_at' => $category->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
            'filters' => [
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Categories/Form', [
            'category' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $data['slug'] = Str::slug($data['name']);
        $data['sort_order'] = $data['sort_order'] ?? 0;

        Category::query()->create($data);

        return back()->with('success', 'Category created.');
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('Admin/Categories/Form', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'sort_order' => $category->sort_order,
            ],
        ]);
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $data['sort_order'] = $data['sort_order'] ?? $category->sort_order;

        $category->update($data);

        return back()->with('success', 'Category updated.');
    }

    public function listings(Category $category): JsonResponse
    {
        $listings = Listing::query()
            ->where('category_id', $category->id)
            ->orderByDesc('updated_at')
            ->limit(100)
            ->get(['id', 'title', 'slug', 'status', 'tier', 'image_url', 'location', 'updated_at'])
            ->map(fn (Listing $listing) => [
                'id' => $listing->id,
                'title' => $listing->title ?: 'Untitled',
                'slug' => $listing->slug,
                'status' => $listing->status,
                'tier' => $listing->tier,
                'image_url' => $listing->image_url,
                'location' => $listing->location,
                'edit_href' => route('admin.listings.edit', $listing->slug),
                'updated_at' => $listing->updated_at?->toIso8601String(),
            ]);

        return response()->json([
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
            ],
            'listings' => $listings,
        ]);
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->listings()->exists()) {
            return back()->with('error', 'Move or delete listings in this category first.');
        }

        $category->delete();

        return redirect()
            ->route('admin.categories.index')
            ->with('success', 'Category deleted.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'order' => ['required', 'array'],
            'order.*.id' => ['required', 'integer', 'exists:categories,id'],
            'order.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($data['order'] as $row) {
            Category::query()->whereKey($row['id'])->update(['sort_order' => $row['sort_order']]);
        }

        return back()->with('success', 'Category order saved.');
    }
}
