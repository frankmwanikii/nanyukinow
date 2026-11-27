import { router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Filter,
    Search,
} from '@/Components/site/LucideCompat';
import { useEffect, useMemo, useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';
import StoryCard from '@/Components/site/StoryCard';
import { filterArticles } from '@/utils/filterArticles';

const PAGE_SIZE = 10;

const SORTS = [
    { key: 'latest', label: 'Latest' },
    { key: 'most-viewed', label: 'Most viewed' },
    { key: 'trending', label: 'Trending' },
    { key: 'oldest', label: 'Oldest' },
    { key: 'a-z', label: 'A to Z' },
];

const panelClass =
    'rounded-xl border border-olive-200/90 bg-white p-5 sm:p-6';

export default function StoriesIndex({
    articles = [],
    categories = [],
    category: initialCategory = null,
    q: initialQ = '',
    page = null,
}) {
    const [category, setCategory] = useState(initialCategory || 'all');
    const [q, setQ] = useState(initialQ || '');
    const [sort, setSort] = useState('latest');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [pageNum, setPage] = useState(1);
    const content = page?.content || {};

    const filtered = useMemo(
        () =>
            filterArticles(articles, {
                category: category === 'all' ? null : category,
                q,
                sort,
            }),
        [articles, category, q, sort],
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(pageNum, totalPages);

    const pageItems = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, safePage]);

    useEffect(() => {
        setPage(1);
    }, [category, q, sort]);

    useEffect(() => {
        setCategory(initialCategory || 'all');
    }, [initialCategory]);

    const sync = (nextCategory, nextQ) => {
        const params = {};
        if (nextCategory && nextCategory !== 'all') {
            params.category = nextCategory;
        }
        if (nextQ?.trim()) params.q = nextQ.trim();
        router.get(route('stories.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSort('latest');
        setQ('');
        setCategory('all');
        sync('all', '');
    };

    const activeLabel =
        category === 'all'
            ? 'All stories'
            : categories.find((c) => c.slug === category || c.name === category)
                  ?.name || category;

    const heroImage =
        content.hero_image || '/images/stories/shopping-hero.webp';
    const from = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
    const to = Math.min(filtered.length, safePage * PAGE_SIZE);

    return (
        <SiteLayout
            title={page?.meta_title || 'Stories'}
            description={page?.meta_description || undefined}
        >
            <header
                className="relative flex min-h-[42svh] items-end overflow-hidden bg-olive-900 pt-28 sm:min-h-[48svh] sm:pt-32"
                style={{
                    backgroundImage: `url('${heroImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-earth-dusk via-earth-dusk/55 to-earth-dusk/25" />
                <div className="relative mx-auto w-full max-w-site px-4 pb-10 sm:px-6 sm:pb-12">
                    <h1 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-tight">
                        {content.headline || 'Nanyuki Stories'}
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                        {content.subtext ||
                            'Guides, weather wisdom, and local tips from around Nanyuki.'}
                    </p>
                </div>
            </header>

            <section className="bg-[#f3f5f7] py-10 sm:py-14">
                <div className="mx-auto grid max-w-site gap-8 px-4 sm:px-6 lg:grid-cols-[15.5rem_minmax(0,1fr)] xl:grid-cols-[16.5rem_minmax(0,1fr)] xl:gap-10">
                    <aside
                        className="min-w-0 lg:sticky lg:top-28 lg:self-start"
                        aria-label="Story categories"
                    >
                        <div className={panelClass}>
                            <h2 className="font-display text-lg font-semibold text-earth-dusk">
                                Categories
                            </h2>
                            <nav
                                className="mt-3 -mx-1 flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                aria-label="Filter by category"
                            >
                                <CategoryLink
                                    label="All stories"
                                    active={category === 'all'}
                                    onClick={() => {
                                        setCategory('all');
                                        sync('all', q);
                                    }}
                                />
                                {categories.map((cat) => (
                                    <CategoryLink
                                        key={cat.slug || cat.id}
                                        label={cat.name}
                                        active={
                                            category === cat.slug ||
                                            category === cat.name
                                        }
                                        onClick={() => {
                                            setCategory(cat.slug);
                                            sync(cat.slug, q);
                                        }}
                                    />
                                ))}
                            </nav>
                        </div>
                    </aside>

                    <div className="min-w-0">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <label className="relative block min-w-0 flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-400" />
                                <input
                                    value={q}
                                    onChange={(e) => {
                                        setQ(e.target.value);
                                        sync(category, e.target.value);
                                    }}
                                    placeholder="Search stories…"
                                    aria-label="Search stories"
                                    className="w-full rounded-md border border-olive-200 bg-white py-2.5 pl-10 pr-3 text-sm text-earth-dusk placeholder:text-olive-400 focus:border-olive-400 focus:outline-none focus:ring-1 focus:ring-olive-400"
                                />
                            </label>
                            <button
                                type="button"
                                onClick={() => setFiltersOpen((o) => !o)}
                                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-olive-200 bg-white px-3.5 text-sm font-medium text-olive-800 transition hover:border-olive-300 hover:bg-[#f7f6f2]"
                                aria-expanded={filtersOpen}
                            >
                                <Filter className="h-4 w-4" />
                                {filtersOpen ? 'Hide filters' : 'Sort'}
                            </button>
                        </div>

                        {filtersOpen ? (
                            <div className={`mt-3 ${panelClass}`}>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="font-display text-base font-semibold text-earth-dusk">
                                        Sort by
                                    </p>
                                    <button
                                        type="button"
                                        className="text-sm font-medium text-olive-600 underline-offset-2 hover:underline"
                                        onClick={clearFilters}
                                    >
                                        Reset
                                    </button>
                                </div>
                                <div
                                    className="mt-3 flex flex-wrap gap-2"
                                    role="group"
                                    aria-label="Sort stories"
                                >
                                    {SORTS.map((item) => {
                                        const active = sort === item.key;
                                        return (
                                            <button
                                                key={item.key}
                                                type="button"
                                                onClick={() =>
                                                    setSort(item.key)
                                                }
                                                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                                                    active
                                                        ? 'bg-olive-800 text-white'
                                                        : 'border border-olive-200 bg-[#f7f6f2] text-olive-800 hover:border-olive-300 hover:bg-white'
                                                }`}
                                            >
                                                {item.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : null}

                        <div className="mt-8 flex flex-wrap items-end justify-between gap-3 border-b border-[#d8dde3] pb-4">
                            <h2 className="font-display text-2xl font-semibold text-earth-dusk">
                                {activeLabel}
                            </h2>
                            <p className="text-sm text-olive-600">
                                {filtered.length === 0
                                    ? '0 stories'
                                    : `${from}–${to} of ${filtered.length} ${
                                          filtered.length === 1
                                              ? 'story'
                                              : 'stories'
                                      }`}
                            </p>
                        </div>

                        {pageItems.length === 0 ? (
                            <div
                                className={`mt-6 ${panelClass} py-14 text-center`}
                            >
                                <p className="font-display text-lg text-earth-dusk">
                                    No stories match that filter.
                                </p>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-3 text-sm font-medium text-olive-700 underline-offset-2 hover:underline"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {pageItems.map((article) => (
                                    <StoryCard
                                        key={article.id}
                                        article={article}
                                    />
                                ))}
                            </div>
                        )}

                        {totalPages > 1 ? (
                            <nav
                                className="mt-10 flex flex-wrap items-center justify-center gap-2"
                                aria-label="Stories pagination"
                            >
                                <button
                                    type="button"
                                    disabled={safePage <= 1}
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                    className="inline-flex h-10 items-center gap-1 rounded-md border border-olive-200 bg-white px-3 text-sm font-medium text-olive-800 transition hover:bg-[#f7f6f2] disabled:opacity-40"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Prev
                                </button>
                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1,
                                ).map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setPage(n)}
                                        className={`flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-sm font-medium ${
                                            n === safePage
                                                ? 'bg-olive-800 text-white'
                                                : 'border border-olive-200 bg-white text-olive-800 hover:bg-[#f7f6f2]'
                                        }`}
                                        aria-current={
                                            n === safePage ? 'page' : undefined
                                        }
                                    >
                                        {n}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    disabled={safePage >= totalPages}
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(totalPages, p + 1),
                                        )
                                    }
                                    className="inline-flex h-10 items-center gap-1 rounded-md border border-olive-200 bg-white px-3 text-sm font-medium text-olive-800 transition hover:bg-[#f7f6f2] disabled:opacity-40"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </nav>
                        ) : null}
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}

function CategoryLink({ label, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`shrink-0 rounded-md px-2.5 py-2 text-left text-sm transition lg:w-full ${
                active
                    ? 'bg-olive-800 font-semibold text-white'
                    : 'font-medium text-olive-700 hover:bg-[#f7f6f2] hover:text-earth-dusk'
            }`}
        >
            {label}
        </button>
    );
}
