import { Link, router } from '@inertiajs/react';
import {
    BedDouble,
    Bookmark,
    Briefcase,
    CalendarDays,
    Camera,
    Coffee,
    Heart,
    Home,
    MapPin,
    ShoppingCart,
    Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { explorePath } from '@/data/categories';
import { listingHref } from '@/data/listings';
import { eventDateRangeLabel } from '@/Components/listing/eventDates';

const CATEGORY_ICONS = {
    eatDrink: Coffee,
    stay: BedDouble,
    thingsToDo: Camera,
    services: Briefcase,
    shopping: ShoppingCart,
    properties: Home,
    events: CalendarDays,
};

export default function ListingCard({
    listing,
    featured = false,
    className = '',
    allowClick = true,
    inert = false,
    footerTone = 'white',
}) {
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(() =>
        Math.max(1, Math.round((listing.rating || 4) * 12) % 40 || 1),
    );
    const href = listingHref(listing);
    const isEvent = listing.categoryKey === 'events';
    const cover = isEvent
        ? listing.eventPoster || listing.image
        : listing.image;
    const dateLabel = isEvent
        ? eventDateRangeLabel(listing.startDate, listing.endDate)
        : null;
    const CategoryIcon =
        CATEGORY_ICONS[listing.categoryKey] || Home;
    const categoryLabel =
        listing.categoryKey === 'properties' && listing.propertyType
            ? listing.propertyType
            : listing.subcategory || listing.category || 'Listing';
    const regionLabel = listing.location
        ? `${listing.location} Area`
        : null;
    const categoryHref = listing.categoryKey
        ? explorePath(
              listing.categoryKey === 'properties' && listing.propertyType
                  ? {
                        category: listing.categoryKey,
                        propertyType: listing.propertyType,
                    }
                  : {
                        category: listing.categoryKey,
                        subcategory: listing.subcategory || undefined,
                    },
          )
        : null;
    const oliveFooter = footerTone === 'olive';
    const footerText = oliveFooter ? 'text-white' : 'text-black';
    const footerMuted = oliveFooter ? 'text-white/90' : 'text-black';

    return (
        <motion.article
            whileHover={inert ? undefined : { y: -6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className={`group overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-olive-900/10 ${className}`}
            aria-hidden={inert ? true : undefined}
        >
            <Link
                href={href}
                className="block focus:outline-none"
                tabIndex={inert ? -1 : undefined}
                draggable={false}
                onClick={(e) => {
                    if (!allowClick) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }}
            >
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                        src={cover}
                        alt={listing.title}
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/55 to-transparent" />

                    {listing.categoryKey === 'properties' &&
                    listing.propertyType ? (
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-olive-900 shadow-sm">
                            {listing.propertyType}
                        </span>
                    ) : null}
                    {isEvent && dateLabel ? (
                        <span className="absolute left-3 top-3 inline-flex max-w-[75%] items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-olive-900 shadow-sm">
                            <CalendarDays className="h-3 w-3 shrink-0 text-mustard-deep" />
                            <span className="truncate font-semibold">
                                {dateLabel}
                            </span>
                        </span>
                    ) : null}

                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setLiked((v) => {
                                setLikeCount((n) => (v ? n - 1 : n + 1));
                                return !v;
                            });
                        }}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-olive-800 shadow-sm backdrop-blur transition hover:bg-white"
                        aria-label={liked ? 'Unlike listing' : 'Like listing'}
                    >
                        <Heart
                            className={`h-4 w-4 ${liked ? 'fill-mustard text-mustard' : ''}`}
                        />
                    </button>

                    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                        <div className="flex items-end gap-3">
                            {listing.logo ? (
                                <img
                                    src={listing.logo}
                                    alt=""
                                    className="h-14 w-14 shrink-0 rounded-full border-2 border-white object-cover shadow-md sm:h-[3.75rem] sm:w-[3.75rem]"
                                    loading="lazy"
                                />
                            ) : null}
                            <div className="min-w-0 flex-1 pb-0.5">
                                <h3 className="font-display text-base font-semibold leading-snug text-white sm:text-lg">
                                    <span className="line-clamp-2">
                                        {listing.title}
                                    </span>
                                </h3>
                                {regionLabel ? (
                                    <p className="mt-1 flex items-center gap-1.5 text-sm text-white">
                                        <MapPin
                                            className="h-3.5 w-3.5 shrink-0 text-white"
                                            strokeWidth={2}
                                        />
                                        <span className="truncate">
                                            {regionLabel}
                                        </span>
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={`flex items-center justify-between gap-3 px-3.5 py-4 sm:px-5 sm:py-5 ${
                        oliveFooter ? 'bg-olive-600' : 'bg-white'
                    }`}
                >
                    {categoryHref ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                router.visit(categoryHref);
                            }}
                            className={`flex min-w-0 items-center gap-2 text-left text-sm font-medium transition hover:underline ${footerText}`}
                        >
                            <CategoryIcon
                                className={`h-5 w-5 shrink-0 ${footerMuted}`}
                                strokeWidth={1.75}
                            />
                            <span className="truncate">{categoryLabel}</span>
                        </button>
                    ) : (
                        <p
                            className={`flex min-w-0 items-center gap-2 text-sm font-medium ${footerText}`}
                        >
                            <CategoryIcon
                                className={`h-5 w-5 shrink-0 ${footerMuted}`}
                                strokeWidth={1.75}
                            />
                            <span className="truncate">{categoryLabel}</span>
                        </p>
                    )}
                    <div
                        className={`flex shrink-0 items-center gap-3 ${footerText}`}
                    >
                        {listing.rating ? (
                            <span
                                className={`inline-flex items-center gap-1 text-sm font-medium ${footerText}`}
                                title="Rating"
                            >
                                <Star className="h-4 w-4 fill-mustard text-mustard" />
                                {listing.rating}
                            </span>
                        ) : null}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setBookmarked((v) => !v);
                            }}
                            className={`inline-flex items-center justify-center transition hover:opacity-70 ${footerText}`}
                            title="Bookmark"
                            aria-label={
                                bookmarked
                                    ? 'Remove bookmark'
                                    : 'Bookmark listing'
                            }
                        >
                            <Bookmark
                                className={`h-[1.15rem] w-[1.15rem] ${bookmarked ? 'fill-mustard text-mustard' : ''}`}
                                strokeWidth={1.75}
                            />
                        </button>
                        <span
                            className={`inline-flex items-center gap-1 text-sm font-medium ${footerText}`}
                            title="Likes"
                            aria-label={`${likeCount} likes`}
                        >
                            <Heart
                                className={`h-4 w-4 ${liked ? 'fill-mustard text-mustard' : ''}`}
                            />
                            {likeCount}
                        </span>
                    </div>
                </div>
            </Link>
        </motion.article>
    );
}
