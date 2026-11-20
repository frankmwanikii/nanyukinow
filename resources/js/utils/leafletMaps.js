import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapPinDataUrl } from '@/utils/mapPin';

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

export function leafletPinIcon({ active = false, teardrop = false } = {}) {
    const size = [40, 48];
    const anchor = [20, 44];

    return L.icon({
        // teardrop = listing/directions (always mustard); else explore (olive / mustard).
        iconUrl: teardrop
            ? mapPinDataUrl({ fill: '#f2b82e' })
            : mapPinDataUrl({ active }),
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
