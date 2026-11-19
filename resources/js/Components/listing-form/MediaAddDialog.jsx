import {
    ArrowLeft,
    Check,
    ImagePlus,
    Link2,
    Loader2,
    Search,
    Upload,
} from '@/Components/site/LucideCompat';
import { useEffect, useId, useState } from 'react';

const TARGET_COPY = {
    gallery: {
        menu: 'Add photos',
        library: 'Grab from gallery',
        url: 'Paste image URL',
        back: 'Back to photos',
        uploadHint: 'Choose files from this device',
        libraryHint: 'Pick existing images from your library',
        urlHint: 'Use a direct link to an image',
    },
    cover: {
        menu: 'Replace cover',
        library: 'Choose cover from gallery',
        url: 'Cover image URL',
        back: 'Back to photos',
        uploadHint: 'Upload a new cover from this device',
        libraryHint: 'Pick an existing image as the cover',
        urlHint: 'Use a direct link for the cover',
    },
    sponsor: {
        menu: 'Replace sponsor logo',
        library: 'Choose sponsor logo from gallery',
        url: 'Sponsor logo URL',
        back: 'Back to sponsors',
        uploadHint: 'Upload a new sponsor logo from this device',
        libraryHint: 'Pick an existing image as the sponsor logo',
        urlHint: 'Use a direct link for the sponsor logo',
    },
    logo: {
        menu: 'Replace logo',
        library: 'Choose logo from gallery',
        url: 'Logo image URL',
        back: 'Back to photos',
        uploadHint: 'Upload a new logo from this device',
        libraryHint: 'Pick an existing image as the logo',
        urlHint: 'Use a direct link for the logo',
    },
    poster: {
        menu: 'Replace poster',
        library: 'Choose poster from gallery',
        url: 'Poster image URL',
        back: 'Back to photos',
        uploadHint: 'Upload a new poster from this device',
        libraryHint: 'Pick an existing image as the poster',
        urlHint: 'Use a direct link for the poster',
    },
};

/**
 * Full in-flow page for adding/replacing media (upload / library / URL).
 */
export default function MediaAddDialog({
    open,
    onClose,
    onUpload,
    onPickUrls,
    libraryRoute = null,
    remaining = 12,
    target = 'gallery',
    initialPanel = 'menu',
}) {
    const titleId = useId();
    const copy = TARGET_COPY[target] || TARGET_COPY.gallery;
    const single = target !== 'gallery';
    const maxSelect = single ? 1 : Math.max(1, remaining);

    const [panel, setPanel] = useState('menu'); // menu | library | url
    const [q, setQ] = useState('');
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState([]);
    const [urlValue, setUrlValue] = useState('');
    const [urlError, setUrlError] = useState(null);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        if (!open) return undefined;
        const start =
            libraryRoute && initialPanel === 'library' ? 'library' : 'menu';
        setPanel(start);
        setQ('');
        setItems([]);
        setSelected([]);
        setUrlValue('');
        setUrlError(null);
        setLoadError(null);
        return undefined;
    }, [open, target, initialPanel, libraryRoute]);

    useEffect(() => {
        if (!open || panel !== 'library' || !libraryRoute) return undefined;

        let cancelled = false;
        const timer = setTimeout(async () => {
            setLoading(true);
            setLoadError(null);
            try {
                const { data } = await window.axios.get(libraryRoute, {
                    params: { q: q.trim() || undefined, limit: 48 },
                });
                if (cancelled) return;
                setItems(data.items || []);
                setTotal(data.total || 0);
            } catch {
                if (!cancelled) {
                    setLoadError('Could not load the media library.');
                    setItems([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, q ? 280 : 0);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [open, panel, libraryRoute, q]);

    if (!open) return null;

    const toggleSelect = (url) => {
        setSelected((prev) => {
            if (prev.includes(url)) return prev.filter((u) => u !== url);
            if (single) return [url];
            if (prev.length >= maxSelect) return prev;
            return [...prev, url];
        });
    };

    const confirmLibrary = () => {
        if (!selected.length) return;
        onPickUrls?.(selected);
        onClose?.();
    };

    const confirmUrl = () => {
        const raw = urlValue.trim();
        if (!raw) {
            setUrlError('Paste an image URL.');
            return;
        }
        try {
            const parsed = new URL(raw);
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                setUrlError('URL must start with http:// or https://');
                return;
            }
        } catch {
            setUrlError('That does not look like a valid URL.');
            return;
        }
        onPickUrls?.([raw]);
        onClose?.();
    };

    const goBack = () => {
        if (panel === 'menu') {
            onClose?.();
        } else {
            setPanel('menu');
        }
    };

    const title =
        panel === 'menu'
            ? copy.menu
            : panel === 'library'
              ? copy.library
              : copy.url;

    const optionBtn =
        'group flex w-full items-start gap-4 rounded-sm border border-olive-200/80 bg-gradient-to-br from-white to-olive-50/40 px-5 py-4 text-left shadow-soft transition hover:border-mustard/80 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard dark:border-olive-700 dark:from-olive-900 dark:to-olive-950 dark:hover:border-mustard/50';

    return (
        <section
            className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-olive-200/80 dark:bg-olive-900 dark:ring-olive-800 sm:p-7"
            aria-labelledby={titleId}
        >
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-olive-100 pb-5 dark:border-olive-800">
                <div className="min-w-0">
                    <button
                        type="button"
                        onClick={goBack}
                        className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-olive-600 transition hover:text-olive-950 dark:text-olive-400 dark:hover:text-olive-100"
                    >
                        <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
                        {panel === 'menu' ? copy.back : 'Back'}
                    </button>
                    <h2
                        id={titleId}
                        className="text-xl font-semibold tracking-tight text-olive-950 dark:text-white"
                    >
                        {title}
                    </h2>
                    <p className="mt-1 text-sm text-olive-500 dark:text-olive-400">
                        {single
                            ? 'Upload, grab from gallery, or paste a URL'
                            : `${remaining} slot${remaining === 1 ? '' : 's'} remaining`}
                    </p>
                </div>
            </div>

            {panel === 'menu' ? (
                <div className="mx-auto grid max-w-xl gap-3">
                    <button
                        type="button"
                        className={optionBtn}
                        onClick={() => {
                            // Open the OS file picker first while the page is
                            // stable, then close this panel. Parents keep their
                            // <input type="file"> mounted outside this dialog.
                            onUpload?.();
                            window.setTimeout(() => onClose?.(), 0);
                        }}
                    >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-olive-900 text-white transition group-hover:scale-105 dark:bg-mustard dark:text-olive-950">
                            <Upload className="h-5 w-5" />
                        </span>
                        <span>
                            <span className="block text-base font-semibold text-olive-950 dark:text-olive-50">
                                Upload
                            </span>
                            <span className="mt-0.5 block text-sm text-olive-500 dark:text-olive-400">
                                {copy.uploadHint}
                            </span>
                        </span>
                    </button>

                    {libraryRoute ? (
                    <button
                        type="button"
                        className={optionBtn}
                        onClick={() => setPanel('library')}
                    >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mustard/30 text-olive-900 transition group-hover:scale-105">
                            <ImagePlus className="h-5 w-5" />
                        </span>
                        <span>
                            <span className="block text-base font-semibold text-olive-950 dark:text-olive-50">
                                Grab from gallery
                            </span>
                            <span className="mt-0.5 block text-sm text-olive-500 dark:text-olive-400">
                                {copy.libraryHint}
                            </span>
                        </span>
                    </button>
                    ) : null}

                    <button
                        type="button"
                        className={optionBtn}
                        onClick={() => setPanel('url')}
                    >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mint/35 text-olive-900 transition group-hover:scale-105 dark:bg-mint/15 dark:text-mint">
                            <Link2 className="h-5 w-5" />
                        </span>
                        <span>
                            <span className="block text-base font-semibold text-olive-950 dark:text-olive-50">
                                Paste URL
                            </span>
                            <span className="mt-0.5 block text-sm text-olive-500 dark:text-olive-400">
                                {copy.urlHint}
                            </span>
                        </span>
                    </button>
                </div>
            ) : null}

            {panel === 'library' ? (
                <div className="space-y-4">
                    <label className="relative mx-auto block max-w-xl">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-400" />
                        <input
                            type="search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search library…"
                            className="h-11 w-full rounded-xl border-0 bg-olive-50 pl-10 pr-3 text-sm text-olive-900 outline-none ring-1 ring-inset ring-olive-200 focus:ring-2 focus:ring-mustard/50 dark:bg-olive-950 dark:text-olive-50 dark:ring-olive-700"
                            autoFocus
                        />
                    </label>

                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-16 text-sm text-olive-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading…
                        </div>
                    ) : loadError ? (
                        <p className="py-16 text-center text-sm text-rose-600">
                            {loadError}
                        </p>
                    ) : items.length === 0 ? (
                        <p className="py-16 text-center text-sm text-olive-500">
                            No images found{q ? ` for “${q}”` : ''}.
                        </p>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs font-medium text-olive-500">
                                    Showing {items.length}
                                    {total > items.length ? ` of ${total}` : ''}
                                    {single
                                        ? ' · pick one'
                                        : ` · select up to ${maxSelect}`}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="rounded-sm px-4 py-2 text-sm font-semibold text-olive-700 ring-1 ring-olive-200 transition hover:bg-olive-50 dark:text-olive-200 dark:ring-olive-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!selected.length}
                                        onClick={confirmLibrary}
                                        className="rounded-sm bg-olive-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-olive-800 disabled:opacity-40"
                                    >
                                        {single
                                            ? 'Use image'
                                            : `Add ${selected.length || ''}`}
                                    </button>
                                </div>
                            </div>
                            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {items.map((item) => {
                                    const active = selected.includes(item.url);
                                    return (
                                        <li key={item.id || item.url}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleSelect(item.url)
                                                }
                                                onDoubleClick={() => {
                                                    if (single) {
                                                        onPickUrls?.([item.url]);
                                                        onClose?.();
                                                    }
                                                }}
                                                className={`group relative aspect-square w-full overflow-hidden rounded-sm ring-2 transition ${
                                                    active
                                                        ? 'ring-mustard'
                                                        : 'ring-transparent hover:ring-olive-300'
                                                }`}
                                                title={item.filename}
                                            >
                                                <img
                                                    src={item.url}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                />
                                                {active ? (
                                                    <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-mustard text-olive-950 shadow">
                                                        <Check
                                                            className="h-4 w-4"
                                                            strokeWidth={2.75}
                                                        />
                                                    </span>
                                                ) : null}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    )}
                </div>
            ) : null}

            {panel === 'url' ? (
                <div className="mx-auto max-w-xl space-y-4">
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-semibold text-olive-800 dark:text-olive-200">
                            Image URL
                        </span>
                        <input
                            type="url"
                            value={urlValue}
                            onChange={(e) => {
                                setUrlValue(e.target.value);
                                setUrlError(null);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    confirmUrl();
                                }
                            }}
                            placeholder="https://…"
                            className="h-12 w-full rounded-xl border-0 bg-olive-50 px-4 text-sm text-olive-900 outline-none ring-1 ring-inset ring-olive-200 focus:ring-2 focus:ring-mustard/50 dark:bg-olive-950 dark:text-olive-50 dark:ring-olive-700"
                            autoFocus
                        />
                    </label>
                    {urlError ? (
                        <p className="text-sm text-rose-600">{urlError}</p>
                    ) : (
                        <p className="text-sm text-olive-500">
                            Use a direct link ending in .jpg, .png, or .webp when
                            possible.
                        </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-sm px-4 py-2.5 text-sm font-semibold text-olive-700 ring-1 ring-olive-200 transition hover:bg-olive-50 dark:text-olive-200 dark:ring-olive-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmUrl}
                            className="rounded-sm bg-olive-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-olive-800"
                        >
                            {single ? 'Use image' : 'Add image'}
                        </button>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
