import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

const EVENT = 'nn:success-toast';
const DEFAULT_MS = 4500;

/**
 * Fire a global green success toast (progress shrinks right → left).
 * @param {string} message
 * @param {{ duration?: number }} [options]
 */
export function showSuccessToast(message, options = {}) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
        new CustomEvent(EVENT, {
            detail: {
                message: String(message || 'Success'),
                duration: options.duration ?? DEFAULT_MS,
            },
        }),
    );
}

/**
 * Mount once in a layout. Listens for showSuccessToast() events.
 */
export default function SuccessToastHost() {
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const onToast = (event) => {
            const { message, duration } = event.detail || {};
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            setToast({ id, message: message || 'Success', duration: duration || DEFAULT_MS });
        };

        window.addEventListener(EVENT, onToast);
        return () => window.removeEventListener(EVENT, onToast);
    }, []);

    useEffect(() => {
        if (!toast) return undefined;
        const timer = window.setTimeout(() => setToast(null), toast.duration);
        return () => window.clearTimeout(timer);
    }, [toast]);

    if (!toast) return null;

    return (
        <div
            className="pointer-events-none fixed inset-x-0 top-0 z-[3000] flex justify-center px-4 pt-4 sm:justify-end sm:px-6 sm:pt-5"
            role="status"
            aria-live="polite"
        >
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl bg-olive-700 text-white shadow-lg shadow-olive-900/20 ring-1 ring-olive-800/40">
                <div className="flex items-start gap-3 px-4 py-3.5">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                        <Check className="h-4 w-4" strokeWidth={2.75} />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-sm font-semibold leading-snug">
                            {toast.message}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setToast(null)}
                        className="rounded-lg px-1.5 py-0.5 text-lg leading-none text-white/70 transition hover:bg-white/10 hover:text-white"
                        aria-label="Dismiss"
                    >
                        ×
                    </button>
                </div>
                <div className="h-1 w-full bg-olive-900/30">
                    <div
                        key={toast.id}
                        className="h-full origin-left bg-mustard"
                        style={{
                            animation: `nn-toast-shrink ${toast.duration}ms linear forwards`,
                        }}
                    />
                </div>
            </div>
            <style>{`
                @keyframes nn-toast-shrink {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }
            `}</style>
        </div>
    );
}
