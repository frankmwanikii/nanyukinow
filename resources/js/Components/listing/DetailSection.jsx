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
            className={`rounded-2xl bg-white p-5 shadow-soft sm:p-6 ${className}`}
        >
            {(title || action) && (
                <div className="mb-4 flex items-start justify-between gap-3">
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
