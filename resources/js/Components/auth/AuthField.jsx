import { CheckMark, EyeMark, EyeOffMark, PasskeyMark } from '@/Components/site/Mark';
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
            className={`absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center transition ${
                isGlass
                    ? 'right-0.5 text-white/50 hover:text-white'
                    : 'right-1 text-olive-400 hover:text-olive-800'
            }`}
            onClick={onToggle}
            aria-label={show ? 'Hide password' : 'Show password'}
        >
            {show ? (
                <EyeOffMark className="h-4 w-4" />
            ) : (
                <EyeMark className="h-4 w-4" />
            )}
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
            ? 'border-red-400/70 focus:border-red-400'
            : 'border-rose-500 focus:border-rose-600'
        : isGlass
          ? 'border-white/18 focus:border-mustard'
          : success
            ? 'border-emerald-600 focus:border-emerald-700'
            : isSoft
              ? 'border-olive-900/15 bg-olive-50 focus:border-olive-900 focus:bg-white'
              : 'border-olive-900/20 focus:border-olive-900';

    return (
        <div className="min-w-0">
            {!hideLabel || labelAside ? (
                <div
                    className={`flex items-baseline justify-between gap-3 ${dense ? 'mb-1.5' : 'mb-1.5'}`}
                >
                    <label
                        htmlFor={id}
                        className={
                            hideLabel
                                ? 'sr-only'
                                : isGlass
                                  ? 'block text-sm font-medium text-white/75'
                                  : 'block text-sm font-semibold text-olive-800'
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
                    className={`w-full border bg-white px-3.5 py-3 text-base text-olive-900 outline-none transition placeholder:text-olive-400 focus:ring-0 ${
                        isGlass
                            ? 'border bg-olive-900 text-[15px] leading-normal text-white placeholder:text-white/40 [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#2a2e23]'
                            : dense
                              ? 'px-3 py-2 text-sm'
                              : ''
                    } ${trailing ? 'pr-11' : ''} ${borderClass}`}
                />
                {trailing}
            </div>
            {error ? (
                <div
                    id={`${id}-feedback`}
                    className={`mt-1.5 text-xs ${isGlass ? 'text-red-300' : 'text-rose-600'}`}
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
                    <CheckMark className="h-3.5 w-3.5 shrink-0" />
                    {success}
                </p>
            ) : null}
        </div>
    );
}

function authContinueClassName({ dense = false, tone = 'default' } = {}) {
    const isSoft = tone === 'soft';
    const isGlass = tone === 'glass';

    if (isGlass) {
        return 'border border-white/30 bg-olive-950/70 px-4 py-3.5 text-[15px] text-white hover:border-mustard hover:bg-mustard hover:text-earth-dusk disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-white/30 disabled:hover:bg-olive-950/70 disabled:hover:text-white';
    }

    if (isSoft) {
        return 'border border-olive-900/15 bg-olive-50 px-4 py-3 text-[15px] text-earth-dusk hover:border-mustard hover:bg-mustard disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-olive-900/15 disabled:hover:bg-olive-50';
    }

    if (dense) {
        return 'border border-olive-900/20 bg-white px-3 py-2 text-sm text-earth-dusk hover:border-mustard hover:bg-mustard disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-olive-900/20 disabled:hover:bg-white';
    }

    return 'border border-olive-900/20 bg-white px-4 py-3 text-[15px] text-earth-dusk hover:border-mustard hover:bg-mustard disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-olive-900/20 disabled:hover:bg-white';
}

export function GoogleContinueButton({
    showIcon = true,
    dense = false,
    tone = 'default',
    label = 'Continue with Google',
}) {
    return (
        <a
            href={route('auth.google')}
            className={`flex w-full items-center justify-center gap-3 font-medium transition ${authContinueClassName(
                { dense, tone },
            )}`}
        >
            {showIcon ? (
                <GoogleIcon
                    className={
                        dense && tone !== 'soft' && tone !== 'glass'
                            ? 'h-4 w-4'
                            : 'h-5 w-5'
                    }
                />
            ) : null}
            {label}
        </a>
    );
}

export function PasskeyContinueButton({
    onClick,
    loading = false,
    disabled = false,
    supported = true,
    dense = false,
    tone = 'default',
    label = 'Sign in with passkey',
    loadingLabel = 'Waiting for device…',
}) {
    if (!supported) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || loading}
            className={`flex w-full items-center justify-center gap-3 font-medium transition ${authContinueClassName(
                { dense, tone },
            )}`}
        >
            <PasskeyMark
                className={
                    dense && tone !== 'soft' && tone !== 'glass'
                        ? 'h-4 w-4'
                        : 'h-5 w-5'
                }
            />
            {loading ? loadingLabel : label}
        </button>
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
                className={`h-px flex-1 ${isGlass ? 'bg-white/25' : 'bg-olive-900/15'}`}
            />
            <span
                className={`text-sm font-medium ${
                    isGlass ? 'text-mustard' : 'text-olive-500'
                }`}
            >
                {label}
            </span>
            <div
                className={`h-px flex-1 ${isGlass ? 'bg-white/25' : 'bg-olive-900/15'}`}
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
