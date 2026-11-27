import AmenitiesPicker from './AmenitiesPicker';
import MediaAddDialog from './MediaAddDialog';
import ProductCategoryField from './ProductCategoryField';
import RichTextEditor from './RichTextEditor';
import { field, help, label } from './fieldStyles';
import {
    canUseEatDrinkFeature,
    eatDrinkMenuHelp,
    eatDrinkMenuImagesPerPage,
    eatDrinkMenuLimit,
    menuItemImages,
    normalizeTier,
    tierDisplayLabel,
} from '@/data/eatDrinkTierFeatures';
import {
    canUseStayFeature,
    coerceRoomTypes,
    roomTypeItemImages,
    stayRoomTypeHelp,
    stayRoomTypeImagesPerItem,
    stayRoomTypeLimit,
} from '@/data/stayTierFeatures';
import { POPULAR_ROOM_TYPES } from './categoryFieldConfig';
import ShoppingTierUpsell from './ShoppingTierUpsell';
import ServicesTierUpsell from './ServicesTierUpsell';
import EventsTierUpsell from './EventsTierUpsell';
import {
    canUseShoppingFeature,
    normalizeProductCurrency,
    PRODUCT_CURRENCIES,
    productCurrencyMeta,
    productItemImages,
    shoppingProductHelp,
    shoppingProductImagesPerItem,
    shoppingProductLimit,
} from '@/data/shoppingTierFeatures';
import {
    canUseServicesFeature,
    servicesPortfolioHelp,
    servicesPortfolioLimit,
} from '@/data/servicesTierFeatures';
import { canUseEventsFeature } from '@/data/eventsTierFeatures';
import { canUseThingsToDoFeature } from '@/data/thingsToDoTierFeatures';
import {
    formatGigWhenLabel,
    WEEKDAYS,
} from '@/utils/eatDrinkDetails';
import UploadProgressBar from '@/Components/site/UploadProgressBar';
import { uploadEditorMedia } from '@/utils/uploadEditorMedia';
import { Link } from '@inertiajs/react';
import {
    ImagePlus,
    Images,
    Plus,
    Trash2,
    X,
} from '@/Components/site/LucideCompat';
import { Component, useRef, useState } from 'react';

class SectionErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { failed: false };
    }

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        if (this.state.failed) {
            return (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                    This section hit a display error. Refresh the page and try
                    again — your other listing fields are still safe.
                </div>
            );
        }

        return this.props.children;
    }
}

function Section({ title, blurb, children }) {
    return (
        <div className="space-y-3 rounded-2xl border border-olive-200 bg-white p-4 sm:p-5 dark:border-olive-800 dark:bg-olive-950/60">
            <div>
                <h3 className="font-display text-base font-semibold text-olive-950 dark:text-white sm:text-lg">
                    {title}
                </h3>
                {blurb ? <p className={help}>{blurb}</p> : null}
            </div>
            {children}
        </div>
    );
}

function RowActions({ onRemove }) {
    return (
        <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 rounded-sm px-2 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
            aria-label="Remove"
        >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
        </button>
    );
}

/**
 * Single room-type title: pick a popular option or type a custom name.
 */
function RoomTitleField({ value, onChange, options = POPULAR_ROOM_TYPES, id }) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);
    const listId = `${id}-suggestions`;
    const query = value || '';

    const matches = (() => {
        const q = query.trim().toLowerCase();
        const pool = options.filter(Boolean);
        if (!q) return pool.slice(0, 10);
        return pool
            .filter((name) => name.toLowerCase().includes(q))
            .slice(0, 10);
    })();

    const exactMatch = options.some(
        (name) => name.toLowerCase() === query.trim().toLowerCase(),
    );

    return (
        <div ref={wrapRef} className="relative">
            <label className={label} htmlFor={id}>
                Room type title
            </label>
            <input
                id={id}
                className={field}
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                value={query}
                placeholder="Search popular types or type your own…"
                onChange={(e) => {
                    onChange(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => {
                    window.setTimeout(() => setOpen(false), 160);
                }}
                autoComplete="off"
            />
            {open && (matches.length > 0 || (query.trim() && !exactMatch)) ? (
                <ul
                    id={listId}
                    role="listbox"
                    className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-56 overflow-auto border border-olive-900/20 bg-white py-1.5 dark:border-olive-700 dark:bg-olive-900"
                >
                    {matches.map((name) => (
                        <li key={name} role="option">
                            <button
                                type="button"
                                className="w-full px-3.5 py-2.5 text-left text-sm font-medium text-olive-900 transition hover:bg-mustard/20 dark:text-olive-50 dark:hover:bg-mustard/15"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    onChange(name);
                                    setOpen(false);
                                }}
                            >
                                {name}
                            </button>
                        </li>
                    ))}
                    {query.trim() && !exactMatch ? (
                        <li role="option">
                            <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-semibold text-olive-900 transition hover:bg-olive-50 dark:text-mustard dark:hover:bg-olive-800"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    onChange(query.trim());
                                    setOpen(false);
                                }}
                            >
                                <Plus className="h-4 w-4 shrink-0" />
                                Add “{query.trim()}”
                            </button>
                        </li>
                    ) : null}
                </ul>
            ) : null}
            <p className={help}>Pick from popular types or add your own.</p>
        </div>
    );
}

/**
 * Logo slot for event sponsors: square frame, contain-fit preview, no tinted icon chip.
 */
function SponsorLogoField({ image, onPick, onClear }) {
    return (
        <div className="min-w-0">
            <p className={label}>Logo</p>
            {image ? (
                <div className="overflow-hidden border border-olive-900/15 bg-white dark:border-olive-700 dark:bg-olive-950">
                    <button
                        type="button"
                        onClick={onPick}
                        className="relative block aspect-square w-full bg-olive-50 transition hover:bg-olive-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mustard dark:bg-olive-900 dark:hover:bg-olive-800"
                        aria-label="Replace sponsor logo"
                    >
                        <img
                            src={image}
                            alt=""
                            className="h-full w-full object-contain p-3"
                        />
                    </button>
                    <div className="flex items-center gap-3 border-t border-olive-900/10 px-3 py-2 dark:border-olive-800">
                        <button
                            type="button"
                            onClick={onPick}
                            className="text-xs font-semibold text-olive-800 transition hover:text-olive-950 dark:text-olive-200 dark:hover:text-white"
                        >
                            Replace
                        </button>
                        <button
                            type="button"
                            onClick={onClear}
                            className="text-xs font-semibold text-olive-500 transition hover:text-rose-700 dark:text-olive-400 dark:hover:text-rose-400"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={onPick}
                    className="flex aspect-square w-full min-h-[7.5rem] flex-col items-center justify-center gap-1 border border-dashed border-olive-300 bg-olive-50/60 px-3 text-center transition hover:border-olive-800 hover:bg-olive-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard dark:border-olive-700 dark:bg-olive-950/50 dark:hover:border-olive-500 dark:hover:bg-olive-900"
                >
                    <span className="text-sm font-semibold text-olive-900 dark:text-olive-100">
                        Add logo
                    </span>
                    <span className="text-xs text-olive-500 dark:text-olive-400">
                        PNG or SVG preferred
                    </span>
                </button>
            )}
        </div>
    );
}

function ImageDropzonePick({
    image,
    onClear,
    onFiles,
    onPickClick = null,
    remainingLabel = 'multi-select supported',
    inputId,
    multiple = true,
    disabled = false,
    busyLabel = 'Uploading…',
}) {
    const onDropFiles = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        const files = e.dataTransfer?.files;
        if (files?.length) {
            onFiles?.(files);
        }
    };

    // When onPickClick is set, the parent owns the file input (avoids dual
    // inputs + label/htmlFor double-open bugs while an upload is in flight).
    const ownsInput = !onPickClick;
    const fileInput = ownsInput ? (
        <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple={multiple}
            disabled={disabled}
            className="sr-only"
            onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const files = Array.from(e.target.files || []);
                e.target.value = '';
                if (files.length) {
                    onFiles?.(files);
                }
            }}
        />
    ) : null;

    if (image) {
        return (
            <div className="overflow-hidden rounded-2xl border border-olive-200 bg-white dark:border-olive-700 dark:bg-olive-950/80">
                {fileInput}
                <div className="relative aspect-[4/3] w-full bg-olive-50 dark:bg-olive-900">
                    <img
                        src={image}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-gradient-to-t from-black/55 to-transparent p-3 pt-8">
                        {onPickClick ? (
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={onPickClick}
                                className="rounded-xl border border-white/30 bg-white/95 px-3 py-1.5 text-xs font-semibold text-olive-900 shadow-sm hover:bg-white disabled:opacity-60"
                            >
                                {disabled ? busyLabel : 'Replace image'}
                            </button>
                        ) : (
                            <label
                                htmlFor={inputId}
                                className={`rounded-xl border border-white/30 bg-white/95 px-3 py-1.5 text-xs font-semibold text-olive-900 shadow-sm hover:bg-white ${
                                    disabled
                                        ? 'pointer-events-none opacity-60'
                                        : 'cursor-pointer'
                                }`}
                            >
                                {disabled ? busyLabel : 'Replace image'}
                            </label>
                        )}
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={onClear}
                            className="rounded-sm bg-white/90 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm hover:bg-white disabled:opacity-60"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const shellClassName = `flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-olive-300 bg-white/80 px-4 py-10 text-center transition dark:border-olive-700 dark:bg-olive-950/80 ${
        disabled
            ? 'cursor-wait opacity-70'
            : 'cursor-pointer hover:border-mustard hover:bg-mustard/5 dark:hover:border-mustard dark:hover:bg-mustard/10'
    }`;

    const body = (
        <>
            {fileInput}
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-olive-50 ring-1 ring-olive-100 dark:bg-olive-900 dark:ring-olive-700">
                <ImagePlus className="h-6 w-6 text-olive-700 dark:text-olive-300" />
            </span>
            <span>
                <span className="block text-sm font-semibold text-olive-950 dark:text-olive-50">
                    {disabled ? busyLabel : 'Drop images here'}
                </span>
                <span className="mt-1 block text-xs text-olive-500">
                    {disabled
                        ? 'Please wait'
                        : `Or click to upload · ${remainingLabel}`}
                </span>
            </span>
        </>
    );

    if (onPickClick) {
        return (
            <button
                type="button"
                disabled={disabled}
                onClick={onPickClick}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onDrop={onDropFiles}
                className={shellClassName}
            >
                {body}
            </button>
        );
    }

    return (
        <label
            htmlFor={disabled ? undefined : inputId}
            onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            onDrop={onDropFiles}
            className={shellClassName}
        >
            {body}
        </label>
    );
}

function MenuImagesEditor({
    images = [],
    inputId,
    maxImages,
    onChange,
    libraryRoute = null,
    uploadUrl = null,
}) {
    const safeMax = Math.max(1, Number(maxImages) || 1);
    const [libraryOpen, setLibraryOpen] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadLabel, setUploadLabel] = useState('Uploading…');
    const [imageUrl, setImageUrl] = useState('');
    const [imageUrlError, setImageUrlError] = useState(null);
    const fileInputRef = useRef(null);
    const imagesRef = useRef(images);
    const uploadingRef = useRef(false);
    const urlInputId = `${inputId}-url`;

    imagesRef.current = Array.isArray(images) ? images : [];

    const remaining = Math.max(0, safeMax - imagesRef.current.length);
    const atLimit = remaining <= 0;

    const addFiles = async (fileList) => {
        if (uploadingRef.current) {
            return;
        }

        const files = Array.from(fileList || []).filter((f) =>
            f.type?.startsWith('image/'),
        );
        if (!files.length) {
            setUploadError('Choose a JPG, PNG, or WebP image.');
            return;
        }

        const current = imagesRef.current;
        const slots = Math.max(0, safeMax - current.length);
        if (slots <= 0) {
            setUploadError(`This set already has ${safeMax} images.`);
            return;
        }

        setUploadError(null);
        uploadingRef.current = true;
        setUploading(true);
        setUploadProgress(0);
        const chosen = files.slice(0, slots);
        const urls = [];
        try {
            for (let i = 0; i < chosen.length; i += 1) {
                const file = chosen[i];
                setUploadLabel(
                    chosen.length > 1
                        ? `Uploading ${i + 1} of ${chosen.length}…`
                        : 'Uploading image…',
                );
                const url = await uploadEditorMedia(file, uploadUrl, {
                    onProgress: (pct) => {
                        const base = (i / chosen.length) * 100;
                        const slice = pct / chosen.length;
                        setUploadProgress(Math.round(base + slice));
                    },
                });
                if (url) {
                    urls.push(url);
                }
            }
            setUploadProgress(100);
        } finally {
            uploadingRef.current = false;
            setUploading(false);
            setUploadProgress(0);
        }
        if (!urls.length) {
            setUploadError(
                'Could not upload that image. Try a JPG, PNG, or WebP under 5MB.',
            );
            return;
        }
        if (urls.length < chosen.length) {
            setUploadError(
                `Uploaded ${urls.length} of ${chosen.length} images. Retry the rest.`,
            );
        }
        const latest = imagesRef.current;
        onChange([...latest, ...urls].slice(0, safeMax));
    };

    const addUrls = (urls) => {
        if (!urls?.length || uploadingRef.current) return;
        const current = imagesRef.current;
        const slots = Math.max(0, safeMax - current.length);
        if (slots <= 0) return;
        setUploadError(null);
        setImageUrlError(null);
        onChange([...current, ...urls].slice(0, safeMax));
    };

    const parseImageUrl = (raw) => {
        const value = (raw || '').trim();
        if (!value) {
            setImageUrlError('Paste an image URL.');
            return null;
        }
        try {
            const parsed = new URL(value);
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                setImageUrlError('URL must start with http:// or https://');
                return null;
            }
        } catch {
            setImageUrlError('That does not look like a valid URL.');
            return null;
        }
        setImageUrlError(null);
        return value;
    };

    const submitImageUrl = () => {
        if (uploadingRef.current) return;
        const current = imagesRef.current;
        if (current.length >= safeMax) {
            setImageUrlError(`This set already has ${safeMax} images.`);
            return;
        }
        const raw = parseImageUrl(imageUrl);
        if (!raw) return;
        addUrls([raw]);
        setImageUrl('');
    };

    const removeAt = (index) => {
        if (uploadingRef.current) return;
        onChange(imagesRef.current.filter((_, i) => i !== index));
    };

    const openFilePicker = () => {
        if (uploadingRef.current || atLimit) return;
        fileInputRef.current?.click();
    };

    const openAdd = () => {
        if (uploadingRef.current || atLimit) return;
        if (libraryRoute) {
            setLibraryOpen(true);
            return;
        }
        openFilePicker();
    };

    return (
        <div className="space-y-3">
            {/* Single file input for dropzone, Add more, and MediaAddDialog. */}
            <input
                ref={fileInputRef}
                id={inputId}
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                className="hidden"
                onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const files = Array.from(e.target.files || []);
                    e.target.value = '';
                    if (files.length) {
                        void addFiles(files);
                    }
                }}
            />

            {libraryOpen && libraryRoute ? (
                <MediaAddDialog
                    open
                    onClose={() => setLibraryOpen(false)}
                    libraryRoute={libraryRoute}
                    initialPanel="menu"
                    remaining={remaining}
                    target="gallery"
                    onUpload={openFilePicker}
                    onPickUrls={(urls) => {
                        addUrls(urls);
                        setLibraryOpen(false);
                    }}
                />
            ) : (
                <>
                    {libraryRoute && !atLimit ? (
                        <div className="flex flex-wrap justify-end gap-2">
                            <button
                                type="button"
                                disabled={uploading}
                                onClick={() => setLibraryOpen(true)}
                                className="inline-flex items-center gap-1.5 rounded-sm bg-olive-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-olive-800 disabled:opacity-60"
                            >
                                <Images className="h-3.5 w-3.5" />
                                Open gallery
                            </button>
                        </div>
                    ) : null}

                    {images.length ? (
                        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {images.map((src, index) => (
                                <li
                                    key={`${src}-${index}`}
                                    className="group relative overflow-hidden rounded-xl bg-olive-100"
                                >
                                    <img
                                        src={src}
                                        alt=""
                                        className="aspect-[3/4] w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        disabled={uploading}
                                        onClick={() => removeAt(index)}
                                        className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-sm bg-white/95 text-rose-700 shadow-sm disabled:opacity-60"
                                        aria-label={`Remove image ${index + 1}`}
                                    >
                                        <X
                                            className="h-3.5 w-3.5"
                                            strokeWidth={2.5}
                                        />
                                    </button>
                                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1.5 text-[10px] font-semibold text-white">
                                        {index + 1} / {images.length}
                                    </span>
                                </li>
                            ))}
                            {!atLimit ? (
                                <li>
                                    <button
                                        type="button"
                                        disabled={uploading}
                                        onClick={openAdd}
                                        className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-olive-300 bg-white/70 text-olive-600 transition hover:border-mustard hover:bg-mustard/5 disabled:cursor-wait disabled:opacity-60"
                                    >
                                        <ImagePlus className="h-5 w-5" />
                                        <span className="text-[11px] font-semibold">
                                            {uploading
                                                ? `${uploadProgress}%`
                                                : 'Add more'}
                                        </span>
                                        <span className="text-[10px] text-olive-500">
                                            {images.length}/{safeMax}
                                        </span>
                                    </button>
                                </li>
                            ) : null}
                        </ul>
                    ) : (
                        <div className="space-y-2">
                            <ImageDropzonePick
                                inputId={inputId}
                                image=""
                                remainingLabel={
                                    safeMax === 1
                                        ? '1 image'
                                        : `up to ${safeMax} images`
                                }
                                disabled={uploading}
                                onPickClick={openFilePicker}
                                onFiles={(files) => void addFiles(files)}
                                onClear={() => {}}
                            />
                            {libraryRoute ? (
                                <button
                                    type="button"
                                    disabled={uploading}
                                    onClick={() => setLibraryOpen(true)}
                                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-sm border border-olive-200 bg-white px-3 py-2 text-xs font-semibold text-olive-800 transition hover:border-mustard disabled:opacity-60 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100"
                                >
                                    <Images className="h-3.5 w-3.5" />
                                    Or grab from gallery
                                </button>
                            ) : null}
                        </div>
                    )}

                    {!atLimit ? (
                        <div>
                            <label className={label} htmlFor={urlInputId}>
                                Image URL (optional)
                            </label>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <input
                                    id={urlInputId}
                                    type="url"
                                    className={field}
                                    value={imageUrl}
                                    disabled={uploading}
                                    onChange={(e) => {
                                        setImageUrl(e.target.value);
                                        setImageUrlError(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            submitImageUrl();
                                        }
                                    }}
                                    placeholder="https://…/photo.jpg"
                                />
                                <button
                                    type="button"
                                    disabled={uploading}
                                    onClick={submitImageUrl}
                                    className="inline-flex shrink-0 items-center justify-center rounded-sm bg-olive-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-olive-800 disabled:opacity-60"
                                >
                                    Add URL
                                </button>
                            </div>
                            {imageUrlError ? (
                                <p className="mt-1.5 text-sm text-rose-600">
                                    {imageUrlError}
                                </p>
                            ) : (
                                <p className={help}>
                                    Paste a direct image link if you already
                                    host the photo online.
                                </p>
                            )}
                        </div>
                    ) : null}
                </>
            )}

            {uploading ? (
                <UploadProgressBar
                    value={uploadProgress}
                    label={uploadLabel}
                />
            ) : null}

            {uploadError ? (
                <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                    {uploadError}
                </p>
            ) : null}

            {!libraryOpen && atLimit ? (
                <p className={help}>
                    This set is at the {safeMax}-image limit.
                </p>
            ) : null}
        </div>
    );
}

/**
 * Category-specific extras that appear on the public listing page
 * (menus, agenda, sponsors, schedule, products).
 */
export default function CategoryExtrasEditor({
    categoryKey,
    details = {},
    onDetailsChange,
    libraryRoute = null,
    uploadUrl = null,
    tier = 'free',
    isAdmin = false,
    amenityOptions = [],
    onAmenityCreated,
    productCategories = [],
    onProductCategoryCreated,
}) {
    const [imageTarget, setImageTarget] = useState(null); // { list, index, key } — sponsors only
    const [singleUploadProgress, setSingleUploadProgress] = useState(null);
    const singleInputRef = useRef(null);
    const pendingSingleRef = useRef(null);

    // Functional merges so concurrent image uploads (host + room types, or
    // two room rows) do not overwrite each other via a stale details snapshot.
    const setList = (key, next) => {
        onDetailsChange((prev) => ({ ...(prev || {}), [key]: next }));
    };

    const updateItem = (key, index, patch) => {
        onDetailsChange((prev) => {
            const base = prev || {};
            const list = Array.isArray(base[key]) ? [...base[key]] : [];
            list[index] = { ...list[index], ...patch };
            return { ...base, [key]: list };
        });
    };

    const updateGig = (index, patch) => {
        onDetailsChange((prev) => {
            const base = prev || {};
            const list = Array.isArray(base.event_schedule)
                ? [...base.event_schedule]
                : [];
            const next = { ...list[index], ...patch };
            next.label = formatGigWhenLabel(next);
            list[index] = next;
            return { ...base, event_schedule: list };
        });
    };

    const removeItem = (key, index) => {
        onDetailsChange((prev) => {
            const base = prev || {};
            const list = Array.isArray(base[key]) ? [...base[key]] : [];
            list.splice(index, 1);
            return { ...base, [key]: list };
        });
    };

    const addItem = (key, blank) => {
        onDetailsChange((prev) => {
            const base = prev || {};
            const list = Array.isArray(base[key]) ? [...base[key]] : [];
            return { ...base, [key]: [...list, blank] };
        });
    };

    const patchRoomType = (index, patch) => {
        onDetailsChange((prev) => {
            const base = prev || {};
            const next = coerceRoomTypes(base.room_types);
            next[index] = { ...next[index], ...patch };
            return { ...base, room_types: next };
        });
    };

    const removeRoomType = (index) => {
        onDetailsChange((prev) => {
            const base = prev || {};
            const next = coerceRoomTypes(base.room_types);
            next.splice(index, 1);
            return { ...base, room_types: next };
        });
    };

    const addRoomType = () => {
        onDetailsChange((prev) => {
            const base = prev || {};
            return {
                ...base,
                room_types: [
                    ...coerceRoomTypes(base.room_types),
                    {
                        title: '',
                        price: '',
                        description: '',
                        images: [],
                        amenities: [],
                    },
                ],
            };
        });
    };

    const menus = Array.isArray(details.menus) ? details.menus : [];
    const roomTypes =
        categoryKey === 'stay' ? coerceRoomTypes(details.room_types) : [];
    const deals = Array.isArray(details.deals) ? details.deals : [];
    const agenda = Array.isArray(details.agenda) ? details.agenda : [];
    const sponsors = Array.isArray(details.sponsors) ? details.sponsors : [];
    const schedule = Array.isArray(details.event_schedule)
        ? details.event_schedule
        : [];
    const products = Array.isArray(details.products) ? details.products : [];
    const showMenus =
        categoryKey !== 'eatDrink' ||
        isAdmin ||
        canUseEatDrinkFeature(tier, 'menus');
    const showDeals =
        categoryKey === 'eatDrink' &&
        (isAdmin || canUseEatDrinkFeature(tier, 'deals'));
    const showLiveMusic =
        categoryKey === 'eatDrink' &&
        (isAdmin || canUseEatDrinkFeature(tier, 'live_music'));
    const showStayRoomTypes = categoryKey === 'stay';
    const showStayOffers =
        categoryKey === 'stay' && canUseStayFeature(tier, 'seasonal_offers');
    const roomTypeLimit = showStayRoomTypes ? stayRoomTypeLimit(tier) : null;
    const imagesPerRoomType = showStayRoomTypes
        ? stayRoomTypeImagesPerItem(tier)
        : 3;
    const roomTypeRemaining =
        roomTypeLimit == null
            ? 0
            : Math.max(0, roomTypeLimit - roomTypes.length);
    const atRoomTypeLimit =
        roomTypeLimit != null && roomTypeRemaining <= 0;
    const showShoppingProducts =
        categoryKey === 'shopping' && canUseShoppingFeature(tier, 'products');
    const showShoppingOffers =
        categoryKey === 'shopping' && canUseShoppingFeature(tier, 'deals');
    const showServicesPortfolio =
        categoryKey === 'services' && canUseServicesFeature(tier, 'portfolio');
    const showServicesOffers =
        categoryKey === 'services' && canUseServicesFeature(tier, 'deals');
    const showThingsToDoOffers =
        categoryKey === 'thingsToDo' && canUseThingsToDoFeature(tier, 'deals');
    const showEventAgenda =
        categoryKey === 'events' && canUseEventsFeature(tier, 'agenda');
    const showEventSponsors =
        categoryKey === 'events' && canUseEventsFeature(tier, 'sponsors');
    const shoppingProductCap =
        categoryKey === 'shopping' ? shoppingProductLimit(tier) : null;
    const shoppingProductsRemaining =
        shoppingProductCap == null
            ? 0
            : Math.max(0, shoppingProductCap - products.length);
    const atShoppingProductLimit =
        shoppingProductCap != null && shoppingProductsRemaining <= 0;
    const imagesPerProduct =
        categoryKey === 'shopping'
            ? Math.max(1, shoppingProductImagesPerItem(tier) || 5)
            : 5;
    const portfolio = Array.isArray(details.portfolio) ? details.portfolio : [];
    const portfolioCap =
        categoryKey === 'services' ? servicesPortfolioLimit(tier) : null;
    const portfolioRemaining =
        portfolioCap == null
            ? 0
            : Math.max(0, portfolioCap - portfolio.length);
    const atPortfolioLimit =
        portfolioCap != null && portfolioRemaining <= 0;
    // Admins can edit menus even on Free listings; use Standard caps unless Premium.
    const menuTier =
        categoryKey === 'eatDrink' && isAdmin && !canUseEatDrinkFeature(tier, 'menus')
            ? 'featured'
            : tier;
    const menuLimit =
        categoryKey === 'eatDrink' ? eatDrinkMenuLimit(menuTier) : null;
    const imagesPerMenu =
        categoryKey === 'eatDrink' ? eatDrinkMenuImagesPerPage(menuTier) : 5;
    const menuRemaining =
        menuLimit == null ? 0 : Math.max(0, menuLimit - menus.length);
    const atMenuLimit = menuLimit != null && menuRemaining <= 0;

    return (
        <SectionErrorBoundary>
        <div className="space-y-5">
            {categoryKey === 'eatDrink' ? (
                <>
                {showMenus ? (
                <Section
                    title="Menus"
                    blurb={eatDrinkMenuHelp(menuTier)}
                >
                    <ul className="space-y-4">
                        {menus.map((item, index) => (
                            <li
                                key={`menu-${index}`}
                                className="space-y-3 rounded-xl border border-olive-100 bg-olive-50/40 p-3"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                        Menu {index + 1}
                                    </span>
                                    <RowActions
                                        onRemove={() =>
                                            removeItem('menus', index)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className={label}>Title</label>
                                    <input
                                        className={field}
                                        value={item.title || ''}
                                        onChange={(e) =>
                                            updateItem('menus', index, {
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. Lunch menu"
                                    />
                                </div>
                                <div>
                                    <p className={label}>Menu images</p>
                                    <MenuImagesEditor
                                        inputId={`menu-images-${index}`}
                                        images={menuItemImages(item)}
                                        maxImages={imagesPerMenu}
                                        libraryRoute={libraryRoute}
                                        uploadUrl={uploadUrl}
                                        onChange={(nextImages) =>
                                            updateItem('menus', index, {
                                                images: nextImages,
                                                image: '',
                                            })
                                        }
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                    {atMenuLimit ? (
                        <p className={help}>
                            {normalizeTier(menuTier) === 'premium' ? (
                                <>
                                    You’ve reached the Premium limit of{' '}
                                    {menuLimit} menu pages.
                                </>
                            ) : isAdmin ? (
                                <>
                                    You’ve reached the{' '}
                                    {tierDisplayLabel(menuTier)} limit of{' '}
                                    {menuLimit} menu pages. Set plan tier to
                                    Premium for up to{' '}
                                    {eatDrinkMenuLimit('premium')} menu pages.
                                </>
                            ) : (
                                <>
                                    You’ve reached the{' '}
                                    {tierDisplayLabel(menuTier)} limit of{' '}
                                    {menuLimit} menu pages.{' '}
                                    <Link
                                        href={route('account.upgrade')}
                                        className="font-semibold text-olive-900 underline decoration-mustard/70 underline-offset-2 hover:text-olive-700 dark:text-mustard dark:hover:text-mustard/80"
                                    >
                                        Upgrade to Premium
                                    </Link>{' '}
                                    for up to{' '}
                                    {eatDrinkMenuLimit('premium')} menu pages.
                                </>
                            )}
                        </p>
                    ) : (
                        <button
                            type="button"
                            onClick={() =>
                                addItem('menus', {
                                    title: '',
                                    images: [],
                                })
                            }
                            className="inline-flex items-center gap-1.5 rounded-sm bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white"
                        >
                            <Plus className="h-4 w-4" />
                            Add menu page
                            {menuLimit != null
                                ? ` (${menus.length}/${menuLimit})`
                                : ''}
                        </button>
                    )}
                </Section>
                ) : null}

                {showDeals ? (
                <Section
                    title="Deals / offers / happy hour"
                    blurb="Highlighted specials shown in a featured block on your listing page."
                >
                    <ul className="space-y-3">
                        {deals.map((item, index) => (
                            <li
                                key={`deal-${index}`}
                                className="space-y-2 rounded-xl border border-olive-100 bg-olive-50/40 p-3"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                        Offer {index + 1}
                                    </span>
                                    <RowActions
                                        onRemove={() =>
                                            removeItem('deals', index)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className={label}>Title</label>
                                    <input
                                        className={field}
                                        value={item.title || ''}
                                        onChange={(e) =>
                                            updateItem('deals', index, {
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. Sunset happy hour"
                                    />
                                </div>
                                <div>
                                    <RichTextEditor
                                        id={`deal-details-${index}`}
                                        label="Details"
                                        value={item.description || ''}
                                        onChange={(html) =>
                                            updateItem('deals', index, {
                                                description: html,
                                            })
                                        }
                                        placeholder="2-for-1 cocktails · Weekdays 5–7pm"
                                        allowImages={false}
                                        compact
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        onClick={() =>
                            addItem('deals', { title: '', description: '' })
                        }
                        className="inline-flex items-center gap-1.5 rounded-sm bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white"
                    >
                        <Plus className="h-4 w-4" />
                        Add offer
                    </button>
                </Section>
                ) : null}

                {showLiveMusic ? (
                <Section
                    title="Events & live music"
                    blurb="Upcoming gigs and live music nights shown as a schedule on your page."
                >
                    <ul className="space-y-3">
                        {schedule.map((item, index) => {
                            const scheduleType =
                                item.type === 'recurring' ||
                                (!item.date && item.weekday)
                                    ? 'recurring'
                                    : 'once';

                            return (
                                <li
                                    key={`live-${index}`}
                                    className="space-y-2 rounded-xl border border-olive-100 bg-olive-50/40 p-3"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                            Gig {index + 1}
                                        </span>
                                        <RowActions
                                            onRemove={() =>
                                                removeItem(
                                                    'event_schedule',
                                                    index,
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <p className={label}>Schedule</p>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                {
                                                    key: 'once',
                                                    text: 'One-time date',
                                                },
                                                {
                                                    key: 'recurring',
                                                    text: 'Every week',
                                                },
                                            ].map((opt) => (
                                                <button
                                                    key={opt.key}
                                                    type="button"
                                                    onClick={() =>
                                                        updateGig(index, {
                                                            type: opt.key,
                                                            ...(opt.key ===
                                                            'once'
                                                                ? {
                                                                      weekday:
                                                                          '',
                                                                  }
                                                                : {
                                                                      date: '',
                                                                  }),
                                                        })
                                                    }
                                                    className={`rounded-sm px-3.5 py-2 text-sm font-semibold transition ${
                                                        scheduleType ===
                                                        opt.key
                                                            ? 'bg-olive-900 text-white'
                                                            : 'bg-white text-olive-700 ring-1 ring-olive-200 hover:bg-olive-50'
                                                    }`}
                                                >
                                                    {opt.text}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {scheduleType === 'once' ? (
                                        <div>
                                            <label
                                                className={label}
                                                htmlFor={`gig-date-${index}`}
                                            >
                                                Date
                                            </label>
                                            <input
                                                id={`gig-date-${index}`}
                                                type="date"
                                                className={field}
                                                value={item.date || ''}
                                                onChange={(e) =>
                                                    updateGig(index, {
                                                        type: 'once',
                                                        date: e.target.value,
                                                    })
                                                }
                                            />
                                            {!item.date && item.label ? (
                                                <p className={help}>
                                                    Currently shown as “
                                                    {item.label}”. Pick a date
                                                    to update it.
                                                </p>
                                            ) : null}
                                        </div>
                                    ) : (
                                        <div>
                                            <label
                                                className={label}
                                                htmlFor={`gig-weekday-${index}`}
                                            >
                                                Day of the week
                                            </label>
                                            <select
                                                id={`gig-weekday-${index}`}
                                                className={field}
                                                value={item.weekday || ''}
                                                onChange={(e) =>
                                                    updateGig(index, {
                                                        type: 'recurring',
                                                        weekday: e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="">
                                                    Select day…
                                                </option>
                                                {WEEKDAYS.map((day) => (
                                                    <option
                                                        key={day.key}
                                                        value={day.key}
                                                    >
                                                        Every {day.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className={help}>
                                                e.g. Karaoke night every
                                                Wednesday
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <label
                                            className={label}
                                            htmlFor={`gig-time-${index}`}
                                        >
                                            Time{' '}
                                            <span className="font-normal text-olive-400">
                                                (optional)
                                            </span>
                                        </label>
                                        <input
                                            id={`gig-time-${index}`}
                                            type="time"
                                            className={field}
                                            value={item.time || ''}
                                            onChange={(e) =>
                                                updateGig(index, {
                                                    time: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label
                                            className={label}
                                            htmlFor={`gig-what-${index}`}
                                        >
                                            What’s on
                                        </label>
                                        <input
                                            id={`gig-what-${index}`}
                                            className={field}
                                            value={item.value || ''}
                                            onChange={(e) =>
                                                updateGig(index, {
                                                    value: e.target.value,
                                                })
                                            }
                                            placeholder="Acoustic night with local artists"
                                        />
                                    </div>

                                    {formatGigWhenLabel(item) ? (
                                        <p className="text-xs font-medium text-olive-600">
                                            Shows as:{' '}
                                            <span className="text-olive-900">
                                                {formatGigWhenLabel(item)}
                                            </span>
                                        </p>
                                    ) : null}
                                </li>
                            );
                        })}
                    </ul>
                    <button
                        type="button"
                        onClick={() =>
                            addItem('event_schedule', {
                                type: 'once',
                                date: '',
                                time: '',
                                weekday: '',
                                value: '',
                                label: '',
                            })
                        }
                        className="inline-flex items-center gap-1.5 rounded-sm bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white"
                    >
                        <Plus className="h-4 w-4" />
                        Add gig
                    </button>
                </Section>
                ) : null}
                </>
            ) : null}

            {showStayRoomTypes ? (
                <Section
                    title="Room types"
                    blurb={stayRoomTypeHelp(tier)}
                >
                    <ul className="space-y-4">
                        {roomTypes.map((item, index) => (
                            <li
                                key={`room-type-${index}`}
                                className="space-y-3 rounded-xl border border-olive-100 bg-olive-50/40 p-3"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                        Room {index + 1}
                                    </span>
                                    <RowActions
                                        onRemove={() => removeRoomType(index)}
                                    />
                                </div>
                                <RoomTitleField
                                    id={`room-type-title-${index}`}
                                    value={item.title || ''}
                                    onChange={(title) =>
                                        patchRoomType(index, { title })
                                    }
                                />
                                <div>
                                    <label
                                        className={label}
                                        htmlFor={`room-type-price-${index}`}
                                    >
                                        Price
                                    </label>
                                    <input
                                        id={`room-type-price-${index}`}
                                        className={field}
                                        value={item.price || ''}
                                        onChange={(e) =>
                                            patchRoomType(index, {
                                                price: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. KES 12,000 / night"
                                    />
                                </div>
                                <div>
                                    <label
                                        className={label}
                                        htmlFor={`room-type-description-${index}`}
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        id={`room-type-description-${index}`}
                                        className={field}
                                        rows={3}
                                        value={item.description || ''}
                                        onChange={(e) =>
                                            patchRoomType(index, {
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="Beds, view, who it suits…"
                                    />
                                    <p className={help}>
                                        A short note guests see under this room
                                        type.
                                    </p>
                                </div>
                                <AmenitiesPicker
                                    amenities={amenityOptions}
                                    selected={
                                        Array.isArray(item.amenities)
                                            ? item.amenities
                                            : []
                                    }
                                    categoryKey={categoryKey}
                                    inputId={`room-type-amenities-${index}`}
                                    labelText="Room amenities"
                                    helpText="Features for this room type only, separate from the property amenities."
                                    onChange={(amenities) =>
                                        patchRoomType(index, { amenities })
                                    }
                                    onCreated={onAmenityCreated}
                                />
                                <div>
                                    <p className={label}>Photos</p>
                                    <MenuImagesEditor
                                        inputId={`room-type-images-${index}`}
                                        images={roomTypeItemImages(item)}
                                        maxImages={imagesPerRoomType}
                                        libraryRoute={libraryRoute}
                                        uploadUrl={uploadUrl}
                                        onChange={(nextImages) =>
                                            patchRoomType(index, {
                                                images: nextImages,
                                                image: '',
                                            })
                                        }
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                    {atRoomTypeLimit ? (
                        <p className={help}>
                            You’ve reached the limit of {roomTypeLimit} room
                            types for this plan.
                        </p>
                    ) : (
                        <button
                            type="button"
                            onClick={addRoomType}
                            className="inline-flex items-center gap-1.5 rounded-sm bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white"
                        >
                            <Plus className="h-4 w-4" />
                            Add room type
                            {roomTypeLimit != null
                                ? ` (${roomTypes.length}/${roomTypeLimit})`
                                : ''}
                        </button>
                    )}
                </Section>
            ) : null}

            {showStayOffers ? (
                <Section
                    title="Seasonal pricing / special offers"
                    blurb="Promote resident rates, holiday weekends, and limited-time discounts."
                >
                    <ul className="space-y-3">
                        {deals.map((item, index) => (
                            <li
                                key={`stay-deal-${index}`}
                                className="space-y-2 rounded-xl border border-olive-100 bg-olive-50/40 p-3"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                        Offer {index + 1}
                                    </span>
                                    <RowActions
                                        onRemove={() =>
                                            removeItem('deals', index)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className={label}>Title</label>
                                    <input
                                        className={field}
                                        value={item.title || ''}
                                        onChange={(e) =>
                                            updateItem('deals', index, {
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. Resident midweek rate"
                                    />
                                </div>
                                <div>
                                    <RichTextEditor
                                        id={`stay-deal-details-${index}`}
                                        label="Details"
                                        value={item.description || ''}
                                        onChange={(html) =>
                                            updateItem('deals', index, {
                                                description: html,
                                            })
                                        }
                                        placeholder="Valid dates, discount amount, booking notes…"
                                        allowImages={false}
                                        compact
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        onClick={() =>
                            addItem('deals', { title: '', description: '' })
                        }
                        className="inline-flex items-center gap-1.5 rounded-sm bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white"
                    >
                        <Plus className="h-4 w-4" />
                        Add offer
                    </button>
                </Section>
            ) : null}

            {categoryKey === 'events' ? (
                <>
                    {showEventAgenda ? (
                        <>
                    <Section
                        title="Agenda / lineup"
                        blurb="Time-ordered programme shown on the event page."
                    >
                        <ul className="space-y-3">
                            {agenda.map((item, index) => (
                                <li
                                    key={`agenda-${index}`}
                                    className="grid gap-2 rounded-xl border border-olive-100 bg-olive-50/40 p-3 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-end"
                                >
                                    <div>
                                        <label className={label}>Time</label>
                                        <input
                                            className={field}
                                            value={item.time || ''}
                                            onChange={(e) =>
                                                updateItem('agenda', index, {
                                                    time: e.target.value,
                                                })
                                            }
                                            placeholder="19:30"
                                        />
                                    </div>
                                    <div>
                                        <label className={label}>Title</label>
                                        <input
                                            className={field}
                                            value={item.title || ''}
                                            onChange={(e) =>
                                                updateItem('agenda', index, {
                                                    title: e.target.value,
                                                })
                                            }
                                            placeholder="Opening set"
                                        />
                                    </div>
                                    <RowActions
                                        onRemove={() =>
                                            removeItem('agenda', index)
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            onClick={() =>
                                addItem('agenda', { time: '', title: '' })
                            }
                            className="inline-flex items-center gap-1.5 rounded-sm bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white"
                        >
                            <Plus className="h-4 w-4" />
                            Add agenda item
                        </button>
                    </Section>

                    <Section
                        title="Event schedule"
                        blurb="Sidebar schedule (doors, music, last entry…)."
                    >
                        <ul className="space-y-3">
                            {schedule.map((item, index) => (
                                <li
                                    key={`sched-${index}`}
                                    className="grid gap-2 rounded-xl border border-olive-100 bg-olive-50/40 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
                                >
                                    <div>
                                        <label className={label}>Label</label>
                                        <input
                                            className={field}
                                            value={item.label || ''}
                                            onChange={(e) =>
                                                updateItem(
                                                    'event_schedule',
                                                    index,
                                                    { label: e.target.value },
                                                )
                                            }
                                            placeholder="Doors open"
                                        />
                                    </div>
                                    <div>
                                        <label className={label}>Value</label>
                                        <input
                                            className={field}
                                            value={item.value || ''}
                                            onChange={(e) =>
                                                updateItem(
                                                    'event_schedule',
                                                    index,
                                                    { value: e.target.value },
                                                )
                                            }
                                            placeholder="18:30"
                                        />
                                    </div>
                                    <RowActions
                                        onRemove={() =>
                                            removeItem('event_schedule', index)
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            onClick={() =>
                                addItem('event_schedule', {
                                    label: '',
                                    value: '',
                                })
                            }
                            className="inline-flex items-center gap-1.5 rounded-sm bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white"
                        >
                            <Plus className="h-4 w-4" />
                            Add schedule row
                        </button>
                    </Section>
                        </>
                    ) : (
                        <EventsTierUpsell tier={tier} isAdmin={isAdmin} />
                    )}

                    {showEventSponsors ? (
                    <Section
                        title="Sponsors"
                        blurb="Optional logos and names shown on the event page."
                    >
                        <ul className="space-y-3">
                            {sponsors.map((item, index) => (
                                <li
                                    key={`sponsor-${index}`}
                                    className="min-w-0 rounded-xl border border-olive-100 bg-olive-50/40 p-3 sm:p-4 dark:border-olive-800 dark:bg-olive-950/40"
                                >
                                    <div className="mb-3 flex items-center justify-between gap-2">
                                        <span className="text-xs font-semibold text-olive-500 dark:text-olive-400">
                                            Sponsor {index + 1}
                                        </span>
                                        <RowActions
                                            onRemove={() =>
                                                removeItem('sponsors', index)
                                            }
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-start">
                                        <SponsorLogoField
                                            image={item.logo}
                                            onPick={() =>
                                                setImageTarget({
                                                    list: 'sponsors',
                                                    index,
                                                    key: 'logo',
                                                })
                                            }
                                            onClear={() =>
                                                updateItem('sponsors', index, {
                                                    logo: '',
                                                })
                                            }
                                        />
                                        <div className="min-w-0">
                                            <label
                                                className={label}
                                                htmlFor={`sponsor_name_${index}`}
                                            >
                                                Name
                                            </label>
                                            <input
                                                id={`sponsor_name_${index}`}
                                                className={field}
                                                value={item.name || ''}
                                                onChange={(e) =>
                                                    updateItem(
                                                        'sponsors',
                                                        index,
                                                        {
                                                            name: e.target
                                                                .value,
                                                        },
                                                    )
                                                }
                                                placeholder="Sponsor name"
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            onClick={() =>
                                addItem('sponsors', { name: '', logo: '' })
                            }
                            className="mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-sm bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-olive-800 dark:bg-mustard dark:text-olive-950 dark:hover:bg-mustard/90"
                        >
                            <Plus className="h-4 w-4" />
                            Add sponsor
                        </button>
                    </Section>
                    ) : showEventAgenda ? (
                        <EventsTierUpsell tier={tier} isAdmin={isAdmin} />
                    ) : null}
                </>
            ) : null}

            {categoryKey === 'shopping' && !showShoppingProducts ? (
                <ShoppingTierUpsell tier={tier} isAdmin={isAdmin} />
            ) : null}

            {showShoppingOffers ? (
                <Section
                    title="Current offers / sales banner"
                    blurb="Highlight promotions shown prominently on your shop page."
                >
                    <ul className="space-y-3">
                        {deals.map((item, index) => (
                            <li
                                key={`shop-deal-${index}`}
                                className="space-y-2 rounded-xl border border-olive-100 bg-olive-50/40 p-3"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                        Offer {index + 1}
                                    </span>
                                    <RowActions
                                        onRemove={() =>
                                            removeItem('deals', index)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className={label}>Title</label>
                                    <input
                                        className={field}
                                        value={item.title || ''}
                                        onChange={(e) =>
                                            updateItem('deals', index, {
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. 20% off sneakers this week"
                                    />
                                </div>
                                <div>
                                    <RichTextEditor
                                        id={`shop-deal-details-${index}`}
                                        label="Details"
                                        value={item.description || ''}
                                        onChange={(html) =>
                                            updateItem('deals', index, {
                                                description: html,
                                            })
                                        }
                                        placeholder="Valid dates, discount terms, promo codes…"
                                        allowImages={false}
                                        compact
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        onClick={() =>
                            addItem('deals', { title: '', description: '' })
                        }
                        className="inline-flex items-center gap-1.5 rounded-sm bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white"
                    >
                        <Plus className="h-4 w-4" />
                        Add offer
                    </button>
                </Section>
            ) : null}

            {showShoppingProducts ? (
                <Section
                    title="Product showcase"
                    blurb={shoppingProductHelp(tier)}
                >
                    <ul className="space-y-4">
                        {products.map((item, index) => (
                            <li
                                key={`product-${index}`}
                                className="space-y-4 rounded-xl border border-olive-100 bg-olive-50/40 p-3 sm:p-4 dark:border-olive-800 dark:bg-olive-950/40"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-olive-500 dark:text-olive-400">
                                        Product {index + 1}
                                    </span>
                                    <RowActions
                                        onRemove={() =>
                                            removeItem('products', index)
                                        }
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="min-w-0">
                                        <label className={label}>Name</label>
                                        <input
                                            className={field}
                                            value={item.name || ''}
                                            onChange={(e) =>
                                                updateItem('products', index, {
                                                    name: e.target.value,
                                                })
                                            }
                                            placeholder="Product name"
                                        />
                                    </div>
                                    <ProductCategoryField
                                        id={`product-category-${index}`}
                                        value={item.category || ''}
                                        options={productCategories}
                                        onChange={(category) =>
                                            updateItem('products', index, {
                                                category,
                                            })
                                        }
                                        onCreated={onProductCategoryCreated}
                                    />
                                    <div className="min-w-0 sm:col-span-2 sm:max-w-md">
                                        <label
                                            className={label}
                                            htmlFor={`product-price-${index}`}
                                        >
                                            Price
                                        </label>
                                        <div className="flex gap-2">
                                            <select
                                                id={`product-currency-${index}`}
                                                className={`${field} w-[7.25rem] shrink-0`}
                                                value={normalizeProductCurrency(
                                                    item.currency,
                                                )}
                                                onChange={(e) =>
                                                    updateItem(
                                                        'products',
                                                        index,
                                                        {
                                                            currency:
                                                                normalizeProductCurrency(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                        },
                                                    )
                                                }
                                                aria-label="Currency"
                                            >
                                                {PRODUCT_CURRENCIES.map(
                                                    (option) => (
                                                        <option
                                                            key={option.code}
                                                            value={option.code}
                                                        >
                                                            {option.label}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            <div className="relative min-w-0 flex-1">
                                                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-semibold text-olive-500">
                                                    {
                                                        productCurrencyMeta(
                                                            item.currency,
                                                        ).prefix
                                                    }
                                                </span>
                                                <input
                                                    id={`product-price-${index}`}
                                                    type="number"
                                                    inputMode="numeric"
                                                    min={0}
                                                    step={1}
                                                    className={`${field} ${
                                                        normalizeProductCurrency(
                                                            item.currency,
                                                        ) === 'KES'
                                                            ? 'pl-14'
                                                            : 'pl-10'
                                                    }`}
                                                    value={String(
                                                        item.price ?? '',
                                                    ).replace(/\D+/g, '')}
                                                    onChange={(e) => {
                                                        const digits = String(
                                                            e.target.value,
                                                        ).replace(/\D+/g, '');
                                                        updateItem(
                                                            'products',
                                                            index,
                                                            {
                                                                price:
                                                                    digits ===
                                                                    ''
                                                                        ? ''
                                                                        : Number(
                                                                              digits,
                                                                          ),
                                                            },
                                                        );
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (
                                                            [
                                                                'e',
                                                                'E',
                                                                '+',
                                                                '-',
                                                                '.',
                                                                ',',
                                                            ].includes(e.key)
                                                        ) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    placeholder="0"
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <RichTextEditor
                                    id={`product-description-${index}`}
                                    label="Description"
                                    value={item.description || ''}
                                    onChange={(html) =>
                                        updateItem('products', index, {
                                            description: html,
                                        })
                                    }
                                    placeholder="Short description, highlights, sizes…"
                                    allowImages={false}
                                    compact
                                />
                                <div className="min-w-0">
                                    <p className={label}>Product images</p>
                                    <MenuImagesEditor
                                        inputId={`product-image-${index}`}
                                        images={productItemImages(item)}
                                        maxImages={imagesPerProduct}
                                        libraryRoute={libraryRoute}
                                        uploadUrl={uploadUrl}
                                        onChange={(urls) =>
                                            updateItem('products', index, {
                                                images: urls,
                                                image: urls[0] || '',
                                            })
                                        }
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        disabled={atShoppingProductLimit}
                        onClick={() =>
                            addItem('products', {
                                name: '',
                                category: '',
                                price: '',
                                currency: 'KES',
                                description: '',
                                image: '',
                                images: [],
                            })
                        }
                        className="inline-flex items-center gap-1.5 rounded-sm bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" />
                        Add product
                    </button>
                </Section>
            ) : null}

            {categoryKey === 'services' && !showServicesPortfolio ? (
                <ServicesTierUpsell tier={tier} isAdmin={isAdmin} />
            ) : null}

            {showServicesPortfolio ? (
                <Section
                    title="Portfolio / past work"
                    blurb={servicesPortfolioHelp(tier)}
                >
                    <ul className="space-y-4">
                        {portfolio.map((item, index) => (
                            <li
                                key={`portfolio-${index}`}
                                className="space-y-3 rounded-xl border border-olive-100 bg-olive-50/40 p-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                        Work {index + 1}
                                    </span>
                                    <RowActions
                                        onRemove={() =>
                                            removeItem('portfolio', index)
                                        }
                                    />
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className={label}>Title</label>
                                        <input
                                            className={field}
                                            value={item.title || ''}
                                            onChange={(e) =>
                                                updateItem('portfolio', index, {
                                                    title: e.target.value,
                                                })
                                            }
                                            placeholder="Project or client name"
                                        />
                                    </div>
                                    <div>
                                        <label className={label}>
                                            Link to work
                                        </label>
                                        <input
                                            className={field}
                                            value={item.url || ''}
                                            onChange={(e) =>
                                                updateItem('portfolio', index, {
                                                    url: e.target.value,
                                                })
                                            }
                                            placeholder="https://… (Behance, Drive, site…)"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={label}>
                                            Short description
                                        </label>
                                        <input
                                            className={field}
                                            value={item.description || ''}
                                            onChange={(e) =>
                                                updateItem('portfolio', index, {
                                                    description: e.target.value,
                                                })
                                            }
                                            placeholder="What you delivered"
                                        />
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <p className={label}>Work image</p>
                                    <MenuImagesEditor
                                        inputId={`portfolio-image-${index}`}
                                        images={
                                            item.image ? [item.image] : []
                                        }
                                        maxImages={1}
                                        libraryRoute={libraryRoute}
                                        uploadUrl={uploadUrl}
                                        onChange={(urls) =>
                                            updateItem('portfolio', index, {
                                                image: urls[0] || '',
                                            })
                                        }
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        disabled={atPortfolioLimit}
                        onClick={() =>
                            addItem('portfolio', {
                                title: '',
                                url: '',
                                description: '',
                                image: '',
                            })
                        }
                        className="inline-flex items-center gap-1.5 rounded-sm bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" />
                        Add work
                    </button>
                </Section>
            ) : null}

            {showServicesOffers || showThingsToDoOffers ? (
                <Section
                    title={
                        showThingsToDoOffers
                            ? 'Special offers'
                            : 'Current offers'
                    }
                    blurb="Promote packages, seasonal rates, or limited-time discounts."
                >
                    <ul className="space-y-3">
                        {deals.map((item, index) => (
                            <li
                                key={`svc-deal-${index}`}
                                className="space-y-2 rounded-xl border border-olive-100 bg-olive-50/40 p-3"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                        Offer {index + 1}
                                    </span>
                                    <RowActions
                                        onRemove={() =>
                                            removeItem('deals', index)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className={label}>Title</label>
                                    <input
                                        className={field}
                                        value={item.title || ''}
                                        onChange={(e) =>
                                            updateItem('deals', index, {
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. 10% off weekday bookings"
                                    />
                                </div>
                                <div>
                                    <RichTextEditor
                                        id={`svc-deal-details-${index}`}
                                        label="Details"
                                        value={item.description || ''}
                                        onChange={(html) =>
                                            updateItem('deals', index, {
                                                description: html,
                                            })
                                        }
                                        placeholder="Valid dates, terms…"
                                        allowImages={false}
                                        compact
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        onClick={() =>
                            addItem('deals', { title: '', description: '' })
                        }
                        className="inline-flex items-center gap-1.5 rounded-sm bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white"
                    >
                        <Plus className="h-4 w-4" />
                        Add offer
                    </button>
                </Section>
            ) : null}

            <MediaAddDialog
                open={Boolean(imageTarget)}
                onClose={() => setImageTarget(null)}
                libraryRoute={libraryRoute}
                initialPanel={libraryRoute ? 'library' : 'menu'}
                remaining={1}
                target={
                    imageTarget?.list === 'sponsors' ? 'sponsor' : 'logo'
                }
                onUpload={() => {
                    pendingSingleRef.current = imageTarget;
                    singleInputRef.current?.click();
                }}
                onPickUrls={(urls) => {
                    if (!imageTarget || !urls?.length) return;
                    updateItem(imageTarget.list, imageTarget.index, {
                        [imageTarget.key]: urls[0],
                    });
                    setImageTarget(null);
                }}
            />
            <input
                ref={singleInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    const target = pendingSingleRef.current || imageTarget;
                    pendingSingleRef.current = null;
                    setImageTarget(null);
                    if (!file || !target) return;
                    setSingleUploadProgress(0);
                    try {
                        const url = await uploadEditorMedia(file, uploadUrl, {
                            onProgress: setSingleUploadProgress,
                        });
                        if (url) {
                            updateItem(target.list, target.index, {
                                [target.key]: url,
                            });
                        }
                    } finally {
                        setSingleUploadProgress(null);
                    }
                }}
            />
            {singleUploadProgress != null ? (
                <div className="sticky bottom-3 z-20 rounded-sm border border-olive-200 bg-white/95 p-3 shadow-soft dark:border-olive-700 dark:bg-olive-950/95">
                    <UploadProgressBar
                        value={singleUploadProgress}
                        label="Uploading image…"
                    />
                </div>
            ) : null}
        </div>
        </SectionErrorBoundary>
    );
}
