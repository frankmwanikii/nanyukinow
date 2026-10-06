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

export function PasswordToggle({ show, onToggle }) {
    return (
        <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-olive-500 transition hover:bg-olive-50 hover:text-olive-800"
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
    showSuccessMessage = true,
}) {
    const borderClass = error
        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
        : success
          ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-600/15'
          : 'border-olive-200/90 focus:border-olive-600 focus:ring-olive-600/15';

    return (
        <div className="min-w-0">
            <div
                className={`flex items-baseline justify-between gap-3 ${dense ? 'mb-1' : 'mb-2'}`}
            >
                <label
                    htmlFor={id}
                    className={`block font-semibold text-olive-900 ${
                        dense ? 'text-xs' : 'text-[15px]'
                    }`}
                >
                    {label}
                    {hint ? (
                        <span className="ml-1 font-normal text-olive-400">
                            {hint}
                        </span>
                    ) : null}
                </label>
                {labelAside}
            </div>
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
                    className={`w-full border bg-white text-earth-dusk placeholder:text-olive-400/80 shadow-sm transition focus:outline-none focus:ring-2 ${
                        dense
                            ? 'rounded-xl px-3 py-2 text-sm'
                            : 'rounded-lg px-3.5 py-3 text-[15px]'
                    } ${trailing ? 'pr-11' : ''} ${borderClass}`}
                />
                {trailing}
            </div>
            {error ? (
                <div
                    id={`${id}-feedback`}
                    className={`text-xs text-red-600 ${dense ? 'mt-1' : 'mt-1.5'}`}
                    role="alert"
                >
                    {error}
                </div>
            ) : success && showSuccessMessage ? (
                <p
                    id={`${id}-feedback`}
                    className={`inline-flex items-center gap-1 text-xs font-medium text-emerald-700 ${dense ? 'mt-1' : 'mt-1.5'}`}
                >
                    <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                    {success}
                </p>
            ) : null}
        </div>
    );
}

export function GoogleContinueButton({ showIcon = true, dense = false }) {
    return (
        <a
            href={route('auth.google')}
            className={`flex w-full items-center justify-center gap-3 border border-olive-200 bg-white font-medium text-earth-dusk transition hover:border-mustard hover:bg-mustard hover:text-earth-dusk ${
                dense
                    ? 'rounded-xl px-3 py-2 text-sm'
                    : 'rounded-lg px-4 py-3 text-[15px]'
            }`}
        >
            {showIcon ? (
                <GoogleIcon className={dense ? 'h-4 w-4' : 'h-5 w-5'} />
            ) : null}
            Continue with Google
        </a>
    );
}

export function AuthOrDivider({ dense = false }) {
    return (
        <div
            className={`flex items-center gap-3 ${dense ? 'my-3' : 'my-6 gap-4'}`}
        >
            <div className="h-px flex-1 bg-olive-100" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-olive-400">
                or
            </span>
            <div className="h-px flex-1 bg-olive-100" />
        </div>
    );
}

export function AuthLegalNote({ dense = false }) {
    return (
        <p
            className={`text-center leading-relaxed text-olive-500 ${
                dense
                    ? 'mt-3 text-[10px] sm:text-[11px]'
                    : 'mt-6 text-[11px] sm:whitespace-nowrap sm:text-[12px]'
            }`}
        >
            By continuing you agree to our{' '}
            <Link
                href="/terms"
                className="font-medium text-olive-700 underline-offset-2 hover:underline"
            >
                Terms of Service
            </Link>{' '}
            and{' '}
            <Link
                href="/privacy"
                className="font-medium text-olive-700 underline-offset-2 hover:underline"
            >
                Privacy Policy
            </Link>
            .
        </p>
    );
}
