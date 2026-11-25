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
        <SiteLayout title={page?.meta_title || 'Stories'}>
            <header
                className="relative flex min-h-[48svh] items-center justify-center overflow-hidden bg-olive-900 pt-24 text-center sm:min-h-[55svh] sm:pt-28"
                style={{
                    backgroundImage: `url('${heroImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-earth-dusk/55 via-earth-dusk/50 to-earth-dusk/75" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(242,184,46,0.18),_transparent_55%)]" />
                <div className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mustard sm:text-sm">
                        {content.hero_tag || 'Local Updates'}
                    </p>
                    <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-tight">
                        {content.headline || 'Nanyuki Stories Hub'}
                    </h1>
                    <div
                        className="mx-auto mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-mustard to-mustard/40"
                        aria-hidden
                    />
                    <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
                        {content.subtext ||
                            'Guides, weather wisdom, and local tips from around Nanyuki.'}
                    </p>
                </div>
            </header>

            <section className="bg-[#f3f5f7] py-10 sm:py-14">
                <div className="mx-auto grid max-w-site gap-8 px-4 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[17.5rem_minmax(0,1fr)] xl:gap-10">
                    <aside
                        className="min-w-0 lg:sticky lg:top-28 lg:self-start"
                        aria-label="Story categories"
                    >
                        <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-olive-100/80 sm:p-6">
                            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-olive-500">
                                Browse
                            </p>
                            <h2 className="mt-1 font-display text-lg font-semibold text-earth-dusk">
                                Contents
                            </h2>
                            <nav
                                className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                aria-label="Filter by category"
                            >
                                <CategoryLink
                                    index="01"
                                    label="All stories"
                                    active={category === 'all'}
                                    onClick={() => {
                                        setCategory('all');
                                        sync('all', q);
                                    }}
                                />
                                {categories.map((cat, i) => (
                                    <CategoryLink
                                        key={cat.slug || cat.id}
                                        index={String(i + 2).padStart(2, '0')}
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
                                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-400" />
                                <input
                                    value={q}
                                    onChange={(e) => {
                                        setQ(e.target.value);
                                        sync(category, e.target.value);
                                    }}
                                    placeholder="Search stories…"
                                    aria-label="Search stories"
                                    className="w-full rounded-full border-0 bg-white py-3 pl-11 pr-4 text-sm text-earth-dusk shadow-soft ring-1 ring-olive-100 placeholder:text-olive-400 focus:ring-2 focus:ring-mustard/60"
                                />
                            </label>
                            <button
                                type="button"
                                onClick={() => setFiltersOpen((o) => !o)}
                                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-olive-800 shadow-soft ring-1 ring-olive-100 transition hover:bg-olive-50"
                                aria-expanded={filtersOpen}
                            >
                                {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                                <Filter className="h-4 w-4" />
                            </button>
                        </div>

                        {filtersOpen ? (
                            <div className="mt-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-olive-100 sm:p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-olive-500">
                                            Sort and rank
                                        </p>
                                        <h3 className="mt-1 font-display text-base font-semibold text-earth-dusk">
                                            Story filters
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        className="text-sm font-semibold text-olive-600 underline-offset-2 hover:underline"
                                        onClick={() => {
                                            setSort('latest');
                                            setQ('');
                                            setCategory('all');
                                            sync('all', '');
                                        }}
                                    >
                                        Reset
                                    </button>
                                </div>
                                <div
                                    className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                    role="group"
                                    aria-label="Sort stories"
                                >
                                    {SORTS.map((item) => (
                                        <button
                                            key={item.key}
                                            type="button"
                                            onClick={() => setSort(item.key)}
                                            className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                                                sort === item.key
                                                    ? 'bg-olive-800 text-mustard'
                                                    : 'bg-olive-50 text-olive-800 hover:bg-olive-100'
                                            }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
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
                            <div className="mt-6 rounded-2xl bg-white px-6 py-16 text-center shadow-soft">
                                <p className="font-display text-lg text-olive-800">
                                    No stories match that filter.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSort('latest');
                                        setQ('');
                                        setCategory('all');
                                        sync('all', '');
                                    }}
                                    className="mt-4 text-sm font-semibold text-olive-700 underline-offset-2 hover:underline"
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
                                    className="inline-flex h-10 items-center gap-1 rounded-full bg-white px-3 text-sm font-semibold text-olive-800 shadow-soft ring-1 ring-olive-100 disabled:opacity-40"
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
                                        className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold ${
                                            n === safePage
                                                ? 'bg-olive-800 text-mustard'
                                                : 'bg-white text-olive-800 shadow-soft ring-1 ring-olive-100'
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
                                    className="inline-flex h-10 items-center gap-1 rounded-full bg-white px-3 text-sm font-semibold text-olive-800 shadow-soft ring-1 ring-olive-100 disabled:opacity-40"
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

function CategoryLink({ index, label, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex shrink-0 items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-sm font-semibold transition lg:w-full lg:rounded-xl ${
                active
                    ? 'bg-olive-800 text-mustard'
                    : 'bg-olive-50 text-olive-800 hover:bg-olive-100 lg:bg-transparent lg:hover:bg-olive-50'
            }`}
        >
            <span
                className={`hidden text-[0.7rem] tabular-nums lg:inline ${
                    active ? 'text-mustard/70' : 'text-olive-400'
                }`}
            >
                {index}
            </span>
            <span>{label}</span>
        </button>
    );
}
