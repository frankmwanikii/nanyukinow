import Modal from '@/Components/Modal';
import CloseButton from '@/Components/site/CloseButton';
import { PasskeyMark } from '@/Components/site/Mark';

function isMac() {
    if (typeof navigator === 'undefined') {
        return false;
    }
    return /Mac OS X|Macintosh/i.test(navigator.userAgent);
}

function copyFor(reason) {
    const onMac = isMac();

    const shared = {
        unknown: {
            title: 'No account found',
            body: 'We could not find an account with those details. Get started to create one, or check the email or username.',
            primary: 'Got it',
            secondary: 'Get started',
        },
        missing: {
            title: 'Add a passkey in settings',
            body: onMac
                ? 'This account does not have a passkey yet. Sign in with password or Google, open Profile, then choose Add with Touch ID on this MacBook.'
                : 'This account does not have a passkey yet. Sign in with password or Google, open Profile, then add a passkey for this computer or phone.',
            primary: 'Use password',
            secondary: 'Continue with Google',
        },
        not_on_device: {
            title: onMac
                ? 'No passkey on this Mac yet'
                : 'No passkey on this browser',
            body: onMac
                ? 'This account has a passkey elsewhere, but not on this MacBook. Sign in with password or Google, open Profile, and choose Add with Touch ID. After that, Safari or Chrome can unlock with Touch ID here without your phone.'
                : 'This account has a passkey, but not in this browser. Sign in with password or Google, open Profile, and add a passkey for this computer.',
            primary: 'Use password',
            secondary: 'Continue with Google',
        },
    };

    return shared[reason] || shared.missing;
}

export default function PasskeyPromptModal({
    open,
    reason = 'missing',
    onClose,
    onUsePassword,
    onGoogle,
    onRegister,
}) {
    const copy = copyFor(reason);

    const handlePrimary = () => {
        if (reason === 'missing' || reason === 'not_on_device') {
            onUsePassword?.();
            return;
        }
        onClose?.();
    };

    const handleSecondary = () => {
        if (reason === 'unknown') {
            onRegister?.();
            return;
        }
        if (reason === 'missing' || reason === 'not_on_device') {
            onGoogle?.();
        }
    };

    return (
        <Modal show={open} onClose={onClose} maxWidth="md">
            <div className="relative p-6">
                <CloseButton
                    onClick={onClose}
                    size="sm"
                    className="absolute right-4 top-4"
                />

                <div className="flex items-start gap-3 pr-10">
                    <PasskeyMark className="mt-0.5 h-5 w-5 shrink-0 text-olive-700" />
                    <div className="min-w-0">
                        <h2 className="font-display text-lg font-semibold text-olive-950">
                            {copy.title}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-olive-600">
                            {copy.body}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    {copy.secondary ? (
                        <button
                            type="button"
                            onClick={handleSecondary}
                            className="inline-flex items-center justify-center border border-olive-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-olive-800 transition hover:border-olive-900 hover:bg-olive-50"
                        >
                            {copy.secondary}
                        </button>
                    ) : null}
                    <button
                        type="button"
                        onClick={handlePrimary}
                        className="inline-flex items-center justify-center border border-mustard bg-mustard px-4 py-2.5 text-sm font-semibold text-earth-dusk transition hover:border-olive-900 hover:bg-olive-900 hover:text-white"
                    >
                        {copy.primary}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
