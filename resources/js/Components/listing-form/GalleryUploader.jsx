import ListingImageCropModal from './ListingImageCropModal';
import { help, label } from './fieldStyles';
import { srcToDataUrl } from '@/utils/cropImage';
import { ImagePlus, Star, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

const MAX_BYTES = 15 * 1024 * 1024;
const MAX_GALLERY = 12;

function revoke(url) {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
}

/**
 * Cover + logo + multi gallery with crop/zoom and preview.
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
    const [localError, setLocalError] = useState(null);

    const openCrop = async (file, kind, aspect, cropShape = 'rect') => {
        try {
            const dataUrl = await srcToDataUrl(URL.createObjectURL(file));
            setCropState({
                kind,
                imageSrc: dataUrl,
                fileName: file.name || `${kind}.jpg`,
                aspect,
                cropShape,
            });
        } catch {
            setLocalError('Could not read that image.');
        }
    };

    const handleSingle = (file, kind) => {
        if (!file) return;
        if (file.size > MAX_BYTES) {
            setLocalError('Images must be under 15 MB.');
            return;
        }
        setLocalError(null);
        if (kind === 'cover') openCrop(file, 'cover', 4 / 3);
        if (kind === 'logo') openCrop(file, 'logo', 1, 'round');
        if (kind === 'poster') openCrop(file, 'poster', 3 / 4);
    };

    const handleGalleryPick = (files) => {
        const list = Array.from(files || []);
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
                { id: `g-${Date.now()}-${Math.random()}`, file, preview, url: null },
            ];
            onGalleryChange?.(next);

            const rest = queue.slice(1);
            setQueue(rest);
            setCropState(null);
            if (rest[0]) {
                openCrop(rest[0], 'gallery', 4 / 3);
                return;
            }
        }

        setCropState(null);
        setQueue([]);
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

    return (
        <div className="space-y-6">
            <div>
                <p className={label}>Cover image</p>
                <p className={help}>
                    This is what appears on listing cards. Crop and zoom before upload.
                </p>
                <div className="mt-3 flex flex-wrap items-start gap-4">
                    <button
                        type="button"
                        onClick={() => coverInput.current?.click()}
                        className="group relative flex aspect-[4/3] w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-olive-200 bg-olive-50/50 transition hover:border-mustard hover:bg-mustard/5"
                    >
                        {coverPreview ? (
                            <img
                                src={coverPreview}
                                alt="Cover preview"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="flex flex-col items-center gap-2 text-olive-600">
                                <Upload className="h-7 w-7" />
                                <span className="text-sm font-semibold">
                                    Upload cover
                                </span>
                            </span>
                        )}
                    </button>
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
                </div>
                {errors.cover || errors.image_url ? (
                    <p className="mt-1.5 text-sm text-rose-600">
                        {errors.cover || errors.image_url}
                    </p>
                ) : null}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <p className={label}>Logo</p>
                    <p className={help}>Round badge on the card (optional).</p>
                    <button
                        type="button"
                        onClick={() => logoInput.current?.click()}
                        className="mt-3 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-olive-200 bg-olive-50/50 transition hover:border-mustard"
                    >
                        {logoPreview ? (
                            <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <ImagePlus className="h-6 w-6 text-olive-500" />
                        )}
                    </button>
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
                </div>

                {showPoster ? (
                    <div>
                        <p className={label}>Event poster</p>
                        <p className={help}>Portrait poster shown on event cards.</p>
                        <button
                            type="button"
                            onClick={() => posterInput.current?.click()}
                            className="mt-3 flex aspect-[3/4] w-28 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-olive-200 bg-olive-50/50 transition hover:border-mustard"
                        >
                            {posterPreview ? (
                                <img
                                    src={posterPreview}
                                    alt="Poster preview"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <ImagePlus className="h-6 w-6 text-olive-500" />
                            )}
                        </button>
                        <input
                            ref={posterInput}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                handleSingle(e.target.files?.[0], 'poster');
                                e.target.value = '';
                            }}
                        />
                    </div>
                ) : null}
            </div>

            <div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className={label}>Gallery</p>
                        <p className={help}>
                            Multi-select photos, crop each one, preview before submit.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => galleryInput.current?.click()}
                        className="inline-flex items-center gap-2 rounded-xl bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-olive-800"
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

                {galleryItems.length ? (
                    <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {galleryItems.map((item, index) => (
                            <li
                                key={item.id}
                                className="group relative overflow-hidden rounded-xl ring-1 ring-olive-200"
                            >
                                <img
                                    src={item.preview || item.url}
                                    alt={`Gallery ${index + 1}`}
                                    className="aspect-[4/3] w-full object-cover"
                                />
                                <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                                    <button
                                        type="button"
                                        title="Use as cover"
                                        onClick={() => setCoverFromGallery(item)}
                                        className="rounded-lg bg-white/90 p-1.5 text-olive-900"
                                    >
                                        <Star className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        title="Remove"
                                        onClick={() => removeGallery(item.id)}
                                        className="rounded-lg bg-white/90 p-1.5 text-rose-600"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-olive-200 bg-olive-50/40 px-4 py-10 text-center text-sm text-olive-600">
                        No gallery photos yet — add a few to bring the listing to life.
                    </div>
                )}
            </div>

            {localError ? (
                <p className="text-sm text-rose-600">{localError}</p>
            ) : null}

            <ListingImageCropModal
                show={Boolean(cropState)}
                imageSrc={cropState?.imageSrc}
                fileName={cropState?.fileName}
                aspect={cropState?.aspect || 4 / 3}
                cropShape={cropState?.cropShape || 'rect'}
                title={
                    cropState?.kind === 'logo'
                        ? 'Crop logo'
                        : cropState?.kind === 'poster'
                          ? 'Crop poster'
                          : cropState?.kind === 'gallery'
                            ? 'Crop gallery photo'
                            : 'Crop cover image'
                }
                onCancel={() => {
                    setCropState(null);
                    setQueue([]);
                }}
                onComplete={finishCrop}
            />
        </div>
    );
}
