<?php

namespace App\Support;

use App\Models\Listing;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class ListingMedia
{
    public static function store(UploadedFile $file, string $folder = 'listings'): string
    {
        return MediaDeduplicator::dedupeStoredUrl(
            WebpConverter::storeAsWebp($file, $folder),
        );
    }

    /**
     * Store a non-image upload as-is (videos, PDFs, etc.) under public disk.
     */
    public static function storeFile(UploadedFile $file, string $folder = 'listings'): string
    {
        $ext = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'bin');
        $ext = preg_replace('/[^a-z0-9]/', '', $ext) ?: 'bin';
        $path = trim($folder, '/').'/'.Str::uuid().'.'.$ext;

        if (! Storage::disk('public')->putFileAs(dirname($path), $file, basename($path))) {
            throw new RuntimeException('Could not write upload to public storage.');
        }

        return '/storage/'.$path;
    }

    /**
     * Store an upload, or raise a field-level validation error the form can show.
     */
    public static function storeOrFail(UploadedFile $file, string $folder, string $field): string
    {
        try {
            return self::store($file, $folder);
        } catch (RuntimeException $e) {
            $message = str_contains($e->getMessage(), 'not writable')
                ? 'Could not save that image because storage is not writable. Please try again or contact support.'
                : 'Could not save that image. Try JPG, PNG, or WebP under 15 MB.';

            throw ValidationException::withMessages([
                $field => $message,
            ]);
        }
    }

    /**
     * Keep only displayable, persistable media URLs. Drops incomplete /storage/
     * placeholders and browser-only blob/data URLs that must never hit the DB.
     */
    public static function normalizePublicUrl(?string $url): ?string
    {
        if (! filled($url)) {
            return null;
        }

        $trimmed = trim($url);

        if ($trimmed === '' || $trimmed === '/storage' || $trimmed === '/storage/') {
            return null;
        }

        if (str_starts_with($trimmed, 'blob:') || str_starts_with($trimmed, 'data:')) {
            return null;
        }

        return $trimmed;
    }

    /**
     * Whether the URL is a remote http(s) image that still needs local import.
     */
    public static function isRemoteHttpUrl(?string $url): bool
    {
        $normalized = self::normalizePublicUrl($url);

        return $normalized !== null
            && (str_starts_with($normalized, 'http://')
                || str_starts_with($normalized, 'https://'));
    }

    /**
     * Normalize a media URL and, for remote http(s) sources (Instagram CDN, etc.),
     * copy into local public storage when possible so long CDN query strings never
     * blow out DB columns and hotlinks do not expire.
     *
     * Pass $previousUrl from the listing being updated so unchanged remotes are not
     * re-downloaded on every save (failed imports otherwise retry forever).
     */
    public static function persistPublicUrl(
        ?string $url,
        string $folder = 'listings',
        ?string $previousUrl = null,
    ): ?string {
        $normalized = self::normalizePublicUrl($url);
        if ($normalized === null) {
            return null;
        }

        if (str_starts_with($normalized, '/storage/')) {
            return $normalized;
        }

        $previous = self::normalizePublicUrl($previousUrl);
        if ($previous !== null && $normalized === $previous) {
            return $previous;
        }

        if (str_starts_with($normalized, 'http://') || str_starts_with($normalized, 'https://')) {
            return self::importFromUrl($normalized, $folder) ?? $normalized;
        }

        return $normalized;
    }

    /**
     * Download a remote image into local public storage (WebP when convertible).
     */
    public static function importFromUrl(string $url, string $folder = 'listings'): ?string
    {
        if (! self::isSafeRemoteUrl($url)) {
            return null;
        }

        try {
            $response = Http::timeout(12)
                ->withHeaders([
                    'Accept' => 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
                    'User-Agent' => 'Mozilla/5.0 (compatible; NanyukiNow/1.0; +https://nanyuki.now)',
                ])
                ->get($url);
        } catch (Throwable) {
            return null;
        }

        if (! $response->successful()) {
            return null;
        }

        $body = $response->body();
        if ($body === '' || strlen($body) > 15 * 1024 * 1024) {
            return null;
        }

        $mime = strtolower((string) ($response->header('Content-Type') ?: ''));
        $mime = explode(';', $mime)[0];
        $ext = match ($mime) {
            'image/jpeg', 'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            default => self::extensionFromUrl($url),
        };

        if (! $ext) {
            return null;
        }

        $path = trim($folder, '/').'/'.Str::uuid().'.'.$ext;
        if (! Storage::disk('public')->put($path, $body)) {
            return null;
        }

        $converted = WebpConverter::convertStored($path);
        $relative = is_string($converted) && $converted !== '' ? $converted : $path;

        return MediaDeduplicator::dedupeStoredUrl('/storage/'.$relative);
    }

    private static function extensionFromUrl(string $url): ?string
    {
        $path = parse_url($url, PHP_URL_PATH);
        if (! is_string($path) || $path === '') {
            return null;
        }

        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        return in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'], true)
            ? ($ext === 'jpeg' ? 'jpg' : $ext)
            : null;
    }

    private static function isSafeRemoteUrl(string $url): bool
    {
        $parts = parse_url($url);
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));
        $host = strtolower((string) ($parts['host'] ?? ''));

        if (! in_array($scheme, ['http', 'https'], true) || $host === '') {
            return false;
        }

        if ($host === 'localhost' || str_ends_with($host, '.localhost') || $host === '0.0.0.0') {
            return false;
        }

        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return filter_var(
                $host,
                FILTER_VALIDATE_IP,
                FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE,
            ) !== false;
        }

        return true;
    }

    public static function delete(?string $url): void
    {
        if (! $url) {
            return;
        }

        $marker = '/storage/';
        $pos = strpos($url, $marker);
        if ($pos === false) {
            return;
        }

        $relative = substr($url, $pos + strlen($marker));
        if ($relative !== '' && Storage::disk('public')->exists($relative)) {
            Storage::disk('public')->delete($relative);
        }
    }

    /**
     * @param  list<string|null>  $urls
     */
    public static function deleteMany(array $urls): void
    {
        foreach ($urls as $url) {
            static::delete($url);
        }
    }

    /**
     * Import remote cover/logo/poster/gallery URLs for one listing into /storage/.
     * Does not touch details JSON. Returns counts; caller may persist when changed.
     *
     * @return array{
     *     changed: bool,
     *     imported: int,
     *     failed: int,
     *     skipped: int,
     *     image_url: ?string,
     *     logo_url: ?string,
     *     event_poster_url: ?string,
     *     gallery: list<mixed>
     * }
     */
    public static function localizeListingRemoteMedia(Listing $listing): array
    {
        $imported = 0;
        $failed = 0;
        $skipped = 0;

        $localize = function (?string $url, string $folder) use (&$imported, &$failed, &$skipped): ?string {
            $normalized = self::normalizePublicUrl($url);
            if ($normalized === null) {
                return null;
            }

            if (! self::isRemoteHttpUrl($normalized)) {
                $skipped++;

                return $normalized;
            }

            $local = self::importFromUrl($normalized, $folder);
            if ($local !== null) {
                $imported++;

                return $local;
            }

            $failed++;

            return $normalized;
        };

        $imageUrl = $localize($listing->image_url, 'listings/covers');
        $logoUrl = $localize($listing->logo_url, 'listings/logos');
        $posterUrl = $localize($listing->event_poster_url, 'listings/posters');

        $gallery = [];
        foreach (is_array($listing->gallery) ? $listing->gallery : [] as $entry) {
            if (is_string($entry)) {
                $gallery[] = $localize($entry, 'listings/gallery');

                continue;
            }

            if (! is_array($entry)) {
                continue;
            }

            $src = null;
            if (isset($entry['src']) && is_string($entry['src']) && trim($entry['src']) !== '') {
                $src = trim($entry['src']);
            } elseif (isset($entry['url']) && is_string($entry['url']) && trim($entry['url']) !== '') {
                $src = trim($entry['url']);
            }

            $next = $localize($src, 'listings/gallery');
            if ($next === null || $next === '') {
                continue;
            }

            $gallery[] = [
                ...$entry,
                'src' => $next,
            ];
        }

        $changed = $imageUrl !== self::normalizePublicUrl($listing->image_url)
            || $logoUrl !== self::normalizePublicUrl($listing->logo_url)
            || $posterUrl !== self::normalizePublicUrl($listing->event_poster_url)
            || json_encode($gallery) !== json_encode($listing->gallery ?? []);

        return [
            'changed' => $changed,
            'imported' => $imported,
            'failed' => $failed,
            'skipped' => $skipped,
            'image_url' => $imageUrl,
            'logo_url' => $logoUrl,
            'event_poster_url' => $posterUrl,
            'gallery' => array_values(array_filter(
                $gallery,
                static fn ($item) => $item !== null && $item !== '',
            )),
        ];
    }

    /**
     * For events, one flyer is both poster and cover. Prefer poster when set.
     *
     * @return array{0: ?string, 1: ?string} [imageUrl, posterUrl]
     */
    public static function syncEventCoverAndPoster(?string $imageUrl, ?string $posterUrl): array
    {
        if ($posterUrl) {
            return [$posterUrl, $posterUrl];
        }

        if ($imageUrl) {
            return [$imageUrl, $imageUrl];
        }

        return [null, null];
    }
}
