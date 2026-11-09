import { CloseMark } from '@/Components/site/Mark';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const EVENT = 'nn:success-toast';
const DEFAULT_MS = 4500;

/**
 * Fire a success confirmation toast (title + body, olive check, progress bar).
 * @param {string} message
 * @param {{ duration?: number, title?: string, tone?: 'success' | 'error' }} [options]
 */
export function showSuccessToast(message, options = {}) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
        new CustomEvent(EVENT, {
            detail: {
                message: String(message || 'Done'),
                title: options.title,
                tone: options.tone === 'error' ? 'error' : 'success',
                duration: options.duration ?? DEFAULT_MS,
            },
        }),
    );
}

function SuccessBadge({ tone = 'success' }) {
    const isError = tone === 'error';

    return (
        <span
            className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                isError
                    ? 'bg-rose-700 text-white'
                    : 'bg-olive-800 text-white dark:bg-olive-700'
            }`}
            aria-hidden="true"
        >
            {isError ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                    <circle
                        cx="12"
                        cy="12"
                        r="7.25"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                    <path
                        d="M12 8.25v4.5M12 15.75h.01"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                    <circle
                        cx="12"
                        cy="12"
                        r="7.25"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                    <path
                        d="M8.75 12.25 11 14.5l4.5-4.75"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </span>
    );
}

/**
 * Presentational toast card matching the account success confirmation design.
 */
export function FlashToast({
    message,
    title,
    tone = 'success',
    duration = DEFAULT_MS,
    onDismiss,
}) {
    const [phase, setPhase] = useState('enter');
    const dismissRef = useRef(onDismiss);
    dismissRef.current = onDismiss;

    useEffect(() => {
        if (!message) return undefined;

        setPhase('enter');
        const enter = requestAnimationFrame(() => setPhase('shown'));
        const hide = window.setTimeout(() => setPhase('exit'), duration);
        const done = window.setTimeout(() => dismissRef.current?.(), duration + 280);

        return () => {
            cancelAnimationFrame(enter);
            window.clearTimeout(hide);
            window.clearTimeout(done);
        };
    }, [message, duration]);

    if (!message) return null;

    const isError = tone === 'error';
    const heading = title || (isError ? 'Something went wrong' : 'Success');
    const translate =
        phase === 'enter' || phase === 'exit'
            ? 'translate-x-[calc(100%+1.5rem)] opacity-0'
            : 'translate-x-0 opacity-100';

    const node = (
        <div
            role="status"
            aria-live="polite"
            className={`pointer-events-auto fixed right-4 top-20 z-[3000] w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl bg-white shadow-lg shadow-olive-950/10 ring-1 ring-olive-900/10 transition-all duration-300 ease-out dark:bg-olive-900 dark:ring-olive-700 sm:right-6 ${translate}`}
        >
            <div className="relative flex items-start gap-3 px-4 pb-3.5 pt-4 pr-11">
                <SuccessBadge tone={tone} />
                <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                        {heading}
                    </p>
                    <p className="mt-0.5 text-sm leading-snug text-olive-600 dark:text-olive-300">
                        {message}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setPhase('exit');
                        window.setTimeout(() => dismissRef.current?.(), 280);
                    }}
                    aria-label="Dismiss"
                    className="absolute right-2.5 top-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-olive-400 transition hover:bg-olive-100 hover:text-olive-800 dark:hover:bg-olive-800 dark:hover:text-olive-100"
                >
                    <CloseMark className="h-3.5 w-3.5" />
                </button>
            </div>
            <div className="h-1 w-full bg-olive-100 dark:bg-olive-800">
                <div
                    key={`${tone}:${message}`}
                    className={`admin-toast-progress h-full origin-left ${
                        isError ? 'bg-rose-500' : 'bg-olive-800 dark:bg-olive-300'
                    }`}
                    style={{ animationDuration: `${duration}ms` }}
                />
            </div>
        </div>
    );

    if (typeof document === 'undefined') return node;
    return createPortal(node, document.body);
}

/**
 * Mount once in a layout. Listens for showSuccessToast() events.
 */
export default function SuccessToastHost() {
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const onToast = (event) => {
            const { message, title, tone, duration } = event.detail || {};
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            setToast({
                id,
                message: message || 'Done',
                title,
                tone: tone === 'error' ? 'error' : 'success',
                duration: duration || DEFAULT_MS,
            });
        };

        window.addEventListener(EVENT, onToast);
        return () => window.removeEventListener(EVENT, onToast);
    }, []);

    if (!toast) return null;

    return (
        <FlashToast
            key={toast.id}
            message={toast.message}
            title={toast.title}
            tone={toast.tone}
            duration={toast.duration}
            onDismiss={() => setToast(null)}
        />
    );
}
