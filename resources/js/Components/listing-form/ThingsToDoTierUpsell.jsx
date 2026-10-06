import { Link } from '@inertiajs/react';
import { normalizeTier, tierDisplayLabel } from '@/data/thingsToDoTierFeatures';
import { Sparkles } from 'lucide-react';

const COPY = {
    free: {
        next: 'Standard',
        line: 'Unlimited description, tagline, map pin, group size, what’s included / what to bring, amenities, gallery, payments, email, and social links unlock on Standard. Video, booking link, special offers, WhatsApp, and website unlock on Premium.',
    },
    featured: {
        next: 'Premium',
        line: 'Featured search placement, video preview, direct booking link, special offers, WhatsApp, website, and a larger gallery unlock on Premium.',
    },
};

export default function ThingsToDoTierUpsell({
    tier = 'free',
    isAdmin = false,
    className = '',
}) {
    const current = normalizeTier(tier);
    if (current === 'premium') return null;

    const copy = COPY[current] || COPY.free;

    return (
        <div
            className={`flex flex-col gap-3 rounded-xl border border-olive-200 bg-olive-50/60 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-olive-800 dark:bg-olive-950/50 ${className}`}
        >
            <div className="min-w-0">
                <p className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                    {isAdmin
                        ? `More fields on ${copy.next}+`
                        : `Get more with ${copy.next}`}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-olive-600 dark:text-olive-400">
                    {isAdmin
                        ? `Raise this listing’s plan tier above ${tierDisplayLabel(current)} to show the extra Things to do fields.`
                        : copy.line}
                </p>
            </div>
            {!isAdmin ? (
                <Link
                    href={route('account.upgrade')}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg bg-olive-900 px-3.5 text-xs font-semibold text-white transition hover:bg-mustard hover:text-earth-dusk sm:self-center dark:bg-mustard dark:text-earth-dusk dark:hover:bg-olive-100"
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    Upgrade
                </Link>
            ) : null}
        </div>
    );
}
