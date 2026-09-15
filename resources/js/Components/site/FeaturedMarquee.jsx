import { Link } from '@inertiajs/react';
import { useLocale } from '@/i18n/LocaleContext';

export default function FeaturedMarquee({ items }) {
    const { t } = useLocale();
    const loop = [...items, ...items];

    return (
        <section
            className="relative z-10 -mt-8 bg-transparent pb-4 sm:-mt-12"
            aria-label="Featured highlights"
        >
            <div className="group/marquee overflow-hidden">
                <div className="flex w-max gap-4 animate-marquee group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none">
                    {loop.map((item, i) => (
                        <Link
                            key={`${item.id}-${i}`}
                            href={item.href}
                            className="group w-[min(82vw,22rem)] shrink-0 overflow-hidden rounded-2xl shadow-lift sm:w-[24rem]"
                            tabIndex={i >= items.length ? -1 : undefined}
                            aria-hidden={i >= items.length ? true : undefined}
                        >
                            <div className="relative aspect-[16/10] overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={i >= items.length ? '' : item.title}
                                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                    loading={i < 3 ? 'eager' : 'lazy'}
                                    draggable={false}
                                />
                            </div>
                            <div className="flex items-center justify-between gap-3 bg-olive-600 px-4 py-4 text-white">
                                <h3 className="font-display text-sm font-semibold sm:text-base">
                                    {item.title}
                                </h3>
                                <span className="shrink-0 rounded-full bg-mustard px-3 py-1 text-xs font-bold text-olive-950">
                                    {t.featured.view}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
