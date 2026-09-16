import { useEffect, useState } from 'react';

export default function ListingSubnav({ items = [] }) {
    const [active, setActive] = useState(items[0]?.id ?? null);

    useEffect(() => {
        if (!items.length) return undefined;

        const sections = items
            .map((item) => document.getElementById(item.id))
            .filter(Boolean);

        if (!sections.length) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible[0]?.target?.id) {
                    setActive(visible[0].target.id);
                }
            },
            { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] },
        );

        sections.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [items]);

    if (!items.length) return null;

    return (
        <nav
            className="sticky top-[4.25rem] z-40 w-full border-b border-olive-200 bg-white shadow-[0_1px_0_rgba(28,23,18,0.06)] sm:top-[4.75rem]"
            style={{ backgroundColor: '#ffffff' }}
            aria-label="Listing sections"
        >
            <div className="mx-auto flex max-w-[1400px] justify-center gap-1 overflow-x-auto px-4 py-3.5 sm:gap-1.5 sm:px-6 sm:py-4">
                {items.map((item) => {
                    const isActive = active === item.id;
                    return (
                        <a
                            key={item.id}
                            href={`#${item.id}`}
                            onClick={() => setActive(item.id)}
                            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                                isActive
                                    ? 'bg-olive-700 text-white shadow-soft'
                                    : 'text-olive-700 hover:bg-olive-50'
                            }`}
                        >
                            {item.label}
                        </a>
                    );
                })}
            </div>
        </nav>
    );
}
