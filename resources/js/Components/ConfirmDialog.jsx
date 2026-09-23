import { createPortal } from 'react-dom';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

/**
 * Modern confirm / dialog popup.
 * Use with useConfirm() for a drop-in replacement of window.confirm().
 */
export default function ConfirmDialog({
    open = false,
    title = 'Are you sure?',
    message = '',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    tone = 'danger',
    onConfirm,
    onCancel,
}) {
    const titleId = useId();
    const confirmRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const t = requestAnimationFrame(() => confirmRef.current?.focus());
        const onKey = (e) => {
            if (e.key === 'Escape') onCancel?.();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            cancelAnimationFrame(t);
            window.removeEventListener('keydown', onKey);
        };
    }, [open, onCancel]);

    if (!open || typeof document === 'undefined') return null;

    const isDanger = tone === 'danger';
    const Icon = isDanger ? Trash2 : AlertTriangle;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
            <button
                type="button"
                aria-label="Dismiss"
                className="absolute inset-0 bg-olive-950/55 backdrop-blur-[2px] transition"
                onClick={onCancel}
            />

            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="relative w-full max-w-md overflow-hidden rounded-2xl border border-olive-200/80 bg-white shadow-2xl dark:border-olive-700 dark:bg-olive-900"
            >
                <div className="flex items-start gap-4 p-5 sm:p-6">
                    <span
                        className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            isDanger
                                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200'
                        }`}
                    >
                        <Icon className="h-5 w-5" strokeWidth={2.25} />
                    </span>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                            <h2
                                id={titleId}
                                className="font-display text-lg font-semibold tracking-tight text-olive-950 dark:text-white"
                            >
                                {title}
                            </h2>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="rounded-lg p-1 text-olive-400 transition hover:bg-olive-100 hover:text-olive-800 dark:hover:bg-olive-800 dark:hover:text-olive-100"
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        {message ? (
                            <p className="mt-1.5 text-sm leading-relaxed text-olive-600 dark:text-olive-300">
                                {message}
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-olive-100 bg-olive-50/70 px-5 py-4 sm:flex-row sm:justify-end dark:border-olive-800 dark:bg-olive-950/40">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex items-center justify-center rounded-xl border border-olive-200 bg-white px-4 py-2.5 text-sm font-semibold text-olive-800 transition hover:bg-olive-50 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100 dark:hover:bg-olive-800"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        ref={confirmRef}
                        type="button"
                        onClick={onConfirm}
                        className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-soft transition active:scale-[0.99] ${
                            isDanger
                                ? 'bg-rose-600 hover:bg-rose-700'
                                : 'bg-olive-900 hover:bg-olive-800'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

/**
 * Promise-based confirm — drop-in for window.confirm().
 *
 * const { confirm, dialog } = useConfirm();
 * // ...
 * {dialog}
 * // ...
 * if (!(await confirm({ title: 'Delete?', message: '…' }))) return;
 */
export function useConfirm() {
    const [state, setState] = useState({
        open: false,
        title: 'Are you sure?',
        message: '',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        tone: 'danger',
    });
    const resolver = useRef(null);

    const close = useCallback((result) => {
        setState((s) => ({ ...s, open: false }));
        resolver.current?.(result);
        resolver.current = null;
    }, []);

    const confirm = useCallback((options = {}) => {
        return new Promise((resolve) => {
            resolver.current = resolve;
            setState({
                open: true,
                title: options.title || 'Are you sure?',
                message: options.message || '',
                confirmLabel: options.confirmLabel || 'Confirm',
                cancelLabel: options.cancelLabel || 'Cancel',
                tone: options.tone || 'danger',
            });
        });
    }, []);

    const dialog = (
        <ConfirmDialog
            open={state.open}
            title={state.title}
            message={state.message}
            confirmLabel={state.confirmLabel}
            cancelLabel={state.cancelLabel}
            tone={state.tone}
            onConfirm={() => close(true)}
            onCancel={() => close(false)}
        />
    );

    return { confirm, dialog };
}
