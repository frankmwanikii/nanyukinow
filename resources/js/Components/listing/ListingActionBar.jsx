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
        <div className="bg-earth-sand">
            <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-2.5 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.label}
                            type="button"
                            onClick={action.onClick}
                            className={`inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                                action.active
                                    ? 'bg-mustard/25 text-olive-950 shadow-soft'
                                    : 'bg-white/55 text-olive-800 ring-1 ring-olive-200/60 hover:bg-white hover:shadow-soft'
                            }`}
                        >
                            <Icon
                                className={`h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem] ${
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
