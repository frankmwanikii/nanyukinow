/**
 * Map marker pin — logo olive teardrop with the Nanyuki Now mark in the head.
 * Mark: circular favicon (mustard N / mountains on olive).
 */

/** Outer teardrop only (Phosphor map-pin-3610091), no center hole. */
export const MAP_PIN_OUTER =
    'M127.99414,15.9971a88.1046,88.1046,0,0,0-88,88c0,75.29688,80,132.17188,83.40625,134.55469a8.023,8.023,0,0,0,9.1875,0c3.40625-2.38281,83.40625-59.25781,83.40625-134.55469A88.10459,88.10459,0,0,0,127.99414,15.9971Z';

/** Legacy evenodd path (outer + hole) — kept for Google Symbol fallbacks. */
export const MAP_PIN_PATH =
    'M127.99414,15.9971a88.1046,88.1046,0,0,0-88,88c0,75.29688,80,132.17188,83.40625,134.55469a8.023,8.023,0,0,0,9.1875,0c3.40625-2.38281,83.40625-59.25781,83.40625-134.55469A88.10459,88.10459,0,0,0,127.99414,15.9971ZM128,72a32,32,0,1,1-32,32A31.99909,31.99909,0,0,1,128,72Z';

const MUSTARD = '#f2b82e';
/** Matches the circular logo / favicon olive field. */
const OLIVE = '#4b533a';
const EARTH = '#1c1712';
const PIN_FACE = '#f4f5f1';
/** Default branded pin body (logo green; mustard stays in the mark). */
const BRAND_PIN = OLIVE;

/** Tip of the pin in the 256×280 viewBox. */
const PIN_TIP = { x: 128, y: 238 };

/** Circular brand mark (favicon-32×32), inlined so SVG data-URLs work offline. */
const BRAND_MARK_DATA_URI =
    'data:image/png;base64,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';

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
 * Pin body + brand mark (olive face disc + circular logo).
 * @param {string} color
 */
function brandedPinMarkup(color) {
    return (
        `<ellipse cx="128" cy="268" rx="42" ry="10" fill="${EARTH}" opacity="0.22"/>` +
        `<path d="${MAP_PIN_OUTER}" fill="${color}"/>` +
        `<circle cx="128" cy="100" r="50" fill="${PIN_FACE}"/>` +
        `<image href="${BRAND_MARK_DATA_URI}" xlink:href="${BRAND_MARK_DATA_URI}" ` +
        `x="86" y="58" width="84" height="84" preserveAspectRatio="xMidYMid meet"/>`
    );
}

/**
 * @param {{ active?: boolean, fill?: string }} [options]
 * @returns {string} data:image/svg+xml URL
 */
export function mapPinDataUrl({ active = false, fill } = {}) {
    // Active explore pins keep a mustard ring feel via fill override; default is logo green.
    const color = fill || (active ? MUSTARD : BRAND_PIN);
    // Compact single-line SVG — data URLs with newlines can fail as Google marker icons.
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="48" viewBox="0 0 256 280">` +
        brandedPinMarkup(color) +
        `</svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Title bubble + mustard pin for listing detail maps (Google Marker icon URL).
 * @param {string} title
 * @returns {{ label: string, pillW: number, pillH: number, pinW: number, pinH: number, gap: number, width: number, height: number, pinCx: number }}
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
        `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${m.width}" height="${m.height}" viewBox="0 0 ${m.width} ${m.height}">` +
        `<rect x="${pillX}" y="0" width="${m.pillW}" height="${m.pillH}" rx="16" ry="16" fill="${EARTH}"/>` +
        `<text x="${m.pinCx}" y="${textY}" text-anchor="middle" dominant-baseline="middle" ` +
        `fill="#ffffff" font-family="DM Sans, system-ui, sans-serif" font-size="12" font-weight="600">${safe}</text>` +
        `<g transform="translate(${pinX} ${pinY}) scale(${m.pinW / 256} ${m.pinH / 280})">` +
        brandedPinMarkup(BRAND_PIN) +
        `</g>` +
        `</svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Google Maps Marker icon — branded SVG pin (logo in the head).
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

    // Listing / form pins: logo green. Explore selected pin: mustard for contrast.
    const color = fill || (listing ? BRAND_PIN : active ? MUSTARD : BRAND_PIN);

    return {
        url: mapPinDataUrl({ fill: color }),
        scaledSize: new maps.Size(40, 48),
        anchor: new maps.Point(20, 44),
    };
}
