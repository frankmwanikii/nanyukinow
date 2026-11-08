import ListingCard from '@/Components/site/ListingCard';

export default function RelatedListings({ listings = [] }) {
    if (!listings.length) return null;

    return (
        <section className="border-t border-olive-200/80 bg-white py-10 sm:py-14">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                <h2 className="font-display text-2xl font-semibold text-earth-dusk sm:text-3xl">
                    You may also be interested in
                </h2>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {listings.map((listing) => (
                        <div key={listing.id} className="min-w-0">
                            <ListingCard listing={listing} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
