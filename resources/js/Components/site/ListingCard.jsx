import { Link } from '@inertiajs/react';
import { CalendarDays, Heart, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { listingHref } from '@/data/listings';
import { eventDateRangeLabel } from '@/Components/listing/eventDates';

export default function ListingCard({ listing, featured = false }) {
    const [saved, setSaved] = useState(false);
    const href = listingHref(listing);
    const isEvent = listing.categoryKey === 'events';
    const cover = isEvent
        ? listing.eventPoster || listing.image
        : listing.image;
    const dateLabel = isEvent
        ? eventDateRangeLabel(listing.startDate, listing.endDate)
        : null;

    return (
        <motion.article
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="group overflow-hidden rounded-2xl bg-white shadow-soft"
        >
            <Link href={href} className="block focus:outline-none">
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                        src={cover}
                        alt={listing.title}
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-earth-dusk/45 via-transparent to-transparent" />
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
                    {listing.logo ? (
                        <img
                            src={listing.logo}
                            alt=""
                            className="absolute bottom-3 left-3 h-11 w-11 rounded-full border-2 border-white object-cover shadow-md"
                            loading="lazy"
                        />
                    ) : null}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSaved((v) => !v);
                        }}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-olive-800 shadow-sm backdrop-blur transition hover:bg-white"
                        aria-label={saved ? 'Remove from saved' : 'Save listing'}
                    >
                        <Heart
                            className={`h-4 w-4 ${saved ? 'fill-mustard text-mustard' : ''}`}
                        />
                    </button>
                </div>
                <div className="space-y-2 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-base font-semibold text-earth-dusk sm:text-lg">
                            {listing.title}
                        </h3>
                        {listing.rating ? (
                            <span className="inline-flex shrink-0 items-center gap-1 text-sm text-olive-700">
                                <Star className="h-3.5 w-3.5 fill-mustard text-mustard" />
                                {listing.rating}
                            </span>
                        ) : null}
                    </div>
                    <p className="flex items-center gap-1.5 text-sm text-olive-600">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="min-w-0 truncate">
                            {listing.location}
                            {listing.categoryKey === 'properties' &&
                            listing.propertyType ? (
                                <span className="text-olive-400">
                                    · {listing.propertyType}
                                    {listing.subcategory
                                        ? ` · ${listing.subcategory}`
                                        : ''}
                                </span>
                            ) : listing.subcategory || listing.category ? (
                                <span className="text-olive-400">
                                    · {listing.subcategory || listing.category}
                                </span>
                            ) : null}
                        </span>
                    </p>
                    {featured && listing.badge === 'top' ? (
                        <span className="inline-block text-xs font-semibold uppercase tracking-wide text-mustard-deep">
                            Top pick
                        </span>
                    ) : null}
                </div>
            </Link>
        </motion.article>
    );
}
