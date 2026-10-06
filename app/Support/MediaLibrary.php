<?php

namespace App\Support;

use App\Models\Listing;
use App\Models\SitePage;
use App\Models\SiteSetting;
use App\Models\Story;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaLibrary
{
    /**
     * Collect every image used across the site into a deduped library.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public static function items(): Collection
    {
        /** @var array<string, array<string, mixed>> $byUrl */
        $byUrl = [];

        $push = function (
            ?string $url,
            string $source,
            string $kind,
            string $label,
            ?string $editHref = null,
            ?string $updatedAt = null,
        ) use (&$byUrl): void {
            $url = self::normalizeUrl($url);
            if ($url === null) {
                return;
            }

            if (! isset($byUrl[$url])) {
                $byUrl[$url] = [
                    'id' => md5($url),
                    'url' => $url,
                    'filename' => self::filename($url),
                    'source' => $source,
                    'kind' => $kind,
                    'sources' => [],
                    'edit_href' => $editHref,
                    'can_delete' => self::isDeletable($url),
                    'size' => self::fileSize($url),
                    'updated_at' => $updatedAt,
                ];
            }

            $byUrl[$url]['sources'][] = $label;
            if ($editHref && empty($byUrl[$url]['edit_href'])) {
                $byUrl[$url]['edit_href'] = $editHref;
            }
            if ($updatedAt && (
                empty($byUrl[$url]['updated_at'])
                || strcmp((string) $updatedAt, (string) $byUrl[$url]['updated_at']) > 0
            )) {
                $byUrl[$url]['updated_at'] = $updatedAt;
            }
        };

        Listing::query()
            ->orderByDesc('updated_at')
            ->get(['id', 'title', 'slug', 'image_url', 'logo_url', 'event_poster_url', 'gallery', 'updated_at'])
            ->each(function (Listing $listing) use ($push): void {
                $edit = route('admin.listings.edit', $listing->slug);
                $updated = $listing->updated_at?->toIso8601String();
                $title = $listing->title ?: 'Untitled';

                $push($listing->image_url, 'listings', 'cover', "Listing · {$title} (cover)", $edit, $updated);
                $push($listing->logo_url, 'listings', 'logo', "Listing · {$title} (logo)", $edit, $updated);
                $push($listing->event_poster_url, 'listings', 'poster', "Listing · {$title} (poster)", $edit, $updated);

                foreach ($listing->gallery ?? [] as $galleryUrl) {
                    $push(
                        ListingGallery::entryUrl($galleryUrl),
                        'listings',
                        'gallery',
                        "Listing · {$title} (gallery)",
                        $edit,
                        $updated,
                    );
                }
            });

        Story::query()
            ->orderByDesc('updated_at')
            ->get(['id', 'title', 'image_url', 'updated_at'])
            ->each(function (Story $story) use ($push): void {
                $push(
                    $story->image_url,
                    'stories',
                    'story',
                    'Story · '.($story->title ?: 'Untitled'),
                    route('admin.stories.edit', $story),
                    $story->updated_at?->toIso8601String(),
                );
            });

        User::query()
            ->whereNotNull('avatar_url')
            ->where('avatar_url', '!=', '')
            ->orderByDesc('updated_at')
            ->get(['id', 'name', 'avatar_url', 'updated_at'])
            ->each(function (User $user) use ($push): void {
                $push(
                    $user->avatar_url,
                    'avatars',
                    'avatar',
                    'Avatar · '.($user->name ?: 'User'),
                    route('admin.users.index'),
                    $user->updated_at?->toIso8601String(),
                );
            });

        SiteSetting::query()
            ->where(function ($query): void {
                $query->where('type', 'image')
                    ->orWhereIn('key', ['logo_url', 'favicon_url', 'og_image', 'hero_image']);
            })
            ->get(['key', 'label', 'value', 'updated_at'])
            ->each(function (SiteSetting $setting) use ($push): void {
                $push(
                    is_string($setting->value) ? $setting->value : null,
                    'branding',
                    'branding',
                    'Settings · '.($setting->label ?: $setting->key),
                    route('admin.settings.index'),
                    $setting->updated_at?->toIso8601String(),
                );
            });

        SitePage::query()
            ->get(['id', 'slug', 'title', 'content', 'updated_at'])
            ->each(function (SitePage $page) use ($push): void {
                $content = is_array($page->content) ? $page->content : [];
                foreach (['hero_image', 'og_image', 'image', 'cover_image'] as $field) {
                    if (empty($content[$field]) || ! is_string($content[$field])) {
                        continue;
                    }
                    $push(
                        $content[$field],
                        'pages',
                        'page',
                        'Page · '.($page->title ?: $page->slug)." ({$field})",
                        route('admin.pages.edit', $page),
                        $page->updated_at?->toIso8601String(),
                    );
                }
            });

        // Disk files under public storage (covers orphans / editor uploads).
        foreach (self::diskImages() as $diskItem) {
            $url = $diskItem['url'];
            if (isset($byUrl[$url])) {
                continue;
            }
            $byUrl[$url] = [
                'id' => md5($url),
                'url' => $url,
                'filename' => $diskItem['filename'],
                'source' => $diskItem['source'],
                'kind' => 'file',
                'sources' => ['Storage · '.$diskItem['folder']],
                'edit_href' => null,
                'can_delete' => true,
                'size' => $diskItem['size'],
                'updated_at' => $diskItem['updated_at'],
            ];
        }

        // Bundled public/images assets shown on the site.
        foreach (self::publicImages() as $publicItem) {
            $url = $publicItem['url'];
            if (isset($byUrl[$url])) {
                continue;
            }
            $byUrl[$url] = [
                'id' => md5($url),
                'url' => $url,
                'filename' => $publicItem['filename'],
                'source' => 'site',
                'kind' => 'site',
                'sources' => ['Site assets'],
                'edit_href' => null,
                'can_delete' => false,
                'size' => $publicItem['size'],
                'updated_at' => $publicItem['updated_at'],
            ];
        }

        return collect(array_values($byUrl))
            ->map(function (array $item) {
                $item['sources'] = array_values(array_unique($item['sources']));
                $item['size_label'] = self::formatSize($item['size'] ?? null);

                return $item;
            })
            ->sortByDesc(fn (array $item) => $item['updated_at'] ?? '')
            ->values();
    }

    /**
     * Remove an image from storage and clear DB references.
     *
     * @return array{ok: bool, message: string}
     */
    public static function delete(string $url): array
    {
        $url = self::normalizeUrl($url);
        if ($url === null) {
            return ['ok' => false, 'message' => 'Missing media path.'];
        }

        if (! self::isDeletable($url)) {
            return ['ok' => false, 'message' => 'This asset cannot be deleted from the gallery.'];
        }

        self::detachReferences($url);
        ListingMedia::delete($url);

        return ['ok' => true, 'message' => 'Media deleted.'];
    }

    public static function detachReferences(string $url): void
    {
        Listing::query()->where('image_url', $url)->update(['image_url' => null]);
        Listing::query()->where('logo_url', $url)->update(['logo_url' => null]);
        Listing::query()->where('event_poster_url', $url)->update(['event_poster_url' => null]);

        Listing::query()
            ->whereNotNull('gallery')
            ->orderBy('id')
            ->chunkById(100, function ($listings) use ($url): void {
                foreach ($listings as $listing) {
                    $gallery = $listing->gallery ?? [];
                    if (! is_array($gallery) || $gallery === []) {
                        continue;
                    }
                    $next = array_values(array_filter(
                        $gallery,
                        function ($item) use ($url) {
                            $itemUrl = ListingGallery::entryUrl($item);

                            return $itemUrl !== null && $itemUrl !== $url;
                        },
                    ));
                    if (count($next) !== count($gallery)) {
                        $listing->gallery = $next;
                        $listing->save();
                    }
                }
            });

        Story::query()->where('image_url', $url)->update(['image_url' => null]);
        User::query()->where('avatar_url', $url)->update(['avatar_url' => null]);

        SiteSetting::query()
            ->where('value', $url)
            ->get()
            ->each(function (SiteSetting $setting): void {
                $setting->value = '';
                $setting->save();
            });

        SitePage::query()
            ->orderBy('id')
            ->chunkById(50, function ($pages) use ($url): void {
                foreach ($pages as $page) {
                    $content = is_array($page->content) ? $page->content : [];
                    $changed = false;
                    foreach (['hero_image', 'og_image', 'image', 'cover_image'] as $field) {
                        if (($content[$field] ?? null) === $url) {
                            $content[$field] = '';
                            $changed = true;
                        }
                    }
                    if ($changed) {
                        $page->content = $content;
                        $page->save();
                    }
                }
            });
    }

    public static function normalizeUrl(?string $url): ?string
    {
        if ($url === null) {
            return null;
        }

        $url = trim($url);
        if ($url === '' || Str::startsWith($url, 'data:')) {
            return null;
        }

        // Keep absolute http(s) URLs as-is; local paths should start with /
        if (Str::startsWith($url, ['http://', 'https://'])) {
            return $url;
        }

        if (! Str::startsWith($url, '/')) {
            $url = '/'.$url;
        }

        return $url;
    }

    public static function isDeletable(string $url): bool
    {
        return str_contains($url, '/storage/');
    }

    public static function filename(string $url): string
    {
        $path = parse_url($url, PHP_URL_PATH) ?: $url;

        return basename($path) ?: $url;
    }

    public static function formatSize(?int $bytes): ?string
    {
        if ($bytes === null || $bytes < 0) {
            return null;
        }
        if ($bytes < 1024) {
            return $bytes.' B';
        }
        if ($bytes < 1024 * 1024) {
            return round($bytes / 1024, 1).' KB';
        }

        return round($bytes / (1024 * 1024), 1).' MB';
    }

    private static function fileSize(string $url): ?int
    {
        $relative = self::storageRelative($url);
        if ($relative && Storage::disk('public')->exists($relative)) {
            return Storage::disk('public')->size($relative);
        }

        if (Str::startsWith($url, '/') && ! Str::startsWith($url, '/storage/')) {
            $path = public_path(ltrim($url, '/'));
            if (is_file($path)) {
                return filesize($path) ?: null;
            }
        }

        return null;
    }

    private static function storageRelative(string $url): ?string
    {
        $marker = '/storage/';
        $pos = strpos($url, $marker);
        if ($pos === false) {
            return null;
        }

        $relative = substr($url, $pos + strlen($marker));

        return $relative !== '' ? $relative : null;
    }

    /**
     * @return list<array{url: string, filename: string, source: string, folder: string, size: ?int, updated_at: ?string}>
     */
    private static function diskImages(): array
    {
        $disk = Storage::disk('public');
        $folders = ['listings', 'avatars', 'media'];
        $out = [];

        foreach ($folders as $folder) {
            if (! $disk->exists($folder)) {
                continue;
            }
            foreach ($disk->allFiles($folder) as $path) {
                if (! self::isImagePath($path)) {
                    continue;
                }
                $url = '/storage/'.$path;
                $out[] = [
                    'url' => $url,
                    'filename' => basename($path),
                    'source' => Str::startsWith($path, 'avatars/') ? 'avatars' : 'listings',
                    'folder' => dirname($path),
                    'size' => $disk->exists($path) ? $disk->size($path) : null,
                    'updated_at' => $disk->exists($path)
                        ? date('c', $disk->lastModified($path))
                        : null,
                ];
            }
        }

        return $out;
    }

    /**
     * @return list<array{url: string, filename: string, size: ?int, updated_at: ?string}>
     */
    private static function publicImages(): array
    {
        $root = public_path('images');
        if (! is_dir($root)) {
            return [];
        }

        $out = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if (! $file->isFile()) {
                continue;
            }
            $path = $file->getPathname();
            if (! self::isImagePath($path)) {
                continue;
            }
            $relative = Str::after($path, public_path().DIRECTORY_SEPARATOR);
            $url = '/'.str_replace(DIRECTORY_SEPARATOR, '/', $relative);
            $out[] = [
                'url' => $url,
                'filename' => $file->getFilename(),
                'size' => $file->getSize() ?: null,
                'updated_at' => date('c', $file->getMTime()),
            ];
        }

        return $out;
    }

    private static function isImagePath(string $path): bool
    {
        return (bool) preg_match('/\.(jpe?g|png|webp|gif|svg|avif|ico)$/i', $path);
    }
}
