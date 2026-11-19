import AuthSplitLayout from '@/Components/auth/AuthSplitLayout';
import { AuthField } from '@/Components/auth/AuthField';
import { ForwardMark } from '@/Components/site/Mark';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function VerifyEmail({ status, email }) {
    const { flash } = usePage().props;
    const successMessage =
        status === 'verification-code-sent'
            ? 'A new code is on its way. Check your inbox.'
            : flash?.status === 'verification-code-sent'
              ? 'A new code is on its way. Check your inbox.'
              : null;

    const {
        data,
        setData,
        post,
        processing,
        errors,
        clearErrors,
        reset,
    } = useForm({
        code: '',
    });

    const {
        post: resend,
        processing: resending,
    } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        clearErrors('code');
        post(route('verification.verify-code'), {
            onSuccess: () => reset('code'),
        });
    };

    const sendAgain = (e) => {
        e.preventDefault();
        resend(route('verification.send'));
    };

    return (
        <AuthSplitLayout
            title="Verify email"
            variant="brand"
            panelTitle="Confirm it’s really you"
            panelBody="We sent a 6-digit code to your email. Enter it here before you list, claim, upgrade, or message."
        >
            <div className="mb-7 text-center">
                <h2 className="font-display text-3xl font-semibold tracking-tight text-earth-dusk sm:text-4xl">
                    Check your email
                </h2>
                <p className="mt-2.5 text-[15px] leading-relaxed text-olive-600">
                    Enter the code we sent to{' '}
                    <span className="font-semibold text-olive-900">
                        {email}
                    </span>
                    .
                </p>
            </div>

            {successMessage ? (
                <div className="mb-5 border border-emerald-600/30 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-900">
                    {successMessage}
                </div>
            ) : null}

            {flash?.error ? (
                <div className="mb-5 border border-red-600/25 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-900">
                    {flash.error}
                </div>
            ) : null}

            <form onSubmit={submit} className="mx-auto max-w-md space-y-4">
                <AuthField
                    id="code"
                    label="Verification code"
                    type="text"
                    autoComplete="one-time-code"
                    value={data.code}
                    onChange={(e) => {
                        clearErrors('code');
                        setData(
                            'code',
                            e.target.value.replace(/[^\d]/g, '').slice(0, 6),
                        );
                    }}
                    error={errors.code}
                    placeholder="6-digit code"
                    hint="Enter the 6-digit code from your email."
                />
                <button
                    type="submit"
                    disabled={processing || data.code.length < 6}
                    className="inline-flex w-full items-center justify-center gap-2 border border-mustard bg-mustard px-4 py-3.5 text-[15px] font-semibold text-earth-dusk transition hover:border-olive-900 hover:bg-olive-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
                >
                    {processing ? 'Verifying…' : 'Verify email'}
                    {!processing ? <ForwardMark className="h-4 w-4" /> : null}
                </button>
            </form>

            <div className="mx-auto mt-6 max-w-md space-y-3 text-center text-sm text-olive-600">
                <p>
                    Didn’t get it?{' '}
                    <button
                        type="button"
                        onClick={sendAgain}
                        disabled={resending}
                        className="font-semibold text-olive-900 underline underline-offset-2 transition hover:text-olive-950 disabled:opacity-55"
                    >
                        {resending ? 'Sending…' : 'Resend code'}
                    </button>
                </p>
                <p>
                    You can keep browsing Nanyuki Now. Listing, claims, upgrades,
                    and messaging unlock after verification.
                </p>
                <Link
                    href={route('account.index')}
                    className="inline-block font-semibold text-olive-900 underline underline-offset-2 transition hover:text-olive-950"
                >
                    Go to my account
                </Link>
                <div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-olive-600 underline underline-offset-2 transition hover:text-olive-950"
                    >
                        Log out
                    </Link>
                </div>
            </div>
        </AuthSplitLayout>
    );
}
