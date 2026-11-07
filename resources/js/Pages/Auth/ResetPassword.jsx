import AuthSplitLayout from '@/Components/auth/AuthSplitLayout';
import {
    AuthField,
    PasswordToggle,
} from '@/Components/auth/AuthField';
import {
    fieldFeedback,
    validateEmail,
    validatePassword,
    validatePasswordConfirm,
} from '@/Components/auth/authHelpers';
import { BackMark } from '@/Components/site/Mark';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function ResetPassword({ token, email }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm({
            token,
            email: email || '',
            password: '',
            password_confirmation: '',
        });

    const emailFeedback = fieldFeedback(
        data.email,
        validateEmail,
        errors.email,
    );
    const passwordFeedback = fieldFeedback(
        data.password,
        validatePassword,
        errors.password,
    );
    const passwordConfirmFeedback = fieldFeedback(
        data.password_confirmation,
        (value) => validatePasswordConfirm(value, data.password),
        errors.password_confirmation,
    );

    const formValid =
        validateEmail(data.email) === true &&
        validatePassword(data.password) === true &&
        validatePasswordConfirm(data.password_confirmation, data.password) ===
            true;

    const submit = (e) => {
        e.preventDefault();
        if (!formValid) return;
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthSplitLayout
            title="Reset password"
            variant="brand"
            panelTitle="Choose a new password"
            panelBody="Pick something strong and unique for your Nanyuki Now account."
        >
            <div className="mb-7 text-center">
                <Link
                    href={route('login')}
                    className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-olive-700 transition hover:text-olive-950"
                >
                    <BackMark className="h-3.5 w-3.5" />
                    Back to sign in
                </Link>
                <h2 className="font-display text-3xl font-semibold tracking-tight text-earth-dusk sm:text-4xl">
                    Reset password
                </h2>
                <p className="mt-2.5 text-[15px] text-olive-600">
                    Choose a new password for your account.
                </p>
            </div>

            <form onSubmit={submit} className="mx-auto max-w-md space-y-4">
                <AuthField
                    id="email"
                    label="Email"
                    type="email"
                    value={data.email}
                    onChange={(e) => {
                        clearErrors('email');
                        setData('email', e.target.value);
                    }}
                    error={emailFeedback.error}
                    autoComplete="username"
                />
                <AuthField
                    id="password"
                    label="New password"
                    type={showPassword ? 'text' : 'password'}
                    value={data.password}
                    onChange={(e) => {
                        clearErrors('password', 'password_confirmation');
                        setData('password', e.target.value);
                    }}
                    error={passwordFeedback.error}
                    autoComplete="new-password"
                    trailing={
                        <PasswordToggle
                            show={showPassword}
                            onToggle={() => setShowPassword((v) => !v)}
                        />
                    }
                />
                <AuthField
                    id="password_confirmation"
                    label="Confirm password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={data.password_confirmation}
                    onChange={(e) => {
                        clearErrors('password_confirmation');
                        setData('password_confirmation', e.target.value);
                    }}
                    error={passwordConfirmFeedback.error}
                    autoComplete="new-password"
                    trailing={
                        <PasswordToggle
                            show={showConfirmPassword}
                            onToggle={() =>
                                setShowConfirmPassword((v) => !v)
                            }
                        />
                    }
                />

                <button
                    type="submit"
                    disabled={processing || !formValid}
                    className="w-full border border-mustard bg-mustard px-4 py-3.5 text-[15px] font-semibold text-earth-dusk transition hover:border-olive-900 hover:bg-olive-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
                >
                    {processing ? 'Updating…' : 'Reset password'}
                </button>
            </form>
        </AuthSplitLayout>
    );
}
