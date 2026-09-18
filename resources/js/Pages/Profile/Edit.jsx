import SiteLayout from '@/Layouts/SiteLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <SiteLayout>
            <Head title="Profile" />

            <div className="bg-olive-900">
                <div className="mx-auto max-w-3xl px-4 pb-8 pt-28 sm:px-6 sm:pt-32">
                    <Link
                        href={route('account.index')}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-mustard"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to account
                    </Link>
                    <h1 className="mt-3 font-display text-3xl font-bold text-white">
                        Profile settings
                    </h1>
                </div>
            </div>

            <div className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6">
                <div className="rounded-2xl border border-olive-200/80 bg-white p-6 shadow-soft sm:p-8">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="rounded-2xl border border-olive-200/80 bg-white p-6 shadow-soft sm:p-8">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="rounded-2xl border border-olive-200/80 bg-white p-6 shadow-soft sm:p-8">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </SiteLayout>
    );
}
