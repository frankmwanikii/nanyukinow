<?php

namespace App\Http\Controllers;

use App\Models\SitePage;
use App\Models\Story;
use App\Models\StoryCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoryController extends Controller
{
    public function index(Request $request): Response
    {
        $category = $request->string('category')->toString() ?: null;
        $q = $request->string('q')->toString() ?: null;

        $articles = Story::query()
            ->published()
            ->with('storyCategory')
            ->orderByDesc('published_at')
            ->get()
            ->map(fn (Story $story) => $story->toPublicArray())
            ->values()
            ->all();

        $categories = StoryCategory::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn (StoryCategory $cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
            ])
            ->values()
            ->all();

        return Inertia::render('Stories/Index', [
            'articles' => $articles,
            'categories' => $categories,
            'category' => $category,
            'q' => $q,
            'page' => SitePage::findBySlug('stories')?->toPublicArray(),
        ]);
    }

    public function show(string $slug): Response
    {
        $story = Story::query()
            ->published()
            ->with('storyCategory')
            ->where('slug', $slug)
            ->firstOrFail();

        $story->recordView();

        $categories = StoryCategory::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn (StoryCategory $cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
            ])
            ->values()
            ->all();

        return Inertia::render('Stories/Show', [
            'article' => $story->toPublicArray(),
            'popular' => Story::popular(5, $story->id),
            'adjacent' => $story->adjacent(),
            'categories' => $categories,
        ]);
    }
}
