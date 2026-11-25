import { useMemo, useState } from 'react';
import axios from 'axios';
import Reveal from './Reveal';
import { showSuccessToast } from './SuccessToast';

const EMAIL_RE =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

function validateEmail(value) {
    const raw = String(value ?? '');
    const trimmed = raw.trim();
    if (!trimmed) return 'Email is required.';
    if (/\s/.test(raw)) return 'Email can’t contain spaces.';
    if (!trimmed.includes('@')) return 'Include an @ in the email address.';
    if (!EMAIL_RE.test(trimmed)) {
        return 'Enter a valid email address (e.g. you@email.com).';
    }
    return '';
}

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [touched, setTouched] = useState(false);
    const [sending, setSending] = useState(false);
    const [formError, setFormError] = useState('');

    const emailError = useMemo(() => validateEmail(email), [email]);
    const showError = touched ? emailError : '';

    const onSubmit = async (e) => {
        e.preventDefault();
        setTouched(true);
        setFormError('');

        if (emailError) {
            setFormError(emailError);
            return;
        }
        if (sending) return;

        setSending(true);
        try {
            const { data } = await axios.post(
                route('newsletter.subscribe'),
                { email: email.trim() },
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            setEmail('');
            setTouched(false);
            showSuccessToast(
                data?.message || 'You’re subscribed. Welcome to Nanyuki Insider.',
            );
        } catch (err) {
            const message =
                err?.response?.data?.errors?.email?.[0] ||
                err?.response?.data?.message ||
                'Could not subscribe. Please try again.';
            setFormError(message);
        } finally {
            setSending(false);
        }
    };

    return (
        <section
            id="contact"
            className="relative z-10 bg-[#f3f5f7] py-14 sm:py-16 lg:py-20"
        >
            <div className="mx-auto max-w-site px-4 sm:px-6">
                <Reveal>
                    <div className="rounded-xl border border-olive-200/90 bg-white p-6 sm:p-8 lg:p-10">
                        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] lg:items-end lg:gap-12">
                            <div className="max-w-xl">
                                <h2 className="font-display text-3xl font-semibold tracking-tight text-earth-dusk sm:text-4xl">
                                    Nanyuki Insider
                                </h2>
                                <p className="mt-3 text-sm leading-relaxed text-olive-700 sm:text-base sm:leading-7">
                                    Weekend hotel offers, new menus, and service
                                    updates around town. One email, when it
                                    matters.
                                </p>
                            </div>

                            <form
                                onSubmit={onSubmit}
                                className="w-full"
                                noValidate
                            >
                                <label
                                    htmlFor="newsletter-email"
                                    className="mb-1.5 block text-sm font-medium text-earth-dusk"
                                >
                                    Email address
                                </label>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                                    <input
                                        id="newsletter-email"
                                        type="text"
                                        inputMode="email"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        spellCheck={false}
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setTouched(true);
                                            if (formError) setFormError('');
                                        }}
                                        onBlur={() => setTouched(true)}
                                        placeholder="you@email.com"
                                        aria-invalid={Boolean(showError)}
                                        aria-describedby={
                                            showError
                                                ? 'newsletter-email-error'
                                                : undefined
                                        }
                                        className={`min-w-0 flex-1 rounded-md border px-3.5 py-3 text-sm text-earth-dusk placeholder:text-olive-400 focus:outline-none focus:ring-1 ${
                                            showError
                                                ? 'border-red-400 bg-red-50/80 focus:border-red-500 focus:ring-red-500'
                                                : 'border-olive-200 bg-[#f7f6f2] focus:border-olive-400 focus:ring-olive-400'
                                        }`}
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="inline-flex shrink-0 items-center justify-center rounded-md bg-olive-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-olive-900 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {sending ? 'Subscribing…' : 'Subscribe'}
                                    </button>
                                </div>
                                {showError ? (
                                    <p
                                        id="newsletter-email-error"
                                        className="mt-2 text-xs font-medium text-red-600"
                                        role="alert"
                                    >
                                        {showError}
                                    </p>
                                ) : null}
                                {formError && formError !== showError ? (
                                    <p className="mt-2 text-sm font-medium text-red-600">
                                        {formError}
                                    </p>
                                ) : null}
                            </form>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
