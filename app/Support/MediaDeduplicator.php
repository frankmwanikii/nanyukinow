<?php

namespace App\Support;

use App\Models\Listing;
use App\Models\SitePage;
use App\Models\SiteSetting;
use App\Models\Story;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class MediaDeduplicator
{
    public const INDEX_PATH = 'listings/.content-hashes.json';

    /**
     * Folders scanned for duplicate listing media.
     *
     * @var list<string>
     */
    public const SCAN_FOLDERS = [
        'listings/covers',
        'listings/logos',
        'listings/posters',
        'listings/gallery',
        'listings/editor',
        'listings/claims',
    ];

    /**
     * If another stored file already has the same bytes, delete this one and
     * return the existing URL. Otherwise register the hash and keep the URL.
     */
    public static function dedupeStoredUrl(string $url): string
    {
        $relative = self::relativeFromUrl($url);
        if ($relative === null) {
            return $url;
        }

        $disk = Storage::disk('public');
        if (! $disk->exists($relative)) {
            return $url;
        }

        $hash = self::hashRelative($relative);
        if ($hash === null) {
            return $url;
        }

        $index = self::loadIndex();
        $existing = $index[$hash] ?? null;

        if (is_string($existing) && $existing !== '' && $existing !== $relative && $disk->exists($existing)) {
            $disk->delete($relative);

            return '/storage/'.$existing;
        }

        $index[$hash] = $relative;
        self::saveIndex($index);

        return '/storage/'.$relative;
    }

    /**
     * Collapse identical files under listings/* onto one path, rewrite DB refs,
     * and rebuild the content-hash index.
     *
     * @return array{
     *     groups: int,
     *     files_removed: int,
     *     refs_rewritten: int,
     *     kept: int,
     *     scanned: int
     * }
     */
    public static function collapseDuplicates(bool $dryRun = false): array
    {
        $disk = Storage::disk('public');
        $byHash = [];

        foreach (self::SCAN_FOLDERS as $folder) {
            if (! $disk->exists($folder)) {
                continue;
            }
            foreach ($disk->allFiles($folder) as $path) {
                if (! self::isImagePath($path)) {
                    continue;
                }
                $hash = self::hashRelative($path);
                if ($hash === null) {
                    continue;
                }
                $byHash[$hash][] = $path;
            }
        }

        $referenced = self::referencedStorageUrls();
        $index = [];
        $groups = 0;
        $removed = 0;
        $rewritten = 0;
        $kept = 0;
        $scanned = 0;

        foreach ($byHash as $hash => $paths) {
            $paths = array_values(array_unique($paths));
            $scanned += count($paths);
            $keeper = self::chooseKeeper($paths, $referenced);
            $index[$hash] = $keeper;
            $kept++;

            if (count($paths) < 2) {
                continue;
            }

            $groups++;
            $keeperUrl = '/storage/'.$keeper;

            foreach ($paths as $path) {
                if ($path === $keeper) {
                    continue;
                }

                $fromUrl = '/storage/'.$path;
                if (! $dryRun) {
                    $rewritten += self::replaceUrlReferences($fromUrl, $keeperUrl);
                    if ($disk->exists($path)) {
                        $disk->delete($path);
                    }
                } else {
                    if (isset($referenced[$fromUrl])) {
                        $rewritten++;
                    }
                }
                $removed++;
            }
        }

        if (! $dryRun) {
            self::saveIndex($index);
        }

        return [
            'groups' => $groups,
            'files_removed' => $removed,
            'refs_rewritten' => $rewritten,
            'kept' => $kept,
            'scanned' => $scanned,
        ];
    }

    /**
     * @param  list<string>  $paths
     * @param  array<string, true>  $referenced
     */
    private static function chooseKeeper(array $paths, array $referenced): string
    {
        foreach ($paths as $path) {
            if (isset($referenced['/storage/'.$path])) {
                return $path;
            }
        }

        $disk = Storage::disk('public');
        usort($paths, function (string $a, string $b) use ($disk): int {
            $aTime = $disk->exists($a) ? $disk->lastModified($a) : 0;
            $bTime = $disk->exists($b) ? $disk->lastModified($b) : 0;
            if ($aTime === $bTime) {
                return strcmp($a, $b);
            }

            return $aTime <=> $bTime;
        });

        return $paths[0];
    }

    /**
     * @return array<string, true>
     */
    public static function referencedStorageUrls(): array
    {
        $urls = [];
        $mark = function (?string $url) use (&$urls): void {
            $url = ListingMedia::normalizePublicUrl($url);
            if ($url !== null && str_starts_with($url, '/storage/')) {
                $urls[$url] = true;
            }
        };

        Listing::query()
            ->orderBy('id')
            ->get(['image_url', 'logo_url', 'event_poster_url', 'gallery', 'details'])
            ->each(function (Listing $listing) use ($mark): void {
                $mark($listing->image_url);
                $mark($listing->logo_url);
                $mark($listing->event_poster_url);
                foreach ($listing->gallery ?? [] as $entry) {
                    $mark(ListingGallery::entryUrl($entry));
                }
                self::walkStrings($listing->details, $mark);
            });

        Story::query()
            ->whereNotNull('image_url')
            ->orderBy('id')
            ->get(['image_url'])
            ->each(fn (Story $story) => $mark($story->image_url));

        User::query()
            ->whereNotNull('avatar_url')
            ->orderBy('id')
            ->get(['avatar_url'])
            ->each(fn (User $user) => $mark($user->avatar_url));

        SiteSetting::query()
            ->get(['value'])
            ->each(function (SiteSetting $setting) use ($mark): void {
                if (is_string($setting->value)) {
                    $mark($setting->value);
                }
            });

        SitePage::query()
            ->orderBy('id')
            ->get(['content'])
            ->each(function (SitePage $page) use ($mark): void {
                self::walkStrings($page->content, $mark);
            });

        return $urls;
    }

    /**
     * Rewrite every DB reference from one /storage/ URL to another.
     */
    public static function replaceUrlReferences(string $from, string $to): int
    {
        if ($from === $to) {
            return 0;
        }

        $changed = 0;

        $changed += Listing::query()->where('image_url', $from)->update(['image_url' => $to]);
        $changed += Listing::query()->where('logo_url', $from)->update(['logo_url' => $to]);
        $changed += Listing::query()->where('event_poster_url', $from)->update(['event_poster_url' => $to]);

        Listing::query()
            ->whereNotNull('gallery')
            ->orderBy('id')
            ->chunkById(100, function ($listings) use ($from, $to, &$changed): void {
                foreach ($listings as $listing) {
                    $gallery = $listing->gallery ?? [];
                    if (! is_array($gallery) || $gallery === []) {
                        continue;
                    }
                    $next = self::replaceInGallery($gallery, $from, $to);
                    if ($next !== $gallery) {
                        $listing->gallery = $next;
                        $listing->save();
                        $changed++;
                    }
                }
            });

        Listing::query()
            ->whereNotNull('details')
            ->orderBy('id')
            ->chunkById(100, function ($listings) use ($from, $to, &$changed): void {
                foreach ($listings as $listing) {
                    $details = $listing->details;
                    if (! is_array($details)) {
                        continue;
                    }
                    $next = self::replaceInDeep($details, $from, $to);
                    if ($next !== $details) {
                        $listing->details = $next;
                        $listing->save();
                        $changed++;
                    }
                }
            });

        $changed += Story::query()->where('image_url', $from)->update(['image_url' => $to]);
        $changed += User::query()->where('avatar_url', $from)->update(['avatar_url' => $to]);
        $changed += SiteSetting::query()->where('value', $from)->update(['value' => $to]);

        SitePage::query()
            ->orderBy('id')
            ->chunkById(50, function ($pages) use ($from, $to, &$changed): void {
                foreach ($pages as $page) {
                    $content = is_array($page->content) ? $page->content : [];
                    $next = self::replaceInDeep($content, $from, $to);
                    if ($next !== $content) {
                        $page->content = $next;
                        $page->save();
                        $changed++;
                    }
                }
            });

        return $changed;
    }

    /**
     * @param  list<mixed>  $gallery
     * @return list<mixed>
     */
    private static function replaceInGallery(array $gallery, string $from, string $to): array
    {
        $out = [];
        foreach ($gallery as $entry) {
            if (is_string($entry)) {
                $out[] = $entry === $from ? $to : $entry;

                continue;
            }
            if (! is_array($entry)) {
                continue;
            }
            $next = $entry;
            if (($next['src'] ?? null) === $from) {
                $next['src'] = $to;
            }
            if (($next['url'] ?? null) === $from) {
                $next['url'] = $to;
            }
            $out[] = $next;
        }

        return $out;
    }

    private static function replaceInDeep(mixed $value, string $from, string $to): mixed
    {
        if (is_string($value)) {
            return $value === $from ? $to : $value;
        }
        if (! is_array($value)) {
            return $value;
        }

        $out = [];
        foreach ($value as $key => $child) {
            $out[$key] = self::replaceInDeep($child, $from, $to);
        }

        return $out;
    }

    /**
     * @param  callable(?string): void  $mark
     */
    private static function walkStrings(mixed $value, callable $mark): void
    {
        if (is_string($value)) {
            $mark($value);

            return;
        }
        if (! is_array($value)) {
            return;
        }
        foreach ($value as $child) {
            self::walkStrings($child, $mark);
        }
    }

    public static function relativeFromUrl(string $url): ?string
    {
        $normalized = ListingMedia::normalizePublicUrl($url);
        if ($normalized === null || ! str_starts_with($normalized, '/storage/')) {
            return null;
        }

        $relative = substr($normalized, strlen('/storage/'));

        return $relative !== '' ? $relative : null;
    }

    public static function hashRelative(string $relative): ?string
    {
        $disk = Storage::disk('public');
        if (! $disk->exists($relative)) {
            return null;
        }

        try {
            $absolute = $disk->path($relative);
        } catch (\Throwable) {
            return null;
        }

        if (! is_file($absolute)) {
            return null;
        }

        $hash = hash_file('sha256', $absolute);

        return is_string($hash) && $hash !== '' ? $hash : null;
    }

    /**
     * @return array<string, string>
     */
    public static function loadIndex(): array
    {
        $disk = Storage::disk('public');
        if (! $disk->exists(self::INDEX_PATH)) {
            return [];
        }

        $raw = $disk->get(self::INDEX_PATH);
        $decoded = json_decode($raw ?: '[]', true);

        if (! is_array($decoded)) {
            return [];
        }

        $out = [];
        foreach ($decoded as $hash => $path) {
            if (is_string($hash) && is_string($path) && $hash !== '' && $path !== '') {
                $out[$hash] = $path;
            }
        }

        return $out;
    }

    /**
     * @param  array<string, string>  $index
     */
    public static function saveIndex(array $index): void
    {
        $disk = Storage::disk('public');
        $folder = dirname(self::INDEX_PATH);
        if (! $disk->exists($folder)) {
            $disk->makeDirectory($folder);
        }

        $disk->put(
            self::INDEX_PATH,
            json_encode($index, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
        );
    }

    private static function isImagePath(string $path): bool
    {
        return (bool) preg_match('/\.(jpe?g|png|webp|gif|avif)$/i', $path);
    }
}
