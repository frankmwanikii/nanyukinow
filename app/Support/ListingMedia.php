<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ListingMedia
{
    public static function store(UploadedFile $file, string $folder = 'listings'): string
    {
        return WebpConverter::storeAsWebp($file, $folder);
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
