import { MapPin } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';

/**
 * Map panel for Explore.
 *
 * Today: Leaflet + OSM (no API key).
 * Later: set VITE_GOOGLE_MAPS_API_KEY and provider will switch to Google Maps
 * using the same listings / activeId / onSelect contract.
 */
const NANYUKI = { lat: -0.0167, lng: 37.0728 };
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

let leafletLoader = null;

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

function useMapProvider() {
    const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    return googleKey ? 'google' : 'leaflet';
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
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef(new Map());
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

    // Leaflet implementation (default until Google key is configured)
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

    useEffect(() => {
        if (!visible) return undefined;
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markersRef.current.clear();
            }
        };
    }, [visible]);

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

    useEffect(() => {
        if (!visible || !activeId || !mapRef.current) return;
        const marker = markersRef.current.get(String(activeId));
        if (marker) mapRef.current.panTo(marker.getLatLng(), { animate: true });
    }, [activeId, visible]);

    if (!visible) return null;

    return (
        <div
            className={`relative h-full min-h-[280px] overflow-hidden bg-olive-100 ${className}`}
        >
            {provider === 'google' ? (
                <GoogleMapsPlaceholder
                    points={points}
                    activeId={activeId}
                    onSelect={onSelect}
                />
            ) : (
                <div ref={containerRef} className="absolute inset-0 z-0" />
            )}

            <div className="pointer-events-none absolute left-3 top-3 z-[400] flex items-center gap-2">
                <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-olive-800 shadow-soft">
                    {points.length} on map
                </span>
                {provider === 'leaflet' ? (
                    <span className="rounded-full bg-olive-800/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90">
                        Preview map · Google later
                    </span>
                ) : null}
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

/**
 * Stub for Google Maps — wire Maps JS API here when
 * VITE_GOOGLE_MAPS_API_KEY is available.
 */
function GoogleMapsPlaceholder({ points }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-olive-100 via-earth-sand to-olive-200 px-6 text-center">
            <MapPin className="h-10 w-10 text-olive-600" />
            <div>
                <p className="font-display text-lg font-semibold text-earth-dusk">
                    Google Maps ready
                </p>
                <p className="mt-1 max-w-sm text-sm text-olive-600">
                    API key detected. Connect the Maps JavaScript SDK to plot{' '}
                    {points.length} listing pin
                    {points.length === 1 ? '' : 's'}.
                </p>
            </div>
        </div>
    );
}
