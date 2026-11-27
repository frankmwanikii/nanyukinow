<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\ListingMedia;
use App\Support\MediaLibrary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim($request->string('q')->toString());
        $source = $request->string('source')->toString();
        $view = $request->string('view')->toString() === 'list' ? 'list' : 'grid';
        $sort = $request->string('sort')->toString();

        $allowedSources = ['listings', 'stories', 'avatars', 'branding', 'pages', 'site'];
        if (! in_array($source, $allowedSources, true)) {
            $source = '';
        }

        $allowedSorts = ['newest', 'oldest', 'name', 'size', 'kind'];
        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'newest';
        }

        $all = MediaLibrary::items();

        $counts = $all
            ->groupBy('source')
            ->map->count()
            ->all();

        if ($source !== '') {
            $all = $all->filter(fn (array $item) => $item['source'] === $source)->values();
        }

        if ($q !== '') {
            $needle = mb_strtolower($q);
            $all = $all->filter(function (array $item) use ($needle) {
                $hay = mb_strtolower(implode(' ', [
                    $item['filename'] ?? '',
                    $item['url'] ?? '',
                    $item['kind'] ?? '',
                    $item['source'] ?? '',
                    implode(' ', $item['sources'] ?? []),
                ]));

                return str_contains($hay, $needle);
            })->values();
        }

        $all = (match ($sort) {
            'oldest' => $all->sortBy(fn (array $item) => $item['updated_at'] ?? ''),
            'name' => $all->sortBy(fn (array $item) => mb_strtolower((string) ($item['filename'] ?? ''))),
            'size' => $all->sortByDesc(fn (array $item) => $item['size'] ?? -1),
            'kind' => $all->sortBy(function (array $item) {
                return mb_strtolower(trim(($item['kind'] ?? '').' '.($item['filename'] ?? '')));
            }),
            default => $all->sortByDesc(fn (array $item) => $item['updated_at'] ?? ''),
        })->values();

        $total = $all->count();
        // Admin gallery shows the full library in one view (no page cap).
        $perPage = max(1, $total);

        $paginator = new LengthAwarePaginator(
            $all,
            $total,
            $perPage,
            1,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
        );

        return Inertia::render('Admin/Gallery/Index', [
            'media' => $paginator,
            'filters' => [
                'q' => $q,
                'source' => $source,
                'view' => $view,
                'sort' => $sort,
            ],
            'counts' => [
                'all' => array_sum($counts),
                ...$counts,
            ],
            'sortOptions' => [
                ['value' => 'newest', 'label' => 'Newest first'],
                ['value' => 'oldest', 'label' => 'Oldest first'],
                ['value' => 'name', 'label' => 'Name A to Z'],
                ['value' => 'size', 'label' => 'Largest first'],
                ['value' => 'kind', 'label' => 'Type'],
            ],
            'sources' => [
                ['key' => '', 'label' => 'All'],
                ['key' => 'listings', 'label' => 'Listings'],
                ['key' => 'stories', 'label' => 'Stories'],
                ['key' => 'avatars', 'label' => 'Avatars'],
                ['key' => 'branding', 'label' => 'Branding'],
                ['key' => 'pages', 'label' => 'Pages'],
                ['key' => 'site', 'label' => 'Site assets'],
            ],
        ]);
    }

    /**
     * Lightweight JSON browse for media pickers (listing form, etc.).
     */
    public function browse(Request $request): JsonResponse
    {
        $q = trim($request->string('q')->toString());

        $all = MediaLibrary::items();

        if ($q !== '') {
            $needle = mb_strtolower($q);
            $all = $all->filter(function (array $item) use ($needle) {
                $hay = mb_strtolower(implode(' ', [
                    $item['filename'] ?? '',
                    $item['url'] ?? '',
                    $item['kind'] ?? '',
                    $item['source'] ?? '',
                    implode(' ', $item['sources'] ?? []),
                ]));

                return str_contains($hay, $needle);
            })->values();
        }

        $items = $all->map(fn (array $item) => [
            'id' => $item['id'],
            'url' => $item['url'],
            'filename' => $item['filename'],
            'source' => $item['source'],
            'kind' => $item['kind'],
        ])->values();

        return response()->json([
            'items' => $items,
            'total' => $items->count(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'images' => ['required', 'array', 'min:1', 'max:20'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:10240'],
        ]);

        $uploaded = 0;
        foreach ($data['images'] as $file) {
            ListingMedia::store($file, 'media/library');
            $uploaded++;
        }

        return redirect()
            ->route('admin.gallery.index')
            ->with('success', $uploaded === 1 ? '1 image uploaded.' : "{$uploaded} images uploaded.");
    }

    public function destroy(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'url' => ['required', 'string', 'max:2048'],
        ]);

        $result = MediaLibrary::delete($data['url']);

        return redirect()
            ->back()
            ->with($result['ok'] ? 'success' : 'error', $result['message']);
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'urls' => ['required', 'array', 'min:1', 'max:100'],
            'urls.*' => ['required', 'string', 'max:2048'],
        ]);

        $ok = 0;
        $fail = 0;
        foreach (array_values(array_unique($data['urls'])) as $url) {
            $result = MediaLibrary::delete($url);
            if ($result['ok']) {
                $ok++;
            } else {
                $fail++;
            }
        }

        if ($ok > 0 && $fail === 0) {
            $message = $ok === 1 ? '1 item deleted.' : "{$ok} items deleted.";
            $tone = 'success';
        } elseif ($ok > 0) {
            $message = "Deleted {$ok} item(s), but {$fail} could not be deleted.";
            $tone = 'error';
        } else {
            $message = 'Could not delete the selected item(s).';
            $tone = 'error';
        }

        return redirect()->back()->with($tone, $message);
    }
}
