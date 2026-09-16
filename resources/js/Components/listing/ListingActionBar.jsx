import {
    Bookmark,
    Flag,
    Globe,
    Heart,
    Share2,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import ShareListingModal from './ShareListingModal';
import ClaimListingModal from './ClaimListingModal';
import ReportListingModal from './ReportListingModal';

function normalizeWebsiteUrl(url) {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
}

export default function ListingActionBar({ listing }) {
    const [saved, setSaved] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [claimOpen, setClaimOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);

    const website = normalizeWebsiteUrl(
        listing?.website || listing?.socials?.website,
    );

    const actions = [
        website
            ? {
                  id: 'website',
                  label: 'Website',
                  icon: Globe,
                  href: website,
              }
            : null,
        {
            id: 'share',
            label: 'Share',
            icon: Share2,
            onClick: () => setShareOpen(true),
        },
        {
            id: 'claim',
            label: 'Claim listing',
            icon: ShieldCheck,
            onClick: () => setClaimOpen(true),
        },
        {
            id: 'bookmark',
            label: saved ? 'Saved' : 'Bookmark',
            icon: saved ? Heart : Bookmark,
            onClick: () => setSaved((v) => !v),
            active: saved,
        },
        {
            id: 'report',
            label: 'Report',
            icon: Flag,
            onClick: () => setReportOpen(true),
        },
    ].filter(Boolean);

    const actionClass = (active) =>
        `inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
            active
                ? 'bg-mustard/25 text-olive-950'
                : 'text-olive-800 hover:bg-white/70'
        }`;

    return (
        <>
            <div className="border-b border-olive-200/50 bg-earth-sand">
                <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-2 px-4 py-2.5 sm:gap-2.5 sm:px-6 sm:py-3">
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
                                    target="_blank"
                                    rel="noopener noreferrer"
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
                                className={actionClass(action.active)}
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
