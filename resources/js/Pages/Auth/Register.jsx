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
    MIN_PASSWORD,
    validateEmail,
    validateName,
    validatePassword,
    validatePasswordConfirm,
    validateUsername,
} from '@/Components/auth/authHelpers';
import { Link, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // idle | checking | available | taken
    const [emailAvailability, setEmailAvailability] = useState('idle');
    const emailCheckAbortRef = useRef(null);

    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm({
            name: '',
            username: '',
            email: '',
            password: '',
            password_confirmation: '',
        });

    useEffect(() => {
        const email = data.email.trim();
        if (!email || validateEmail(email) !== true) {
            setEmailAvailability('idle');
            return undefined;
        }

        if (emailCheckAbortRef.current) {
            emailCheckAbortRef.current.abort();
        }

        const controller = new AbortController();
        emailCheckAbortRef.current = controller;
        setEmailAvailability('checking');

        const timer = window.setTimeout(async () => {
            try {
                const response = await fetch(
                    route('register.check-email', { email }),
                    {
                        headers: { Accept: 'application/json' },
                        credentials: 'same-origin',
                        signal: controller.signal,
                    },
                );
                if (!response.ok) {
                    throw new Error('Email check failed');
                }
                const payload = await response.json();
                if (controller.signal.aborted) return;
                setEmailAvailability(
                    payload.available === false ? 'taken' : 'available',
                );
            } catch (err) {
                if (err?.name === 'AbortError') return;
                if (!controller.signal.aborted) {
                    setEmailAvailability('idle');
                }
            }
        }, 350);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [data.email]);

    const nameFeedback = fieldFeedback(
        data.name,
        validateName,
        errors.name,
        'Name looks good',
    );
    const usernameFeedback = fieldFeedback(
        data.username,
        validateUsername,
        errors.username,
        'Username looks good',
    );
    const serverEmailTaken =
        typeof errors.email === 'string' &&
        /already registered|already been taken/i.test(errors.email);
    const emailIsTaken = emailAvailability === 'taken' || serverEmailTaken;

    const emailFormatFeedback = fieldFeedback(
        data.email,
        validateEmail,
        emailIsTaken ? null : errors.email,
        emailAvailability === 'available' ? 'Email is available' : 'Valid email',
    );
    const emailFeedback = emailIsTaken
        ? {
              error: (
                  <>
                      This email is already registered.{' '}
                      <Link
                          href={route('login')}
                          className="font-semibold underline underline-offset-2 hover:text-red-800"
                      >
                          Sign in
                      </Link>{' '}
                      instead.
                  </>
              ),
              success: null,
          }
        : emailAvailability === 'checking' &&
            validateEmail(data.email) === true
          ? { error: null, success: null }
          : emailFormatFeedback;

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

    const registerValid =
        validateName(data.name) === true &&
        validateUsername(data.username) === true &&
        validateEmail(data.email) === true &&
        !emailIsTaken &&
        emailAvailability !== 'checking' &&
        validatePassword(data.password) === true &&
        validatePasswordConfirm(data.password_confirmation, data.password) ===
            true;

    const submit = (e) => {
        e.preventDefault();
        if (!registerValid) return;
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthSplitLayout
            title="Join"
            variant="brand"
            panelTitle="Create your Nanyuki Now account"
            panelBody="Join locals and visitors discovering where to eat, stay, and explore across town."
        >
            <div className="mb-7">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-earth-dusk sm:text-[1.85rem]">
                    Join Nanyuki Now
                </h2>
                <p className="mt-2 text-sm text-olive-600">
                    Already have an account?{' '}
                    <Link
                        href={route('login')}
                        className="font-semibold text-olive-800 underline underline-offset-2 hover:text-olive-950"
                    >
                        Sign in
                    </Link>
                </p>
            </div>

            <GoogleContinueButton />
            <AuthOrDivider />

            <form onSubmit={submit} className="space-y-4">
                <AuthField
                    id="name"
                    label="Full name"
                    value={data.name}
                    onChange={(e) => {
                        clearErrors('name');
                        setData('name', e.target.value);
                    }}
                    error={nameFeedback.error}
                    success={nameFeedback.success}
                    autoComplete="name"
                />
                <AuthField
                    id="username"
                    label="Username"
                    hint="(letters, numbers, underscores)"
                    value={data.username}
                    onChange={(e) => {
                        clearErrors('username');
                        setData(
                            'username',
                            e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9_-]/g, ''),
                        );
                    }}
                    error={usernameFeedback.error}
                    success={usernameFeedback.success}
                    autoComplete="username"
                />
                <AuthField
                    id="email"
                    label="Email"
                    type="email"
                    value={data.email}
                    onChange={(e) => {
                        clearErrors('email');
                        setEmailAvailability('idle');
                        setData('email', e.target.value);
                    }}
                    error={emailFeedback.error}
                    success={emailFeedback.success}
                    autoComplete="email"
                />
                {emailAvailability === 'checking' &&
                validateEmail(data.email) === true &&
                !emailIsTaken ? (
                    <p className="-mt-2 text-xs text-olive-500">
                        Checking if this email is free…
                    </p>
                ) : null}
                <AuthField
                    id="password"
                    label="Password"
                    hint={`(min. ${MIN_PASSWORD} char)`}
                    type={showPassword ? 'text' : 'password'}
                    value={data.password}
                    onChange={(e) => {
                        clearErrors('password', 'password_confirmation');
                        setData('password', e.target.value);
                    }}
                    error={passwordFeedback.error}
                    success={passwordFeedback.success}
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
                    success={passwordConfirmFeedback.success}
                    autoComplete="new-password"
                    trailing={
                        <PasswordToggle
                            show={showConfirmPassword}
                            onToggle={() => setShowConfirmPassword((v) => !v)}
                        />
                    }
                />

                <button
                    type="submit"
                    disabled={processing || !registerValid}
                    className="mt-1 w-full rounded-lg bg-olive-900 px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-olive-950 disabled:cursor-not-allowed disabled:opacity-55"
                >
                    {processing ? 'Creating account…' : 'Join'}
                </button>
            </form>

            <AuthLegalNote />
        </AuthSplitLayout>
    );
}
