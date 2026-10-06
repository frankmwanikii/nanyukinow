import { createPortal } from 'react-dom';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle, Info, Link2, Trash2, X } from 'lucide-react';

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
 * Single-action alert (replaces window.alert).
 */
export function AlertDialog({
    open = false,
    title = 'Notice',
    message = '',
    confirmLabel = 'OK',
    tone = 'info',
    onConfirm,
}) {
    const titleId = useId();
    const confirmRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const t = requestAnimationFrame(() => confirmRef.current?.focus());
        const onKey = (e) => {
            if (e.key === 'Escape' || e.key === 'Enter') onConfirm?.();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            cancelAnimationFrame(t);
            window.removeEventListener('keydown', onKey);
        };
    }, [open, onConfirm]);

    if (!open || typeof document === 'undefined') return null;

    const isDanger = tone === 'danger';
    const Icon = isDanger ? AlertTriangle : Info;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
            <button
                type="button"
                aria-label="Dismiss"
                className="absolute inset-0 bg-olive-950/55 backdrop-blur-[2px] transition"
                onClick={onConfirm}
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
                                : 'bg-olive-100 text-olive-700 dark:bg-olive-800 dark:text-olive-200'
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
                                onClick={onConfirm}
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

                <div className="flex justify-end border-t border-olive-100 bg-olive-50/70 px-5 py-4 dark:border-olive-800 dark:bg-olive-950/40">
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
 * Prompt dialog with text input (replaces window.prompt).
 */
export function PromptDialog({
    open = false,
    title = 'Enter a value',
    message = '',
    label: inputLabel = 'Value',
    defaultValue = '',
    placeholder = '',
    confirmLabel = 'Save',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
}) {
    const titleId = useId();
    const inputId = useId();
    const inputRef = useRef(null);
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        if (!open) return undefined;
        setValue(defaultValue);
        const t = requestAnimationFrame(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        });
        const onKey = (e) => {
            if (e.key === 'Escape') onCancel?.();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            cancelAnimationFrame(t);
            window.removeEventListener('keydown', onKey);
        };
    }, [open, defaultValue, onCancel]);

    if (!open || typeof document === 'undefined') return null;

    const submit = (e) => {
        e?.preventDefault?.();
        onConfirm?.(value);
    };

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
            <button
                type="button"
                aria-label="Dismiss"
                className="absolute inset-0 bg-olive-950/55 backdrop-blur-[2px] transition"
                onClick={onCancel}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="relative w-full max-w-md overflow-hidden rounded-2xl border border-olive-200/80 bg-white shadow-2xl dark:border-olive-700 dark:bg-olive-900"
            >
                <form onSubmit={submit}>
                    <div className="flex items-start gap-4 p-5 sm:p-6">
                        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-olive-100 text-olive-700 dark:bg-olive-800 dark:text-olive-200">
                            <Link2 className="h-5 w-5" strokeWidth={2.25} />
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
                            <div className="mt-4">
                                <label
                                    htmlFor={inputId}
                                    className="mb-1.5 block text-sm font-semibold text-olive-600 dark:text-olive-400"
                                >
                                    {inputLabel}
                                </label>
                                <input
                                    ref={inputRef}
                                    id={inputId}
                                    type="url"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full rounded-xl border border-olive-200 bg-white px-3.5 py-2.5 text-base text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-mustard focus:ring-2 focus:ring-mustard/30 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50 dark:placeholder:text-olive-500"
                                />
                            </div>
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
                            type="submit"
                            className="inline-flex items-center justify-center rounded-xl bg-olive-900 px-4 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-olive-800 active:scale-[0.99]"
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </form>
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

/**
 * Promise-based alert — drop-in for window.alert().
 *
 * const { alert, dialog } = useAlert();
 * await alert({ title: 'Error', message: '…' });
 */
export function useAlert() {
    const [state, setState] = useState({
        open: false,
        title: 'Notice',
        message: '',
        confirmLabel: 'OK',
        tone: 'info',
    });
    const resolver = useRef(null);

    const close = useCallback(() => {
        setState((s) => ({ ...s, open: false }));
        resolver.current?.();
        resolver.current = null;
    }, []);

    const alert = useCallback((options = {}) => {
        return new Promise((resolve) => {
            resolver.current = resolve;
            const message =
                typeof options === 'string'
                    ? options
                    : options.message || '';
            setState({
                open: true,
                title:
                    typeof options === 'string'
                        ? 'Notice'
                        : options.title || 'Notice',
                message,
                confirmLabel:
                    typeof options === 'string'
                        ? 'OK'
                        : options.confirmLabel || 'OK',
                tone:
                    typeof options === 'string'
                        ? 'info'
                        : options.tone || 'info',
            });
        });
    }, []);

    const dialog = (
        <AlertDialog
            open={state.open}
            title={state.title}
            message={state.message}
            confirmLabel={state.confirmLabel}
            tone={state.tone}
            onConfirm={close}
        />
    );

    return { alert, dialog };
}

/**
 * Promise-based prompt — drop-in for window.prompt().
 * Resolves to the entered string, or null if cancelled.
 *
 * const { prompt, dialog } = usePrompt();
 * const url = await prompt({ title: 'Link URL', defaultValue: 'https://' });
 */
export function usePrompt() {
    const [state, setState] = useState({
        open: false,
        title: 'Enter a value',
        message: '',
        label: 'Value',
        defaultValue: '',
        placeholder: '',
        confirmLabel: 'Save',
        cancelLabel: 'Cancel',
    });
    const resolver = useRef(null);

    const close = useCallback((result) => {
        setState((s) => ({ ...s, open: false }));
        resolver.current?.(result);
        resolver.current = null;
    }, []);

    const prompt = useCallback((options = {}) => {
        return new Promise((resolve) => {
            resolver.current = resolve;
            setState({
                open: true,
                title: options.title || 'Enter a value',
                message: options.message || '',
                label: options.label || 'Value',
                defaultValue: options.defaultValue ?? '',
                placeholder: options.placeholder || '',
                confirmLabel: options.confirmLabel || 'Save',
                cancelLabel: options.cancelLabel || 'Cancel',
            });
        });
    }, []);

    const dialog = (
        <PromptDialog
            open={state.open}
            title={state.title}
            message={state.message}
            label={state.label}
            defaultValue={state.defaultValue}
            placeholder={state.placeholder}
            confirmLabel={state.confirmLabel}
            cancelLabel={state.cancelLabel}
            onConfirm={(value) => close(value)}
            onCancel={() => close(null)}
        />
    );

    return { prompt, dialog };
}
