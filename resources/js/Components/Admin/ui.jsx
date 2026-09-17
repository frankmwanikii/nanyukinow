import { Link } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export function StatCard({ label, value, hint, icon: Icon }) {
    return (
        <div className="rounded-lg border border-olive-200/80 bg-white px-5 py-5 dark:border-olive-800 dark:bg-olive-900">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-olive-500 dark:text-olive-400">
                        {label}
                    </p>
                    <p className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight text-olive-950 dark:text-white">
                        {value}
                    </p>
                    {hint && (
                        <p className="mt-1.5 text-sm text-olive-500 dark:text-olive-400">{hint}</p>
                    )}
                </div>
                {Icon && (
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-mustard/15 text-olive-800 dark:bg-mustard/20 dark:text-mustard">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
            </div>
        </div>
    );
}

/** Status: colored dot + label */
export function StatusBadge({ status }) {
    const map = {
        published: { dot: 'bg-mint-deep', text: 'text-olive-800 dark:text-olive-100' },
        draft: { dot: 'bg-olive-400', text: 'text-olive-600 dark:text-olive-300' },
        pending: { dot: 'bg-mustard', text: 'text-olive-800 dark:text-olive-100' },
        expired: { dot: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300' },
        archived: { dot: 'bg-olive-300', text: 'text-olive-500 dark:text-olive-400' },
        free: { dot: 'bg-olive-400', text: 'text-olive-600 dark:text-olive-300' },
        featured: { dot: 'bg-mustard', text: 'text-olive-800 dark:text-olive-100' },
        premium: { dot: 'bg-earth-clay', text: 'text-olive-800 dark:text-olive-100' },
        claimed: { dot: 'bg-mint-deep', text: 'text-olive-800 dark:text-olive-100' },
        unclaimed: { dot: 'bg-olive-300', text: 'text-olive-500 dark:text-olive-400' },
    };

    const tone = map[status] || { dot: 'bg-olive-300', text: 'text-olive-600 dark:text-olive-300' };
    const label = status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : '—';

    return (
        <span className={`inline-flex items-center gap-2 text-sm font-medium ${tone.text}`}>
            <span className={`h-2 w-2 shrink-0 rounded-full ${tone.dot}`} />
            {label}
        </span>
    );
}

export function ExpiryCell({ expiresAt, label, isExpired }) {
    if (!expiresAt) {
        return <span className="text-sm text-olive-400 dark:text-olive-500">—</span>;
    }

    const date = new Date(expiresAt);
    const formatted = date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <div className="leading-snug">
            <p className={`text-sm font-medium ${isExpired ? 'text-rose-600 dark:text-rose-400' : 'text-olive-800 dark:text-olive-100'}`}>
                {formatted}
            </p>
            <p className={`text-sm ${isExpired ? 'text-rose-500 dark:text-rose-400' : 'text-olive-500 dark:text-olive-400'}`}>
                {label}
            </p>
        </div>
    );
}

export function AdminButton({
    children,
    variant = 'primary',
    className = '',
    type = 'button',
    size = 'md',
    ...props
}) {
    const sizes = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-base',
    };
    const variants = {
        primary: 'bg-mustard text-earth-dusk hover:bg-mustard-soft',
        secondary:
            'border border-olive-200 bg-white text-olive-800 hover:bg-olive-50 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100 dark:hover:bg-olive-800',
        danger: 'bg-rose-600 text-white hover:bg-rose-700',
        ghost: 'text-olive-700 hover:bg-olive-100 dark:text-olive-200 dark:hover:bg-olive-800',
    };

    return (
        <button
            type={type}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export function AdminLink({ href, children, className = '', variant = 'primary' }) {
    const variants = {
        primary: 'bg-mustard text-earth-dusk hover:bg-mustard-soft',
        secondary:
            'border border-olive-200 bg-white text-olive-800 hover:bg-olive-50 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100 dark:hover:bg-olive-800',
    };

    return (
        <Link
            href={href}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-base font-medium transition ${variants[variant]} ${className}`}
        >
            {children}
        </Link>
    );
}

const fieldLabel =
    'mb-1.5 block text-sm font-semibold text-olive-600 dark:text-olive-400';
const fieldControl =
    'w-full rounded-md border border-olive-200 bg-white px-3.5 py-2.5 text-base text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-olive-400 focus:ring-1 focus:ring-mustard/40 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50 dark:placeholder:text-olive-500 dark:focus:border-olive-500 dark:focus:ring-mustard/30';

export function AdminInput({ label, error, className = '', ...props }) {
    return (
        <label className={`block ${className}`}>
            {label && <span className={fieldLabel}>{label}</span>}
            <input className={fieldControl} {...props} />
            {error && <span className="mt-1.5 block text-sm text-rose-600 dark:text-rose-400">{error}</span>}
        </label>
    );
}

export function AdminTextarea({ label, error, className = '', ...props }) {
    return (
        <label className={`block ${className}`}>
            {label && <span className={fieldLabel}>{label}</span>}
            <textarea className={fieldControl} {...props} />
            {error && <span className="mt-1.5 block text-sm text-rose-600 dark:text-rose-400">{error}</span>}
        </label>
    );
}

export function AdminSelect({ label, error, children, className = '', ...props }) {
    return (
        <label className={`block ${className}`}>
            {label && <span className={fieldLabel}>{label}</span>}
            <select className={fieldControl} {...props}>
                {children}
            </select>
            {error && <span className="mt-1.5 block text-sm text-rose-600 dark:text-rose-400">{error}</span>}
        </label>
    );
}

export function AdminCheckbox({ label, ...props }) {
    return (
        <label className="inline-flex items-center gap-2.5 text-base text-olive-700 dark:text-olive-200">
            <input
                type="checkbox"
                className="h-4 w-4 rounded border-olive-300 text-mustard focus:ring-mustard/40 dark:border-olive-600 dark:bg-olive-900"
                {...props}
            />
            {label}
        </label>
    );
}

export function EmptyState({ title, description, action }) {
    return (
        <div className="rounded-lg border border-dashed border-olive-300 bg-white px-6 py-14 text-center dark:border-olive-700 dark:bg-olive-900">
            <p className="text-lg font-semibold text-olive-900 dark:text-olive-50">{title}</p>
            {description && (
                <p className="mx-auto mt-2 max-w-md text-base text-olive-500 dark:text-olive-400">
                    {description}
                </p>
            )}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

export function FormPanel({ title, children, className = '' }) {
    return (
        <section
            className={`rounded-lg border border-olive-200/80 bg-white p-6 dark:border-olive-800 dark:bg-olive-900 ${className}`}
        >
            {title && (
                <h2 className="mb-5 text-base font-semibold text-olive-900 dark:text-olive-50">
                    {title}
                </h2>
            )}
            {children}
        </section>
    );
}

/** Card shell for data tables */
export function DataCard({ title, tools, children, footer }) {
    return (
        <div className="overflow-hidden rounded-lg border border-olive-200/80 bg-white dark:border-olive-800 dark:bg-olive-900">
            {(title || tools) && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-olive-200 px-5 py-4 dark:border-olive-800">
                    {title && (
                        <h3 className="text-base font-semibold text-olive-900 dark:text-olive-50">
                            {title}
                        </h3>
                    )}
                    {tools && <div className="flex flex-wrap items-center gap-2">{tools}</div>}
                </div>
            )}
            {children}
            {footer && (
                <div className="border-t border-olive-200 bg-olive-50/80 px-5 py-3.5 dark:border-olive-800 dark:bg-olive-950/50">
                    {footer}
                </div>
            )}
        </div>
    );
}

export function DataTable({ children, compact = true, zebra = true }) {
    return (
        <div className="overflow-x-auto">
            <table
                className={`admin-table w-full text-left ${compact ? 'admin-table--compact' : ''} ${
                    zebra ? 'admin-table--zebra' : ''
                }`}
            >
                {children}
            </table>
        </div>
    );
}

export function Th({ children, sortable, sorted, direction, onSort, className = '', align = 'left' }) {
    const alignClass =
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

    if (sortable) {
        return (
            <th className={`admin-th ${alignClass} ${className}`}>
                <button
                    type="button"
                    onClick={onSort}
                    className="inline-flex items-center gap-1.5 font-semibold text-olive-600 hover:text-olive-900 dark:text-olive-300 dark:hover:text-olive-100"
                >
                    {children}
                    {sorted ? (
                        direction === 'asc' ? (
                            <ArrowUp className="h-4 w-4 text-olive-800 dark:text-olive-100" />
                        ) : (
                            <ArrowDown className="h-4 w-4 text-olive-800 dark:text-olive-100" />
                        )
                    ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-40" />
                    )}
                </button>
            </th>
        );
    }

    return <th className={`admin-th ${alignClass} ${className}`}>{children}</th>;
}

export function Td({ children, className = '', align = 'left', ...props }) {
    const alignClass =
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
    return (
        <td className={`admin-td ${alignClass} ${className}`} {...props}>
            {children}
        </td>
    );
}

export function MediaCell({ image, title, subtitle, href }) {
    const TitleTag = href ? Link : 'span';
    const titleProps = href ? { href } : {};

    return (
        <div className="flex min-w-0 items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded bg-olive-100 ring-1 ring-olive-200/80 dark:bg-olive-800 dark:ring-olive-700">
                {image ? (
                    <img src={image} alt="" className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase text-olive-400">
                        {(title || '?').charAt(0)}
                    </div>
                )}
            </div>
            <div className="min-w-0">
                <TitleTag
                    {...titleProps}
                    className="block truncate text-base font-medium text-olive-900 hover:text-earth-dusk dark:text-olive-50 dark:hover:text-white"
                >
                    {title}
                </TitleTag>
                {subtitle && (
                    <p className="truncate text-sm text-olive-500 dark:text-olive-400">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}

export function ActionGroup({ children }) {
    return (
        <div className="inline-flex overflow-hidden rounded border border-olive-200 bg-white dark:border-olive-700 dark:bg-olive-900">
            {children}
        </div>
    );
}

export function ActionIcon({ href, onClick, title, children, danger, external }) {
    const classes = `inline-flex h-9 w-9 items-center justify-center border-r border-olive-200 last:border-r-0 transition dark:border-olive-700 ${
        danger
            ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            : 'text-olive-500 hover:bg-olive-50 hover:text-olive-900 dark:text-olive-400 dark:hover:bg-olive-800 dark:hover:text-olive-50'
    }`;

    if (href) {
        return (
            <Link
                href={href}
                title={title}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                className={classes}
            >
                {children}
            </Link>
        );
    }

    return (
        <button type="button" title={title} onClick={onClick} className={classes}>
            {children}
        </button>
    );
}

export function FilterBar({ children, onSubmit }) {
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit?.(e);
            }}
            className="mb-5 rounded-lg border border-olive-200/80 bg-white p-4 dark:border-olive-800 dark:bg-olive-900"
        >
            <div className="flex flex-wrap items-end gap-3">{children}</div>
        </form>
    );
}

export function Pagination({ links, meta }) {
    if (!links || links.length <= 3) {
        if (!meta) return null;
    }

    const from = meta?.from;
    const to = meta?.to;
    const total = meta?.total;

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-olive-500 dark:text-olive-400">
                {from != null && to != null && total != null
                    ? `Showing ${from} to ${to} of ${total} entries`
                    : ' '}
            </p>
            <div className="inline-flex overflow-hidden rounded border border-olive-200 bg-white dark:border-olive-700 dark:bg-olive-900">
                {links?.map((link, i) => {
                    const isPrev = i === 0;
                    const isNext = i === links.length - 1;
                    const disabled = !link.url;
                    const label = isPrev ? (
                        <ChevronLeft className="h-4 w-4" />
                    ) : isNext ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                    );

                    if (disabled) {
                        return (
                            <span
                                key={i}
                                className="inline-flex h-10 min-w-10 cursor-not-allowed items-center justify-center border-r border-olive-200 px-3 text-sm text-olive-300 last:border-r-0 dark:border-olive-700 dark:text-olive-600"
                            >
                                {label}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={i}
                            href={link.url}
                            className={`inline-flex h-10 min-w-10 items-center justify-center border-r border-olive-200 px-3 text-sm last:border-r-0 dark:border-olive-700 ${
                                link.active
                                    ? 'bg-olive-900 font-semibold text-white dark:bg-mustard dark:text-earth-dusk'
                                    : 'text-olive-700 hover:bg-olive-50 dark:text-olive-200 dark:hover:bg-olive-800'
                            }`}
                            preserveState
                        >
                            {label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
