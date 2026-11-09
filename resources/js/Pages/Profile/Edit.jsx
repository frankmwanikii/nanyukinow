import AccountLayout from '@/Layouts/AccountLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status, avatarUrl = null }) {
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
                    <DeleteUserForm />
                </section>
            </div>
        </AccountLayout>
    );
}
