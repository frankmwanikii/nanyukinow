import ImageCropModal from '@/Components/Admin/ImageCropModal';
import { useConfirm } from '@/Components/ConfirmDialog';
import { field, label as labelCls } from '@/Components/listing-form/fieldStyles';
import { CropMark, TrashMark, UploadMark } from '@/Components/site/Mark';
import { srcToDataUrl } from '@/utils/cropImage';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_BYTES = 15 * 1024 * 1024;

function dropZoneClass(dragOver) {
    return `flex w-full border px-4 py-4 text-left transition focus:outline-none focus-visible:border-olive-900 dark:focus-visible:border-mustard ${
        dragOver
            ? 'border-olive-900 bg-olive-50 dark:border-mustard dark:bg-mustard/10'
            : 'border-olive-900/20 bg-olive-50/40 hover:border-olive-900/40 dark:border-olive-700 dark:bg-olive-950/40 dark:hover:border-olive-500'
    }`;
}

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
    const { confirm, dialog } = useConfirm();

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

    const dragHandlers = {
        onDragOver: (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            setDragOver(true);
        },
        onDragLeave: () => setDragOver(false),
        onDrop,
    };

    const onCropComplete = (file) => {
        setData('avatar', file);
        setData('remove_avatar', false);
        closeCropper();
    };

    const clearAvatar = async () => {
        const ok = await confirm({
            title: 'Remove profile photo?',
            message:
                'This removes your current photo. Save profile to apply the change.',
            confirmLabel: 'Remove photo',
            cancelLabel: 'Keep photo',
            tone: 'danger',
        });
        if (!ok) {
            return;
        }
        setData('avatar', null);
        setData('remove_avatar', true);
        setLocalError(null);
        if (fileRef.current) {
            fileRef.current.value = '';
        }
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
            {dialog}
            <header>
                <h2 className="font-display text-lg font-semibold text-olive-950 dark:text-olive-50">
                    Profile
                </h2>
                <p className="mt-1 text-sm text-olive-600 dark:text-olive-400">
                    Add a photo and update your name and email.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-5">
                <div>
                    {displaySrc ? (
                        <div className="flex flex-col items-center gap-3">
                            <button
                                type="button"
                                onClick={editCurrentPhoto}
                                aria-label="Crop and zoom profile photo"
                                title="Click to crop & zoom"
                                className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-full border border-olive-900/15 bg-olive-100 transition hover:border-olive-900 focus:outline-none focus-visible:border-olive-900 dark:border-olive-700 dark:bg-olive-800 dark:hover:border-mustard"
                            >
                                <img
                                    src={displaySrc}
                                    alt=""
                                    className="pointer-events-none h-full w-full object-cover"
                                    draggable={false}
                                />
                                <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 bg-earth-dusk/55 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                                    <CropMark className="h-5 w-5" />
                                    <span className="text-[11px] font-semibold">
                                        Crop
                                    </span>
                                </span>
                            </button>
                            <p className={`${labelCls} mb-0 text-center`}>
                                Profile photo
                            </p>
                            <div className="w-full space-y-3">
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    {...dragHandlers}
                                    className={dropZoneClass(dragOver)}
                                >
                                    <span className="flex items-center gap-3">
                                        <UploadMark className="h-5 w-5 shrink-0 text-olive-700 dark:text-olive-300" />
                                        <span className="min-w-0">
                                            <span className="block text-sm font-semibold text-olive-950 dark:text-olive-50">
                                                Replace photo
                                            </span>
                                            <span className="mt-0.5 block text-xs text-olive-500 dark:text-olive-400">
                                                Drop a new image or click · max
                                                15MB
                                            </span>
                                        </span>
                                    </span>
                                </button>
                                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                                    <button
                                        type="button"
                                        onClick={editCurrentPhoto}
                                        className="inline-flex items-center gap-1.5 border border-olive-900/15 bg-white px-3 py-2 text-sm font-semibold text-olive-800 transition hover:border-olive-900 hover:bg-olive-50 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-200 dark:hover:bg-olive-800"
                                    >
                                        <CropMark className="h-3.5 w-3.5" />
                                        Crop & zoom
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearAvatar}
                                        className="inline-flex items-center gap-1.5 border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-400 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:border-rose-600 dark:hover:bg-rose-950/80"
                                    >
                                        <TrashMark className="h-3.5 w-3.5" />
                                        Remove photo
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div
                                className="flex h-28 w-28 items-center justify-center rounded-full border border-dashed border-olive-900/20 bg-olive-100 text-olive-500 dark:border-olive-700 dark:bg-olive-800 dark:text-olive-300"
                                aria-hidden
                            >
                                <UploadMark className="h-7 w-7" />
                            </div>
                            <p className={`${labelCls} mb-0 text-center`}>
                                Profile photo
                            </p>
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                {...dragHandlers}
                                className={`${dropZoneClass(dragOver)} w-full flex-col items-center justify-center py-10 text-center`}
                            >
                                <UploadMark className="h-7 w-7 text-olive-700 dark:text-olive-300" />
                                <span className="mt-4 text-sm font-semibold text-olive-950 dark:text-olive-50">
                                    Drop a photo here or click to upload
                                </span>
                                <span className="mt-1 text-xs text-olive-500 dark:text-olive-400">
                                    JPG, PNG, WEBP, GIF · max 15MB
                                </span>
                            </button>
                        </div>
                    )}

                    <input
                        ref={fileRef}
                        type="file"
                        accept={ACCEPT}
                        className="sr-only"
                        onChange={onPickFile}
                    />

                    {(localError || errors.avatar) && (
                        <p className="mt-2 text-sm text-rose-600">
                            {localError || errors.avatar}
                        </p>
                    )}
                </div>

                <div
                    className="border-t border-olive-900/10 dark:border-olive-800"
                    aria-hidden
                />

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
                    <div className="border border-olive-900/15 bg-olive-50/60 px-4 py-3 text-sm text-olive-800 dark:border-olive-800 dark:bg-olive-950/60 dark:text-olive-200">
                        Your email address is unverified.{' '}
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="font-semibold text-olive-950 underline underline-offset-2 dark:text-olive-50"
                        >
                            Resend verification email
                        </Link>
                        {status === 'verification-link-sent' && (
                            <p className="mt-2 font-medium text-emerald-700 dark:text-emerald-400">
                                A new verification link has been sent.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center justify-center border border-mustard bg-mustard px-4 py-2.5 text-sm font-semibold text-earth-dusk transition hover:border-olive-900 hover:bg-olive-900 hover:text-white disabled:opacity-50 dark:hover:bg-olive-100 dark:hover:text-earth-dusk"
                    >
                        {processing ? 'Saving…' : 'Save profile'}
                    </button>
                    {recentlySuccessful && (
                        <p className="text-sm font-medium text-olive-600 dark:text-olive-400">
                            Saved.
                        </p>
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
