import { useEffect, useRef, useState } from 'react';
import { ForwardMark, PinMark } from '@/Components/site/Mark';
import { getMapsApiKey, loadGoogleMaps } from '@/utils/googleMaps';
import { L, createOsmMap, leafletPinIcon } from '@/utils/leafletMaps';
import {
    directionsUrlFor,
    useMapProvider,
    useMapsApiKey,
} from '@/utils/mapProvider';

function parseCoord(value) {
    const n = typeof value === 'number' ? value : Number.parseFloat(value);
    return Number.isFinite(n) ? n : null;
}

function resolveLatLng(listing) {
    const lat =
        parseCoord(listing?.lat) ?? parseCoord(listing?.latitude) ?? null;
    const lng =
        parseCoord(listing?.lng) ?? parseCoord(listing?.longitude) ?? null;

    if (lat === null || lng === null) {
        return { lat: null, lng: null };
    }

    return { lat, lng };
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
    const sharedMapsKey = useMapsApiKey();
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const googleKey = getMapsApiKey(sharedMapsKey);
    const [status, setStatus] = useState('loading');

    const { lat, lng } = resolveLatLng(listing);
    const hasCoords = lat !== null && lng !== null;

    useEffect(() => {
        if (!hasCoords) {
            setStatus(
                provider === 'leaflet' || googleKey ? 'unavailable' : 'missing',
            );
            return undefined;
        }

        let cancelled = false;
        let resizeObserver = null;
        const timers = [];

        const paint = () => {
            const el = containerRef.current;
            if (cancelled || !el) {
                return;
            }

            // Wait until the frame has a real size (avoids blank Leaflet tiles).
            if (el.clientWidth < 8 || el.clientHeight < 8) {
                return;
            }

            if (mapRef.current) {
                if (provider === 'leaflet' && mapRef.current.invalidateSize) {
                    mapRef.current.invalidateSize();
                }
                return;
            }

            setStatus('loading');
            el.innerHTML = '';

            if (provider === 'leaflet') {
                const map = createOsmMap(el, {
                    center: { lat, lng },
                    zoom: 14,
                });

                L.marker([lat, lng], {
                    icon: leafletPinIcon({ teardrop: true }),
                    title: listing?.title || listing?.address || '',
                }).addTo(map);

                mapRef.current = map;
                timers.push(
                    window.setTimeout(() => {
                        if (!cancelled) {
                            map.invalidateSize();
                        }
                    }, 50),
                );
                timers.push(
                    window.setTimeout(() => {
                        if (!cancelled) {
                            map.invalidateSize();
                        }
                    }, 250),
                );
                setStatus('ready');
                return;
            }

            if (!googleKey) {
                setStatus('missing');
                return;
            }

            loadGoogleMaps(googleKey, { libraries: [] })
                .then((maps) => {
                    if (cancelled || !containerRef.current || mapRef.current) {
                        return;
                    }

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
                    if (!cancelled) {
                        setStatus('error');
                    }
                });
        };

        paint();

        if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
            resizeObserver = new ResizeObserver(() => paint());
            resizeObserver.observe(containerRef.current);
        } else {
            timers.push(window.setTimeout(paint, 100));
        }

        return () => {
            cancelled = true;
            timers.forEach((id) => window.clearTimeout(id));
            resizeObserver?.disconnect();
            if (mapRef.current?.remove) {
                mapRef.current.remove();
            }
            mapRef.current = null;
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
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

    // Need a pin to show Directions (address-only is not enough for a map).
    if (!hasCoords) return null;

    const directionsUrl = directionsUrlFor(provider, {
        lat,
        lng,
        query: listing.address || listing.title || 'Nanyuki',
    });

    const showMap = provider === 'leaflet' || Boolean(googleKey);

    return (
        <section
            id="contact"
            className="relative z-0 isolate overflow-hidden border border-olive-900/15 bg-white"
        >
            <div className="border-b border-olive-900/10 px-4 py-3 sm:px-5 sm:py-3.5">
                <h2 className="font-display text-base font-semibold tracking-tight text-earth-dusk sm:text-lg">
                    Directions
                </h2>
            </div>

            <div className="nn-directions-map-frame relative z-0 h-56 overflow-hidden border-b border-olive-900/10 bg-olive-100 sm:h-64">
                {showMap ? (
                    <div ref={containerRef} className="h-full w-full" />
                ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-sm text-olive-600">
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
                <p className="flex items-start gap-2 text-sm text-olive-800">
                    <PinMark className="mt-0.5 h-4 w-4 shrink-0 text-mustard" />
                    <span>{listing.address || listing.location}</span>
                </p>
                <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-olive-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950"
                >
                    Get directions
                    <ForwardMark className="h-4 w-4" />
                </a>
            </div>
        </section>
    );
}
