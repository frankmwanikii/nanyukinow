import { Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';
import ListingHero from '@/Components/listing/ListingHero';
import ListingSubnav from '@/Components/listing/ListingSubnav';
import ListingActionBar from '@/Components/listing/ListingActionBar';
import RelatedListings from '@/Components/listing/RelatedListings';
import ContactInfoPage from '@/Components/listing/ContactInfoPage';
import MessageListingModal from '@/Components/listing/MessageListingModal';
import ProductsPage from '@/Components/listing/ProductsPage';
import ReviewsPage from '@/Components/listing/ReviewsPage';
import { renderListingSection } from '@/Components/listing/renderListingSection';
import { getListingDetail } from '@/data/listingDetails';
import { getLayoutForCategory } from '@/data/listingLayouts';

function readTabFromHash(allowed) {
    if (typeof window === 'undefined') return 'overview';
    const hash = window.location.hash.replace('#', '');
    return allowed.has(hash) ? hash : 'overview';
}

export default function ListingShow({
    slug,
    listing: serverListing = null,
    related: serverRelated = [],
    preview = false,
    previewStatus = null,
}) {
    const listing = useMemo(() => {
        if (!serverListing) return null;
        return getListingDetail(serverListing);
    }, [serverListing]);
    const layout = listing
        ? getLayoutForCategory(listing.categoryKey)
        : null;
    const subnav = useMemo(() => {
        const items = layout?.subnav || [];
        const hasProducts =
            Array.isArray(listing?.products) &&
            listing.products.some(
                (p) => p?.name || p?.title || typeof p === 'string',
            );
        return items.filter((t) => (t.id === 'products' ? hasProducts : true));
    }, [layout, listing]);
    const allowedTabs = useMemo(() => {
        const ids = subnav.map((t) => t.id);
        return new Set(ids.length ? ids : ['overview', 'contact', 'reviews']);
    }, [subnav]);

    const [tab, setTab] = useState(() => readTabFromHash(allowedTabs));
    const [messageOpen, setMessageOpen] = useState(false);

    useEffect(() => {
        setTab(readTabFromHash(allowedTabs));
        const onHash = () => setTab(readTabFromHash(allowedTabs));
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, [allowedTabs, slug]);

    const changeTab = (next) => {
        if (!allowedTabs.has(next)) return;
        setTab(next);
        if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', `#${next}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (!listing) {
        return (
            <SiteLayout title="Listing not found" compactNav>
                <section className="mx-auto max-w-2xl px-4 py-28 text-center sm:px-6">
                    <h1 className="font-display text-3xl font-semibold text-earth-dusk">
                        Listing not found
                    </h1>
                    <p className="mt-3 text-olive-700">
                        That listing may have moved or isn’t published yet.
                    </p>
                    <Link
                        href="/explore"
                        className="inline-flex mt-8 rounded-full bg-olive-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950"
                    >
                        Back to explore
                    </Link>
                </section>
            </SiteLayout>
        );
    }

    const related = (serverRelated || []).slice(0, 3).map((item) =>
        getListingDetail(item),
    );

    return (
        <SiteLayout title={listing.title} compactNav>
            {preview ? (
                <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm font-semibold text-amber-950 sm:px-6">
                    Preview only — this listing is{' '}
                    <span className="capitalize">
                        {previewStatus || 'unpublished'}
                    </span>{' '}
                    and not visible to the public.
                </div>
            ) : null}
            <ListingHero
                listing={listing}
                secondaryCta={layout.ctaSecondary}
                onMessage={() => setMessageOpen(true)}
            />
            <ListingSubnav
                items={subnav}
                active={tab}
                onChange={changeTab}
            />
            <ListingActionBar listing={listing} />
            <MessageListingModal
                open={messageOpen}
                onClose={() => setMessageOpen(false)}
                listing={listing}
            />

            <div className="bg-earth-sand pb-8 pt-4 sm:pt-6 lg:pb-14">
                {tab === 'overview' ? (
                    <div className="mx-auto grid max-w-site gap-5 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)] lg:items-start">
                        <div className="flex min-w-0 flex-col gap-5">
                            {layout.main.map((key) =>
                                renderListingSection(key, listing),
                            )}
                        </div>
                        <aside className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-36">
                            {layout.side.map((key) =>
                                renderListingSection(key, listing),
                            )}
                        </aside>
                    </div>
                ) : null}

                {tab === 'contact' ? (
                    <ContactInfoPage listing={listing} />
                ) : null}

                {tab === 'products' ? (
                    <ProductsPage listing={listing} />
                ) : null}

                {tab === 'reviews' ? (
                    <ReviewsPage listing={listing} />
                ) : null}
            </div>

            <RelatedListings listings={related} />
        </SiteLayout>
    );
}
