import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const NANYUKI = { lat: -0.0167, lng: 37.0728 };

const OSM_TILE =
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTR =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function pinSvg({ active = false, teardrop = false } = {}) {
    if (teardrop) {
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0C8.268 0 2 6.268 2 14c0 9.5 12.2 24.4 13.1 25.5a1.2 1.2 0 0 0 1.8 0C17.8 38.4 30 23.5 30 14 30 6.268 23.732 0 16 0z" fill="#f2b82e" stroke="#1c1712" stroke-width="1.6"/>
        <circle cx="16" cy="14" r="5.5" fill="#1c1712"/>
        <circle cx="16" cy="14" r="2.4" fill="#ffffff"/>
      </svg>
    `)}`;
    }

    const bg = active ? '#f2b82e' : '#4b533a';
    const ring = active ? '#1c1712' : '#ffffff';
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="34" viewBox="0 0 30 34">
        <circle cx="15" cy="15" r="13" fill="${bg}" stroke="${ring}" stroke-width="2.5"/>
        <circle cx="15" cy="15" r="4" fill="#ffffff"/>
      </svg>
    `)}`;
}

export function leafletPinIcon({ active = false, teardrop = false } = {}) {
    const size = teardrop ? [32, 40] : [30, 34];
    const anchor = teardrop ? [16, 38] : [15, 30];

    return L.icon({
        iconUrl: pinSvg({ active, teardrop }),
        iconSize: size,
        iconAnchor: anchor,
        popupAnchor: [0, -anchor[1] + 4],
    });
}

export function createOsmMap(container, { center = NANYUKI, zoom = 12 } = {}) {
    const map = L.map(container, {
        center: [center.lat, center.lng],
        zoom,
        zoomControl: true,
        attributionControl: true,
    });

    L.tileLayer(OSM_TILE, {
        attribution: OSM_ATTR,
        maxZoom: 19,
    }).addTo(map);

    return map;
}

export { L };
