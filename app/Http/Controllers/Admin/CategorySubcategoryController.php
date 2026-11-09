<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\CategorySubcategory;
use App\Models\Listing;
use App\Support\CategoryTaxonomy;
use App\Support\ListingSubcategories;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategorySubcategoryController extends Controller
{
    public function index(Category $category): JsonResponse
    {
        $rows = $category->subcategories()
            ->get(['id', 'name', 'sort_order', 'updated_at'])
            ->map(fn (CategorySubcategory $row) => [
                'id' => $row->id,
                'name' => $row->name,
                'sort_order' => $row->sort_order,
                'updated_at' => $row->updated_at?->toIso8601String(),
            ])
            ->values();

        return response()->json([
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
            ],
            'subcategories' => $rows,
        ]);
    }

    public function store(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:120',
                Rule::unique('category_subcategories', 'name')->where(
                    fn ($query) => $query->where('category_id', $category->id),
                ),
            ],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $row = $category->subcategories()->create([
            'name' => trim($data['name']),
            'sort_order' => $data['sort_order'] ?? ((int) $category->subcategories()->max('sort_order') + 1),
        ]);

        CategoryTaxonomy::forgetCache();

        return response()->json([
            'subcategory' => [
                'id' => $row->id,
                'name' => $row->name,
                'sort_order' => $row->sort_order,
                'updated_at' => $row->updated_at?->toIso8601String(),
            ],
        ], 201);
    }

    public function update(
        Request $request,
        Category $category,
        CategorySubcategory $subcategory,
    ): JsonResponse {
        abort_unless($subcategory->category_id === $category->id, 404);

        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:120',
                Rule::unique('category_subcategories', 'name')
                    ->where(fn ($query) => $query->where('category_id', $category->id))
                    ->ignore($subcategory->id),
            ],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $oldName = $subcategory->name;
        $newName = trim($data['name']);

        $subcategory->update([
            'name' => $newName,
            'sort_order' => $data['sort_order'] ?? $subcategory->sort_order,
        ]);

        if ($oldName !== $newName) {
            $this->rewriteListingLabels($category->id, $oldName, $newName);
        }

        CategoryTaxonomy::forgetCache();

        return response()->json([
            'subcategory' => [
                'id' => $subcategory->id,
                'name' => $subcategory->name,
                'sort_order' => $subcategory->sort_order,
                'updated_at' => $subcategory->updated_at?->toIso8601String(),
            ],
        ]);
    }

    public function destroy(Category $category, CategorySubcategory $subcategory): JsonResponse
    {
        abort_unless($subcategory->category_id === $category->id, 404);

        $name = $subcategory->name;
        $subcategory->delete();
        $this->stripListingLabel($category->id, $name);
        CategoryTaxonomy::forgetCache();

        return response()->json(['ok' => true]);
    }

    private function rewriteListingLabels(int $categoryId, string $oldName, string $newName): void
    {
        Listing::query()
            ->where('category_id', $categoryId)
            ->orderBy('id')
            ->chunkById(100, function ($listings) use ($oldName, $newName) {
                foreach ($listings as $listing) {
                    $labels = ListingSubcategories::normalize($listing->subcategory);
                    if (! in_array($oldName, $labels, true)) {
                        continue;
                    }

                    $updated = [];
                    foreach ($labels as $label) {
                        $next = $label === $oldName ? $newName : $label;
                        if ($next !== '' && ! in_array($next, $updated, true)) {
                            $updated[] = $next;
                        }
                    }

                    $listing->subcategory = $updated === [] ? null : $updated;
                    $listing->save();
                }
            });
    }

    private function stripListingLabel(int $categoryId, string $name): void
    {
        Listing::query()
            ->where('category_id', $categoryId)
            ->orderBy('id')
            ->chunkById(100, function ($listings) use ($name) {
                foreach ($listings as $listing) {
                    $labels = ListingSubcategories::normalize($listing->subcategory);
                    if (! in_array($name, $labels, true)) {
                        continue;
                    }

                    $updated = array_values(array_filter(
                        $labels,
                        fn (string $label) => $label !== $name,
                    ));

                    $listing->subcategory = $updated === [] ? null : $updated;
                    $listing->save();
                }
            });
    }
}
