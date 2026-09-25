import AccountLayout from '@/Layouts/AccountLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status, avatarUrl = null }) {
    return (
        <AccountLayout title="Personal info">
            <Head title="Profile" />

            <div className="space-y-5">
                <div className="rounded-3xl border border-olive-200/80 bg-white p-6 shadow-soft sm:p-8 dark:border-olive-800 dark:bg-olive-900 dark:shadow-none">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        avatarUrl={avatarUrl}
                        className="max-w-xl"
                    />
                </div>

                <div className="rounded-3xl border border-olive-200/80 bg-white p-6 shadow-soft sm:p-8 dark:border-olive-800 dark:bg-olive-900 dark:shadow-none">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="rounded-3xl border border-olive-200/80 bg-white p-6 shadow-soft sm:p-8 dark:border-olive-800 dark:bg-olive-900 dark:shadow-none">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </AccountLayout>
    );
}
