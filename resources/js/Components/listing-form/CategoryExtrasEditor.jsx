import MediaAddDialog from './MediaAddDialog';
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
import { canUseStayFeature } from '@/data/stayTierFeatures';
import ShoppingTierUpsell from './ShoppingTierUpsell';
import ServicesTierUpsell from './ServicesTierUpsell';
import EventsTierUpsell from './EventsTierUpsell';
import {
    canUseShoppingFeature,
    shoppingProductHelp,
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
import { uploadEditorMedia } from '@/utils/uploadEditorMedia';
import { Link } from '@inertiajs/react';
import { ImagePlus, Images, Plus, Trash2, X } from 'lucide-react';
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

function ImagePickButton({ image, onPick, onClear }) {
    return (
        <div className="flex items-center gap-3">
            {image ? (
                <img
                    src={image}
                    alt=""
                    className="h-14 w-14 rounded-xl object-cover ring-1 ring-olive-200"
                />
            ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-olive-50 text-olive-400 ring-1 ring-olive-200 dark:bg-olive-900 dark:text-olive-500 dark:ring-olive-700">
                    <ImagePlus className="h-5 w-5" />
                </span>
            )}
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={onPick}
                    className="rounded-sm border border-olive-200 bg-white px-3 py-1.5 text-xs font-semibold text-olive-800 hover:border-mustard dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100 dark:hover:border-mustard"
                >
                    {image ? 'Replace image' : 'Add image'}
                </button>
                {image ? (
                    <button
                        type="button"
                        onClick={onClear}
                        className="rounded-sm px-3 py-1.5 text-xs font-semibold text-olive-500 hover:text-rose-700 dark:text-olive-400 dark:hover:text-rose-400"
                    >
                        Clear
                    </button>
                ) : null}
            </div>
        </div>
    );
}

function ImageDropzonePick({
    image,
    onClear,
    onFiles,
    remainingLabel = 'multi-select supported',
    inputId,
    multiple = true,
}) {
    const onDropFiles = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer?.files;
        if (files?.length) {
            onFiles?.(files);
        }
    };

    const fileInput = (
        <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple={multiple}
            className="sr-only"
            onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Copy before clearing — input.files is a live FileList.
                const files = Array.from(e.target.files || []);
                e.target.value = '';
                if (files.length) {
                    onFiles?.(files);
                }
            }}
        />
    );

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
                        <label
                            htmlFor={inputId}
                            className="cursor-pointer rounded-xl border border-white/30 bg-white/95 px-3 py-1.5 text-xs font-semibold text-olive-900 shadow-sm hover:bg-white"
                        >
                            Replace image
                        </label>
                        <button
                            type="button"
                            onClick={onClear}
                            className="rounded-sm bg-white/90 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm hover:bg-white"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <label
            htmlFor={inputId}
            onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            onDrop={onDropFiles}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-olive-300 bg-white/80 px-4 py-10 text-center transition hover:border-mustard hover:bg-mustard/5 dark:border-olive-700 dark:bg-olive-950/80 dark:hover:border-mustard dark:hover:bg-mustard/10"
        >
            {fileInput}
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-olive-50 ring-1 ring-olive-100 dark:bg-olive-900 dark:ring-olive-700">
                <ImagePlus className="h-6 w-6 text-olive-700 dark:text-olive-300" />
            </span>
            <span>
                <span className="block text-sm font-semibold text-olive-950 dark:text-olive-50">
                    Drop menu images here
                </span>
                <span className="mt-1 block text-xs text-olive-500">
                    Or click to upload · {remainingLabel}
                </span>
            </span>
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
    const remaining = Math.max(0, safeMax - images.length);
    const atLimit = remaining <= 0;
    const [libraryOpen, setLibraryOpen] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const addFiles = async (fileList) => {
        const files = Array.from(fileList || []).filter((f) =>
            f.type?.startsWith('image/'),
        );
        if (!files.length) {
            setUploadError('Choose a JPG, PNG, or WebP image.');
            return;
        }
        if (atLimit) {
            setUploadError(`This menu page already has ${safeMax} images.`);
            return;
        }
        setUploadError(null);
        setUploading(true);
        const chosen = files.slice(0, remaining);
        const urls = [];
        try {
            for (const file of chosen) {
                const url = await uploadEditorMedia(file, uploadUrl);
                if (url) {
                    urls.push(url);
                }
            }
        } finally {
            setUploading(false);
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
        onChange([...images, ...urls].slice(0, safeMax));
    };

    const addUrls = (urls) => {
        if (!urls?.length || atLimit) return;
        setUploadError(null);
        onChange([...images, ...urls].slice(0, safeMax));
    };

    const removeAt = (index) => {
        onChange(images.filter((_, i) => i !== index));
    };

    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    const openAdd = () => {
        if (atLimit) return;
        if (libraryRoute) {
            setLibraryOpen(true);
            return;
        }
        openFilePicker();
    };

    return (
        <div className="space-y-3">
            {/* Keep the file input mounted always so the OS picker still delivers
                files after MediaAddDialog closes (same pattern as GalleryUploader). */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
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
                                onClick={() => setLibraryOpen(true)}
                                className="inline-flex items-center gap-1.5 rounded-sm bg-olive-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-olive-800"
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
                                        onClick={() => removeAt(index)}
                                        className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-sm bg-white/95 text-rose-700 shadow-sm"
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
                                        onClick={openAdd}
                                        className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-olive-300 bg-white/70 text-olive-600 transition hover:border-mustard hover:bg-mustard/5"
                                    >
                                        <ImagePlus className="h-5 w-5" />
                                        <span className="text-[11px] font-semibold">
                                            Add more
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
                                remainingLabel={`up to ${safeMax} images`}
                                onFiles={(files) => void addFiles(files)}
                                onClear={() => {}}
                            />
                            {libraryRoute ? (
                                <button
                                    type="button"
                                    onClick={() => setLibraryOpen(true)}
                                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-sm border border-olive-200 bg-white px-3 py-2 text-xs font-semibold text-olive-800 transition hover:border-mustard dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100"
                                >
                                    <Images className="h-3.5 w-3.5" />
                                    Or grab from gallery
                                </button>
                            ) : null}
                        </div>
                    )}
                </>
            )}

            {uploading ? (
                <p className="text-sm font-medium text-olive-700 dark:text-olive-300">
                    Uploading menu image…
                </p>
            ) : null}

            {uploadError ? (
                <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                    {uploadError}
                </p>
            ) : null}

            {!libraryOpen && atLimit ? (
                <p className={help}>
                    This menu page is at the {safeMax}-image limit.
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
}) {
    const [imageTarget, setImageTarget] = useState(null); // { list, index, key } — sponsors/products only
    const singleInputRef = useRef(null);
    const pendingSingleRef = useRef(null);

    const setList = (key, next) => {
        onDetailsChange({ ...details, [key]: next });
    };

    const updateItem = (key, index, patch) => {
        const list = Array.isArray(details[key]) ? [...details[key]] : [];
        list[index] = { ...list[index], ...patch };
        setList(key, list);
    };

    const updateGig = (index, patch) => {
        const list = Array.isArray(details.event_schedule)
            ? [...details.event_schedule]
            : [];
        const next = { ...list[index], ...patch };
        next.label = formatGigWhenLabel(next);
        list[index] = next;
        setList('event_schedule', list);
    };

    const removeItem = (key, index) => {
        const list = Array.isArray(details[key]) ? [...details[key]] : [];
        list.splice(index, 1);
        setList(key, list);
    };

    const addItem = (key, blank) => {
        const list = Array.isArray(details[key]) ? [...details[key]] : [];
        setList(key, [...list, blank]);
    };

    const menus = Array.isArray(details.menus) ? details.menus : [];
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
    const showStayOffers =
        categoryKey === 'stay' && canUseStayFeature(tier, 'seasonal_offers');
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
                                <div>
                                    <label className={label}>
                                        PDF link (optional)
                                    </label>
                                    <input
                                        className={field}
                                        type="url"
                                        value={item.pdf || ''}
                                        onChange={(e) =>
                                            updateItem('menus', index, {
                                                pdf: e.target.value,
                                            })
                                        }
                                        placeholder="https://…/menu.pdf"
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
                                    pdf: '',
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
                        <ul className="space-y-4">
                            {sponsors.map((item, index) => (
                                <li
                                    key={`sponsor-${index}`}
                                    className="space-y-3 rounded-xl border border-olive-100 bg-olive-50/40 p-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                            Sponsor {index + 1}
                                        </span>
                                        <RowActions
                                            onRemove={() =>
                                                removeItem('sponsors', index)
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className={label}>Name</label>
                                        <input
                                            className={field}
                                            value={item.name || ''}
                                            onChange={(e) =>
                                                updateItem('sponsors', index, {
                                                    name: e.target.value,
                                                })
                                            }
                                            placeholder="Sponsor name"
                                        />
                                    </div>
                                    <ImagePickButton
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
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            onClick={() =>
                                addItem('sponsors', { name: '', logo: '' })
                            }
                            className="inline-flex items-center gap-1.5 rounded-sm bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white"
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
                                className="space-y-3 rounded-xl border border-olive-100 bg-olive-50/40 p-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                        Product {index + 1}
                                    </span>
                                    <RowActions
                                        onRemove={() =>
                                            removeItem('products', index)
                                        }
                                    />
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
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
                                    <div>
                                        <label className={label}>
                                            Category
                                        </label>
                                        <input
                                            className={field}
                                            value={item.category || ''}
                                            onChange={(e) =>
                                                updateItem('products', index, {
                                                    category: e.target.value,
                                                })
                                            }
                                            placeholder="e.g. Dairy"
                                        />
                                    </div>
                                    <div>
                                        <label className={label}>Price</label>
                                        <input
                                            className={field}
                                            value={
                                                item.price === 0 || item.price
                                                    ? String(item.price)
                                                    : ''
                                            }
                                            onChange={(e) =>
                                                updateItem('products', index, {
                                                    price: e.target.value,
                                                })
                                            }
                                            placeholder="e.g. 450 or KES 450"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={label}>
                                            Description
                                        </label>
                                        <input
                                            className={field}
                                            value={item.description || ''}
                                            onChange={(e) =>
                                                updateItem('products', index, {
                                                    description: e.target.value,
                                                })
                                            }
                                            placeholder="Short description"
                                        />
                                    </div>
                                </div>
                                <ImagePickButton
                                    image={item.image}
                                    onPick={() =>
                                        setImageTarget({
                                            list: 'products',
                                            index,
                                            key: 'image',
                                        })
                                    }
                                    onClear={() =>
                                        updateItem('products', index, {
                                            image: '',
                                        })
                                    }
                                />
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
                                description: '',
                                image: '',
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
                                <ImagePickButton
                                    image={item.image}
                                    onPick={() =>
                                        setImageTarget({
                                            list: 'portfolio',
                                            index,
                                            key: 'image',
                                        })
                                    }
                                    onClear={() =>
                                        updateItem('portfolio', index, {
                                            image: '',
                                        })
                                    }
                                />
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
                target="cover"
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
                    const url = await uploadEditorMedia(file, uploadUrl);
                    if (url) {
                        updateItem(target.list, target.index, {
                            [target.key]: url,
                        });
                    }
                }}
            />
        </div>
        </SectionErrorBoundary>
    );
}
