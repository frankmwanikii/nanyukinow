import AuthSplitLayout from '@/Components/auth/AuthSplitLayout';
import {
    AuthField,
    AuthLegalNote,
    AuthOrDivider,
    GoogleContinueButton,
    PasskeyContinueButton,
    PasswordToggle,
} from '@/Components/auth/AuthField';
import PasskeyPromptModal from '@/Components/auth/PasskeyPromptModal';
import {
    fieldFeedback,
    validateLoginIdentifier,
    validateLoginPassword,
} from '@/Components/auth/authHelpers';
import RecaptchaField from '@/Components/listing/RecaptchaField';
import { Passkeys } from '@laravel/passkeys';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const ADD_PASSKEY_FLAG = 'nn_add_passkey';

function markAddPasskeyIntent() {
    try {
        sessionStorage.setItem(ADD_PASSKEY_FLAG, '1');
    } catch {
        // ignore
    }
}

async function checkPasskeyAvailability(loginValue) {
    const csrf =
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') || '';

    const response = await fetch(route('passkey.availability'), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrf,
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ login: loginValue }),
    });

    if (!response.ok) {
        return null;
    }

    const payload = await response.json();
    return payload?.status ?? null;
}

export default function Login({ status, canResetPassword }) {
    const { flash } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaError, setCaptchaError] = useState('');
    const [passkeyError, setPasskeyError] = useState('');
    const [passkeyBusy, setPasskeyBusy] = useState(false);
    const [prompt, setPrompt] = useState({ open: false, reason: 'missing' });
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

    const { isSupported: passkeySupported } = usePasskeyVerify({
        autofill: true,
        remember: () => data.remember,
        onSuccess: (response) => {
            setPasskeyError('');
            window.location.href =
                response?.redirect || route('account.index');
        },
        onError: () => {
            // Autofill dismissals stay quiet.
        },
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

    const closePrompt = () => setPrompt((p) => ({ ...p, open: false }));

    const focusPassword = () => {
        closePrompt();
        markAddPasskeyIntent();
        window.requestAnimationFrame(() => {
            document.getElementById('password')?.focus();
        });
    };

    const showFallbackPrompt = async () => {
        const loginValue = data.login.trim();

        if (validateLoginIdentifier(loginValue) === true) {
            try {
                const status = await checkPasskeyAvailability(loginValue);
                if (status === 'unknown') {
                    setPrompt({ open: true, reason: 'unknown' });
                    return;
                }
                if (status === 'missing') {
                    setPrompt({ open: true, reason: 'missing' });
                    return;
                }
            } catch {
                // Fall through to device prompt.
            }
        }

        setPrompt({ open: true, reason: 'not_on_device' });
    };

    const handlePasskeyClick = async () => {
        setPasskeyError('');
        setPasskeyBusy(true);

        try {
            // Discoverable passkey: browser / Touch ID identifies the account
            // immediately. No email required.
            const response = await Passkeys.verify({
                remember: data.remember,
            });

            window.location.href =
                response?.redirect || route('account.index');
        } catch (err) {
            if (err?.name === 'UserCancelledError') {
                return;
            }
            await showFallbackPrompt();
        } finally {
            setPasskeyBusy(false);
        }
    };

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

            <div className="space-y-3">
                <PasskeyContinueButton
                    onClick={handlePasskeyClick}
                    loading={passkeyBusy}
                    supported={passkeySupported}
                    loadingLabel="Waiting for Touch ID…"
                />
                <GoogleContinueButton />
            </div>

            {passkeyError ? (
                <p className="mt-3 text-sm text-rose-600" role="alert">
                    {passkeyError}
                </p>
            ) : null}

            <AuthOrDivider label="or use password" />

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
                    autoComplete="username webauthn"
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

            <PasskeyPromptModal
                open={prompt.open}
                reason={prompt.reason}
                onClose={closePrompt}
                onUsePassword={focusPassword}
                onGoogle={() => {
                    markAddPasskeyIntent();
                    window.location.href = route('auth.google');
                }}
                onRegister={() => {
                    window.location.href = route('register');
                }}
            />
        </AuthSplitLayout>
    );
}
