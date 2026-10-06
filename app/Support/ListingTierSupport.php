<?php

namespace App\Support;

/**
 * Shared helpers for category Free / Standard / Premium payload stripping.
 */
class ListingTierSupport
{
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

    public static function truncateHtmlWords(string $html, int $limit): string
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

    /**
     * @param  array<string, mixed>|null  $social
     * @return array<string, mixed>|null
     */
    public static function stripSocialLinks(?array $social): ?array
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

    /**
     * @param  list<mixed>  $items
     * @return list<array<string, mixed>>
     */
    public static function limitList(array $items, int $limit): array
    {
        if ($limit <= 0) {
            return [];
        }

        $normalized = [];
        foreach ($items as $item) {
            if (! is_array($item)) {
                continue;
            }
            $normalized[] = $item;
            if (count($normalized) >= $limit) {
                break;
            }
        }

        return $normalized;
    }

    /**
     * Apply common conversion-tier contact / media stripping.
     *
     * @param  array<string, mixed>  $payload
     * @param  array{
     *     strip_map?: bool,
     *     strip_amenities?: bool,
     *     strip_hours?: bool,
     *     strip_logo?: bool,
     *     strip_tagline?: bool,
     *     strip_email?: bool,
     *     premium_contact?: bool
     * }  $options
     * @return array<string, mixed>
     */
    public static function applyStandardMediaGates(array $payload, string $tier, array $options = []): array
    {
        $belowStandard = ! self::tierMeets($tier, Membership::STANDARD);
        $belowPremium = ! self::tierMeets($tier, Membership::PREMIUM);

        if ($belowStandard) {
            if ($options['strip_map'] ?? true) {
                $payload['latitude'] = null;
                $payload['longitude'] = null;
            }
            if ($options['strip_amenities'] ?? true) {
                $payload['amenities'] = [];
            }
            if ($options['strip_hours'] ?? false) {
                $payload['hours'] = null;
            }
            if ($options['strip_logo'] ?? true) {
                $payload['logo_url'] = null;
            }
            if ($options['strip_tagline'] ?? true) {
                $payload['tagline'] = null;
            }
            if ($options['strip_email'] ?? true) {
                $payload['email'] = null;
            }
            $payload['social_links'] = self::stripSocialLinks($payload['social_links'] ?? null);
        }

        if (($options['premium_contact'] ?? true) && $belowPremium) {
            $payload['whatsapp'] = null;
            $payload['website'] = null;
            if (is_array($payload['social_links'] ?? null)) {
                $payload['social_links']['links'] = [];
            }
        }

        return $payload;
    }
}
