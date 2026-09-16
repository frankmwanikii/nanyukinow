import { Link } from '@inertiajs/react';
import { MessageCircle, Phone, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ListingHero({ listing, secondaryCta }) {
    const tel = listing.phone
        ? `tel:${String(listing.phone).replace(/\s+/g, '')}`
        : null;

    return (
        <header className="relative flex min-h-[68svh] items-end overflow-hidden bg-olive-900 pt-24 sm:min-h-[78svh] sm:pt-28 lg:min-h-[82svh]">
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

            <div className="relative mx-auto w-full max-w-[1400px] px-4 pb-8 sm:px-6 sm:pb-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex min-w-0 items-end gap-4 sm:gap-5">
                        {listing.logo ? (
                            <img
                                src={listing.logo}
                                alt=""
                                className="h-16 w-16 shrink-0 rounded-full border-[3px] border-white object-cover shadow-lift sm:h-20 sm:w-20 lg:h-24 lg:w-24"
                            />
                        ) : null}
                        <div className="min-w-0 pb-1">
                            {listing.categoryKey === 'properties' &&
                            (listing.propertyType || listing.subcategory) ? (
                                <p className="mb-2 flex flex-wrap items-center gap-2">
                                    {listing.propertyType ? (
                                        <span className="inline-flex rounded-full bg-mustard px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-olive-950">
                                            {listing.propertyType}
                                        </span>
                                    ) : null}
                                    {listing.subcategory ? (
                                        <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white ring-1 ring-white/30 backdrop-blur">
                                            {listing.subcategory}
                                        </span>
                                    ) : null}
                                </p>
                            ) : null}
                            <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
                                {listing.title}
                            </h1>
                            <p className="mt-2 max-w-xl text-sm text-white/80 sm:text-base">
                                {listing.tagline}
                                {listing.location ? ` · ${listing.location}` : ''}
                            </p>
                            {listing.rating ? (
                                <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                                    <Star className="h-4 w-4 fill-mustard text-mustard" />
                                    {listing.rating}
                                    {listing.reviewSummary?.count ? (
                                        <span className="font-normal text-white/70">
                                            · {listing.reviewSummary.count} reviews
                                        </span>
                                    ) : null}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 lg:justify-end">
                        {tel ? (
                            <a
                                href={tel}
                                className="inline-flex items-center gap-2 rounded-full bg-mustard px-5 py-3 text-sm font-bold text-olive-950 shadow-lift transition hover:bg-white"
                            >
                                <Phone className="h-4 w-4" />
                                Call now
                            </a>
                        ) : null}
                        <Link
                            href="/explore"
                            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/35 backdrop-blur transition hover:bg-white hover:text-olive-950"
                        >
                            <MessageCircle className="h-4 w-4" />
                            Direct message
                        </Link>
                        {secondaryCta ? (
                            <span className="hidden items-center rounded-full bg-olive-800/80 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/90 sm:inline-flex">
                                {secondaryCta}
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>
        </header>
    );
}
