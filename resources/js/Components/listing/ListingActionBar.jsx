import { Globe, Share2, ShieldCheck, Bookmark, Heart, Flag } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ShareListingModal from './ShareListingModal';
import ClaimListingModal from './ClaimListingModal';
import ReportListingModal from './ReportListingModal';
import { listingVisitUrl } from '@/utils/listingVisit';
import { toggleListingBookmark } from '@/utils/listingBookmark';

export default function ListingActionBar({ listing }) {
    const { auth } = usePage().props;
    const bookmarkedIds = auth?.user?.bookmarkedListingIds ?? [];
    const bookmarkKey = Array.isArray(bookmarkedIds)
        ? bookmarkedIds.map(Number).sort((a, b) => a - b).join(',')
        : '';
    const [saved, setSaved] = useState(() =>
        bookmarkedIds.includes(Number(listing?.id)),
    );
    const [bookmarkBusy, setBookmarkBusy] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [claimOpen, setClaimOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);

    useEffect(() => {
        const ids = bookmarkKey
            ? bookmarkKey.split(',').map(Number)
            : [];
        setSaved(ids.includes(Number(listing?.id)));
    }, [bookmarkKey, listing?.id]);

    const hasWebsite = Boolean(
        listing?.website ||
            listing?.socials?.website ||
            (listing?.websiteLinks || []).length,
    );
    const visitHref =
        hasWebsite && listing?.slug
            ? listingVisitUrl(listing.slug)
            : null;

    const claimStatus = listing?.claim_status || 'unclaimed';
    const canClaim = claimStatus === 'unclaimed';

    const toggleBookmark = async () => {
        if (bookmarkBusy || !listing?.slug) return;
        if (!auth?.user) {
            router.visit(route('login'));
            return;
        }

        const next = !saved;
        setSaved(next);
        setBookmarkBusy(true);
        try {
            const data = await toggleListingBookmark(listing.slug, next);
            if (typeof data.bookmarked === 'boolean') {
                setSaved(data.bookmarked);
            }
        } catch (err) {
            setSaved(!next);
            if (err?.status === 401) {
                router.visit(route('login'));
            }
        } finally {
            setBookmarkBusy(false);
        }
    };

    const actions = [
        visitHref
            ? {
                  id: 'website',
                  label: 'Website',
                  icon: Globe,
                  href: visitHref,
              }
            : null,
        {
            id: 'share',
            label: 'Share',
            icon: Share2,
            onClick: () => setShareOpen(true),
        },
        canClaim
            ? {
                  id: 'claim',
                  label: 'Claim listing',
                  icon: ShieldCheck,
                  onClick: () => setClaimOpen(true),
              }
            : null,
        {
            id: 'bookmark',
            label: saved ? 'Saved' : 'Bookmark',
            icon: saved ? Heart : Bookmark,
            onClick: toggleBookmark,
            active: saved,
            disabled: bookmarkBusy,
        },
        {
            id: 'report',
            label: 'Report',
            icon: Flag,
            onClick: () => setReportOpen(true),
        },
    ].filter(Boolean);

    const actionClass = (active) =>
        `inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition ${
            active
                ? 'bg-mustard/25 text-olive-950'
                : 'text-olive-800 hover:bg-white/70'
        }`;

    return (
        <>
            <div className="border-b border-olive-200/50 bg-earth-sand">
                <div className="overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="mx-auto flex w-max min-w-full max-w-site flex-nowrap items-center justify-start gap-1 px-4 py-2.5 sm:justify-center sm:gap-2.5 sm:px-6 sm:py-3">
                        {actions.map((action) => {
                            const Icon = action.icon;
                            const iconClass = `h-[1.15rem] w-[1.15rem] ${
                                action.active
                                    ? 'fill-mustard text-mustard'
                                    : 'text-olive-700'
                            }`;

                            if (action.href) {
                                return (
                                    <a
                                        key={action.id}
                                        href={action.href}
                                        className={actionClass(false)}
                                    >
                                        <Icon
                                            className={iconClass}
                                            strokeWidth={1.75}
                                        />
                                        {action.label}
                                    </a>
                                );
                            }

                            return (
                                <button
                                    key={action.id}
                                    type="button"
                                    onClick={action.onClick}
                                    disabled={action.disabled}
                                    className={`${actionClass(action.active)} disabled:opacity-60`}
                                >
                                    <Icon
                                        className={iconClass}
                                        strokeWidth={1.75}
                                    />
                                    {action.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <ShareListingModal
                open={shareOpen}
                onClose={() => setShareOpen(false)}
                listing={listing}
            />
            <ClaimListingModal
                open={claimOpen}
                onClose={() => setClaimOpen(false)}
                listing={listing}
            />
            <ReportListingModal
                open={reportOpen}
                onClose={() => setReportOpen(false)}
                listing={listing}
            />
        </>
    );
}
