import { field, label as labelCls } from '@/Components/listing-form/fieldStyles';
import { CloseMark, EyeMark, EyeOffMark } from '@/Components/site/Mark';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

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
        <section className={`space-y-5 ${className}`}>
            <header>
                <h2 className="font-display text-lg font-semibold text-olive-950 dark:text-olive-50">
                    Delete account
                </h2>

                <p className="mt-1 text-sm text-olive-600 dark:text-olive-400">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to
                    retain.
                </p>
            </header>

            <button
                type="button"
                onClick={confirmUserDeletion}
                className="inline-flex items-center justify-center border border-rose-700 bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800"
            >
                Delete account
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal} maxWidth="md">
                <form onSubmit={deleteUser} className="relative p-6">
                    <button
                        type="button"
                        onClick={closeModal}
                        aria-label="Close"
                        className="absolute right-4 top-4 p-1.5 text-olive-500 transition hover:bg-olive-100 hover:text-olive-900 dark:hover:bg-olive-800 dark:hover:text-olive-100"
                    >
                        <CloseMark className="h-5 w-5" />
                    </button>

                    <h2 className="pr-10 font-display text-lg font-semibold text-olive-950 dark:text-olive-50">
                        Delete your account?
                    </h2>

                    <p className="mt-2 text-sm text-olive-600 dark:text-olive-400">
                        This cannot be undone. All of your listings, messages,
                        and account data will be permanently deleted. Enter your
                        password to confirm.
                    </p>

                    <div className="mt-6">
                        <label className={labelCls} htmlFor="password">
                            Password
                        </label>

                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className={`${field} pr-11`}
                                autoFocus
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
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-olive-500 transition hover:text-olive-800 dark:hover:text-olive-200"
                            >
                                {showPassword ? (
                                    <EyeOffMark className="h-4 w-4" />
                                ) : (
                                    <EyeMark className="h-4 w-4" />
                                )}
                            </button>
                        </div>

                        {errors.password ? (
                            <p className="mt-1.5 text-sm text-rose-600">
                                {errors.password}
                            </p>
                        ) : null}
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="inline-flex items-center justify-center border border-olive-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-olive-800 transition hover:border-olive-900 hover:bg-olive-50 dark:border-olive-700 dark:bg-transparent dark:text-olive-200 dark:hover:bg-olive-800"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center border border-rose-700 bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:opacity-50"
                        >
                            {processing ? 'Deleting…' : 'Yes, delete my account'}
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
