import { useEffect, useId, useRef, useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';

const SCRIPT_SRC = 'https://www.google.com/recaptcha/api.js?render=explicit';
const RECAPTCHA_WIDTH = 304;
const RECAPTCHA_HEIGHT = 78;

let scriptLoader = null;

function loadRecaptchaScript() {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('No window'));
    }
    if (window.grecaptcha?.render) {
        return Promise.resolve(window.grecaptcha);
    }
    if (scriptLoader) return scriptLoader;

    scriptLoader = new Promise((resolve, reject) => {
        const existing = document.querySelector(
            `script[src^="https://www.google.com/recaptcha/api.js"]`,
        );
        if (existing) {
            existing.addEventListener('load', () => resolve(window.grecaptcha));
            existing.addEventListener('error', reject);
            if (window.grecaptcha?.render) resolve(window.grecaptcha);
            return;
        }

        const script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            const ready = () => {
                if (window.grecaptcha?.render) resolve(window.grecaptcha);
                else
                    window.grecaptcha?.ready?.(() =>
                        resolve(window.grecaptcha),
                    );
            };
            ready();
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });

    return scriptLoader;
}

/**
 * Google reCAPTCHA v2 checkbox when VITE_RECAPTCHA_SITE_KEY is set.
 * Falls back to a local verification checkbox so forms stay usable in local/dev.
 * Uses Google's native size (304×78); only shrinks on narrow screens.
 */
export default function RecaptchaField({
    value = '',
    onChange,
    error = '',
}) {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
    const widgetId = useId();
    const wrapRef = useRef(null);
    const containerRef = useRef(null);
    const widgetRef = useRef(null);
    const [fallbackChecked, setFallbackChecked] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return undefined;

        const updateScale = () => {
            const width = el.clientWidth;
            if (width > 0) {
                // Never upscale past Google's native size — only shrink on narrow screens.
                setScale(Math.min(1, width / RECAPTCHA_WIDTH));
            }
        };

        updateScale();
        const observer = new ResizeObserver(updateScale);
        observer.observe(el);
        return () => observer.disconnect();
    }, [siteKey]);

    useEffect(() => {
        if (!siteKey) return undefined;
        let cancelled = false;

        loadRecaptchaScript()
            .then((grecaptcha) => {
                if (
                    cancelled ||
                    !containerRef.current ||
                    widgetRef.current != null
                ) {
                    return;
                }
                grecaptcha.ready(() => {
                    if (cancelled || !containerRef.current) return;
                    widgetRef.current = grecaptcha.render(containerRef.current, {
                        sitekey: siteKey,
                        callback: (token) => onChange?.(token),
                        'expired-callback': () => onChange?.(''),
                        'error-callback': () => {
                            onChange?.('');
                            setLoadError(
                                'reCAPTCHA failed to load. Please refresh and try again.',
                            );
                        },
                    });
                });
            })
            .catch(() => {
                setLoadError('Unable to load reCAPTCHA. Check your connection.');
            });

        return () => {
            cancelled = true;
        };
    }, [siteKey, onChange]);

    if (!siteKey) {
        return (
            <div className="w-full">
                <label className="mb-2 block text-[15px] font-semibold text-olive-900">
                    Security check
                </label>
                <label
                    htmlFor={`recaptcha-fallback-${widgetId}`}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border bg-white px-3.5 py-3 shadow-sm transition ${
                        error
                            ? 'border-red-400'
                            : fallbackChecked
                              ? 'border-emerald-500'
                              : 'border-olive-200/90'
                    }`}
                >
                    <input
                        id={`recaptcha-fallback-${widgetId}`}
                        type="checkbox"
                        checked={fallbackChecked}
                        onChange={(e) => {
                            const next = e.target.checked;
                            setFallbackChecked(next);
                            onChange?.(next ? 'fallback-verified' : '');
                        }}
                        className="h-4 w-4 rounded border-olive-300 text-olive-700 focus:ring-mustard"
                    />
                    <span className="inline-flex min-w-0 flex-1 items-center gap-1.5 text-sm font-semibold text-earth-dusk">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-mustard" />
                        I’m not a robot
                        {fallbackChecked ? (
                            <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                                <Check
                                    className="h-3.5 w-3.5"
                                    strokeWidth={2.5}
                                />
                                Verified
                            </span>
                        ) : null}
                    </span>
                </label>
                {error ? (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                        {error}
                    </p>
                ) : null}
            </div>
        );
    }

    return (
        <div className="w-full">
            <label className="mb-2 block text-[15px] font-semibold text-olive-900">
                Security check
            </label>
            <div
                ref={wrapRef}
                className={`w-full overflow-hidden rounded-lg ${error ? 'ring-2 ring-red-400' : ''}`}
                style={{ height: Math.ceil(RECAPTCHA_HEIGHT * scale) }}
            >
                <div
                    style={{
                        width: RECAPTCHA_WIDTH,
                        height: RECAPTCHA_HEIGHT,
                        transform: `scale(${scale})`,
                        transformOrigin: '0 0',
                    }}
                >
                    <div ref={containerRef} />
                </div>
            </div>
            {loadError ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                    {loadError}
                </p>
            ) : null}
            {error && !loadError ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
            ) : null}
            {value && !error && !loadError ? (
                <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Verified
                </p>
            ) : !value ? (
                <p className="mt-1.5 text-xs text-olive-500">
                    Complete the reCAPTCHA before continuing.
                </p>
            ) : null}
        </div>
    );
}
