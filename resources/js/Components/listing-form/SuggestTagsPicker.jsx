import { field, help, label } from './fieldStyles';
import { Plus, Search, X } from '@/Components/site/LucideCompat';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

function asTagList(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => (typeof item === 'string' ? item.trim() : ''))
            .filter(Boolean);
    }
    if (typeof value === 'string' && value.trim()) {
        return value
            .split(/[,|]+/)
            .map((part) => part.trim())
            .filter(Boolean);
    }
    return [];
}

/**
 * Amenities-style multi-select: popular suggestions dropdown + type-to-add custom.
 */
export default function SuggestTagsPicker({
    value = [],
    onChange,
    options = [],
    labelText = 'Options',
    placeholder = 'Search or type your own…',
    suggestionsLabel = 'Popular options',
    maxTags = null,
    id: idProp = null,
    required = false,
    fieldHelp = null,
}) {
    const autoId = useId();
    const id = idProp || autoId;
    const listboxId = `${id}_suggestions`;
    const selected = asTagList(value);
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);
    const atLimit = maxTags != null && selected.length >= maxTags;

    const matches = useMemo(() => {
        const q = query.trim().toLowerCase();
        const pool = options.filter(
            (name) => !selected.some((s) => s.toLowerCase() === name.toLowerCase()),
        );
        if (!q) return pool.slice(0, 14);
        return pool
            .filter((name) => name.toLowerCase().includes(q))
            .slice(0, 12);
    }, [options, query, selected]);

    const exactMatch = [...options, ...selected].some(
        (name) => name.toLowerCase() === query.trim().toLowerCase(),
    );

    const showDropdown = open && !atLimit;

    useEffect(() => {
        const onPointerDown = (e) => {
            if (!wrapRef.current?.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, []);

    const pick = (name) => {
        if (atLimit) return;
        if (selected.some((s) => s.toLowerCase() === name.toLowerCase())) {
            setQuery('');
            setOpen(false);
            return;
        }
        onChange([...selected, name]);
        setQuery('');
        setOpen(false);
    };

    const addCustom = () => {
        const name = query.trim();
        if (!name || atLimit) return;
        if (selected.some((s) => s.toLowerCase() === name.toLowerCase())) {
            setQuery('');
            setOpen(false);
            return;
        }
        const popularHit = options.find(
            (item) => item.toLowerCase() === name.toLowerCase(),
        );
        onChange([...selected, popularHit || name]);
        setQuery('');
        setOpen(false);
    };

    const remove = (name) => {
        onChange(selected.filter((item) => item !== name));
    };

    return (
        <div className="space-y-3" ref={wrapRef}>
            <label className={label} htmlFor={id}>
                {labelText}
                {required ? <span className="text-rose-500"> *</span> : null}
            </label>
            <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-olive-500" />
                <input
                    id={id}
                    className={`${field} pl-10 ${query.trim() && !exactMatch && !atLimit ? 'pr-24' : 'pr-3'}`}
                    value={query}
                    disabled={atLimit}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder={
                        atLimit
                            ? `Limit of ${maxTags} reached`
                            : placeholder
                    }
                    autoComplete="off"
                    aria-expanded={showDropdown}
                    aria-controls={listboxId}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setOpen(false);
                            return;
                        }
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (!query.trim() || atLimit) return;
                            if (matches.length === 1) {
                                pick(matches[0]);
                            } else if (exactMatch) {
                                const hit =
                                    matches.find(
                                        (item) =>
                                            item.toLowerCase() ===
                                            query.trim().toLowerCase(),
                                    ) ||
                                    options.find(
                                        (item) =>
                                            item.toLowerCase() ===
                                            query.trim().toLowerCase(),
                                    );
                                if (hit) pick(hit);
                            } else {
                                addCustom();
                            }
                        }
                    }}
                />
                {query.trim() && !exactMatch && !atLimit ? (
                    <button
                        type="button"
                        onClick={addCustom}
                        className="absolute right-2 top-1/2 z-10 inline-flex -translate-y-1/2 items-center gap-1 rounded-sm bg-mustard px-2.5 py-1.5 text-xs font-bold text-earth-dusk"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                    </button>
                ) : null}

                {showDropdown ? (
                    <div
                        id={listboxId}
                        role="listbox"
                        className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-30 max-h-64 overflow-y-auto rounded-2xl border border-olive-200/90 bg-white py-1.5 shadow-lift dark:border-olive-700 dark:bg-olive-900"
                    >
                        {matches.length ? (
                            <ul>
                                {!query.trim() ? (
                                    <li className="px-3.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-olive-400">
                                        {suggestionsLabel}
                                    </li>
                                ) : null}
                                {matches.map((name) => (
                                    <li key={name}>
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={false}
                                            onClick={() => pick(name)}
                                            className="w-full px-3.5 py-2.5 text-left text-sm text-olive-800 transition hover:bg-olive-50 dark:text-olive-100 dark:hover:bg-olive-800"
                                        >
                                            {name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="px-3.5 py-3 text-sm text-olive-600 dark:text-olive-400">
                                No popular match
                                {query.trim() ? (
                                    <>
                                        {' '}
                                        — press{' '}
                                        <span className="font-semibold text-olive-800 dark:text-olive-200">
                                            Add
                                        </span>{' '}
                                        to use “{query.trim()}”.
                                    </>
                                ) : null}
                            </p>
                        )}
                    </div>
                ) : null}
            </div>
            {fieldHelp ? <p className={help}>{fieldHelp}</p> : null}

            {selected.length ? (
                <div className="flex flex-wrap gap-2">
                    {selected.map((name) => (
                        <button
                            key={name}
                            type="button"
                            onClick={() => remove(name)}
                            className="inline-flex items-center gap-1.5 rounded-sm bg-olive-900 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                            {name}
                            <X className="h-3.5 w-3.5 opacity-80" />
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
