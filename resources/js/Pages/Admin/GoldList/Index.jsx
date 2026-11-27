import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminButton,
    AdminInput,
    EmptyState,
    PageHeader,
} from '@/Components/Admin/ui';
import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Plus,
    Trash2,
} from '@/Components/site/LucideCompat';
import { useEffect, useRef, useState } from 'react';

function useListingSearch(searchUrl) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortRef = useRef(null);

    useEffect(() => {
        const q = query.trim();
        if (q.length < 2) {
            setResults([]);
            setLoading(false);
            setError(null);
            return undefined;
        }

        const timer = setTimeout(async () => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;
            setLoading(true);
            setError(null);

            try {
                const url = new URL(searchUrl, window.location.origin);
                url.searchParams.set('q', q);
                const response = await fetch(url.toString(), {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error('Search failed');
                }
                const data = await response.json();
                setResults(Array.isArray(data.listings) ? data.listings : []);
            } catch (err) {
                if (err?.name === 'AbortError') {
                    return;
                }
                setResults([]);
                setError('Could not search listings. Try again.');
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => {
            clearTimeout(timer);
            abortRef.current?.abort();
        };
    }, [query, searchUrl]);

    return { query, setQuery, results, loading, error };
}

export default function Index({ entries = [], limit = 24, searchUrl }) {
    const addForm = useForm({ listing_id: '' });
    const { query, setQuery, results, loading, error } = useListingSearch(searchUrl);
    const [dragIndex, setDragIndex] = useState(null);
    const [localEntries, setLocalEntries] = useState(entries);
    const localEntriesRef = useRef(entries);

    useEffect(() => {
        setLocalEntries(entries);
        localEntriesRef.current = entries;
    }, [entries]);

    const setOrderedEntries = (next) => {
        localEntriesRef.current = next;
        setLocalEntries(next);
    };

    const pinListing = (listingId) => {
        addForm.setData('listing_id', listingId);
        addForm.post(route('admin.gold-list.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setQuery('');
                addForm.reset();
            },
        });
    };

    const removePin = (entryId) => {
        router.delete(route('admin.gold-list.destroy', entryId), {
            preserveScroll: true,
        });
    };

    const persistOrder = (nextEntries) => {
        setOrderedEntries(nextEntries);
        router.post(
            route('admin.gold-list.reorder'),
            {
                order: nextEntries.map((entry, index) => ({
                    id: entry.id,
                    position: index,
                })),
            },
            { preserveScroll: true },
        );
    };

    const moveEntry = (index, delta) => {
        const target = index + delta;
        if (target < 0 || target >= localEntries.length) {
            return;
        }
        const next = [...localEntries];
        const [row] = next.splice(index, 1);
        next.splice(target, 0, row);
        persistOrder(next);
    };

    const onDragStart = (index) => setDragIndex(index);

    const onDragOver = (event, index) => {
        event.preventDefault();
        if (dragIndex === null || dragIndex === index) {
            return;
        }
        const next = [...localEntriesRef.current];
        const [row] = next.splice(dragIndex, 1);
        next.splice(index, 0, row);
        setDragIndex(index);
        setOrderedEntries(next);
    };

    const onDragEnd = () => {
        if (dragIndex === null) {
            return;
        }
        setDragIndex(null);
        persistOrder(localEntriesRef.current);
    };

    return (
        <AdminLayout>
            <Head title="Gold List" />

            <PageHeader
                title="Gold List"
                description={`Pin and reorder up to ${limit} homepage cards. Empty slots auto-fill by plan priority and rating.`}
            />

            <section className="mb-6 border border-olive-200 bg-white p-4 dark:border-olive-800 dark:bg-olive-900 sm:p-5">
                <h2 className="text-sm font-semibold text-olive-950 dark:text-white">
                    Add a listing
                </h2>
                <p className="mt-1 text-sm text-olive-600 dark:text-olive-400">
                    Search published listings, then pin them to the top of the Gold List.
                </p>

                <div className="relative mt-4 max-w-xl">
                    <AdminInput
                        label="Search listings"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Title, slug, or location"
                        autoComplete="off"
                    />
                    {loading ? (
                        <p className="mt-2 text-sm text-olive-500">Searching…</p>
                    ) : null}
                    {error ? (
                        <p className="mt-2 text-sm text-rose-700">{error}</p>
                    ) : null}
                    {addForm.errors.listing_id ? (
                        <p className="mt-2 text-sm text-rose-700">
                            {addForm.errors.listing_id}
                        </p>
                    ) : null}

                    {results.length > 0 ? (
                        <ul className="mt-3 divide-y divide-olive-100 border border-olive-200 dark:divide-olive-800 dark:border-olive-700">
                            {results.map((listing) => (
                                <li
                                    key={listing.id}
                                    className="flex items-center gap-3 px-3 py-2.5"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-olive-950 dark:text-white">
                                            {listing.title}
                                        </p>
                                        <p className="truncate text-xs text-olive-500">
                                            {[listing.category, listing.location]
                                                .filter(Boolean)
                                                .join(', ') || listing.slug}
                                        </p>
                                    </div>
                                    <AdminButton
                                        type="button"
                                        size="sm"
                                        disabled={addForm.processing}
                                        onClick={() => pinListing(listing.id)}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Pin
                                    </AdminButton>
                                </li>
                            ))}
                        </ul>
                    ) : query.trim().length >= 2 && !loading ? (
                        <p className="mt-2 text-sm text-olive-500">
                            No published listings match that search.
                        </p>
                    ) : null}
                </div>
            </section>

            {localEntries.length === 0 ? (
                <EmptyState
                    title="No pins yet"
                    description="Pinned listings appear first on the homepage Gold List. Remaining slots fill automatically."
                />
            ) : (
                <section className="space-y-2">
                    <div className="flex items-baseline justify-between gap-3">
                        <h2 className="text-sm font-semibold text-olive-950 dark:text-white">
                            Pinned order
                        </h2>
                        <p className="text-xs text-olive-500">
                            {localEntries.length} pin
                            {localEntries.length === 1 ? '' : 's'}
                        </p>
                    </div>

                    <ul className="divide-y divide-olive-100 border border-olive-200 bg-white dark:divide-olive-800 dark:border-olive-800 dark:bg-olive-900">
                        {localEntries.map((entry, index) => (
                            <li
                                key={entry.id}
                                draggable
                                onDragStart={() => onDragStart(index)}
                                onDragOver={(event) => onDragOver(event, index)}
                                onDragEnd={onDragEnd}
                                className={`flex items-center gap-3 px-3 py-3 sm:px-4 ${
                                    dragIndex === index ? 'bg-olive-50 dark:bg-olive-800/60' : ''
                                }`}
                            >
                                <span
                                    className="cursor-grab text-olive-400 active:cursor-grabbing"
                                    aria-hidden
                                >
                                    <ArrowUpDown className="h-4 w-4" />
                                </span>

                                <span className="w-6 shrink-0 text-center text-xs font-semibold tabular-nums text-olive-500">
                                    {index + 1}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-olive-950 dark:text-white">
                                        {entry.title}
                                    </p>
                                    <p className="truncate text-xs text-olive-500">
                                        {[entry.category, entry.location]
                                            .filter(Boolean)
                                            .join(', ') ||
                                            entry.slug ||
                                            'Listing'}
                                        {!entry.is_published ? (
                                            <span className="ml-2 font-medium text-rose-700">
                                                Unpublished (skipped on home)
                                            </span>
                                        ) : null}
                                    </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-1">
                                    <AdminButton
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        disabled={index === 0}
                                        onClick={() => moveEntry(index, -1)}
                                        aria-label="Move up"
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </AdminButton>
                                    <AdminButton
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        disabled={index === localEntries.length - 1}
                                        onClick={() => moveEntry(index, 1)}
                                        aria-label="Move down"
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </AdminButton>
                                    <AdminButton
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => removePin(entry.id)}
                                        aria-label="Remove pin"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </AdminButton>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </AdminLayout>
    );
}
