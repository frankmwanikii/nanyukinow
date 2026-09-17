import { useEffect, useMemo, useRef } from 'react';

/**
 * Map panel for Explore.
 *
 * Uses Google Maps when VITE_GOOGLE_MAPS_API_KEY is set; otherwise Leaflet + OSM.
 */
const NANYUKI = { lat: -0.0167, lng: 37.0728 };
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

let leafletLoader = null;
let googleLoader = null;

function loadLeaflet() {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('No window'));
    }
    if (window.L) return Promise.resolve(window.L);
    if (leafletLoader) return leafletLoader;

    leafletLoader = new Promise((resolve, reject) => {
        if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = LEAFLET_CSS;
            document.head.appendChild(link);
        }

        const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve(window.L));
            existing.addEventListener('error', reject);
            if (window.L) resolve(window.L);
            return;
        }

        const script = document.createElement('script');
        script.src = LEAFLET_JS;
        script.async = true;
        script.onload = () => resolve(window.L);
        script.onerror = reject;
        document.body.appendChild(script);
    });

    return leafletLoader;
}

function loadGoogleMaps(apiKey) {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('No window'));
    }
    if (window.google?.maps) return Promise.resolve(window.google.maps);
    if (googleLoader) return googleLoader;

    googleLoader = new Promise((resolve, reject) => {
        const src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
        const existing = document.querySelector(`script[src^="https://maps.googleapis.com/maps/api/js"]`);

        if (existing) {
            existing.addEventListener('load', () => resolve(window.google.maps));
            existing.addEventListener('error', reject);
            if (window.google?.maps) resolve(window.google.maps);
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google.maps);
        script.onerror = reject;
        document.head.appendChild(script);
    });

    return googleLoader;
}

function pinHtml(active) {
    const bg = active ? '#f2b82e' : '#4b533a';
    const ring = active ? '#1c1712' : '#ffffff';
    return `
      <div style="
        width:30px;height:30px;border-radius:9999px;
        background:${bg};border:2.5px solid ${ring};
        box-shadow:0 6px 16px rgba(28,23,18,.35);
        display:flex;align-items:center;justify-content:center;
        transform:translateY(-4px);
      ">
        <span style="width:8px;height:8px;border-radius:9999px;background:#fff;"></span>
      </div>
    `;
}

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

function useMapProvider() {
    const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    return googleKey ? 'google' : 'leaflet';
}

function destroyMap(provider, map) {
    if (!map) return;
    if (provider === 'leaflet') {
        map.remove();
        return;
    }
    // Google Maps: clear listeners; DOM node is reused/unmounted by React
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
    const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
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

    // Init Leaflet
    useEffect(() => {
        if (provider !== 'leaflet' || !visible) return undefined;

        let cancelled = false;

        loadLeaflet()
            .then((L) => {
                if (cancelled || !containerRef.current) return;

                if (!mapRef.current) {
                    const map = L.map(containerRef.current, {
                        zoomControl: false,
                        attributionControl: true,
                        scrollWheelZoom: true,
                    }).setView([NANYUKI.lat, NANYUKI.lng], 12);

                    L.tileLayer(
                        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        {
                            maxZoom: 18,
                            attribution:
                                '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
                        },
                    ).addTo(map);

                    L.control.zoom({ position: 'topright' }).addTo(map);
                    mapRef.current = map;
                }

                setTimeout(() => mapRef.current?.invalidateSize(), 120);
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, [provider, visible]);

    // Init Google Maps
    useEffect(() => {
        if (provider !== 'google' || !visible || !googleKey) return undefined;

        let cancelled = false;

        loadGoogleMaps(googleKey)
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
    }, [provider, visible, googleKey]);

    useEffect(() => {
        if (!visible) return undefined;
        return () => {
            if (mapRef.current) {
                if (provider === 'leaflet') {
                    markersRef.current.forEach((marker) => marker.remove());
                } else {
                    markersRef.current.forEach((marker) => marker.setMap(null));
                    infoWindowRef.current?.close();
                }
                destroyMap(provider, mapRef.current);
                mapRef.current = null;
                markersRef.current.clear();
                infoWindowRef.current = null;
            }
        };
    }, [visible, provider]);

    // Leaflet markers
    useEffect(() => {
        if (provider !== 'leaflet' || !visible) return;
        const map = mapRef.current;
        const L = typeof window !== 'undefined' ? window.L : null;
        if (!map || !L) return;

        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current.clear();

        const bounds = [];

        points.forEach((item) => {
            const icon = L.divIcon({
                className: '',
                html: pinHtml(String(item.id) === String(activeId)),
                iconSize: [30, 30],
                iconAnchor: [15, 26],
            });

            const marker = L.marker([item.lat, item.lng], { icon })
                .addTo(map)
                .bindTooltip(item.title, {
                    direction: 'top',
                    offset: [0, -18],
                    opacity: 0.95,
                });

            marker.on('click', () => onSelectRef.current?.(item.id));
            markersRef.current.set(String(item.id), marker);
            bounds.push([item.lat, item.lng]);
        });

        if (bounds.length > 1) {
            map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
        } else if (bounds.length === 1) {
            map.setView(bounds[0], 13);
        } else {
            map.setView([NANYUKI.lat, NANYUKI.lng], 12);
        }

        setTimeout(() => map.invalidateSize(), 80);
    }, [points, activeId, provider, visible]);

    // Google markers
    useEffect(() => {
        if (provider !== 'google' || !visible) return;
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
    }, [points, activeId, provider, visible]);

    useEffect(() => {
        if (!visible || !activeId || !mapRef.current) return;
        const marker = markersRef.current.get(String(activeId));
        if (!marker) return;

        if (provider === 'leaflet') {
            mapRef.current.panTo(marker.getLatLng(), { animate: true });
            return;
        }

        const position = marker.getPosition();
        if (position) mapRef.current.panTo(position);
    }, [activeId, visible, provider]);

    if (!visible) return null;

    return (
        <div
            className={`relative z-0 h-full min-h-[280px] isolate overflow-hidden bg-olive-100 ${className}`}
        >
            <div ref={containerRef} className="absolute inset-0 z-0" />

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
