import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    BookmarkMark,
    EatMark,
    EventMark,
    ExploreMark,
    HeartMark,
    PinMark,
    PropertyMark,
    ServicesMark,
    ShopMark,
    StayMark,
    VerifiedMark,
} from '@/Components/site/Mark';
import ListingTierBadge from '@/Components/site/ListingTierBadge';
import { explorePath } from '@/data/categories';
import { listingHref } from '@/data/listings';
import { eventCardDateLabel } from '@/Components/listing/eventDates';
import { toggleListingBookmark } from '@/utils/listingBookmark';
import {
    listingSubcategories,
    subcategoryCardLabel,
} from '@/utils/listingSubcategories';

const CATEGORY_MARKS = {
    eatDrink: EatMark,
    stay: StayMark,
    shopping: ShopMark,
    thingsToDo: ExploreMark,
    events: EventMark,
    properties: PropertyMark,
    services: ServicesMark,
};

function csrfToken() {
    const raw = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')
        .slice(1)
        .join('=');
    return raw ? decodeURIComponent(raw) : null;
}

export default function ListingCard({
    listing,
    featured = false,
    className = '',
    allowClick = true,
    inert = false,
    footerTone = 'white',
}) {
    const { auth } = usePage().props;
    const bookmarkedIds = auth?.user?.bookmarkedListingIds ?? [];
    const bookmarkKey = Array.isArray(bookmarkedIds)
        ? bookmarkedIds.map(Number).sort((a, b) => a - b).join(',')
        : '';
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(() =>
        bookmarkedIds.includes(Number(listing.id)),
    );
    const [bookmarkBusy, setBookmarkBusy] = useState(false);
    const [likeCount, setLikeCount] = useState(
        () => Number(listing.likesCount ?? listing.likes_count ?? 0) || 0,
    );
    const [likeBusy, setLikeBusy] = useState(false);
    const href = listingHref(listing);
    const isEvent = listing.categoryKey === 'events';
    const cover = isEvent
        ? listing.eventPoster || listing.image
        : listing.image;
    const dateLabel = isEvent
        ? eventCardDateLabel(listing.startDate)
        : null;
    const categoryLabel =
        listing.categoryKey === 'properties' && listing.propertyType
            ? listing.propertyType
            : subcategoryCardLabel(listing) || listing.category || 'Listing';
    const regionLabel = listing.location || listing.city || null;
    // Events keep the poster clear: date on top, no price ribbon on the cover.
    const priceLabel =
        listing.categoryKey === 'properties'
            ? listing.details?.price || listing.price || null
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
                        subcategory:
                            listingSubcategories(listing)[0] || undefined,
                    },
          )
        : null;
    const oliveFooter = footerTone === 'olive';
    const tier = listing.tier || 'free';
    const showTierBadge = tier === 'premium' || tier === 'featured';

    useEffect(() => {
        const ids = bookmarkKey
            ? bookmarkKey.split(',').map(Number)
            : [];
        setBookmarked(ids.includes(Number(listing.id)));
    }, [bookmarkKey, listing.id]);

    const toggleBookmark = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (bookmarkBusy || inert || !listing.slug) return;

        if (!auth?.user) {
            router.visit(route('login'));
            return;
        }

        const next = !bookmarked;
        setBookmarked(next);
        setBookmarkBusy(true);
        try {
            const data = await toggleListingBookmark(listing.slug, next);
            if (typeof data.bookmarked === 'boolean') {
                setBookmarked(data.bookmarked);
            }
        } catch (err) {
            setBookmarked(!next);
            if (err?.status === 401) {
                router.visit(route('login'));
            }
        } finally {
            setBookmarkBusy(false);
        }
    };

    const toggleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (likeBusy || inert || !listing.slug) return;

        const nextLiked = !liked;
        setLiked(nextLiked);
        setLikeCount((n) => Math.max(0, n + (nextLiked ? 1 : -1)));
        setLikeBusy(true);

        try {
            const token = csrfToken();
            const response = await fetch(route('listings.like', listing.slug), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(token ? { 'X-XSRF-TOKEN': token } : {}),
                },
                credentials: 'same-origin',
                body: JSON.stringify({ liked: nextLiked }),
            });
            if (!response.ok) throw new Error('Like failed');
            const data = await response.json();
            if (typeof data.likesCount === 'number') {
                setLikeCount(data.likesCount);
            }
            if (typeof data.liked === 'boolean') {
                setLiked(data.liked);
            }
        } catch {
            setLiked(!nextLiked);
            setLikeCount((n) => Math.max(0, n + (nextLiked ? -1 : 1)));
        } finally {
            setLikeBusy(false);
        }
    };

    const stop = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <article
            className={`group flex h-full min-w-0 max-w-full flex-col overflow-hidden rounded-2xl border border-olive-900/15 bg-white ${
                featured ? 'border-olive-900/25' : ''
            } ${className}`}
            aria-hidden={inert ? true : undefined}
        >
            <Link
                href={href}
                className="flex min-h-0 min-w-0 flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mustard"
                tabIndex={inert ? -1 : undefined}
                draggable={false}
                onClick={(e) => {
                    if (!allowClick) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }}
            >
                <div className="relative isolate aspect-[4/3] shrink-0 overflow-hidden bg-olive-200">
                    {cover ? (
                        <img
                            src={cover}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                            width={640}
                            height={480}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-olive-100 text-sm font-medium text-olive-600">
                            No photo
                        </div>
                    )}

                    {(showTierBadge || dateLabel || priceLabel) && (
                        <div className="absolute left-0 top-0 z-10 flex max-w-[85%] flex-wrap gap-px">
                            {showTierBadge ? (
                                <ListingTierBadge tier={tier} />
                            ) : null}
                            {dateLabel ? (
                                <span className="bg-white px-2.5 py-1 text-[11px] font-semibold text-earth-dusk">
                                    {dateLabel}
                                </span>
                            ) : null}
                            {priceLabel ? (
                                <span className="bg-mustard px-2.5 py-1 text-[11px] font-semibold text-earth-dusk">
                                    {priceLabel}
                                </span>
                            ) : null}
                        </div>
                    )}
                </div>

                <div
                    className={`relative z-10 flex min-w-0 flex-1 flex-col gap-2.5 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4 ${
                        oliveFooter ? 'bg-olive-700 text-white' : 'bg-white text-earth-dusk'
                    }`}
                >
                    <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
                        {listing.logo && !isEvent ? (
                            <img
                                src={listing.logo}
                                alt=""
                                className={`mt-0.5 h-9 w-9 shrink-0 rounded-full object-cover sm:h-10 sm:w-10 ${
                                    oliveFooter
                                        ? 'ring-2 ring-white/80'
                                        : 'ring-2 ring-olive-200'
                                }`}
                                loading="lazy"
                                decoding="async"
                                width={40}
                                height={40}
                            />
                        ) : null}
                        <div className="min-w-0 flex-1">
                            <h3 className="font-display text-base font-semibold leading-snug tracking-tight sm:text-lg">
                                <span className="inline-flex max-w-full items-start gap-1.5">
                                    {listing.is_verified ? (
                                        <span
                                            className="mt-0.5 inline-flex shrink-0"
                                            aria-label="Verified listing"
                                        >
                                            <VerifiedMark className="h-4 w-4 text-[#0095F6] sm:h-[1.125rem] sm:w-[1.125rem]" />
                                        </span>
                                    ) : null}
                                    <span className="line-clamp-2 min-w-0">
                                        {listing.title}
                                    </span>
                                </span>
                            </h3>
                            {regionLabel ? (
                                <p
                                    className={`mt-1 flex min-w-0 items-center gap-1 truncate text-sm ${
                                        oliveFooter
                                            ? 'text-white/75'
                                            : 'text-olive-700'
                                    }`}
                                >
                                    <PinMark className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{regionLabel}</span>
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div
                        className={`mt-auto flex min-w-0 items-center justify-between gap-2 border-t pt-2.5 sm:pt-3 ${
                            oliveFooter
                                ? 'border-white/15'
                                : 'border-olive-900/10'
                        }`}
                    >
                        {(() => {
                            const CategoryIcon =
                                CATEGORY_MARKS[listing.categoryKey] || null;
                            const categoryClass = `inline-flex min-h-11 min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-left text-sm font-medium ${
                                oliveFooter ? 'text-white/90' : 'text-olive-800'
                            }`;

                            if (categoryHref) {
                                return (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            stop(e);
                                            router.visit(categoryHref);
                                        }}
                                        className={`${categoryClass} underline-offset-2 hover:underline`}
                                    >
                                        {CategoryIcon ? (
                                            <CategoryIcon className="h-4 w-4 shrink-0" />
                                        ) : null}
                                        <span className="min-w-0 truncate">
                                            {categoryLabel}
                                        </span>
                                    </button>
                                );
                            }

                            return (
                                <p className={categoryClass}>
                                    {CategoryIcon ? (
                                        <CategoryIcon className="h-4 w-4 shrink-0" />
                                    ) : null}
                                    <span className="min-w-0 truncate">
                                        {categoryLabel}
                                    </span>
                                </p>
                            );
                        })()}

                        <div
                            className={`flex shrink-0 items-center ${
                                oliveFooter ? 'text-white' : 'text-earth-dusk'
                            }`}
                        >
                            <button
                                type="button"
                                disabled={bookmarkBusy || inert || !listing.slug}
                                onClick={toggleBookmark}
                                className="inline-flex h-11 w-11 items-center justify-center transition hover:opacity-70 disabled:opacity-60"
                                title="Bookmark"
                                aria-label={
                                    bookmarked
                                        ? 'Remove bookmark'
                                        : 'Bookmark listing'
                                }
                            >
                                <BookmarkMark
                                    className={`h-5 w-5 ${bookmarked ? 'text-mustard' : ''}`}
                                    filled={bookmarked}
                                />
                            </button>
                            <button
                                type="button"
                                disabled={likeBusy || inert || !listing.slug}
                                onClick={toggleLike}
                                className="inline-flex h-11 items-center gap-1.5 px-1.5 text-sm tabular-nums transition hover:opacity-70 disabled:opacity-60"
                                title="Likes"
                                aria-label={
                                    liked
                                        ? `Unlike listing, ${likeCount} likes`
                                        : `Like listing, ${likeCount} likes`
                                }
                            >
                                <HeartMark
                                    className={`h-5 w-5 ${liked ? 'text-mustard' : ''}`}
                                    filled={liked}
                                />
                                {likeCount}
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
}
