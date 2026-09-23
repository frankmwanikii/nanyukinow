import ListingImageCropModal from './ListingImageCropModal';
import { help, label } from './fieldStyles';
import { srcToDataUrl } from '@/utils/cropImage';
import {
    Check,
    ImagePlus,
    Loader2,
    RefreshCw,
    Star,
    Trash2,
    Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';

const MAX_BYTES = 15 * 1024 * 1024;
const MAX_GALLERY = 12;

function revoke(url) {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
}

function DropZone({
    onFiles,
    multiple = false,
    className = '',
    children,
    disabled = false,
}) {
    const [over, setOver] = useState(false);

    const acceptFiles = (fileList) => {
        if (disabled) return;
        const files = Array.from(fileList || []).filter((f) =>
            f.type.startsWith('image/'),
        );
        if (!files.length) return;
        onFiles?.(multiple ? files : files[0]);
    };

    return (
        <div
            className={`${className} ${over ? 'ring-2 ring-mustard ring-offset-2' : ''}`}
            onDragEnter={(e) => {
                e.preventDefault();
                if (!disabled) setOver(true);
            }}
            onDragOver={(e) => {
                e.preventDefault();
                if (!disabled) setOver(true);
            }}
            onDragLeave={(e) => {
                e.preventDefault();
                setOver(false);
            }}
            onDrop={(e) => {
                e.preventDefault();
                setOver(false);
                acceptFiles(e.dataTransfer?.files);
            }}
        >
            {children}
        </div>
    );
}

function MediaSlot({
    title,
    subtitle,
    preview,
    aspect = 'aspect-[4/3]',
    rounded = 'rounded-2xl',
    onBrowse,
    onFile,
    onClear,
    emptyIcon: EmptyIcon = Upload,
    emptyLabel = 'Upload',
    badge,
}) {
    return (
        <div className="flex h-full flex-col">
            <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                    <p className={label}>{title}</p>
                    {subtitle ? <p className={help}>{subtitle}</p> : null}
                </div>
                {badge}
            </div>
            <DropZone onFiles={onFile} className="relative flex-1">
                <button
                    type="button"
                    onClick={onBrowse}
                    className={`group relative flex w-full items-center justify-center overflow-hidden ${aspect} ${rounded} bg-gradient-to-br from-olive-50 via-white to-olive-100/80 ring-1 ring-olive-200/80 transition hover:ring-mustard focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard`}
                >
                    {preview ? (
                        <>
                            <img
                                src={preview}
                                alt={`${title} preview`}
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-olive-950/70 via-olive-950/10 to-transparent opacity-90 transition group-hover:opacity-100" />
                            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-olive-900 shadow-sm">
                                    <Check className="h-3 w-3 text-emerald-600" />
                                    Ready
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-olive-950/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                                    <RefreshCw className="h-3 w-3" />
                                    Replace
                                </span>
                            </div>
                        </>
                    ) : (
                        <span className="flex flex-col items-center gap-2 px-4 text-center text-olive-600">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-olive-100">
                                <EmptyIcon className="h-5 w-5 text-olive-700" />
                            </span>
                            <span className="text-sm font-semibold text-olive-900">
                                {emptyLabel}
                            </span>
                            <span className="text-xs text-olive-500">
                                Drag & drop or click · JPG, PNG, WebP
                            </span>
                        </span>
                    )}
                </button>
            </DropZone>
            {preview && onClear ? (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-2 inline-flex items-center gap-1.5 self-start text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                </button>
            ) : null}
        </div>
    );
}

/**
 * Cover + logo + multi gallery with crop/zoom, queue progress, and previews.
 */
export default function GalleryUploader({
    coverPreview,
    logoPreview,
    posterPreview,
    galleryItems = [],
    showPoster = false,
    onCoverChange,
    onLogoChange,
    onPosterChange,
    onGalleryChange,
    errors = {},
}) {
    const coverInput = useRef(null);
    const logoInput = useRef(null);
    const posterInput = useRef(null);
    const galleryInput = useRef(null);

    const [cropState, setCropState] = useState(null);
    const [queue, setQueue] = useState([]);
    const [queueTotal, setQueueTotal] = useState(0);
    const [localError, setLocalError] = useState(null);

    const openCrop = async (file, kind, aspect, cropShape = 'rect') => {
        if (!file) return;
        try {
            // Read the File directly — avoid blob: URL rewriting bugs.
            const dataUrl = await srcToDataUrl(file);
            setCropState({
                kind,
                imageSrc: dataUrl,
                originalFile: file,
                fileName: file.name || `${kind}.jpg`,
                aspect,
                cropShape,
            });
        } catch {
            setLocalError(
                'Could not read that image. Try JPG, PNG, or WebP under 15 MB.',
            );
        }
    };

    const handleSingle = (file, kind) => {
        if (!file) return;
        if (file.size > MAX_BYTES) {
            setLocalError('Images must be under 15 MB.');
            return;
        }
        setLocalError(null);
        setQueue([]);
        setQueueTotal(0);
        if (kind === 'cover') openCrop(file, 'cover', 4 / 3);
        if (kind === 'logo') openCrop(file, 'logo', 1, 'round');
        if (kind === 'poster') openCrop(file, 'poster', 3 / 4);
    };

    const handleGalleryPick = (files) => {
        const list = Array.isArray(files) ? files : Array.from(files || []);
        if (!list.length) return;

        const remaining = MAX_GALLERY - galleryItems.length;
        if (remaining <= 0) {
            setLocalError(`You can upload up to ${MAX_GALLERY} gallery photos.`);
            return;
        }

        const accepted = list
            .filter((f) => f.type.startsWith('image/') && f.size <= MAX_BYTES)
            .slice(0, remaining);

        if (!accepted.length) {
            setLocalError('No valid images selected.');
            return;
        }

        setLocalError(null);
        setQueue(accepted);
        setQueueTotal(accepted.length);
        openCrop(accepted[0], 'gallery', 4 / 3);
    };

    const finishCrop = (file) => {
        if (!cropState) return;
        const { kind } = cropState;

        if (kind === 'cover') {
            const preview = URL.createObjectURL(file);
            onCoverChange?.({ file, preview });
        } else if (kind === 'logo') {
            const preview = URL.createObjectURL(file);
            onLogoChange?.({ file, preview });
        } else if (kind === 'poster') {
            const preview = URL.createObjectURL(file);
            onPosterChange?.({ file, preview });
        } else if (kind === 'gallery') {
            const preview = URL.createObjectURL(file);
            const next = [
                ...galleryItems,
                {
                    id: `g-${Date.now()}-${Math.random()}`,
                    file,
                    preview,
                    url: null,
                },
            ];
            onGalleryChange?.(next);

            const rest = queue.slice(1);
            setQueue(rest);
            setCropState(null);
            if (rest[0]) {
                openCrop(rest[0], 'gallery', 4 / 3);
                return;
            }
            setQueueTotal(0);
        }

        setCropState(null);
        setQueue([]);
        setQueueTotal(0);
    };

    const removeGallery = (id) => {
        const item = galleryItems.find((g) => g.id === id);
        if (item?.preview) revoke(item.preview);
        onGalleryChange?.(galleryItems.filter((g) => g.id !== id));
    };

    const setCoverFromGallery = (item) => {
        if (item.preview) {
            onCoverChange?.({
                file: item.file || null,
                preview: item.preview,
                url: item.url || null,
            });
        } else if (item.url) {
            onCoverChange?.({ file: null, preview: item.url, url: item.url });
        }
    };

    const galleryCount = galleryItems.length;
    const galleryPct = Math.round((galleryCount / MAX_GALLERY) * 100);
    const cropping =
        cropState?.kind === 'gallery' && queueTotal > 0
            ? queueTotal - queue.length + 1
            : 0;
    const cropPct =
        queueTotal > 0 ? Math.round((cropping / queueTotal) * 100) : 0;

    return (
        <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-stretch">
                <MediaSlot
                    title="Cover image"
                    subtitle="Appears on listing cards. Crop & zoom before save."
                    preview={coverPreview}
                    aspect="aspect-[4/3]"
                    onBrowse={() => coverInput.current?.click()}
                    onFile={(file) => handleSingle(file, 'cover')}
                    onClear={
                        coverPreview
                            ? () =>
                                  onCoverChange?.({
                                      file: null,
                                      preview: null,
                                      url: null,
                                  })
                            : undefined
                    }
                    emptyLabel="Add cover photo"
                    badge={
                        coverPreview ? (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-100">
                                Set
                            </span>
                        ) : (
                            <span className="rounded-full bg-olive-100 px-2.5 py-1 text-[11px] font-semibold text-olive-700">
                                Required
                            </span>
                        )
                    }
                />
                <input
                    ref={coverInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        handleSingle(e.target.files?.[0], 'cover');
                        e.target.value = '';
                    }}
                />

                <div
                    className={`grid gap-6 ${showPoster ? 'sm:grid-cols-2 lg:grid-cols-1' : ''} lg:content-start`}
                >
                    <div className="mx-auto w-full max-w-[11rem] lg:mx-0 lg:max-w-none">
                        <MediaSlot
                            title="Logo"
                            subtitle="Round badge on the card (optional)."
                            preview={logoPreview}
                            aspect="aspect-square"
                            rounded="rounded-[1.75rem]"
                            emptyIcon={ImagePlus}
                            emptyLabel="Add logo"
                            onBrowse={() => logoInput.current?.click()}
                            onFile={(file) => handleSingle(file, 'logo')}
                            onClear={
                                logoPreview
                                    ? () =>
                                          onLogoChange?.({
                                              file: null,
                                              preview: null,
                                          })
                                    : undefined
                            }
                        />
                    </div>
                    <input
                        ref={logoInput}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            handleSingle(e.target.files?.[0], 'logo');
                            e.target.value = '';
                        }}
                    />

                    {showPoster ? (
                        <>
                            <div className="mx-auto w-full max-w-[11rem] lg:mx-0 lg:max-w-[14rem]">
                                <MediaSlot
                                    title="Event poster"
                                    subtitle="Portrait poster on event cards."
                                    preview={posterPreview}
                                    aspect="aspect-[3/4]"
                                    emptyIcon={ImagePlus}
                                    emptyLabel="Add poster"
                                    onBrowse={() => posterInput.current?.click()}
                                    onFile={(file) =>
                                        handleSingle(file, 'poster')
                                    }
                                    onClear={
                                        posterPreview
                                            ? () =>
                                                  onPosterChange?.({
                                                      file: null,
                                                      preview: null,
                                                  })
                                            : undefined
                                    }
                                />
                            </div>
                            <input
                                ref={posterInput}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    handleSingle(
                                        e.target.files?.[0],
                                        'poster',
                                    );
                                    e.target.value = '';
                                }}
                            />
                        </>
                    ) : null}
                </div>
            </div>

            {errors.cover || errors.image_url ? (
                <p className="-mt-4 text-sm text-rose-600">
                    {errors.cover || errors.image_url}
                </p>
            ) : null}

            <div className="rounded-2xl bg-olive-50/60 p-4 ring-1 ring-olive-100 sm:p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className={label}>Gallery</p>
                            <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-olive-700 ring-1 ring-olive-200">
                                {galleryCount} / {MAX_GALLERY}
                            </span>
                        </div>
                        <p className={help}>
                            Multi-select photos, crop each one, then preview
                            before submit.
                        </p>
                        <div className="mt-3 h-1.5 max-w-xs overflow-hidden rounded-full bg-olive-200/80">
                            <div
                                className="h-full rounded-full bg-mustard transition-all duration-300"
                                style={{ width: `${galleryPct}%` }}
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => galleryInput.current?.click()}
                        disabled={galleryCount >= MAX_GALLERY}
                        className="inline-flex items-center gap-2 rounded-xl bg-olive-900 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-olive-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ImagePlus className="h-4 w-4" />
                        Add photos
                    </button>
                    <input
                        ref={galleryInput}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                            handleGalleryPick(e.target.files);
                            e.target.value = '';
                        }}
                    />
                </div>

                {queueTotal > 0 && cropState?.kind === 'gallery' ? (
                    <div className="mt-4 rounded-xl bg-white px-4 py-3 ring-1 ring-olive-100">
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="inline-flex items-center gap-2 font-semibold text-olive-900">
                                <Loader2 className="h-4 w-4 animate-spin text-mustard" />
                                Cropping photo {cropping} of {queueTotal}
                            </span>
                            <span className="text-xs font-semibold text-olive-500">
                                {cropPct}%
                            </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-olive-100">
                            <div
                                className="h-full rounded-full bg-olive-800 transition-all duration-300"
                                style={{ width: `${cropPct}%` }}
                            />
                        </div>
                    </div>
                ) : null}

                <DropZone
                    multiple
                    onFiles={handleGalleryPick}
                    disabled={galleryCount >= MAX_GALLERY}
                    className="mt-4"
                >
                    {galleryItems.length ? (
                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {galleryItems.map((item, index) => {
                                const src = item.preview || item.url;
                                const saved = Boolean(item.url) && !item.file;
                                return (
                                    <li
                                        key={item.id}
                                        className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-olive-200/80"
                                    >
                                        <img
                                            src={src}
                                            alt={`Gallery ${index + 1}`}
                                            className="aspect-[4/3] w-full object-cover"
                                        />
                                        <div className="absolute left-2 top-2 flex gap-1">
                                            <span className="rounded-md bg-olive-950/75 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                                                {index + 1}
                                            </span>
                                            <span
                                                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold backdrop-blur ${
                                                    saved
                                                        ? 'bg-emerald-500/90 text-white'
                                                        : 'bg-mustard/95 text-olive-950'
                                                }`}
                                            >
                                                {saved ? 'Saved' : 'Preview'}
                                            </span>
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-olive-950/80 to-transparent p-2 pt-8 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                                            <button
                                                type="button"
                                                title="Use as cover"
                                                onClick={() =>
                                                    setCoverFromGallery(item)
                                                }
                                                className="inline-flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1.5 text-[11px] font-semibold text-olive-900"
                                            >
                                                <Star className="h-3.5 w-3.5" />
                                                Cover
                                            </button>
                                            <button
                                                type="button"
                                                title="Remove"
                                                onClick={() =>
                                                    removeGallery(item.id)
                                                }
                                                className="rounded-lg bg-white/95 p-1.5 text-rose-600"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}

                            {galleryCount < MAX_GALLERY ? (
                                <li>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            galleryInput.current?.click()
                                        }
                                        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-olive-300 bg-white/70 text-olive-600 transition hover:border-mustard hover:bg-mustard/5 hover:text-olive-900"
                                    >
                                        <ImagePlus className="h-6 w-6" />
                                        <span className="text-xs font-semibold">
                                            Add more
                                        </span>
                                    </button>
                                </li>
                            ) : null}
                        </ul>
                    ) : (
                        <button
                            type="button"
                            onClick={() => galleryInput.current?.click()}
                            className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-olive-300 bg-white/80 px-4 py-12 text-center transition hover:border-mustard hover:bg-mustard/5"
                        >
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-olive-50 ring-1 ring-olive-100">
                                <ImagePlus className="h-6 w-6 text-olive-700" />
                            </span>
                            <span>
                                <span className="block text-sm font-semibold text-olive-950">
                                    Drop gallery photos here
                                </span>
                                <span className="mt-1 block text-xs text-olive-500">
                                    Or click to multi-select · up to{' '}
                                    {MAX_GALLERY} images
                                </span>
                            </span>
                        </button>
                    )}
                </DropZone>
            </div>

            {localError ? (
                <p className="text-sm text-rose-600">{localError}</p>
            ) : null}

            <ListingImageCropModal
                show={Boolean(cropState)}
                imageSrc={cropState?.imageSrc}
                originalFile={cropState?.originalFile || null}
                fileName={cropState?.fileName}
                aspect={cropState?.aspect || 4 / 3}
                cropShape={cropState?.cropShape || 'rect'}
                title={
                    cropState?.kind === 'logo'
                        ? 'Crop logo'
                        : cropState?.kind === 'poster'
                          ? 'Crop poster'
                          : cropState?.kind === 'gallery'
                            ? queueTotal > 1
                                ? `Crop gallery photo (${cropping}/${queueTotal})`
                                : 'Crop gallery photo'
                            : 'Crop cover image'
                }
                onCancel={() => {
                    setCropState(null);
                    setQueue([]);
                    setQueueTotal(0);
                }}
                onComplete={finishCrop}
            />
        </div>
    );
}
