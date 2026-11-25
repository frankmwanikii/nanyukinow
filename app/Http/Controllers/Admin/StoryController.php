<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStoryRequest;
use App\Http\Requests\Admin\UpdateStoryRequest;
use App\Models\Story;
use App\Models\StoryCategory;
use App\Support\AdminPagination;
use App\Support\ListingMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class StoryController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = AdminPagination::perPage($request);
        $categoryId = $request->integer('category_id') ?: null;

        $stories = Story::query()
            ->with('storyCategory')
            ->when($request->filled('q'), function ($query) use ($request) {
                $q = '%'.$request->string('q').'%';
                $query->where(function ($inner) use ($q) {
                    $inner->where('title', 'like', $q)
                        ->orWhere('subtitle', 'like', $q)
                        ->orWhere('category', 'like', $q)
                        ->orWhere('slug', 'like', $q);
                });
            })
            ->when($request->string('status')->toString() === 'published', fn ($q) => $q->where('is_published', true))
            ->when($request->string('status')->toString() === 'draft', fn ($q) => $q->where('is_published', false))
            ->when($categoryId, fn ($q) => $q->where('story_category_id', $categoryId))
            ->latest()
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Story $story) => [
                'id' => $story->id,
                'title' => $story->title,
                'subtitle' => $story->subtitle,
                'slug' => $story->slug,
                'category' => $story->storyCategory?->name ?? $story->category,
                'author' => $story->author,
                'image_url' => $story->image_url,
                'is_published' => $story->is_published,
                'is_featured' => $story->is_featured,
                'published_at' => $story->published_at?->toIso8601String(),
                'updated_at' => $story->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('Admin/Stories/Index', [
            'stories' => $stories,
            'categories' => $this->categories(),
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
                'category_id' => $categoryId ? (string) $categoryId : '',
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Stories/Form', [
            'story' => null,
            'categories' => $this->categories(),
            'uploadUrl' => route('admin.stories.upload'),
            'editorUploadUrl' => route('admin.listings.editor-media'),
        ]);
    }

    public function store(StoreStoryRequest $request): RedirectResponse
    {
        $story = Story::query()->create($this->payload($request->validated(), $request->user()->id));

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
                'subtitle' => $story->subtitle,
                'slug' => $story->slug,
                'story_category_id' => $story->story_category_id,
                'category' => $story->category,
                'excerpt' => $story->excerpt,
                'image_url' => $story->image_url,
                'author' => $story->author,
                'read_minutes' => $story->read_minutes,
                'body' => $story->bodyHtml(),
                'sections' => $story->sections ?? [],
                'pro_tip' => $story->pro_tip,
                'is_published' => $story->is_published,
                'is_featured' => $story->is_featured,
                'published_at' => $story->published_at?->format('Y-m-d\TH:i'),
            ],
            'categories' => $this->categories(),
            'uploadUrl' => route('admin.stories.upload'),
            'editorUploadUrl' => route('admin.listings.editor-media'),
        ]);
    }

    public function update(UpdateStoryRequest $request, Story $story): RedirectResponse
    {
        $story->update($this->payload($request->validated()));

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

    public function upload(Request $request): JsonResponse
    {
        $data = $request->validate([
            'image' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp,gif',
                'max:10240',
            ],
        ], [
            'image.max' => 'Images must be 10MB or smaller.',
        ]);

        try {
            $url = ListingMedia::store($data['image'], 'stories/covers');
        } catch (RuntimeException $e) {
            $message = str_contains($e->getMessage(), 'not writable')
                ? 'Could not save that image because storage is not writable. Please try again or contact support.'
                : 'Could not save that image. Try JPG, PNG, or WebP under 10MB.';

            return response()->json([
                'message' => $message,
                'errors' => ['image' => [$message]],
            ], 422);
        }

        return response()->json(['url' => $url], 201);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function payload(array $data, ?int $userId = null): array
    {
        $category = null;
        if (! empty($data['story_category_id'])) {
            $category = StoryCategory::query()->find($data['story_category_id']);
        }

        $payload = [
            'title' => $data['title'],
            'subtitle' => isset($data['subtitle']) ? (trim((string) $data['subtitle']) ?: null) : null,
            'slug' => Str::slug(($data['slug'] ?? '') !== '' ? $data['slug'] : $data['title']),
            'story_category_id' => $category?->id,
            'category' => $category?->name,
            'excerpt' => $data['excerpt'] ?? null,
            'image_url' => $data['image_url'] ?? null,
            'author' => $data['author'] ?? null,
            'read_minutes' => $data['read_minutes'] ?? 5,
            'body' => Story::normalizeBodyHtml($data['body'] ?? null),
            'sections' => $this->normalizeSections($data['sections'] ?? []),
            'pro_tip' => $data['pro_tip'] ?? null,
            'is_published' => (bool) ($data['is_published'] ?? false),
            'is_featured' => (bool) ($data['is_featured'] ?? false),
            'published_at' => $data['published_at'] ?? null,
        ];

        if ($userId !== null) {
            $payload['user_id'] = $userId;
        }

        if ($payload['is_published'] && empty($payload['published_at'])) {
            $payload['published_at'] = now();
        }

        return $payload;
    }

    /**
     * @param  array<int, mixed>|null  $sections
     * @return list<array<string, mixed>>
     */
    private function normalizeSections(?array $sections): array
    {
        if (! is_array($sections)) {
            return [];
        }

        $normalized = [];

        foreach ($sections as $section) {
            if (! is_array($section)) {
                continue;
            }

            $title = trim((string) ($section['title'] ?? ''));
            $paragraphs = array_values(array_filter(
                array_map(
                    static fn ($p): string => trim((string) $p),
                    is_array($section['paragraphs'] ?? null) ? $section['paragraphs'] : [],
                ),
                static fn (string $p): bool => $p !== '',
            ));

            $list = [];
            foreach (is_array($section['list'] ?? null) ? $section['list'] : [] as $item) {
                if (! is_array($item)) {
                    continue;
                }
                $itemTitle = trim((string) ($item['title'] ?? ''));
                $itemText = trim((string) ($item['text'] ?? ''));
                if ($itemTitle === '' && $itemText === '') {
                    continue;
                }
                $list[] = [
                    'title' => $itemTitle,
                    'text' => $itemText,
                ];
            }

            $image = trim((string) ($section['image'] ?? ''));
            $imageAlt = trim((string) ($section['imageAlt'] ?? ''));
            $id = trim((string) ($section['id'] ?? ''));

            if ($title === '' && $paragraphs === [] && $list === [] && $image === '') {
                continue;
            }

            $row = [
                'id' => $id !== '' ? $id : Str::slug($title !== '' ? $title : 'section-'.(count($normalized) + 1)),
                'title' => $title,
                'paragraphs' => $paragraphs,
            ];

            if ($list !== []) {
                $row['list'] = $list;
            }
            if ($image !== '') {
                $row['image'] = $image;
            }
            if ($imageAlt !== '') {
                $row['imageAlt'] = $imageAlt;
            }

            $normalized[] = $row;
        }

        return $normalized;
    }

    /**
     * @return list<array{id: int, name: string}>
     */
    private function categories(): array
    {
        return StoryCategory::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (StoryCategory $category) => [
                'id' => $category->id,
                'name' => $category->name,
            ])
            ->all();
    }
}
