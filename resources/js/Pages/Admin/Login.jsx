import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function Login({ status }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.login.store'));
    };

    return (
        <div className="min-h-screen w-full overflow-hidden bg-earth-sand">
            <Head title="Admin sign in" />

            <div className="grid min-h-screen w-full lg:grid-cols-12">
                {/* Left hero — fill panel (no letterbox), keep full wordmark visible */}
                <aside className="relative hidden min-h-screen overflow-hidden bg-olive-950 lg:col-span-7 lg:block">
                    <img
                        src="/images/hero/slide-2.webp"
                        alt="Nanyuki Now — Your city, right now"
                        className="absolute inset-0 h-full w-full object-fill"
                        decoding="async"
                    />

                    {/* Slim curve into the form */}
                    <svg
                        className="pointer-events-none absolute inset-y-0 -right-px z-20 h-full w-10 text-earth-sand xl:w-12"
                        viewBox="0 0 80 640"
                        preserveAspectRatio="none"
                        aria-hidden
                    >
                        <path
                            d="M80 0 C 28 160, 28 480, 80 640 L 80 640 L 80 0 Z"
                            fill="currentColor"
                        />
                    </svg>
                </aside>

                {/* Right form panel — earth + olive blend, mustard CTA */}
                <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-earth-sand px-6 py-12 sm:px-10 lg:col-span-5 lg:px-10 xl:px-14">
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            backgroundImage:
                                'radial-gradient(ellipse at 70% 15%, rgba(242,184,46,0.18), transparent 45%), radial-gradient(ellipse at 20% 85%, rgba(107,119,88,0.12), transparent 40%)',
                        }}
                    />

                    <div className="relative mx-auto w-full max-w-md text-center">
                        <img
                            src="/images/logo.png"
                            alt="Nanyuki Now"
                            width={969}
                            height={542}
                            decoding="async"
                            className="mx-auto h-16 w-auto object-contain mix-blend-multiply sm:h-20"
                        />

                        <h2 className="mt-8 font-display text-3xl font-semibold uppercase tracking-wide text-earth-dusk sm:text-4xl">
                            Welcome back!
                        </h2>
                        <p className="mt-2 text-base text-olive-700">
                            Please login to view your dashboard
                        </p>

                        {status && (
                            <div className="mt-6 rounded-lg border border-mustard/40 bg-mustard/15 px-3 py-2 text-sm text-olive-900">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="mt-8 space-y-4 text-left">
                            <label className="block">
                                <span className="sr-only">Email or username</span>
                                <input
                                    type="text"
                                    value={data.login}
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) => setData('login', e.target.value)}
                                    className="w-full rounded-md border border-olive-300/90 bg-white/90 px-4 py-3.5 text-base text-earth-dusk outline-none transition placeholder:text-olive-400 focus:border-mustard focus:ring-2 focus:ring-mustard/30"
                                    placeholder="Email or username"
                                />
                                {errors.login && (
                                    <span className="mt-1.5 block text-sm text-rose-600">
                                        {errors.login}
                                    </span>
                                )}
                            </label>

                            <label className="block">
                                <span className="sr-only">Password</span>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full rounded-md border border-olive-300/90 bg-white/90 px-4 py-3.5 pr-12 text-base text-earth-dusk outline-none transition placeholder:text-olive-400 focus:border-mustard focus:ring-2 focus:ring-mustard/30"
                                        placeholder="Password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-olive-500 hover:text-olive-800"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label="Toggle password"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <span className="mt-1.5 block text-sm text-rose-600">
                                        {errors.password}
                                    </span>
                                )}
                            </label>

                            <div className="flex items-center justify-between gap-3 pt-1 text-sm">
                                <label className="inline-flex items-center gap-2 text-olive-800">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData('remember', e.target.checked)
                                        }
                                        className="rounded border-olive-300 text-mustard focus:ring-mustard"
                                    />
                                    Keep me logged in
                                </label>
                                <Link
                                    href={route('password.request')}
                                    className="font-medium text-olive-700 underline-offset-2 hover:text-earth-dusk hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-2 w-full rounded-md bg-mustard px-4 py-3.5 text-base font-bold uppercase tracking-wide text-earth-dusk shadow-soft transition duration-200 hover:bg-mint-deep hover:text-white hover:shadow-lift active:scale-[0.99] disabled:opacity-60"
                            >
                                {processing ? 'Signing in…' : 'Login'}
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    );
}
