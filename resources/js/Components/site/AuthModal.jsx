import { Link, useForm, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';

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
    placeholder,
    trailing = null,
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-2 block text-[13px] font-medium tracking-wide text-olive-800"
            >
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    className={`w-full rounded-lg border bg-white px-3.5 py-3 text-[15px] text-earth-dusk placeholder:text-olive-400/80 shadow-sm transition focus:border-olive-600 focus:outline-none focus:ring-2 focus:ring-olive-600/15 ${
                        trailing ? 'pr-11' : ''
                    } ${error ? 'border-red-400' : 'border-olive-200/90'}`}
                />
                {trailing}
            </div>
            {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
        </div>
    );
}

function PasswordToggle({ show, onToggle }) {
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

export default function AuthModal({ open, onClose, initialTab = 'login' }) {
    const titleId = useId();
    const { flash } = usePage().props;
    const [tab, setTab] = useState(initialTab);
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    const loginForm = useForm({
        login: '',
        password: '',
        remember: true,
    });

    const registerForm = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const forgotForm = useForm({
        email: '',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (open) {
            setTab(initialTab);
            setShowPassword(false);
            setResetSent(false);
            forgotForm.clearErrors();
            forgotForm.reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, initialTab]);

    useEffect(() => {
        if (flash?.status && tab === 'forgot') {
            setResetSent(true);
        }
    }, [flash?.status, tab]);

    useEffect(() => {
        if (!open) return undefined;

        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };

        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = prev;
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

    const submitForgot = (e) => {
        e.preventDefault();
        forgotForm.post(route('password.email'), {
            preserveScroll: true,
            onSuccess: () => {
                setResetSent(true);
            },
        });
    };

    const openForgot = () => {
        setResetSent(false);
        forgotForm.setData(
            'email',
            loginForm.data.login.includes('@') ? loginForm.data.login : '',
        );
        forgotForm.clearErrors();
        setTab('forgot');
    };

    const busy =
        loginForm.processing ||
        registerForm.processing ||
        forgotForm.processing;
    const isLogin = tab === 'login';
    const isForgot = tab === 'forgot';

    const brandTitle = isForgot
        ? 'Reset your password'
        : isLogin
          ? 'Welcome back to Nanyuki Now'
          : 'Create your Nanyuki Now account';

    const brandBody = isForgot
        ? 'Enter the email on your account and we’ll send a secure link to choose a new password.'
        : isLogin
          ? 'Sign in to save favourite spots, manage listings, and stay close to what’s happening in town.'
          : 'Join locals and visitors discovering where to eat, stay, and explore across Nanyuki.';

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open ? (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
                    role="presentation"
                >
                    <motion.button
                        type="button"
                        aria-label="Close dialog"
                        className="absolute inset-0 bg-black/50"
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
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{
                            duration: 0.25,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="relative z-10 flex w-full max-w-4xl max-h-[min(90svh,44rem)] overflow-hidden rounded-2xl bg-white shadow-[0_25px_80px_-12px_rgba(0,0,0,0.45)] ring-1 ring-black/10"
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white text-olive-600 shadow-md ring-1 ring-olive-100 transition hover:bg-olive-50 hover:text-olive-900 md:right-4 md:top-4"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" strokeWidth={2.25} />
                        </button>

                        <div className="hidden w-[42%] shrink-0 flex-col justify-between bg-olive-700 p-8 text-white md:flex lg:p-10">
                            <div>
                                <img
                                    src="/images/logo.png"
                                    alt="Nanyuki Now"
                                    className="h-10 w-auto object-contain brightness-0 invert"
                                />
                                <h2
                                    id={titleId}
                                    className="mt-8 font-display text-2xl font-semibold leading-tight tracking-tight lg:text-[1.85rem]"
                                >
                                    {brandTitle}
                                </h2>
                                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70 lg:text-[15px]">
                                    {brandBody}
                                </p>
                            </div>
                            <div className="mt-8 space-y-2 border-t border-white/15 pt-6 text-sm text-white/65">
                                <p>Trusted local listings · Eat · Stay · Do</p>
                                <p className="text-white/45">
                                    Your city, right now.
                                </p>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-7 sm:px-9 sm:py-9">
                            <div className="mb-6 pr-10 md:hidden">
                                <img
                                    src="/images/logo.png"
                                    alt=""
                                    className="mb-4 h-8 w-auto object-contain"
                                />
                                <h2 className="font-display text-2xl font-semibold text-earth-dusk">
                                    {isForgot
                                        ? 'Forgot password'
                                        : isLogin
                                          ? 'Welcome back'
                                          : 'Create account'}
                                </h2>
                                <p className="mt-1 text-sm text-olive-600">
                                    {isForgot
                                        ? 'We’ll email you a reset link'
                                        : isLogin
                                          ? 'Sign in to continue'
                                          : 'Join Nanyuki Now in a minute'}
                                </p>
                            </div>

                            {isForgot ? (
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTab('login');
                                            setResetSent(false);
                                        }}
                                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-olive-700 transition hover:text-olive-900"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to sign in
                                    </button>

                                    <h3 className="mb-2 hidden font-display text-xl font-semibold text-earth-dusk md:block">
                                        Forgot your password?
                                    </h3>
                                    <p className="mb-6 hidden text-sm leading-relaxed text-olive-600 md:block">
                                        Enter your account email and we’ll send
                                        a password reset link.
                                    </p>

                                    {resetSent ? (
                                        <div className="rounded-xl border border-mint/40 bg-mint/15 px-4 py-4 text-sm leading-relaxed text-olive-800">
                                            <p className="font-semibold text-olive-900">
                                                Check your inbox
                                            </p>
                                            <p className="mt-1.5">
                                                {flash?.status ||
                                                    'If that email is registered, a password reset link is on its way.'}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setTab('login')}
                                                className="mt-4 text-sm font-semibold text-olive-700 underline-offset-2 hover:underline"
                                            >
                                                Return to sign in
                                            </button>
                                        </div>
                                    ) : (
                                        <form
                                            onSubmit={submitForgot}
                                            className="space-y-4"
                                        >
                                            <Field
                                                id="auth-forgot-email"
                                                label="Email address"
                                                type="email"
                                                value={forgotForm.data.email}
                                                onChange={(e) =>
                                                    forgotForm.setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                error={forgotForm.errors.email}
                                                autoComplete="username"
                                                placeholder="you@example.com"
                                            />
                                            <button
                                                type="submit"
                                                disabled={busy}
                                                className="mt-1 w-full rounded-lg bg-olive-700 px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-olive-800 disabled:cursor-not-allowed disabled:opacity-55"
                                            >
                                                {forgotForm.processing
                                                    ? 'Sending link…'
                                                    : 'Send reset link'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="mb-6 flex gap-8 border-b border-olive-100 pr-10">
                                        {[
                                            { id: 'login', label: 'Sign in' },
                                            {
                                                id: 'register',
                                                label: 'Register',
                                            },
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => setTab(item.id)}
                                                className={`relative -mb-px pb-3 text-[15px] font-semibold transition ${
                                                    tab === item.id
                                                        ? 'text-olive-800'
                                                        : 'text-olive-500 hover:text-olive-700'
                                                }`}
                                            >
                                                {item.label}
                                                {tab === item.id ? (
                                                    <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-olive-700" />
                                                ) : null}
                                            </button>
                                        ))}
                                    </div>

                                    <a
                                        href={route('auth.google')}
                                        className="flex w-full items-center justify-center gap-3 rounded-lg border border-olive-200 bg-white px-4 py-3 text-[15px] font-medium text-earth-dusk transition hover:bg-olive-50/80"
                                    >
                                        <GoogleIcon className="h-5 w-5" />
                                        Continue with Google
                                    </a>

                                    <div className="my-6 flex items-center gap-4">
                                        <div className="h-px flex-1 bg-olive-100" />
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-olive-400">
                                            or
                                        </span>
                                        <div className="h-px flex-1 bg-olive-100" />
                                    </div>

                                    {isLogin ? (
                                        <form
                                            onSubmit={submitLogin}
                                            className="space-y-4"
                                        >
                                            <Field
                                                id="auth-login-login"
                                                label="Email or username"
                                                type="text"
                                                value={loginForm.data.login}
                                                onChange={(e) =>
                                                    loginForm.setData(
                                                        'login',
                                                        e.target.value,
                                                    )
                                                }
                                                error={loginForm.errors.login}
                                                autoComplete="username"
                                                placeholder="you@example.com or username"
                                            />
                                            <Field
                                                id="auth-login-password"
                                                label="Password"
                                                type={
                                                    showPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                value={loginForm.data.password}
                                                onChange={(e) =>
                                                    loginForm.setData(
                                                        'password',
                                                        e.target.value,
                                                    )
                                                }
                                                error={
                                                    loginForm.errors.password
                                                }
                                                autoComplete="current-password"
                                                placeholder="Enter your password"
                                                trailing={
                                                    <PasswordToggle
                                                        show={showPassword}
                                                        onToggle={() =>
                                                            setShowPassword(
                                                                (v) => !v,
                                                            )
                                                        }
                                                    />
                                                }
                                            />

                                            <div className="flex items-center justify-between gap-3 pt-0.5">
                                                <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-olive-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            loginForm.data
                                                                .remember
                                                        }
                                                        onChange={(e) =>
                                                            loginForm.setData(
                                                                'remember',
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="h-4 w-4 rounded border-olive-300 text-olive-700 focus:ring-olive-600"
                                                    />
                                                    Remember me
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={openForgot}
                                                    className="text-sm font-medium text-olive-700 underline-offset-2 hover:underline"
                                                >
                                                    Forgot password?
                                                </button>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={busy}
                                                className="mt-1 w-full rounded-lg bg-olive-700 px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-olive-800 disabled:cursor-not-allowed disabled:opacity-55"
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
                                                value={registerForm.data.name}
                                                onChange={(e) =>
                                                    registerForm.setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                error={
                                                    registerForm.errors.name
                                                }
                                                autoComplete="name"
                                                placeholder="Your name"
                                            />
                                            <Field
                                                id="auth-register-username"
                                                label="Username"
                                                value={
                                                    registerForm.data.username
                                                }
                                                onChange={(e) =>
                                                    registerForm.setData(
                                                        'username',
                                                        e.target.value
                                                            .toLowerCase()
                                                            .replace(
                                                                /[^a-z0-9_-]/g,
                                                                '',
                                                            ),
                                                    )
                                                }
                                                error={
                                                    registerForm.errors
                                                        .username
                                                }
                                                autoComplete="username"
                                                placeholder="choose_a_username"
                                            />
                                            <Field
                                                id="auth-register-email"
                                                label="Email address"
                                                type="email"
                                                value={registerForm.data.email}
                                                onChange={(e) =>
                                                    registerForm.setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                error={
                                                    registerForm.errors.email
                                                }
                                                autoComplete="email"
                                                placeholder="you@example.com"
                                            />
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <Field
                                                    id="auth-register-password"
                                                    label="Password"
                                                    type={
                                                        showPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    value={
                                                        registerForm.data
                                                            .password
                                                    }
                                                    onChange={(e) =>
                                                        registerForm.setData(
                                                            'password',
                                                            e.target.value,
                                                        )
                                                    }
                                                    error={
                                                        registerForm.errors
                                                            .password
                                                    }
                                                    autoComplete="new-password"
                                                    placeholder="Create password"
                                                    trailing={
                                                        <PasswordToggle
                                                            show={showPassword}
                                                            onToggle={() =>
                                                                setShowPassword(
                                                                    (v) => !v,
                                                                )
                                                            }
                                                        />
                                                    }
                                                />
                                                <Field
                                                    id="auth-register-password-confirm"
                                                    label="Confirm password"
                                                    type={
                                                        showPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    value={
                                                        registerForm.data
                                                            .password_confirmation
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
                                                    placeholder="Repeat password"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={busy}
                                                className="mt-1 w-full rounded-lg bg-olive-700 px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-olive-800 disabled:cursor-not-allowed disabled:opacity-55"
                                            >
                                                {registerForm.processing
                                                    ? 'Creating account…'
                                                    : 'Create account'}
                                            </button>
                                        </form>
                                    )}

                                    <p className="mt-6 text-center text-[12px] leading-relaxed text-olive-500">
                                        By continuing you agree to our{' '}
                                        <Link
                                            href="/terms"
                                            onClick={onClose}
                                            className="font-medium text-olive-700 underline-offset-2 hover:underline"
                                        >
                                            Terms of Service
                                        </Link>{' '}
                                        and{' '}
                                        <Link
                                            href="/privacy"
                                            onClick={onClose}
                                            className="font-medium text-olive-700 underline-offset-2 hover:underline"
                                        >
                                            Privacy Policy
                                        </Link>
                                        .
                                    </p>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            ) : null}
        </AnimatePresence>,
        document.body,
    );
}
