export default function ListingSubnav({
    items = [],
    active = null,
    onChange,
}) {
    if (!items.length) return null;

    return (
        <nav
            className="sticky top-[4.25rem] z-[1090] w-full border-b border-olive-200 bg-white shadow-[0_1px_0_rgba(28,23,18,0.06)] sm:top-20"
            style={{ backgroundColor: '#ffffff' }}
            aria-label="Listing pages"
        >
            <div className="overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="mx-auto flex w-max min-w-full max-w-site flex-nowrap justify-start gap-1 px-4 py-3.5 sm:justify-center sm:gap-1.5 sm:px-6 sm:py-4">
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
