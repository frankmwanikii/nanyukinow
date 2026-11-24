import { Link } from '@inertiajs/react';
import { PinMark, VerifiedMark } from '@/Components/site/Mark';
import { listingHref } from '@/data/listings';
import { eventCardDateLabel } from '@/Components/listing/eventDates';
import { subcategoryCardLabel } from '@/utils/listingSubcategories';

/**
 * Compact listing card for Nyuki chat (cover + title + place).
 */
export default function NyukiListingCard({ listing }) {
    const href = listing.href || listingHref(listing);
    const isEvent = listing.categoryKey === 'events';
    const cover = isEvent
        ? listing.eventPoster || listing.image
        : listing.image;
    const dateLabel = isEvent ? eventCardDateLabel(listing.startDate) : null;
    const place = listing.location || listing.city || null;
    const categoryLabel =
        listing.categoryKey === 'properties' && listing.propertyType
            ? listing.propertyType
            : subcategoryCardLabel(listing) || listing.category || null;

    return (
        <Link
            href={href}
            prefetch
            className="group flex min-w-0 overflow-hidden rounded-xl border border-olive-900/12 bg-white shadow-sm transition hover:border-olive-900/25"
        >
            <div className="relative h-[4.75rem] w-[4.75rem] shrink-0 overflow-hidden bg-olive-200 sm:h-[5.25rem] sm:w-[5.25rem]">
                {cover ? (
                    <img
                        src={cover}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                        width={84}
                        height={84}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-olive-600">
                        No photo
                    </div>
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-2.5 py-2">
                <p className="line-clamp-2 font-display text-[13px] font-semibold leading-snug text-olive-950 sm:text-sm">
                    <span className="inline-flex max-w-full items-start gap-1">
                        {listing.is_verified ? (
                            <VerifiedMark className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0095F6]" />
                        ) : null}
                        <span className="min-w-0">{listing.title}</span>
                    </span>
                </p>
                {place ? (
                    <p className="flex min-w-0 items-center gap-1 text-[11px] text-olive-700">
                        <PinMark className="h-3 w-3 shrink-0" />
                        <span className="truncate">{place}</span>
                    </p>
                ) : null}
                <p className="truncate text-[11px] text-olive-600">
                    {[dateLabel, categoryLabel].filter(Boolean).join(' · ')}
                </p>
            </div>
        </Link>
    );
}
