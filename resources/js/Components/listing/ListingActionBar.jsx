import {
    Bookmark,
    Flag,
    Heart,
    Share2,
    ShieldCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ListingActionBar({ listing }) {
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return undefined;
        const t = window.setTimeout(() => setCopied(false), 1800);
        return () => window.clearTimeout(t);
    }, [copied]);

    const share = async () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const title = listing.title;
        try {
            if (navigator.share) {
                await navigator.share({ title, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            setCopied(true);
        } catch {
            // ignore cancel
        }
    };

    const actions = [
        {
            label: copied ? 'Link copied' : 'Share',
            icon: Share2,
            onClick: share,
        },
        {
            label: 'Claim listing',
            icon: ShieldCheck,
            onClick: () => {},
        },
        {
            label: saved ? 'Saved' : 'Bookmark',
            icon: saved ? Heart : Bookmark,
            onClick: () => setSaved((v) => !v),
            active: saved,
        },
        {
            label: 'Report',
            icon: Flag,
            onClick: () => {},
        },
    ];

    return (
        <div className="border-b border-olive-200/50 bg-earth-sand">
            <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-2 px-4 py-2.5 sm:gap-2.5 sm:px-6 sm:py-3">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.label}
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
    );
}
