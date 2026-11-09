import AuthSplitLayout from '@/Components/auth/AuthSplitLayout';
import { AuthField } from '@/Components/auth/AuthField';
import { BackMark, ForwardMark } from '@/Components/site/Mark';
import { Link, useForm, usePage } from '@inertiajs/react';

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
        <AuthSplitLayout
            title="Forgot password"
            variant="brand"
            panelTitle="Reset your Nanyuki Now password"
            panelBody="We’ll email you a secure link so you can choose a new password."
        >
            <div className="mb-7 text-center">
                <Link
                    href={route('login')}
                    className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-olive-700 transition hover:text-olive-950"
                >
                    <BackMark className="h-3.5 w-3.5" />
                    Back to sign in
                </Link>
                <h2 className="font-display text-3xl font-semibold tracking-tight text-earth-dusk sm:text-4xl">
                    Forgot your password?
                </h2>
                <p className="mt-2.5 text-[15px] leading-relaxed text-olive-600">
                    Enter your account email and we&apos;ll send a password reset
                    link.
                </p>
            </div>

            {successMessage ? (
                <div className="border border-emerald-600/30 bg-emerald-50 px-4 py-4 text-sm leading-relaxed text-emerald-900">
                    <p className="font-semibold">Check your inbox</p>
                    <p className="mt-1.5 text-emerald-800/90">{successMessage}</p>
                    <Link
                        href={route('login')}
                        className="mt-4 inline-block text-sm font-semibold text-olive-900 underline underline-offset-2 hover:text-olive-950"
                    >
                        Return to sign in
                    </Link>
                </div>
            ) : (
                <form onSubmit={submit} className="mx-auto max-w-md space-y-4">
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
                        className="inline-flex w-full items-center justify-center gap-2 border border-mustard bg-mustard px-4 py-3.5 text-[15px] font-semibold text-earth-dusk transition hover:border-olive-900 hover:bg-olive-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
                    >
                        {processing ? 'Sending link…' : 'Send reset link'}
                        {!processing ? (
                            <ForwardMark className="h-4 w-4" />
                        ) : null}
                    </button>
                </form>
            )}
        </AuthSplitLayout>
    );
}
