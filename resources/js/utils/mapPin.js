/**
 * Map marker pin — IconScout Phosphor glyph (map-pin-3610091).
 * Solid teardrop with center hole; mustard by default for map contrast.
 */

/** Path in a 256×256 viewBox (Phosphor Map Pin). */
export const MAP_PIN_PATH =
    'M127.99414,15.9971a88.1046,88.1046,0,0,0-88,88c0,75.29688,80,132.17188,83.40625,134.55469a8.023,8.023,0,0,0,9.1875,0c3.40625-2.38281,83.40625-59.25781,83.40625-134.55469A88.10459,88.10459,0,0,0,127.99414,15.9971ZM128,72a32,32,0,1,1-32,32A31.99909,31.99909,0,0,1,128,72Z';

const MUSTARD = '#f2b82e';
const OLIVE = '#4b533a';
const EARTH = '#1c1712';

/** Tip of the pin in the 256 viewBox (for Google Symbol anchor). */
const PIN_TIP = { x: 128, y: 238 };

/**
 * Hide Google lodging/business POIs so they do not cover our listing marker.
 * @type {Array<object>}
 */
export const LISTING_MAP_STYLES = [
    { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.attraction', stylers: [{ visibility: 'off' }] },
    {
        featureType: 'poi',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }],
    },
];

/**
 * @param {string} title
 * @param {number} [max=26]
 */
export function truncateMapLabel(title, max = 26) {
    const text = String(title || '')
        .replace(/\s+/g, ' ')
        .trim();
    if (!text) {
        return 'Stay';
    }
    if (text.length <= max) {
        return text;
    }
    return `${text.slice(0, Math.max(1, max - 1)).trimEnd()}…`;
}

function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * @param {{ active?: boolean, fill?: string }} [options]
 * @returns {string} data:image/svg+xml URL
 */
export function mapPinDataUrl({ active = false, fill } = {}) {
    const color = fill || (active ? MUSTARD : OLIVE);
    // Compact single-line SVG — data URLs with newlines can fail as Google marker icons.
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 256 280">` +
        `<ellipse cx="128" cy="268" rx="42" ry="10" fill="${EARTH}" opacity="0.22"/>` +
        `<path fill-rule="evenodd" d="${MAP_PIN_PATH}" fill="${color}"/>` +
        `</svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Title bubble + mustard pin for listing detail maps (Google Marker icon URL).
 * @param {string} title
 * @returns {{ url: string, width: number, height: number, anchorX: number, anchorY: number }}
 */
export function listingTitleMarkerMetrics(title) {
    const label = truncateMapLabel(title);
    // Approximate DM Sans at 12px; keep the pill readable on mobile.
    const textWidth = Math.ceil(
        [...label].reduce(
            (sum, ch) => sum + (/[iIlj1.' ]/.test(ch) ? 4.2 : 7.1),
            0,
        ),
    );
    const pillW = Math.min(220, Math.max(72, textWidth + 28));
    const pillH = 32;
    const pinW = 28;
    const pinH = 34;
    const gap = 6;
    const width = Math.max(pillW, pinW);
    const height = pillH + gap + pinH;
    const pinCx = Math.round(width / 2);

    return { label, pillW, pillH, pinW, pinH, gap, width, height, pinCx };
}

/**
 * @param {string} title
 * @returns {string} data:image/svg+xml URL
 */
export function listingTitleMarkerDataUrl(title) {
    const m = listingTitleMarkerMetrics(title);
    const pillX = Math.round((m.width - m.pillW) / 2);
    const pinX = m.pinCx - Math.round(m.pinW / 2);
    const pinY = m.pillH + m.gap;
    const textY = Math.round(m.pillH / 2) + 1;
    const safe = escapeXml(m.label);

    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${m.width}" height="${m.height}" viewBox="0 0 ${m.width} ${m.height}">` +
        `<rect x="${pillX}" y="0" width="${m.pillW}" height="${m.pillH}" rx="16" ry="16" fill="${EARTH}"/>` +
        `<text x="${m.pinCx}" y="${textY}" text-anchor="middle" dominant-baseline="middle" ` +
        `fill="#ffffff" font-family="DM Sans, system-ui, sans-serif" font-size="12" font-weight="600">${safe}</text>` +
        `<g transform="translate(${pinX} ${pinY}) scale(${m.pinW / 256} ${m.pinH / 280})">` +
        `<ellipse cx="128" cy="268" rx="42" ry="10" fill="${EARTH}" opacity="0.22"/>` +
        `<path fill-rule="evenodd" d="${MAP_PIN_PATH}" fill="${MUSTARD}"/>` +
        `</g>` +
        `</svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Google Maps Marker icon — Symbol path (reliable) with SVG data-URL fallback.
 * @param {object} maps google.maps namespace
 * @param {{ active?: boolean, fill?: string, listing?: boolean, title?: string }} [options]
 */
export function googleMapPinIcon(
    maps,
    { active = false, fill, listing = false, title = '' } = {},
) {
    if (listing && title) {
        const m = listingTitleMarkerMetrics(title);
        return {
            url: listingTitleMarkerDataUrl(title),
            scaledSize: new maps.Size(m.width, m.height),
            anchor: new maps.Point(Math.round(m.width / 2), m.height - 2),
        };
    }

    const color = fill || (listing || active ? MUSTARD : OLIVE);

    if (typeof maps.SymbolPath === 'undefined' && !maps.Marker) {
        return {
            url: mapPinDataUrl({ fill: color }),
            scaledSize: new maps.Size(40, 48),
            anchor: new maps.Point(20, 44),
        };
    }

    // Prefer vector Symbol — avoids blank/odd tiles some browsers hit with SVG data URLs.
    return {
        path: MAP_PIN_PATH,
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 0.14,
        anchor: new maps.Point(PIN_TIP.x, PIN_TIP.y),
    };
}
