<?php

namespace App\Support;

class ServicesTierFeatures
{
    public const FREE_DESCRIPTION_WORD_LIMIT = 150;

    public const STANDARD_PORTFOLIO_LIMIT = 5;

    public const PREMIUM_PORTFOLIO_LIMIT = 25;

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

    /** @var array<string, string> */
    public const DETAIL_MIN_TIER = [
        'service_area' => Membership::FREE,
        'offerings' => Membership::FREE,
        'pricing_from' => Membership::FREE,
        'response_time' => Membership::STANDARD,
        'credentials' => Membership::STANDARD,
        'portfolio' => Membership::STANDARD,
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

        if (array_key_exists('portfolio', $details) && is_array($details['portfolio'])) {
            $details['portfolio'] = ListingTierSupport::limitList(
                $details['portfolio'],
                self::portfolioLimit($tier),
            );
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
}
