import { PasskeyMark, TrashMark } from '@/Components/site/Mark';
import { usePasskeyRegister } from '@laravel/passkeys/react';
import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function isMac() {
    if (typeof navigator === 'undefined') {
        return false;
    }
    return /Mac OS X|Macintosh/i.test(navigator.userAgent);
}

function suggestedPasskeyName() {
    if (typeof navigator === 'undefined') {
        return 'This device';
    }

    const ua = navigator.userAgent;
    if (/iPhone/i.test(ua)) {
        return 'iPhone';
    }
    if (/iPad/i.test(ua)) {
        return 'iPad';
    }
    if (/Android/i.test(ua)) {
        return 'Android phone';
    }
    if (isMac()) {
        return 'MacBook (Touch ID)';
    }
    if (/Windows/i.test(ua)) {
        return 'Windows PC';
    }

    return 'This device';
}

function formatPasskeyDate(value) {
    if (!value) {
        return null;
    }

    try {
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium',
        }).format(new Date(value));
    } catch {
        return null;
    }
}

export default function ManagePasskeysForm({ passkeys = [], className = '' }) {
    const onMac = useMemo(() => isMac(), []);
    const defaultName = useMemo(() => suggestedPasskeyName(), []);
    const [name, setName] = useState(defaultName);
    const [deletingId, setDeletingId] = useState(null);
    const [localError, setLocalError] = useState('');

    const { register, isLoading, error, isSupported } = usePasskeyRegister({
        onSuccess: () => {
            setLocalError('');
            setName(suggestedPasskeyName());
            router.reload({ only: ['passkeys'] });
        },
        onError: (err) => {
            if (err?.name === 'UserCancelledError') {
                setLocalError('');
                return;
            }
            setLocalError(
                err?.message ||
                    (onMac
                        ? 'Touch ID did not finish. Try again, or use your Mac password when asked.'
                        : 'Could not add this passkey.'),
            );
        },
    });

    const addPasskey = async () => {
        const trimmed = name.trim();
        if (!trimmed || isLoading) {
            return;
        }
        setLocalError('');
        await register(trimmed);
    };

    const removePasskey = (passkey) => {
        if (deletingId) {
            return;
        }
        if (
            !window.confirm(
                `Remove "${passkey.name}"? You will need another way to sign in on that device.`,
            )
        ) {
            return;
        }

        setDeletingId(passkey.id);
        router.delete(route('passkey.destroy', passkey.id), {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
            onSuccess: () => router.reload({ only: ['passkeys'] }),
        });
    };

    return (
        <section id="passkeys" className={className}>
            <header>
                <h2 className="font-display text-lg font-semibold text-olive-950 dark:text-olive-50">
                    Passkeys
                </h2>
                <p className="mt-1 text-sm text-olive-600 dark:text-olive-400">
                    {onMac
                        ? 'On this MacBook, add a passkey and confirm with Touch ID (or your Mac password). Next sign-in can use Touch ID in Safari or Chrome. No phone needed.'
                        : 'Add this computer or phone. Unlock with Windows Hello, Touch ID, fingerprint, or device lock. No second device needed once this one is added.'}
                </p>
            </header>

            {!isSupported ? (
                <p className="mt-5 border border-olive-900/15 bg-olive-50 px-4 py-3 text-sm text-olive-700 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-300">
                    This browser does not support passkeys. Try Chrome, Safari,
                    Edge, or Firefox on a recent phone or computer.
                </p>
            ) : (
                <div className="mt-5 space-y-3">
                    <label
                        htmlFor="passkey_name"
                        className="block text-sm font-semibold text-olive-800 dark:text-olive-200"
                    >
                        Device name
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                        <input
                            id="passkey_name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={64}
                            autoComplete="off"
                            placeholder={
                                onMac ? 'e.g. MacBook (Touch ID)' : 'e.g. iPhone'
                            }
                            className="min-w-0 flex-1 border border-olive-900/20 bg-white px-3.5 py-2.5 text-sm text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-olive-900 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50 dark:focus:border-mustard"
                        />
                        <button
                            type="button"
                            onClick={addPasskey}
                            disabled={isLoading || !name.trim()}
                            className="inline-flex shrink-0 items-center justify-center gap-2 border border-mustard bg-mustard px-4 py-2.5 text-sm font-semibold text-earth-dusk transition hover:border-olive-900 hover:bg-olive-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-mustard disabled:hover:bg-mustard disabled:hover:text-earth-dusk"
                        >
                            <PasskeyMark className="h-4 w-4" />
                            {isLoading
                                ? onMac
                                    ? 'Waiting for Touch ID…'
                                    : 'Waiting for device…'
                                : onMac
                                  ? 'Add with Touch ID'
                                  : 'Add passkey'}
                        </button>
                    </div>
                    {(localError || error) && (
                        <p className="text-sm text-rose-600" role="alert">
                            {localError || error}
                        </p>
                    )}
                </div>
            )}

            <ul className="mt-6 divide-y divide-olive-900/10 border-t border-olive-900/10 dark:divide-olive-700 dark:border-olive-700">
                {passkeys.length === 0 ? (
                    <li className="py-5 text-sm text-olive-600 dark:text-olive-400">
                        No passkeys yet. Add one on the phone or computer you
                        use most.
                    </li>
                ) : (
                    passkeys.map((passkey) => {
                        const lastUsed = formatPasskeyDate(passkey.last_used_at);
                        const created = formatPasskeyDate(passkey.created_at);

                        return (
                            <li
                                key={passkey.id}
                                className="flex items-start justify-between gap-4 py-4"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-olive-950 dark:text-olive-50">
                                        {passkey.name}
                                    </p>
                                    <p className="mt-0.5 text-xs text-olive-500 dark:text-olive-400">
                                        {passkey.authenticator || 'Passkey'}
                                        {lastUsed
                                            ? `. Last used ${lastUsed}`
                                            : created
                                              ? `. Added ${created}`
                                              : ''}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removePasskey(passkey)}
                                    disabled={deletingId === passkey.id}
                                    className="inline-flex shrink-0 items-center gap-1.5 px-2 py-1.5 text-sm text-olive-600 transition hover:text-rose-700 disabled:opacity-50 dark:text-olive-300 dark:hover:text-rose-400"
                                    aria-label={`Remove ${passkey.name}`}
                                >
                                    <TrashMark className="h-3.5 w-3.5" />
                                    {deletingId === passkey.id
                                        ? 'Removing…'
                                        : 'Remove'}
                                </button>
                            </li>
                        );
                    })
                )}
            </ul>
        </section>
    );
}
