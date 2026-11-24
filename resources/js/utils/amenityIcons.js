/**
 * Keep rules aligned with App\Support\AmenityIcon.
 * First match wins. Pass `exclude` so two amenities never share an icon when possible.
 */

const RULES = [
    [/wifi|wi-?fi|internet/i, 'wifi'],
    [/parking/i, 'parking-circle'],
    [/wheel\s*chair|accessib|disabled/i, 'accessible-icon-alt'],
    [/pool|swim/i, 'water'],
    [/sauna|steam/i, 'cloud'],
    [/shower|restroom|toilet|bath/i, 'bath'],
    [/restaurant(?!\s*&?\s*bar)|dining/i, 'restaurant'],
    [/kitchen|crockery|utensil/i, 'crockery'],
    [/breakfast|fast.?food|food\s*&\s*drinks|food and drink/i, 'utensils'],
    [/takeaway|take.?away|to.?go/i, 'shopping-bag'],
    [/bar|alcohol|wine|martini/i, 'glass-martini-alt'],
    [/restaurant\s*&?\s*bar/i, 'glass-tea'],
    [/workspace|desk|office|briefcase/i, 'briefcase'],
    [/kid\s*menu|family|child|baby/i, 'baby-carriage'],
    [/pet/i, 'heart'],
    [/non[-\s]?smok|no\s*smok/i, 'ban'],
    [/fire|fireplace/i, 'fire'],
    [/laundry|linen|towel|wash(?!room)/i, 'refresh'],
    [/picnic/i, 'scenery'],
    [/wildlife|garden|outdoor|tree/i, 'trees'],
    [/balcony|terrace|patio/i, 'building'],
    [/seat|chair|sofa|sitting/i, 'chair'],
    [/vip|premium|exclusive|golden/i, 'diamond'],
    [/ticket|pass/i, 'ticket'],
    [/\bac\b|air[-\s]?cond|cooling/i, 'snowflake'],
    [/card|payment|mpesa|visa|mastercard/i, 'credit-card'],
    [/security|secure|gated|shield|guard/i, 'shield-check'],
    [/concierge|reception|room\s*service/i, 'bell'],
    [/\bcar\b|vehicle|transport/i, 'car'],
    [/delivery|truck/i, 'truck'],
    [/guide|tour/i, 'compass'],
    [/photo|camera/i, 'camera'],
    [/music|live|mic|dj/i, 'headphones'],
    [/tv|smart.?tv|screen|monitor/i, 'apps'],
    [/gym|fitness|workout|dumbbell/i, 'dumbbell'],
    [/rain|umbrella|cover|weather/i, 'umbrella'],
    [/gift\s*wrap|wrap/i, 'package'],
    [/gift|shop|store/i, 'shop'],
    [/licensed|certified|award/i, 'award'],
    [/borehole|well\b|water\s*supply/i, 'water'],
    [/backup\s*power|generator|power/i, 'bolt'],
    [/furnish|servant|quarters|\bsq\b|home|house/i, 'home'],
    [/book|same.?day/i, 'calendar-alt'],
    [/equipment|tool/i, 'constructor'],
    [/onsite|on[-\s]?site|mobile/i, 'mobile-android'],
    [/fitting|cloth|dress/i, 'shopping-bag'],
    [/bed|king|queen|twin|mattress/i, 'bed'],
    [/hair|appliance|iron/i, 'bolt'],
];

const FALLBACKS = [
    'check-circle',
    'star',
    'info-circle',
    'award',
    'bookmark',
    'compass',
    'tag',
    'ticket',
];

const POOL = [
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

function hashPick(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
        hash = (hash << 5) - hash + text.charCodeAt(i);
        hash |= 0;
    }
    return FALLBACKS[Math.abs(hash) % FALLBACKS.length];
}

/**
 * @param {string} slug
 * @param {string} [name]
 * @param {string[]} [exclude]
 */
export function guessAmenityIcon(slug, name = '', exclude = []) {
    const blocked = new Set(
        (exclude || []).map((key) => String(key || '').trim()).filter(Boolean),
    );
    const haystack = `${slug || ''} ${name || ''}`.trim().toLowerCase();
    const preferred = [];

    for (const [pattern, icon] of RULES) {
        if (pattern.test(haystack)) {
            preferred.push(icon);
        }
        // Reset lastIndex for global-less patterns is a no-op; recreate safety
        pattern.lastIndex = 0;
    }

    for (const icon of preferred) {
        if (!blocked.has(icon)) {
            return icon;
        }
    }

    for (const icon of POOL) {
        if (!blocked.has(icon)) {
            return icon;
        }
    }

    for (const icon of FALLBACKS) {
        if (!blocked.has(icon)) {
            return icon;
        }
    }

    return hashPick(haystack || 'amenity');
}

export function titleCaseAmenity(value) {
    return String(value || '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function resolveAmenityItem(entry, exclude = []) {
    if (!entry) return null;

    if (typeof entry === 'string') {
        const slug = entry;
        const name = titleCaseAmenity(slug);
        const icon = guessAmenityIcon(slug, name, exclude);
        return { slug, name, icon };
    }

    const slug = entry.slug || entry.key || entry.name || '';
    const name =
        entry.name || entry.label || titleCaseAmenity(slug) || 'Amenity';
    const icon =
        entry.icon ||
        entry.icon_key ||
        guessAmenityIcon(slug, name, exclude);

    return { slug: slug || name, name, icon };
}
