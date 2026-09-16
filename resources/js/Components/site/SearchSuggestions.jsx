import { Link } from '@inertiajs/react';
import {
    BedDouble,
    Camera,
    Home,
    PawPrint,
    Search,
    ShoppingCart,
    UtensilsCrossed,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { explorePath } from '@/data/categories';
import {
    allListings,
    enrichListing,
    filterListings,
    listingHref,
} from '@/data/listings';

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

function SuggestionRow({ href, Icon, label, meta, onSelect }) {
    return (
        <Link
            href={href}
            onClick={onSelect}
            className="group flex items-center gap-3.5 px-4 py-2.5 text-left transition hover:bg-olive-50"
        >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center text-olive-800 transition group-hover:rounded-full group-hover:bg-mustard group-hover:text-olive-950">
                <Icon className="h-5 w-5" strokeWidth={1.6} />
            </span>
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
    const [coords, setCoords] = useState(null);

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

    const featured = useMemo(
        () => FEATURED.filter((item) => matchesQuery(item, q)),
        [q],
    );

    const listings = useMemo(() => {
        if (!q) return [];
        return filterListings(allListings, { query: q })
            .slice(0, 6)
            .map((item, i) => enrichListing(item, i));
    }, [q]);

    const hasFeatured = featured.length > 0;
    const hasListings = listings.length > 0;
    const empty = q && !hasFeatured && !hasListings;

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

            {hasListings ? (
                <div className={hasFeatured ? 'border-t border-olive-100' : ''}>
                    <p className="px-4 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-olive-500">
                        Results
                    </p>
                    <div className="mx-4 border-t border-olive-100" />
                    <ul className="py-1.5">
                        {listings.map((listing) => (
                            <li key={listing.id}>
                                <SuggestionRow
                                    href={listingHref(listing)}
                                    Icon={Search}
                                    label={listing.title}
                                    meta={[listing.subcategory, listing.location]
                                        .filter(Boolean)
                                        .join(' · ')}
                                    onSelect={onSelect}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}

            {empty ? (
                <div className="px-4 py-6 text-center">
                    <p className="text-sm text-olive-600">
                        No matches for “{query.trim()}”
                    </p>
                    <Link
                        href={explorePath({ q: query.trim() })}
                        onClick={onSelect}
                        className="mt-3 inline-flex text-sm font-semibold text-olive-800 underline-offset-2 hover:text-mustard hover:underline"
                    >
                        Search all listings
                    </Link>
                </div>
            ) : null}

            {q && (hasFeatured || hasListings) ? (
                <div className="border-t border-olive-100 px-4 py-2.5">
                    <Link
                        href={explorePath({ q: query.trim() })}
                        onClick={onSelect}
                        className="text-sm font-semibold text-olive-800 transition hover:text-mustard"
                    >
                        See all results for “{query.trim()}”
                    </Link>
                </div>
            ) : null}
        </div>,
        document.body,
    );
}
