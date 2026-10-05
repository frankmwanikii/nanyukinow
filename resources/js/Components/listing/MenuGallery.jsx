import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import DetailSection from './DetailSection';

/**
 * Normalize menu / docs payloads into { id, title, image }.
 * Returns [] when nothing usable is present (section collapses).
 */
export function normalizeMenus(menus, docs) {
    const source = Array.isArray(menus) && menus.length
        ? menus
        : Array.isArray(docs)
          ? docs
          : [];

    return source
        .map((item, index) => {
            if (!item) return null;
            if (typeof item === 'string') {
                return {
                    id: `menu-${index}`,
                    title: `Menu ${index + 1}`,
                    image: item,
                    pdf: null,
                };
            }
            const image = item.image || item.src || item.url || null;
            const pdf = item.pdf || null;
            if (!image && !pdf) return null;
            return {
                id: item.id || `menu-${index}`,
                title: item.title || item.label || `Menu ${index + 1}`,
                image,
                pdf,
            };
        })
        .filter(Boolean);
}

export default function MenuGallery({
    menus,
    docs,
    title = 'Menus',
}) {
    const items = normalizeMenus(menus, docs);
    const [lightbox, setLightbox] = useState(null);

    useEffect(() => {
        if (lightbox == null) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') setLightbox(null);
            if (e.key === 'ArrowLeft') {
                setLightbox((i) =>
                    items.length ? (i - 1 + items.length) % items.length : i,
                );
            }
            if (e.key === 'ArrowRight') {
                setLightbox((i) =>
                    items.length ? (i + 1) % items.length : i,
                );
            }
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [lightbox, items.length]);

    if (!items.length) return null;

    const active =
        lightbox != null ? items[Math.min(lightbox, items.length - 1)] : null;

    return (
        <>
            <DetailSection id="menus" title={title}>
                <p className="mb-4 text-sm text-olive-600">
                    Browse menu photos — tap any page for a closer look.
                </p>
                <ul
                    className={`grid gap-3 ${
                        items.length === 1
                            ? 'grid-cols-1 sm:max-w-sm'
                            : items.length === 2
                              ? 'grid-cols-2'
                              : 'grid-cols-2 sm:grid-cols-3'
                    }`}
                >
                    {items.map((item, index) => (
                        <li key={item.id}>
                            {item.image ? (
                                <button
                                    type="button"
                                    onClick={() => setLightbox(index)}
                                    className="group relative block w-full overflow-hidden rounded-xl border border-olive-200/70 bg-olive-50 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard"
                                >
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                        loading="lazy"
                                    />
                                    <span className="absolute inset-0 bg-gradient-to-t from-earth-dusk/70 via-transparent to-transparent opacity-90" />
                                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-semibold text-white">
                                                {item.title}
                                            </span>
                                            <span className="mt-0.5 block text-[11px] font-medium text-white/70">
                                                Page {index + 1} of {items.length}
                                            </span>
                                        </span>
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/95 text-olive-900 shadow-soft transition group-hover:bg-mustard">
                                            <Expand className="h-3.5 w-3.5" />
                                        </span>
                                    </span>
                                </button>
                            ) : (
                                <a
                                    href={item.pdf}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex min-h-28 flex-col justify-between rounded-xl border border-olive-200/70 bg-olive-50 p-4 transition hover:border-mustard dark:border-olive-700 dark:bg-olive-900"
                                >
                                    <span className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                                        {item.title}
                                    </span>
                                    <span className="mt-3 text-xs font-semibold text-olive-700 underline dark:text-olive-300">
                                        Open PDF menu
                                    </span>
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            </DetailSection>

            <AnimatePresence>
                {active ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1200] flex flex-col bg-[#0c0a08]/94 backdrop-blur-md"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menu preview"
                        onClick={() => setLightbox(null)}
                    >
                        <div
                            className="relative z-20 flex items-center justify-between gap-3 px-4 py-4 sm:px-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="min-w-0">
                                <p className="truncate font-display text-sm font-semibold text-white sm:text-base">
                                    {active.title}
                                </p>
                                <p className="text-[11px] font-medium uppercase tracking-wider text-white/55">
                                    {lightbox + 1} of {items.length}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setLightbox(null)}
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-mustard text-olive-950 shadow-lift ring-2 ring-white/90 transition hover:scale-105 hover:bg-white"
                                aria-label="Close menu preview"
                            >
                                <X className="h-5 w-5" strokeWidth={2.75} />
                            </button>
                        </div>

                        <div
                            className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 sm:px-16"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {items.length > 1 ? (
                                <>
                                    <button
                                        type="button"
                                        aria-label="Previous menu page"
                                        onClick={() =>
                                            setLightbox(
                                                (i) =>
                                                    (i - 1 + items.length) %
                                                    items.length,
                                            )
                                        }
                                        className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-olive-900 shadow-lift sm:left-6 sm:h-12 sm:w-12"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Next menu page"
                                        onClick={() =>
                                            setLightbox(
                                                (i) => (i + 1) % items.length,
                                            )
                                        }
                                        className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-olive-900 shadow-lift sm:right-6 sm:h-12 sm:w-12"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </>
                            ) : null}

                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={active.image}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.25 }}
                                    src={active.image}
                                    alt={active.title}
                                    className="max-h-[min(78vh,900px)] w-auto max-w-full rounded-xl object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,0.65)] ring-1 ring-white/10"
                                />
                            </AnimatePresence>
                        </div>

                        {items.length > 1 ? (
                            <div
                                className="relative z-20 border-t border-white/10 bg-black/25 px-4 py-4 backdrop-blur-md sm:px-8"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="mx-auto flex max-w-4xl gap-2 overflow-x-auto pb-1">
                                    {items.map((item, index) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setLightbox(index)}
                                            className={`shrink-0 overflow-hidden rounded-lg transition ${
                                                index === lightbox
                                                    ? 'ring-2 ring-mustard ring-offset-2 ring-offset-[#0c0a08]'
                                                    : 'opacity-65 hover:opacity-100'
                                            }`}
                                        >
                                            <img
                                                src={item.image}
                                                alt=""
                                                className="h-16 w-12 object-cover sm:h-20 sm:w-14"
                                                loading="lazy"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </>
    );
}
