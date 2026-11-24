<?php

namespace App\Support;

/**
 * Pick a stable IconScout Unicons key for an amenity name/slug.
 * Used when creating amenities and when older rows have no icon_key yet.
 *
 * Keep RULES / FALLBACKS / POOL in sync with resources/js/utils/amenityIcons.js.
 */
class AmenityIcon
{
    /**
     * First matching rule wins. More specific patterns must come before broad ones.
     *
     * @var list<array{0: string, 1: string}>
     */
    private const RULES = [
        ['wifi|wi-?fi|internet', 'wifi'],
        ['parking', 'parking-circle'],
        ['wheel\s*chair|accessib|disabled', 'accessible-icon-alt'],
        ['pool|swim', 'water'],
        ['sauna|steam', 'cloud'],
        ['shower|restroom|toilet|bath', 'bath'],
        ['restaurant(?!\s*&?\s*bar)|dining', 'restaurant'],
        ['kitchen|crockery|utensil', 'crockery'],
        ['breakfast|fast.?food|food\s*&\s*drinks|food and drink', 'utensils'],
        ['takeaway|take.?away|to.?go', 'shopping-bag'],
        ['bar|alcohol|wine|martini', 'glass-martini-alt'],
        ['restaurant\s*&?\s*bar', 'glass-tea'],
        ['workspace|desk|office|briefcase', 'briefcase'],
        ['kid\s*menu|family|child|baby', 'baby-carriage'],
        ['pet', 'heart'],
        ['non[-\s]?smok|no\s*smok', 'ban'],
        ['fire|fireplace', 'fire'],
        ['laundry|linen|towel|wash(?!room)', 'refresh'],
        ['picnic', 'scenery'],
        ['wildlife|garden|outdoor|tree', 'trees'],
        ['balcony|terrace|patio', 'building'],
        ['seat|chair|sofa|sitting', 'chair'],
        ['vip|premium|exclusive|golden', 'diamond'],
        ['ticket|pass', 'ticket'],
        ['\bac\b|air[-\s]?cond|cooling', 'snowflake'],
        ['card|payment|mpesa|visa|mastercard', 'credit-card'],
        ['security|secure|gated|shield|guard', 'shield-check'],
        ['concierge|reception|room\s*service', 'bell'],
        ['\bcar\b|vehicle|transport', 'car'],
        ['delivery|truck', 'truck'],
        ['guide|tour', 'compass'],
        ['photo|camera', 'camera'],
        ['music|live|mic|dj', 'headphones'],
        ['tv|smart.?tv|screen|monitor', 'apps'],
        ['gym|fitness|workout|dumbbell', 'dumbbell'],
        ['rain|umbrella|cover|weather', 'umbrella'],
        ['gift\s*wrap|wrap', 'package'],
        ['gift|shop|store', 'shop'],
        ['licensed|certified|award', 'award'],
        ['borehole|well\b|water\s*supply', 'water'],
        ['backup\s*power|generator|power', 'bolt'],
        ['furnish|servant|quarters|\bsq\b|home|house', 'home'],
        ['book|same.?day', 'calendar-alt'],
        ['equipment|tool', 'constructor'],
        ['onsite|on[-\s]?site|mobile', 'mobile-android'],
        ['fitting|cloth|dress', 'shopping-bag'],
        ['bed|king|queen|twin|mattress', 'bed'],
        ['hair|appliance|iron', 'bolt'],
    ];

    /** Stable hashed fallbacks when no keyword matches. */
    private const FALLBACKS = [
        'check-circle',
        'star',
        'info-circle',
        'award',
        'bookmark',
        'compass',
        'tag',
        'ticket',
    ];

    /**
     * Extra Unicons keys used only to keep amenity icons unique.
     *
     * @var list<string>
     */
    private const POOL = [
        'wifi',
        'parking-circle',
        'accessible-icon-alt',
        'water',
        'cloud',
        'bath',
        'restaurant',
        'crockery',
        'utensils',
        'utensils-alt',
        'shopping-bag',
        'glass-martini-alt',
        'glass-tea',
        'briefcase',
        'baby-carriage',
        'heart',
        'ban',
        'fire',
        'refresh',
        'scenery',
        'trees',
        'building',
        'chair',
        'diamond',
        'ticket',
        'snowflake',
        'credit-card',
        'shield',
        'shield-check',
        'bell',
        'car',
        'truck',
        'compass',
        'camera',
        'headphones',
        'apps',
        'dumbbell',
        'umbrella',
        'package',
        'shop',
        'store',
        'award',
        'bolt',
        'home',
        'calendar-alt',
        'constructor',
        'mobile-android',
        'map-marker',
        'bed',
        'bed-double',
        'star',
        'check-circle',
        'info-circle',
        'bookmark',
        'tag',
        'lightbulb',
        'key-skeleton',
        'users-alt',
        'globe',
        'clock',
        'sun',
        'moon',
        'film',
        'image',
        'map',
        'phone',
        'envelope',
        'wallet',
        'money-bill',
        'ruler',
        'wrench',
        'setting',
        'favorite',
        'smile',
        'inbox',
        'file-alt',
        'clipboard-notes',
        'stopwatch',
        'hourglass',
        'estate',
        'grids',
    ];

    /**
     * @param  list<string>  $exclude  Icon keys already assigned to other amenities.
     */
    public static function guess(string $slug, ?string $name = null, array $exclude = []): string
    {
        $exclude = array_values(array_unique(array_filter(
            array_map(static fn ($key) => (string) $key, $exclude),
            static fn (string $key) => $key !== '',
        )));

        $haystack = mb_strtolower(trim($slug.' '.($name ?? '')));
        $preferred = [];

        foreach (self::RULES as [$pattern, $icon]) {
            if (preg_match('/'.$pattern.'/iu', $haystack) === 1) {
                $preferred[] = $icon;
            }
        }

        foreach ($preferred as $icon) {
            if (! in_array($icon, $exclude, true)) {
                return $icon;
            }
        }

        foreach (self::POOL as $icon) {
            if (! in_array($icon, $exclude, true)) {
                return $icon;
            }
        }

        foreach (self::FALLBACKS as $icon) {
            if (! in_array($icon, $exclude, true)) {
                return $icon;
            }
        }

        $index = abs(crc32($haystack !== '' ? $haystack : 'amenity')) % count(self::FALLBACKS);

        return self::FALLBACKS[$index];
    }
}
