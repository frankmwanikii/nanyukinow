import { Lock, Sparkles } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { requiredTierLabel } from '@/data/eatDrinkTierFeatures';

/**
 * Shows a field but blocks interaction until the listing tier unlocks it.
 */
export default function TierLockedField({
    locked = false,
    feature = '',
    requiredTier,
    isAdmin = false,
    className = '',
    children,
}) {
    if (!locked) {
        return <div className={className}>{children}</div>;
    }

    const tierName = requiredTier || requiredTierLabel(feature) || 'a higher';

    return (
        <div className={`relative ${className}`}>
            <div
                className="pointer-events-none select-none opacity-45 saturate-50"
                aria-hidden="true"
            >
                {children}
            </div>
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-olive-950/55 p-3 backdrop-blur-[2px] dark:bg-black/55">
                <div className="max-w-sm rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-center shadow-lift dark:border-olive-700 dark:bg-olive-950/95">
                    <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-mustard/30 text-olive-900 dark:text-mustard">
                        <Lock className="h-4 w-4" strokeWidth={2.25} />
                    </div>
                    <p className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                        {tierName} feature
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-olive-600 dark:text-olive-300">
                        {isAdmin
                            ? `Set the listing plan tier to ${tierName} (or higher) to unlock this field.`
                            : `Upgrade to ${tierName} to unlock this on your Eat & Drink listing.`}
                    </p>
                    {!isAdmin ? (
                        <Link
                            href={route('account.upgrade')}
                            className="mt-3 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-olive-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-mustard hover:text-earth-dusk dark:bg-mustard dark:text-earth-dusk dark:hover:bg-olive-100"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            Upgrade to unlock
                        </Link>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
