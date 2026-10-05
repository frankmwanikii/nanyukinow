<?php

namespace App\Support;

class EatDrinkTierFeatures
{
    public const FREE_DESCRIPTION_WORD_LIMIT = 150;

    public const FREE_CUISINE_TAG_LIMIT = 2;

    /** @var array<string, int> */
    public const GALLERY_LIMITS = [
        Membership::FREE => 3,
        Membership::STANDARD => 10,
        Membership::PREMIUM => 30,
    ];

    /**
     * Detail keys → minimum membership tier.
     *
     * @var array<string, string>
     */
    public const DETAIL_MIN_TIER = [
        'cuisine' => Membership::FREE,
        'payments' => Membership::STANDARD,
        'dietary' => Membership::STANDARD,
        'delivery_options' => Membership::STANDARD,
        'menus' => Membership::STANDARD,
        'reservations' => Membership::STANDARD,
        'video_url' => Membership::PREMIUM,
        'video_title' => Membership::PREMIUM,
        'booking_url' => Membership::PREMIUM,
        'deals' => Membership::PREMIUM,
        'event_schedule' => Membership::PREMIUM,
        'avg_meal' => Membership::PREMIUM,
        'capacity' => Membership::PREMIUM,
        'dress_code' => Membership::PREMIUM,
    ];

    public static function galleryLimit(?string $tier): int
    {
        $tier = Membership::normalize($tier);

        return self::GALLERY_LIMITS[$tier] ?? self::GALLERY_LIMITS[Membership::FREE];
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

    public static function cuisineTagLimit(?string $tier): int
    {
        return self::tierMeets($tier, Membership::STANDARD)
            ? 20
            : self::FREE_CUISINE_TAG_LIMIT;
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
     * Strip Eat & Drink fields the listing tier cannot use.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public static function applyToPayload(array $payload, ?string $tier, ?string $categoryKey): array
    {
        if ($categoryKey !== 'eatDrink') {
            return $payload;
        }

        $tier = Membership::normalize($tier);
        $details = is_array($payload['details'] ?? null) ? $payload['details'] : [];

        foreach (self::DETAIL_MIN_TIER as $key => $required) {
            if (! self::tierMeets($tier, $required)) {
                unset($details[$key]);
            }
        }

        if (array_key_exists('cuisine', $details)) {
            $details['cuisine'] = self::normalizeCuisine($details['cuisine'], $tier);
        }

        if (! self::tierMeets($tier, Membership::STANDARD)) {
            $payload['latitude'] = null;
            $payload['longitude'] = null;
            $payload['email'] = null;
            $payload['whatsapp'] = null;
            $payload['website'] = null;
            $payload['social_links'] = self::stripSocialLinks($payload['social_links'] ?? null);
        }

        if (isset($payload['gallery']) && is_array($payload['gallery'])) {
            $payload['gallery'] = array_values(array_slice(
                $payload['gallery'],
                0,
                self::galleryLimit($tier),
            ));
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
     * @return list<string>|string
     */
    public static function normalizeCuisine(mixed $cuisine, ?string $tier): array|string
    {
        $tags = [];

        if (is_array($cuisine)) {
            $tags = array_values(array_filter(array_map(
                fn ($item) => is_string($item) ? trim($item) : '',
                $cuisine,
            )));
        } elseif (is_string($cuisine) && trim($cuisine) !== '') {
            $tags = array_values(array_filter(array_map(
                'trim',
                preg_split('/[,|]+/', $cuisine) ?: [],
            )));
        }

        $tags = array_slice($tags, 0, self::cuisineTagLimit($tier));

        return $tags;
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
