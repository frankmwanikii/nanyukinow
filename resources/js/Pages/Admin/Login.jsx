import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
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
        <div className="relative min-h-screen overflow-hidden bg-olive-950 text-olive-50">
            <Head title="Admin sign in" />

            <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    backgroundImage:
                        'radial-gradient(ellipse at 20% 20%, rgba(242,184,46,0.22), transparent 45%), radial-gradient(ellipse at 80% 0%, rgba(168,225,144,0.12), transparent 40%), linear-gradient(160deg, #161911 0%, #2a2e23 45%, #1c1712 100%)',
                }}
            />
            <div className="pointer-events-none absolute inset-0 bg-grain opacity-60" />

            <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:px-8">
                <section className="hidden lg:block">
                    <p className="font-brand text-5xl tracking-tight text-mustard">
                        Nanyuki Now
                    </p>
                    <h1 className="mt-6 max-w-md font-display text-4xl leading-tight text-white">
                        Command center for your directory.
                    </h1>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-olive-200">
                        Manage listings, expiry dates, categories, stories, and site
                        surfaces — inspired by the depth of tools like{' '}
                        <a
                            href="https://mylistingtheme.com/"
                            className="text-mustard underline-offset-2 hover:underline"
                            target="_blank"
                            rel="noreferrer"
                        >
                            MyListing
                        </a>
                        .
                    </p>
                    <ul className="mt-10 space-y-3 text-sm text-olive-200">
                        {[
                            'Listing packages, priorities & expirations',
                            'Categories, stories & page content',
                            'Role-gated admin access only',
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-mustard" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="mx-auto w-full max-w-md">
                    <div className="mb-8 lg:hidden">
                        <p className="font-brand text-3xl text-mustard">Nanyuki Now</p>
                        <p className="mt-1 text-sm uppercase tracking-[0.2em] text-olive-300">
                            Admin
                        </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-lift backdrop-blur-md">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mustard/15 text-mustard">
                                <Lock className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-display text-2xl text-white">Sign in</h2>
                                <p className="text-sm text-olive-300">Authorized operators only</p>
                            </div>
                        </div>

                        {status && (
                            <div className="mb-4 rounded-xl border border-mustard/30 bg-mustard/10 px-3 py-2 text-sm text-mustard">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <label className="block">
                                <span className="mb-1.5 block text-xs uppercase tracking-wide text-olive-300">
                                    Email or username
                                </span>
                                <input
                                    type="text"
                                    value={data.login}
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) => setData('login', e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-olive-950/60 px-3 py-3 text-sm text-white outline-none ring-mustard/40 placeholder:text-olive-500 focus:border-mustard/50 focus:ring-2"
                                    placeholder="admin@nanyukinow.co.ke"
                                />
                                {errors.login && (
                                    <span className="mt-1 block text-xs text-red-300">{errors.login}</span>
                                )}
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-xs uppercase tracking-wide text-olive-300">
                                    Password
                                </span>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-olive-950/60 px-3 py-3 pr-11 text-sm text-white outline-none ring-mustard/40 focus:border-mustard/50 focus:ring-2"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-olive-400 hover:text-olive-200"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label="Toggle password"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <span className="mt-1 block text-xs text-red-300">{errors.password}</span>
                                )}
                            </label>

                            <label className="flex items-center gap-2 text-sm text-olive-300">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-olive-600 bg-olive-900 text-mustard focus:ring-mustard"
                                />
                                Keep me signed in on this device
                            </label>

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-2 w-full rounded-xl bg-mustard px-4 py-3 text-sm font-semibold text-earth-dusk transition hover:bg-mustard-soft disabled:opacity-60"
                            >
                                {processing ? 'Signing in…' : 'Enter dashboard'}
                            </button>
                        </form>
                    </div>

                    <p className="mt-6 text-center text-xs text-olive-400">
                        Protected area · {new Date().getFullYear()} Nanyuki Now
                    </p>
                </section>
            </div>
        </div>
    );
}
