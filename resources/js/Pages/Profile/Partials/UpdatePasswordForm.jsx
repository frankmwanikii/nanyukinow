import { field, label as labelCls } from '@/Components/listing-form/fieldStyles';
import { EyeMark, EyeOffMark } from '@/Components/site/Mark';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

function PasswordField({
    id,
    label,
    value,
    onChange,
    error,
    autoComplete,
    inputRef,
}) {
    const [visible, setVisible] = useState(false);

    return (
        <div>
            <label className={labelCls} htmlFor={id}>
                {label}
            </label>

            <div className="relative">
                <input
                    id={id}
                    ref={inputRef}
                    value={value}
                    onChange={onChange}
                    type={visible ? 'text' : 'password'}
                    className={`${field} pr-11`}
                    autoComplete={autoComplete}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-olive-500 transition hover:text-olive-800 dark:hover:text-olive-200"
                >
                    {visible ? (
                        <EyeOffMark className="h-4 w-4" />
                    ) : (
                        <EyeMark className="h-4 w-4" />
                    )}
                </button>
            </div>

            {error ? <p className="mt-1.5 text-sm text-rose-600">{error}</p> : null}
        </div>
    );
}

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (formErrors) => {
                if (formErrors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (formErrors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="font-display text-lg font-semibold text-olive-950 dark:text-olive-50">
                    Update password
                </h2>

                <p className="mt-1 text-sm text-olive-600 dark:text-olive-400">
                    Ensure your account is using a long, random password to stay
                    secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-5">
                <PasswordField
                    id="current_password"
                    label="Current password"
                    value={data.current_password}
                    onChange={(e) => setData('current_password', e.target.value)}
                    error={errors.current_password}
                    autoComplete="current-password"
                    inputRef={currentPasswordInput}
                />

                <PasswordField
                    id="password"
                    label="New password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    autoComplete="new-password"
                    inputRef={passwordInput}
                />

                <PasswordField
                    id="password_confirmation"
                    label="Confirm password"
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData('password_confirmation', e.target.value)
                    }
                    error={errors.password_confirmation}
                    autoComplete="new-password"
                />

                <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center justify-center border border-mustard bg-mustard px-4 py-2.5 text-sm font-semibold text-earth-dusk transition hover:border-olive-900 hover:bg-olive-900 hover:text-white disabled:opacity-50 dark:hover:bg-olive-100 dark:hover:text-earth-dusk"
                    >
                        {processing ? 'Saving…' : 'Save'}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-medium text-olive-600 dark:text-olive-400">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
