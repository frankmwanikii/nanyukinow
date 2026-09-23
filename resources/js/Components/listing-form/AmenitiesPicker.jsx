import { field, help, label } from './fieldStyles';
import { Check, Plus, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Multi-select amenities with typeahead search + create-custom (persisted via API).
 * Suggestions stay hidden until the user starts typing.
 */
export default function AmenitiesPicker({
    amenities = [],
    selected = [],
    categoryKey,
    onChange,
    onCreated,
}) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);
    const wrapRef = useRef(null);

    const matches = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];

        return amenities
            .filter((a) => {
                const catOk =
                    !a.category_key ||
                    !categoryKey ||
                    a.category_key === categoryKey;
                if (!catOk) return false;
                return (
                    a.name.toLowerCase().includes(q) ||
                    a.slug.toLowerCase().includes(q)
                );
            })
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(0, 12);
    }, [amenities, categoryKey, query]);

    const exactMatch = matches.some(
        (a) => a.name.toLowerCase() === query.trim().toLowerCase(),
    );

    const showDropdown = open && query.trim().length > 0;

    useEffect(() => {
        const onPointerDown = (e) => {
            if (!wrapRef.current?.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, []);

    const toggle = (slug) => {
        if (selected.includes(slug)) {
            onChange(selected.filter((s) => s !== slug));
        } else {
            onChange([...selected, slug]);
        }
    };

    const pick = (slug) => {
        if (!selected.includes(slug)) {
            onChange([...selected, slug]);
        }
        setQuery('');
        setOpen(false);
    };

    const createCustom = async () => {
        const name = query.trim();
        if (!name || creating) return;
        setCreating(true);
        setError(null);
        try {
            const res = await window.axios.post(route('account.amenities.store'), {
                name,
                category_key: categoryKey || null,
            });
            const amenity = res.data?.amenity;
            if (amenity) {
                onCreated?.(amenity);
                if (!selected.includes(amenity.slug)) {
                    onChange([...selected, amenity.slug]);
                }
                setQuery('');
                setOpen(false);
            }
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    'Could not save that amenity. Try again.',
            );
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-4">
            <div ref={wrapRef}>
                <label className={label} htmlFor="amenity_search">
                    Amenities & features
                </label>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-olive-500" />
                    <input
                        id="amenity_search"
                        className={`${field} pl-10 pr-24`}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setOpen(true);
                        }}
                        onFocus={() => {
                            if (query.trim()) setOpen(true);
                        }}
                        placeholder="Search or type a new amenity…"
                        autoComplete="off"
                        aria-expanded={showDropdown}
                        aria-controls="amenity_suggestions"
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setOpen(false);
                                return;
                            }
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                if (!query.trim()) return;
                                if (matches.length === 1) {
                                    pick(matches[0].slug);
                                } else if (!exactMatch) {
                                    createCustom();
                                } else {
                                    const hit = matches.find(
                                        (a) =>
                                            a.name.toLowerCase() ===
                                            query.trim().toLowerCase(),
                                    );
                                    if (hit) pick(hit.slug);
                                }
                            }
                        }}
                    />
                    {query.trim() && !exactMatch ? (
                        <button
                            type="button"
                            onClick={createCustom}
                            disabled={creating}
                            className="absolute right-2 top-1/2 z-10 inline-flex -translate-y-1/2 items-center gap-1 rounded-lg bg-mustard px-2.5 py-1.5 text-xs font-bold text-earth-dusk disabled:opacity-50"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            {creating ? 'Saving…' : 'Add'}
                        </button>
                    ) : null}

                    {showDropdown ? (
                        <div
                            id="amenity_suggestions"
                            role="listbox"
                            className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-30 max-h-64 overflow-y-auto rounded-2xl border border-olive-200/90 bg-white py-1.5 shadow-lift dark:border-olive-700 dark:bg-olive-900"
                        >
                            {matches.length ? (
                                <ul>
                                    {matches.map((amenity) => {
                                        const active = selected.includes(
                                            amenity.slug,
                                        );
                                        return (
                                            <li key={amenity.id || amenity.slug}>
                                                <button
                                                    type="button"
                                                    role="option"
                                                    aria-selected={active}
                                                    onClick={() =>
                                                        pick(amenity.slug)
                                                    }
                                                    className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition ${
                                                        active
                                                            ? 'bg-mustard/25 font-semibold text-olive-950 dark:bg-mustard/15 dark:text-mustard'
                                                            : 'text-olive-800 hover:bg-olive-50 dark:text-olive-100 dark:hover:bg-olive-800'
                                                    }`}
                                                >
                                                    <span
                                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                                            active
                                                                ? 'border-mustard bg-mustard text-earth-dusk'
                                                                : 'border-olive-300 bg-white dark:border-olive-600 dark:bg-olive-950'
                                                        }`}
                                                    >
                                                        {active ? (
                                                            <Check
                                                                className="h-3.5 w-3.5"
                                                                strokeWidth={2.5}
                                                            />
                                                        ) : null}
                                                    </span>
                                                    {amenity.name}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="px-3.5 py-3 text-sm text-olive-600 dark:text-olive-400">
                                    No match in the library
                                    {query.trim() ? (
                                        <>
                                            {' '}
                                            — press{' '}
                                            <span className="font-semibold text-olive-800 dark:text-olive-200">
                                                Add
                                            </span>{' '}
                                            to create “{query.trim()}”.
                                        </>
                                    ) : null}
                                </p>
                            )}
                        </div>
                    ) : null}
                </div>
                <p className={help}>
                    Start typing to search saved amenities, or add your own.
                </p>
            </div>

            {selected.length ? (
                <div className="flex flex-wrap gap-2">
                    {selected.map((slug) => {
                        const meta =
                            amenities.find((a) => a.slug === slug) || {
                                name: slug,
                                slug,
                            };
                        return (
                            <button
                                key={slug}
                                type="button"
                                onClick={() => toggle(slug)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-olive-900 px-3 py-1.5 text-xs font-semibold text-white"
                            >
                                {meta.name}
                                <X className="h-3.5 w-3.5 opacity-80" />
                            </button>
                        );
                    })}
                </div>
            ) : null}

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>
    );
}
