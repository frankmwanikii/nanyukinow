import { field, help, label } from './fieldStyles';
import { Plus } from '@/Components/site/LucideCompat';
import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Single-select product category: pick from the DB library or type to add a new one.
 */
export default function ProductCategoryField({
    value = '',
    onChange,
    options = [],
    onCreated,
    id = 'product-category',
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(value || '');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);
    const wrapRef = useRef(null);
    const listId = `${id}-suggestions`;

    useEffect(() => {
        setQuery(value || '');
    }, [value]);

    useEffect(() => {
        const onPointerDown = (e) => {
            if (!wrapRef.current?.contains(e.target)) {
                setOpen(false);
                setQuery(value || '');
            }
        };
        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [value]);

    const library = useMemo(() => {
        const seen = new Set();
        const list = [];
        for (const item of options) {
            const name = String(item?.name || '').trim();
            if (!name) continue;
            const key = name.toLowerCase();
            if (seen.has(key)) continue;
            seen.add(key);
            list.push({
                id: item.id,
                name,
                slug: item.slug || key,
            });
        }
        return list.sort((a, b) => a.name.localeCompare(b.name));
    }, [options]);

    const matches = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return library.slice(0, 12);
        return library
            .filter((item) => item.name.toLowerCase().includes(q))
            .slice(0, 12);
    }, [library, query]);

    const exactMatch = library.some(
        (item) => item.name.toLowerCase() === query.trim().toLowerCase(),
    );

    const pick = (name) => {
        onChange(name);
        setQuery(name);
        setOpen(false);
        setError(null);
    };

    const createCustom = async () => {
        const name = query.trim();
        if (!name || creating) return;
        setCreating(true);
        setError(null);
        try {
            const res = await window.axios.post(
                route('account.product-categories.store'),
                { name },
            );
            const category = res.data?.category;
            if (category?.name) {
                onCreated?.(category);
                pick(category.name);
            }
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    'Could not save that category. Try again.',
            );
        } finally {
            setCreating(false);
        }
    };

    return (
        <div ref={wrapRef} className="relative min-w-0">
            <label className={label} htmlFor={id}>
                Category
            </label>
            <div className="relative">
                <input
                    id={id}
                    className={`${field} pr-10`}
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    value={query}
                    placeholder="Search or add a category…"
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                        setError(null);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setOpen(false);
                            setQuery(value || '');
                            return;
                        }
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (!query.trim()) return;
                            if (exactMatch) {
                                const hit = library.find(
                                    (item) =>
                                        item.name.toLowerCase() ===
                                        query.trim().toLowerCase(),
                                );
                                if (hit) pick(hit.name);
                            } else if (matches.length === 1) {
                                pick(matches[0].name);
                            } else {
                                createCustom();
                            }
                        }
                    }}
                    autoComplete="off"
                />
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-olive-500 transition hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-100"
                    aria-label={open ? 'Close categories' : 'Open categories'}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setOpen((prev) => !prev)}
                >
                    <svg
                        viewBox="0 0 24 24"
                        className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                    >
                        <path
                            d="M8 10l4 4 4-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            {open ? (
                <ul
                    id={listId}
                    role="listbox"
                    className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-56 overflow-auto border border-olive-900/20 bg-white py-1.5 dark:border-olive-700 dark:bg-olive-900"
                >
                    {matches.length ? (
                        matches.map((item) => (
                            <li key={item.id || item.slug} role="option">
                                <button
                                    type="button"
                                    className="w-full px-3.5 py-2.5 text-left text-sm font-medium text-olive-900 transition hover:bg-mustard/20 dark:text-olive-50 dark:hover:bg-mustard/15"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => pick(item.name)}
                                >
                                    {item.name}
                                </button>
                            </li>
                        ))
                    ) : (
                        <li className="px-3.5 py-2.5 text-sm text-olive-600 dark:text-olive-400">
                            No categories yet
                            {query.trim() ? '. Add one below.' : '.'}
                        </li>
                    )}
                    {query.trim() && !exactMatch ? (
                        <li role="option">
                            <button
                                type="button"
                                disabled={creating}
                                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-semibold text-olive-900 transition hover:bg-olive-50 disabled:opacity-50 dark:text-mustard dark:hover:bg-olive-800"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={createCustom}
                            >
                                <Plus className="h-4 w-4 shrink-0" />
                                {creating
                                    ? 'Saving…'
                                    : `Add “${query.trim()}”`}
                            </button>
                        </li>
                    ) : null}
                </ul>
            ) : null}

            {error ? (
                <p className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">
                    {error}
                </p>
            ) : (
                <p className={help}>
                    Pick an existing category or add a new one.
                </p>
            )}
        </div>
    );
}
