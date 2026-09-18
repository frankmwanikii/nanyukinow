import AdminLayout from '@/Layouts/AdminLayout';
import ImageCropModal from '@/Components/Admin/ImageCropModal';
import {
    AdminButton,
    AdminInput,
    AdminPasswordInput,
    FormPanel,
} from '@/Components/Admin/ui';
import { srcToDataUrl } from '@/utils/cropImage';
import { Head, useForm, usePage } from '@inertiajs/react';
import { CloudUpload, Crop, KeyRound, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_BYTES = 15 * 1024 * 1024;

function ProfileForm({ user }) {
    const fileRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [cropOpen, setCropOpen] = useState(false);
    const [cropSrc, setCropSrc] = useState(null);
    const [cropLoading, setCropLoading] = useState(false);
    const [cropName, setCropName] = useState('avatar.jpg');
    const [dragOver, setDragOver] = useState(false);
    const [localError, setLocalError] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        avatar: null,
        remove_avatar: false,
        _method: 'put',
    });

    useEffect(() => {
        setData({
            name: user.name || '',
            email: user.email || '',
            avatar: null,
            remove_avatar: false,
            _method: 'put',
        });
        setPreview(null);
        setLocalError(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.name, user.email, user.avatar_url]);

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
        return user.avatar_url || null;
    }, [data.remove_avatar, preview, user.avatar_url]);

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
        const file = ev.dataTransfer.files?.[0] || null;
        openCropper(file);
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
        post(route('admin.profile.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <FormPanel
                title="Profile details"
                description="Upload a photo, then update your name and email."
            >
                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-olive-500 dark:text-olive-400">
                            Profile image
                        </p>

                        {displaySrc ? (
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <button
                                    type="button"
                                    onClick={editCurrentPhoto}
                                    aria-label="Crop and zoom profile photo"
                                    title="Click to crop & zoom"
                                    className="group relative mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-full bg-olive-100 shadow-soft ring-2 ring-olive-200 transition hover:ring-mustard focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard sm:mx-0 dark:bg-olive-800 dark:ring-olive-700"
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
                                        className={`flex w-full items-center gap-3 rounded-2xl border border-dashed px-4 py-4 text-left transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard ${
                                            dragOver
                                                ? 'border-mustard bg-mustard/10'
                                                : 'border-mustard/70 bg-olive-50/50 hover:border-mustard hover:bg-mustard/5 dark:bg-olive-950/40'
                                        }`}
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mustard/15 text-mustard">
                                            <CloudUpload className="h-5 w-5" strokeWidth={1.75} />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-sm font-semibold text-earth-dusk dark:text-olive-50">
                                                Replace photo
                                            </span>
                                            <span className="mt-0.5 block text-xs text-olive-500 dark:text-olive-400">
                                                Drop a new image or click · max 15MB
                                            </span>
                                        </span>
                                    </button>
                                    <div className="flex flex-wrap gap-2">
                                        <AdminButton type="button" size="sm" variant="secondary" onClick={editCurrentPhoto}>
                                            <Crop className="h-3.5 w-3.5" />
                                            Crop & zoom
                                        </AdminButton>
                                        <AdminButton type="button" size="sm" variant="ghost" onClick={clearAvatar}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Remove photo
                                        </AdminButton>
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
                                className={`flex w-full flex-col items-center justify-center rounded-2xl border border-dashed bg-gradient-to-b from-white to-olive-50/40 px-4 py-10 text-center transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard dark:from-olive-950/50 dark:to-olive-950/20 ${
                                    dragOver
                                        ? 'border-mustard bg-mustard/10 scale-[1.01]'
                                        : 'border-mustard/70 hover:border-mustard hover:bg-mustard/5'
                                }`}
                            >
                                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mustard/15 text-mustard">
                                    <CloudUpload className="h-7 w-7" strokeWidth={1.5} />
                                </span>
                                <span className="mt-4 text-sm font-semibold text-earth-dusk dark:text-olive-50">
                                    Drop files here or click to upload
                                </span>
                                <span className="mt-1 text-xs text-olive-500 dark:text-olive-400">
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
                            <span className="mt-2 block text-sm text-rose-600 dark:text-rose-400">
                                {localError || errors.avatar}
                            </span>
                        )}
                    </div>

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

                    <div className="flex justify-end border-t border-olive-100 pt-5 dark:border-olive-800">
                        <AdminButton type="submit" disabled={processing}>
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving…' : 'Save profile'}
                        </AdminButton>
                    </div>
                </form>
            </FormPanel>

            <ImageCropModal
                show={cropOpen}
                imageSrc={cropSrc}
                loading={cropLoading}
                fileName={cropName}
                aspect={1}
                onCancel={closeCropper}
                onComplete={onCropComplete}
            />
        </>
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
        <div id="password">
            <FormPanel
                title="Password"
                description="Choose a strong password you do not use elsewhere."
            >
                <form onSubmit={submit} className="space-y-5">
                    <AdminPasswordInput
                        label="Current password"
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        error={errors.current_password}
                        autoComplete="current-password"
                        required
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <AdminPasswordInput
                            label="New password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            autoComplete="new-password"
                            required
                        />
                        <AdminPasswordInput
                            label="Confirm new password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            error={errors.password_confirmation}
                            autoComplete="new-password"
                            required
                        />
                    </div>
                    <div className="flex justify-end border-t border-olive-100 pt-5 dark:border-olive-800">
                        <AdminButton type="submit" disabled={processing}>
                            <KeyRound className="h-4 w-4" />
                            {processing ? 'Updating…' : 'Update password'}
                        </AdminButton>
                    </div>
                </form>
            </FormPanel>
        </div>
    );
}

export default function Edit({ user }) {
    const authUser = usePage().props.auth?.user;

    return (
        <AdminLayout title="Your profile">
            <Head title="Your profile" />

            <div className="mx-auto max-w-3xl space-y-6">
                <p className="max-w-2xl text-sm leading-relaxed text-olive-600 dark:text-olive-300">
                    Update how you appear in the admin, your email, and your password
                    {authUser?.name ? ` for ${authUser.name}` : ''}.
                </p>
                <ProfileForm user={user} />
                <PasswordForm />
            </div>
        </AdminLayout>
    );
}
