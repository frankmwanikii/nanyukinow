export default function DetailSection({
    id,
    title,
    action = null,
    children,
    className = '',
    empty = false,
}) {
    if (empty || children == null || children === false) {
        return null;
    }

    return (
        <section
            id={id || undefined}
            className={`min-w-0 border border-olive-900/15 bg-white ${className}`}
        >
            {(title || action) && (
                <div className="flex items-start justify-between gap-3 border-b border-olive-900/10 px-4 py-3 sm:px-5 sm:py-3.5">
                    {title ? (
                        <h2 className="font-display text-base font-semibold tracking-tight text-earth-dusk sm:text-lg">
                            {title}
                        </h2>
                    ) : (
                        <span />
                    )}
                    {action}
                </div>
            )}
            <div className="px-4 py-4 sm:px-5 sm:py-5">{children}</div>
        </section>
    );
}
