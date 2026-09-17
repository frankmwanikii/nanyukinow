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
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
            <Head title="Admin sign in" />

            {/* Soft brand wash behind the card */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse at 12% 18%, rgba(242,184,46,0.35), transparent 42%), radial-gradient(ellipse at 88% 82%, rgba(168,225,144,0.28), transparent 40%), linear-gradient(145deg, #ebe4d6 0%, #e4e7dc 45%, #f9e8b8 100%)',
                }}
            />
            <div className="pointer-events-none absolute inset-0 bg-grain opacity-40" />

            <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-olive-200/60 bg-white shadow-lift sm:rounded-[2.5rem]">
                <div className="grid min-h-[640px] lg:grid-cols-12">
                    {/* Left brand panel */}
                    <aside className="relative hidden overflow-hidden bg-olive-950 text-white lg:col-span-5 lg:block">
                        <div
                            className="absolute inset-0 opacity-[0.18]"
                            style={{
                                backgroundImage:
                                    "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23a8e190' stroke-width='1.2'%3E%3Cpath d='M20 60c8-18 16-28 24-36 6 8 12 20 16 36'/%3E%3Cpath d='M8 55c10-14 18-22 28-30'/%3E%3Cpath d='M48 62c6-12 12-20 20-28'/%3E%3C/g%3E%3C/svg%3E\")",
                            }}
                        />
                        <div
                            className="absolute inset-0 opacity-70"
                            style={{
                                backgroundImage:
                                    'radial-gradient(ellipse at 30% 20%, rgba(242,184,46,0.28), transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(168,225,144,0.18), transparent 45%)',
                            }}
                        />

                        <div className="relative z-10 flex h-full flex-col justify-center px-10 py-14 xl:px-12">
                            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-mustard">
                                My dashboard
                            </p>
                            <h1 className="mt-4 font-display text-4xl font-semibold uppercase leading-tight tracking-wide text-white xl:text-5xl">
                                Admin
                                <br />
                                Login
                            </h1>
                            <p className="mt-6 max-w-xs text-base leading-relaxed text-olive-200">
                                Manage listings, stories, categories, and site
                                surfaces for Nanyuki Now.
                            </p>
                        </div>

                        {/* Curved edge into the form panel */}
                        <svg
                            className="pointer-events-none absolute inset-y-0 -right-px h-full w-16 text-olive-50 xl:w-20"
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

                    {/* Right form panel */}
                    <section className="relative flex flex-col justify-center bg-olive-50 px-6 py-10 sm:px-10 lg:col-span-7 lg:px-14 xl:px-16">
                        <div className="mx-auto w-full max-w-md text-center">
                            <img
                                src="/images/logo.png"
                                alt="Nanyuki Now"
                                width={969}
                                height={542}
                                decoding="async"
                                className="mx-auto h-16 w-auto object-contain mix-blend-multiply sm:h-20"
                            />

                            <h2 className="mt-8 font-display text-3xl font-semibold uppercase tracking-wide text-olive-950 sm:text-4xl">
                                Welcome back!
                            </h2>
                            <p className="mt-2 text-base text-olive-600">
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
                                        className="w-full rounded-md border border-olive-300 bg-white px-4 py-3.5 text-base text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-mustard focus:ring-2 focus:ring-mustard/30"
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
                                            className="w-full rounded-md border border-olive-300 bg-white px-4 py-3.5 pr-12 text-base text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-mustard focus:ring-2 focus:ring-mustard/30"
                                            placeholder="Password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-olive-400 hover:text-olive-700"
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
                                    <label className="inline-flex items-center gap-2 text-olive-700">
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
                                        className="font-medium text-olive-700 underline-offset-2 hover:text-olive-950 hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="mt-2 w-full rounded-md bg-mustard px-4 py-3.5 text-base font-bold uppercase tracking-wide text-earth-dusk transition hover:bg-mustard-soft disabled:opacity-60"
                                >
                                    {processing ? 'Signing in…' : 'Login'}
                                </button>
                            </form>

                            <p className="mt-8 text-xs leading-relaxed text-olive-500">
                                Protected operator access for Nanyuki Now. By signing in you
                                agree to use this area only for authorized directory management.
                                See our{' '}
                                <Link href={route('privacy')} className="underline underline-offset-2 hover:text-olive-800">
                                    Privacy Policy
                                </Link>{' '}
                                and{' '}
                                <Link href={route('terms')} className="underline underline-offset-2 hover:text-olive-800">
                                    Terms
                                </Link>
                                .
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
