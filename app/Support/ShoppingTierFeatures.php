<?php

namespace App\Support;

class ShoppingTierFeatures
{
    public const FREE_DESCRIPTION_WORD_LIMIT = 150;

    public const STANDARD_GALLERY_LIMIT = 5;

    public const PREMIUM_GALLERY_LIMIT = 50;

    public const STANDARD_PRODUCT_LIMIT = 5;

    public const PREMIUM_PRODUCT_LIMIT = 50;

    /** @var array<string, int> */
    public const GALLERY_LIMITS = [
        Membership::FREE => 0,
        Membership::STANDARD => self::STANDARD_GALLERY_LIMIT,
        Membership::PREMIUM => self::PREMIUM_GALLERY_LIMIT,
    ];

    /** @var array<string, int> */
    public const PRODUCT_LIMITS = [
        Membership::FREE => 0,
        Membership::STANDARD => self::STANDARD_PRODUCT_LIMIT,
        Membership::PREMIUM => self::PREMIUM_PRODUCT_LIMIT,
    ];

    /**
     * Detail keys → minimum membership tier.
     *
     * @var array<string, string>
     */
    public const DETAIL_MIN_TIER = [
        'specialty' => Membership::STANDARD,
        'brands' => Membership::STANDARD,
        'delivery_options' => Membership::STANDARD,
        'return_policy' => Membership::STANDARD,
        'wholesale_retail' => Membership::STANDARD,
        'payments' => Membership::STANDARD,
        'products' => Membership::STANDARD,
        'video_url' => Membership::PREMIUM,
        'video_title' => Membership::PREMIUM,
        'whatsapp_catalog_url' => Membership::PREMIUM,
        'online_store_url' => Membership::PREMIUM,
        'price_list_pdf' => Membership::PREMIUM,
        'made_to_order' => Membership::PREMIUM,
        'deals' => Membership::PREMIUM,
    ];

    public static function galleryLimit(?string $tier): int
    {
        $tier = Membership::normalize($tier);

        return self::GALLERY_LIMITS[$tier] ?? self::GALLERY_LIMITS[Membership::FREE];
    }

    public static function productLimit(?string $tier): int
    {
        $tier = Membership::normalize($tier);

        return self::PRODUCT_LIMITS[$tier] ?? self::PRODUCT_LIMITS[Membership::FREE];
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
     * Strip Shopping fields the listing tier cannot use.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public static function applyToPayload(array $payload, ?string $tier, ?string $categoryKey): array
    {
        if ($categoryKey !== 'shopping') {
            return $payload;
        }

        $tier = Membership::normalize($tier);
        $details = is_array($payload['details'] ?? null) ? $payload['details'] : [];

        foreach (self::DETAIL_MIN_TIER as $key => $required) {
            if (! self::tierMeets($tier, $required)) {
                unset($details[$key]);
            }
        }

        unset($details['delivery']);

        if (array_key_exists('products', $details) && is_array($details['products'])) {
            $details['products'] = self::normalizeProducts($details['products'], $tier);
            if ($details['products'] === []) {
                unset($details['products']);
            }
        }

        if (! self::tierMeets($tier, Membership::STANDARD)) {
            $payload['latitude'] = null;
            $payload['longitude'] = null;
            $payload['email'] = null;
            $payload['tagline'] = null;
            $payload['logo_url'] = null;
            $payload['amenities'] = [];
            $payload['social_links'] = self::stripSocialLinks($payload['social_links'] ?? null);
        }

        if (! self::tierMeets($tier, Membership::PREMIUM)) {
            $payload['whatsapp'] = null;
            $payload['website'] = null;
            if (is_array($payload['social_links'] ?? null)) {
                $payload['social_links']['links'] = [];
            }
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
     * @param  list<mixed>  $products
     * @return list<array<string, mixed>>
     */
    public static function normalizeProducts(array $products, ?string $tier): array
    {
        $limit = self::productLimit($tier);
        if ($limit === 0) {
            return [];
        }

        $normalized = [];
        foreach ($products as $item) {
            if (! is_array($item)) {
                continue;
            }

            $currency = strtoupper(trim((string) ($item['currency'] ?? 'KES')));
            if (! in_array($currency, ['KES', 'USD', 'EUR'], true)) {
                $currency = 'KES';
            }
            $item['currency'] = $currency;

            $normalized[] = $item;
            if (count($normalized) >= $limit) {
                break;
            }
        }

        return $normalized;
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
