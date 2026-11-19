import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from '@/Components/site/LucideCompat';
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
        <div className="min-h-screen w-full overflow-hidden bg-olive-50">
            <Head title="Admin sign in" />

            <div className="grid min-h-screen w-full lg:grid-cols-12">
                <aside className="relative hidden min-h-screen overflow-hidden bg-olive-950 lg:col-span-7 lg:block">
                    <img
                        src="/images/hero/slide-2.webp"
                        alt="Nanyuki Now. Your city, right now"
                        className="absolute inset-0 h-full w-full object-cover"
                        decoding="async"
                    />
                    <div className="absolute inset-0 bg-olive-950/25" aria-hidden />
                    <div className="absolute inset-y-0 right-0 w-px bg-olive-50" aria-hidden />
                </aside>

                <section className="relative flex min-h-screen flex-col justify-center bg-olive-50 px-6 py-12 sm:px-10 lg:col-span-5 lg:px-10 xl:px-14">
                    <div className="relative mx-auto w-full max-w-md">
                        <img
                            src="/images/logo.png"
                            alt="Nanyuki Now"
                            width={969}
                            height={542}
                            decoding="async"
                            className="h-12 w-auto object-contain mix-blend-multiply sm:h-14"
                        />

                        <h1 className="mt-8 font-display text-2xl font-semibold tracking-tight text-olive-950 sm:text-3xl">
                            Admin sign in
                        </h1>
                        <p className="mt-1.5 text-sm text-olive-600">
                            Use your staff email or username to continue.
                        </p>

                        {status && (
                            <div className="mt-6 border border-olive-200 bg-white px-3 py-2 text-sm text-olive-900">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="mt-8 space-y-4">
                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-olive-600">
                                    Email or username
                                </span>
                                <input
                                    type="text"
                                    value={data.login}
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) => setData('login', e.target.value)}
                                    className="w-full rounded-md border border-olive-200 bg-white px-3 py-2.5 text-sm text-olive-950 outline-none transition placeholder:text-olive-400 focus:border-olive-600 focus:ring-1 focus:ring-olive-600/30"
                                    placeholder="Email or username"
                                />
                                {errors.login && (
                                    <span className="mt-1.5 block text-sm text-rose-600">
                                        {errors.login}
                                    </span>
                                )}
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-olive-600">
                                    Password
                                </span>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full rounded-md border border-olive-200 bg-white px-3 py-2.5 pr-12 text-sm text-olive-950 outline-none transition placeholder:text-olive-400 focus:border-olive-600 focus:ring-1 focus:ring-olive-600/30"
                                        placeholder="Password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-olive-500 hover:bg-olive-100 hover:text-olive-800"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label="Toggle password"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                                        ) : (
                                            <Eye className="h-4 w-4" strokeWidth={1.5} />
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
                                    Keep me signed in
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
                                className="mt-2 w-full rounded-md bg-mustard px-4 py-2.5 text-sm font-semibold text-earth-dusk transition hover:bg-mustard-deep disabled:opacity-60"
                            >
                                {processing ? 'Signing in…' : 'Sign in'}
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    );
}
