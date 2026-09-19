import { useEffect, useMemo, useRef } from 'react';
import { getMapsApiKey, loadGoogleMaps } from '@/utils/googleMaps';

/**
 * Explore map — Google Maps only.
 */
const NANYUKI = { lat: -0.0167, lng: 37.0728 };

function googlePinSvg(active) {
    const bg = active ? '#f2b82e' : '#4b533a';
    const ring = active ? '#1c1712' : '#ffffff';
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="34" viewBox="0 0 30 34">
        <circle cx="15" cy="15" r="13" fill="${bg}" stroke="${ring}" stroke-width="2.5"/>
        <circle cx="15" cy="15" r="4" fill="#ffffff"/>
      </svg>
    `)}`;
}

export default function ExploreMap({
    listings = [],
    activeId = null,
    onSelect,
    visible = true,
    onClose,
    className = '',
}) {
    const googleKey = getMapsApiKey();
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef(new Map());
    const infoWindowRef = useRef(null);
    const onSelectRef = useRef(onSelect);
    onSelectRef.current = onSelect;

    const points = useMemo(
        () =>
            listings.filter(
                (item) =>
                    typeof item.lat === 'number' &&
                    typeof item.lng === 'number',
            ),
        [listings],
    );

    useEffect(() => {
        if (!visible || !googleKey) return undefined;

        let cancelled = false;

        loadGoogleMaps(googleKey, { libraries: [] })
            .then((maps) => {
                if (cancelled || !containerRef.current || mapRef.current) return;

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
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, [visible, googleKey]);

    useEffect(() => {
        if (!visible) return undefined;
        return () => {
            if (mapRef.current) {
                markersRef.current.forEach((marker) => marker.setMap(null));
                infoWindowRef.current?.close();
                mapRef.current = null;
                markersRef.current.clear();
                infoWindowRef.current = null;
            }
        };
    }, [visible]);

    useEffect(() => {
        if (!visible || !googleKey) return;
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
                icon: {
                    url: googlePinSvg(active),
                    scaledSize: new maps.Size(30, 34),
                    anchor: new maps.Point(15, 30),
                },
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
    }, [points, activeId, visible, googleKey]);

    useEffect(() => {
        if (!visible || !activeId || !mapRef.current) return;
        const marker = markersRef.current.get(String(activeId));
        if (!marker) return;
        const position = marker.getPosition();
        if (position) mapRef.current.panTo(position);
    }, [activeId, visible]);

    if (!visible) return null;

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

            <div className="pointer-events-none absolute left-3 top-3 z-[400] flex items-center gap-2">
                <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-olive-800 shadow-soft">
                    {points.length} on map
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
        </div>
    );
}
