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
import RecaptchaField from '@/Components/listing/RecaptchaField';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { flash } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaError, setCaptchaError] = useState('');
    const {
        data,
        setData,
        post,
        processing,
        errors,
        clearErrors,
        reset,
        transform,
    } = useForm({
        login: '',
        password: '',
        remember: true,
        'g-recaptcha-response': '',
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
        validateLoginPassword(data.password) === true &&
        Boolean(captchaToken);

    const submit = (e) => {
        e.preventDefault();
        if (!captchaToken) {
            setCaptchaError('Please complete the security check.');
            return;
        }
        if (!loginValid) return;
        setCaptchaError('');
        transform((form) => ({
            ...form,
            'g-recaptcha-response': captchaToken,
        }));
        post(route('login'), {
            onFinish: () => {
                transform((form) => form);
                reset('password');
            },
        });
    };

    return (
        <AuthSplitLayout
            title="Login"
            variant="brand"
            panelTitle="Welcome back to Nanyuki Now"
            panelBody="Sign in to manage your listings, messages, and plan."
        >
            <div className="mb-7 text-center">
                <h2 className="font-display text-3xl font-semibold tracking-tight text-earth-dusk sm:text-4xl">
                    Welcome back
                </h2>
                <p className="mt-2.5 text-[15px] text-olive-600">
                    Don&apos;t have an account?{' '}
                    <Link
                        href={route('register')}
                        className="font-semibold text-olive-800 underline underline-offset-2 hover:text-olive-950"
                    >
                        Get started
                    </Link>
                </p>
            </div>

            {(status || flash?.status) && (
                <div className="mb-4 border border-emerald-600/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {status || flash?.status}
                </div>
            )}

            {errors.suggest_register ? (
                <div
                    className="mb-4 border border-mustard/50 bg-mustard/10 px-4 py-3 text-sm text-earth-dusk"
                    role="alert"
                >
                    <p className="font-semibold">No account found</p>
                    <p className="mt-1 text-olive-700">
                        {errors.suggest_register}{' '}
                        <Link
                            href={route('register')}
                            className="font-semibold text-olive-900 underline underline-offset-2 hover:text-olive-950"
                        >
                            Get started
                        </Link>
                    </p>
                </div>
            ) : null}

            <GoogleContinueButton />
            <AuthOrDivider label="or" />

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
                    autoComplete="current-password"
                    trailing={
                        <PasswordToggle
                            show={showPassword}
                            onToggle={() => setShowPassword((v) => !v)}
                        />
                    }
                />

                <div className="flex items-center justify-between gap-3 pt-0.5">
                    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-olive-700">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                            className="h-4 w-4 border-olive-900/30 text-mustard focus:ring-0 focus:ring-offset-0"
                        />
                        Remember me
                    </label>
                    {canResetPassword ? (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-olive-700 underline underline-offset-2 hover:text-olive-950"
                        >
                            Forgot password?
                        </Link>
                    ) : null}
                </div>

                <RecaptchaField
                    value={captchaToken}
                    onChange={(token) => {
                        setCaptchaToken(token);
                        setCaptchaError('');
                        clearErrors('g-recaptcha-response');
                        setData('g-recaptcha-response', token);
                    }}
                    error={
                        captchaError || errors['g-recaptcha-response'] || ''
                    }
                />

                <button
                    type="submit"
                    disabled={processing || !loginValid}
                    className="w-full border border-mustard bg-mustard px-4 py-3.5 text-[15px] font-semibold text-earth-dusk transition hover:border-olive-900 hover:bg-olive-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-mustard disabled:hover:bg-mustard disabled:hover:text-earth-dusk"
                >
                    {processing ? 'Signing in…' : 'Sign in'}
                </button>
            </form>

            <AuthLegalNote />
        </AuthSplitLayout>
    );
}
