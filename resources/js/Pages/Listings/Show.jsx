import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';
import ListingHero from '@/Components/listing/ListingHero';
import ListingSubnav from '@/Components/listing/ListingSubnav';
import ListingActionBar from '@/Components/listing/ListingActionBar';
import MobileStickyCta from '@/Components/listing/MobileStickyCta';
import RelatedListings from '@/Components/listing/RelatedListings';
import ContactInfoPage from '@/Components/listing/ContactInfoPage';
import ReviewsPage from '@/Components/listing/ReviewsPage';
import { renderListingSection } from '@/Components/listing/renderListingSection';
import { getListingDetail } from '@/data/listingDetails';
import { getLayoutForCategory } from '@/data/listingLayouts';
import {
    getListingById,
    getRelatedListings,
} from '@/data/listings';

const VALID_TABS = new Set(['overview', 'contact', 'reviews']);

function readTabFromHash() {
    if (typeof window === 'undefined') return 'overview';
    const hash = window.location.hash.replace('#', '');
    return VALID_TABS.has(hash) ? hash : 'overview';
}

export default function ListingShow({ id }) {
    const base = getListingById(id);
    const listing = getListingDetail(base);
    const [tab, setTab] = useState(readTabFromHash);

    useEffect(() => {
        const onHash = () => setTab(readTabFromHash());
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, []);

    const changeTab = (next) => {
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

    const layout = getLayoutForCategory(listing.categoryKey);
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

            <div className="bg-earth-sand pb-24 pt-6 sm:pt-8 lg:pb-14">
                {tab === 'overview' ? (
                    <div className="mx-auto grid max-w-[1400px] gap-5 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)] lg:items-start lg:gap-6">
                        <div className="flex flex-col gap-5">
                            {layout.main.map((key) =>
                                renderListingSection(key, listing),
                            )}
                        </div>
                        <aside className="flex flex-col gap-5 lg:sticky lg:top-36">
                            {layout.side.map((key) =>
                                renderListingSection(key, listing),
                            )}
                        </aside>
                    </div>
                ) : null}

                {tab === 'contact' ? (
                    <ContactInfoPage listing={listing} />
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
