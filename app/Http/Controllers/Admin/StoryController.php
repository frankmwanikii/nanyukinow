<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Story;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StoryController extends Controller
{
    public function index(Request $request): Response
    {
        $stories = Story::query()
            ->when($request->filled('q'), function ($query) use ($request) {
                $q = '%'.$request->string('q').'%';
                $query->where(function ($inner) use ($q) {
                    $inner->where('title', 'like', $q)
                        ->orWhere('category', 'like', $q)
                        ->orWhere('slug', 'like', $q);
                });
            })
            ->when($request->string('status')->toString() === 'published', fn ($q) => $q->where('is_published', true))
            ->when($request->string('status')->toString() === 'draft', fn ($q) => $q->where('is_published', false))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Story $story) => [
                'id' => $story->id,
                'title' => $story->title,
                'slug' => $story->slug,
                'category' => $story->category,
                'author' => $story->author,
                'image_url' => $story->image_url,
                'is_published' => $story->is_published,
                'published_at' => $story->published_at?->toIso8601String(),
                'updated_at' => $story->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('Admin/Stories/Index', [
            'stories' => $stories,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Stories/Form', [
            'story' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $story = Story::query()->create($this->validated($request));

        return redirect()
            ->route('admin.stories.edit', $story)
            ->with('success', 'Story created.');
    }

    public function edit(Story $story): Response
    {
        return Inertia::render('Admin/Stories/Form', [
            'story' => [
                'id' => $story->id,
                'title' => $story->title,
                'slug' => $story->slug,
                'category' => $story->category,
                'excerpt' => $story->excerpt,
                'image_url' => $story->image_url,
                'author' => $story->author,
                'read_minutes' => $story->read_minutes,
                'body' => $story->body,
                'sections' => $story->sections ?? [],
                'pro_tip' => $story->pro_tip,
                'is_published' => $story->is_published,
                'published_at' => $story->published_at?->format('Y-m-d\TH:i'),
            ],
        ]);
    }

    public function update(Request $request, Story $story): RedirectResponse
    {
        $story->update($this->validated($request, $story));

        return redirect()
            ->route('admin.stories.edit', $story)
            ->with('success', 'Story updated.');
    }

    public function destroy(Story $story): RedirectResponse
    {
        $story->delete();

        return redirect()
            ->route('admin.stories.index')
            ->with('success', 'Story deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Story $story = null): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('stories', 'slug')->ignore($story?->id)],
            'category' => ['nullable', 'string', 'max:120'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'author' => ['nullable', 'string', 'max:120'],
            'read_minutes' => ['nullable', 'integer', 'min:1', 'max:120'],
            'body' => ['nullable', 'string'],
            'sections' => ['nullable', 'array'],
            'pro_tip' => ['nullable', 'string'],
            'is_published' => ['boolean'],
            'published_at' => ['nullable', 'date'],
        ]);

        $data['slug'] = Str::slug($data['slug'] ?: $data['title']);
        $data['user_id'] = $request->user()->id;
        $data['is_published'] = (bool) ($data['is_published'] ?? false);
        $data['read_minutes'] = $data['read_minutes'] ?? 5;

        if ($data['is_published'] && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        return $data;
    }
}
