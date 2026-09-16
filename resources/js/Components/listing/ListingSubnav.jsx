export default function ListingSubnav({
    items = [],
    active = null,
    onChange,
}) {
    if (!items.length) return null;

    return (
        <nav
            className="sticky top-[4.25rem] z-40 w-full border-b border-olive-200 bg-white shadow-[0_1px_0_rgba(28,23,18,0.06)] sm:top-[4.75rem]"
            style={{ backgroundColor: '#ffffff' }}
            aria-label="Listing pages"
        >
            <div className="mx-auto flex max-w-[1400px] justify-center gap-1 overflow-x-auto px-4 py-3.5 sm:gap-1.5 sm:px-6 sm:py-4">
                {items.map((item) => {
                    const isActive = active === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onChange?.(item.id)}
                            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
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
        </nav>
    );
}
