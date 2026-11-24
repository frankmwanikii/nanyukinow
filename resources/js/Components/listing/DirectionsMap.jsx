import { useCallback, useEffect, useRef, useState } from 'react';
import { CompassMark, ForwardMark, PinMark } from '@/Components/site/Mark';
import {
    GOOGLE_MAPS_AUTH_HELP,
    getMapsApiKey,
    loadGoogleMaps,
    onGoogleMapsAuthFailure,
} from '@/utils/googleMaps';
import { L, createOsmMap, leafletPinIcon } from '@/utils/leafletMaps';
import { googleMapPinIcon, LISTING_MAP_STYLES } from '@/utils/mapPin';
import {
    directionsUrlFor,
    useMapProvider,
    useMapsApiKey,
} from '@/utils/mapProvider';
import { formatPlaceLine } from '@/utils/placeLabel';
import DetailSection, { useDetailSectionTone } from './DetailSection';

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

/** Google Open Location Code fragment, e.g. Q49M+H4H or X3W9+5Q9. */
function isPlusCodePart(part) {
    return /^[A-Z0-9]{2,}\+[A-Z0-9]+$/i.test(String(part || '').trim());
}

/**
 * Drop Plus Codes from a geocoded address string.
 * "Q49M+H4H, Naro Moru, Kenya" → "Naro Moru, Kenya"
 */
function stripPlusCodes(address) {
    return String(address || '')
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part && !isPlusCodePart(part))
        .join(', ');
}

/**
 * Place line for the map header: Town, County, Kenya.
 * Never lead with a Plus Code street string.
 */
function placeHierarchy(listing) {
    const primary = formatPlaceLine(listing, { stripPlusCodes });

    return { primary, secondary: null };
}

function directionsLabel(listing) {
    const cleaned = stripPlusCodes(listing?.address);
    if (cleaned) {
        return cleaned;
    }
    return listing?.location || listing?.city || null;
}

function userDotIconLeaflet() {
    return L.divIcon({
        className: 'nn-user-location-dot',
        html: '<span class="nn-user-location-dot__pulse"></span><span class="nn-user-location-dot__core"></span>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });
}

function userDotIconGoogle(maps) {
    return {
        path: maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2.5,
    };
}

function MapCanvas({
    containerRef,
    showMap,
    provider,
    googleKey,
    status,
    frameClassName,
    locateStatus,
    onLocate,
    locateMessage,
}) {
    const locating = locateStatus === 'locating';
    const located = locateStatus === 'ready';

    return (
        <div
            className={`nn-directions-map-frame relative z-0 overflow-hidden bg-olive-100 ${frameClassName}`}
        >
            {showMap ? (
                <div ref={containerRef} className="h-full w-full" />
            ) : (
                <div className="flex h-full items-center justify-center px-4 text-center text-sm text-olive-600">
                    {provider === 'google' && !googleKey
                        ? 'Google Maps API key required'
                        : 'Map unavailable'}
                </div>
            )}

            {showMap && status === 'ready' ? (
                <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex max-w-[min(100%-5.5rem,16rem)] flex-col items-start gap-2">
                    <button
                        type="button"
                        onClick={onLocate}
                        disabled={locating}
                        aria-label={
                            locating
                                ? 'Finding your location'
                                : located
                                  ? 'Update my location'
                                  : 'Use my location'
                        }
                        title={
                            locating
                                ? 'Finding your location…'
                                : 'Use my location for directions'
                        }
                        className={`pointer-events-auto inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-olive-900/10 bg-white px-3.5 text-sm font-semibold text-olive-900 shadow-soft transition hover:border-olive-900/25 hover:bg-mustard hover:text-earth-dusk disabled:cursor-wait disabled:opacity-70 ${
                            located ? 'ring-2 ring-sky-400/60' : ''
                        }`}
                    >
                        <CompassMark
                            className={`h-4 w-4 shrink-0 ${
                                locating ? 'animate-pulse' : ''
                            }`}
                        />
                        <span className="pr-0.5">
                            {locating
                                ? 'Finding…'
                                : located
                                  ? 'My location'
                                  : 'My location'}
                        </span>
                    </button>
                    {locateMessage ? (
                        <p className="pointer-events-none rounded-md bg-white/95 px-2.5 py-1.5 text-xs font-medium text-olive-700 shadow-soft">
                            {locateMessage}
                        </p>
                    ) : null}
                </div>
            ) : null}

            {status === 'error' ? (
                <p className="absolute inset-x-0 bottom-2 px-3 text-center text-xs text-rose-700">
                    {provider === 'google'
                        ? GOOGLE_MAPS_AUTH_HELP
                        : 'Map failed to load.'}
                </p>
            ) : null}
        </div>
    );
}

/** Google Maps route line blue (familiar directions look). */
const ROUTE_STROKE = '#4285F4';

async function ensureGoogleDirections(maps) {
    if (
        typeof maps?.DirectionsService === 'function' &&
        typeof maps?.DirectionsRenderer === 'function'
    ) {
        return maps;
    }

    if (typeof maps?.importLibrary === 'function') {
        const routes = await maps.importLibrary('routes');
        if (routes && typeof routes === 'object') {
            Object.assign(maps, routes);
            if (routes.DirectionsService && !maps.DirectionsService) {
                maps.DirectionsService = routes.DirectionsService;
            }
            if (routes.DirectionsRenderer && !maps.DirectionsRenderer) {
                maps.DirectionsRenderer = routes.DirectionsRenderer;
            }
            if (routes.TravelMode && !maps.TravelMode) {
                maps.TravelMode = routes.TravelMode;
            }
        }
    }

    return maps;
}

export default function DirectionsMap({ listing }) {
    const provider = useMapProvider();
    const sharedMapsKey = useMapsApiKey();
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const mapsLibRef = useRef(null);
    const userMarkerRef = useRef(null);
    const directionsRendererRef = useRef(null);
    const routeLayerRef = useRef(null);
    const googleKey = getMapsApiKey(sharedMapsKey);
    const [status, setStatus] = useState('loading');
    const [userLocation, setUserLocation] = useState(null);
    const [locateStatus, setLocateStatus] = useState('idle');
    const [locateMessage, setLocateMessage] = useState(null);

    const { lat, lng } = resolveLatLng(listing);
    const hasCoords = lat !== null && lng !== null;

    const clearRoute = useCallback(() => {
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null);
            directionsRendererRef.current = null;
        }
        if (routeLayerRef.current) {
            if (routeLayerRef.current.remove) {
                routeLayerRef.current.remove();
            }
            routeLayerRef.current = null;
        }
    }, []);

    const clearUserMarker = useCallback(() => {
        const marker = userMarkerRef.current;
        if (!marker) {
            return;
        }
        if (marker.remove) {
            marker.remove();
        } else if (marker.setMap) {
            marker.setMap(null);
        }
        userMarkerRef.current = null;
    }, []);

    const fitUserAndDest = useCallback(
        (userLat, userLng) => {
            const map = mapRef.current;
            if (!map || userLat == null || userLng == null) {
                return;
            }

            if (provider === 'leaflet' && map.fitBounds) {
                const bounds = L.latLngBounds(
                    [userLat, userLng],
                    [lat, lng],
                );
                map.fitBounds(bounds.pad(0.2), { maxZoom: 14 });
                return;
            }

            const maps = mapsLibRef.current;
            if (provider === 'google' && maps?.LatLngBounds) {
                const bounds = new maps.LatLngBounds();
                bounds.extend({ lat: userLat, lng: userLng });
                bounds.extend({ lat, lng });
                map.fitBounds(bounds, {
                    top: 48,
                    right: 48,
                    bottom: 48,
                    left: 48,
                });
            }
        },
        [lat, lng, provider],
    );

    const placeUserMarker = useCallback(
        (userLat, userLng) => {
            const map = mapRef.current;
            if (!map || userLat == null || userLng == null) {
                return;
            }

            if (provider === 'leaflet') {
                if (userMarkerRef.current?.setLatLng) {
                    userMarkerRef.current.setLatLng([userLat, userLng]);
                } else {
                    clearUserMarker();
                    userMarkerRef.current = L.marker([userLat, userLng], {
                        icon: userDotIconLeaflet(),
                        title: 'Your location',
                        zIndexOffset: 700,
                        interactive: false,
                    }).addTo(map);
                }
                return;
            }

            const maps = mapsLibRef.current;
            if (!maps) {
                return;
            }

            const position = { lat: userLat, lng: userLng };
            if (userMarkerRef.current?.setPosition) {
                userMarkerRef.current.setPosition(position);
            } else {
                clearUserMarker();
                userMarkerRef.current = new maps.Marker({
                    map,
                    position,
                    title: 'Your location',
                    icon: userDotIconGoogle(maps),
                    optimized: false,
                    clickable: false,
                    zIndex: 1000,
                });
            }
        },
        [clearUserMarker, provider],
    );

    const drawRouteToListing = useCallback(
        async (userLat, userLng) => {
            const map = mapRef.current;
            if (!map || userLat == null || userLng == null || lat == null || lng == null) {
                return;
            }

            if (provider === 'leaflet') {
                clearRoute();
                try {
                    const url =
                        `https://router.project-osrm.org/route/v1/driving/` +
                        `${userLng},${userLat};${lng},${lat}` +
                        `?overview=full&geometries=geojson`;
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error('Route request failed');
                    }
                    const data = await response.json();
                    const geometry = data?.routes?.[0]?.geometry?.coordinates;
                    if (data?.code !== 'Ok' || !Array.isArray(geometry) || geometry.length < 2) {
                        throw new Error('No route');
                    }
                    const latLngs = geometry.map(([x, y]) => [y, x]);
                    const line = L.polyline(latLngs, {
                        color: ROUTE_STROKE,
                        weight: 5,
                        opacity: 0.9,
                        lineJoin: 'round',
                        lineCap: 'round',
                    }).addTo(map);
                    routeLayerRef.current = line;
                    map.fitBounds(line.getBounds().pad(0.18), { maxZoom: 15 });
                    setLocateMessage('Route drawn from where you are.');
                } catch {
                    fitUserAndDest(userLat, userLng);
                    setLocateMessage(
                        'Could not draw a route. You can still open directions.',
                    );
                }
                return;
            }

            const maps = mapsLibRef.current;
            if (!maps) {
                return;
            }

            try {
                await ensureGoogleDirections(maps);
                if (
                    typeof maps.DirectionsService !== 'function' ||
                    typeof maps.DirectionsRenderer !== 'function'
                ) {
                    throw new Error('Directions unavailable');
                }

                const service = new maps.DirectionsService();
                if (!directionsRendererRef.current) {
                    directionsRendererRef.current = new maps.DirectionsRenderer({
                        map,
                        suppressMarkers: true,
                        preserveViewport: false,
                        polylineOptions: {
                            strokeColor: ROUTE_STROKE,
                            strokeOpacity: 0.9,
                            strokeWeight: 5,
                        },
                    });
                } else {
                    directionsRendererRef.current.setMap(map);
                }

                service.route(
                    {
                        origin: { lat: userLat, lng: userLng },
                        destination: { lat, lng },
                        travelMode: maps.TravelMode?.DRIVING || 'DRIVING',
                    },
                    (result, routeStatus) => {
                        if (routeStatus === 'OK' && result) {
                            directionsRendererRef.current.setDirections(result);
                            setLocateMessage('Route drawn from where you are.');
                            return;
                        }
                        fitUserAndDest(userLat, userLng);
                        setLocateMessage(
                            'Could not draw a route. You can still open directions.',
                        );
                    },
                );
            } catch {
                fitUserAndDest(userLat, userLng);
                setLocateMessage(
                    'Could not draw a route. You can still open directions.',
                );
            }
        },
        [clearRoute, fitUserAndDest, lat, lng, provider],
    );

    const handleLocate = useCallback(() => {
        if (!navigator?.geolocation) {
            setLocateStatus('error');
            setLocateMessage('Location is not available in this browser.');
            return;
        }

        setLocateStatus('locating');
        setLocateMessage(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = Number(position.coords.latitude.toFixed(7));
                const userLng = Number(position.coords.longitude.toFixed(7));
                setLocateMessage('Drawing route…');
                setLocateStatus('ready');
                setUserLocation({ lat: userLat, lng: userLng });
            },
            (error) => {
                if (error?.code === error.PERMISSION_DENIED) {
                    setLocateStatus('denied');
                    setLocateMessage(
                        'Allow location access to draw a route from where you are.',
                    );
                    return;
                }
                setLocateStatus('error');
                setLocateMessage(
                    'Could not find your location. Try again or open Get directions.',
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 12_000,
                maximumAge: 60_000,
            },
        );
    }, []);

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
                    icon: leafletPinIcon({
                        teardrop: true,
                        title: listing?.title || '',
                    }),
                    title: listing?.title || listing?.address || '',
                    zIndexOffset: 600,
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

            loadGoogleMaps(googleKey, { libraries: ['routes'] })
                .then((maps) => {
                    if (cancelled || !containerRef.current || mapRef.current) {
                        return;
                    }

                    mapsLibRef.current = maps;
                    containerRef.current.innerHTML = '';
                    const map = new maps.Map(containerRef.current, {
                        center: { lat, lng },
                        zoom: mapZoom,
                        mapTypeId: 'roadmap',
                        mapTypeControl: false,
                        // Keep exploration on-site: fullscreen, zoom, Street View.
                        fullscreenControl: true,
                        fullscreenControlOptions: {
                            position: maps.ControlPosition.RIGHT_TOP,
                        },
                        zoomControl: true,
                        zoomControlOptions: {
                            position: maps.ControlPosition.RIGHT_TOP,
                        },
                        streetViewControl: true,
                        streetViewControlOptions: {
                            position: maps.ControlPosition.RIGHT_TOP,
                        },
                        clickableIcons: false,
                        gestureHandling: 'cooperative',
                        styles: LISTING_MAP_STYLES,
                    });

                    new maps.Marker({
                        map,
                        position: { lat, lng },
                        title: listing?.title || listing?.address || '',
                        icon: googleMapPinIcon(maps, {
                            listing: true,
                            title: listing?.title || '',
                        }),
                        optimized: false,
                        zIndex: 999,
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
            clearRoute();
            clearUserMarker();
            if (mapRef.current?.remove) {
                mapRef.current.remove();
            }
            mapRef.current = null;
            mapsLibRef.current = null;
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
        clearRoute,
        clearUserMarker,
    ]);

    useEffect(() => {
        if (
            status === 'ready' &&
            userLocation?.lat != null &&
            userLocation?.lng != null
        ) {
            placeUserMarker(userLocation.lat, userLocation.lng);
            drawRouteToListing(userLocation.lat, userLocation.lng);
        }
    }, [status, userLocation, placeUserMarker, drawRouteToListing]);

    if (!listing) return null;

    // Need a pin to show Directions (address-only is not enough for a map).
    if (!hasCoords) return null;

    const directionsUrl = directionsUrlFor(provider, {
        lat,
        lng,
        query: listing.address || listing.title || 'Nanyuki',
        origin: userLocation,
    });

    const showMap = provider === 'leaflet' || Boolean(googleKey);
    const tone = useDetailSectionTone();
    const isOpen = tone === 'open';
    const isRail = tone === 'rail';
    const { primary, secondary } = placeHierarchy(listing);

    const mapCanvas = (
        <MapCanvas
            containerRef={containerRef}
            showMap={showMap}
            provider={provider}
            googleKey={googleKey}
            status={status}
            locateStatus={locateStatus}
            onLocate={handleLocate}
            locateMessage={locateMessage}
            frameClassName={
                isOpen
                    ? 'h-72 overflow-hidden rounded-2xl border border-olive-900/10 sm:h-[22rem] lg:h-[26rem]'
                    : 'h-56 border-b border-olive-900/10 sm:h-64'
            }
        />
    );

    const directionsCta = (
        <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className={
                isOpen
                    ? 'inline-flex min-h-11 w-full items-center justify-center gap-2 bg-olive-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-earth-dusk sm:w-auto'
                    : 'inline-flex min-h-11 w-full items-center justify-center gap-2 bg-olive-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950'
            }
        >
            {userLocation ? 'Directions from me' : 'Get directions'}
            <ForwardMark className="h-4 w-4" />
        </a>
    );

    if (isOpen) {
        return (
            <DetailSection id="location" title="Getting here">
                <div className="space-y-5">
                    {primary ? (
                        <div className="min-w-0">
                            <p className="text-base font-semibold tracking-tight text-earth-dusk sm:text-lg">
                                {primary}
                            </p>
                            {secondary ? (
                                <p className="mt-1 text-sm leading-relaxed text-olive-600 sm:text-[0.95rem]">
                                    {secondary}
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    {mapCanvas}

                    {directionsCta}
                </div>
            </DetailSection>
        );
    }

    const shell = isRail
        ? 'relative z-0 isolate min-w-0 overflow-hidden border border-olive-900/20 bg-white'
        : 'relative z-0 isolate min-w-0 overflow-hidden border border-olive-900/15 bg-white';
    const headerPad = isRail
        ? 'border-b border-olive-900/10 px-4 py-3'
        : 'border-b border-olive-900/10 px-4 py-3 sm:px-5 sm:py-3.5';
    const bodyPad = isRail
        ? 'space-y-3 px-4 py-4'
        : 'space-y-3 px-4 py-4 sm:px-5 sm:py-5';

    return (
        <section id="contact" className={shell}>
            <div className={headerPad}>
                <h2 className="font-display text-base font-semibold tracking-tight text-earth-dusk">
                    Directions
                </h2>
            </div>

            {mapCanvas}

            <div className={bodyPad}>
                {directionsLabel(listing) ? (
                    <p className="flex items-start gap-2 text-sm text-olive-800">
                        <PinMark className="mt-0.5 h-4 w-4 shrink-0 text-mustard" />
                        <span>{directionsLabel(listing)}</span>
                    </p>
                ) : null}
                {directionsCta}
            </div>
        </section>
    );
}
