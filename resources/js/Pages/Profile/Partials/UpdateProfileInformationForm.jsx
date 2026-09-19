import ImageCropModal from '@/Components/Admin/ImageCropModal';
import { srcToDataUrl } from '@/utils/cropImage';
import { Link, useForm, usePage } from '@inertiajs/react';
import { CloudUpload, Crop, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_BYTES = 15 * 1024 * 1024;

const field =
    'w-full rounded-xl border border-olive-200 bg-white px-3.5 py-3 text-base text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-mustard focus:ring-2 focus:ring-mustard/30';
const labelCls = 'mb-1.5 block text-sm font-semibold text-olive-600';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    avatarUrl = null,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const fileRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [cropOpen, setCropOpen] = useState(false);
    const [cropSrc, setCropSrc] = useState(null);
    const [cropLoading, setCropLoading] = useState(false);
    const [cropName, setCropName] = useState('avatar.jpg');
    const [dragOver, setDragOver] = useState(false);
    const [localError, setLocalError] = useState(null);

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        avatar: null,
        remove_avatar: false,
        _method: 'patch',
    });

    useEffect(() => {
        setData({
            name: user.name,
            email: user.email,
            avatar: null,
            remove_avatar: false,
            _method: 'patch',
        });
        setPreview(null);
        setLocalError(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.name, user.email, avatarUrl]);

    useEffect(() => {
        if (!data.avatar) {
            setPreview(null);
            return undefined;
        }
        const url = URL.createObjectURL(data.avatar);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [data.avatar]);

    const displaySrc = useMemo(() => {
        if (data.remove_avatar) return null;
        if (preview) return preview;
        return avatarUrl || user.avatar_url || null;
    }, [data.remove_avatar, preview, avatarUrl, user.avatar_url]);

    const closeCropper = () => {
        setCropOpen(false);
        setCropSrc(null);
        setCropLoading(false);
    };

    const openCropper = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setLocalError('Please choose an image file (JPG, PNG, WEBP, or GIF).');
            return;
        }
        if (file.size > MAX_BYTES) {
            setLocalError('Image must be 15MB or smaller.');
            return;
        }
        setLocalError(null);
        const base = file.name.replace(/\.[^.]+$/, '') || 'avatar';
        setCropName(`${base}.jpg`);
        setCropOpen(true);
        setCropLoading(true);
        setCropSrc(null);

        const reader = new FileReader();
        reader.onload = () => {
            setCropSrc(String(reader.result));
            setCropLoading(false);
        };
        reader.onerror = () => {
            setCropLoading(false);
            setCropOpen(false);
            setLocalError('Could not read that image.');
        };
        reader.readAsDataURL(file);
    };

    const editCurrentPhoto = async (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();

        if (data.avatar instanceof File) {
            openCropper(data.avatar);
            return;
        }

        const src = displaySrc;
        if (!src) return;

        setLocalError(null);
        setCropName('avatar.jpg');
        setCropOpen(true);
        setCropLoading(true);
        setCropSrc(null);

        try {
            const dataUrl = await srcToDataUrl(src);
            setCropSrc(dataUrl);
        } catch {
            setCropOpen(false);
            setLocalError('Could not open this photo for cropping. Try replacing it.');
        } finally {
            setCropLoading(false);
        }
    };

    const onPickFile = (e) => {
        const file = e.target.files?.[0] || null;
        openCropper(file);
        e.target.value = '';
    };

    const onDrop = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        setDragOver(false);
        openCropper(ev.dataTransfer.files?.[0] || null);
    };

    const onCropComplete = (file) => {
        setData('avatar', file);
        setData('remove_avatar', false);
        closeCropper();
    };

    const clearAvatar = () => {
        setData('avatar', null);
        setData('remove_avatar', true);
        setLocalError(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="font-display text-lg font-bold text-olive-950">Profile</h2>
                <p className="mt-1 text-sm text-olive-600">
                    Add a photo and update your name and email.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-5">
                <div>
                    <p className={labelCls}>Profile photo</p>

                    {displaySrc ? (
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <button
                                type="button"
                                onClick={editCurrentPhoto}
                                aria-label="Crop and zoom profile photo"
                                title="Click to crop & zoom"
                                className="group relative mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-full bg-olive-100 shadow-soft ring-2 ring-olive-200 transition hover:ring-mustard focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard sm:mx-0"
                            >
                                <img
                                    src={displaySrc}
                                    alt=""
                                    className="pointer-events-none h-full w-full object-cover"
                                    draggable={false}
                                />
                                <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 bg-earth-dusk/55 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                                    <Crop className="h-5 w-5" strokeWidth={2} />
                                    <span className="text-[11px] font-semibold uppercase tracking-wide">
                                        Crop
                                    </span>
                                </span>
                            </button>
                            <div className="min-w-0 flex-1 space-y-3">
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    onDragOver={(ev) => {
                                        ev.preventDefault();
                                        ev.stopPropagation();
                                        setDragOver(true);
                                    }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={onDrop}
                                    className={`flex w-full items-center gap-3 rounded-2xl border border-dashed px-4 py-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard ${
                                        dragOver
                                            ? 'border-mustard bg-mustard/10'
                                            : 'border-mustard/70 bg-olive-50/50 hover:border-mustard hover:bg-mustard/5'
                                    }`}
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mustard/15 text-mustard">
                                        <CloudUpload className="h-5 w-5" strokeWidth={1.75} />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-olive-950">
                                            Replace photo
                                        </span>
                                        <span className="mt-0.5 block text-xs text-olive-500">
                                            Drop a new image or click · max 15MB
                                        </span>
                                    </span>
                                </button>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={editCurrentPhoto}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-olive-200 bg-white px-3 py-2 text-sm font-semibold text-olive-800 transition hover:border-mustard/50 hover:bg-mustard/10"
                                    >
                                        <Crop className="h-3.5 w-3.5" />
                                        Crop & zoom
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearAvatar}
                                        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Remove photo
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            onDragOver={(ev) => {
                                ev.preventDefault();
                                ev.stopPropagation();
                                setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={onDrop}
                            className={`flex w-full flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-10 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard ${
                                dragOver
                                    ? 'border-mustard bg-mustard/10'
                                    : 'border-mustard/70 bg-olive-50/40 hover:border-mustard hover:bg-mustard/5'
                            }`}
                        >
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mustard/15 text-mustard">
                                <CloudUpload className="h-7 w-7" strokeWidth={1.5} />
                            </span>
                            <span className="mt-4 text-sm font-semibold text-olive-950">
                                Drop a photo here or click to upload
                            </span>
                            <span className="mt-1 text-xs text-olive-500">
                                JPG, PNG, WEBP, GIF · max 15MB
                            </span>
                        </button>
                    )}

                    <input
                        ref={fileRef}
                        type="file"
                        accept={ACCEPT}
                        className="sr-only"
                        onChange={onPickFile}
                    />

                    {(localError || errors.avatar) && (
                        <p className="mt-2 text-sm text-rose-600">{localError || errors.avatar}</p>
                    )}
                </div>

                <div>
                    <label className={labelCls} htmlFor="name">
                        Name
                    </label>
                    <input
                        id="name"
                        className={field}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />
                    {errors.name && <p className="mt-1.5 text-sm text-rose-600">{errors.name}</p>}
                </div>

                <div>
                    <label className={labelCls} htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        className={field}
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    {errors.email && <p className="mt-1.5 text-sm text-rose-600">{errors.email}</p>}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-xl border border-olive-100 bg-olive-50/60 px-4 py-3 text-sm text-olive-800">
                        Your email address is unverified.{' '}
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="font-semibold text-olive-950 underline underline-offset-2"
                        >
                            Resend verification email
                        </Link>
                        {status === 'verification-link-sent' && (
                            <p className="mt-2 font-medium text-mint-deep">
                                A new verification link has been sent.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center justify-center rounded-xl bg-mustard px-4 py-2.5 text-sm font-bold text-earth-dusk transition hover:bg-olive-800 hover:text-white disabled:opacity-50"
                    >
                        {processing ? 'Saving…' : 'Save profile'}
                    </button>
                    {recentlySuccessful && (
                        <p className="text-sm font-medium text-olive-600">Saved.</p>
                    )}
                </div>
            </form>

            <ImageCropModal
                show={cropOpen}
                imageSrc={cropSrc}
                loading={cropLoading}
                fileName={cropName}
                aspect={1}
                onCancel={closeCropper}
                onComplete={onCropComplete}
            />
        </section>
    );
}
