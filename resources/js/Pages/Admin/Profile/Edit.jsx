import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminButton,
    AdminInput,
    FormPanel,
} from '@/Components/Admin/ui';
import { Head, useForm, usePage } from '@inertiajs/react';
import { KeyRound, Save, UserRound } from 'lucide-react';

function ProfileForm({ user }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        avatar_url: user.avatar_url || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.profile.update'), { preserveScroll: true });
    };

    return (
        <FormPanel title="Profile details">
            <form onSubmit={submit} className="space-y-4">
                <div className="flex flex-wrap items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-mustard text-lg font-bold text-earth-dusk ring-1 ring-olive-200 dark:ring-olive-700">
                        {data.avatar_url ? (
                            <img src={data.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <UserRound className="h-7 w-7" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-4">
                        <AdminInput
                            label="Profile image URL"
                            value={data.avatar_url}
                            onChange={(e) => setData('avatar_url', e.target.value)}
                            error={errors.avatar_url}
                            placeholder="https://…"
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <AdminInput
                                label="Name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
                            />
                            <AdminInput
                                label="Email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                                required
                            />
                        </div>
                    </div>
                </div>
                <AdminButton type="submit" size="sm" disabled={processing}>
                    <Save className="h-3.5 w-3.5" />
                    Save profile
                </AdminButton>
            </form>
        </FormPanel>
    );
}

function PasswordForm() {
    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.profile.password'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <FormPanel title="Password">
            <form onSubmit={submit} className="space-y-4">
                <p className="text-sm text-olive-500 dark:text-olive-400">
                    Choose a strong password you do not use elsewhere.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                    <AdminInput
                        label="Current password"
                        type="password"
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        error={errors.current_password}
                        autoComplete="current-password"
                        className="sm:col-span-2"
                        required
                    />
                    <AdminInput
                        label="New password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                        autoComplete="new-password"
                        required
                    />
                    <AdminInput
                        label="Confirm new password"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        error={errors.password_confirmation}
                        autoComplete="new-password"
                        required
                    />
                </div>
                <AdminButton type="submit" size="sm" disabled={processing}>
                    <KeyRound className="h-3.5 w-3.5" />
                    Update password
                </AdminButton>
            </form>
        </FormPanel>
    );
}

export default function Edit({ user }) {
    const authUser = usePage().props.auth?.user;

    return (
        <AdminLayout title="Your profile">
            <Head title="Your profile" />

            <div className="mx-auto max-w-3xl space-y-5">
                <p className="text-sm text-olive-600 dark:text-olive-300">
                    Update how you appear in the admin, your email, and your password
                    {authUser?.name ? ` for ${authUser.name}` : ''}.
                </p>
                <ProfileForm user={user} />
                <PasswordForm />
            </div>
        </AdminLayout>
    );
}
