<?php

namespace App\Support;

class StayTierFeatures
{
    public const FREE_DESCRIPTION_WORD_LIMIT = 150;

    public const ROOM_SPACE_COUNT = 7;

    /** @var array<string, int> */
    public const GALLERY_PER_ROOM_LIMITS = [
        Membership::FREE => 0,
        Membership::STANDARD => 15,
        Membership::PREMIUM => 30,
    ];

    /** @var array<string, int> */
    public const GALLERY_LIMITS = [
        Membership::FREE => 0,
        Membership::STANDARD => 15 * self::ROOM_SPACE_COUNT,
        Membership::PREMIUM => 30 * self::ROOM_SPACE_COUNT,
    ];

    /**
     * Detail keys → minimum membership tier.
     *
     * @var array<string, string>
     */
    public const DETAIL_MIN_TIER = [
        'guests' => Membership::FREE,
        'rooms' => Membership::FREE,
        'beds' => Membership::FREE,
        'baths' => Membership::FREE,
        'check_in' => Membership::STANDARD,
        'check_out' => Membership::STANDARD,
        'nightly_rate' => Membership::STANDARD,
        'meal_plan' => Membership::STANDARD,
        'house_rules' => Membership::STANDARD,
        'payments' => Membership::STANDARD,
        'cancellation_policy' => Membership::STANDARD,
        'video_url' => Membership::PREMIUM,
        'video_title' => Membership::PREMIUM,
        'booking_url' => Membership::PREMIUM,
        'included' => Membership::PREMIUM,
        'deals' => Membership::PREMIUM,
        'nearby_attractions' => Membership::PREMIUM,
        'host_name' => Membership::PREMIUM,
        'host_bio' => Membership::PREMIUM,
        'host_photo' => Membership::PREMIUM,
    ];

    public static function galleryLimit(?string $tier): int
    {
        $tier = Membership::normalize($tier);

        return self::GALLERY_LIMITS[$tier] ?? self::GALLERY_LIMITS[Membership::FREE];
    }

    public static function galleryPerRoomLimit(?string $tier): int
    {
        $tier = Membership::normalize($tier);

        return self::GALLERY_PER_ROOM_LIMITS[$tier]
            ?? self::GALLERY_PER_ROOM_LIMITS[Membership::FREE];
    }

    public static function tierMeets(?string $current, string $required): bool
    {
        $rank = [
            Membership::FREE => 0,
            Membership::STANDARD => 1,
            Membership::PREMIUM => 2,
        ];

        $currentRank = $rank[Membership::normalize($current)] ?? 0;
        $requiredRank = $rank[Membership::normalize($required)] ?? 0;

        return $currentRank >= $requiredRank;
    }

    public static function descriptionWordLimit(?string $tier): ?int
    {
        return self::tierMeets($tier, Membership::STANDARD)
            ? null
            : self::FREE_DESCRIPTION_WORD_LIMIT;
    }

    public static function wordCount(?string $html): int
    {
        if ($html === null || trim($html) === '') {
            return 0;
        }

        $text = preg_replace('/<[^>]+>/', ' ', $html) ?? '';
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/u', ' ', trim($text)) ?? '';

        if ($text === '') {
            return 0;
        }

        return count(preg_split('/\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY) ?: []);
    }

    /**
     * Strip Stay fields the listing tier cannot use.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public static function applyToPayload(array $payload, ?string $tier, ?string $categoryKey): array
    {
        if ($categoryKey !== 'stay') {
            return $payload;
        }

        $tier = Membership::normalize($tier);
        $details = is_array($payload['details'] ?? null) ? $payload['details'] : [];

        foreach (self::DETAIL_MIN_TIER as $key => $required) {
            if (! self::tierMeets($tier, $required)) {
                unset($details[$key]);
            }
        }

        if (! self::tierMeets($tier, Membership::STANDARD)) {
            $payload['latitude'] = null;
            $payload['longitude'] = null;
            $payload['whatsapp'] = null;
            $payload['website'] = null;
            $payload['amenities'] = [];
            $payload['hours'] = null;
            $payload['social_links'] = self::stripSocialLinks($payload['social_links'] ?? null);
        }

        if (isset($payload['gallery']) && is_array($payload['gallery'])) {
            $payload['gallery'] = self::normalizeGallery($payload['gallery'], $tier);
        }

        $wordLimit = self::descriptionWordLimit($tier);
        if ($wordLimit !== null && isset($payload['description'])) {
            $payload['description'] = self::truncateHtmlWords(
                (string) $payload['description'],
                $wordLimit,
            );
        }

        if (isset($payload['price_range']) && ! self::tierMeets($tier, Membership::STANDARD)) {
            if ($payload['price_range'] === '$$$$') {
                $payload['price_range'] = '$$$';
            }
        }

        $payload['details'] = $details === [] ? null : $details;

        return $payload;
    }

    /**
     * @param  list<mixed>  $gallery
     * @return list<string|array{src: string, label: string, kind: string}>
     */
    public static function normalizeGallery(array $gallery, ?string $tier): array
    {
        $perRoom = self::galleryPerRoomLimit($tier);
        $totalLimit = self::galleryLimit($tier);

        if ($perRoom === 0 || $totalLimit === 0) {
            return [];
        }

        $byKind = [];

        foreach ($gallery as $entry) {
            if (is_string($entry) && trim($entry) !== '') {
                $kind = 'exterior';
                $byKind[$kind] ??= [];
                $byKind[$kind][] = trim($entry);

                continue;
            }

            if (! is_array($entry)) {
                continue;
            }

            $src = isset($entry['src']) && is_string($entry['src'])
                ? trim($entry['src'])
                : (isset($entry['url']) && is_string($entry['url']) ? trim($entry['url']) : '');

            if ($src === '') {
                continue;
            }

            $kind = isset($entry['kind']) && is_string($entry['kind'])
                ? trim($entry['kind'])
                : 'exterior';
            $kind = $kind !== '' ? $kind : 'exterior';
            $label = isset($entry['label']) && is_string($entry['label']) && trim($entry['label']) !== ''
                ? trim($entry['label'])
                : self::spaceLabel($kind);

            $byKind[$kind] ??= [];
            $byKind[$kind][] = [
                'src' => $src,
                'label' => $label,
                'kind' => $kind,
            ];
        }

        $normalized = [];

        foreach ($byKind as $items) {
            foreach (array_slice(array_values($items), 0, $perRoom) as $item) {
                $normalized[] = $item;
            }
        }

        return array_values(array_slice($normalized, 0, $totalLimit));
    }

    public static function spaceLabel(string $kind): string
    {
        return match ($kind) {
            'bedroom' => 'Bedroom',
            'bathroom' => 'Bathroom',
            'kitchen' => 'Kitchen',
            'living' => 'Living room',
            'dining' => 'Dining',
            'outdoor' => 'Outdoor',
            'exterior' => 'Exterior',
            default => 'Exterior',
        };
    }

    /**
     * @param  array<string, mixed>|null  $social
     * @return array<string, mixed>|null
     */
    private static function stripSocialLinks(?array $social): ?array
    {
        if ($social === null) {
            return null;
        }

        return [
            'instagram' => null,
            'facebook' => null,
            'tiktok' => null,
            'youtube' => null,
            'links' => [],
        ];
    }

    private static function truncateHtmlWords(string $html, int $limit): string
    {
        if (self::wordCount($html) <= $limit) {
            return $html;
        }

        $text = preg_replace('/<[^>]+>/', ' ', $html) ?? '';
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/u', ' ', trim($text)) ?? '';
        $words = preg_split('/\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $kept = array_slice($words, 0, $limit);

        return '<p>'.e(implode(' ', $kept)).'</p>';
    }
}
