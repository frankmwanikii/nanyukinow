import { MapPin, Navigation } from 'lucide-react';
import { useEffect, useRef } from 'react';

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

function pinHtml() {
    return `
      <div style="position:relative;width:32px;height:40px;transform:translateY(-6px);">
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 6px 12px rgba(28,23,18,.35));">
          <path d="M16 0C8.268 0 2 6.268 2 14c0 9.5 12.2 24.4 13.1 25.5a1.2 1.2 0 0 0 1.8 0C17.8 38.4 30 23.5 30 14 30 6.268 23.732 0 16 0z" fill="#f2b82e"/>
          <path d="M16 0C8.268 0 2 6.268 2 14c0 9.5 12.2 24.4 13.1 25.5a1.2 1.2 0 0 0 1.8 0C17.8 38.4 30 23.5 30 14 30 6.268 23.732 0 16 0z" stroke="#1c1712" stroke-width="1.6"/>
          <circle cx="16" cy="14" r="5.5" fill="#1c1712"/>
          <circle cx="16" cy="14" r="2.4" fill="#ffffff"/>
        </svg>
      </div>
    `;
}

export default function DirectionsMap({ listing }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const hasCoords =
        typeof listing?.lat === 'number' && typeof listing?.lng === 'number';

    useEffect(() => {
        if (!hasCoords) return undefined;
        let cancelled = false;

        loadLeaflet()
            .then((L) => {
                if (cancelled || !containerRef.current) return;

                if (mapRef.current) {
                    mapRef.current.remove();
                    mapRef.current = null;
                }

                const map = L.map(containerRef.current, {
                    zoomControl: false,
                    scrollWheelZoom: false,
                }).setView([listing.lat, listing.lng], 14);

                L.tileLayer(
                    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    {
                        maxZoom: 18,
                        attribution:
                            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
                    },
                ).addTo(map);

                L.control.zoom({ position: 'topright' }).addTo(map);

                const icon = L.divIcon({
                    className: 'nn-map-pin',
                    html: pinHtml(),
                    iconSize: [32, 40],
                    iconAnchor: [16, 38],
                });

                L.marker([listing.lat, listing.lng], { icon }).addTo(map);
                mapRef.current = map;
                setTimeout(() => map.invalidateSize(), 120);
            })
            .catch(() => {});

        return () => {
            cancelled = true;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [hasCoords, listing?.lat, listing?.lng]);

    if (!listing) return null;

    const directionsUrl = hasCoords
        ? `https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              listing.address || listing.title || 'Nanyuki',
          )}`;

    return (
        <section
            id="contact"
            className="overflow-hidden rounded-2xl bg-white shadow-soft"
        >
            <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                <h2 className="font-display text-lg font-semibold text-earth-dusk sm:text-xl">
                    Directions
                </h2>
            </div>

            <div className="relative mt-4 bg-olive-100">
                {hasCoords ? (
                    <div
                        ref={containerRef}
                        className="h-56 w-full sm:h-64 [&_.leaflet-container]:!bg-olive-100 [&_.leaflet-control-zoom]:!border-0 [&_.leaflet-control-zoom]:!shadow-soft [&_.leaflet-control-zoom-in]:!rounded-t-lg [&_.leaflet-control-zoom-out]:!rounded-b-lg"
                    />
                ) : (
                    <div className="flex h-56 items-center justify-center text-sm text-olive-600 sm:h-64">
                        Map unavailable
                    </div>
                )}
            </div>

            <div className="space-y-3 px-5 py-4 sm:px-6 sm:py-5">
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
