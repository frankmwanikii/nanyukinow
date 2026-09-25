import { Link } from '@inertiajs/react';
import {
    BedDouble,
    Camera,
    Home,
    Loader2,
    PawPrint,
    Search,
    ShoppingCart,
    UtensilsCrossed,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { explorePath } from '@/data/categories';

const FEATURED = [
    {
        id: 'airbnbs',
        label: 'Airbnbs',
        Icon: BedDouble,
        href: explorePath({ category: 'stay', subcategory: 'Airbnbs' }),
        keywords: ['airbnb', 'stay', 'cabin', 'lodge', 'home', 'hotel', 'hotels'],
    },
    {
        id: 'properties',
        label: 'Properties',
        Icon: Home,
        href: explorePath({ category: 'properties' }),
        keywords: ['property', 'properties', 'house', 'rent', 'sale', 'lease'],
    },
    {
        id: 'wildlife',
        label: 'Wildlife & Nature',
        Icon: PawPrint,
        href: explorePath({
            category: 'thingsToDo',
            subcategory: 'Wildlife & Nature',
        }),
        keywords: ['wildlife', 'nature', 'safari', 'conservancy', 'rhino'],
    },
    {
        id: 'supermarkets',
        label: 'Supermarkets',
        Icon: ShoppingCart,
        href: explorePath({
            category: 'shopping',
            subcategory: 'Supermarkets',
        }),
        keywords: ['supermarket', 'shopping', 'grocery', 'market'],
    },
    {
        id: 'things-to-do',
        label: 'Things to do',
        Icon: Camera,
        href: explorePath({ category: 'thingsToDo' }),
        keywords: ['things', 'activity', 'activities', 'adventure', 'tour'],
    },
    {
        id: 'restaurants',
        label: 'Restaurants',
        Icon: UtensilsCrossed,
        href: explorePath({
            category: 'eatDrink',
            subcategory: 'Restaurants',
        }),
        keywords: ['restaurant', 'food', 'eat', 'dining', 'dinner'],
    },
];

function matchesQuery(item, q) {
    if (!q) return true;
    const hay = [item.label, ...(item.keywords || [])].join(' ').toLowerCase();
    return hay.includes(q);
}

function SuggestionRow({ href, Icon, label, meta, image, onSelect }) {
    return (
        <Link
            href={href}
            onClick={onSelect}
            className="group flex items-center gap-3.5 px-4 py-2.5 text-left transition hover:bg-olive-50"
        >
            {image ? (
                <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-olive-100 ring-1 ring-olive-200/70">
                    <img src={image} alt="" className="h-full w-full object-cover" />
                </span>
            ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center text-olive-800 transition group-hover:rounded-full group-hover:bg-mustard group-hover:text-olive-950">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
            )}
            <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium text-olive-900">
                    {label}
                </span>
                {meta ? (
                    <span className="block truncate text-xs text-olive-500">
                        {meta}
                    </span>
                ) : null}
            </span>
        </Link>
    );
}

export default function SearchSuggestions({
    query = '',
    onSelect,
    anchorRef,
    headerRef,
    panelRef,
    id,
}) {
    const q = query.trim().toLowerCase();
    const rawQ = query.trim();
    const [coords, setCoords] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortRef = useRef(null);

    useEffect(() => {
        const update = () => {
            const searchEl = anchorRef?.current;
            const headerEl = headerRef?.current;
            if (!searchEl) return;
            const searchRect = searchEl.getBoundingClientRect();
            const headerBottom = headerEl
                ? headerEl.getBoundingClientRect().bottom
                : searchRect.bottom;
            setCoords({
                top: headerBottom,
                left: searchRect.left,
                width: Math.max(searchRect.width, 280),
            });
        };
        update();
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [anchorRef, headerRef]);

    useEffect(() => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }

        if (!rawQ) {
            setListings([]);
            setLoading(false);
            setError(null);
            return undefined;
        }

        const controller = new AbortController();
        abortRef.current = controller;
        const timer = window.setTimeout(async () => {
            setLoading(true);
            setError(null);
            try {
                const url = route('listings.search', { q: rawQ, limit: 8 });
                const response = await fetch(url, {
                    headers: { Accept: 'application/json' },
                    signal: controller.signal,
                    credentials: 'same-origin',
                });
                if (!response.ok) {
                    throw new Error('Search failed');
                }
                const data = await response.json();
                if (!controller.signal.aborted) {
                    setListings(Array.isArray(data.results) ? data.results : []);
                }
            } catch (err) {
                if (err?.name === 'AbortError') return;
                if (!controller.signal.aborted) {
                    setListings([]);
                    setError('Could not search listings right now.');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }, 220);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [rawQ]);

    const featured = useMemo(
        () => FEATURED.filter((item) => matchesQuery(item, q)),
        [q],
    );

    const hasFeatured = featured.length > 0;
    const hasListings = listings.length > 0;
    const empty = Boolean(rawQ) && !loading && !hasFeatured && !hasListings && !error;

    if (!coords || typeof document === 'undefined') return null;

    return createPortal(
        <div
            ref={panelRef}
            id={id}
            style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                width: Math.min(coords.width, window.innerWidth - 24),
                maxWidth: '28rem',
            }}
            className="z-[1200] border-t-[3px] border-mustard bg-white font-display shadow-lift"
            role="listbox"
            aria-label="Search suggestions"
        >
            {hasFeatured ? (
                <div>
                    <p className="px-4 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-olive-500">
                        Featured
                    </p>
                    <div className="mx-4 border-t border-olive-100" />
                    <ul className="py-1.5">
                        {featured.map((item) => (
                            <li key={item.id}>
                                <SuggestionRow
                                    href={item.href}
                                    Icon={item.Icon}
                                    label={item.label}
                                    onSelect={onSelect}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}

            {rawQ ? (
                <div className={hasFeatured ? 'border-t border-olive-100' : ''}>
                    <p className="flex items-center gap-2 px-4 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-olive-500">
                        Results
                        {loading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-olive-400" />
                        ) : null}
                    </p>
                    <div className="mx-4 border-t border-olive-100" />
                    {hasListings ? (
                        <ul className="py-1.5">
                            {listings.map((listing) => (
                                <li key={listing.id}>
                                    <SuggestionRow
                                        href={
                                            listing.href ||
                                            `/listings/${encodeURIComponent(listing.slug)}`
                                        }
                                        Icon={Search}
                                        image={listing.image}
                                        label={listing.title}
                                        meta={[
                                            listing.subcategory || listing.category,
                                            listing.location,
                                        ]
                                            .filter(Boolean)
                                            .join(' · ')}
                                        onSelect={onSelect}
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : null}
                    {loading && !hasListings ? (
                        <p className="px-4 py-4 text-sm text-olive-500">
                            Searching listings…
                        </p>
                    ) : null}
                    {error ? (
                        <p className="px-4 py-4 text-sm text-rose-600">{error}</p>
                    ) : null}
                </div>
            ) : null}

            {empty ? (
                <div className="px-4 py-6 text-center">
                    <p className="text-sm text-olive-600">
                        No matches for “{rawQ}”
                    </p>
                    <Link
                        href={explorePath({ q: rawQ })}
                        onClick={onSelect}
                        className="mt-3 inline-flex text-sm font-semibold text-olive-800 underline-offset-2 hover:text-mustard hover:underline"
                    >
                        Search all listings
                    </Link>
                </div>
            ) : null}

            {rawQ && (hasFeatured || hasListings) ? (
                <div className="border-t border-olive-100 px-4 py-2.5">
                    <Link
                        href={explorePath({ q: rawQ })}
                        onClick={onSelect}
                        className="text-sm font-semibold text-olive-800 transition hover:text-mustard"
                    >
                        See all results for “{rawQ}”
                    </Link>
                </div>
            ) : null}
        </div>,
        document.body,
    );
}
