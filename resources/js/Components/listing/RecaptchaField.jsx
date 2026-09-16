import { useEffect, useId, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

const SCRIPT_SRC = 'https://www.google.com/recaptcha/api.js?render=explicit';

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
        const existing = document.querySelector(`script[src^="https://www.google.com/recaptcha/api.js"]`);
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
                else window.grecaptcha?.ready?.(() => resolve(window.grecaptcha));
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
 */
export default function RecaptchaField({
    value = '',
    onChange,
    error = '',
}) {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
    const widgetId = useId();
    const containerRef = useRef(null);
    const widgetRef = useRef(null);
    const [fallbackChecked, setFallbackChecked] = useState(false);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        if (!siteKey) return undefined;
        let cancelled = false;

        loadRecaptchaScript()
            .then((grecaptcha) => {
                if (cancelled || !containerRef.current || widgetRef.current != null) {
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
                            setLoadError('reCAPTCHA failed to load. Please refresh and try again.');
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
            <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500">
                    Security check
                </label>
                <label
                    htmlFor={`recaptcha-fallback-${widgetId}`}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl bg-olive-50 px-4 py-3 ring-1 transition ${
                        error
                            ? 'ring-red-400'
                            : fallbackChecked
                              ? 'ring-mustard'
                              : 'ring-olive-200'
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
                        className="mt-1 h-4 w-4 rounded border-olive-300 text-olive-700 focus:ring-mustard"
                    />
                    <span className="text-sm text-olive-800">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-earth-dusk">
                            <ShieldCheck className="h-4 w-4 text-mustard" />
                            I’m not a robot
                        </span>
                        <span className="mt-1 block text-xs text-olive-500">
                            Add{' '}
                            <code className="rounded bg-white px-1 py-0.5 text-[11px]">
                                VITE_RECAPTCHA_SITE_KEY
                            </code>{' '}
                            to enable Google reCAPTCHA in production.
                        </span>
                    </span>
                </label>
                {error ? (
                    <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
                ) : null}
            </div>
        );
    }

    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500">
                Security check
            </label>
            <div
                ref={containerRef}
                className={`overflow-hidden rounded-xl ${error ? 'ring-2 ring-red-400' : ''}`}
            />
            {loadError ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">{loadError}</p>
            ) : null}
            {error && !loadError ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
            ) : null}
            {!value ? (
                <p className="mt-1.5 text-xs text-olive-500">
                    Complete the reCAPTCHA before sending.
                </p>
            ) : null}
        </div>
    );
}
