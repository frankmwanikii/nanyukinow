<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;

class ListingGallery
{
    /**
     * Normalize gallery_urls from the form (strings and/or {src,label,kind} objects)
     * and newly uploaded files with optional per-file meta.
     *
     * @param  list<mixed>  $entries
     * @param  list<UploadedFile|null>  $files
     * @param  list<mixed>  $fileMeta
     * @param  list<mixed>  $existingGallery  Current listing gallery; unchanged remotes skip re-import
     * @return list<string|array{src: string, label: string, kind: string}>
     */
    public static function fromRequest(
        array $entries,
        array $files = [],
        array $fileMeta = [],
        array $existingGallery = [],
    ): array {
        $gallery = [];
        $knownUrls = [];
        foreach ($existingGallery as $existing) {
            $existingUrl = self::entryUrl($existing);
            if ($existingUrl !== null) {
                $knownUrls[$existingUrl] = true;
            }
        }

        foreach ($entries as $entry) {
            if (is_string($entry) && trim($entry) !== '') {
                $raw = trim($entry);
                $url = ListingMedia::persistPublicUrl(
                    $raw,
                    'listings/gallery',
                    isset($knownUrls[$raw]) ? $raw : null,
                );
                if ($url) {
                    $gallery[] = $url;
                }

                continue;
            }

            if (! is_array($entry)) {
                continue;
            }

            $src = isset($entry['src']) && is_string($entry['src'])
                ? trim($entry['src'])
                : (isset($entry['url']) && is_string($entry['url']) ? trim($entry['url']) : '');

            $src = ListingMedia::persistPublicUrl(
                $src,
                'listings/gallery',
                ($src !== '' && isset($knownUrls[$src])) ? $src : null,
            ) ?? '';

            if ($src === '') {
                continue;
            }

            $kind = isset($entry['kind']) && is_string($entry['kind']) && trim($entry['kind']) !== ''
                ? trim($entry['kind'])
                : 'exterior';
            $label = isset($entry['label']) && is_string($entry['label']) && trim($entry['label']) !== ''
                ? trim($entry['label'])
                : StayTierFeatures::spaceLabel($kind);

            $gallery[] = [
                'src' => $src,
                'label' => $label,
                'kind' => $kind,
            ];
        }

        foreach (array_values($files) as $index => $file) {
            if (! $file) {
                continue;
            }

            $url = ListingMedia::storeOrFail($file, 'listings/gallery', 'gallery_files');
            $meta = is_array($fileMeta[$index] ?? null) ? $fileMeta[$index] : null;

            if ($meta !== null) {
                $kind = isset($meta['kind']) && is_string($meta['kind']) && trim($meta['kind']) !== ''
                    ? trim($meta['kind'])
                    : 'exterior';
                $label = isset($meta['label']) && is_string($meta['label']) && trim($meta['label']) !== ''
                    ? trim($meta['label'])
                    : StayTierFeatures::spaceLabel($kind);

                $gallery[] = [
                    'src' => $url,
                    'label' => $label,
                    'kind' => $kind,
                ];
            } else {
                $gallery[] = $url;
            }
        }

        return $gallery;
    }

    /**
     * Extract a storage URL from a gallery entry (string or object).
     */
    public static function entryUrl(mixed $entry): ?string
    {
        if (is_string($entry) && trim($entry) !== '') {
            return trim($entry);
        }

        if (! is_array($entry)) {
            return null;
        }

        if (isset($entry['src']) && is_string($entry['src']) && trim($entry['src']) !== '') {
            return trim($entry['src']);
        }

        if (isset($entry['url']) && is_string($entry['url']) && trim($entry['url']) !== '') {
            return trim($entry['url']);
        }

        return null;
    }
}
