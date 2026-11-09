import AccountLayout from '@/Layouts/AccountLayout';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import ManagePasskeysForm from './Partials/ManagePasskeysForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

const ADD_PASSKEY_FLAG = 'nn_add_passkey';

export default function Edit({
    mustVerifyEmail,
    status,
    avatarUrl = null,
    passkeys = [],
}) {
    useEffect(() => {
        let shouldFocus = false;
        try {
            shouldFocus = sessionStorage.getItem(ADD_PASSKEY_FLAG) === '1';
            if (shouldFocus) {
                sessionStorage.removeItem(ADD_PASSKEY_FLAG);
            }
        } catch {
            shouldFocus = window.location.hash === '#passkeys';
        }

        if (!shouldFocus && window.location.hash !== '#passkeys') {
            return;
        }

        window.requestAnimationFrame(() => {
            document
                .getElementById('passkeys')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }, []);

    return (
        <AccountLayout title="Personal info">
            <Head title="Profile" />

            <div className="mx-auto w-full max-w-xl space-y-5">
                <section className="border border-olive-900/15 bg-white p-5 sm:p-6 dark:border-olive-800 dark:bg-olive-900">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        avatarUrl={avatarUrl}
                    />
                </section>

                <section className="border border-olive-900/15 bg-white p-5 sm:p-6 dark:border-olive-800 dark:bg-olive-900">
                    <UpdatePasswordForm />
                </section>

                <section className="border border-olive-900/15 bg-white p-5 sm:p-6 dark:border-olive-800 dark:bg-olive-900">
                    <ManagePasskeysForm passkeys={passkeys} />
                </section>

                <section className="border border-olive-900/15 bg-white p-5 sm:p-6 dark:border-olive-800 dark:bg-olive-900">
                    <DeleteUserForm />
                </section>
            </div>
        </AccountLayout>
    );
}
