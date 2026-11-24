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
    validateEmail,
    validateFirstName,
    validateLastName,
    validatePassword,
    validatePasswordConfirm,
    validateUsername,
} from '@/Components/auth/authHelpers';
import RecaptchaField from '@/Components/listing/RecaptchaField';
import { Link, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaError, setCaptchaError] = useState('');
    // idle | checking | available | taken
    const [emailAvailability, setEmailAvailability] = useState('idle');
    const emailCheckAbortRef = useRef(null);

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
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        'g-recaptcha-response': '',
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

    const firstNameFeedback = fieldFeedback(
        data.first_name,
        validateFirstName,
        errors.first_name,
        'Looks good',
    );
    const lastNameFeedback = fieldFeedback(
        data.last_name,
        validateLastName,
        errors.last_name,
        'Looks good',
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
        validateFirstName(data.first_name) === true &&
        validateLastName(data.last_name) === true &&
        validateUsername(data.username) === true &&
        validateEmail(data.email) === true &&
        !emailIsTaken &&
        emailAvailability !== 'checking' &&
        validatePassword(data.password) === true &&
        validatePasswordConfirm(data.password_confirmation, data.password) ===
            true &&
        Boolean(captchaToken);

    const submit = (e) => {
        e.preventDefault();
        if (!captchaToken) {
            setCaptchaError('Please complete the security check.');
            return;
        }
        if (!registerValid) return;
        setCaptchaError('');
        transform((form) => ({
            ...form,
            'g-recaptcha-response': captchaToken,
        }));
        post(route('register'), {
            onFinish: () => {
                transform((form) => form);
                reset('password', 'password_confirmation');
            },
        });
    };

    return (
        <AuthSplitLayout
            title="Join"
            variant="brand"
            panelTitle="Create your Nanyuki Now account"
            panelBody="Join locals and visitors discovering where to eat, stay, and explore across town."
        >
            <div className="mb-7 text-center">
                <h2 className="font-display text-3xl font-bold tracking-tight text-earth-dusk sm:text-4xl">
                    Join Nanyuki Now
                </h2>
                <p className="mt-2.5 text-[15px] text-olive-600">
                    Already have an account?{' '}
                    <Link
                        href={route('login')}
                        className="font-semibold text-olive-800 underline underline-offset-2 hover:text-olive-950"
                    >
                        Sign in
                    </Link>
                </p>
            </div>

            <GoogleContinueButton intent="register" />
            <AuthOrDivider />

            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-5">
                    <AuthField
                        id="first_name"
                        label="First name"
                        value={data.first_name}
                        onChange={(e) => {
                            clearErrors('first_name');
                            setData('first_name', e.target.value);
                        }}
                        error={firstNameFeedback.error}
                        success={firstNameFeedback.success}
                        autoComplete="given-name"
                    />
                    <AuthField
                        id="last_name"
                        label="Last name"
                        value={data.last_name}
                        onChange={(e) => {
                            clearErrors('last_name');
                            setData('last_name', e.target.value);
                        }}
                        error={lastNameFeedback.error}
                        success={lastNameFeedback.success}
                        autoComplete="family-name"
                    />
                    <div className="min-w-0">
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
                            <p className="mt-1 text-xs text-olive-500">
                                Checking if this email is free…
                            </p>
                        ) : null}
                    </div>
                    <AuthField
                        id="username"
                        label="Username"
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
                        id="password"
                        label="Password"
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
                                onToggle={() =>
                                    setShowConfirmPassword((v) => !v)
                                }
                            />
                        }
                    />
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
                    disabled={processing || !registerValid}
                    className="w-full border border-olive-900 bg-olive-900 px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-olive-950 disabled:cursor-not-allowed disabled:opacity-55"
                >
                    {processing ? 'Creating account…' : 'Join'}
                </button>
            </form>

            <AuthLegalNote />
        </AuthSplitLayout>
    );
}
