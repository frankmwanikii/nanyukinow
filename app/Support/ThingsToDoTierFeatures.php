<?php

namespace App\Support;

class ThingsToDoTierFeatures
{
    public const FREE_DESCRIPTION_WORD_LIMIT = 150;

    /** @var array<string, int> */
    public const GALLERY_LIMITS = [
        Membership::FREE => 0,
        Membership::STANDARD => 8,
        Membership::PREMIUM => 30,
    ];

    /** @var array<string, string> */
    public const DETAIL_MIN_TIER = [
        'duration' => Membership::FREE,
        'difficulty' => Membership::FREE,
        'price_from' => Membership::FREE,
        'min_age' => Membership::STANDARD,
        'group_size' => Membership::STANDARD,
        'included' => Membership::STANDARD,
        'bring' => Membership::STANDARD,
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
        if ($categoryKey !== 'thingsToDo') {
            return $payload;
        }

        $tier = Membership::normalize($tier);
        $details = is_array($payload['details'] ?? null) ? $payload['details'] : [];

        foreach (self::DETAIL_MIN_TIER as $key => $required) {
            if (! ListingTierSupport::tierMeets($tier, $required)) {
                unset($details[$key]);
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

        if (isset($payload['price_range']) && ! ListingTierSupport::tierMeets($tier, Membership::STANDARD)) {
            if ($payload['price_range'] === '$$$$') {
                $payload['price_range'] = '$$$';
            }
        }

        $payload['details'] = $details === [] ? null : $details;

        return $payload;
    }
}
