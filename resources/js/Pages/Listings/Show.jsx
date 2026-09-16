import { Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';
import ListingHero from '@/Components/listing/ListingHero';
import ListingSubnav from '@/Components/listing/ListingSubnav';
import ListingActionBar from '@/Components/listing/ListingActionBar';
import MobileStickyCta from '@/Components/listing/MobileStickyCta';
import RelatedListings from '@/Components/listing/RelatedListings';
import ContactInfoPage from '@/Components/listing/ContactInfoPage';
import ProductsPage from '@/Components/listing/ProductsPage';
import ReviewsPage from '@/Components/listing/ReviewsPage';
import { renderListingSection } from '@/Components/listing/renderListingSection';
import { getListingDetail } from '@/data/listingDetails';
import { getLayoutForCategory } from '@/data/listingLayouts';
import {
    getListingBySlug,
    getRelatedListings,
} from '@/data/listings';

function readTabFromHash(allowed) {
    if (typeof window === 'undefined') return 'overview';
    const hash = window.location.hash.replace('#', '');
    return allowed.has(hash) ? hash : 'overview';
}

export default function ListingShow({ slug, id }) {
    const base = getListingBySlug(slug || id);
    const listing = getListingDetail(base);
    const layout = listing
        ? getLayoutForCategory(listing.categoryKey)
        : null;
    const allowedTabs = useMemo(() => {
        const ids = (layout?.subnav || []).map((t) => t.id);
        return new Set(ids.length ? ids : ['overview', 'contact', 'reviews']);
    }, [layout]);

    const [tab, setTab] = useState(() => readTabFromHash(allowedTabs));

    useEffect(() => {
        setTab(readTabFromHash(allowedTabs));
        const onHash = () => setTab(readTabFromHash(allowedTabs));
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, [allowedTabs]);

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
                        className="mt-8 inline-flex rounded-full bg-olive-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950"
                    >
                        Back to explore
                    </Link>
                </section>
            </SiteLayout>
        );
    }

    const related = getRelatedListings(
        listing,
        listing.relatedIds || [],
        3,
    );

    return (
        <SiteLayout title={listing.title} compactNav>
            <ListingHero
                listing={listing}
                secondaryCta={layout.ctaSecondary}
            />
            <ListingSubnav
                items={layout.subnav}
                active={tab}
                onChange={changeTab}
            />
            <ListingActionBar listing={listing} />

            <div className="bg-earth-sand pb-24 pt-4 sm:pt-6 lg:pb-14">
                {tab === 'overview' ? (
                    <div className="mx-auto grid max-w-[1400px] gap-4 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)] lg:items-start lg:gap-5">
                        <div className="flex flex-col gap-4">
                            {layout.main.map((key) =>
                                renderListingSection(key, listing),
                            )}
                        </div>
                        <aside className="flex flex-col gap-4 lg:sticky lg:top-36">
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
            <MobileStickyCta listing={listing} />
        </SiteLayout>
    );
}
