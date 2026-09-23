import { field, help, label } from './fieldStyles';
import { getMapsApiKey, loadGoogleMaps } from '@/utils/googleMaps';
import { LOOK_LOCATIONS } from '@/data/listings';
import { Check, Loader2, MapPin, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const NANYUKI = { lat: -0.0166, lng: 37.0728 };
const DEFAULT_ZOOM = 14;
const AREA_OPTIONS = LOOK_LOCATIONS;

function parseCoord(value) {
    const n = typeof value === 'number' ? value : Number.parseFloat(value);
    return Number.isFinite(n) ? n : null;
}

function parseAreas(value) {
    if (Array.isArray(value)) {
        return value.filter((v) => AREA_OPTIONS.includes(v));
    }
    if (!value || typeof value !== 'string') return [];
    return value
        .split(/[,·|/]+/)
        .map((part) => part.trim())
        .filter((part) => AREA_OPTIONS.includes(part));
}

function formatAreas(areas) {
    return areas.join(', ');
}

function inferAreasFromText(...parts) {
    const raw = parts.filter(Boolean).join(' ').toLowerCase();
    const found = [];
    if (raw.includes('timau')) found.push('Timau');
    if (
        raw.includes('naro moru') ||
        raw.includes('naromoru') ||
        raw.includes('naro-moru')
    ) {
        found.push('Naromoru');
    }
    if (raw.includes('nanyuki')) found.push('Nanyuki');
    return found.filter((a) => AREA_OPTIONS.includes(a));
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

function placeToCoords(place) {
    const pLat = place.geometry?.location?.lat?.();
    const pLng = place.geometry?.location?.lng?.();
    return {
        latitude: typeof pLat === 'number' ? Number(pLat.toFixed(7)) : null,
        longitude: typeof pLng === 'number' ? Number(pLng.toFixed(7)) : null,
        address: place.formatted_address || place.name || '',
    };
}

/**
 * Google Maps + Places location picker for listing forms.
 */
export default function PlacesLocationInput({
    apiKey,
    location,
    latitude,
    longitude,
    onChange,
    errors = {},
    areas = AREA_OPTIONS,
}) {
    const mapElRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const mapsRef = useRef(null);
    const autocompleteServiceRef = useRef(null);
    const placesServiceRef = useRef(null);
    const sessionTokenRef = useRef(null);
    const debounceRef = useRef(null);
    const suppressSearchRef = useRef(false);
    const lastPreviewIdRef = useRef(null);
    const onChangeRef = useRef(onChange);
    const locationRef = useRef(location);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        locationRef.current = location;
    }, [location]);

    const key = getMapsApiKey(apiKey);
    const selectedAreas = useMemo(() => parseAreas(location), [location]);
    const areaChoices = areas?.length ? areas : AREA_OPTIONS;

    const [status, setStatus] = useState(key ? 'loading' : 'missing');
    const [query, setQuery] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [open, setOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [mapNote, setMapNote] = useState(null);

    const lat = parseCoord(latitude);
    const lng = parseCoord(longitude);

    const toggleArea = (area) => {
        const next = selectedAreas.includes(area)
            ? selectedAreas.filter((a) => a !== area)
            : [...selectedAreas, area];
        onChange({ location: formatAreas(next) });
    };

    const reverseGeocode = useCallback((rLat, rLng) => {
        const maps = mapsRef.current;
        if (!maps) return;
        new maps.Geocoder().geocode(
            { location: { lat: rLat, lng: rLng } },
            (results, s) => {
                if (s !== 'OK' || !results?.[0]) return;
                const formatted = results[0].formatted_address || '';
                suppressSearchRef.current = true;
                setQuery(formatted);

                const inferred = inferAreasFromText(formatted);
                const current = parseAreas(locationRef.current);
                const merged =
                    current.length > 0
                        ? current
                        : inferred.length
                          ? inferred
                          : current;

                onChangeRef.current({
                    latitude: rLat,
                    longitude: rLng,
                    address: formatted,
                    city: '',
                    ...(merged.length
                        ? { location: formatAreas(merged) }
                        : {}),
                });
            },
        );
    }, []);

    const moveMap = useCallback(
        (nextLat, nextLng, { zoom = 16 } = {}) => {
            if (nextLat == null || nextLng == null) return;
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
                    reverseGeocode(dLat, dLng);
                });
            }
        },
        [reverseGeocode],
    );

    const applyPlace = useCallback(
        (place) => {
            const coords = placeToCoords(place);
            const inferred = inferAreasFromText(
                place.name,
                place.formatted_address,
            );
            const current = parseAreas(locationRef.current);
            const merged =
                current.length > 0
                    ? current
                    : inferred.length
                      ? inferred
                      : current;

            suppressSearchRef.current = true;
            setQuery(place.formatted_address || place.name || '');
            setPredictions([]);
            setOpen(false);
            setActiveIndex(-1);

            onChangeRef.current({
                latitude: coords.latitude,
                longitude: coords.longitude,
                address: coords.address,
                city: '',
                ...(merged.length ? { location: formatAreas(merged) } : {}),
            });
            moveMap(coords.latitude, coords.longitude);
        },
        [moveMap],
    );

    const selectPrediction = useCallback(
        (prediction) => {
            if (
                prediction?.latitude != null &&
                prediction?.longitude != null &&
                Number.isFinite(Number(prediction.latitude)) &&
                Number.isFinite(Number(prediction.longitude)) &&
                prediction.source === 'local'
            ) {
                const inferred = inferAreasFromText(
                    prediction.location_label,
                    prediction.address,
                    prediction.description,
                );
                const current = parseAreas(locationRef.current);
                const merged =
                    current.length > 0
                        ? current
                        : inferred.length
                          ? inferred
                          : current;

                suppressSearchRef.current = true;
                setQuery(prediction.address || prediction.description || '');
                setPredictions([]);
                setOpen(false);
                onChangeRef.current({
                    latitude: Number(Number(prediction.latitude).toFixed(7)),
                    longitude: Number(Number(prediction.longitude).toFixed(7)),
                    address:
                        prediction.address || prediction.description || '',
                    city: '',
                    ...(merged.length
                        ? { location: formatAreas(merged) }
                        : {}),
                });
                moveMap(
                    Number(prediction.latitude),
                    Number(prediction.longitude),
                );
                return;
            }

            const service = placesServiceRef.current;
            if (!service || !prediction?.place_id) return;
            if (String(prediction.place_id).startsWith('local-')) return;

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
                    applyPlace(place);
                    if (mapsRef.current?.places?.AutocompleteSessionToken) {
                        sessionTokenRef.current =
                            new mapsRef.current.places.AutocompleteSessionToken();
                    }
                },
            );
        },
        [applyPlace, moveMap],
    );

    const searchLocalListings = useCallback(async (q) => {
        try {
            const res = await fetch(
                `/account/places/search?q=${encodeURIComponent(q)}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                },
            );
            if (!res.ok) return [];
            const data = await res.json();
            return (data.results || []).filter((r) => r.source === 'local');
        } catch {
            return [];
        }
    }, []);

    const searchGoogle = useCallback(
        async (q) => {
            const service = autocompleteServiceRef.current;
            if (!service) return;

            setSearching(true);
            const localHits = await searchLocalListings(q);

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
                const googleHits =
                    s === 'OK' && results?.length
                        ? results.map((r) => ({ ...r, provider: 'google' }))
                        : [];

                const list = [...localHits, ...googleHits].slice(0, 10);
                setPredictions(list);
                setOpen(true);
                setActiveIndex(list.length ? 0 : -1);

                const first = googleHits[0];
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
        [moveMap, searchLocalListings],
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
            searchGoogle(q);
        },
        [searchGoogle],
    );

    useEffect(() => {
        if (!key) {
            setStatus('missing');
            setMapNote(
                'Add VITE_GOOGLE_MAPS_API_KEY to enable Google Maps & Places.',
            );
            return undefined;
        }

        const signal = { cancelled: false };
        setStatus('loading');

        (async () => {
            try {
                const maps = await loadGoogleMaps(key, {
                    libraries: ['places'],
                });
                if (signal.cancelled || !mapElRef.current) return;

                mapsRef.current = maps;
                const startLat = lat ?? NANYUKI.lat;
                const startLng = lng ?? NANYUKI.lng;

                const map = new maps.Map(mapElRef.current, {
                    center: { lat: startLat, lng: startLng },
                    zoom: lat != null ? 15 : DEFAULT_ZOOM,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    clickableIcons: true,
                    gestureHandling: 'greedy',
                });

                mapRef.current = map;
                placesServiceRef.current = new maps.places.PlacesService(map);
                autocompleteServiceRef.current =
                    new maps.places.AutocompleteService();
                sessionTokenRef.current =
                    new maps.places.AutocompleteSessionToken();

                map.addListener('click', (e) => {
                    if (!e.latLng) return;
                    const cLat = Number(e.latLng.lat().toFixed(7));
                    const cLng = Number(e.latLng.lng().toFixed(7));
                    moveMap(cLat, cLng);
                    onChangeRef.current({ latitude: cLat, longitude: cLng });
                    reverseGeocode(cLat, cLng);
                });

                if (lat != null && lng != null) {
                    moveMap(lat, lng, { zoom: 15 });
                }

                if (!signal.cancelled) {
                    setStatus('ready');
                    setMapNote(null);
                }
            } catch (err) {
                if (!signal.cancelled) {
                    setStatus('error');
                    setMapNote(
                        err?.message ||
                            'Google Maps could not load. Check API key, Maps JavaScript API, Places API, and billing.',
                    );
                }
            }
        })();

        return () => {
            signal.cancelled = true;
            if (markerRef.current?.setMap) markerRef.current.setMap(null);
            markerRef.current = null;
            mapRef.current = null;
            if (mapElRef.current) mapElRef.current.innerHTML = '';
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

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
                    Find on Google Maps
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
                        disabled={status !== 'ready'}
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

                    {open &&
                    (predictions.length > 0 || query.trim().length >= 2) ? (
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
                                            onMouseDown={(e) =>
                                                e.preventDefault()
                                            }
                                            onMouseEnter={() =>
                                                setActiveIndex(index)
                                            }
                                            onClick={() => selectPrediction(p)}
                                        >
                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mustard-deep" />
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center gap-2">
                                                    <span className="block text-sm font-semibold text-olive-950">
                                                        {p.structured_formatting
                                                            ?.main_text ||
                                                            p.description}
                                                    </span>
                                                    {p.badge ? (
                                                        <span className="shrink-0 rounded-md bg-olive-900 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-mustard">
                                                            {p.badge}
                                                        </span>
                                                    ) : null}
                                                </span>
                                                {p.structured_formatting
                                                    ?.secondary_text ? (
                                                    <span className="mt-0.5 block truncate text-xs text-olive-500">
                                                        {
                                                            p
                                                                .structured_formatting
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
                        ? 'Pick a Google suggestion or tap the map to set the pin.'
                        : status === 'loading'
                          ? 'Loading Google Maps…'
                          : mapNote || 'Google Maps unavailable.'}
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
                            Preparing Google Map…
                        </span>
                    ) : status === 'ready' ? (
                        <>
                            <span>
                                {lat != null && lng != null
                                    ? 'Pin set — drag to fine-tune · Google'
                                    : 'Search or click the map to drop a pin · Google'}
                            </span>
                            {lat != null && lng != null ? (
                                <span className="font-semibold tabular-nums text-olive-800">
                                    {Number(lat).toFixed(5)},{' '}
                                    {Number(lng).toFixed(5)}
                                </span>
                            ) : null}
                        </>
                    ) : (
                        <span className="text-rose-600">
                            {mapNote || 'Google Maps not configured'}
                        </span>
                    )}
                </div>
            </div>

            <div>
                <span className={label} id="location-areas-label">
                    Area / location
                </span>
                <div
                    role="group"
                    aria-labelledby="location-areas-label"
                    className="mt-1.5 flex flex-wrap gap-2"
                >
                    {areaChoices.map((area) => {
                        const active = selectedAreas.includes(area);
                        return (
                            <button
                                key={area}
                                type="button"
                                onClick={() => toggleArea(area)}
                                aria-pressed={active}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                                    active
                                        ? 'border-olive-900 bg-olive-900 text-white'
                                        : 'border-olive-200 bg-white text-olive-800 hover:border-mustard hover:bg-mustard/15'
                                }`}
                            >
                                {active ? (
                                    <Check
                                        className="h-3.5 w-3.5"
                                        strokeWidth={2.5}
                                    />
                                ) : null}
                                {area}
                            </button>
                        );
                    })}
                </div>
                <p className={help}>
                    Select one or more: Nanyuki, Naromoru, or Timau.
                </p>
                {errors.location ? (
                    <p className="mt-1.5 text-sm text-rose-600">
                        {errors.location}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
