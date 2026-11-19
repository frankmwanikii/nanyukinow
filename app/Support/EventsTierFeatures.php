<?php

namespace App\Support;

class EventsTierFeatures
{
    public const FREE_DESCRIPTION_WORD_LIMIT = 150;

    /** @var array<string, int> */
    public const GALLERY_LIMITS = [
        Membership::FREE => 0,
        Membership::STANDARD => 8,
        Membership::PREMIUM => 30,
    ];

    /** @var array<string, int> */
    public const AGENDA_LIMITS = [
        Membership::FREE => 0,
        Membership::STANDARD => 10,
        Membership::PREMIUM => 40,
    ];

    /** @var array<string, int> */
    public const SPONSOR_LIMITS = [
        Membership::FREE => 0,
        Membership::STANDARD => 0,
        Membership::PREMIUM => 20,
    ];

    /** @var array<string, string> */
    public const DETAIL_MIN_TIER = [
        'organiser' => Membership::FREE,
        'age_limit' => Membership::STANDARD,
        'doors_open' => Membership::STANDARD,
        'dress_code' => Membership::STANDARD,
        'agenda' => Membership::STANDARD,
        'event_schedule' => Membership::STANDARD,
        'payments' => Membership::STANDARD,
        'sponsors' => Membership::PREMIUM,
        'video_url' => Membership::PREMIUM,
        'video_title' => Membership::PREMIUM,
    ];

    public static function galleryLimit(?string $tier): int
    {
        $tier = Membership::normalize($tier);

        return self::GALLERY_LIMITS[$tier] ?? self::GALLERY_LIMITS[Membership::FREE];
    }

    public static function agendaLimit(?string $tier): int
    {
        $tier = Membership::normalize($tier);

        return self::AGENDA_LIMITS[$tier] ?? self::AGENDA_LIMITS[Membership::FREE];
    }

    public static function sponsorLimit(?string $tier): int
    {
        $tier = Membership::normalize($tier);

        return self::SPONSOR_LIMITS[$tier] ?? self::SPONSOR_LIMITS[Membership::FREE];
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
        if ($categoryKey !== 'events') {
            return $payload;
        }

        $tier = Membership::normalize($tier);
        $details = is_array($payload['details'] ?? null) ? $payload['details'] : [];

        foreach (self::DETAIL_MIN_TIER as $key => $required) {
            if (! ListingTierSupport::tierMeets($tier, $required)) {
                unset($details[$key]);
            }
        }

        if (array_key_exists('agenda', $details) && is_array($details['agenda'])) {
            $details['agenda'] = ListingTierSupport::limitList(
                $details['agenda'],
                self::agendaLimit($tier),
            );
            if ($details['agenda'] === []) {
                unset($details['agenda']);
            }
        }

        if (array_key_exists('sponsors', $details) && is_array($details['sponsors'])) {
            $details['sponsors'] = ListingTierSupport::limitList(
                $details['sponsors'],
                self::sponsorLimit($tier),
            );
            if ($details['sponsors'] === []) {
                unset($details['sponsors']);
            }
        }

        $payload = ListingTierSupport::applyStandardMediaGates($payload, $tier, [
            'strip_hours' => false,
            'premium_contact' => true,
        ]);

        if (! ListingTierSupport::tierMeets($tier, Membership::STANDARD)) {
            $payload['ticket_price'] = null;
            $payload['early_bird_price'] = null;
            $payload['gate_price'] = null;
            $payload['ticket_options'] = null;
        }

        if (! ListingTierSupport::tierMeets($tier, Membership::PREMIUM)) {
            $payload['ticket_url'] = null;
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
            $payload['description'] = ListingTierSupport::truncateHtmlWords(
                (string) $payload['description'],
                $wordLimit,
            );
        }

        $payload['details'] = $details === [] ? null : $details;

        return $payload;
    }
}
