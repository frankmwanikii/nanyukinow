import { MapPin, Navigation } from 'lucide-react';
import { useEffect, useRef } from 'react';
import DetailSection from './DetailSection';

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
                    className: '',
                    html: `<div style="width:28px;height:28px;border-radius:9999px;background:#f2b82e;border:2.5px solid #1c1712;box-shadow:0 6px 16px rgba(28,23,18,.35);"></div>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14],
                });

                L.marker([listing.lat, listing.lng], { icon }).addTo(map);
                mapRef.current = map;
                setTimeout(() => map.invalidateSize(), 100);
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
        <DetailSection id="contact" title="Directions">
            <div className="overflow-hidden rounded-xl bg-olive-100">
                {hasCoords ? (
                    <div ref={containerRef} className="h-52 w-full sm:h-56" />
                ) : (
                    <div className="flex h-52 items-center justify-center text-sm text-olive-600 sm:h-56">
                        Map unavailable
                    </div>
                )}
            </div>
            <p className="mt-3 flex items-start gap-2 text-sm text-olive-700">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mustard" />
                <span>{listing.address || listing.location}</span>
            </p>
            <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-olive-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950"
            >
                <Navigation className="h-4 w-4" />
                Get directions
            </a>
        </DetailSection>
    );
}
