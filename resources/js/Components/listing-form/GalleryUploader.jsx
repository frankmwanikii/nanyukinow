import ListingImageCropModal from './ListingImageCropModal';
import MediaAddDialog from './MediaAddDialog';
import MediaLightbox from './MediaLightbox';
import FieldLabel from './FieldLabel';
import { field, help, label } from './fieldStyles';
import { srcToDataUrl } from '@/utils/cropImage';
import {
    Expand,
    ImagePlus,
    Images,
    Loader2,
    RefreshCw,
    Star,
    Trash2,
    Upload,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const MAX_BYTES = 15 * 1024 * 1024;
const DEFAULT_MAX_GALLERY = 12;

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

function MediaToolbar({ onView, onReplace, onRemove }) {
    const chip =
        'inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-wide shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';

    return (
        <div
            role="group"
            aria-label="Image actions"
            className="flex max-w-[calc(100%-0.75rem)] flex-wrap items-center justify-center gap-2"
        >
            {onView ? (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onView?.(e);
                    }}
                    className={`${chip} bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25`}
                >
                    <Expand className="h-3.5 w-3.5" strokeWidth={2.25} />
                    View
                </button>
            ) : null}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onReplace?.(e);
                }}
                className={`${chip} bg-mustard text-olive-950 ring-1 ring-mustard/40 hover:bg-white`}
            >
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.25} />
                Replace
            </button>
            {onRemove ? (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove?.(e);
                    }}
                    className={`${chip} bg-rose-500/20 text-rose-100 ring-1 ring-rose-300/35 hover:bg-rose-500/35`}
                >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2.25} />
                    Remove
                </button>
            ) : null}
        </div>
    );
}

function HoverActions({ children }) {
    return (
        <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center bg-gradient-to-t from-olive-950/70 via-olive-950/25 to-transparent px-3 pb-3.5 pt-12 opacity-100 transition duration-200 ease-out sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100">
            <div className="pointer-events-auto">{children}</div>
        </div>
    );
}

/**
 * Separate cover + logo previews; action pills appear on hover over the image.
 */
function CoverLogoStage({
    coverPreview,
    logoPreview,
    hideLogo = false,
    onBrowseCover,
    onBrowseLogo,
    onOpenLibraryCover = null,
    onOpenLibraryLogo = null,
    onFileCover,
    onFileLogo,
    onViewCover,
    onViewLogo,
    onClearCover,
    onClearLogo,
    coverUrl,
    logoUrl,
    onCoverUrlChange,
    onLogoUrlChange,
    onSubmitCoverUrl,
    onSubmitLogoUrl,
    coverUrlError,
    logoUrlError,
}) {
    return (
        <div className="space-y-5">
            <div className="border border-olive-900/15 bg-olive-50/70 p-4 dark:border-olive-800 dark:bg-olive-950/50 sm:p-5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <FieldLabel as="p" required>
                            Cover image
                        </FieldLabel>
                        {coverPreview ? (
                            <span className="bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                                Set
                            </span>
                        ) : null}
                    </div>
                    {onOpenLibraryCover ? (
                        <button
                            type="button"
                            onClick={onOpenLibraryCover}
                            className="inline-flex items-center gap-1.5 bg-olive-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-olive-800 sm:text-sm"
                        >
                            <Images className="h-4 w-4" />
                            Open gallery
                        </button>
                    ) : null}
                </div>
                <p className={`${help} mb-3`}>
                    Full-bleed photo on listing cards. Crop & zoom before save.
                </p>
                <DropZone
                    onFiles={onFileCover}
                    className="overflow-hidden rounded-xl bg-olive-100 ring-1 ring-olive-200/80 dark:bg-olive-950 dark:ring-olive-700"
                >
                    <div className="group relative h-56 w-full overflow-hidden bg-gradient-to-br from-olive-50 via-white to-olive-100/80 sm:h-72">
                        {coverPreview ? (
                            <>
                                <button
                                    type="button"
                                    onClick={onViewCover}
                                    className="absolute inset-0 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mustard"
                                    aria-label="View cover image full size"
                                >
                                    <img
                                        src={coverPreview}
                                        alt="Cover preview"
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.015]"
                                    />
                                </button>
                                <HoverActions>
                                    <MediaToolbar
                                        onView={onViewCover}
                                        onReplace={onBrowseCover}
                                        onRemove={onClearCover}
                                    />
                                </HoverActions>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={onBrowseCover}
                                className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center transition hover:bg-mustard/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mustard"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-olive-100 dark:bg-olive-900 dark:ring-olive-700">
                                    <Upload className="h-4 w-4 text-olive-700 dark:text-olive-300" />
                                </span>
                                <span className="text-sm font-semibold text-olive-900 dark:text-olive-100">
                                    Drop cover photo here
                                </span>
                                <span className="text-xs text-olive-500 dark:text-olive-400">
                                    Or click to upload · JPG, PNG, WebP
                                </span>
                            </button>
                        )}
                    </div>
                </DropZone>
                <div className="mt-3">
                    <label className={label} htmlFor="cover_image_url">
                        Cover image URL (optional)
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                            id="cover_image_url"
                            type="url"
                            className={field}
                            value={coverUrl}
                            onChange={(e) => onCoverUrlChange?.(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    onSubmitCoverUrl?.();
                                }
                            }}
                            placeholder="https://…/cover.jpg"
                        />
                        <button
                            type="button"
                            onClick={onSubmitCoverUrl}
                            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-olive-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-olive-800"
                        >
                            Use URL
                        </button>
                    </div>
                    {coverUrlError ? (
                        <p className="mt-1.5 text-sm text-rose-600">
                            {coverUrlError}
                        </p>
                    ) : null}
                </div>
            </div>

            {!hideLogo ? (
            <div className="rounded-2xl bg-olive-50/70 p-4 ring-1 ring-olive-100 dark:bg-olive-950/50 dark:ring-olive-800 sm:p-5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className={label}>Logo</p>
                        <span className="rounded-full bg-olive-100 px-2 py-0.5 text-[10px] font-semibold text-olive-700">
                            Optional
                        </span>
                    </div>
                    {onOpenLibraryLogo ? (
                        <button
                            type="button"
                            onClick={onOpenLibraryLogo}
                            className="inline-flex items-center gap-1.5 rounded-full bg-olive-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-olive-800 sm:text-sm"
                        >
                            <Images className="h-4 w-4" />
                            Open gallery
                        </button>
                    ) : null}
                </div>
                <p className={`${help} mb-3`}>
                    Round badge on listing cards. Square crop recommended.
                </p>
                <div className="flex flex-wrap items-start gap-4">
                    <DropZone onFiles={onFileLogo} className="shrink-0">
                        <div className="group relative">
                            {logoPreview ? (
                                <div className="relative h-24 w-24 overflow-hidden rounded-full bg-white shadow-soft ring-2 ring-olive-200 dark:bg-olive-900 dark:ring-olive-700 sm:h-28 sm:w-28">
                                    <button
                                        type="button"
                                        onClick={onViewLogo}
                                        className="absolute inset-0 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard"
                                        aria-label="View logo full size"
                                    >
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                        />
                                    </button>
                                    <HoverActions>
                                        <MediaToolbar
                                            onView={onViewLogo}
                                            onReplace={onBrowseLogo}
                                            onRemove={onClearLogo}
                                        />
                                    </HoverActions>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={onBrowseLogo}
                                    className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed border-olive-300 bg-white text-olive-600 transition hover:border-mustard hover:bg-mustard/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard dark:border-olive-700 dark:bg-olive-950 dark:text-olive-400 dark:hover:border-mustard dark:hover:bg-mustard/10 sm:h-28 sm:w-28"
                                >
                                    <ImagePlus className="h-5 w-5" />
                                    <span className="text-[11px] font-semibold text-olive-900 dark:text-olive-100">
                                        Add logo
                                    </span>
                                </button>
                            )}
                        </div>
                    </DropZone>
                    <div className="min-w-0 flex-1 basis-[14rem]">
                        <label className={label} htmlFor="logo_image_url">
                            Logo image URL (optional)
                        </label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                                id="logo_image_url"
                                type="url"
                                className={field}
                                value={logoUrl}
                                onChange={(e) =>
                                    onLogoUrlChange?.(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        onSubmitLogoUrl?.();
                                    }
                                }}
                                placeholder="https://…/logo.png"
                            />
                            <button
                                type="button"
                                onClick={onSubmitLogoUrl}
                                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-olive-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-olive-800"
                            >
                                Use URL
                            </button>
                        </div>
                        {logoUrlError ? (
                            <p className="mt-1.5 text-sm text-rose-600">
                                {logoUrlError}
                            </p>
                        ) : (
                            <p className={help}>
                                Or paste a direct link to a square logo image.
                            </p>
                        )}
                    </div>
                </div>
            </div>
            ) : null}
        </div>
    );
}

function PosterSlot({
    preview,
    onBrowse,
    onOpenLibrary = null,
    onFile,
    onClear,
    onView,
}) {
    return (
        <div className="max-w-[14rem]">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className={label}>Event poster</p>
                {onOpenLibrary ? (
                    <button
                        type="button"
                        onClick={onOpenLibrary}
                        className="inline-flex items-center gap-1.5 rounded-full bg-olive-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-olive-800"
                    >
                        <Images className="h-3.5 w-3.5" />
                        Open gallery
                    </button>
                ) : null}
            </div>
            <p className={`${help} mb-2.5`}>Portrait poster on event cards.</p>
            <DropZone onFiles={onFile} className="overflow-hidden rounded-2xl">
                {preview ? (
                    <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-olive-200/80">
                        <button
                            type="button"
                            onClick={onView}
                            className="absolute inset-0 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mustard"
                            aria-label="View event poster full size"
                        >
                            <img
                                src={preview}
                                alt="Event poster"
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                            />
                        </button>
                        <HoverActions>
                            <MediaToolbar
                                onView={onView}
                                onReplace={onBrowse}
                                onRemove={onClear}
                            />
                        </HoverActions>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onBrowse}
                        className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-olive-50 via-white to-olive-100/80 text-olive-600 ring-1 ring-dashed ring-olive-300 transition hover:bg-mustard/5 hover:ring-mustard"
                    >
                        <ImagePlus className="h-5 w-5" />
                        <span className="text-xs font-semibold text-olive-900">
                            Add poster
                        </span>
                    </button>
                )}
            </DropZone>
        </div>
    );
}

/**
 * Cover + logo + multi gallery with crop/zoom, queue progress, lightbox, and previews.
 */
export default function GalleryUploader({
    coverPreview,
    logoPreview,
    posterPreview,
    galleryItems = [],
    showPoster = false,
    libraryRoute = null,
    onCoverChange,
    onLogoChange,
    onPosterChange,
    onGalleryChange,
    errors = {},
    maxGallery = DEFAULT_MAX_GALLERY,
    maxPerSpace = null,
    categorized = false,
    spaceOptions = [],
    hideGallery = false,
    hideLogo = false,
}) {
    const MAX_GALLERY =
        maxGallery === 0 || maxGallery === '0'
            ? 0
            : Math.max(1, Number(maxGallery) || DEFAULT_MAX_GALLERY);
    const MAX_PER_SPACE =
        categorized && maxPerSpace != null
            ? Math.max(0, Number(maxPerSpace) || 0)
            : null;
    const coverInput = useRef(null);
    const logoInput = useRef(null);
    const posterInput = useRef(null);
    const galleryInput = useRef(null);

    const [cropState, setCropState] = useState(null);
    const [queue, setQueue] = useState([]);
    const [queueTotal, setQueueTotal] = useState(0);
    const [localError, setLocalError] = useState(null);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [addOpen, setAddOpen] = useState(false);
    const [addTarget, setAddTarget] = useState('gallery'); // cover | logo | poster
    const [addInitialPanel, setAddInitialPanel] = useState('menu');
    const [galleryUrl, setGalleryUrl] = useState('');
    const [galleryUrlError, setGalleryUrlError] = useState(null);
    const [coverUrlDraft, setCoverUrlDraft] = useState('');
    const [logoUrlDraft, setLogoUrlDraft] = useState('');
    const [coverUrlError, setCoverUrlError] = useState(null);
    const [logoUrlError, setLogoUrlError] = useState(null);
    const [activeSpace, setActiveSpace] = useState(
        () => spaceOptions[0]?.value || 'bedroom',
    );
    const pendingSpaceRef = useRef(spaceOptions[0]?.value || 'bedroom');

    useEffect(() => {
        if (!categorized || !spaceOptions.length) return;
        const stillValid = spaceOptions.some((s) => s.value === activeSpace);
        if (!stillValid) {
            setActiveSpace(spaceOptions[0].value);
            pendingSpaceRef.current = spaceOptions[0].value;
        }
    }, [categorized, spaceOptions, activeSpace]);

    const resolveSpaceMeta = (kind) => {
        const allowed = spaceOptions.some((s) => s.value === kind)
            ? kind
            : spaceOptions[0]?.value || 'bedroom';
        const match = spaceOptions.find((s) => s.value === allowed);
        return {
            kind: allowed,
            label: match?.label || 'Bedroom',
        };
    };

    const selectSpace = (kind) => {
        setActiveSpace(kind);
        pendingSpaceRef.current = kind;
    };

    const lightboxItems = useMemo(() => {
        const items = [];
        if (coverPreview) {
            items.push({
                src: coverPreview,
                label: 'Cover image',
                hint: 'Listing card',
            });
        }
        if (logoPreview) {
            items.push({
                src: logoPreview,
                label: 'Logo',
                hint: 'Card badge',
            });
        }
        if (showPoster && posterPreview) {
            items.push({
                src: posterPreview,
                label: 'Event poster',
                hint: 'Portrait',
            });
        }
        galleryItems.forEach((item, index) => {
            const src = item.preview || item.url;
            if (!src) return;
            items.push({
                src,
                label: item.label
                    ? `${item.label} · ${index + 1}`
                    : `Gallery ${index + 1}`,
                hint: item.url && !item.file ? 'Saved' : 'Preview',
            });
        });
        return items;
    }, [coverPreview, logoPreview, posterPreview, galleryItems, showPoster]);

    const openLightboxAt = (src) => {
        const index = lightboxItems.findIndex((item) => item.src === src);
        if (index >= 0) setLightboxIndex(index);
    };

    const openCrop = async (file, kind, aspect, cropShape = 'rect') => {
        if (!file) return;
        try {
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

        const spaceKind = categorized
            ? activeSpace || spaceOptions[0]?.value || 'bedroom'
            : 'bedroom';
        const spaceCount = categorized
            ? galleryItems.filter(
                  (g) =>
                      resolveSpaceMeta(g.kind).kind === spaceKind,
              ).length
            : galleryItems.length;
        const spaceCap =
            MAX_PER_SPACE != null ? MAX_PER_SPACE : MAX_GALLERY;
        const remainingOverall = MAX_GALLERY - galleryItems.length;
        const remainingSpace = spaceCap - spaceCount;
        const remaining = Math.min(remainingOverall, remainingSpace);

        if (remaining <= 0) {
            setLocalError(
                categorized && MAX_PER_SPACE != null && remainingSpace <= 0
                    ? `You can add up to ${MAX_PER_SPACE} photos in ${resolveSpaceMeta(spaceKind).label}.`
                    : `You can upload up to ${MAX_GALLERY} gallery photos.`,
            );
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
        pendingSpaceRef.current = spaceKind;
        openCrop(accepted[0], 'gallery', 4 / 3);
    };

    const addGalleryUrls = (urls, spaceKind = null) => {
        const list = (urls || []).filter(
            (u) => typeof u === 'string' && u.trim() !== '',
        );
        if (!list.length) return;

        const targetKind =
            spaceKind ||
            (categorized ? activeSpace : null) ||
            pendingSpaceRef.current ||
            spaceOptions[0]?.value ||
            'bedroom';
        const spaceCount = categorized
            ? galleryItems.filter(
                  (g) => resolveSpaceMeta(g.kind).kind === targetKind,
              ).length
            : galleryItems.length;
        const spaceCap =
            MAX_PER_SPACE != null ? MAX_PER_SPACE : MAX_GALLERY;
        const remainingOverall = MAX_GALLERY - galleryItems.length;
        const remainingSpace = spaceCap - spaceCount;
        const remaining = Math.min(remainingOverall, remainingSpace);

        if (remaining <= 0) {
            setLocalError(
                categorized && MAX_PER_SPACE != null && remainingSpace <= 0
                    ? `You can add up to ${MAX_PER_SPACE} photos in ${resolveSpaceMeta(targetKind).label}.`
                    : `You can upload up to ${MAX_GALLERY} gallery photos.`,
            );
            return;
        }

        const existing = new Set(
            galleryItems.map((g) => g.url || g.preview).filter(Boolean),
        );
        const nextUrls = list
            .map((u) => u.trim())
            .filter((u) => !existing.has(u))
            .slice(0, remaining);

        if (!nextUrls.length) {
            setLocalError('Those images are already in the gallery.');
            return;
        }

        const space = resolveSpaceMeta(targetKind);

        setLocalError(null);
        const next = [
            ...galleryItems,
            ...nextUrls.map((url) => ({
                id: `g-url-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                file: null,
                preview: url,
                url,
                kind: space.kind,
                label: space.label,
            })),
        ];
        onGalleryChange?.(next);
    };

    const openAddMenu = (target = 'poster', { panel = 'menu' } = {}) => {
        // Members: go straight to device upload.
        if (!libraryRoute) {
            if (target === 'gallery') {
                openGalleryPicker();
                return;
            }
            if (target === 'cover') {
                coverInput.current?.click();
                return;
            }
            if (target === 'logo') {
                logoInput.current?.click();
                return;
            }
            if (target === 'poster') {
                posterInput.current?.click();
                return;
            }
        }

        // Admin: Upload / Grab from gallery / Paste URL.
        if (target === 'gallery' && galleryItems.length >= MAX_GALLERY) {
            setLocalError(`You can upload up to ${MAX_GALLERY} gallery photos.`);
            return;
        }
        setLocalError(null);
        setAddTarget(target);
        setAddInitialPanel(
            libraryRoute && panel === 'library' ? 'library' : 'menu',
        );
        setAddOpen(true);
    };

    const openGalleryPicker = () => {
        const spaceKind = categorized
            ? activeSpace || spaceOptions[0]?.value || 'bedroom'
            : 'bedroom';
        const spaceCount = categorized
            ? galleryItems.filter(
                  (g) =>
                      resolveSpaceMeta(g.kind).kind === spaceKind,
              ).length
            : galleryItems.length;
        const spaceCap =
            MAX_PER_SPACE != null ? MAX_PER_SPACE : MAX_GALLERY;
        const remainingOverall = MAX_GALLERY - galleryItems.length;
        const remainingSpace = spaceCap - spaceCount;

        if (remainingOverall <= 0) {
            setLocalError(`You can upload up to ${MAX_GALLERY} gallery photos.`);
            return;
        }
        if (remainingSpace <= 0) {
            setLocalError(
                categorized && MAX_PER_SPACE != null
                    ? `You can add up to ${MAX_PER_SPACE} photos in ${resolveSpaceMeta(spaceKind).label}.`
                    : `You can upload up to ${MAX_GALLERY} gallery photos.`,
            );
            return;
        }
        setLocalError(null);
        pendingSpaceRef.current = spaceKind;
        galleryInput.current?.click();
    };

    /** Admin-only: jump straight into the media library picker. */
    const openAdminGallery = (target = 'gallery') => {
        openAddMenu(target, { panel: 'library' });
    };

    const parseImageUrl = (raw, setError) => {
        const value = (raw || '').trim();
        if (!value) {
            setError('Paste an image URL.');
            return null;
        }
        try {
            const parsed = new URL(value);
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                setError('URL must start with http:// or https://');
                return null;
            }
        } catch {
            setError('That does not look like a valid URL.');
            return null;
        }
        setError(null);
        return value;
    };

    const submitGalleryUrl = () => {
        const raw = parseImageUrl(galleryUrl, setGalleryUrlError);
        if (!raw) return;
        addGalleryUrls([raw]);
        setGalleryUrl('');
    };

    const submitCoverUrl = () => {
        const raw = parseImageUrl(coverUrlDraft, setCoverUrlError);
        if (!raw) return;
        applySlotUrl('cover', raw);
        setCoverUrlDraft('');
    };

    const submitLogoUrl = () => {
        const raw = parseImageUrl(logoUrlDraft, setLogoUrlError);
        if (!raw) return;
        applySlotUrl('logo', raw);
        setLogoUrlDraft('');
    };

    const handleAddUpload = () => {
        if (addTarget === 'cover') coverInput.current?.click();
        else if (addTarget === 'logo') logoInput.current?.click();
        else if (addTarget === 'poster') posterInput.current?.click();
        else {
            pendingSpaceRef.current = categorized
                ? activeSpace || spaceOptions[0]?.value || 'bedroom'
                : 'bedroom';
            galleryInput.current?.click();
        }
    };

    const applySlotUrl = (kind, url) => {
        if (!url) return;
        if (kind === 'cover') {
            onCoverChange?.({ file: null, preview: url, url });
        } else if (kind === 'logo') {
            onLogoChange?.({ file: null, preview: url, url });
        } else if (kind === 'poster') {
            onPosterChange?.({ file: null, preview: url, url });
        }
    };

    const handlePickUrls = (urls) => {
        if (addTarget === 'gallery') {
            addGalleryUrls(urls);
            return;
        }
        applySlotUrl(addTarget, urls?.[0]);
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
            const space = resolveSpaceMeta(
                categorized
                    ? pendingSpaceRef.current || activeSpace
                    : spaceOptions[0]?.value || 'bedroom',
            );
            const next = [
                ...galleryItems,
                {
                    id: `g-${Date.now()}-${Math.random()}`,
                    file,
                    preview,
                    url: null,
                    kind: space.kind,
                    label: space.label,
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

    const updateGallerySpace = (id, kind) => {
        const match = spaceOptions.find((s) => s.value === kind);
        onGalleryChange?.(
            galleryItems.map((g) =>
                g.id === id
                    ? {
                          ...g,
                          kind: resolveSpaceMeta(kind).kind,
                          label: resolveSpaceMeta(kind).label,
                      }
                    : g,
            ),
        );
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
    const galleryPct =
        MAX_GALLERY > 0 ? Math.round((galleryCount / MAX_GALLERY) * 100) : 0;
    const activeSpaceMeta = resolveSpaceMeta(activeSpace);
    const itemsBySpace = useMemo(() => {
        const map = new Map();
        spaceOptions.forEach((opt) => map.set(opt.value, []));
        galleryItems.forEach((item) => {
            const key = resolveSpaceMeta(item.kind).kind;
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(item);
        });
        return map;
    }, [galleryItems, spaceOptions]);
    const activeSpaceItems = categorized
        ? itemsBySpace.get(activeSpace) || []
        : galleryItems;
    const activeSpaceRemaining =
        MAX_PER_SPACE != null
            ? Math.max(0, MAX_PER_SPACE - activeSpaceItems.length)
            : Math.max(0, MAX_GALLERY - galleryCount);
    const activeSpaceFull =
        categorized && MAX_PER_SPACE != null
            ? activeSpaceItems.length >= MAX_PER_SPACE
            : galleryCount >= MAX_GALLERY;
    const galleryFull = galleryCount >= MAX_GALLERY;
    const canAddToActiveSpace = !galleryFull && !activeSpaceFull;
    const cropping =
        cropState?.kind === 'gallery' && queueTotal > 0
            ? queueTotal - queue.length + 1
            : 0;
    const cropPct =
        queueTotal > 0 ? Math.round((cropping / queueTotal) * 100) : 0;

    const renderGalleryTile = (item, index) => {
        const src = item.preview || item.url;
        const saved = Boolean(item.url) && !item.file;
        return (
            <li
                key={item.id}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-olive-200/80 dark:bg-olive-950 dark:ring-olive-700"
            >
                <button
                    type="button"
                    onClick={() => src && openLightboxAt(src)}
                    className="relative block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mustard"
                    aria-label={`View gallery photo ${index + 1}`}
                >
                    <img
                        src={src}
                        alt={
                            item.label
                                ? `${item.label} photo ${index + 1}`
                                : `Gallery ${index + 1}`
                        }
                        className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-olive-950/70 via-transparent to-transparent opacity-70 transition group-hover:opacity-100" />
                    <span className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-olive-900 opacity-0 shadow-sm transition group-hover:opacity-100">
                        <Expand className="h-3.5 w-3.5" />
                        View
                    </span>
                </button>

                <div className="pointer-events-none absolute left-2 top-2 flex gap-1">
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

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-2 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <button
                        type="button"
                        title="Use as cover"
                        onClick={(e) => {
                            e.stopPropagation();
                            setCoverFromGallery(item);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1.5 text-[11px] font-semibold text-olive-900 shadow-sm ring-1 ring-black/5"
                    >
                        <Star className="h-3.5 w-3.5" />
                        Cover
                    </button>
                    <button
                        type="button"
                        title="Remove"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeGallery(item.id);
                        }}
                        className="rounded-lg bg-white/95 p-1.5 text-rose-600 shadow-sm ring-1 ring-rose-100"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
                {categorized && spaceOptions.length ? (
                    <div className="border-t border-olive-100 p-2 dark:border-olive-800">
                        <label
                            className="sr-only"
                            htmlFor={`gallery-space-${item.id}`}
                        >
                            Move to room
                        </label>
                        <select
                            id={`gallery-space-${item.id}`}
                            className="w-full rounded-lg border-0 bg-olive-50 py-1.5 pl-2 pr-7 text-[11px] font-semibold text-olive-900 ring-1 ring-olive-200 focus:ring-2 focus:ring-mustard dark:bg-olive-900 dark:text-olive-100 dark:ring-olive-700"
                            value={resolveSpaceMeta(item.kind).kind}
                            onChange={(e) =>
                                updateGallerySpace(item.id, e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                        >
                            {spaceOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : null}
            </li>
        );
    };

    return (
        <div className="space-y-8">
            {addOpen ? (
                <MediaAddDialog
                    open
                    target={addTarget}
                    onClose={() => {
                        setAddOpen(false);
                        setAddInitialPanel('menu');
                    }}
                    libraryRoute={libraryRoute}
                    initialPanel={addInitialPanel}
                    remaining={
                        addTarget === 'gallery'
                            ? MAX_GALLERY - galleryCount
                            : 1
                    }
                    onUpload={handleAddUpload}
                    onPickUrls={handlePickUrls}
                />
            ) : (
                <>
            <CoverLogoStage
                coverPreview={coverPreview}
                logoPreview={logoPreview}
                hideLogo={hideLogo}
                onBrowseCover={() => openAddMenu('cover')}
                onBrowseLogo={() => openAddMenu('logo')}
                onOpenLibraryCover={
                    libraryRoute ? () => openAdminGallery('cover') : null
                }
                onOpenLibraryLogo={
                    libraryRoute ? () => openAdminGallery('logo') : null
                }
                onFileCover={(file) => handleSingle(file, 'cover')}
                onFileLogo={(file) => handleSingle(file, 'logo')}
                onViewCover={
                    coverPreview
                        ? () => openLightboxAt(coverPreview)
                        : undefined
                }
                onViewLogo={
                    logoPreview
                        ? () => openLightboxAt(logoPreview)
                        : undefined
                }
                onClearCover={() => {
                    setCoverUrlDraft('');
                    setCoverUrlError(null);
                    onCoverChange?.({
                        file: null,
                        preview: null,
                        url: '',
                    });
                }}
                onClearLogo={() => {
                    setLogoUrlDraft('');
                    setLogoUrlError(null);
                    onLogoChange?.({
                        file: null,
                        preview: null,
                        url: '',
                    });
                }}
                coverUrl={coverUrlDraft}
                logoUrl={logoUrlDraft}
                onCoverUrlChange={(value) => {
                    setCoverUrlDraft(value);
                    setCoverUrlError(null);
                }}
                onLogoUrlChange={(value) => {
                    setLogoUrlDraft(value);
                    setLogoUrlError(null);
                }}
                onSubmitCoverUrl={submitCoverUrl}
                onSubmitLogoUrl={submitLogoUrl}
                coverUrlError={coverUrlError}
                logoUrlError={logoUrlError}
            />

            {showPoster ? (
                <PosterSlot
                    preview={posterPreview}
                    onBrowse={() => openAddMenu('poster')}
                    onOpenLibrary={
                        libraryRoute ? () => openAdminGallery('poster') : null
                    }
                    onFile={(file) => handleSingle(file, 'poster')}
                    onView={
                        posterPreview
                            ? () => openLightboxAt(posterPreview)
                            : undefined
                    }
                    onClear={() =>
                        onPosterChange?.({
                            file: null,
                            preview: null,
                            url: null,
                        })
                    }
                />
            ) : null}

            {errors.cover || errors.image_url ? (
                <p className="-mt-4 text-sm text-rose-600">
                    {errors.cover || errors.image_url}
                </p>
            ) : null}

            {!hideGallery && MAX_GALLERY > 0 ? (
            <div className="rounded-2xl bg-olive-50/70 p-4 ring-1 ring-olive-100 dark:bg-olive-950/50 dark:ring-olive-800 sm:p-5">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className={label}>
                                {categorized ? 'Categorized gallery' : 'Gallery'}
                            </p>
                            <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-olive-700 ring-1 ring-olive-200 dark:bg-olive-900 dark:text-olive-200 dark:ring-olive-700">
                                {categorized && MAX_PER_SPACE != null
                                    ? `${galleryCount} total · ${MAX_PER_SPACE}/room`
                                    : `${galleryCount} / ${MAX_GALLERY}`}
                            </span>
                        </div>
                        {libraryRoute ? (
                            <button
                                type="button"
                                onClick={() => {
                                    pendingSpaceRef.current = activeSpace;
                                    openAdminGallery('gallery');
                                }}
                                disabled={galleryCount >= MAX_GALLERY}
                                className="inline-flex items-center gap-1.5 rounded-full bg-olive-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-olive-800 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                            >
                                <Images className="h-4 w-4" />
                                Open gallery
                            </button>
                        ) : null}
                    </div>
                    <p className={help}>
                        {categorized
                            ? 'Pick a room tab, then drop photos or click to multi-select for that space.'
                            : 'Multi-select photos, crop each one, then click any image to view full size.'}
                        {!categorized && libraryRoute
                            ? ' Admins can also pick from the media library.'
                            : ''}
                    </p>
                    <div className="mt-3 h-1.5 max-w-xs overflow-hidden rounded-full bg-olive-200/80">
                        <div
                            className="h-full rounded-full bg-mustard transition-all duration-300"
                            style={{ width: `${galleryPct}%` }}
                        />
                    </div>
                </div>

                {queueTotal > 0 && cropState?.kind === 'gallery' ? (
                    <div className="mt-4 rounded-xl bg-white px-4 py-3 ring-1 ring-olive-100 dark:bg-olive-950 dark:ring-olive-800">
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="inline-flex items-center gap-2 font-semibold text-olive-900 dark:text-olive-100">
                                <Loader2 className="h-4 w-4 animate-spin text-mustard" />
                                Cropping
                                {categorized
                                    ? ` ${activeSpaceMeta.label.toLowerCase()}`
                                    : ''}{' '}
                                photo {cropping} of {queueTotal}
                            </span>
                            <span className="text-xs font-semibold text-olive-500 dark:text-olive-400">
                                {cropPct}%
                            </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-olive-100 dark:bg-olive-800">
                            <div
                                className="h-full rounded-full bg-olive-800 transition-all duration-300 dark:bg-mustard"
                                style={{ width: `${cropPct}%` }}
                            />
                        </div>
                    </div>
                ) : null}

                {categorized && spaceOptions.length ? (
                    <div className="mt-4 space-y-4">
                        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {spaceOptions.map((opt) => {
                                const count = (itemsBySpace.get(opt.value) || [])
                                    .length;
                                const selected = activeSpace === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => selectSpace(opt.value)}
                                        className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-3.5 text-xs font-semibold transition sm:text-sm ${
                                            selected
                                                ? 'bg-olive-900 text-white dark:bg-mustard dark:text-earth-dusk'
                                                : 'bg-white text-olive-800 ring-1 ring-olive-200 hover:border-mustard hover:ring-mustard dark:bg-olive-900 dark:text-olive-100 dark:ring-olive-700'
                                        }`}
                                    >
                                        <span>{opt.label}</span>
                                        <span
                                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                                                selected
                                                    ? 'bg-white/20 text-white dark:bg-olive-950/20 dark:text-earth-dusk'
                                                    : count
                                                      ? 'bg-olive-100 text-olive-800 dark:bg-olive-800 dark:text-olive-100'
                                                      : 'bg-olive-50 text-olive-400 dark:bg-olive-950 dark:text-olive-500'
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-olive-100 dark:bg-olive-950/70 dark:ring-olive-800 sm:p-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                                        {activeSpaceMeta.label} photos
                                    </p>
                                    <p className="text-xs text-olive-500 dark:text-olive-400">
                                        {MAX_PER_SPACE != null
                                            ? `${activeSpaceItems.length} / ${MAX_PER_SPACE} in this room`
                                            : activeSpaceItems.length
                                              ? `${activeSpaceItems.length} photo${activeSpaceItems.length === 1 ? '' : 's'} in this room`
                                              : `No ${activeSpaceMeta.label.toLowerCase()} photos yet`}
                                        {activeSpaceRemaining > 0
                                            ? ` · ${activeSpaceRemaining} slot${activeSpaceRemaining === 1 ? '' : 's'} left here`
                                            : activeSpaceFull
                                              ? ' · Room limit reached'
                                              : ''}
                                    </p>
                                </div>
                            </div>

                            <DropZone
                                multiple
                                onFiles={(files) => {
                                    selectSpace(activeSpace);
                                    handleGalleryPick(files);
                                }}
                                disabled={!canAddToActiveSpace}
                                className="min-w-0"
                            >
                                {activeSpaceItems.length ? (
                                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                        {activeSpaceItems.map((item, index) =>
                                            renderGalleryTile(item, index),
                                        )}
                                        {canAddToActiveSpace ? (
                                            <li>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        selectSpace(activeSpace);
                                                        openGalleryPicker();
                                                    }}
                                                    className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-olive-300 bg-olive-50/70 text-olive-600 transition hover:border-mustard hover:bg-mustard/5 hover:text-olive-900 dark:border-olive-700 dark:bg-olive-900/50 dark:text-olive-400 dark:hover:border-mustard dark:hover:bg-mustard/10 dark:hover:text-olive-100"
                                                >
                                                    <ImagePlus className="h-6 w-6" />
                                                    <span className="px-2 text-center text-xs font-semibold">
                                                        Add to{' '}
                                                        {activeSpaceMeta.label}
                                                    </span>
                                                </button>
                                            </li>
                                        ) : null}
                                    </ul>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            selectSpace(activeSpace);
                                            openGalleryPicker();
                                        }}
                                        disabled={!canAddToActiveSpace}
                                        className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-olive-300 bg-olive-50/80 px-4 py-10 text-center transition hover:border-mustard hover:bg-mustard/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-olive-700 dark:bg-olive-900/40 dark:hover:border-mustard dark:hover:bg-mustard/10"
                                    >
                                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white ring-1 ring-olive-100 dark:bg-olive-950 dark:ring-olive-700">
                                            <ImagePlus className="h-6 w-6 text-olive-700 dark:text-olive-300" />
                                        </span>
                                        <span>
                                            <span className="block text-sm font-semibold text-olive-950 dark:text-olive-50">
                                                Add {activeSpaceMeta.label}{' '}
                                                photos
                                            </span>
                                            <span className="mt-1 block text-xs text-olive-500">
                                                Drop here or click to multi-select
                                                {MAX_PER_SPACE != null
                                                    ? ` · up to ${MAX_PER_SPACE}`
                                                    : ''}
                                            </span>
                                        </span>
                                    </button>
                                )}
                            </DropZone>
                        </div>
                    </div>
                ) : (
                <DropZone
                    multiple
                    onFiles={handleGalleryPick}
                    disabled={galleryCount >= MAX_GALLERY}
                    className="mt-4"
                >
                    {galleryItems.length ? (
                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {galleryItems.map((item, index) =>
                                renderGalleryTile(item, index),
                            )}

                            {galleryCount < MAX_GALLERY ? (
                                <li>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            libraryRoute
                                                ? openAddMenu('gallery')
                                                : openGalleryPicker()
                                        }
                                        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-olive-300 bg-white/70 text-olive-600 transition hover:border-mustard hover:bg-mustard/5 hover:text-olive-900 dark:border-olive-700 dark:bg-olive-950/70 dark:text-olive-400 dark:hover:border-mustard dark:hover:bg-mustard/10 dark:hover:text-olive-100"
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
                            onClick={() =>
                                libraryRoute
                                    ? openAddMenu('gallery')
                                    : openGalleryPicker()
                            }
                            className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-olive-300 bg-white/80 px-4 py-12 text-center transition hover:border-mustard hover:bg-mustard/5 dark:border-olive-700 dark:bg-olive-950/80 dark:hover:border-mustard dark:hover:bg-mustard/10"
                        >
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-olive-50 ring-1 ring-olive-100 dark:bg-olive-900 dark:ring-olive-700">
                                <ImagePlus className="h-6 w-6 text-olive-700 dark:text-olive-300" />
                            </span>
                            <span>
                                <span className="block text-sm font-semibold text-olive-950 dark:text-olive-50">
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
                )}

                {canAddToActiveSpace ? (
                    <div className="mt-4">
                        <label className={label} htmlFor="gallery_image_url">
                            {categorized
                                ? `Image URL for ${activeSpaceMeta.label} (optional)`
                                : 'Image URL (optional)'}
                        </label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                                id="gallery_image_url"
                                type="url"
                                className={field}
                                value={galleryUrl}
                                onChange={(e) => {
                                    setGalleryUrl(e.target.value);
                                    setGalleryUrlError(null);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        submitGalleryUrl();
                                    }
                                }}
                                placeholder="https://…/photo.jpg"
                                disabled={!canAddToActiveSpace}
                            />
                            <button
                                type="button"
                                onClick={submitGalleryUrl}
                                disabled={!canAddToActiveSpace}
                                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-olive-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-olive-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {categorized
                                    ? `Add to ${activeSpaceMeta.label}`
                                    : 'Add URL'}
                            </button>
                        </div>
                        {galleryUrlError ? (
                            <p className="mt-1.5 text-sm text-rose-600">
                                {galleryUrlError}
                            </p>
                        ) : (
                            <p className={help}>
                                {categorized
                                    ? `Paste a direct image link — it will be added under ${activeSpaceMeta.label}.`
                                    : 'Paste a direct image link if you already host the photo online.'}
                            </p>
                        )}
                    </div>
                ) : null}
            </div>
            ) : null}

            {localError ? (
                <p className="text-sm text-rose-600">{localError}</p>
            ) : null}
                </>
            )}

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
            ) : null}
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

            {lightboxIndex != null ? (
                <MediaLightbox
                    items={lightboxItems}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onIndexChange={setLightboxIndex}
                />
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
