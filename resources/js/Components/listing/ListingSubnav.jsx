import { useEffect, useState } from 'react';

const NAV_OFFSET_FALLBACK = 68;

function useSiteNavOffset() {
    const [offset, setOffset] = useState(NAV_OFFSET_FALLBACK);

    useEffect(() => {
        const el = document.querySelector('[data-site-nav]');
        if (!el) {
            return undefined;
        }

        const update = () => {
            const height = Math.ceil(el.getBoundingClientRect().height);
            if (height > 0) {
                setOffset(height);
            }
        };

        update();
        const observer =
            typeof ResizeObserver !== 'undefined'
                ? new ResizeObserver(update)
                : null;
        observer?.observe(el);
        window.addEventListener('resize', update);

        return () => {
            observer?.disconnect();
            window.removeEventListener('resize', update);
        };
    }, []);

    return offset;
}

export default function ListingSubnav({
    items = [],
    active = null,
    onChange,
}) {
    const navOffset = useSiteNavOffset();

    if (!items.length) return null;

    return (
        <nav
            className="sticky z-[1090] w-full border-b border-olive-200 bg-white shadow-[0_1px_0_rgba(28,23,18,0.06)]"
            style={{ backgroundColor: '#ffffff', top: navOffset }}
            aria-label="Listing pages"
        >
            <div className="overflow-x-auto overscroll-x-contain px-4 py-3.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 sm:py-4 [&::-webkit-scrollbar]:hidden">
                <div className="mx-auto flex w-max min-w-full max-w-site flex-nowrap items-center justify-start gap-1 sm:justify-center sm:gap-1.5">
                    {items.map((item) => {
                        const isActive = active === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onChange?.(item.id)}
                                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                                    isActive
                                        ? 'bg-olive-700 text-white shadow-soft'
                                        : 'text-olive-700 hover:bg-olive-50'
                                }`}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
