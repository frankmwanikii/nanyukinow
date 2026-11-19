<?php

namespace App\Support;

/**
 * Pick a stable IconScout Unicons key for an amenity name/slug.
 * Used when creating amenities and when older rows have no icon_key yet.
 */
class AmenityIcon
{
    /**
     * First matching rule wins. Keep in sync with resources/js/utils/amenityIcons.js.
     *
     * @var list<array{0: string, 1: string}>
     */
    private const RULES = [
        ['wifi|wi-fi|internet', 'wifi'],
        ['parking|car park', 'parking-circle'],
        ['pool|swim', 'bath'],
        ['restaurant|dining|food|drink|breakfast|kitchen|crockery|utensil|takeaway|fast.?food', 'utensils'],
        ['bar|alcohol|wine', 'glass-tea'],
        ['workspace|desk|office|briefcase', 'briefcase'],
        ['family|kid|child|baby', 'baby-carriage'],
        ['pet', 'heart'],
        ['fire|fireplace', 'bolt'],
        ['laundry|wash', 'bag'],
        ['outdoor|garden|picnic|wildlife|tree', 'trees'],
        ['seat|chair|sofa|sitting', 'chair'],
        ['vip|premium|exclusive|golden', 'star'],
        ['ticket|pass', 'ticket'],
        ['ac|air.?cond|cooling', 'snowflake'],
        ['card|payment|mpesa', 'credit-card'],
        ['wheel|accessib|disabled', 'accessible-icon-alt'],
        ['security|secure|gated|shield|guard', 'shield'],
        ['concierge|bell|reception', 'bell'],
        ['car|vehicle|transport', 'car'],
        ['delivery|truck', 'truck'],
        ['guide|tour', 'compass'],
        ['photo|camera', 'camera'],
        ['music|live|mic|dj', 'headphones'],
        ['shower|bath|restroom|toilet', 'bath'],
        ['tv|smart.?tv|screen|monitor', 'apps'],
        ['rain|umbrella|cover|weather', 'umbrella'],
        ['gift|shop|store', 'shop'],
        ['licensed|certified|award', 'award'],
        ['furnish|home|house|sq|servant|borehole|power', 'home'],
        ['book|same.?day', 'calendar-alt'],
        ['equipment|tool', 'constructor'],
        ['onsite|mobile|service', 'map-marker'],
        ['fitting|cloth|dress', 'bag'],
    ];

    /** Fallback pool when no keyword matches (stable pick from name hash). */
    private const FALLBACKS = [
        'check-circle',
        'star',
        'info-circle',
        'award',
        'bookmark',
        'compass',
        'heart',
        'ticket',
    ];

    public static function guess(string $slug, ?string $name = null): string
    {
        $haystack = mb_strtolower(trim($slug.' '.($name ?? '')));

        foreach (self::RULES as [$pattern, $icon]) {
            if (preg_match('/'.$pattern.'/i', $haystack) === 1) {
                return $icon;
            }
        }

        $index = abs(crc32($haystack)) % count(self::FALLBACKS);

        return self::FALLBACKS[$index];
    }
}
