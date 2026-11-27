import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminButton,
    AdminCheckbox,
    AdminInput,
    PageHeader,
} from '@/Components/Admin/ui';
import UploadProgressBar from '@/Components/site/UploadProgressBar';
import { Head, useForm } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    Plus,
    Save,
    Trash2,
    Upload,
} from '@/Components/site/LucideCompat';
import axios from 'axios';
import { useRef, useState } from 'react';

function blankSlide() {
    return {
        id: `slide-${Date.now().toString(36)}`,
        image: '',
        imageMobile: '',
        alt: '',
        title: '',
        credit: '',
        showOnDesktop: true,
        showOnMobile: true,
    };
}

async function uploadHeroImage(file, uploadUrl, onProgress) {
    const csrf =
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') || '';
    const body = new FormData();
    body.append('image', file);

    const { data } = await axios.post(uploadUrl, body, {
        headers: {
            Accept: 'application/json',
            'X-CSRF-TOKEN': csrf,
            'X-Requested-With': 'XMLHttpRequest',
        },
        onUploadProgress: (event) => {
            if (!onProgress) return;
            if (!event.total) {
                onProgress(event.loaded > 0 ? 50 : 0);
                return;
            }
            onProgress(
                Math.max(
                    0,
                    Math.min(100, Math.round((event.loaded / event.total) * 100)),
                ),
            );
        },
    });

    return typeof data?.url === 'string' ? data.url.trim() : null;
}

function SlideCard({
    slide,
    index,
    total,
    uploadUrl,
    disabled,
    onChange,
    onMove,
    onRemove,
}) {
    const desktopRef = useRef(null);
    const mobileRef = useRef(null);
    const [uploadingField, setUploadingField] = useState(null);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const patch = (partial) => onChange(index, { ...slide, ...partial });

    const runUpload = async (field, file) => {
        if (!file || disabled || uploadingField) return;
        if (!String(file.type || '').startsWith('image/')) {
            setError('Choose a JPG, PNG, or WebP image.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('Images must be 10MB or smaller.');
            return;
        }

        setError(null);
        setUploadingField(field);
        setProgress(0);
        try {
            const url = await uploadHeroImage(file, uploadUrl, setProgress);
            if (!url) {
                setError('Could not upload that image. Try again.');
                return;
            }
            patch({ [field]: url });
        } catch (err) {
            setError(
                err?.response?.data?.errors?.image?.[0] ||
                    err?.response?.data?.message ||
                    'Could not upload that image. Try again.',
            );
        } finally {
            setUploadingField(null);
            setProgress(0);
        }
    };

    return (
        <section className="overflow-hidden border border-olive-200 bg-white dark:border-olive-800 dark:bg-olive-900">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-olive-100 px-4 py-3 dark:border-olive-800 sm:px-5">
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                        Slide {index + 1}
                    </h2>
                    {!slide.showOnDesktop || !slide.showOnMobile ? (
                        <p className="mt-0.5 text-xs font-medium text-olive-500">
                            {slide.showOnDesktop && !slide.showOnMobile
                                ? 'Desktop only'
                                : !slide.showOnDesktop && slide.showOnMobile
                                  ? 'Mobile only'
                                  : 'Hidden on all sizes'}
                        </p>
                    ) : null}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        disabled={disabled || index === 0}
                        onClick={() => onMove(index, -1)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-olive-200 text-olive-700 transition hover:border-mustard disabled:opacity-40 dark:border-olive-700 dark:text-olive-200"
                        aria-label="Move slide up"
                    >
                        <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        disabled={disabled || index >= total - 1}
                        onClick={() => onMove(index, 1)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-olive-200 text-olive-700 transition hover:border-mustard disabled:opacity-40 dark:border-olive-700 dark:text-olive-200"
                        aria-label="Move slide down"
                    >
                        <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        disabled={disabled || total <= 1}
                        onClick={() => onRemove(index)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-rose-200 text-rose-700 transition hover:bg-rose-50 disabled:opacity-40 dark:border-rose-900 dark:hover:bg-rose-950/40"
                        aria-label="Remove slide"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </header>

            <div className="grid gap-5 p-4 sm:grid-cols-[11rem_1fr] sm:p-5">
                <div className="space-y-3">
                    <div className="aspect-[4/5] overflow-hidden rounded-sm border border-olive-200 bg-olive-50 dark:border-olive-700 dark:bg-olive-950">
                        {slide.image ? (
                            <img
                                src={slide.image}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center px-3 text-center text-xs text-olive-500">
                                No image yet
                            </div>
                        )}
                    </div>
                    {slide.imageMobile ? (
                        <div className="overflow-hidden rounded-sm border border-olive-200 dark:border-olive-700">
                            <img
                                src={slide.imageMobile}
                                alt=""
                                className="h-20 w-full object-cover"
                            />
                            <p className="px-2 py-1 text-[10px] font-medium text-olive-500">
                                Mobile image
                            </p>
                        </div>
                    ) : null}
                </div>

                <div className="space-y-4">
                    <div>
                        <AdminInput
                            label="Desktop image URL"
                            value={slide.image || ''}
                            onChange={(e) => patch({ image: e.target.value })}
                            placeholder="/images/hero/… or https://…"
                            disabled={disabled || Boolean(uploadingField)}
                        />
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <input
                                ref={desktopRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    e.target.value = '';
                                    void runUpload('image', file);
                                }}
                            />
                            <AdminButton
                                type="button"
                                variant="secondary"
                                disabled={disabled || Boolean(uploadingField)}
                                onClick={() => desktopRef.current?.click()}
                            >
                                <Upload className="h-4 w-4" />
                                {uploadingField === 'image'
                                    ? `Uploading ${progress}%`
                                    : 'Upload'}
                            </AdminButton>
                        </div>
                    </div>

                    <div>
                        <AdminInput
                            label="Mobile image URL (optional)"
                            value={slide.imageMobile || ''}
                            onChange={(e) =>
                                patch({ imageMobile: e.target.value })
                            }
                            placeholder="Optional crop for phones"
                            disabled={disabled || Boolean(uploadingField)}
                        />
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <input
                                ref={mobileRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    e.target.value = '';
                                    void runUpload('imageMobile', file);
                                }}
                            />
                            <AdminButton
                                type="button"
                                variant="secondary"
                                disabled={disabled || Boolean(uploadingField)}
                                onClick={() => mobileRef.current?.click()}
                            >
                                <Upload className="h-4 w-4" />
                                {uploadingField === 'imageMobile'
                                    ? `Uploading ${progress}%`
                                    : 'Upload mobile'}
                            </AdminButton>
                            {slide.imageMobile ? (
                                <button
                                    type="button"
                                    disabled={disabled || Boolean(uploadingField)}
                                    onClick={() => patch({ imageMobile: '' })}
                                    className="text-sm font-semibold text-rose-700 hover:underline disabled:opacity-50"
                                >
                                    Clear mobile
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {uploadingField ? (
                        <UploadProgressBar
                            value={progress}
                            label="Uploading image…"
                        />
                    ) : null}

                    {error ? (
                        <p className="text-sm font-medium text-rose-700">
                            {error}
                        </p>
                    ) : null}

                    <div className="grid gap-3 sm:grid-cols-2">
                        <AdminInput
                            label="Title"
                            value={slide.title || ''}
                            onChange={(e) => patch({ title: e.target.value })}
                            placeholder="Laikipia plains"
                            disabled={disabled}
                        />
                        <AdminInput
                            label="Credit / caption"
                            value={slide.credit || ''}
                            onChange={(e) => patch({ credit: e.target.value })}
                            placeholder="Black rhinos near Nanyuki"
                            disabled={disabled}
                        />
                    </div>
                    <AdminInput
                        label="Alt text"
                        value={slide.alt || ''}
                        onChange={(e) => patch({ alt: e.target.value })}
                        placeholder="Describe the photo for accessibility"
                        disabled={disabled}
                    />

                    <div className="rounded-sm border border-olive-100 bg-olive-50/60 px-3 py-3 dark:border-olive-800 dark:bg-olive-950/40">
                        <p className="text-xs font-semibold text-olive-700 dark:text-olive-300">
                            Visibility
                        </p>
                        <p className="mt-1 text-xs text-olive-500">
                            Desktop is large screens (1024px and up). Mobile is
                            phones and tablets below that.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                            <AdminCheckbox
                                label="Show on desktop"
                                checked={slide.showOnDesktop !== false}
                                disabled={disabled}
                                onChange={(e) =>
                                    patch({ showOnDesktop: e.target.checked })
                                }
                            />
                            <AdminCheckbox
                                label="Show on mobile"
                                checked={slide.showOnMobile !== false}
                                disabled={disabled}
                                onChange={(e) =>
                                    patch({ showOnMobile: e.target.checked })
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Index({ slides = [], uploadUrl }) {
    const form = useForm({
        slides: (slides || []).map((slide) => ({
            id: slide.id || blankSlide().id,
            image: slide.image || '',
            imageMobile: slide.imageMobile || '',
            alt: slide.alt || '',
            title: slide.title || '',
            credit: slide.credit || '',
            showOnDesktop: slide.showOnDesktop !== false,
            showOnMobile: slide.showOnMobile !== false,
        })),
    });

    const setSlide = (index, next) => {
        form.setData(
            'slides',
            form.data.slides.map((slide, i) => (i === index ? next : slide)),
        );
    };

    const moveSlide = (index, delta) => {
        const target = index + delta;
        if (target < 0 || target >= form.data.slides.length) return;
        const next = [...form.data.slides];
        const [row] = next.splice(index, 1);
        next.splice(target, 0, row);
        form.setData('slides', next);
    };

    const removeSlide = (index) => {
        if (form.data.slides.length <= 1) return;
        form.setData(
            'slides',
            form.data.slides.filter((_, i) => i !== index),
        );
    };

    const addSlide = () => {
        form.setData('slides', [...form.data.slides, blankSlide()]);
    };

    const submit = (e) => {
        e.preventDefault();
        form.put(route('admin.hero-slider.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout>
            <Head title="Hero slider" />

            <PageHeader
                title="Hero slider"
                description="Homepage background photos. Upload a file or paste an image URL. Per slide, choose desktop, mobile, or both."
                actions={
                    <AdminButton
                        type="submit"
                        form="hero-slider-form"
                        disabled={form.processing}
                    >
                        <Save className="h-4 w-4" />
                        {form.processing ? 'Saving…' : 'Save slider'}
                    </AdminButton>
                }
            />

            <form
                id="hero-slider-form"
                onSubmit={submit}
                className="space-y-4"
            >
                {form.errors.slides ? (
                    <p className="text-sm font-medium text-rose-700">
                        {form.errors.slides}
                    </p>
                ) : null}

                {form.data.slides.map((slide, index) => (
                    <SlideCard
                        key={slide.id || `slide-${index}`}
                        slide={slide}
                        index={index}
                        total={form.data.slides.length}
                        uploadUrl={uploadUrl}
                        disabled={form.processing}
                        onChange={setSlide}
                        onMove={moveSlide}
                        onRemove={removeSlide}
                    />
                ))}

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <AdminButton
                        type="button"
                        variant="secondary"
                        disabled={form.processing}
                        onClick={addSlide}
                    >
                        <Plus className="h-4 w-4" />
                        Add slide
                        <span className="text-olive-500">
                            ({form.data.slides.length})
                        </span>
                    </AdminButton>
                    <AdminButton type="submit" disabled={form.processing}>
                        <Save className="h-4 w-4" />
                        {form.processing ? 'Saving…' : 'Save slider'}
                    </AdminButton>
                </div>
            </form>
        </AdminLayout>
    );
}
