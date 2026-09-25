import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useRef, useState } from 'react';

const inputCls =
    'block w-full rounded-xl border border-olive-200 bg-white pr-11 text-olive-900 shadow-sm focus:border-mustard focus:ring-mustard/30 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50 dark:placeholder:text-olive-500';
const labelCls = 'text-olive-600 dark:text-olive-400';

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
            <InputLabel htmlFor={id} value={label} className={labelCls} />

            <div className="relative mt-1">
                <TextInput
                    id={id}
                    ref={inputRef}
                    value={value}
                    onChange={onChange}
                    type={visible ? 'text' : 'password'}
                    className={inputCls}
                    autoComplete={autoComplete}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-olive-500 transition hover:bg-olive-50 hover:text-olive-800 dark:hover:bg-olive-800 dark:hover:text-olive-200"
                >
                    {visible ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </button>
            </div>

            <InputError message={error} className="mt-2" />
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
                <h2 className="font-display text-lg font-bold text-olive-950 dark:text-olive-50">
                    Update Password
                </h2>

                <p className="mt-1 text-sm text-olive-600 dark:text-olive-400">
                    Ensure your account is using a long, random password to stay
                    secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <PasswordField
                    id="current_password"
                    label="Current Password"
                    value={data.current_password}
                    onChange={(e) => setData('current_password', e.target.value)}
                    error={errors.current_password}
                    autoComplete="current-password"
                    inputRef={currentPasswordInput}
                />

                <PasswordField
                    id="password"
                    label="New Password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    autoComplete="new-password"
                    inputRef={passwordInput}
                />

                <PasswordField
                    id="password_confirmation"
                    label="Confirm Password"
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData('password_confirmation', e.target.value)
                    }
                    error={errors.password_confirmation}
                    autoComplete="new-password"
                />

                <div className="flex items-center gap-4">
                    <PrimaryButton
                        disabled={processing}
                        className="rounded-xl border-transparent bg-mustard px-4 py-2.5 text-sm font-bold normal-case tracking-normal text-earth-dusk hover:bg-olive-800 hover:text-white focus:ring-mustard/30 dark:bg-mustard dark:text-earth-dusk dark:hover:bg-olive-100 dark:hover:text-earth-dusk"
                    >
                        Save
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-olive-600 dark:text-olive-400">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
