import { Link } from '@inertiajs/react';
import { MessageCircle, Phone, Star, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import { listingSubcategories } from '@/utils/listingSubcategories';

const primaryBtn =
    'inline-flex items-center justify-center gap-1.5 rounded-full bg-mustard px-3.5 py-2.5 text-xs font-bold text-olive-950 shadow-lift transition hover:bg-white sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm';
const secondaryBtn =
    'inline-flex items-center justify-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2.5 text-xs font-semibold text-white ring-1 ring-white/35 backdrop-blur transition hover:bg-white hover:text-olive-950 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm';

export default function ListingHero({ listing, secondaryCta }) {
    const tel = listing.phone
        ? `tel:${String(listing.phone).replace(/\s+/g, '')}`
        : null;
    const isEvent = listing.categoryKey === 'events';
    const ticketUrl = listing.ticketUrl;

    const subtitle = isEvent
        ? [
              listing.venue,
              listing.location,
              listing.earlyBirdPrice
                  ? `Early bird ${listing.earlyBirdPrice}`
                  : listing.ticketPrice,
          ]
              .filter(Boolean)
              .join(' · ')
        : [listing.tagline, listing.location || null]
              .filter(Boolean)
              .join(' · ');

    return (
        <header className="relative flex min-h-[62svh] items-end overflow-hidden bg-olive-900 pt-24 sm:min-h-[78svh] sm:pt-28 lg:min-h-[82svh]">
            <div className="absolute inset-0">
                <motion.img
                    initial={{ scale: 1.06 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    src={listing.image}
                    alt=""
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-earth-dusk via-earth-dusk/55 to-earth-dusk/20" />
                <div className="absolute inset-0 bg-grain opacity-40 mix-blend-overlay" />
            </div>

            <div className="relative mx-auto w-full max-w-[1400px] px-4 pb-7 sm:px-6 sm:pb-10">
                <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
                    {/* Identity */}
                    <div className="flex min-w-0 items-center gap-3.5 sm:gap-5">
                        {listing.logo ? (
                            <img
                                src={listing.logo}
                                alt=""
                                className="h-[4.25rem] w-[4.25rem] shrink-0 rounded-full border-[3px] border-white object-cover shadow-lift sm:h-20 sm:w-20 lg:h-24 lg:w-24"
                            />
                        ) : null}
                        <div className="min-w-0 flex-1">
                            {listing.categoryKey === 'properties' &&
                            (listing.propertyType ||
                                listingSubcategories(listing).length) ? (
                                <p className="mb-1.5 flex flex-wrap items-center gap-1.5 sm:mb-2 sm:gap-2">
                                    {listing.propertyType ? (
                                        <span className="inline-flex rounded-full bg-mustard px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-olive-950 sm:px-3 sm:py-1 sm:text-[11px]">
                                            {listing.propertyType}
                                        </span>
                                    ) : null}
                                    {listingSubcategories(listing).map((sub) => (
                                        <span
                                            key={sub}
                                            className="inline-flex rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white ring-1 ring-white/30 backdrop-blur sm:px-3 sm:py-1 sm:text-[11px]"
                                        >
                                            {sub}
                                        </span>
                                    ))}
                                </p>
                            ) : null}
                            {isEvent && listingSubcategories(listing).length ? (
                                <p className="mb-1.5 flex flex-wrap gap-1.5 sm:mb-2 sm:gap-2">
                                    {listingSubcategories(listing).map((sub) => (
                                        <span
                                            key={sub}
                                            className="inline-flex rounded-full bg-mustard px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-olive-950 sm:px-3 sm:py-1 sm:text-[11px]"
                                        >
                                            {sub}
                                        </span>
                                    ))}
                                </p>
                            ) : null}
                            <h1 className="font-display text-[1.65rem] font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                                {listing.title}
                            </h1>
                            {subtitle ? (
                                <p className="mt-1 text-[13px] leading-snug text-white/80 sm:mt-2 sm:text-base sm:leading-normal">
                                    {subtitle}
                                </p>
                            ) : null}
                            <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                                <Star className="h-3.5 w-3.5 fill-mustard text-mustard sm:h-4 sm:w-4" />
                                {Number(listing.rating ?? 0) > 0
                                    ? Number(listing.rating).toFixed(1)
                                    : '0'}
                                {listing.reviewSummary?.count ? (
                                    <span className="font-normal text-white/70">
                                        · {listing.reviewSummary.count}{' '}
                                        reviews
                                    </span>
                                ) : null}
                            </p>
                        </div>
                    </div>

                    {/* CTAs — equal-width on mobile, compact cluster on larger screens */}
                    <div className="flex w-full gap-2 sm:w-auto sm:flex-wrap sm:items-center sm:justify-end sm:gap-2.5 lg:shrink-0">
                        {ticketUrl ? (
                            <a
                                href={ticketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`min-w-0 flex-1 sm:flex-none ${primaryBtn}`}
                            >
                                <Ticket className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                                <span className="truncate">Buy tickets</span>
                            </a>
                        ) : null}
                        {tel && !ticketUrl ? (
                            <a
                                href={tel}
                                className={`min-w-0 flex-1 sm:flex-none ${primaryBtn}`}
                            >
                                <Phone className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                                <span className="truncate">Call now</span>
                            </a>
                        ) : null}
                        {tel && ticketUrl ? (
                            <a
                                href={tel}
                                className={`min-w-0 flex-1 sm:flex-none ${secondaryBtn}`}
                            >
                                <Phone className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                                Call
                            </a>
                        ) : null}
                        <Link
                            href="/explore"
                            className={`min-w-0 flex-1 sm:flex-none ${secondaryBtn}`}
                        >
                            <MessageCircle className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                            <span className="truncate">Direct message</span>
                        </Link>
                        {secondaryCta && !ticketUrl ? (
                            <span className="hidden items-center justify-center rounded-full bg-olive-800/80 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide text-white/90 sm:inline-flex sm:text-xs">
                                {secondaryCta}
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>
        </header>
    );
}
