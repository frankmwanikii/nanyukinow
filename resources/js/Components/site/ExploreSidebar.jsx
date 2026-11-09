import {
    ChevronDown,
    ChevronLeft,
    MapPin,
    RotateCcw,
    Search,
    Star,
} from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { CloseMark } from '@/Components/site/Mark';
import {
    PROPERTY_TYPES,
    resolveDirectoryCategories,
} from '@/data/categories';

const RATING_OPTIONS = [
    { value: 5, label: '5 stars', stars: 5 },
    { value: 4, label: '4+ stars', stars: 4 },
    { value: 3, label: '3+ stars', stars: 3 },
    { value: 2, label: '2+ stars', stars: 2 },
    { value: 1, label: '1+ stars', stars: 1 },
    { value: 0, label: 'Any rating', stars: 0 },
];

export default function ExploreSidebar({
    query,
    onQueryChange,
    location,
    onLocationChange,
    locations = [],
    categoryKey,
    onCategoryChange,
    subcategory,
    onSubcategoryChange,
    propertyType,
    onPropertyTypeChange,
    minRating,
    onMinRatingChange,
    openNow,
    onOpenNowChange,
    onSearch,
    onClear,
    className = '',
}) {
    const { directoryCategories: sharedCategories } = usePage().props;
    const categories = useMemo(
        () => resolveDirectoryCategories(sharedCategories),
        [sharedCategories],
    );
    const [tab, setTab] = useState(categoryKey ? 'categories' : 'filters');

    const activeCategory = useMemo(
        () => categories.find((c) => c.key === categoryKey) ?? null,
        [categories, categoryKey],
    );

    useEffect(() => {
        if (!categoryKey) return;
        setTab('categories');
    }, [categoryKey]);

    const selectCategory = (key) => {
        onCategoryChange(key);
        onSubcategoryChange(null);
        onPropertyTypeChange?.(null);
    };

    const clearCategory = () => {
        onCategoryChange(null);
        onSubcategoryChange(null);
        onPropertyTypeChange?.(null);
    };

    return (
        <aside
            className={`flex h-full flex-col border-r border-olive-200 bg-white ${className}`}
        >
            <div className="grid shrink-0 grid-cols-2">
                {['filters', 'categories'].map((key) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setTab(key)}
                        className={`py-3.5 text-sm font-semibold capitalize transition ${
                            tab === key
                                ? 'border-b-[3px] border-mustard text-olive-900'
                                : 'border-b-[3px] border-transparent text-olive-500 hover:text-olive-800'
                        }`}
                    >
                        {key}
                    </button>
                ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                {tab === 'filters' ? (
                    <div className="space-y-5">
                        <section>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-olive-500">
                                Working hours
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <ToggleChip
                                    active={!openNow}
                                    onClick={() => onOpenNowChange(false)}
                                >
                                    All
                                </ToggleChip>
                                <ToggleChip
                                    active={openNow}
                                    onClick={() => onOpenNowChange(true)}
                                >
                                    Open now
                                </ToggleChip>
                            </div>
                        </section>

                        <Field label="What are you looking for?">
                            <div className="relative">
                                <input
                                    type="search"
                                    value={query}
                                    onChange={(e) =>
                                        onQueryChange(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            onSearch?.();
                                        }
                                    }}
                                    placeholder="What are you looking for?"
                                    className={`w-full rounded-lg border-olive-200 bg-white py-2.5 text-sm text-earth-dusk placeholder:text-olive-400 focus:border-mustard focus:ring-mustard ${
                                        query ? 'pr-10' : ''
                                    }`}
                                />
                                {query ? (
                                    <button
                                        type="button"
                                        onClick={() => onQueryChange('')}
                                        aria-label="Clear search"
                                        className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-olive-600 transition hover:text-olive-900"
                                    >
                                        <CloseMark className="h-4 w-4" />
                                    </button>
                                ) : null}
                            </div>
                        </Field>

                        <section>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-olive-500">
                                Rating
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {RATING_OPTIONS.map((opt) => {
                                    const active = minRating === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() =>
                                                onMinRatingChange(opt.value)
                                            }
                                            className={`rounded-lg border px-2.5 py-2.5 text-left text-[13px] font-medium transition ${
                                                active
                                                    ? 'border-mustard bg-mustard/15 text-olive-900'
                                                    : 'border-olive-200 bg-white text-olive-700 hover:border-olive-300'
                                            }`}
                                        >
                                            {opt.stars > 0 ? (
                                                <span className="mb-1 flex gap-0.5">
                                                    {Array.from({
                                                        length: opt.stars,
                                                    }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className="h-3 w-3 fill-mustard text-mustard"
                                                        />
                                                    ))}
                                                </span>
                                            ) : null}
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <Field label="Category">
                            <div className="relative">
                                <select
                                    value={categoryKey || ''}
                                    onChange={(e) => {
                                        const value = e.target.value || null;
                                        onCategoryChange(value);
                                        onSubcategoryChange(null);
                                        onPropertyTypeChange?.(null);
                                    }}
                                    className="w-full appearance-none rounded-lg border-olive-200 bg-white py-2.5 pl-3 pr-9 text-sm text-earth-dusk focus:border-mustard focus:ring-mustard"
                                >
                                    <option value="">All categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.key} value={cat.key}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-400" />
                            </div>
                        </Field>

                        {activeCategory ? (
                            <Field label="Subcategory">
                                <div className="relative">
                                    <select
                                        value={subcategory || ''}
                                        onChange={(e) =>
                                            onSubcategoryChange(
                                                e.target.value || null,
                                            )
                                        }
                                        className="w-full appearance-none rounded-lg border-olive-200 bg-white py-2.5 pl-3 pr-9 text-sm text-earth-dusk focus:border-mustard focus:ring-mustard"
                                    >
                                        <option value="">
                                            All in {activeCategory.label}
                                        </option>
                                        {activeCategory.children.map(
                                            (child) => (
                                                <option
                                                    key={child}
                                                    value={child}
                                                >
                                                    {child}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-400" />
                                </div>
                            </Field>
                        ) : null}

                        {categoryKey === 'properties' ? (
                            <Field label="Property type">
                                <div className="relative">
                                    <select
                                        value={propertyType || ''}
                                        onChange={(e) =>
                                            onPropertyTypeChange?.(
                                                e.target.value || null,
                                            )
                                        }
                                        className="w-full appearance-none rounded-lg border-olive-200 bg-white py-2.5 pl-3 pr-9 text-sm text-earth-dusk focus:border-mustard focus:ring-mustard"
                                    >
                                        <option value="">All types</option>
                                        {PROPERTY_TYPES.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-400" />
                                </div>
                            </Field>
                        ) : null}

                        <Field label="Where to look?">
                            <div className="relative">
                                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-400" />
                                <select
                                    value={location || ''}
                                    onChange={(e) =>
                                        onLocationChange(
                                            e.target.value || null,
                                        )
                                    }
                                    className="w-full appearance-none rounded-lg border-olive-200 bg-white py-2.5 pl-9 pr-9 text-sm text-earth-dusk focus:border-mustard focus:ring-mustard"
                                >
                                    <option value="">All locations</option>
                                    {locations.map((area) => (
                                        <option key={area} value={area}>
                                            {area}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-400" />
                            </div>
                        </Field>

                        <button
                            type="button"
                            onClick={onSearch}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f5a3e] px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-olive-800"
                        >
                            <Search className="h-4 w-4" />
                            Search
                        </button>

                        <button
                            type="button"
                            onClick={onClear}
                            className="inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-olive-600 transition hover:text-mustard-deep"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset filters
                        </button>
                    </div>
                ) : activeCategory ? (
                    <div className="space-y-1">
                        <button
                            type="button"
                            onClick={clearCategory}
                            className="mb-2 inline-flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-left text-sm font-semibold text-olive-700 transition hover:bg-olive-50 hover:text-earth-dusk"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            All categories
                        </button>

                        <p className="mb-2 rounded-lg bg-[#4f5a3e] px-3 py-2.5 text-sm font-semibold text-white">
                            {activeCategory.label}
                        </p>

                        <ul className="space-y-0.5 border-l-2 border-mustard/60 pl-2">
                            {activeCategory.children.map((child) => {
                                const childActive = subcategory === child;
                                return (
                                    <li key={child}>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onSubcategoryChange(
                                                    childActive
                                                        ? null
                                                        : child,
                                                )
                                            }
                                            className={`w-full rounded-md px-2.5 py-2.5 text-left text-[13px] transition ${
                                                childActive
                                                    ? 'bg-mustard/25 font-semibold text-olive-950'
                                                    : 'font-medium text-earth-dusk hover:bg-olive-50'
                                            }`}
                                        >
                                            {child}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>

                        {categoryKey === 'properties' ? (
                            <div className="mt-5">
                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-olive-500">
                                    Property type
                                </p>
                                <ul className="space-y-0.5 border-l-2 border-olive-200 pl-2">
                                    {PROPERTY_TYPES.map((type) => {
                                        const typeActive = propertyType === type;
                                        return (
                                            <li key={type}>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onPropertyTypeChange?.(
                                                            typeActive
                                                                ? null
                                                                : type,
                                                        )
                                                    }
                                                    className={`w-full rounded-md px-2.5 py-2 text-left text-[13px] transition ${
                                                        typeActive
                                                            ? 'bg-mustard/25 font-semibold text-olive-950'
                                                            : 'font-medium text-earth-dusk hover:bg-olive-50'
                                                    }`}
                                                >
                                                    {type}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div className="space-y-1">
                        <button
                            type="button"
                            onClick={clearCategory}
                            className="w-full rounded-lg bg-[#4f5a3e] px-3 py-2.5 text-left text-sm font-semibold text-white"
                        >
                            All listings
                        </button>

                        {categories.map((cat) => (
                            <button
                                key={cat.key}
                                type="button"
                                onClick={() => selectCategory(cat.key)}
                                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-earth-dusk transition hover:bg-olive-50"
                            >
                                <span>{cat.label}</span>
                                <ChevronDown className="h-4 w-4 -rotate-90 text-olive-400" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}

function Field({ label, children }) {
    return (
        <label className="block space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-olive-500">
                {label}
            </span>
            {children}
        </label>
    );
}

function ToggleChip({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                active
                    ? 'border-mustard bg-mustard/15 text-olive-900'
                    : 'border-olive-200 bg-white text-olive-600 hover:border-olive-300'
            }`}
        >
            {children}
        </button>
    );
}
