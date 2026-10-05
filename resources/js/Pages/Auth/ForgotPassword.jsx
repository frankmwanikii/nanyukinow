import AuthSplitLayout from '@/Components/auth/AuthSplitLayout';
import { AuthField } from '@/Components/auth/AuthField';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { flash } = usePage().props;
    const successMessage = status || flash?.status;
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        clearErrors('email');
        post(route('password.email'));
    };

    return (
        <AuthSplitLayout title="Forgot password" variant="centered">
            <Link
                href={route('login')}
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-olive-700 transition hover:text-olive-900"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
            </Link>

            <h2 className="mb-2 font-display text-2xl font-semibold tracking-tight text-earth-dusk">
                Forgot your password?
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-olive-600">
                Enter your account email and we’ll send a password reset link.
            </p>

            {successMessage ? (
                <div className="rounded-xl border border-mint/40 bg-mint/15 px-4 py-4 text-sm leading-relaxed text-olive-800">
                    <p className="font-semibold text-olive-900">
                        Check your inbox
                    </p>
                    <p className="mt-1.5">{successMessage}</p>
                    <Link
                        href={route('login')}
                        className="mt-4 inline-block text-sm font-semibold text-olive-700 underline-offset-2 hover:underline"
                    >
                        Return to sign in
                    </Link>
                </div>
            ) : (
                <form onSubmit={submit} className="space-y-4">
                    <AuthField
                        id="email"
                        label="Email address"
                        type="email"
                        value={data.email}
                        onChange={(e) => {
                            clearErrors('email');
                            setData('email', e.target.value);
                        }}
                        error={errors.email}
                        autoComplete="username"
                    />
                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-1 w-full rounded-lg bg-olive-700 px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-olive-800 disabled:cursor-not-allowed disabled:opacity-55"
                    >
                        {processing ? 'Sending link…' : 'Send reset link'}
                    </button>
                </form>
            )}
        </AuthSplitLayout>
    );
}
