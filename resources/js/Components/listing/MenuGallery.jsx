import { Expand } from '@/Components/site/LucideCompat';
import { useMemo, useState } from 'react';
import GalleryLightbox from './GalleryLightbox';
import DetailSection from './DetailSection';

/**
 * Normalize menu / docs payloads into flat { id, title, image } slides.
 * Supports legacy single `image` and newer `images[]` per menu page.
 */
export function normalizeMenus(menus, docs) {
    const source = Array.isArray(menus) && menus.length
        ? menus
        : Array.isArray(docs)
          ? docs
          : [];

    const items = [];

    source.forEach((item, index) => {
        if (!item) return;

        if (typeof item === 'string') {
            items.push({
                id: `menu-${index}`,
                title: `Menu ${index + 1}`,
                image: item,
                pdf: null,
            });
            return;
        }

        const title = item.title || item.label || `Menu ${index + 1}`;
        const pdf = item.pdf || null;
        const images = Array.isArray(item.images)
            ? item.images.filter((u) => typeof u === 'string' && u.trim())
            : item.image || item.src || item.url
              ? [item.image || item.src || item.url]
              : [];

        if (images.length) {
            images.forEach((image, imageIndex) => {
                items.push({
                    id: `${item.id || `menu-${index}`}-${imageIndex}`,
                    title:
                        images.length > 1
                            ? `${title} · ${imageIndex + 1}`
                            : title,
                    image,
                    pdf: null,
                });
            });
            return;
        }

        if (pdf) {
            items.push({
                id: item.id || `menu-${index}`,
                title,
                image: null,
                pdf,
            });
        }
    });

    return items;
}

export default function MenuGallery({
    menus,
    docs,
    title = 'Menus',
}) {
    const items = normalizeMenus(menus, docs);
    const [lightbox, setLightbox] = useState(null);
    const slides = useMemo(
        () =>
            items
                .filter((item) => item.image)
                .map((item) => ({
                    src: item.image,
                    label: item.title,
                    alt: item.title,
                })),
        [items],
    );

    if (!items.length) return null;

    const openSlide = (itemId) => {
        const index = items
            .filter((item) => item.image)
            .findIndex((item) => item.id === itemId);
        if (index >= 0) setLightbox(index);
    };

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
                                    onClick={() => openSlide(item.id)}
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

            {lightbox != null && slides[lightbox] ? (
                <GalleryLightbox
                    items={slides}
                    index={lightbox}
                    onClose={() => setLightbox(null)}
                    onIndexChange={setLightbox}
                    padBlur
                />
            ) : null}
        </>
    );
}
