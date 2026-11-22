import { usePage } from '@inertiajs/react';

/**
 * Active map provider from admin Settings (`google` | `leaflet`).
 */
export function useMapProvider() {
    const provider = usePage().props.mapProvider;

    return provider === 'leaflet' ? 'leaflet' : 'google';
}

/**
 * Google Maps browser key from admin Settings (falls back to env via Inertia).
 */
export function useMapsApiKey() {
    return String(usePage().props.mapsApiKey || '');
}

export function directionsUrlFor(provider, { lat, lng, query, origin = null }) {
    const hasDest = typeof lat === 'number' && typeof lng === 'number';
    const hasOrigin =
        origin &&
        typeof origin.lat === 'number' &&
        typeof origin.lng === 'number';

    if (provider === 'leaflet' && hasDest) {
        const start = hasOrigin ? `${origin.lat}%2C${origin.lng}` : '';
        return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${start}%3B${lat}%2C${lng}`;
    }

    if (hasDest) {
        const dest = `destination=${lat},${lng}`;
        const from = hasOrigin ? `&origin=${origin.lat},${origin.lng}` : '';
        return `https://www.google.com/maps/dir/?api=1&${dest}${from}`;
    }

    const q = encodeURIComponent(query || 'Nanyuki');
    if (provider === 'leaflet') {
        return `https://www.openstreetmap.org/search?query=${q}`;
    }

    return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
