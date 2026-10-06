import { Check, Eye, EyeOff } from 'lucide-react';
import { Link } from '@inertiajs/react';

export function GoogleIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden>
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
        </svg>
    );
}

export function PasswordToggle({ show, onToggle, tone = 'default' }) {
    const isGlass = tone === 'glass';

    return (
        <button
            type="button"
            className={`absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition ${
                isGlass
                    ? 'text-white/70 hover:bg-white/10 hover:text-white'
                    : 'text-olive-400 hover:bg-white/80 hover:text-olive-800'
            }`}
            onClick={onToggle}
            aria-label={show ? 'Hide password' : 'Show password'}
        >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
    );
}

export function AuthField({
    id,
    label,
    type = 'text',
    value,
    onChange,
    error,
    success,
    autoComplete,
    placeholder,
    trailing = null,
    hint = null,
    labelAside = null,
    dense = false,
    tone = 'default',
    hideLabel = false,
    showSuccessMessage = true,
}) {
    const isSoft = tone === 'soft';
    const isGlass = tone === 'glass';
    const borderClass = error
        ? isGlass
            ? 'border-red-400/60 bg-red-500/10 focus:border-red-400 focus:ring-red-400/20'
            : isSoft
              ? 'border-red-300 bg-red-50/70 focus:border-red-400 focus:bg-white focus:ring-red-400/15'
              : 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
        : success
          ? isGlass
              ? 'border-emerald-400/50 bg-emerald-500/10 focus:border-emerald-400 focus:ring-emerald-400/20'
              : isSoft
                ? 'border-emerald-300 bg-emerald-50/50 focus:border-emerald-500 focus:bg-white focus:ring-emerald-500/15'
                : 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-600/15'
          : isGlass
            ? 'border-white/35 bg-olive-950/75 focus:border-mustard focus:bg-olive-950/90 focus:ring-mustard/25'
            : isSoft
              ? 'border-transparent bg-olive-50/90 focus:border-olive-800/20 focus:bg-white focus:ring-olive-800/10'
              : 'border-olive-200/90 focus:border-olive-600 focus:ring-olive-600/15';

    return (
        <div className="min-w-0">
            {!hideLabel || labelAside ? (
                <div
                    className={`flex items-baseline justify-between gap-3 ${dense || isGlass ? 'mb-1.5' : 'mb-2'}`}
                >
                    <label
                        htmlFor={id}
                        className={
                            hideLabel
                                ? 'sr-only'
                                : isGlass
                                  ? 'block text-[13px] font-semibold tracking-wide text-white'
                                  : isSoft
                                    ? 'block text-[13px] font-medium tracking-wide text-olive-800'
                                    : dense
                                      ? 'block text-xs font-semibold text-olive-900'
                                      : 'block text-[15px] font-semibold text-olive-900'
                        }
                    >
                        {label}
                        {hint && !hideLabel ? (
                            <span
                                className={`ml-1 font-normal ${
                                    isGlass ? 'text-white/60' : 'text-olive-400'
                                }`}
                            >
                                {hint}
                            </span>
                        ) : null}
                    </label>
                    {labelAside}
                </div>
            ) : (
                <label htmlFor={id} className="sr-only">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={
                        error || (success && showSuccessMessage)
                            ? `${id}-feedback`
                            : undefined
                    }
                    className={`w-full border transition focus:outline-none focus:ring-2 ${
                        isGlass
                            ? 'rounded-xl px-4 py-3.5 text-[15px] text-white placeholder:text-white/55 shadow-none'
                            : isSoft
                              ? 'rounded-2xl px-4 py-3 text-[15px] text-earth-dusk placeholder:text-olive-400/70 shadow-none'
                              : dense
                                ? 'rounded-xl bg-white px-3 py-2 text-sm text-earth-dusk shadow-sm placeholder:text-olive-400/70'
                                : 'rounded-lg bg-white px-3.5 py-3 text-[15px] text-earth-dusk shadow-sm placeholder:text-olive-400/70'
                    } ${trailing ? 'pr-11' : ''} ${borderClass}`}
                />
                {trailing}
            </div>
            {error ? (
                <div
                    id={`${id}-feedback`}
                    className={`mt-1.5 text-xs ${isGlass ? 'text-red-300' : 'text-red-600'}`}
                    role="alert"
                >
                    {error}
                </div>
            ) : success && showSuccessMessage ? (
                <p
                    id={`${id}-feedback`}
                    className={`mt-1.5 inline-flex items-center gap-1 text-xs font-medium ${
                        isGlass ? 'text-emerald-300' : 'text-emerald-700'
                    }`}
                >
                    <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                    {success}
                </p>
            ) : null}
        </div>
    );
}

export function GoogleContinueButton({
    showIcon = true,
    dense = false,
    tone = 'default',
    label = 'Continue with Google',
}) {
    const isSoft = tone === 'soft';
    const isGlass = tone === 'glass';

    return (
        <a
            href={route('auth.google')}
            className={`flex w-full items-center justify-center gap-3 font-medium transition ${
                isGlass
                    ? 'rounded-xl border border-white/30 bg-olive-950/70 px-4 py-3.5 text-[15px] text-white hover:border-mustard/50 hover:bg-olive-950/85'
                    : isSoft
                      ? 'rounded-2xl border border-transparent bg-olive-50 px-4 py-3 text-[15px] text-earth-dusk hover:bg-olive-100/90'
                      : dense
                        ? 'rounded-xl border border-olive-200 bg-white px-3 py-2 text-sm text-earth-dusk hover:border-mustard hover:bg-mustard'
                        : 'rounded-lg border border-olive-200 bg-white px-4 py-3 text-[15px] text-earth-dusk hover:border-mustard hover:bg-mustard'
            }`}
        >
            {showIcon ? (
                <GoogleIcon
                    className={dense && !isSoft && !isGlass ? 'h-4 w-4' : 'h-5 w-5'}
                />
            ) : null}
            {label}
        </a>
    );
}

export function AuthOrDivider({
    dense = false,
    label = 'or',
    tone = 'default',
}) {
    const isGlass = tone === 'glass';

    return (
        <div
            className={`flex items-center gap-3 ${dense ? 'my-4' : 'my-6 gap-4'}`}
        >
            <div
                className={`h-px flex-1 ${isGlass ? 'bg-white/25' : 'bg-olive-100'}`}
            />
            <span
                className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${
                    isGlass ? 'text-mustard' : 'text-olive-400'
                }`}
            >
                {label}
            </span>
            <div
                className={`h-px flex-1 ${isGlass ? 'bg-white/25' : 'bg-olive-100'}`}
            />
        </div>
    );
}

export function AuthLegalNote({ dense = false, tone = 'default' }) {
    const isGlass = tone === 'glass';

    return (
        <p
            className={`text-center leading-relaxed ${
                isGlass
                    ? dense
                        ? 'mt-4 text-[10px] text-white/65 sm:text-[11px]'
                        : 'mt-6 text-[11px] text-white/65 sm:text-[12px]'
                    : dense
                      ? 'mt-3 text-[10px] text-olive-500 sm:text-[11px]'
                      : 'mt-6 text-[11px] text-olive-500 sm:whitespace-nowrap sm:text-[12px]'
            }`}
        >
            By continuing you agree to our{' '}
            <Link
                href="/terms"
                className={`font-medium underline-offset-2 hover:underline ${
                    isGlass ? 'text-mustard' : 'text-olive-700'
                }`}
            >
                Terms of Service
            </Link>{' '}
            and{' '}
            <Link
                href="/privacy"
                className={`font-medium underline-offset-2 hover:underline ${
                    isGlass ? 'text-mustard' : 'text-olive-700'
                }`}
            >
                Privacy Policy
            </Link>
            .
        </p>
    );
}
