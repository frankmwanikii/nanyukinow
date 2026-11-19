import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const NANYUKI = { lat: -0.0167, lng: 37.0728 };

/**
 * Esri World Street Map: modern street basemap, no API key for normal web use.
 * (Carto Voyager now shows "API KEY REQUIRED" without a Carto account.)
 * Tile path is z/y/x (not z/x/y).
 */
const ESRI_STREET =
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
const ESRI_ATTR =
    'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, TomTom, FAO, NOAA, USGS';

function pinSvg({ active = false, teardrop = false } = {}) {
    if (teardrop) {
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44" fill="none">
        <ellipse cx="18" cy="41" rx="6" ry="2.2" fill="#1c1712" opacity="0.22"/>
        <path d="M18 1.5C10.544 1.5 4.5 7.544 4.5 15c0 10.2 11.6 24.8 12.8 26.2a1 1 0 0 0 1.4 0C19.9 39.8 31.5 25.2 31.5 15 31.5 7.544 25.456 1.5 18 1.5z" fill="#f2b82e" stroke="#1c1712" stroke-width="1.5"/>
        <circle cx="18" cy="15" r="5.25" fill="#1c1712"/>
        <circle cx="18" cy="15" r="2.2" fill="#ffffff"/>
      </svg>
    `)}`;
    }

    const bg = active ? '#f2b82e' : '#4b533a';
    const ring = active ? '#1c1712' : '#f4f5f1';
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="34" height="38" viewBox="0 0 34 38" fill="none">
        <ellipse cx="17" cy="35.5" rx="5.5" ry="2" fill="#1c1712" opacity="0.2"/>
        <circle cx="17" cy="16" r="13.5" fill="${bg}" stroke="${ring}" stroke-width="2.25"/>
        <circle cx="17" cy="16" r="4.25" fill="#ffffff"/>
      </svg>
    `)}`;
}

export function leafletPinIcon({ active = false, teardrop = false } = {}) {
    const size = teardrop ? [36, 44] : [34, 38];
    const anchor = teardrop ? [18, 42] : [17, 34];

    return L.icon({
        iconUrl: pinSvg({ active, teardrop }),
        iconSize: size,
        iconAnchor: anchor,
        popupAnchor: [0, -anchor[1] + 6],
        className: 'nn-leaflet-pin',
    });
}

export function createOsmMap(container, { center = NANYUKI, zoom = 13 } = {}) {
    const map = L.map(container, {
        center: [center.lat, center.lng],
        zoom,
        zoomControl: false,
        attributionControl: true,
        preferCanvas: true,
    });

    L.control
        .zoom({
            position: 'bottomright',
            zoomInTitle: 'Zoom in',
            zoomOutTitle: 'Zoom out',
        })
        .addTo(map);

    L.tileLayer(ESRI_STREET, {
        attribution: ESRI_ATTR,
        maxZoom: 19,
    }).addTo(map);

    return map;
}

export { L };
