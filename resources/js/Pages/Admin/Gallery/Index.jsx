import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionMenu,
    AdminButton,
    EmptyState,
    PageHeader,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import UploadProgressBar from '@/Components/site/UploadProgressBar';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Check,
    Copy,
    ExternalLink,
    Grid2X2,
    LayoutList,
    Search,
    Trash2,
    Upload,
    X,
} from '@/Components/site/LucideCompat';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function formatDate(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return '—';
    }
}

function kindLabel(item) {
    const raw = String(item.kind || item.source || '').trim();
    if (!raw) return null;
    return raw.replace(/_/g, ' ');
}

function usageSummary(item) {
    const sources = Array.isArray(item.sources) ? item.sources.filter(Boolean) : [];
    if (!sources.length) {
        return kindLabel(item) || 'Unused file';
    }
    if (sources.length === 1) {
        return sources[0];
    }
    return `${sources[0]} +${sources.length - 1} more`;
}

export default function Index({ media, filters, counts, sources }) {
    const { confirm, dialog } = useConfirm();
    const [q, setQ] = useState(filters.q || '');
    const [source, setSource] = useState(filters.source || '');
    const [view, setView] = useState(filters.view || 'grid');
    const [selected, setSelected] = useState([]);
    const [preview, setPreview] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const skipDebounce = useRef(true);
    const fileInputRef = useRef(null);

    const uploadForm = useForm({ images: [] });

    const items = media.data || [];
    const selecting = selected.length > 0;
    const allIds = useMemo(
        () => items.filter((i) => i.can_delete).map((i) => i.url),
        [items],
    );
    const allSelected =
        allIds.length > 0 && allIds.every((url) => selected.includes(url));

    const pushFilters = (next) => {
        router.get(route('admin.gallery.index'), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    useEffect(() => {
        if (skipDebounce.current) {
            skipDebounce.current = false;
            return undefined;
        }
        const timer = setTimeout(() => {
            pushFilters({ q, source, view });
        }, 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    useEffect(() => {
        if (!preview) {
            return undefined;
        }
        const onKey = (event) => {
            if (event.key === 'Escape') {
                setPreview(null);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [preview]);

    const setFilter = (key, value) => {
        const next = { q, source, view, [key]: value };
        if (key === 'source') setSource(value);
        if (key === 'view') setView(value);
        pushFilters(next);
    };

    const toggleOne = (url, canDelete) => {
        if (!canDelete) return;
        setSelected((prev) =>
            prev.includes(url) ? prev.filter((x) => x !== url) : [...prev, url],
        );
    };

    const toggleAll = () => {
        setSelected(allSelected ? [] : allIds);
    };

    const copyUrl = async (item) => {
        try {
            await navigator.clipboard.writeText(item.url);
            setCopiedId(item.id);
            setTimeout(() => setCopiedId(null), 1600);
        } catch {
            // ignore
        }
    };

    const deleteOne = async (item) => {
        if (!item.can_delete) return;
        const ok = await confirm({
            title: 'Delete media?',
            message: `Remove this image from storage and clear where it is used?`,
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        router.delete(route('admin.gallery.destroy'), {
            data: { url: item.url },
            preserveScroll: true,
            onSuccess: () => {
                setSelected((prev) => prev.filter((u) => u !== item.url));
                setPreview((current) =>
                    current?.url === item.url ? null : current,
                );
            },
        });
    };

    const bulkDelete = async () => {
        if (!selected.length) return;
        const ok = await confirm({
            title: 'Delete selected media?',
            message: `Delete ${selected.length} selected image${selected.length === 1 ? '' : 's'} from storage and clear references?`,
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        router.post(
            route('admin.gallery.bulk-destroy'),
            { urls: selected },
            {
                preserveScroll: true,
                onSuccess: () => setSelected([]),
            },
        );
    };

    const onUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        uploadForm.setData('images', files);
        uploadForm.post(route('admin.gallery.store'), {
            forceFormData: true,
            onFinish: () => {
                uploadForm.reset();
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    const totalLabel =
        counts?.all != null
            ? `${counts.all} image${counts.all === 1 ? '' : 's'}`
            : null;

    return (
        <AdminLayout>
            <Head title="Gallery" />
            {dialog}

            <PageHeader
                title="Gallery"
                description={totalLabel}
                actions={
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            multiple
                            className="hidden"
                            onChange={onUpload}
                        />
                        <AdminButton
                            type="button"
                            disabled={uploadForm.processing}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-4 w-4" />
                            {uploadForm.processing
                                ? `Uploading ${Math.round(uploadForm.progress?.percentage ?? 0)}%`
                                : 'Upload'}
                        </AdminButton>
                    </>
                }
            />

            {uploadForm.processing ? (
                <div className="mb-4 max-w-md">
                    <UploadProgressBar
                        value={uploadForm.progress?.percentage ?? 0}
                        label="Uploading images…"
                    />
                </div>
            ) : null}

            <div className="mb-5 space-y-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <label className="relative min-w-0 flex-1">
                        <span className="sr-only">Search gallery</span>
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-400" />
                        <input
                            type="search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search images…"
                            className="w-full rounded-xl border border-olive-200 bg-white py-2.5 pl-10 pr-3 text-sm text-olive-950 outline-none transition placeholder:text-olive-400 focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50"
                        />
                    </label>

                    <div
                        className="inline-flex shrink-0 self-start overflow-hidden rounded-xl border border-olive-200 bg-white p-0.5 dark:border-olive-700 dark:bg-olive-950"
                        role="group"
                        aria-label="View mode"
                    >
                        <button
                            type="button"
                            onClick={() => setFilter('view', 'grid')}
                            className={`inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-xs font-semibold transition ${
                                view === 'grid'
                                    ? 'bg-olive-900 text-white'
                                    : 'text-olive-600 hover:bg-olive-50 dark:text-olive-300 dark:hover:bg-olive-900'
                            }`}
                            aria-pressed={view === 'grid'}
                        >
                            <Grid2X2 className="h-3.5 w-3.5" />
                            Grid
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilter('view', 'list')}
                            className={`inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-xs font-semibold transition ${
                                view === 'list'
                                    ? 'bg-olive-900 text-white'
                                    : 'text-olive-600 hover:bg-olive-50 dark:text-olive-300 dark:hover:bg-olive-900'
                            }`}
                            aria-pressed={view === 'list'}
                        >
                            <LayoutList className="h-3.5 w-3.5" />
                            List
                        </button>
                    </div>
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {sources.map((s) => {
                        const active = (source || '') === (s.key || '');
                        const count =
                            s.key === '' ? counts?.all : counts?.[s.key];
                        return (
                            <button
                                key={s.key || 'all'}
                                type="button"
                                onClick={() => setFilter('source', s.key)}
                                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                    active
                                        ? 'bg-olive-900 text-white shadow-soft'
                                        : 'bg-olive-100/80 text-olive-700 hover:bg-olive-200/80 dark:bg-olive-900 dark:text-olive-200 dark:hover:bg-olive-800'
                                }`}
                            >
                                {s.label}
                                {count != null ? (
                                    <span className="ml-1.5 tabular-nums opacity-70">
                                        {count}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </div>

            {!items.length ? (
                <EmptyState
                    title={
                        q || source
                            ? 'No images match'
                            : 'No images yet'
                    }
                    description="Upload photos, or they will appear here when added to listings, stories, and settings."
                    action={
                        <AdminButton
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-4 w-4" />
                            Upload images
                        </AdminButton>
                    }
                />
            ) : view === 'grid' ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3 px-0.5">
                        <p className="text-xs font-medium text-olive-500 dark:text-olive-400">
                            {items.length} shown
                        </p>
                        {allIds.length ? (
                            <button
                                type="button"
                                onClick={toggleAll}
                                className="text-xs font-semibold text-olive-700 transition hover:text-olive-950 dark:text-olive-200"
                            >
                                {allSelected ? 'Clear selection' : 'Select all'}
                            </button>
                        ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                        {items.map((item) => {
                            const isSelected = selected.includes(item.url);
                            return (
                                <article
                                    key={item.id}
                                    className={`group relative aspect-square overflow-hidden bg-olive-100 dark:bg-olive-950 ${
                                        isSelected
                                            ? 'ring-2 ring-inset ring-mustard'
                                            : 'ring-1 ring-inset ring-olive-900/5 dark:ring-white/5'
                                    }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setPreview(item)}
                                        className="absolute inset-0 block h-full w-full"
                                        aria-label="Open image"
                                    >
                                        <img
                                            src={item.url}
                                            alt=""
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                            loading="lazy"
                                        />
                                    </button>

                                    <div
                                        className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20 transition ${
                                            selecting || isSelected
                                                ? 'opacity-100'
                                                : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
                                        }`}
                                    />

                                    {item.can_delete ? (
                                        <label
                                            className={`absolute left-2 top-2 z-20 transition ${
                                                selecting || isSelected
                                                    ? 'opacity-100'
                                                    : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
                                            }`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() =>
                                                    toggleOne(
                                                        item.url,
                                                        item.can_delete,
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-white/40 bg-white/90 text-olive-900 shadow-sm"
                                                aria-label={`Select image`}
                                            />
                                        </label>
                                    ) : null}

                                    <div
                                        className={`absolute bottom-2 right-2 z-20 flex items-center gap-1 transition ${
                                            selecting
                                                ? 'opacity-0'
                                                : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => copyUrl(item)}
                                            className="rounded-lg bg-black/55 p-1.5 text-white backdrop-blur-sm ring-1 ring-white/15 hover:bg-black/70"
                                            title="Copy URL"
                                        >
                                            {copiedId === item.id ? (
                                                <Check className="h-3.5 w-3.5 text-mint" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                        {item.can_delete ? (
                                            <button
                                                type="button"
                                                onClick={() => deleteOne(item)}
                                                className="rounded-lg bg-black/55 p-1.5 text-rose-100 backdrop-blur-sm ring-1 ring-white/15 hover:bg-rose-700 hover:text-white"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        ) : null}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-olive-200 bg-white dark:border-olive-800 dark:bg-olive-950">
                    <div className="flex items-center justify-between gap-3 border-b border-olive-100 px-4 py-3 dark:border-olive-800">
                        <p className="text-xs font-medium text-olive-500">
                            {items.length} shown
                        </p>
                        {allIds.length ? (
                            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-olive-700 dark:text-olive-200">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleAll}
                                    className="h-3.5 w-3.5 rounded border-olive-300 text-olive-800"
                                />
                                Select all
                            </label>
                        ) : null}
                    </div>
                    <ul className="divide-y divide-olive-100 dark:divide-olive-800">
                        {items.map((item) => {
                            const isSelected = selected.includes(item.url);
                            const kind = kindLabel(item);
                            return (
                                <li
                                    key={item.id}
                                    className={`flex items-center gap-3 px-3 py-2.5 transition sm:px-4 ${
                                        isSelected
                                            ? 'bg-mustard/10'
                                            : 'hover:bg-olive-50/80 dark:hover:bg-olive-900/50'
                                    }`}
                                >
                                    {item.can_delete ? (
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() =>
                                                toggleOne(
                                                    item.url,
                                                    item.can_delete,
                                                )
                                            }
                                            className="h-4 w-4 shrink-0 rounded border-olive-300 text-olive-800"
                                            aria-label="Select image"
                                        />
                                    ) : (
                                        <span className="w-4 shrink-0" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setPreview(item)}
                                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                    >
                                        <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-olive-100 dark:bg-olive-800">
                                            <img
                                                src={item.url}
                                                alt=""
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                            />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-semibold text-olive-950 dark:text-olive-50">
                                                {usageSummary(item)}
                                            </span>
                                            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-olive-500">
                                                {kind ? (
                                                    <span className="capitalize">
                                                        {kind}
                                                    </span>
                                                ) : null}
                                                {item.size_label ? (
                                                    <span>{item.size_label}</span>
                                                ) : null}
                                                <span>
                                                    {formatDate(item.updated_at)}
                                                </span>
                                            </span>
                                        </span>
                                    </button>
                                    <ActionMenu
                                        items={[
                                            {
                                                label: 'Preview',
                                                onClick: () => setPreview(item),
                                            },
                                            {
                                                label:
                                                    copiedId === item.id
                                                        ? 'Copied'
                                                        : 'Copy URL',
                                                onClick: () => copyUrl(item),
                                            },
                                            item.edit_href
                                                ? {
                                                      label: 'Open source',
                                                      href: item.edit_href,
                                                  }
                                                : null,
                                            item.can_delete
                                                ? {
                                                      label: 'Delete',
                                                      onClick: () =>
                                                          deleteOne(item),
                                                      danger: true,
                                                  }
                                                : null,
                                        ].filter(Boolean)}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {selecting
                ? createPortal(
                      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                          <div className="pointer-events-auto flex max-w-full items-center gap-3 rounded-2xl bg-olive-950 px-4 py-3 text-white shadow-lift ring-1 ring-white/10">
                              <p className="text-sm font-semibold tabular-nums">
                                  {selected.length} selected
                              </p>
                              <button
                                  type="button"
                                  onClick={bulkDelete}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold hover:bg-rose-500"
                              >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                              </button>
                              <button
                                  type="button"
                                  onClick={() => setSelected([])}
                                  className="rounded-xl px-2.5 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
                              >
                                  Clear
                              </button>
                          </div>
                      </div>,
                      document.body,
                  )
                : null}

            {preview
                ? createPortal(
                      <div
                          className="fixed inset-0 z-[80] bg-earth-dusk/95 backdrop-blur-sm"
                          role="dialog"
                          aria-modal="true"
                          aria-label="Image preview"
                          onClick={() => setPreview(null)}
                      >
                          <div className="absolute inset-0 flex flex-col lg:flex-row">
                              <div
                                  className="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8"
                                  onClick={(e) => e.stopPropagation()}
                              >
                                  <img
                                      src={preview.url}
                                      alt=""
                                      className="max-h-full max-w-full object-contain shadow-lift"
                                  />
                              </div>

                              <aside
                                  className="flex w-full shrink-0 flex-col border-t border-white/10 bg-earth-dusk lg:w-[22rem] lg:border-l lg:border-t-0"
                                  onClick={(e) => e.stopPropagation()}
                              >
                                  <div className="flex items-start justify-between gap-3 px-5 pt-[max(1rem,env(safe-area-inset-top))] lg:pt-6">
                                      <div className="min-w-0">
                                          <p className="font-display text-lg font-semibold text-white">
                                              {kindLabel(preview)
                                                  ? kindLabel(preview)
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                    kindLabel(preview).slice(1)
                                                  : 'Image'}
                                          </p>
                                          <p className="mt-1 text-sm text-white/55">
                                              {usageSummary(preview)}
                                          </p>
                                      </div>
                                      <button
                                          type="button"
                                          onClick={() => setPreview(null)}
                                          className="rounded-xl bg-white/10 p-2 text-white ring-1 ring-white/15 hover:bg-white/15"
                                          aria-label="Close preview"
                                      >
                                          <X className="h-5 w-5" />
                                      </button>
                                  </div>

                                  <dl className="mt-5 space-y-4 px-5 text-sm">
                                      {preview.size_label ? (
                                          <div>
                                              <dt className="text-xs font-medium text-white/45">
                                                  Size
                                              </dt>
                                              <dd className="mt-0.5 text-white/90">
                                                  {preview.size_label}
                                              </dd>
                                          </div>
                                      ) : null}
                                      <div>
                                          <dt className="text-xs font-medium text-white/45">
                                              Updated
                                          </dt>
                                          <dd className="mt-0.5 text-white/90">
                                              {formatDate(preview.updated_at)}
                                          </dd>
                                      </div>
                                      {(preview.sources || []).length ? (
                                          <div>
                                              <dt className="text-xs font-medium text-white/45">
                                                  Used on
                                              </dt>
                                              <dd className="mt-1.5 space-y-1">
                                                  {(preview.sources || []).map(
                                                      (label) => (
                                                          <p
                                                              key={label}
                                                              className="text-white/85"
                                                          >
                                                              {label}
                                                          </p>
                                                      ),
                                                  )}
                                              </dd>
                                          </div>
                                      ) : null}
                                  </dl>

                                  <div className="mt-auto flex flex-wrap gap-2 border-t border-white/10 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                                      <button
                                          type="button"
                                          onClick={() => copyUrl(preview)}
                                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-olive-950 hover:bg-mustard"
                                      >
                                          {copiedId === preview.id ? (
                                              <Check className="h-3.5 w-3.5" />
                                          ) : (
                                              <Copy className="h-3.5 w-3.5" />
                                          )}
                                          {copiedId === preview.id
                                              ? 'Copied'
                                              : 'Copy URL'}
                                      </button>
                                      {preview.edit_href ? (
                                          <a
                                              href={preview.edit_href}
                                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 px-3 py-2.5 text-xs font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
                                          >
                                              <ExternalLink className="h-3.5 w-3.5" />
                                              Open
                                          </a>
                                      ) : null}
                                      {preview.can_delete ? (
                                          <button
                                              type="button"
                                              onClick={() => deleteOne(preview)}
                                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600/90 px-3 py-2.5 text-xs font-bold text-white hover:bg-rose-500"
                                          >
                                              <Trash2 className="h-3.5 w-3.5" />
                                              Delete
                                          </button>
                                      ) : null}
                                  </div>
                              </aside>
                          </div>
                      </div>,
                      document.body,
                  )
                : null}
        </AdminLayout>
    );
}
