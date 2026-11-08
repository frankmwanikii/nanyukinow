<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class ListingMedia
{
    public static function store(UploadedFile $file, string $folder = 'listings'): string
    {
        return WebpConverter::storeAsWebp($file, $folder);
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
}
