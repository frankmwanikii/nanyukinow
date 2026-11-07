import AuthSplitLayout from '@/Components/auth/AuthSplitLayout';
import {
    AuthField,
    AuthLegalNote,
    AuthOrDivider,
    GoogleContinueButton,
    PasswordToggle,
} from '@/Components/auth/AuthField';
import {
    fieldFeedback,
    validateLoginIdentifier,
    validateLoginPassword,
} from '@/Components/auth/authHelpers';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { flash } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
    const {
        data,
        setData,
        post,
        processing,
        errors,
        clearErrors,
        reset,
    } = useForm({
        login: '',
        password: '',
        remember: true,
    });

    const loginIdFeedback = fieldFeedback(
        data.login,
        validateLoginIdentifier,
        errors.login,
    );
    const loginPasswordFeedback = fieldFeedback(
        data.password,
        validateLoginPassword,
        errors.password,
    );

    const loginValid =
        validateLoginIdentifier(data.login) === true &&
        validateLoginPassword(data.password) === true;

    const submit = (e) => {
        e.preventDefault();
        if (!loginValid) return;
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthSplitLayout title="Login" variant="centered">
            <div className="mb-6 text-center">
                <h1 className="font-display text-[1.85rem] font-semibold tracking-tight text-white sm:text-3xl">
                    Welcome back
                </h1>
                <p className="mt-2 text-[15px] text-white/80">
                    Please enter your details.
                </p>
            </div>

            {(status || flash?.status) && (
                <div className="mb-4 rounded-xl border border-mint/40 bg-mint/15 px-4 py-3 text-sm text-mint-soft">
                    {status || flash?.status}
                </div>
            )}

            {errors.suggest_register ? (
                <div
                    className="mb-4 rounded-xl border border-mustard/40 bg-mustard/15 px-4 py-3 text-sm text-white"
                    role="alert"
                >
                    <p className="font-semibold">No account found</p>
                    <p className="mt-1 text-white/85">
                        {errors.suggest_register}{' '}
                        <Link
                            href={route('register')}
                            className="font-semibold text-mustard underline underline-offset-2 transition hover:text-mustard-soft"
                        >
                            Join now
                        </Link>
                    </p>
                </div>
            ) : null}

            <form onSubmit={submit} className="space-y-4">
                <AuthField
                    id="login"
                    label="Email or username"
                    type="text"
                    tone="glass"
                    value={data.login}
                    onChange={(e) => {
                        clearErrors('login', 'suggest_register');
                        setData('login', e.target.value);
                    }}
                    error={
                        errors.suggest_register
                            ? null
                            : loginIdFeedback.error
                    }
                    autoComplete="username"
                />
                <AuthField
                    id="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    tone="glass"
                    value={data.password}
                    onChange={(e) => {
                        clearErrors('password');
                        setData('password', e.target.value);
                    }}
                    error={loginPasswordFeedback.error}
                    autoComplete="current-password"
                    trailing={
                        <PasswordToggle
                            tone="glass"
                            show={showPassword}
                            onToggle={() => setShowPassword((v) => !v)}
                        />
                    }
                />

                <div className="flex items-center justify-between gap-3 pt-0.5">
                    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-white/85">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                            className="h-4 w-4 rounded border-white/40 bg-olive-950/60 text-mustard focus:ring-mustard/50"
                        />
                        Remember me
                    </label>
                    {canResetPassword ? (
                        <Link
                            href={route('password.request')}
                            className="text-[13px] font-medium text-mustard/90 transition hover:text-mustard-soft"
                        >
                            Forgot password?
                        </Link>
                    ) : null}
                </div>

                <button
                    type="submit"
                    disabled={processing || !loginValid}
                    className="w-full rounded-xl bg-mustard px-4 py-3.5 text-[15px] font-semibold tracking-tight text-earth-dusk transition hover:bg-mustard-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-mustard"
                >
                    {processing ? 'Signing in…' : 'Login'}
                </button>
            </form>

            <AuthOrDivider dense tone="glass" label="or sign in with" />

            <GoogleContinueButton tone="glass" />

            <p className="mt-5 text-center text-sm text-white/75">
                Don&apos;t have an account?{' '}
                <Link
                    href={route('register')}
                    className="font-semibold text-mustard underline decoration-mustard/40 underline-offset-4 transition hover:text-mustard-soft hover:decoration-mustard-soft"
                >
                    Join
                </Link>
            </p>

            <AuthLegalNote dense tone="glass" />
        </AuthSplitLayout>
    );
}
