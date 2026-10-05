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
    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm({
            login: '',
            password: '',
            remember: true,
        });

    const loginIdFeedback = fieldFeedback(
        data.login,
        validateLoginIdentifier,
        errors.login,
        data.login.includes('@') ? 'Valid email' : 'Username looks good',
    );
    const loginPasswordFeedback = fieldFeedback(
        data.password,
        validateLoginPassword,
        errors.password,
        'Password entered',
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
                <h1 className="font-display text-[1.85rem] font-semibold tracking-tight text-earth-dusk sm:text-3xl">
                    Login
                </h1>
                <p className="mt-1.5 text-[15px] text-olive-600">Welcome back.</p>
            </div>

            {(status || flash?.status) && (
                <div className="mb-5 rounded-xl border border-mint/40 bg-mint/15 px-4 py-3 text-sm text-olive-800">
                    {status || flash?.status}
                </div>
            )}

            {errors.suggest_register ? (
                <div
                    className="mb-5 rounded-xl border border-mustard/40 bg-mustard/15 px-4 py-3.5 text-sm text-olive-900"
                    role="alert"
                >
                    <p className="font-semibold">No account found</p>
                    <p className="mt-1 text-olive-800/90">
                        {errors.suggest_register}{' '}
                        <Link
                            href={route('register')}
                            className="font-semibold underline underline-offset-2 transition hover:text-mustard"
                        >
                            Join now
                        </Link>
                    </p>
                </div>
            ) : null}

            <GoogleContinueButton />
            <AuthOrDivider />

            <form onSubmit={submit} className="space-y-4">
                <AuthField
                    id="login"
                    label="Email or username"
                    type="text"
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
                    success={
                        errors.suggest_register
                            ? null
                            : loginIdFeedback.success
                    }
                    autoComplete="username"
                />
                <AuthField
                    id="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={data.password}
                    onChange={(e) => {
                        clearErrors('password');
                        setData('password', e.target.value);
                    }}
                    error={loginPasswordFeedback.error}
                    success={loginPasswordFeedback.success}
                    autoComplete="current-password"
                    labelAside={
                        canResetPassword ? (
                            <Link
                                href={route('password.request')}
                                className="text-[13px] font-medium text-olive-500 underline underline-offset-2 hover:text-olive-800"
                            >
                                Forgot your password?
                            </Link>
                        ) : null
                    }
                    trailing={
                        <PasswordToggle
                            show={showPassword}
                            onToggle={() => setShowPassword((v) => !v)}
                        />
                    }
                />

                <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-olive-700">
                    <input
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) =>
                            setData('remember', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-olive-300 text-olive-700 focus:ring-olive-600"
                    />
                    Remember me
                </label>

                <button
                    type="submit"
                    disabled={processing || !loginValid}
                    className="w-full rounded-lg bg-olive-900 px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-mustard hover:text-earth-dusk disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-olive-900 disabled:hover:text-white"
                >
                    {processing ? 'Signing in…' : 'Login'}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-olive-600">
                Don&apos;t have an account?{' '}
                <Link
                    href={route('register')}
                    className="font-semibold text-olive-900 underline underline-offset-2 transition hover:text-mustard hover:decoration-mustard"
                >
                    Join
                </Link>
            </p>

            <AuthLegalNote />
        </AuthSplitLayout>
    );
}
