<?php

namespace App\Support;

class ServicesTierFeatures
{
    public const FREE_DESCRIPTION_WORD_LIMIT = 150;

    public const STANDARD_PORTFOLIO_LIMIT = 5;

    public const PREMIUM_PORTFOLIO_LIMIT = 25;

    public const STANDARD_SERVICE_LIMIT = 5;

    public const PREMIUM_SERVICE_LIMIT = 50;

    public const STANDARD_SERVICE_IMAGES_PER_ITEM = 5;

    public const STANDARD_PORTFOLIO_IMAGES_PER_ITEM = 5;

    /** @var array<string, int> */
    public const GALLERY_LIMITS = [
        Membership::FREE => 0,
        Membership::STANDARD => 8,
        Membership::PREMIUM => 30,
    ];

    /** @var array<string, int> */
    public const PORTFOLIO_LIMITS = [
        Membership::FREE => 0,
        Membership::STANDARD => self::STANDARD_PORTFOLIO_LIMIT,
        Membership::PREMIUM => self::PREMIUM_PORTFOLIO_LIMIT,
    ];

    /** @var array<string, int> */
    public const SERVICE_LIMITS = [
        Membership::FREE => 0,
        Membership::STANDARD => self::STANDARD_SERVICE_LIMIT,
        Membership::PREMIUM => self::PREMIUM_SERVICE_LIMIT,
    ];

    /**
     * Photos allowed on each priced service. null = unlimited.
     *
     * @var array<string, int|null>
     */
    public const SERVICE_IMAGES_PER_ITEM = [
        Membership::FREE => 0,
        Membership::STANDARD => self::STANDARD_SERVICE_IMAGES_PER_ITEM,
        Membership::PREMIUM => null,
    ];

    /**
     * Photos allowed on each portfolio piece. null = unlimited.
     *
     * @var array<string, int|null>
     */
    public const PORTFOLIO_IMAGES_PER_ITEM = [
        Membership::FREE => 0,
        Membership::STANDARD => self::STANDARD_PORTFOLIO_IMAGES_PER_ITEM,
        Membership::PREMIUM => null,
    ];

    /** @var array<string, string> */
    public const DETAIL_MIN_TIER = [
        'service_area' => Membership::FREE,
        'offerings' => Membership::FREE,
        'pricing_from' => Membership::FREE,
        'response_time' => Membership::STANDARD,
        'credentials' => Membership::STANDARD,
        'portfolio' => Membership::STANDARD,
        'services' => Membership::STANDARD,
        'payments' => Membership::STANDARD,
        'video_url' => Membership::PREMIUM,
        'video_title' => Membership::PREMIUM,
        'booking_url' => Membership::PREMIUM,
        'deals' => Membership::PREMIUM,
    ];

    public static function galleryLimit(?string $tier): int
    {
        $tier = Membership::normalize($tier);

        return self::GALLERY_LIMITS[$tier] ?? self::GALLERY_LIMITS[Membership::FREE];
    }

    public static function portfolioLimit(?string $tier): int
    {
        $tier = Membership::normalize($tier);

        return self::PORTFOLIO_LIMITS[$tier] ?? self::PORTFOLIO_LIMITS[Membership::FREE];
    }

    public static function serviceLimit(?string $tier): int
    {
        $tier = Membership::normalize($tier);

        return self::SERVICE_LIMITS[$tier] ?? self::SERVICE_LIMITS[Membership::FREE];
    }

    /**
     * Cap of photos per priced service, or null when unlimited.
     */
    public static function serviceImagesPerItem(?string $tier): ?int
    {
        $tier = Membership::normalize($tier);

        if (array_key_exists($tier, self::SERVICE_IMAGES_PER_ITEM)) {
            return self::SERVICE_IMAGES_PER_ITEM[$tier];
        }

        return self::SERVICE_IMAGES_PER_ITEM[Membership::FREE];
    }

    /**
     * Cap of photos per portfolio piece, or null when unlimited.
     */
    public static function portfolioImagesPerItem(?string $tier): ?int
    {
        $tier = Membership::normalize($tier);

        if (array_key_exists($tier, self::PORTFOLIO_IMAGES_PER_ITEM)) {
            return self::PORTFOLIO_IMAGES_PER_ITEM[$tier];
        }

        return self::PORTFOLIO_IMAGES_PER_ITEM[Membership::FREE];
    }

    public static function descriptionWordLimit(?string $tier): ?int
    {
        return ListingTierSupport::tierMeets($tier, Membership::STANDARD)
            ? null
            : self::FREE_DESCRIPTION_WORD_LIMIT;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public static function applyToPayload(array $payload, ?string $tier, ?string $categoryKey): array
    {
        if ($categoryKey !== 'services') {
            return $payload;
        }

        $tier = Membership::normalize($tier);
        $details = is_array($payload['details'] ?? null) ? $payload['details'] : [];

        foreach (self::DETAIL_MIN_TIER as $key => $required) {
            if (! ListingTierSupport::tierMeets($tier, $required)) {
                unset($details[$key]);
            }
        }

        if (array_key_exists('services', $details) && is_array($details['services'])) {
            $details['services'] = self::normalizeServices($details['services'], $tier);
            if ($details['services'] === []) {
                unset($details['services']);
            }
        }

        if (array_key_exists('portfolio', $details) && is_array($details['portfolio'])) {
            $details['portfolio'] = self::normalizePortfolio($details['portfolio'], $tier);
            if ($details['portfolio'] === []) {
                unset($details['portfolio']);
            }
        }

        $payload = ListingTierSupport::applyStandardMediaGates($payload, $tier, [
            'strip_hours' => false,
            'premium_contact' => true,
        ]);

        if (isset($payload['gallery']) && is_array($payload['gallery'])) {
            $payload['gallery'] = array_values(array_slice(
                $payload['gallery'],
                0,
                self::galleryLimit($tier),
            ));
        }

        $wordLimit = self::descriptionWordLimit($tier);
        if ($wordLimit !== null && isset($payload['description'])) {
            $payload['description'] = ListingTierSupport::truncateHtmlWords(
                (string) $payload['description'],
                $wordLimit,
            );
        }

        $payload['details'] = $details === [] ? null : $details;

        return $payload;
    }

    /**
     * @param  list<mixed>  $services
     * @return list<array<string, mixed>>
     */
    public static function normalizeServices(array $services, ?string $tier): array
    {
        $limit = self::serviceLimit($tier);
        if ($limit === 0) {
            return [];
        }

        $normalized = [];
        foreach ($services as $item) {
            if (! is_array($item)) {
                continue;
            }

            $currency = strtoupper(trim((string) ($item['currency'] ?? 'KES')));
            if (! in_array($currency, ['KES', 'USD', 'EUR'], true)) {
                $currency = 'KES';
            }
            $item['currency'] = $currency;
            $item = self::normalizeItemImages($item, self::serviceImagesPerItem($tier));

            $normalized[] = $item;
            if (count($normalized) >= $limit) {
                break;
            }
        }

        return $normalized;
    }

    /**
     * @param  list<mixed>  $portfolio
     * @return list<array<string, mixed>>
     */
    public static function normalizePortfolio(array $portfolio, ?string $tier): array
    {
        $limit = self::portfolioLimit($tier);
        if ($limit === 0) {
            return [];
        }

        $normalized = [];
        foreach ($portfolio as $item) {
            if (! is_array($item)) {
                continue;
            }

            $item = self::normalizeItemImages($item, self::portfolioImagesPerItem($tier));
            $normalized[] = $item;
            if (count($normalized) >= $limit) {
                break;
            }
        }

        return $normalized;
    }

    /**
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>
     */
    private static function normalizeItemImages(array $item, ?int $imageLimit): array
    {
        $images = [];

        if (isset($item['images']) && is_array($item['images'])) {
            foreach ($item['images'] as $url) {
                if (! is_string($url)) {
                    continue;
                }
                $trimmed = trim($url);
                if ($trimmed === '') {
                    continue;
                }
                $images[] = $trimmed;
            }
        } elseif (isset($item['image']) && is_string($item['image'])) {
            $trimmed = trim($item['image']);
            if ($trimmed !== '') {
                $images[] = $trimmed;
            }
        }

        if ($imageLimit !== null) {
            $images = array_values(array_slice($images, 0, max(0, $imageLimit)));
        } else {
            $images = array_values($images);
        }

        $item['images'] = $images;
        $item['image'] = $images[0] ?? '';

        return $item;
    }
}
