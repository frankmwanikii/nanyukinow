<?php

namespace App\Support;

use App\Models\Listing;

class ListingOutbound
{
    /**
     * Normalize a URL to an absolute http(s) value, or null if unusable.
     */
    public static function normalize(?string $url): ?string
    {
        if ($url === null) {
            return null;
        }

        $trimmed = trim($url);
        if ($trimmed === '') {
            return null;
        }

        if (! preg_match('#^https?://#i', $trimmed)) {
            $trimmed = 'https://'.$trimmed;
        }

        if (! filter_var($trimmed, FILTER_VALIDATE_URL)) {
            return null;
        }

        $scheme = strtolower((string) parse_url($trimmed, PHP_URL_SCHEME));
        if (! in_array($scheme, ['http', 'https'], true)) {
            return null;
        }

        return $trimmed;
    }

    /**
     * All outbound website URLs allowed for a listing (primary + extra links).
     *
     * @return list<array{url: string, label: string}>
     */
    public static function linksFor(Listing $listing): array
    {
        $links = [];

        $primary = self::normalize($listing->website);
        if ($primary) {
            $links[] = [
                'url' => $primary,
                'label' => 'Website',
            ];
        }

        $extra = $listing->social_links['links'] ?? [];
        if (is_array($extra)) {
            foreach ($extra as $item) {
                if (! is_array($item)) {
                    continue;
                }
                $url = self::normalize($item['url'] ?? null);
                if (! $url) {
                    continue;
                }
                $label = filled($item['label'] ?? null)
                    ? (string) $item['label']
                    : 'Website';
                $links[] = [
                    'url' => $url,
                    'label' => $label,
                ];
            }
        }

        // De-dupe by normalized URL, keep first label.
        $seen = [];
        $unique = [];
        foreach ($links as $link) {
            $key = strtolower($link['url']);
            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            $unique[] = $link;
        }

        return $unique;
    }

    /**
     * Resolve a requested URL against the listing allow-list.
     *
     * @return array{url: string, label: string}|null
     */
    public static function resolve(Listing $listing, ?string $requested = null): ?array
    {
        $links = self::linksFor($listing);
        if ($links === []) {
            return null;
        }

        $normalized = self::normalize($requested);
        if ($normalized) {
            foreach ($links as $link) {
                if (strcasecmp($link['url'], $normalized) === 0) {
                    return $link;
                }
            }
        }

        return $links[0];
    }
}
