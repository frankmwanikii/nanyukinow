/**
 * Keep rules aligned with App\Support\AmenityIcon.
 * First match wins. Fallback pool is hashed for stable picks on unknown amenities.
 */
const RULES = [
    [/wifi|wi-fi|internet/i, 'wifi'],
    [/parking|car park/i, 'parking-circle'],
    [/pool|swim/i, 'bath'],
    [/restaurant|dining|food|drink|breakfast|kitchen|crockery|utensil|takeaway|fast.?food/i, 'utensils'],
    [/bar|alcohol|wine/i, 'glass-tea'],
    [/workspace|desk|office|briefcase/i, 'briefcase'],
    [/family|kid|child|baby/i, 'baby-carriage'],
    [/pet/i, 'heart'],
    [/fire|fireplace/i, 'bolt'],
    [/laundry|wash/i, 'bag'],
    [/outdoor|garden|picnic|wildlife|tree/i, 'trees'],
    [/seat|chair|sofa|sitting/i, 'chair'],
    [/vip|premium|exclusive|golden/i, 'star'],
    [/ticket|pass/i, 'ticket'],
    [/ac|air.?cond|cooling/i, 'snowflake'],
    [/card|payment|mpesa/i, 'credit-card'],
    [/wheel|accessib|disabled/i, 'accessible-icon-alt'],
    [/security|secure|gated|shield|guard/i, 'shield'],
    [/concierge|bell|reception/i, 'bell'],
    [/car|vehicle|transport/i, 'car'],
    [/delivery|truck/i, 'truck'],
    [/guide|tour/i, 'compass'],
    [/photo|camera/i, 'camera'],
    [/music|live|mic|dj/i, 'headphones'],
    [/shower|bath|restroom|toilet/i, 'bath'],
    [/tv|smart.?tv|screen|monitor/i, 'apps'],
    [/rain|umbrella|cover|weather/i, 'umbrella'],
    [/gift|shop|store/i, 'shop'],
    [/licensed|certified|award/i, 'award'],
    [/furnish|home|house|sq|servant|borehole|power/i, 'home'],
    [/book|same.?day/i, 'calendar-alt'],
    [/equipment|tool/i, 'constructor'],
    [/onsite|mobile|service/i, 'map-marker'],
    [/fitting|cloth|dress/i, 'bag'],
];

const FALLBACKS = [
    'check-circle',
    'star',
    'info-circle',
    'award',
    'bookmark',
    'compass',
    'heart',
    'ticket',
];

function hashPick(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
        hash = (hash << 5) - hash + text.charCodeAt(i);
        hash |= 0;
    }
    return FALLBACKS[Math.abs(hash) % FALLBACKS.length];
}

export function guessAmenityIcon(slug, name = '') {
    const haystack = `${slug || ''} ${name || ''}`.trim().toLowerCase();
    for (const [pattern, icon] of RULES) {
        if (pattern.test(haystack)) {
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

export function resolveAmenityItem(entry) {
    if (!entry) return null;

    if (typeof entry === 'string') {
        const slug = entry;
        const name = titleCaseAmenity(slug);
        const icon = guessAmenityIcon(slug, name);
        return { slug, name, icon };
    }

    const slug = entry.slug || entry.key || entry.name || '';
    const name =
        entry.name || entry.label || titleCaseAmenity(slug) || 'Amenity';
    const icon =
        entry.icon || entry.icon_key || guessAmenityIcon(slug, name);

    return { slug: slug || name, name, icon };
}
