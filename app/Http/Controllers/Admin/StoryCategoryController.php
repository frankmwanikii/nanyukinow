<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Story;
use App\Models\StoryCategory;
use App\Support\AdminPagination;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class StoryCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = AdminPagination::perPage($request);

        $categories = StoryCategory::query()
            ->withCount('stories')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (StoryCategory $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'sort_order' => $category->sort_order,
                'stories_count' => $category->stories_count,
                'updated_at' => $category->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('Admin/StoryCategories/Index', [
            'categories' => $categories,
            'filters' => [
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $slug = Str::slug($data['name']);
        if ($slug === '') {
            return back()->withErrors(['name' => 'Enter a valid category name.'])->withInput();
        }

        if (StoryCategory::query()->where('slug', $slug)->exists()) {
            return back()->withErrors(['name' => 'That category already exists.'])->withInput();
        }

        StoryCategory::query()->create([
            'name' => $data['name'],
            'slug' => $slug,
            'sort_order' => $data['sort_order'] ?? ((int) StoryCategory::query()->max('sort_order') + 1),
        ]);

        return back()->with('success', 'Story category created.');
    }

    public function update(Request $request, StoryCategory $storyCategory): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $slug = Str::slug($data['name']);
        if ($slug === '') {
            return back()->withErrors(['name' => 'Enter a valid category name.'])->withInput();
        }

        if (StoryCategory::query()->where('slug', $slug)->whereKeyNot($storyCategory->id)->exists()) {
            return back()->withErrors(['name' => 'That category already exists.'])->withInput();
        }

        $storyCategory->update([
            'name' => $data['name'],
            'slug' => $slug,
            'sort_order' => $data['sort_order'] ?? $storyCategory->sort_order,
        ]);

        Story::query()
            ->where('story_category_id', $storyCategory->id)
            ->update(['category' => $storyCategory->name]);

        return back()->with('success', 'Story category updated.');
    }

    public function destroy(StoryCategory $storyCategory): RedirectResponse
    {
        if ($storyCategory->stories()->exists()) {
            return back()->with('error', 'Move or delete stories in this category first.');
        }

        $storyCategory->delete();

        return redirect()
            ->route('admin.story-categories.index')
            ->with('success', 'Story category deleted.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'order' => ['required', 'array'],
            'order.*.id' => ['required', 'integer', 'exists:story_categories,id'],
            'order.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($data['order'] as $row) {
            StoryCategory::query()->whereKey($row['id'])->update(['sort_order' => $row['sort_order']]);
        }

        return back()->with('success', 'Story category order saved.');
    }
}
