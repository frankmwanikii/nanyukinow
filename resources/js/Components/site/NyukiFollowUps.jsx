import { ForwardMark } from '@/Components/site/Mark';
import { Link } from '@inertiajs/react';

/**
 * Follow-up chips + optional Explore CTA after an assistant reply.
 */
export default function NyukiFollowUps({
    followUps = [],
    exploreCta = null,
    onAsk,
    disabled = false,
    compact = false,
}) {
    const chips = Array.isArray(followUps)
        ? followUps.filter((item) => item?.label).slice(0, 2)
        : [];
    const hasCta = Boolean(exploreCta?.href && exploreCta?.label);

    if (chips.length === 0 && !hasCta) {
        return null;
    }

    return (
        <div
            className={`flex w-full flex-col gap-2 ${
                compact
                    ? 'max-w-[min(100%,22rem)]'
                    : 'max-w-[min(100%,22rem)] sm:max-w-[20rem]'
            }`}
        >
            {chips.length > 0 ? (
                <ul className="flex flex-col gap-1.5">
                    {chips.map((item) => (
                        <li key={item.label}>
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={() => onAsk?.(item.label)}
                                className="flex w-full items-center gap-2 rounded-full border border-olive-900/12 bg-white/90 px-3 py-2 text-left text-[13px] font-medium text-olive-800 shadow-sm transition hover:border-olive-900/25 hover:bg-white disabled:opacity-60"
                            >
                                <ForwardMark className="h-3.5 w-3.5 shrink-0 text-olive-500" />
                                <span className="min-w-0 flex-1">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}

            {hasCta ? (
                <Link
                    href={exploreCta.href}
                    prefetch
                    className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-olive-900 underline decoration-olive-900/25 underline-offset-2 transition hover:decoration-olive-900"
                >
                    {exploreCta.label}
                    <ForwardMark className="h-3.5 w-3.5" />
                </Link>
            ) : null}
        </div>
    );
}
