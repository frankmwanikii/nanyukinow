import ListingCard from '@/Components/site/ListingCard';

export default function RelatedListings({ listings = [] }) {
    if (!listings.length) return null;

    return (
        <section className="border-t border-olive-200/80 bg-white py-12 sm:py-16">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                <h2 className="font-display text-2xl font-semibold text-earth-dusk sm:text-3xl">
                    You may also be interested in
                </h2>
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {listings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            </div>
        </section>
    );
}
