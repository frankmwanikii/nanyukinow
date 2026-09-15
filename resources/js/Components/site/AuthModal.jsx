import { Link, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

function GoogleIcon({ className = '' }) {
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

function Field({
    id,
    label,
    type = 'text',
    value,
    onChange,
    error,
    autoComplete,
    icon: Icon,
    trailing = null,
}) {
    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-olive-800">
                {label}
            </label>
            <div className="relative">
                {Icon ? (
                    <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-500" />
                ) : null}
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    className={`w-full rounded-xl border bg-earth-sand/40 py-3 text-sm text-earth-dusk placeholder:text-olive-400 transition focus:border-olive-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-olive-500/15 ${
                        Icon ? 'pl-10' : 'pl-3.5'
                    } ${trailing ? 'pr-11' : 'pr-3.5'} ${
                        error ? 'border-red-400' : 'border-olive-200'
                    }`}
                />
                {trailing}
            </div>
            {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
        </div>
    );
}

export default function AuthModal({ open, onClose, initialTab = 'login' }) {
    const titleId = useId();
    const [tab, setTab] = useState(initialTab);
    const [showPassword, setShowPassword] = useState(false);

    const loginForm = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const registerForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (open) {
            setTab(initialTab);
            setShowPassword(false);
        }
    }, [open, initialTab]);

    useEffect(() => {
        if (!open) return undefined;

        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKey);
        };
    }, [open, onClose]);

    const submitLogin = (e) => {
        e.preventDefault();
        loginForm.post(route('login'), {
            onFinish: () => loginForm.reset('password'),
            onSuccess: () => onClose(),
        });
    };

    const submitRegister = (e) => {
        e.preventDefault();
        registerForm.post(route('register'), {
            onFinish: () =>
                registerForm.reset('password', 'password_confirmation'),
            onSuccess: () => onClose(),
        });
    };

    const busy = loginForm.processing || registerForm.processing;

    return (
        <AnimatePresence>
            {open ? (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
                    <motion.button
                        type="button"
                        aria-label="Close sign in"
                        className="absolute inset-0 bg-earth-dusk/55"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                    />

                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        initial={{ opacity: 0, y: 18, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.97 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="relative z-10 flex max-h-[min(92svh,52rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 transition hover:bg-white hover:text-olive-900 sm:right-5 sm:top-5"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" strokeWidth={2.25} />
                        </button>

                        <div className="relative overflow-hidden bg-olive-700 px-6 pb-8 pt-8 text-white sm:px-10 sm:pb-10 sm:pt-10">
                            <div className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full bg-mustard/25 blur-2xl" />
                            <div className="pointer-events-none absolute -bottom-12 left-6 h-40 w-40 rounded-full bg-mint/20 blur-3xl" />

                            <div className="relative max-w-lg pr-12">
                                <img
                                    src="/images/logo.png"
                                    alt=""
                                    className="mb-4 h-10 w-auto object-contain brightness-0 invert sm:h-11"
                                />
                                <h2
                                    id={titleId}
                                    className="font-display text-3xl font-semibold tracking-tight sm:text-4xl"
                                >
                                    {tab === 'login'
                                        ? 'Welcome back'
                                        : 'Join Nanyuki Now'}
                                </h2>
                                <p className="mt-2 text-sm text-white/75 sm:text-base">
                                    {tab === 'login'
                                        ? 'Sign in to save spots and manage your listings.'
                                        : 'Create an account to list your business and explore.'}
                                </p>
                            </div>
                        </div>

                        <div className="overflow-y-auto px-6 py-6 sm:px-10 sm:py-8">
                            <div className="mb-6 grid grid-cols-2 rounded-2xl bg-olive-50 p-1.5">
                                {[
                                    { id: 'login', label: 'Sign in' },
                                    { id: 'register', label: 'Register' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setTab(item.id)}
                                        className={`rounded-xl px-3 py-3 text-sm font-semibold transition sm:text-base ${
                                            tab === item.id
                                                ? 'bg-white text-olive-800 shadow-sm'
                                                : 'text-olive-600 hover:text-olive-800'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <a
                                href={route('auth.google')}
                                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-olive-200 bg-white px-4 py-3.5 text-sm font-semibold text-earth-dusk shadow-sm transition hover:border-olive-300 hover:bg-olive-50/60 sm:text-base"
                            >
                                <GoogleIcon className="h-5 w-5" />
                                Continue with Google
                            </a>

                            <div className="my-6 flex items-center gap-3">
                                <div className="h-px flex-1 bg-olive-100" />
                                <span className="text-xs font-medium uppercase tracking-wide text-olive-500">
                                    or email
                                </span>
                                <div className="h-px flex-1 bg-olive-100" />
                            </div>

                            {tab === 'login' ? (
                                <form onSubmit={submitLogin} className="space-y-4">
                                    <Field
                                        id="auth-login-email"
                                        label="Email"
                                        type="email"
                                        icon={Mail}
                                        value={loginForm.data.email}
                                        onChange={(e) =>
                                            loginForm.setData('email', e.target.value)
                                        }
                                        error={loginForm.errors.email}
                                        autoComplete="username"
                                    />
                                    <Field
                                        id="auth-login-password"
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        icon={Lock}
                                        value={loginForm.data.password}
                                        onChange={(e) =>
                                            loginForm.setData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                        error={loginForm.errors.password}
                                        autoComplete="current-password"
                                        trailing={
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-olive-500 hover:text-olive-800"
                                                onClick={() =>
                                                    setShowPassword((v) => !v)
                                                }
                                                aria-label={
                                                    showPassword
                                                        ? 'Hide password'
                                                        : 'Show password'
                                                }
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        }
                                    />

                                    <div className="flex items-center justify-between gap-3">
                                        <label className="inline-flex items-center gap-2 text-sm text-olive-700">
                                            <input
                                                type="checkbox"
                                                checked={loginForm.data.remember}
                                                onChange={(e) =>
                                                    loginForm.setData(
                                                        'remember',
                                                        e.target.checked,
                                                    )
                                                }
                                                className="rounded border-olive-300 text-olive-600 focus:ring-olive-500"
                                            />
                                            Remember me
                                        </label>
                                        <Link
                                            href={route('password.request')}
                                            className="text-sm font-medium text-olive-700 underline-offset-2 hover:text-olive-900 hover:underline"
                                            onClick={onClose}
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={busy}
                                        className="mt-2 w-full rounded-2xl bg-mustard px-4 py-4 text-sm font-bold text-olive-950 shadow-[0_10px_24px_-10px_rgba(242,184,46,0.75)] transition hover:bg-mustard/90 disabled:opacity-60 sm:text-base"
                                    >
                                        {loginForm.processing
                                            ? 'Signing in…'
                                            : 'Sign in'}
                                    </button>
                                </form>
                            ) : (
                                <form
                                    onSubmit={submitRegister}
                                    className="space-y-4"
                                >
                                    <Field
                                        id="auth-register-name"
                                        label="Full name"
                                        icon={User}
                                        value={registerForm.data.name}
                                        onChange={(e) =>
                                            registerForm.setData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        error={registerForm.errors.name}
                                        autoComplete="name"
                                    />
                                    <Field
                                        id="auth-register-email"
                                        label="Email"
                                        type="email"
                                        icon={Mail}
                                        value={registerForm.data.email}
                                        onChange={(e) =>
                                            registerForm.setData(
                                                'email',
                                                e.target.value,
                                            )
                                        }
                                        error={registerForm.errors.email}
                                        autoComplete="username"
                                    />
                                    <Field
                                        id="auth-register-password"
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        icon={Lock}
                                        value={registerForm.data.password}
                                        onChange={(e) =>
                                            registerForm.setData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                        error={registerForm.errors.password}
                                        autoComplete="new-password"
                                        trailing={
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-olive-500 hover:text-olive-800"
                                                onClick={() =>
                                                    setShowPassword((v) => !v)
                                                }
                                                aria-label={
                                                    showPassword
                                                        ? 'Hide password'
                                                        : 'Show password'
                                                }
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        }
                                    />
                                    <Field
                                        id="auth-register-password-confirm"
                                        label="Confirm password"
                                        type={showPassword ? 'text' : 'password'}
                                        icon={Lock}
                                        value={
                                            registerForm.data.password_confirmation
                                        }
                                        onChange={(e) =>
                                            registerForm.setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        error={
                                            registerForm.errors
                                                .password_confirmation
                                        }
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="submit"
                                        disabled={busy}
                                        className="mt-2 w-full rounded-2xl bg-mustard px-4 py-4 text-sm font-bold text-olive-950 shadow-[0_10px_24px_-10px_rgba(242,184,46,0.75)] transition hover:bg-mustard/90 disabled:opacity-60 sm:text-base"
                                    >
                                        {registerForm.processing
                                            ? 'Creating account…'
                                            : 'Create account'}
                                    </button>
                                </form>
                            )}

                            <p className="mt-6 text-center text-xs leading-relaxed text-olive-500 sm:text-sm">
                                By continuing you agree to Nanyuki Now’s terms
                                and privacy policy.
                            </p>
                        </div>
                    </motion.div>
                </div>
            ) : null}
        </AnimatePresence>
    );
}
