import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { Eye, EyeOff, X } from 'lucide-react';
import { useRef, useState } from 'react';

const inputCls =
    'block w-full rounded-xl border border-olive-200 bg-white pr-11 text-olive-900 shadow-sm focus:border-mustard focus:ring-mustard/30 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50 dark:placeholder:text-olive-500';
const labelCls = 'text-olive-600 dark:text-olive-400';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setShowPassword(false);
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        setShowPassword(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="font-display text-lg font-bold text-olive-950 dark:text-olive-50">
                    Delete Account
                </h2>

                <p className="mt-1 text-sm text-olive-600 dark:text-olive-400">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to
                    retain.
                </p>
            </header>

            <DangerButton type="button" onClick={confirmUserDeletion}>
                Delete Account
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal} maxWidth="md">
                <form onSubmit={deleteUser} className="relative p-6">
                    <button
                        type="button"
                        onClick={closeModal}
                        aria-label="Close"
                        className="absolute right-4 top-4 rounded-full p-1.5 text-olive-500 transition hover:bg-olive-100 hover:text-olive-900 dark:hover:bg-olive-800 dark:hover:text-olive-100"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <h2 className="pr-10 text-lg font-semibold text-olive-950 dark:text-olive-50">
                        Delete your account?
                    </h2>

                    <p className="mt-2 text-sm text-olive-600 dark:text-olive-400">
                        This cannot be undone. All of your listings, messages,
                        and account data will be permanently deleted. Enter your
                        password to confirm.
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className={labelCls}
                        />

                        <div className="relative mt-1">
                            <TextInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className={inputCls}
                                isFocused
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={
                                    showPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-olive-500 transition hover:bg-olive-50 hover:text-olive-800 dark:hover:bg-olive-800 dark:hover:text-olive-200"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <SecondaryButton
                            type="button"
                            onClick={closeModal}
                            className="rounded-xl border-olive-200 bg-white normal-case tracking-normal text-olive-800 hover:bg-olive-50 dark:border-olive-700 dark:bg-transparent dark:text-olive-200 dark:hover:bg-olive-800"
                        >
                            Cancel
                        </SecondaryButton>

                        <DangerButton type="submit" disabled={processing}>
                            {processing ? 'Deleting…' : 'Yes, delete my account'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
