import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Eye,
    EyeOff,
    Info,
    MoreVertical,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, router } from '@inertiajs/react';

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

/**
 * cPanel-style summary card: icon + title, large value, hint, bottom action link.
 */
export function SummaryCard({
    title,
    value = '—',
    hint,
    icon: Icon,
    iconTone = 'mustard',
    actionLabel,
    actionHref,
    onAction,
    className = '',
}) {
    const tones = {
        mustard: 'bg-mustard/20 text-olive-900 dark:bg-mustard/15 dark:text-mustard',
        mint: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
        amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
        slate: 'bg-olive-100 text-olive-700 dark:bg-olive-800 dark:text-olive-200',
        rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    };

    const actionClass =
        'text-sm font-semibold text-earth-clay transition hover:text-earth-dusk dark:text-mustard dark:hover:text-mustard/80';

    return (
        <div
            className={`flex min-h-[9.5rem] flex-col rounded-xl border border-olive-200/70 bg-white p-4 shadow-soft dark:border-olive-800 dark:bg-olive-900 ${className}`}
        >
            <div className="flex items-center gap-2.5">
                {Icon ? (
                    <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[iconTone] || tones.mustard}`}
                    >
                        <Icon className="h-4 w-4" strokeWidth={2.25} />
                    </span>
                ) : null}
                <p className="text-sm font-semibold text-olive-700 dark:text-olive-200">
                    {title}
                </p>
            </div>

            <p className="mt-3 text-2xl font-bold tabular-nums tracking-tight text-olive-950 dark:text-white">
                {value}
            </p>

            {hint ? (
                <p className="mt-1 text-xs text-olive-500 dark:text-olive-400">{hint}</p>
            ) : (
                <div className="mt-1 h-4" aria-hidden />
            )}

            <div className="mt-auto flex justify-end pt-3">
                {actionHref ? (
                    <Link href={actionHref} className={actionClass}>
                        {actionLabel || 'Manage'}
                    </Link>
                ) : onAction ? (
                    <button type="button" onClick={onAction} className={actionClass}>
                        {actionLabel || 'Manage'}
                    </button>
                ) : actionLabel ? (
                    <span className="text-sm font-semibold text-olive-300 dark:text-olive-600">
                        {actionLabel}
                    </span>
                ) : null}
            </div>
        </div>
    );
}

/** Soft pill badges — status, tier, and similar labels */
export function StatusBadge({ status, className = '' }) {
    const map = {
        published: {
            shell: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200',
            label: 'Published',
        },
        draft: {
            shell: 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300',
            label: 'Draft',
        },
        pending: {
            shell: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
            label: 'Pending',
        },
        expired: {
            shell: 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200',
            label: 'Expired',
        },
        archived: {
            shell: 'bg-olive-100 text-olive-500 dark:bg-olive-800/50 dark:text-olive-400',
            label: 'Archived',
        },
        active: {
            shell: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200',
            label: 'Active',
        },
        inactive: {
            shell: 'bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400',
            label: 'Inactive',
        },
        free: {
            shell: 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300',
            label: 'Free',
        },
        featured: {
            shell: 'bg-mustard/30 text-olive-900 dark:bg-mustard/20 dark:text-mustard',
            label: 'Standard',
        },
        premium: {
            shell: 'bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200',
            label: 'Premium',
        },
        claimed: {
            shell: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200',
            label: 'Claimed',
        },
        unclaimed: {
            shell: 'bg-olive-100 text-olive-500 dark:bg-olive-800/50 dark:text-olive-400',
            label: 'Unclaimed',
        },
        approved: {
            shell: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200',
            label: 'Approved',
        },
        rejected: {
            shell: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
            label: 'Rejected',
        },
        cancelled: {
            shell: 'bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400',
            label: 'Cancelled',
        },
    };

    const tone = map[status] || {
        shell: 'bg-olive-100 text-olive-600 dark:bg-olive-800/50 dark:text-olive-300',
        label: status
            ? status.charAt(0).toUpperCase() + status.slice(1)
            : '—',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${tone.shell} ${className}`}
        >
            {tone.label}
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
        sm: 'px-3.5 py-2 text-sm',
        md: 'px-4 py-2.5 text-base',
    };
    const variants = {
        primary:
            'bg-mustard text-earth-dusk shadow-soft transition duration-200 hover:bg-mint-deep hover:text-white hover:shadow-lift active:scale-[0.99]',
        secondary:
            'border border-olive-200 bg-white text-olive-800 transition duration-200 hover:border-mustard/50 hover:bg-mustard/10 hover:text-earth-dusk dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100 dark:hover:border-mustard/40 dark:hover:bg-mustard/10',
        danger:
            'bg-rose-600 text-white transition duration-200 hover:bg-rose-700 hover:shadow-soft active:scale-[0.99]',
        ghost:
            'text-olive-700 transition duration-200 hover:bg-olive-100 hover:text-olive-950 dark:text-olive-200 dark:hover:bg-olive-800',
    };

    return (
        <button
            type={type}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export function AdminLink({ href, children, className = '', variant = 'primary' }) {
    const variants = {
        primary:
            'bg-mustard text-earth-dusk shadow-soft transition duration-200 hover:bg-mint-deep hover:text-white hover:shadow-lift',
        secondary:
            'border border-olive-200 bg-white text-olive-800 transition duration-200 hover:border-mustard/50 hover:bg-mustard/10 hover:text-earth-dusk dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100 dark:hover:bg-mustard/10',
    };

    return (
        <Link
            href={href}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-base font-semibold ${variants[variant]} ${className}`}
        >
            {children}
        </Link>
    );
}

const fieldLabel =
    'mb-1.5 block text-sm font-semibold text-olive-600 dark:text-olive-400';
const fieldControl =
    'w-full rounded-xl border border-olive-200 bg-white px-3.5 py-3 text-base text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-mustard focus:ring-2 focus:ring-mustard/30 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50 dark:placeholder:text-olive-500 dark:focus:border-mustard';

export function AdminInput({ label, error, className = '', ...props }) {
    return (
        <label className={`block ${className}`}>
            {label && <span className={fieldLabel}>{label}</span>}
            <input className={fieldControl} {...props} />
            {error && <span className="mt-1.5 block text-sm text-rose-600 dark:text-rose-400">{error}</span>}
        </label>
    );
}

export function AdminPasswordInput({ label, error, className = '', ...props }) {
    const [visible, setVisible] = useState(false);

    return (
        <label className={`block ${className}`}>
            {label && <span className={fieldLabel}>{label}</span>}
            <div className="relative">
                <input
                    {...props}
                    type={visible ? 'text' : 'password'}
                    className={`${fieldControl} pr-12`}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-olive-500 transition hover:bg-olive-100 hover:text-olive-900 dark:hover:bg-olive-800 dark:hover:text-olive-100"
                >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
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

/**
 * Split insight / notification toast.
 * tone: "decreasing" (attention/decline), "success", "info"
 */
export function AdminNotice({
    children,
    tone = 'decreasing',
    onDismiss,
    className = '',
    href,
}) {
    const tones = {
        decreasing: {
            shell: 'shadow-[0_8px_24px_rgba(185,74,72,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]',
            accent: 'bg-rose-100 dark:bg-rose-950/60',
            iconWrap: 'bg-rose-600 text-white dark:bg-rose-500',
            Icon: AlertCircle,
        },
        success: {
            shell: 'shadow-[0_8px_24px_rgba(107,119,88,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]',
            accent: 'bg-mint/35 dark:bg-mint/15',
            iconWrap: 'bg-olive-800 text-white dark:bg-mint dark:text-olive-950',
            Icon: CheckCircle2,
        },
        info: {
            shell: 'shadow-[0_8px_24px_rgba(242,184,46,0.18)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]',
            accent: 'bg-mustard/25 dark:bg-mustard/15',
            iconWrap: 'bg-mustard text-earth-dusk',
            Icon: Info,
        },
    };

    const t = tones[tone] || tones.decreasing;
    const Icon = t.Icon;

    const inner = (
        <div
            className={`flex min-h-[3.75rem] overflow-hidden rounded-2xl bg-white dark:bg-olive-900 ${t.shell} ${className}`}
        >
            <div className={`flex w-[4.5rem] shrink-0 items-center justify-center sm:w-20 ${t.accent}`}>
                <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${t.iconWrap}`}
                >
                    <Icon className="h-4 w-4" strokeWidth={2.5} />
                </span>
            </div>
            <div className="flex min-w-0 flex-1 items-center px-4 py-3 pr-11 text-sm leading-snug text-olive-800 dark:text-olive-100 sm:px-5">
                {children}
            </div>
        </div>
    );

    return (
        <div className="relative">
            {href ? (
                <Link href={href} className="block transition hover:opacity-95">
                    {inner}
                </Link>
            ) : (
                inner
            )}
            {onDismiss && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDismiss();
                    }}
                    aria-label="Dismiss"
                    className="absolute -right-1 -top-1 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-olive-500 shadow-soft ring-1 ring-olive-200/80 transition hover:text-olive-900 dark:bg-olive-800 dark:text-olive-300 dark:ring-olive-700 dark:hover:text-olive-50"
                >
                    <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
            )}
        </div>
    );
}

const TOAST_DURATION_MS = 5000;

/**
 * Fixed top-right flash toast with a progress bar that shrinks right → left.
 */
export function AdminFlashToast({
    message,
    tone = 'success',
    duration = TOAST_DURATION_MS,
    onDismiss,
}) {
    const [phase, setPhase] = useState('enter'); // enter | shown | exit
    const dismissRef = useRef(onDismiss);
    dismissRef.current = onDismiss;

    useEffect(() => {
        if (!message) return undefined;

        setPhase('enter');
        const enter = requestAnimationFrame(() => setPhase('shown'));
        const hide = setTimeout(() => setPhase('exit'), duration);
        const done = setTimeout(() => dismissRef.current?.(), duration + 280);

        return () => {
            cancelAnimationFrame(enter);
            clearTimeout(hide);
            clearTimeout(done);
        };
    }, [message, duration]);

    if (!message) return null;

    const isError = tone === 'error' || tone === 'decreasing';
    const Icon = isError ? AlertCircle : CheckCircle2;
    const barClass = isError ? 'bg-rose-500' : 'bg-olive-700 dark:bg-mint';
    const iconWrap = isError
        ? 'bg-rose-600 text-white'
        : 'bg-olive-800 text-white dark:bg-mint dark:text-olive-950';
    const title = isError ? 'Something went wrong' : 'Success';

    const translate =
        phase === 'enter' || phase === 'exit'
            ? 'translate-x-[calc(100%+1.5rem)] opacity-0'
            : 'translate-x-0 opacity-100';

    const node = (
        <div
            role="status"
            aria-live="polite"
            className={`pointer-events-auto fixed right-4 top-20 z-[80] w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-olive-200/80 transition-all duration-300 ease-out dark:bg-olive-900 dark:ring-olive-700 sm:right-6 ${translate}`}
        >
            <div className="flex items-start gap-3 px-4 pb-3.5 pt-4 pr-11">
                <span
                    className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconWrap}`}
                >
                    <Icon className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                        {title}
                    </p>
                    <p className="mt-0.5 text-sm leading-snug text-olive-600 dark:text-olive-300">
                        {message}
                    </p>
                </div>
            </div>
            <button
                type="button"
                onClick={() => {
                    setPhase('exit');
                    setTimeout(() => dismissRef.current?.(), 280);
                }}
                aria-label="Dismiss"
                className="absolute right-2.5 top-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-olive-400 transition hover:bg-olive-100 hover:text-olive-800 dark:hover:bg-olive-800 dark:hover:text-olive-100"
            >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
            <div className="h-1 w-full bg-olive-100 dark:bg-olive-800">
                <div
                    key={message}
                    className={`admin-toast-progress h-full origin-left ${barClass}`}
                    style={{ animationDuration: `${duration}ms` }}
                />
            </div>
        </div>
    );

    if (typeof document === 'undefined') return node;
    return createPortal(node, document.body);
}

/** Page title block for the main content area (not the top bar). */
export function PageHeader({ title, description, actions, className = '' }) {
    return (
        <div
            className={`mb-6 flex flex-wrap items-start justify-between gap-3 ${className}`}
        >
            <div className="min-w-0 flex-1">
                <h1 className="font-display text-2xl font-bold tracking-tight text-olive-950 dark:text-white">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-olive-500 dark:text-olive-400">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
            )}
        </div>
    );
}

export function FormPanel({ title, description, children, className = '' }) {
    return (
        <section
            className={`rounded-2xl border border-olive-200/80 bg-white p-6 shadow-soft dark:border-olive-800 dark:bg-olive-900 sm:p-7 ${className}`}
        >
            {(title || description) && (
                <header className="mb-6">
                    {title && (
                        <h2 className="text-lg font-semibold tracking-tight text-olive-950 dark:text-olive-50">
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p className="mt-1.5 text-sm text-olive-500 dark:text-olive-400">
                            {description}
                        </p>
                    )}
                </header>
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
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-olive-100 ring-1 ring-olive-200/80 dark:bg-olive-800 dark:ring-olive-700">
                {image ? (
                    <img src={image} alt="" className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold uppercase text-olive-400">
                        {(title || '?').charAt(0)}
                    </div>
                )}
            </div>
            <div className="min-w-0">
                <TitleTag
                    {...titleProps}
                    className="block truncate text-sm font-medium leading-5 tracking-normal text-olive-900 hover:text-earth-dusk dark:text-olive-50 dark:hover:text-white"
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

/** Icon overflow menu for table row actions. */
export function ActionMenu({ label = 'Actions', items = [] }) {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef(null);
    const menuRef = useRef(null);
    const [coords, setCoords] = useState({ top: 0, right: 0 });

    const updatePosition = () => {
        const el = triggerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setCoords({
            top: rect.bottom + 4,
            right: Math.max(8, window.innerWidth - rect.right),
        });
    };

    useEffect(() => {
        if (!open) return undefined;

        updatePosition();

        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        const onReposition = () => updatePosition();

        window.addEventListener('keydown', onKey);
        window.addEventListener('resize', onReposition);
        window.addEventListener('scroll', onReposition, true);

        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('resize', onReposition);
            window.removeEventListener('scroll', onReposition, true);
        };
    }, [open]);

    const itemClass = (danger) =>
        `block w-full px-3 py-2 text-left text-sm transition ${
            danger
                ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40'
                : 'text-olive-800 hover:bg-olive-50 dark:text-olive-100 dark:hover:bg-olive-800'
        }`;

    return (
        <div className="relative inline-flex justify-end">
            <button
                ref={triggerRef}
                type="button"
                aria-label={label}
                aria-haspopup="menu"
                aria-expanded={open}
                title={label}
                onClick={() => setOpen((v) => !v)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-olive-200 bg-white text-olive-600 transition hover:bg-olive-50 hover:text-olive-950 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-300 dark:hover:bg-olive-800 dark:hover:text-olive-50 ${
                    open ? 'bg-olive-50 text-olive-950 dark:bg-olive-800 dark:text-olive-50' : ''
                }`}
            >
                <MoreVertical className="h-4 w-4" strokeWidth={2.25} />
            </button>

            {open &&
                createPortal(
                    <>
                        <button
                            type="button"
                            aria-label="Close menu"
                            className="fixed inset-0 z-40 cursor-default"
                            onClick={() => setOpen(false)}
                        />
                        <div
                            ref={menuRef}
                            role="menu"
                            style={{ top: coords.top, right: coords.right }}
                            className="fixed z-50 min-w-[8.5rem] overflow-hidden rounded-lg border border-olive-200 bg-white py-1 shadow-lift dark:border-olive-700 dark:bg-olive-900"
                        >
                            {items.map((item) => {
                                const close = () => setOpen(false);
                                if (item.href) {
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            role="menuitem"
                                            target={item.external ? '_blank' : undefined}
                                            rel={item.external ? 'noreferrer' : undefined}
                                            className={itemClass(item.danger)}
                                            onClick={close}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                }

                                return (
                                    <button
                                        key={item.label}
                                        type="button"
                                        role="menuitem"
                                        className={itemClass(item.danger)}
                                        onClick={() => {
                                            close();
                                            item.onClick?.();
                                        }}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </>,
                    document.body,
                )}
        </div>
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

export function Pagination({
    links,
    meta,
    perPage,
    perPageOptions = [10, 15, 25, 50],
    onPerPageChange,
}) {
    const current = meta?.current_page ?? 1;
    const last = meta?.last_page ?? 1;
    const from = meta?.from;
    const to = meta?.to;
    const total = meta?.total;
    const [goto, setGoto] = useState(String(current).padStart(2, '0'));

    useEffect(() => {
        setGoto(String(current).padStart(2, '0'));
    }, [current]);

    if ((!links || links.length <= 3) && !meta) {
        return null;
    }

    if (last <= 1 && !onPerPageChange && (total == null || total === 0)) {
        return null;
    }

    const pageUrl = (page) => {
        if (!links?.length) return null;
        // Prefer numbered link; fall back to rewriting prev/next query.
        const numbered = links.find(
            (l) => String(l.label) === String(page) || l.label === String(page),
        );
        if (numbered?.url) return numbered.url;

        const any = links.find((l) => l.url);
        if (!any?.url) return null;
        try {
            const url = new URL(any.url, window.location.origin);
            url.searchParams.set('page', String(page));
            return `${url.pathname}${url.search}`;
        } catch {
            return null;
        }
    };

    const goToPage = (page) => {
        const n = Math.min(Math.max(1, Number(page) || 1), last);
        const href = pageUrl(n);
        if (href) {
            router.get(href, {}, { preserveState: true, preserveScroll: true });
        }
    };

    const firstUrl = pageUrl(1);
    const lastUrl = pageUrl(last);
    const prev = links?.[0];
    const next = links?.[links.length - 1];
    const pageLinks = (links || []).slice(1, -1);

    const btnBase =
        'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border text-sm font-semibold transition';
    const btnIdle =
        'border-olive-200 bg-white text-olive-700 hover:bg-olive-50 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-200 dark:hover:bg-olive-800';
    const btnActive =
        'border-olive-900 bg-olive-900 text-white dark:border-mustard dark:bg-mustard dark:text-earth-dusk';
    const btnDisabled =
        'cursor-not-allowed border-olive-100 bg-olive-50 text-olive-300 dark:border-olive-800 dark:bg-olive-950 dark:text-olive-600';

    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
                {firstUrl ? (
                    <Link
                        href={firstUrl}
                        preserveState
                        preserveScroll
                        className={`${btnBase} ${current <= 1 ? btnDisabled : btnIdle}`}
                        aria-label="First page"
                        tabIndex={current <= 1 ? -1 : undefined}
                        onClick={(e) => {
                            if (current <= 1) e.preventDefault();
                        }}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Link>
                ) : (
                    <span className={`${btnBase} ${btnDisabled}`}>
                        <ChevronsLeft className="h-4 w-4" />
                    </span>
                )}

                {prev?.url ? (
                    <Link
                        href={prev.url}
                        preserveState
                        preserveScroll
                        className={`${btnBase} ${btnIdle}`}
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                ) : (
                    <span className={`${btnBase} ${btnDisabled}`}>
                        <ChevronLeft className="h-4 w-4" />
                    </span>
                )}

                {pageLinks.map((link, i) => {
                    const disabled = !link.url;
                    const isEllipsis = link.label === '...' || link.label === '…';
                    if (disabled || isEllipsis) {
                        return (
                            <span
                                key={`p-${i}`}
                                className={`${btnBase} ${btnDisabled} px-2`}
                            >
                                {isEllipsis ? '…' : (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                )}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={`p-${i}`}
                            href={link.url}
                            preserveState
                            preserveScroll
                            className={`${btnBase} px-2.5 ${
                                link.active ? btnActive : btnIdle
                            }`}
                            aria-current={link.active ? 'page' : undefined}
                        >
                            <span
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        </Link>
                    );
                })}

                {next?.url ? (
                    <Link
                        href={next.url}
                        preserveState
                        preserveScroll
                        className={`${btnBase} ${btnIdle}`}
                        aria-label="Next page"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                ) : (
                    <span className={`${btnBase} ${btnDisabled}`}>
                        <ChevronRight className="h-4 w-4" />
                    </span>
                )}

                {lastUrl ? (
                    <Link
                        href={lastUrl}
                        preserveState
                        preserveScroll
                        className={`${btnBase} ${current >= last ? btnDisabled : btnIdle}`}
                        aria-label="Last page"
                        tabIndex={current >= last ? -1 : undefined}
                        onClick={(e) => {
                            if (current >= last) e.preventDefault();
                        }}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Link>
                ) : (
                    <span className={`${btnBase} ${btnDisabled}`}>
                        <ChevronsRight className="h-4 w-4" />
                    </span>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-olive-600 dark:text-olive-300">
                {from != null && to != null && total != null ? (
                    <span className="hidden text-xs font-medium text-olive-500 sm:inline dark:text-olive-400">
                        {from}–{to} of {total}
                    </span>
                ) : null}

                <label className="inline-flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                        Go to
                    </span>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={goto}
                        onChange={(e) =>
                            setGoto(e.target.value.replace(/[^\d]/g, ''))
                        }
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                goToPage(goto);
                            }
                        }}
                        onBlur={() => goToPage(goto)}
                        className="h-9 w-14 rounded-lg border border-olive-200 bg-white px-2 text-center text-sm font-semibold tabular-nums text-olive-900 outline-none focus:border-mustard focus:ring-2 focus:ring-mustard/30 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50"
                        aria-label="Go to page"
                    />
                    <span className="text-xs font-medium text-olive-500">
                        of {String(last).padStart(2, '0')}
                    </span>
                </label>

                {onPerPageChange ? (
                    <>
                        <span
                            className="hidden h-5 w-px bg-olive-200 sm:block dark:bg-olive-700"
                            aria-hidden="true"
                        />
                        <label className="inline-flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                Show entries
                            </span>
                            <select
                                value={perPage || meta?.per_page || 15}
                                onChange={(e) =>
                                    onPerPageChange(Number(e.target.value))
                                }
                                className="h-9 min-w-[4.25rem] rounded-lg border border-olive-200 bg-white py-0 pl-3 pr-8 text-sm font-semibold tabular-nums text-olive-900 outline-none focus:border-mustard focus:ring-2 focus:ring-mustard/30 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50"
                            >
                                {perPageOptions.map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </>
                ) : null}
            </div>
        </div>
    );
}
