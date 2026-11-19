import { useEffect, useMemo, useState } from 'react';
import { Expand, ExternalLink, MessageCircle, Phone, Ticket } from '@/Components/site/LucideCompat';
import { motion } from 'framer-motion';
import { VerifiedMark } from '@/Components/site/Mark';
import { listingSubcategories } from '@/utils/listingSubcategories';
import { plainText } from '@/utils/plainText';
import { normalizeGallerySpaces } from '@/data/listingDetails';
import GalleryLightbox from './GalleryLightbox';

const primaryBtn =
    'inline-flex items-center justify-center gap-1.5 rounded-full bg-mustard px-3.5 py-2.5 text-xs font-bold text-olive-950 shadow-lift transition hover:bg-white sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm';
const secondaryBtn =
    'inline-flex items-center justify-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2.5 text-xs font-semibold text-white ring-1 ring-white/35 backdrop-blur transition hover:bg-white hover:text-olive-950 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm';

function actionUrl(listing) {
    return (
        listing.bookingUrl ||
        listing.enquiryUrl ||
        listing.onlineStoreUrl ||
        listing.whatsappCatalogUrl ||
        listing.ticketUrl ||
        null
    );
}

export default function ListingHero({
    listing,
    secondaryCta,
    onMessage = null,
}) {
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [posterIsLandscape, setPosterIsLandscape] = useState(null);
    const tel = listing.phone
        ? `tel:${String(listing.phone).replace(/\s+/g, '')}`
        : null;
    const isEvent = listing.categoryKey === 'events';
    const heroImage = isEvent
        ? listing.eventPoster || listing.image
        : listing.image;
    const ticketUrl = listing.ticketUrl;
    const bookUrl = actionUrl(listing);
    const contactHref = `#contact`;
    const openMessage = () => {
        if (onMessage) {
            onMessage();
            return;
        }
        if (typeof window !== 'undefined') {
            window.location.hash = 'contact';
        }
    };

    useEffect(() => {
        if (!isEvent || !heroImage) {
            setPosterIsLandscape(null);
            return;
        }

        let cancelled = false;
        const img = new Image();
        img.onload = () => {
            if (cancelled) return;
            setPosterIsLandscape(img.naturalWidth >= img.naturalHeight);
        };
        img.onerror = () => {
            if (cancelled) return;
            setPosterIsLandscape(null);
        };
        img.src = heroImage;

        return () => {
            cancelled = true;
        };
    }, [isEvent, heroImage]);

    const lightboxItems = useMemo(() => {
        if (!isEvent) return [];
        const seen = new Set();
        const items = [];
        const push = (src, label) => {
            if (!src || seen.has(src)) return;
            seen.add(src);
            items.push({ src, label, alt: label });
        };
        push(heroImage, 'Event poster');
        for (const space of normalizeGallerySpaces(listing.gallery || [])) {
            for (const src of space.images || []) {
                push(src, space.label || 'Photo');
            }
        }
        return items;
    }, [isEvent, heroImage, listing.gallery]);

    const eventMeta = isEvent
        ? [listing.venue, listing.location, listing.ticketPrice]
              .map((part) => plainText(part))
              .filter(Boolean)
              .join(' · ')
        : '';
    const subtitle = plainText(listing.tagline) || eventMeta || null;

    // Landscape events use the same cover fill as places. Portrait keeps the blurred pad.
    const usePortraitPoster = isEvent && posterIsLandscape === false;

    return (
        <header className="relative flex min-h-[62svh] items-end overflow-hidden bg-olive-900 pt-24 sm:min-h-[78svh] sm:pt-28 lg:min-h-[82svh]">
            <div className="absolute inset-0">
                {heroImage ? (
                    usePortraitPoster ? (
                        <>
                            <img
                                src={heroImage}
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
                            />
                            <button
                                type="button"
                                onClick={() => setLightboxIndex(0)}
                                className="absolute inset-0 z-[1] flex cursor-zoom-in items-center justify-center px-4 pt-24 pb-36 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mustard sm:pt-28 sm:pb-40"
                                aria-label="View event poster full size"
                            >
                                <motion.img
                                    initial={{ scale: 1.04, opacity: 0.92 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 1.1, ease: 'easeOut' }}
                                    src={heroImage}
                                    alt=""
                                    className="max-h-full max-w-full object-contain drop-shadow-2xl"
                                />
                                <span className="absolute right-4 top-28 z-[2] inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-olive-900 shadow-soft sm:right-6 sm:top-32">
                                    <Expand className="h-3.5 w-3.5" />
                                    View full size
                                </span>
                            </button>
                        </>
                    ) : (
                        <motion.img
                            initial={{ scale: 1.06 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            src={heroImage}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    )
                ) : null}
                <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-earth-dusk via-earth-dusk/55 to-earth-dusk/20" />
                <div className="pointer-events-none absolute inset-0 z-[2] bg-grain opacity-40 mix-blend-overlay" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-site px-4 pb-7 sm:px-6 sm:pb-10">
                <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
                    {/* Identity */}
                    <div className="flex min-w-0 items-center gap-3.5 sm:gap-5">
                        {listing.logo && !isEvent ? (
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
                                <span className="inline-flex items-center gap-2">
                                    {listing.is_verified ? (
                                        <span
                                            className="inline-flex shrink-0"
                                            aria-label="Verified listing"
                                        >
                                            <VerifiedMark className="h-5 w-5 text-[#0095F6] sm:h-7 sm:w-7" />
                                        </span>
                                    ) : null}
                                    <span>{listing.title}</span>
                                </span>
                            </h1>
                            {subtitle ? (
                                <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-white/80 sm:mt-2 sm:text-base sm:leading-normal">
                                    {subtitle}
                                </p>
                            ) : null}
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
                        {!ticketUrl && bookUrl ? (
                            <a
                                href={bookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`min-w-0 flex-1 sm:flex-none ${primaryBtn}`}
                            >
                                <ExternalLink className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                                <span className="truncate">
                                    {secondaryCta || 'Book now'}
                                </span>
                            </a>
                        ) : null}
                        {tel && !ticketUrl && !bookUrl ? (
                            <a
                                href={tel}
                                className={`min-w-0 flex-1 sm:flex-none ${primaryBtn}`}
                            >
                                <Phone className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                                <span className="truncate">
                                    {secondaryCta === 'Call store'
                                        ? 'Call store'
                                        : 'Call now'}
                                </span>
                            </a>
                        ) : null}
                        {tel && (ticketUrl || bookUrl) ? (
                            <a
                                href={tel}
                                className={`min-w-0 flex-1 sm:flex-none ${secondaryBtn}`}
                            >
                                <Phone className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                                Call
                            </a>
                        ) : null}
                        <button
                            type="button"
                            onClick={openMessage}
                            className={`min-w-0 flex-1 sm:flex-none ${secondaryBtn}`}
                        >
                            <MessageCircle className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                            <span className="truncate">Message</span>
                        </button>
                        {secondaryCta &&
                        !ticketUrl &&
                        !bookUrl &&
                        secondaryCta !== 'Call store' ? (
                            <a
                                href={contactHref}
                                className="hidden min-h-11 items-center justify-center rounded-full bg-olive-800/80 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide text-white/90 transition hover:bg-white hover:text-olive-950 sm:inline-flex sm:text-xs"
                            >
                                {secondaryCta}
                            </a>
                        ) : null}
                    </div>
                </div>
            </div>

            {lightboxIndex != null && lightboxItems.length ? (
                <GalleryLightbox
                    items={lightboxItems}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onIndexChange={setLightboxIndex}
                    title="Event poster"
                    padBlur
                />
            ) : null}
        </header>
    );
}
