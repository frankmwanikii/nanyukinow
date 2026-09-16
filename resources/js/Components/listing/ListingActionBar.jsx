import {
    Bookmark,
    Flag,
    Heart,
    Share2,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import ShareListingModal from './ShareListingModal';
import ClaimListingModal from './ClaimListingModal';
import ReportListingModal from './ReportListingModal';

export default function ListingActionBar({ listing }) {
    const [saved, setSaved] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [claimOpen, setClaimOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);

    const actions = [
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
    ];

    return (
        <>
            <div className="border-b border-olive-200/50 bg-earth-sand">
                <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-2 px-4 py-2.5 sm:gap-2.5 sm:px-6 sm:py-3">
                    {actions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.id}
                                type="button"
                                onClick={action.onClick}
                                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                                    action.active
                                        ? 'bg-mustard/25 text-olive-950'
                                        : 'text-olive-800 hover:bg-white/70'
                                }`}
                            >
                                <Icon
                                    className={`h-[1.15rem] w-[1.15rem] ${
                                        action.active
                                            ? 'fill-mustard text-mustard'
                                            : 'text-olive-700'
                                    }`}
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
