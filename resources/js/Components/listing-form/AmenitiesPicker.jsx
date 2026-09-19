import { field, help, label } from './fieldStyles';
import { Check, Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

/**
 * Multi-select amenities with search + create-custom (persisted via API).
 */
export default function AmenitiesPicker({
    amenities = [],
    selected = [],
    categoryKey,
    onChange,
    onCreated,
}) {
    const [query, setQuery] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return amenities
            .filter((a) => {
                const catOk =
                    !a.category_key ||
                    !categoryKey ||
                    a.category_key === categoryKey;
                if (!catOk) return false;
                if (!q) return true;
                return (
                    a.name.toLowerCase().includes(q) ||
                    a.slug.toLowerCase().includes(q)
                );
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [amenities, categoryKey, query]);

    const toggle = (slug) => {
        if (selected.includes(slug)) {
            onChange(selected.filter((s) => s !== slug));
        } else {
            onChange([...selected, slug]);
        }
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

    const exactMatch = visible.some(
        (a) => a.name.toLowerCase() === query.trim().toLowerCase(),
    );

    return (
        <div className="space-y-4">
            <div>
                <label className={label} htmlFor="amenity_search">
                    Amenities & features
                </label>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-500" />
                    <input
                        id="amenity_search"
                        className={`${field} pl-10 pr-24`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search or type a new amenity…"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                if (query.trim() && !exactMatch) createCustom();
                            }
                        }}
                    />
                    {query.trim() && !exactMatch ? (
                        <button
                            type="button"
                            onClick={createCustom}
                            disabled={creating}
                            className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-lg bg-mustard px-2.5 py-1.5 text-xs font-bold text-earth-dusk disabled:opacity-50"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            {creating ? 'Saving…' : 'Add'}
                        </button>
                    ) : null}
                </div>
                <p className={help}>
                    Select from the list, or type your own — it will be saved for next time.
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

            <div className="max-h-64 overflow-y-auto rounded-2xl border border-olive-100 bg-olive-50/40 p-2">
                {visible.length ? (
                    <ul className="grid gap-1 sm:grid-cols-2">
                        {visible.map((amenity) => {
                            const active = selected.includes(amenity.slug);
                            return (
                                <li key={amenity.id || amenity.slug}>
                                    <button
                                        type="button"
                                        onClick={() => toggle(amenity.slug)}
                                        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                                            active
                                                ? 'bg-mustard/30 font-semibold text-olive-950'
                                                : 'text-olive-800 hover:bg-white'
                                        }`}
                                    >
                                        <span
                                            className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                                                active
                                                    ? 'border-mustard bg-mustard text-earth-dusk'
                                                    : 'border-olive-300 bg-white'
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
                    <p className="px-3 py-6 text-center text-sm text-olive-600">
                        No matches — press Add to create “{query.trim()}”.
                    </p>
                )}
            </div>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>
    );
}
