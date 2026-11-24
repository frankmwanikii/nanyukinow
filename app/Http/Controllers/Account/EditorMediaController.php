<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Support\ListingMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class EditorMediaController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'image' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp,gif',
                'max:5120',
            ],
        ]);

        $url = ListingMedia::store($data['image'], 'listings/editor');

        return response()->json(['url' => $url], 201);
    }

    public function storeVideo(Request $request): JsonResponse
    {
        $data = $request->validate([
            'video' => [
                'required',
                'file',
                'mimetypes:video/mp4,video/webm,video/ogg,video/quicktime',
                'max:10240',
            ],
        ], [
            'video.max' => 'Videos must be 10MB or smaller.',
            'video.mimetypes' => 'Use an MP4, WebM, or OGG video.',
        ]);

        try {
            $url = ListingMedia::storeFile($data['video'], 'listings/videos');
        } catch (RuntimeException $e) {
            $message = str_contains($e->getMessage(), 'not writable')
                ? 'Could not save that video because storage is not writable. Please try again or contact support.'
                : 'Could not save that video. Try an MP4 or WebM under 10MB.';

            return response()->json([
                'message' => $message,
                'errors' => ['video' => [$message]],
            ], 422);
        }

        return response()->json(['url' => $url], 201);
    }

    /**
     * Browse images from the member's own listings (media picker).
     */
    public function browse(Request $request): JsonResponse
    {
        $q = trim($request->string('q')->toString());
        $limit = min(48, max(12, $request->integer('limit', 36)));
        $userId = $request->user()->id;

        $byUrl = [];

        Listing::query()
            ->where('user_id', $userId)
            ->orderByDesc('updated_at')
            ->get(['id', 'title', 'image_url', 'logo_url', 'event_poster_url', 'gallery'])
            ->each(function (Listing $listing) use (&$byUrl): void {
                $push = function (?string $url, string $kind) use (&$byUrl): void {
                    $url = is_string($url) ? trim($url) : '';
                    if ($url === '' || isset($byUrl[$url])) {
                        return;
                    }
                    $byUrl[$url] = [
                        'id' => md5($url),
                        'url' => $url,
                        'filename' => basename(parse_url($url, PHP_URL_PATH) ?: $url),
                        'source' => 'listings',
                        'kind' => $kind,
                    ];
                };

                $push($listing->image_url, 'cover');
                $push($listing->logo_url, 'logo');
                $push($listing->event_poster_url, 'poster');
                foreach ($listing->gallery ?? [] as $galleryUrl) {
                    $push(is_string($galleryUrl) ? $galleryUrl : null, 'gallery');
                }
            });

        $items = collect(array_values($byUrl));

        if ($q !== '') {
            $needle = mb_strtolower($q);
            $items = $items->filter(function (array $item) use ($needle) {
                $hay = mb_strtolower(implode(' ', [
                    $item['filename'] ?? '',
                    $item['url'] ?? '',
                    $item['kind'] ?? '',
                ]));

                return str_contains($hay, $needle);
            })->values();
        }

        $total = $items->count();

        return response()->json([
            'items' => $items->take($limit)->values(),
            'total' => $total,
        ]);
    }
}
