import { useEffect, useRef, useState } from 'react';
import { ForwardMark, PinMark } from '@/Components/site/Mark';
import {
    GOOGLE_MAPS_AUTH_HELP,
    getMapsApiKey,
    loadGoogleMaps,
    onGoogleMapsAuthFailure,
} from '@/utils/googleMaps';
import { L, createOsmMap, leafletPinIcon } from '@/utils/leafletMaps';
import { googleMapPinIcon } from '@/utils/mapPin';
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
                } else if (provider === 'google' && window.google?.maps?.event) {
                    window.google.maps.event.trigger(mapRef.current, 'resize');
                    mapRef.current.setCenter({ lat, lng });
                }
                return;
            }

            setStatus('loading');
            el.innerHTML = '';

            // Remote lodges (forest / conservancy) look empty at high zoom.
            // 12 keeps roads and nearby places in frame.
            const mapZoom = 12;

            if (provider === 'leaflet') {
                const map = createOsmMap(el, {
                    center: { lat, lng },
                    zoom: mapZoom,
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
                        zoom: mapZoom,
                        mapTypeId: 'roadmap',
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
                        icon: googleMapPinIcon(maps, { listing: true }),
                        optimized: false,
                    });

                    mapRef.current = map;
                    // Ensure tiles paint after the frame has a real size.
                    timers.push(
                        window.setTimeout(() => {
                            if (cancelled || !mapRef.current) {
                                return;
                            }
                            maps.event.trigger(mapRef.current, 'resize');
                            mapRef.current.setCenter({ lat, lng });
                        }, 50),
                    );
                    setStatus('ready');
                })
                .catch(() => {
                    if (!cancelled) {
                        setStatus('error');
                    }
                });
        };

        const stopAuthWatch = onGoogleMapsAuthFailure(() => {
            if (!cancelled) {
                setStatus('error');
            }
        });

        paint();

        if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
            resizeObserver = new ResizeObserver(() => paint());
            resizeObserver.observe(containerRef.current);
        } else {
            timers.push(window.setTimeout(paint, 100));
        }

        return () => {
            cancelled = true;
            stopAuthWatch();
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
                        {provider === 'google'
                            ? GOOGLE_MAPS_AUTH_HELP
                            : 'Map failed to load.'}
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
