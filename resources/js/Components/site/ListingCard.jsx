import { Heart, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ListingCard({ listing, featured = false }) {
    const [saved, setSaved] = useState(false);

    return (
        <motion.article
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="group overflow-hidden rounded-2xl bg-white shadow-soft"
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={listing.image}
                    alt={listing.title}
                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-earth-dusk/35 via-transparent to-transparent" />
                {listing.logo && (
                    <img
                        src={listing.logo}
                        alt=""
                        className="absolute bottom-3 left-3 h-11 w-11 rounded-full border-2 border-white object-cover shadow-md"
                        loading="lazy"
                    />
                )}
                <button
                    type="button"
                    onClick={() => setSaved((v) => !v)}
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
                    {listing.rating && (
                        <span className="inline-flex shrink-0 items-center gap-1 text-sm text-olive-700">
                            <Star className="h-3.5 w-3.5 fill-mustard text-mustard" />
                            {listing.rating}
                        </span>
                    )}
                </div>
                <p className="flex items-center gap-1.5 text-sm text-olive-600">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {listing.location}
                    {listing.subcategory || listing.category ? (
                        <span className="text-olive-400">
                            · {listing.subcategory || listing.category}
                        </span>
                    ) : null}
                </p>
            </div>
        </motion.article>
    );
}
