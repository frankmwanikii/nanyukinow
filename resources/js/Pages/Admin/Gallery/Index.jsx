import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionMenu,
    AdminButton,
    AdminInput,
    DataCard,
    DataTable,
    EmptyState,
    FilterBar,
    PageHeader,
    Pagination,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Check,
    Copy,
    ExternalLink,
    Grid2X2,
    LayoutList,
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

function sourceTone(source) {
    const map = {
        listings: 'bg-mustard/25 text-olive-900',
        stories: 'bg-mint/30 text-olive-900',
        avatars: 'bg-olive-100 text-olive-700',
        branding: 'bg-earth-clay/20 text-olive-900',
        pages: 'bg-sky-100 text-sky-900',
        site: 'bg-olive-50 text-olive-600',
    };
    return map[source] || 'bg-olive-50 text-olive-600';
}

export default function Index({ media, filters, counts, sources }) {
    const { confirm, dialog } = useConfirm();
    const [q, setQ] = useState(filters.q || '');
    const [source, setSource] = useState(filters.source || '');
    const [view, setView] = useState(filters.view || 'grid');
    const [perPage, setPerPage] = useState(filters.per_page || 15);
    const [selected, setSelected] = useState([]);
    const [preview, setPreview] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const skipDebounce = useRef(true);
    const fileInputRef = useRef(null);

    const uploadForm = useForm({ images: [] });

    const items = media.data || [];
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
            pushFilters({ q, source, view, per_page: perPage });
        }, 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    const setFilter = (key, value) => {
        const next = { q, source, view, per_page: perPage, [key]: value };
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
            message: `Delete “${item.filename}” from storage and clear references?`,
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        router.delete(route('admin.gallery.destroy'), {
            data: { url: item.url },
            preserveScroll: true,
            onSuccess: () =>
                setSelected((prev) => prev.filter((u) => u !== item.url)),
        });
    };

    const bulkDelete = async () => {
        if (!selected.length) return;
        const ok = await confirm({
            title: 'Delete selected media?',
            message: `Delete ${selected.length} selected item(s) from storage and clear references?`,
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
            ? `${counts.all} image${counts.all === 1 ? '' : 's'} across the site`
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
                            {uploadForm.processing ? 'Uploading…' : 'Upload'}
                        </AdminButton>
                    </>
                }
            />

            <FilterBar>
                <AdminInput
                    label="Search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Filename, path, listing…"
                    className="min-w-[200px] flex-1"
                />
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-olive-500">
                        Source
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {sources.map((s) => {
                            const active = (source || '') === (s.key || '');
                            const count =
                                s.key === ''
                                    ? counts?.all
                                    : counts?.[s.key];
                            return (
                                <button
                                    key={s.key || 'all'}
                                    type="button"
                                    onClick={() => setFilter('source', s.key)}
                                    className={`rounded-[2px] px-3 py-1.5 text-xs font-semibold transition ${
                                        active
                                            ? 'bg-olive-900 text-white'
                                            : 'border border-olive-200 bg-white text-olive-700 hover:border-olive-400 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-200'
                                    }`}
                                >
                                    {s.label}
                                    {count != null ? (
                                        <span className="ml-1 opacity-70">
                                            {count}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="ml-auto flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-olive-500">
                        View
                    </span>
                    <div
                        className="inline-flex overflow-hidden rounded-[2px] border border-olive-200 bg-white dark:border-olive-700 dark:bg-olive-900"
                        role="group"
                        aria-label="View mode"
                    >
                        <button
                            type="button"
                            onClick={() => setFilter('view', 'grid')}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold ${
                                view === 'grid'
                                    ? 'bg-olive-900 text-white'
                                    : 'text-olive-600 hover:bg-olive-50 dark:text-olive-300'
                            }`}
                            aria-pressed={view === 'grid'}
                        >
                            <Grid2X2 className="h-3.5 w-3.5" />
                            Grid
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilter('view', 'list')}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold ${
                                view === 'list'
                                    ? 'bg-olive-900 text-white'
                                    : 'text-olive-600 hover:bg-olive-50 dark:text-olive-300'
                            }`}
                            aria-pressed={view === 'list'}
                        >
                            <LayoutList className="h-3.5 w-3.5" />
                            List
                        </button>
                    </div>
                </div>
            </FilterBar>

            {selected.length > 0 ? (
                <div className="mb-4 flex flex-wrap items-center gap-3 border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/50 dark:bg-rose-950/40">
                    <span className="text-sm font-semibold text-rose-900 dark:text-rose-100">
                        {selected.length} selected
                    </span>
                    <button
                        type="button"
                        onClick={bulkDelete}
                        className="inline-flex items-center gap-1.5 rounded-[2px] bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete selected
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelected([])}
                        className="text-xs font-semibold text-rose-800 underline-offset-2 hover:underline dark:text-rose-200"
                    >
                        Clear
                    </button>
                </div>
            ) : null}

            {!items.length ? (
                <EmptyState
                    title={q || source ? 'No media match your filters' : 'No media yet'}
                    description="Upload images or add them through listings, stories, and settings."
                    action={
                        <AdminButton
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-4 w-4" />
                            Upload media
                        </AdminButton>
                    }
                />
            ) : view === 'grid' ? (
                <DataCard
                    title="Library"
                    tools={
                        allIds.length ? (
                            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-olive-600">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleAll}
                                    className="h-3.5 w-3.5 rounded border-olive-300 text-olive-800"
                                />
                                Select page
                            </label>
                        ) : null
                    }
                    footer={
                        <Pagination
                            links={media.links}
                            meta={media.meta || media}
                            perPage={perPage}
                            onPerPageChange={(n) => {
                                setPerPage(n);
                                pushFilters({ q, source, view, per_page: n });
                            }}
                        />
                    }
                >
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => {
                            const isSelected = selected.includes(item.url);
                            return (
                                <article
                                    key={item.id}
                                    className={`group relative aspect-[4/3] overflow-hidden bg-olive-100 dark:bg-olive-950 ${
                                        isSelected
                                            ? 'ring-2 ring-inset ring-mustard'
                                            : ''
                                    }`}
                                >
                                    {item.can_delete ? (
                                        <label
                                            className="absolute left-2 top-2 z-20"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() =>
                                                    toggleOne(item.url, item.can_delete)
                                                }
                                                className="h-4 w-4 rounded-[2px] border-olive-300 text-olive-800"
                                                aria-label={`Select ${item.filename}`}
                                            />
                                        </label>
                                    ) : null}

                                    <button
                                        type="button"
                                        onClick={() => setPreview(item)}
                                        className="absolute inset-0 block h-full w-full"
                                        aria-label={`Preview ${item.filename}`}
                                    >
                                        <img
                                            src={item.url}
                                            alt=""
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    </button>

                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3 pb-2.5 pt-10">
                                        <p
                                            className="truncate text-sm font-semibold text-white"
                                            title={item.filename}
                                        >
                                            {item.filename}
                                        </p>
                                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                            <span
                                                className={`rounded-[2px] px-1.5 py-0.5 text-[10px] font-semibold ${sourceTone(item.source)}`}
                                            >
                                                {item.kind || item.source}
                                            </span>
                                            {item.size_label ? (
                                                <span className="text-[10px] font-medium text-white/70">
                                                    {item.size_label}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                                        <button
                                            type="button"
                                            onClick={() => copyUrl(item)}
                                            className="rounded-[2px] bg-black/55 p-1.5 text-white ring-1 ring-white/20 hover:bg-black/75"
                                            title="Copy URL"
                                        >
                                            {copiedId === item.id ? (
                                                <Check className="h-3.5 w-3.5 text-mint" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                        {item.edit_href ? (
                                            <a
                                                href={item.edit_href}
                                                className="rounded-[2px] bg-black/55 p-1.5 text-white ring-1 ring-white/20 hover:bg-black/75"
                                                title="Open source"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        ) : null}
                                        {item.can_delete ? (
                                            <button
                                                type="button"
                                                onClick={() => deleteOne(item)}
                                                className="rounded-[2px] bg-black/55 p-1.5 text-rose-200 ring-1 ring-white/20 hover:bg-rose-700 hover:text-white"
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
                </DataCard>
            ) : (
                <DataCard
                    title="Library"
                    footer={
                        <Pagination
                            links={media.links}
                            meta={media.meta || media}
                            perPage={perPage}
                            onPerPageChange={(n) => {
                                setPerPage(n);
                                pushFilters({ q, source, view, per_page: n });
                            }}
                        />
                    }
                >
                    <DataTable>
                        <thead>
                            <tr>
                                <Th className="w-10">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleAll}
                                        disabled={!allIds.length}
                                        className="h-3.5 w-3.5 rounded border-slate-300 text-slate-800"
                                    />
                                </Th>
                                <Th>File</Th>
                                <Th>Source</Th>
                                <Th>Date</Th>
                                <Th align="right">Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => {
                                const isSelected = selected.includes(item.url);
                                return (
                                    <tr key={item.id}>
                                        <Td>
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
                                                    className="h-3.5 w-3.5 rounded border-slate-300 text-slate-800"
                                                    aria-label={`Select ${item.filename}`}
                                                />
                                            ) : (
                                                <span className="text-olive-300">—</span>
                                            )}
                                        </Td>
                                        <Td>
                                            <button
                                                type="button"
                                                onClick={() => setPreview(item)}
                                                className="flex min-w-0 items-center gap-3 text-left"
                                            >
                                                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-olive-100 ring-1 ring-olive-200/80 dark:bg-olive-800">
                                                    <img
                                                        src={item.url}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                        loading="lazy"
                                                    />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block truncate text-sm font-semibold text-olive-900 dark:text-olive-50">
                                                        {item.filename}
                                                    </span>
                                                    <span className="block truncate text-xs text-olive-500">
                                                        {item.url}
                                                        {item.size_label
                                                            ? ` · ${item.size_label}`
                                                            : ''}
                                                    </span>
                                                </span>
                                            </button>
                                        </Td>
                                        <Td>
                                            <div className="flex flex-wrap gap-1">
                                                {(item.sources || [])
                                                    .slice(0, 3)
                                                    .map((label) => (
                                                        <span
                                                            key={label}
                                                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${sourceTone(item.source)}`}
                                                        >
                                                            {label}
                                                        </span>
                                                    ))}
                                            </div>
                                        </Td>
                                        <Td>
                                            <span className="text-sm text-olive-600 dark:text-olive-300">
                                                {formatDate(item.updated_at)}
                                            </span>
                                        </Td>
                                        <Td align="right">
                                            <ActionMenu
                                                items={[
                                                    {
                                                        label: 'Preview',
                                                        onClick: () =>
                                                            setPreview(item),
                                                    },
                                                    {
                                                        label:
                                                            copiedId === item.id
                                                                ? 'Copied'
                                                                : 'Copy URL',
                                                        onClick: () =>
                                                            copyUrl(item),
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
                                        </Td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </DataTable>
                </DataCard>
            )}

            {preview
                ? createPortal(
                      <div
                          className="fixed inset-0 z-[80] bg-black"
                          role="dialog"
                          aria-modal="true"
                          aria-label="Media preview"
                          onClick={() => setPreview(null)}
                      >
                          <div
                              className="absolute inset-0 flex items-center justify-center"
                              onClick={(e) => e.stopPropagation()}
                          >
                              <img
                                  src={preview.url}
                                  alt={preview.filename}
                                  className="max-h-[100dvh] max-w-[100vw] object-contain"
                              />
                          </div>
                          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/75 to-transparent pb-16 pt-[max(0.75rem,env(safe-area-inset-top))]">
                              <div
                                  className="pointer-events-auto flex items-start justify-between gap-3 px-4 sm:px-6"
                                  onClick={(e) => e.stopPropagation()}
                              >
                                  <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold text-white sm:text-base">
                                          {preview.filename}
                                      </p>
                                      <p className="mt-0.5 truncate text-xs text-white/55">
                                          {preview.url}
                                      </p>
                                  </div>
                                  <button
                                      type="button"
                                      onClick={() => setPreview(null)}
                                      className="rounded-[2px] bg-white/10 p-2 text-white ring-1 ring-white/20 hover:bg-white/20"
                                      aria-label="Close preview"
                                  >
                                      <X className="h-5 w-5" />
                                  </button>
                              </div>
                          </div>
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent pt-16 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                              <div
                                  className="pointer-events-auto flex flex-wrap items-center justify-end gap-2 px-4 sm:px-6"
                                  onClick={(e) => e.stopPropagation()}
                              >
                                  <button
                                      type="button"
                                      onClick={() => copyUrl(preview)}
                                      className="inline-flex items-center gap-1.5 rounded-[2px] border border-white/25 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/60"
                                  >
                                      {copiedId === preview.id ? (
                                          <Check className="h-3.5 w-3.5" />
                                      ) : (
                                          <Copy className="h-3.5 w-3.5" />
                                      )}
                                      Copy URL
                                  </button>
                                  {preview.edit_href ? (
                                      <a
                                          href={preview.edit_href}
                                          className="inline-flex items-center gap-1.5 rounded-[2px] border border-white/25 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/60"
                                      >
                                          <ExternalLink className="h-3.5 w-3.5" />
                                          Open source
                                      </a>
                                  ) : null}
                              </div>
                          </div>
                      </div>,
                      document.body,
                  )
                : null}
        </AdminLayout>
    );
}
