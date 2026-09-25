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
            className={`min-w-0 overflow-hidden rounded-xl border border-olive-200/70 bg-white p-4 sm:p-5 ${className}`}
        >
            {(title || action) && (
                <div className="mb-3 flex items-start justify-between gap-3">
                    {title ? (
                        <h2 className="font-display text-lg font-semibold text-earth-dusk sm:text-xl">
                            {title}
                        </h2>
                    ) : (
                        <span />
                    )}
                    {action}
                </div>
            )}
            {children}
        </section>
    );
}
