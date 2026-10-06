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
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
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
        'Valid email',
    );
    const passwordFeedback = fieldFeedback(
        data.password,
        validatePassword,
        errors.password,
        'Strong enough',
    );
    const passwordConfirmFeedback = fieldFeedback(
        data.password_confirmation,
        (value) => validatePasswordConfirm(value, data.password),
        errors.password_confirmation,
        'Passwords match',
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
        <AuthSplitLayout title="Reset password" variant="centered">
            <Link
                href={route('login')}
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/85 transition hover:text-mustard"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
            </Link>

            <div className="mb-6">
                <h1 className="font-display text-[1.85rem] font-semibold tracking-tight text-white sm:text-3xl">
                    Reset password
                </h1>
                <p className="mt-1.5 text-[15px] text-white/80">
                    Choose a new password for your account.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <AuthField
                    id="email"
                    label="Email"
                    type="email"
                    tone="glass"
                    value={data.email}
                    onChange={(e) => {
                        clearErrors('email');
                        setData('email', e.target.value);
                    }}
                    error={emailFeedback.error}
                    success={emailFeedback.success}
                    showSuccessMessage={false}
                    autoComplete="username"
                />
                <AuthField
                    id="password"
                    label="New password"
                    hint="(min. 8 char)"
                    type={showPassword ? 'text' : 'password'}
                    tone="glass"
                    value={data.password}
                    onChange={(e) => {
                        clearErrors('password', 'password_confirmation');
                        setData('password', e.target.value);
                    }}
                    error={passwordFeedback.error}
                    success={passwordFeedback.success}
                    showSuccessMessage={false}
                    autoComplete="new-password"
                    trailing={
                        <PasswordToggle
                            tone="glass"
                            show={showPassword}
                            onToggle={() => setShowPassword((v) => !v)}
                        />
                    }
                />
                <AuthField
                    id="password_confirmation"
                    label="Confirm password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    tone="glass"
                    value={data.password_confirmation}
                    onChange={(e) => {
                        clearErrors('password_confirmation');
                        setData('password_confirmation', e.target.value);
                    }}
                    error={passwordConfirmFeedback.error}
                    success={passwordConfirmFeedback.success}
                    showSuccessMessage={false}
                    autoComplete="new-password"
                    trailing={
                        <PasswordToggle
                            tone="glass"
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
                    className="mt-1 w-full rounded-xl bg-mustard px-4 py-3.5 text-[15px] font-semibold text-earth-dusk transition hover:bg-mustard-soft disabled:cursor-not-allowed disabled:opacity-55"
                >
                    {processing ? 'Updating…' : 'Reset password'}
                </button>
            </form>
        </AuthSplitLayout>
    );
}
