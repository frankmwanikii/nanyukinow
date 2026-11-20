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
 * Google Maps Marker icon — Symbol path (reliable) with SVG data-URL fallback.
 * @param {object} maps google.maps namespace
 * @param {{ active?: boolean, fill?: string, listing?: boolean }} [options]
 */
export function googleMapPinIcon(maps, { active = false, fill, listing = false } = {}) {
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
