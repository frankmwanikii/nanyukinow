<?php

namespace App\Support;

class StayTierFeatures
{
    public const FREE_DESCRIPTION_WORD_LIMIT = 150;

    public const ROOM_SPACE_COUNT = 7;

    /** @var array<string, int> */
    public const ROOM_TYPE_LIMITS = [
        Membership::FREE => 4,
        Membership::STANDARD => 8,
        Membership::PREMIUM => 12,
    ];

    /** @var array<string, int> */
    public const ROOM_TYPE_IMAGES_PER_ITEM = [
        Membership::FREE => 3,
        Membership::STANDARD => 5,
        Membership::PREMIUM => 8,
    ];

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
        'room_types' => Membership::FREE,
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

        if (array_key_exists('room_types', $details)) {
            $normalizedRoomTypes = self::normalizeRoomTypes($details['room_types'], $tier);
            if ($normalizedRoomTypes === []) {
                unset($details['room_types']);
            } else {
                $details['room_types'] = $normalizedRoomTypes;
            }
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

    public static function roomTypeLimit(?string $tier): int
    {
        $tier = Membership::normalize($tier);

        return self::ROOM_TYPE_LIMITS[$tier] ?? self::ROOM_TYPE_LIMITS[Membership::FREE];
    }

    public static function roomTypeImagesPerItem(?string $tier): int
    {
        $tier = Membership::normalize($tier);

        return self::ROOM_TYPE_IMAGES_PER_ITEM[$tier]
            ?? self::ROOM_TYPE_IMAGES_PER_ITEM[Membership::FREE];
    }

    /**
     * Coerce legacy string tags and rich cards into room-type rows.
     *
     * @return list<array{title: string, price: string, description: string, images: list<string>, amenities: list<string>}>
     */
    public static function normalizeRoomTypes(mixed $roomTypes, ?string $tier): array
    {
        $typeLimit = self::roomTypeLimit($tier);
        $imageLimit = self::roomTypeImagesPerItem($tier);

        if ($typeLimit === 0) {
            return [];
        }

        $raw = [];
        if (is_array($roomTypes)) {
            $raw = array_values($roomTypes);
        } elseif (is_string($roomTypes) && trim($roomTypes) !== '') {
            $raw = preg_split('/[,|]+/', $roomTypes) ?: [];
        }

        $normalized = [];

        foreach (array_slice($raw, 0, $typeLimit) as $item) {
            if (is_string($item)) {
                $title = trim($item);
                if ($title === '') {
                    continue;
                }
                $normalized[] = [
                    'title' => $title,
                    'price' => '',
                    'description' => '',
                    'images' => [],
                    'amenities' => [],
                ];

                continue;
            }

            if (! is_array($item)) {
                continue;
            }

            $images = [];
            if (isset($item['images']) && is_array($item['images'])) {
                foreach ($item['images'] as $url) {
                    if (is_string($url) && trim($url) !== '') {
                        $images[] = trim($url);
                    }
                }
            } elseif (isset($item['image']) && is_string($item['image']) && trim($item['image']) !== '') {
                $images[] = trim($item['image']);
            }

            $images = array_values(array_unique(array_slice($images, 0, $imageLimit)));
            $title = '';
            foreach (['title', 'name', 'label'] as $key) {
                if (isset($item[$key]) && is_string($item[$key]) && trim($item[$key]) !== '') {
                    $title = trim($item[$key]);
                    break;
                }
            }
            $price = '';
            foreach (['price', 'rate', 'amount'] as $key) {
                if (isset($item[$key]) && (is_string($item[$key]) || is_numeric($item[$key]))) {
                    $price = trim((string) $item[$key]);
                    if ($price !== '') {
                        break;
                    }
                }
            }
            $description = '';
            foreach (['description', 'note', 'summary'] as $key) {
                if (isset($item[$key]) && is_string($item[$key]) && trim($item[$key]) !== '') {
                    $description = trim($item[$key]);
                    break;
                }
            }
            if (mb_strlen($description) > 500) {
                $description = rtrim(mb_substr($description, 0, 500));
            }

            $amenities = self::normalizeRoomTypeAmenities($item['amenities'] ?? null);

            if ($title === '' && $price === '' && $description === '' && $images === [] && $amenities === []) {
                continue;
            }

            $normalized[] = [
                'title' => $title,
                'price' => $price,
                'description' => $description,
                'images' => $images,
                'amenities' => $amenities,
            ];
        }

        return $normalized;
    }

    /**
     * @return list<string>
     */
    public static function normalizeRoomTypeAmenities(mixed $amenities): array
    {
        if (! is_array($amenities)) {
            return [];
        }

        $slugs = [];

        foreach ($amenities as $entry) {
            $slug = '';
            if (is_string($entry)) {
                $slug = trim($entry);
            } elseif (is_array($entry) && isset($entry['slug']) && is_string($entry['slug'])) {
                $slug = trim($entry['slug']);
            }

            if ($slug === '' || in_array($slug, $slugs, true)) {
                continue;
            }

            $slugs[] = $slug;

            if (count($slugs) >= 40) {
                break;
            }
        }

        return $slugs;
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
            'restaurant' => 'Restaurant',
            'outdoor' => 'Outdoor',
            'exterior' => 'Exterior',
            default => self::humanizeSpaceKind($kind),
        };
    }

    public static function humanizeSpaceKind(string $kind): string
    {
        $kind = trim($kind);

        if ($kind === '') {
            return 'Room';
        }

        $label = str_replace(['-', '_'], ' ', $kind);
        $label = preg_replace('/\s+/u', ' ', $label) ?? $label;

        return $label !== ''
            ? mb_convert_case($label, MB_CASE_TITLE, 'UTF-8')
            : 'Room';
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
