import { MapPin, Navigation } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getMapsApiKey, loadGoogleMaps } from '@/utils/googleMaps';
import { L, createOsmMap, leafletPinIcon } from '@/utils/leafletMaps';
import { directionsUrlFor, useMapProvider } from '@/utils/mapProvider';

function parseCoord(value) {
    const n = typeof value === 'number' ? value : Number.parseFloat(value);
    return Number.isFinite(n) ? n : null;
}

function googlePinSvg() {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0C8.268 0 2 6.268 2 14c0 9.5 12.2 24.4 13.1 25.5a1.2 1.2 0 0 0 1.8 0C17.8 38.4 30 23.5 30 14 30 6.268 23.732 0 16 0z" fill="#f2b82e" stroke="#1c1712" stroke-width="1.6"/>
        <circle cx="16" cy="14" r="5.5" fill="#1c1712"/>
        <circle cx="16" cy="14" r="2.4" fill="#ffffff"/>
      </svg>
    `)}`;
}

export default function DirectionsMap({ listing }) {
    const provider = useMapProvider();
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const googleKey = getMapsApiKey();
    const [status, setStatus] = useState('loading');

    const lat = parseCoord(listing?.lat);
    const lng = parseCoord(listing?.lng);
    const hasCoords = lat !== null && lng !== null;

    useEffect(() => {
        if (!hasCoords) {
            setStatus(
                provider === 'leaflet' || googleKey ? 'unavailable' : 'missing',
            );
            return undefined;
        }

        let cancelled = false;
        setStatus('loading');

        if (provider === 'leaflet') {
            if (!containerRef.current) return undefined;

            containerRef.current.innerHTML = '';
            const map = createOsmMap(containerRef.current, {
                center: { lat, lng },
                zoom: 14,
            });

            L.marker([lat, lng], {
                icon: leafletPinIcon({ teardrop: true }),
                title: listing?.title || listing?.address || '',
            }).addTo(map);

            mapRef.current = map;
            requestAnimationFrame(() => map.invalidateSize());
            setStatus('ready');

            return () => {
                cancelled = true;
                map.remove();
                mapRef.current = null;
                if (containerRef.current) containerRef.current.innerHTML = '';
            };
        }

        if (!googleKey) {
            setStatus('missing');
            return undefined;
        }

        loadGoogleMaps(googleKey, { libraries: [] })
            .then((maps) => {
                if (cancelled || !containerRef.current) return;

                containerRef.current.innerHTML = '';
                const map = new maps.Map(containerRef.current, {
                    center: { lat, lng },
                    zoom: 14,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                    clickableIcons: false,
                    gestureHandling: 'cooperative',
                });

                new maps.Marker({
                    map,
                    position: { lat, lng },
                    title: listing?.title || listing?.address || '',
                    icon: {
                        url: googlePinSvg(),
                        scaledSize: new maps.Size(32, 40),
                        anchor: new maps.Point(16, 38),
                    },
                });

                mapRef.current = map;
                setStatus('ready');
            })
            .catch(() => {
                if (!cancelled) setStatus('error');
            });

        return () => {
            cancelled = true;
            mapRef.current = null;
            if (containerRef.current) containerRef.current.innerHTML = '';
        };
    }, [
        hasCoords,
        lat,
        lng,
        googleKey,
        provider,
        listing?.title,
        listing?.address,
    ]);

    if (!listing) return null;

    // Hide the whole Directions block until a pin (or usable address) exists.
    if (!hasCoords && !listing.address) return null;

    const directionsUrl = directionsUrlFor(provider, {
        lat: hasCoords ? lat : null,
        lng: hasCoords ? lng : null,
        query: listing.address || listing.title || 'Nanyuki',
    });

    const showMap =
        hasCoords && (provider === 'leaflet' || Boolean(googleKey));

    // Without coordinates, don't show an empty "Map unavailable" card.
    if (!hasCoords) return null;

    return (
        <section
            id="contact"
            className="relative z-0 overflow-hidden rounded-xl border border-olive-200/70 bg-white isolate"
        >
            <div className="px-4 pt-4 sm:px-5 sm:pt-5">
                <h2 className="font-display text-lg font-semibold text-earth-dusk sm:text-xl">
                    Directions
                </h2>
            </div>

            <div className="relative z-0 mt-3 overflow-hidden bg-olive-100 sm:mt-4">
                {showMap ? (
                    <div
                        ref={containerRef}
                        className="nn-directions-map h-56 w-full sm:h-64"
                    />
                ) : (
                    <div className="flex h-56 items-center justify-center px-4 text-center text-sm text-olive-600 sm:h-64">
                        {provider === 'google' && !googleKey
                            ? 'Google Maps API key required'
                            : 'Map unavailable'}
                    </div>
                )}
                {status === 'error' ? (
                    <p className="absolute inset-x-0 bottom-2 px-3 text-center text-xs text-rose-700">
                        Map failed to load
                        {provider === 'google'
                            ? ' — check API key & billing.'
                            : '.'}
                    </p>
                ) : null}
            </div>

            <div className="space-y-3 px-4 py-4 sm:px-5 sm:py-5">
                <p className="flex items-start gap-2 text-sm font-medium text-olive-800">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mustard" />
                    <span>{listing.address || listing.location}</span>
                </p>
                <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-olive-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950"
                >
                    <Navigation className="h-4 w-4" />
                    Get directions
                </a>
            </div>
        </section>
    );
}
