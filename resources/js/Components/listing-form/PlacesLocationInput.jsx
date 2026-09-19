import { field, help, label } from './fieldStyles';
import { loadGoogleMaps } from '@/utils/googleMaps';
import { Loader2, MapPin, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const NANYUKI = { lat: -0.0166, lng: 37.0728 };
const DEFAULT_ZOOM = 14;
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

let leafletLoader = null;

function parseCoord(value) {
    const n = typeof value === 'number' ? value : Number.parseFloat(value);
    return Number.isFinite(n) ? n : null;
}

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

function leafletPinIcon(L) {
    return L.divIcon({
        className: '',
        html: `<div style="transform:translate(-50%,-100%)">
          <svg width="36" height="44" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 4px 8px rgba(28,23,18,.35))">
            <path d="M16 0C8.268 0 2 6.268 2 14c0 9.5 12.2 24.4 13.1 25.5a1.2 1.2 0 0 0 1.8 0C17.8 38.4 30 23.5 30 14 30 6.268 23.732 0 16 0z" fill="#f2b82e" stroke="#1c1712" stroke-width="1.6"/>
            <circle cx="16" cy="14" r="5.5" fill="#1c1712"/>
            <circle cx="16" cy="14" r="2.4" fill="#ffffff"/>
          </svg>
        </div>`,
        iconSize: [36, 44],
        iconAnchor: [18, 44],
    });
}

function googlePinIcon(maps) {
    return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 32 40">
            <path d="M16 0C8.268 0 2 6.268 2 14c0 9.5 12.2 24.4 13.1 25.5a1.2 1.2 0 0 0 1.8 0C17.8 38.4 30 23.5 30 14 30 6.268 23.732 0 16 0z" fill="#f2b82e" stroke="#1c1712" stroke-width="1.6"/>
            <circle cx="16" cy="14" r="5.5" fill="#1c1712"/>
            <circle cx="16" cy="14" r="2.4" fill="#ffffff"/>
          </svg>
        `)}`,
        scaledSize: new maps.Size(36, 44),
        anchor: new maps.Point(18, 44),
    };
}

function findComponent(components, type) {
    return components?.find((c) => c.types.includes(type))?.long_name || '';
}

function placeToFields(place) {
    const components = place.address_components || [];
    const pLat = place.geometry?.location?.lat?.();
    const pLng = place.geometry?.location?.lng?.();

    return {
        location:
            findComponent(components, 'locality') ||
            findComponent(components, 'sublocality') ||
            findComponent(components, 'neighborhood') ||
            findComponent(components, 'administrative_area_level_2') ||
            place.name ||
            '',
        city:
            findComponent(components, 'locality') ||
            findComponent(components, 'administrative_area_level_2') ||
            '',
        address: place.formatted_address || place.name || '',
        latitude: typeof pLat === 'number' ? Number(pLat.toFixed(7)) : null,
        longitude: typeof pLng === 'number' ? Number(pLng.toFixed(7)) : null,
    };
}

function nominatimToPrediction(item) {
    const parts = (item.display_name || '').split(', ');
    return {
        place_id: `osm-${item.place_id}`,
        description: item.display_name,
        structured_formatting: {
            main_text: parts[0] || item.display_name,
            secondary_text: parts.slice(1, 4).join(', '),
        },
        _osm: item,
        provider: 'osm',
    };
}

/**
 * Live map + search dropdown for listing location.
 * Uses Google when Maps tiles actually load; otherwise Leaflet + Nominatim.
 */
export default function PlacesLocationInput({
    apiKey,
    location,
    address,
    city,
    latitude,
    longitude,
    onChange,
    errors = {},
}) {
    const mapElRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const mapsRef = useRef(null);
    const leafletRef = useRef(null);
    const providerRef = useRef(null);
    const autocompleteServiceRef = useRef(null);
    const placesServiceRef = useRef(null);
    const sessionTokenRef = useRef(null);
    const debounceRef = useRef(null);
    const suppressSearchRef = useRef(false);
    const lastPreviewIdRef = useRef(null);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const [status, setStatus] = useState('loading');
    const [providerLabel, setProviderLabel] = useState('');
    const [query, setQuery] = useState(address || location || '');
    const [predictions, setPredictions] = useState([]);
    const [open, setOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [mapNote, setMapNote] = useState(null);

    const lat = parseCoord(latitude);
    const lng = parseCoord(longitude);

    const reverseGeocodeOsm = useCallback(async (rLat, rLng) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${rLat}&lon=${rLng}&addressdetails=1`,
                { headers: { Accept: 'application/json' } },
            );
            if (!res.ok) return;
            const data = await res.json();
            const addr = data.address || {};
            suppressSearchRef.current = true;
            setQuery(data.display_name || '');
            onChangeRef.current({
                location:
                    addr.suburb ||
                    addr.neighbourhood ||
                    addr.village ||
                    addr.town ||
                    addr.city ||
                    addr.county ||
                    'Nanyuki',
                city: addr.city || addr.town || addr.county || '',
                address: data.display_name || '',
                latitude: rLat,
                longitude: rLng,
            });
        } catch {
            // ignore
        }
    }, []);

    const reverseGeocodeGoogle = useCallback((rLat, rLng) => {
        const maps = mapsRef.current;
        if (!maps) return;
        new maps.Geocoder().geocode(
            { location: { lat: rLat, lng: rLng } },
            (results, s) => {
                if (s !== 'OK' || !results?.[0]) return;
                const fields = placeToFields(results[0]);
                suppressSearchRef.current = true;
                setQuery(fields.address || '');
                onChangeRef.current({
                    ...fields,
                    latitude: rLat,
                    longitude: rLng,
                });
            },
        );
    }, []);

    const moveMap = useCallback(
        (nextLat, nextLng, { zoom = 16 } = {}) => {
            if (nextLat == null || nextLng == null) return;

            if (providerRef.current === 'google') {
                const maps = mapsRef.current;
                const map = mapRef.current;
                if (!maps || !map) return;
                const position = { lat: nextLat, lng: nextLng };
                map.panTo(position);
                if (map.getZoom() < zoom) map.setZoom(zoom);

                if (markerRef.current) {
                    markerRef.current.setPosition(position);
                } else {
                    markerRef.current = new maps.Marker({
                        map,
                        position,
                        draggable: true,
                        animation: maps.Animation.DROP,
                        icon: googlePinIcon(maps),
                        title: 'Drag to fine-tune',
                    });
                    markerRef.current.addListener('dragend', () => {
                        const pos = markerRef.current.getPosition();
                        if (!pos) return;
                        const dLat = Number(pos.lat().toFixed(7));
                        const dLng = Number(pos.lng().toFixed(7));
                        onChangeRef.current({ latitude: dLat, longitude: dLng });
                        reverseGeocodeGoogle(dLat, dLng);
                    });
                }
                return;
            }

            if (providerRef.current === 'leaflet') {
                const L = leafletRef.current;
                const map = mapRef.current;
                if (!L || !map) return;
                map.setView([nextLat, nextLng], Math.max(map.getZoom(), zoom), {
                    animate: true,
                });
                if (markerRef.current) {
                    markerRef.current.setLatLng([nextLat, nextLng]);
                } else {
                    markerRef.current = L.marker([nextLat, nextLng], {
                        draggable: true,
                        icon: leafletPinIcon(L),
                    }).addTo(map);
                    markerRef.current.on('dragend', () => {
                        const pos = markerRef.current.getLatLng();
                        const dLat = Number(pos.lat.toFixed(7));
                        const dLng = Number(pos.lng.toFixed(7));
                        onChangeRef.current({ latitude: dLat, longitude: dLng });
                        reverseGeocodeOsm(dLat, dLng);
                    });
                }
            }
        },
        [reverseGeocodeGoogle, reverseGeocodeOsm],
    );

    const applyCoords = useCallback(
        (fields) => {
            suppressSearchRef.current = true;
            setQuery(fields.address || fields.location || '');
            setPredictions([]);
            setOpen(false);
            setActiveIndex(-1);
            onChangeRef.current(fields);
            moveMap(fields.latitude, fields.longitude);
        },
        [moveMap],
    );

    const selectPrediction = useCallback(
        (prediction) => {
            if (prediction.provider === 'osm' && prediction._osm) {
                const item = prediction._osm;
                const rLat = Number.parseFloat(item.lat);
                const rLng = Number.parseFloat(item.lon);
                const addr = item.address || {};
                applyCoords({
                    location:
                        addr.suburb ||
                        addr.neighbourhood ||
                        addr.village ||
                        addr.town ||
                        addr.city ||
                        prediction.structured_formatting?.main_text ||
                        'Nanyuki',
                    city: addr.city || addr.town || addr.county || '',
                    address: item.display_name || '',
                    latitude: Number(rLat.toFixed(7)),
                    longitude: Number(rLng.toFixed(7)),
                });
                return;
            }

            const service = placesServiceRef.current;
            if (!service || !prediction?.place_id) return;

            service.getDetails(
                {
                    placeId: prediction.place_id,
                    fields: [
                        'formatted_address',
                        'geometry',
                        'name',
                        'address_components',
                    ],
                    sessionToken: sessionTokenRef.current || undefined,
                },
                (place, s) => {
                    if (s !== 'OK' || !place) return;
                    applyCoords(placeToFields(place));
                    if (mapsRef.current?.places?.AutocompleteSessionToken) {
                        sessionTokenRef.current =
                            new mapsRef.current.places.AutocompleteSessionToken();
                    }
                },
            );
        },
        [applyCoords],
    );

    const searchOsm = useCallback(
        async (q) => {
            setSearching(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=ke&q=${encodeURIComponent(q)}`,
                    { headers: { Accept: 'application/json' } },
                );
                const data = res.ok ? await res.json() : [];
                const list = (data || []).map(nominatimToPrediction);
                setPredictions(list);
                setOpen(true);
                setActiveIndex(list.length ? 0 : -1);

                if (list[0]?._osm && list[0].place_id !== lastPreviewIdRef.current) {
                    lastPreviewIdRef.current = list[0].place_id;
                    moveMap(
                        Number.parseFloat(list[0]._osm.lat),
                        Number.parseFloat(list[0]._osm.lon),
                        { zoom: 13 },
                    );
                }
            } catch {
                setPredictions([]);
                setOpen(Boolean(q));
            } finally {
                setSearching(false);
            }
        },
        [moveMap],
    );

    const searchGoogle = useCallback(
        (q) => {
            const service = autocompleteServiceRef.current;
            if (!service) {
                searchOsm(q);
                return;
            }
            setSearching(true);
            const request = {
                input: q,
                componentRestrictions: { country: 'ke' },
                sessionToken: sessionTokenRef.current || undefined,
                radius: 50000,
            };
            if (mapRef.current?.getCenter) {
                request.location = mapRef.current.getCenter();
            } else if (mapsRef.current) {
                request.location = new mapsRef.current.LatLng(
                    NANYUKI.lat,
                    NANYUKI.lng,
                );
            }

            service.getPlacePredictions(request, (results, s) => {
                setSearching(false);
                if (s !== 'OK' || !results?.length) {
                    // Fall back to OSM results if Google Places returns nothing.
                    searchOsm(q);
                    return;
                }
                setPredictions(results.map((r) => ({ ...r, provider: 'google' })));
                setOpen(true);
                setActiveIndex(0);

                const first = results[0];
                if (
                    first?.place_id &&
                    placesServiceRef.current &&
                    first.place_id !== lastPreviewIdRef.current
                ) {
                    lastPreviewIdRef.current = first.place_id;
                    placesServiceRef.current.getDetails(
                        { placeId: first.place_id, fields: ['geometry'] },
                        (place, detailStatus) => {
                            if (
                                detailStatus !== 'OK' ||
                                !place?.geometry?.location
                            ) {
                                return;
                            }
                            moveMap(
                                place.geometry.location.lat(),
                                place.geometry.location.lng(),
                                { zoom: 13 },
                            );
                        },
                    );
                }
            });
        },
        [moveMap, searchOsm],
    );

    const runSearch = useCallback(
        (value) => {
            const q = value.trim();
            if (q.length < 2) {
                setPredictions([]);
                setOpen(false);
                setSearching(false);
                return;
            }
            if (providerRef.current === 'google') searchGoogle(q);
            else searchOsm(q);
        },
        [searchGoogle, searchOsm],
    );

    const destroyMap = () => {
        if (providerRef.current === 'leaflet' && mapRef.current?.remove) {
            mapRef.current.remove();
        }
        if (markerRef.current?.setMap) {
            markerRef.current.setMap(null);
        }
        markerRef.current = null;
        mapRef.current = null;
        if (mapElRef.current) mapElRef.current.innerHTML = '';
        providerRef.current = null;
    };

    const initLeaflet = useCallback(async (signal) => {
        const L = await loadLeaflet();
        if (signal?.cancelled || !mapElRef.current) return;

        // Clear any leftover nodes before Leaflet binds the container.
        if (mapElRef.current._leaflet_id) {
            delete mapElRef.current._leaflet_id;
        }
        mapElRef.current.innerHTML = '';

        leafletRef.current = L;
        providerRef.current = 'leaflet';

        const startLat = lat ?? NANYUKI.lat;
        const startLng = lng ?? NANYUKI.lng;

        const map = L.map(mapElRef.current, {
            zoomControl: true,
            scrollWheelZoom: true,
        }).setView([startLat, startLng], lat != null ? 15 : DEFAULT_ZOOM);

        if (signal?.cancelled) {
            map.remove();
            return;
        }

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
            maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
        map.on('click', (e) => {
            const cLat = Number(e.latlng.lat.toFixed(7));
            const cLng = Number(e.latlng.lng.toFixed(7));
            moveMap(cLat, cLng);
            onChangeRef.current({ latitude: cLat, longitude: cLng });
            reverseGeocodeOsm(cLat, cLng);
        });

        if (lat != null && lng != null) moveMap(lat, lng, { zoom: 15 });

        setTimeout(() => {
            if (!signal?.cancelled) map.invalidateSize();
        }, 50);
        setTimeout(() => {
            if (!signal?.cancelled) map.invalidateSize();
        }, 300);

        if (signal?.cancelled) {
            map.remove();
            return;
        }

        setProviderLabel('OSM');
        setStatus('ready');
        setMapNote(
            apiKey
                ? 'Google Maps billing is not enabled on this API key — using OpenStreetMap for now. Enable billing to switch to Google.'
                : null,
        );
    }, [apiKey, lat, lng, moveMap, reverseGeocodeOsm]);

    useEffect(() => {
        const signal = { cancelled: false };
        setStatus('loading');

        (async () => {
            try {
                await initLeaflet(signal);
            } catch (err) {
                if (!signal.cancelled) {
                    setStatus('fallback');
                    setMapNote(err?.message || 'Map could not load.');
                }
            }
        })();

        return () => {
            signal.cancelled = true;
            destroyMap();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiKey]);

    useEffect(() => {
        if (status !== 'ready') return;
        if (lat == null || lng == null) return;
        moveMap(lat, lng);
    }, [lat, lng, status, moveMap]);

    const onQueryChange = (value) => {
        setQuery(value);
        if (suppressSearchRef.current) {
            suppressSearchRef.current = false;
            return;
        }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => runSearch(value), 280);
    };

    const onKeyDown = (e) => {
        if (!open || !predictions.length) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % predictions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => (i <= 0 ? predictions.length - 1 : i - 1));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            selectPrediction(predictions[activeIndex]);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className={label} htmlFor="places_search">
                    Find on the map
                </label>
                <div className="relative z-20">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-500" />
                    <input
                        id="places_search"
                        className={`${field} pl-10 pr-10`}
                        placeholder="Start typing a place, street, or landmark…"
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        onKeyDown={onKeyDown}
                        onFocus={() => {
                            if (predictions.length) setOpen(true);
                        }}
                        onBlur={() => {
                            setTimeout(() => setOpen(false), 180);
                        }}
                        autoComplete="off"
                        role="combobox"
                        aria-expanded={open}
                        aria-controls="places_suggestions"
                        aria-autocomplete="list"
                    />
                    {searching || status === 'loading' ? (
                        <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-olive-400" />
                    ) : query ? (
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-olive-400 hover:text-olive-700"
                            aria-label="Clear search"
                            onClick={() => {
                                setQuery('');
                                setPredictions([]);
                                setOpen(false);
                            }}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : null}

                    {open && (predictions.length > 0 || query.trim().length >= 2) ? (
                        <ul
                            id="places_suggestions"
                            role="listbox"
                            className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-64 overflow-auto rounded-2xl border border-olive-200 bg-white py-1.5 shadow-lift"
                        >
                            {predictions.length ? (
                                predictions.map((p, index) => (
                                    <li
                                        key={p.place_id}
                                        role="option"
                                        aria-selected={index === activeIndex}
                                    >
                                        <button
                                            type="button"
                                            className={`flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left transition ${
                                                index === activeIndex
                                                    ? 'bg-mustard/25'
                                                    : 'hover:bg-olive-50'
                                            }`}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            onClick={() => selectPrediction(p)}
                                        >
                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mustard-deep" />
                                            <span className="min-w-0">
                                                <span className="block text-sm font-semibold text-olive-950">
                                                    {p.structured_formatting
                                                        ?.main_text || p.description}
                                                </span>
                                                {p.structured_formatting
                                                    ?.secondary_text ? (
                                                    <span className="mt-0.5 block truncate text-xs text-olive-500">
                                                        {
                                                            p.structured_formatting
                                                                .secondary_text
                                                        }
                                                    </span>
                                                ) : null}
                                            </span>
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <li className="px-3.5 py-3 text-sm text-olive-500">
                                    No places found — try another search.
                                </li>
                            )}
                        </ul>
                    ) : null}
                </div>
                <p className={help}>
                    {status === 'ready'
                        ? 'Type to search, pick from the dropdown, or tap / drag the pin on the map.'
                        : status === 'fallback'
                          ? mapNote || 'Map unavailable — enter details manually below.'
                          : 'Loading map…'}
                </p>
            </div>

            <div className="relative z-0 overflow-hidden rounded-2xl border border-olive-200 bg-olive-100 shadow-soft">
                <div
                    ref={mapElRef}
                    className="h-56 w-full sm:h-72"
                    role="img"
                    aria-label="Location map"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-olive-200 bg-white px-3 py-2 text-xs text-olive-600">
                    {status === 'loading' ? (
                        <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Preparing map…
                        </span>
                    ) : status === 'fallback' ? (
                        <span className="text-rose-600">{mapNote}</span>
                    ) : (
                        <>
                            <span>
                                {lat != null && lng != null
                                    ? 'Pin set — drag to fine-tune'
                                    : 'Search or click the map to drop a pin'}
                                {providerLabel ? ` · ${providerLabel}` : ''}
                            </span>
                            {lat != null && lng != null ? (
                                <span className="font-semibold tabular-nums text-olive-800">
                                    {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
                                </span>
                            ) : null}
                        </>
                    )}
                </div>
                {mapNote && status === 'ready' ? (
                    <p className="border-t border-amber-100 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-900">
                        {mapNote}
                    </p>
                ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className={label} htmlFor="location">
                        Area / location label
                    </label>
                    <input
                        id="location"
                        className={field}
                        value={location || ''}
                        onChange={(e) =>
                            onChange({ location: e.target.value })
                        }
                        placeholder="e.g. Nanyuki, Timau"
                    />
                    {errors.location ? (
                        <p className="mt-1.5 text-sm text-rose-600">
                            {errors.location}
                        </p>
                    ) : null}
                </div>
                <div>
                    <label className={label} htmlFor="city">
                        City / town
                    </label>
                    <input
                        id="city"
                        className={field}
                        value={city || ''}
                        onChange={(e) => onChange({ city: e.target.value })}
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className={label} htmlFor="address">
                        Full address
                    </label>
                    <input
                        id="address"
                        className={field}
                        value={address || ''}
                        onChange={(e) =>
                            onChange({ address: e.target.value })
                        }
                    />
                </div>
            </div>
        </div>
    );
}
