import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
                data?.message || 'You’re subscribed — welcome to Nanyuki Insider.',
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
            className="relative z-10 overflow-hidden bg-earth-sand py-16 sm:py-20 lg:py-24"
        >
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-2 bg-olive-600 sm:block lg:w-2.5" />

            <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                <Reveal>
                    <div className="mx-auto mb-10 max-w-xl text-center sm:mb-14">
                        <h2 className="font-display text-3xl font-semibold tracking-tight text-earth-dusk sm:text-4xl md:text-5xl">
                            Nanyuki Insider
                        </h2>
                        <div className="mx-auto mt-4 flex max-w-xs items-center gap-2 sm:mt-5">
                            <span className="flex gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-olive-600" />
                                <span className="h-1.5 w-1.5 rounded-full bg-olive-600" />
                                <span className="h-1.5 w-1.5 rounded-full bg-olive-600" />
                            </span>
                            <span className="h-px flex-1 bg-olive-600" />
                        </div>
                        <p className="mt-3 text-base text-olive-600 sm:text-lg">
                            Stay in the loop
                        </p>
                    </div>
                </Reveal>

                <Reveal delay={0.08}>
                    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12 xl:gap-16">
                        <div className="max-w-xl">
                            <h3 className="font-display text-3xl font-semibold tracking-tight text-earth-dusk sm:text-4xl md:text-[2.75rem] md:leading-tight">
                                Get the Latest
                            </h3>
                            <p className="mt-1 font-display text-2xl font-semibold text-olive-600 sm:text-3xl md:text-4xl">
                                Mambo kwa Ground
                            </p>
                            <p className="mt-5 text-sm leading-relaxed text-olive-800 sm:text-base sm:leading-7">
                                Be the first to know about weekend offers from
                                top hotels, new menus at local eateries, and
                                essential service updates in your area.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-olive-200/70 bg-white p-6 shadow-soft sm:p-8">
                            <h3 className="font-display text-xl font-semibold text-earth-dusk sm:text-2xl">
                                Join the list
                            </h3>
                            <p className="mt-1 text-sm text-olive-500">
                                Be the first to be in the know.
                            </p>
                            <div className="mt-4 h-px bg-olive-100" />

                            <form
                                onSubmit={onSubmit}
                                className="mt-6 space-y-5"
                                noValidate
                            >
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-semibold text-earth-dusk">
                                        Email address{' '}
                                        <span className="text-mustard">*</span>
                                    </span>
                                    <input
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
                                        className={`w-full rounded-xl border-0 px-4 py-3.5 text-sm text-earth-dusk ring-1 placeholder:text-olive-400 focus:ring-2 ${
                                            showError
                                                ? 'bg-red-50/80 ring-red-400 focus:ring-red-500'
                                                : 'bg-olive-50 ring-olive-200 focus:ring-mustard'
                                        }`}
                                    />
                                    {showError ? (
                                        <span
                                            className="mt-1.5 block text-xs font-medium text-red-600"
                                            role="alert"
                                        >
                                            {showError}
                                        </span>
                                    ) : (
                                        <span className="mt-1.5 block text-xs text-olive-500">
                                            Example: you@email.com
                                        </span>
                                    )}
                                </label>
                                {formError && formError !== showError ? (
                                    <p className="text-sm font-medium text-red-600">
                                        {formError}
                                    </p>
                                ) : null}
                                <motion.button
                                    type="submit"
                                    disabled={sending}
                                    whileTap={{ scale: 0.98 }}
                                    className="inline-flex w-full items-center justify-center rounded-full bg-olive-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                >
                                    {sending ? 'Subscribing…' : 'Subscribe'}
                                </motion.button>
                            </form>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
