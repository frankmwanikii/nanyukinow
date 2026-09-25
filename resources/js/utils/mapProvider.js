import { usePage } from '@inertiajs/react';

/**
 * Active map provider from admin Settings (`google` | `leaflet`).
 */
export function useMapProvider() {
    const provider = usePage().props.mapProvider;

    return provider === 'leaflet' ? 'leaflet' : 'google';
}

export function directionsUrlFor(provider, { lat, lng, query }) {
    if (
        provider === 'leaflet' &&
        typeof lat === 'number' &&
        typeof lng === 'number'
    ) {
        return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${lat}%2C${lng}`;
    }

    if (typeof lat === 'number' && typeof lng === 'number') {
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }

    const q = encodeURIComponent(query || 'Nanyuki');
    if (provider === 'leaflet') {
        return `https://www.openstreetmap.org/search?query=${q}`;
    }

    return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
