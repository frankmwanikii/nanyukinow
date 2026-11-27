import { useEffect, useMemo, useRef, useState } from 'react';
import {
    GOOGLE_MAPS_AUTH_HELP,
    getMapsApiKey,
    loadGoogleMaps,
    onGoogleMapsAuthFailure,
} from '@/utils/googleMaps';
import {
    L,
    NANYUKI,
    createOsmMap,
    leafletPinIcon,
} from '@/utils/leafletMaps';
import { googleMapPinIcon } from '@/utils/mapPin';
import { useMapProvider, useMapsApiKey } from '@/utils/mapProvider';

/**
 * Explore map — Google Maps or OpenStreetMap (Leaflet).
 */

function MapChrome({ pointsCount, onClose }) {
    return (
        <>
            <div className="pointer-events-none absolute left-3 top-3 z-[400] flex items-center gap-2">
                <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-olive-800 shadow-soft">
                    {pointsCount} on map
                </span>
            </div>

            {onClose ? (
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-3 z-[400] rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-olive-800 shadow-soft transition hover:bg-mustard"
                >
                    Close map
                </button>
            ) : null}
        </>
    );
}

function hasMapPoint(item) {
    return (
        Number.isFinite(Number(item?.lat ?? item?.latitude)) &&
        Number.isFinite(Number(item?.lng ?? item?.longitude))
    );
}

function toPoint(item) {
    return {
        id: item.id,
        title: item.title,
        lat: Number(item.lat ?? item.latitude),
        lng: Number(item.lng ?? item.longitude),
    };
}

function GoogleExploreMap({
    points,
    activeId,
    onSelect,
    visible,
    onClose,
    className,
}) {
    const sharedMapsKey = useMapsApiKey();
    const googleKey = getMapsApiKey(sharedMapsKey);
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef(new Map());
    const infoWindowRef = useRef(null);
    const onSelectRef = useRef(onSelect);
    const [authError, setAuthError] = useState(null);
    const [mapReady, setMapReady] = useState(false);
    onSelectRef.current = onSelect;

    useEffect(() => {
        if (!visible || !googleKey) {
            setMapReady(false);
            return undefined;
        }

        let cancelled = false;
        setAuthError(null);
        setMapReady(false);

        const stopAuthWatch = onGoogleMapsAuthFailure(() => {
            if (!cancelled) {
                setAuthError(GOOGLE_MAPS_AUTH_HELP);
            }
        });

        loadGoogleMaps(googleKey, { libraries: [] })
            .then((maps) => {
                if (cancelled || !containerRef.current) return;

                if (!mapRef.current) {
                    mapRef.current = new maps.Map(containerRef.current, {
                        center: NANYUKI,
                        zoom: 12,
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                        clickableIcons: false,
                        gestureHandling: 'greedy',
                    });
                    infoWindowRef.current = new maps.InfoWindow();
                }

                // Mobile panel animates open; resize once layout settles.
                window.setTimeout(() => {
                    if (!cancelled && mapRef.current) {
                        maps.event.trigger(mapRef.current, 'resize');
                    }
                }, 320);

                if (!cancelled) {
                    setMapReady(true);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setAuthError(GOOGLE_MAPS_AUTH_HELP);
                    setMapReady(false);
                }
            });

        return () => {
            cancelled = true;
            stopAuthWatch();
            markersRef.current.forEach((marker) => marker.setMap(null));
            markersRef.current.clear();
            infoWindowRef.current?.close();
            mapRef.current = null;
            infoWindowRef.current = null;
            setMapReady(false);
        };
    }, [visible, googleKey]);

    useEffect(() => {
        if (!visible || !googleKey || !mapReady) return;
        const map = mapRef.current;
        const maps = typeof window !== 'undefined' ? window.google?.maps : null;
        if (!map || !maps) return;

        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current.clear();

        const bounds = new maps.LatLngBounds();

        points.forEach((item) => {
            const active = String(item.id) === String(activeId);
            const position = { lat: item.lat, lng: item.lng };
            const marker = new maps.Marker({
                map,
                position,
                title: item.title,
                icon: googleMapPinIcon(maps, { active }),
                optimized: false,
                zIndex: active ? 1000 : 1,
            });

            marker.addListener('click', () => {
                onSelectRef.current?.(item.id);
                if (infoWindowRef.current) {
                    infoWindowRef.current.setContent(
                        `<div style="font:600 13px/1.3 system-ui,sans-serif;color:#1c1712;padding:2px 4px;">${item.title ?? ''}</div>`,
                    );
                    infoWindowRef.current.open({ map, anchor: marker });
                }
            });

            markersRef.current.set(String(item.id), marker);
            bounds.extend(position);
        });

        if (points.length > 1) {
            map.fitBounds(bounds, 48);
        } else if (points.length === 1) {
            map.setCenter({ lat: points[0].lat, lng: points[0].lng });
            map.setZoom(13);
        } else {
            map.setCenter(NANYUKI);
            map.setZoom(12);
        }

        maps.event.trigger(map, 'resize');
    }, [points, activeId, visible, googleKey, mapReady]);

    useEffect(() => {
        if (!visible || !mapReady || !activeId || !mapRef.current) return;
        const marker = markersRef.current.get(String(activeId));
        if (!marker) return;
        const position = marker.getPosition();
        if (position) mapRef.current.panTo(position);
    }, [activeId, visible, mapReady]);

    return (
        <div
            className={`relative z-0 h-full min-h-[280px] isolate overflow-hidden bg-olive-100 ${className}`}
        >
            {googleKey ? (
                <div ref={containerRef} className="absolute inset-0 z-0" />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-olive-600">
                    Google Maps API key required
                </div>
            )}
            {authError ? (
                <div className="absolute inset-x-3 bottom-3 z-[500] rounded-md bg-white/95 px-3 py-2 text-xs text-rose-700 shadow-soft sm:text-sm">
                    {authError}
                </div>
            ) : null}
            <MapChrome pointsCount={points.length} onClose={onClose} />
        </div>
    );
}

function LeafletExploreMap({
    points,
    activeId,
    onSelect,
    visible,
    onClose,
    className,
}) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const layerRef = useRef(null);
    const onSelectRef = useRef(onSelect);
    const [mapReady, setMapReady] = useState(false);
    onSelectRef.current = onSelect;

    useEffect(() => {
        if (!visible || !containerRef.current || mapRef.current) {
            return undefined;
        }

        const map = createOsmMap(containerRef.current, {
            center: NANYUKI,
            zoom: 12,
        });
        mapRef.current = map;
        layerRef.current = L.layerGroup().addTo(map);
        setMapReady(true);

        const resizeTimer = window.setTimeout(() => {
            map.invalidateSize();
        }, 320);

        return () => {
            window.clearTimeout(resizeTimer);
            map.remove();
            mapRef.current = null;
            layerRef.current = null;
            setMapReady(false);
        };
    }, [visible]);

    useEffect(() => {
        if (!visible || !mapReady) return;
        const map = mapRef.current;
        const layer = layerRef.current;
        if (!map || !layer) return;

        layer.clearLayers();
        const bounds = [];

        points.forEach((item) => {
            const active = String(item.id) === String(activeId);
            const marker = L.marker([item.lat, item.lng], {
                icon: leafletPinIcon({ active }),
                title: item.title || '',
                zIndexOffset: active ? 1000 : 0,
            });

            marker.bindPopup(
                `<div style="font:600 13px/1.3 system-ui,sans-serif;color:#1c1712;padding:2px 4px;">${item.title ?? ''}</div>`,
            );
            marker.on('click', () => onSelectRef.current?.(item.id));
            layer.addLayer(marker);
            bounds.push([item.lat, item.lng]);
        });

        if (bounds.length > 1) {
            map.fitBounds(bounds, { padding: [48, 48] });
        } else if (bounds.length === 1) {
            map.setView(bounds[0], 13);
        } else {
            map.setView([NANYUKI.lat, NANYUKI.lng], 12);
        }

        requestAnimationFrame(() => map.invalidateSize());
    }, [points, activeId, visible, mapReady]);

    useEffect(() => {
        if (!visible || !mapReady || !activeId || !mapRef.current) return;
        const point = points.find((p) => String(p.id) === String(activeId));
        if (point) {
            mapRef.current.panTo([point.lat, point.lng]);
        }
    }, [activeId, visible, points, mapReady]);

    return (
        <div
            className={`relative z-0 h-full min-h-[280px] isolate overflow-hidden bg-olive-100 ${className}`}
        >
            <div ref={containerRef} className="absolute inset-0 z-0" />
            <MapChrome pointsCount={points.length} onClose={onClose} />
        </div>
    );
}

export default function ExploreMap({
    listings = [],
    activeId = null,
    onSelect,
    visible = true,
    onClose,
    className = '',
}) {
    const provider = useMapProvider();

    const points = useMemo(
        () => listings.filter(hasMapPoint).map(toPoint),
        [listings],
    );

    if (!visible) return null;

    if (provider === 'leaflet') {
        return (
            <LeafletExploreMap
                points={points}
                activeId={activeId}
                onSelect={onSelect}
                visible={visible}
                onClose={onClose}
                className={className}
            />
        );
    }

    return (
        <GoogleExploreMap
            points={points}
            activeId={activeId}
            onSelect={onSelect}
            visible={visible}
            onClose={onClose}
            className={className}
        />
    );
}
