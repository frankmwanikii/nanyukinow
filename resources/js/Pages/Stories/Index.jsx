import { Link } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Filter,
    Search,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';
import StoryCard from '@/Components/site/StoryCard';
import {
    ARTICLE_CATEGORIES,
    articles,
    filterArticles,
    formatArticleDate,
} from '@/data/articles';

const PAGE_SIZE = 12;

export default function StoriesIndex({
    category: initialCategory = null,
    q: initialQ = '',
}) {
    const [category, setCategory] = useState(initialCategory || null);
    const [q, setQ] = useState(initialQ || '');
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [page, setPage] = useState(1);

    const filtered = useMemo(
        () => filterArticles({ category, q }),
        [category, q],
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);

    const pageItems = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, safePage]);

    const recent = useMemo(
        () =>
            [...articles]
                .sort(
                    (a, b) =>
                        new Date(b.publishedAt) - new Date(a.publishedAt),
                )
                .slice(0, 4),
        [],
    );

    useEffect(() => {
        setPage(1);
    }, [category, q]);

    const sync = (nextCategory, nextQ) => {
        const params = new URLSearchParams();
        if (nextCategory) params.set('category', nextCategory);
        if (nextQ?.trim()) params.set('q', nextQ.trim());
        const search = params.toString();
        window.history.replaceState(
            {},
            '',
            search ? `/stories?${search}` : '/stories',
        );
    };

    const selectCategory = (next) => {
        const value = category === next ? null : next;
        setCategory(value);
        sync(value, q);
    };

    const clearFilters = () => {
        setCategory(null);
        setQ('');
        sync(null, '');
    };

    const onSearch = (e) => {
        e.preventDefault();
        sync(category, q);
    };

    const sidebar = (
        <aside className="space-y-6 lg:sticky lg:top-28">
            <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-olive-100 sm:p-6">
                <h2 className="font-display text-base font-semibold text-earth-dusk">
                    Search
                </h2>
                <form onSubmit={onSearch} className="mt-4">
                    <label className="relative block">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-400" />
                        <input
                            value={q}
                            onChange={(e) => {
                                setQ(e.target.value);
                                sync(category, e.target.value);
                            }}
                            placeholder="Search stories…"
                            className="w-full rounded-xl border-olive-200 bg-earth-sand/50 py-2.5 pl-10 pr-3 text-sm text-earth-dusk placeholder:text-olive-400 focus:border-olive-500 focus:ring-olive-500"
                        />
                    </label>
                </form>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-olive-100 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-base font-semibold text-earth-dusk">
                        Topics
                    </h2>
                    {(category || q.trim()) && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-xs font-semibold text-olive-600 underline-offset-2 hover:underline"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <ul className="mt-4 space-y-1">
                    <li>
                        <button
                            type="button"
                            onClick={() => selectCategory(null)}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                                !category
                                    ? 'bg-olive-600 text-white'
                                    : 'text-olive-800 hover:bg-olive-50'
                            }`}
                        >
                            <span>All stories</span>
                            <span
                                className={`text-xs font-medium ${
                                    !category
                                        ? 'text-white/70'
                                        : 'text-olive-400'
                                }`}
                            >
                                {articles.length}
                            </span>
                        </button>
                    </li>
                    {ARTICLE_CATEGORIES.map((cat) => {
                        const count = articles.filter(
                            (a) => a.category === cat,
                        ).length;
                        const active = category === cat;
                        return (
                            <li key={cat}>
                                <button
                                    type="button"
                                    onClick={() => selectCategory(cat)}
                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                                        active
                                            ? 'bg-olive-600 text-white'
                                            : 'text-olive-800 hover:bg-olive-50'
                                    }`}
                                >
                                    <span>{cat}</span>
                                    <span
                                        className={`text-xs font-medium ${
                                            active
                                                ? 'text-white/70'
                                                : 'text-olive-400'
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-olive-100 sm:p-6">
                <h2 className="font-display text-base font-semibold text-earth-dusk">
                    Latest
                </h2>
                <ul className="mt-4 divide-y divide-olive-100">
                    {recent.map((item) => (
                        <li key={item.id} className="py-3 first:pt-0 last:pb-0">
                            <Link
                                href={`/stories/${item.slug}`}
                                className="group block"
                            >
                                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-olive-500">
                                    {item.category}
                                </p>
                                <p className="mt-1 font-display text-sm font-semibold leading-snug text-earth-dusk transition group-hover:text-olive-700">
                                    {item.title}
                                </p>
                                <p className="mt-1 text-xs text-olive-500">
                                    {formatArticleDate(item.publishedAt)}
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );

    const [featured, ...rest] =
        safePage === 1 ? pageItems : [null, ...pageItems];

    return (
        <SiteLayout title="Stories & travel tips">
            <section className="border-b border-olive-200/70 bg-olive-800 pb-10 pt-28 sm:pb-12 sm:pt-32">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mint sm:text-sm">
                        Stories
                    </p>
                    <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
                        Make the most of your visit
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                        Guides, weather wisdom, and local tips for Nanyuki and
                        the towns around it.
                    </p>
                </div>
            </section>

            <section className="py-8 sm:py-12 lg:py-14">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h2 className="font-display text-2xl font-semibold text-earth-dusk">
                                {category || 'All stories'}
                            </h2>
                            <p className="mt-1 text-sm text-olive-600">
                                {filtered.length}{' '}
                                {filtered.length === 1 ? 'story' : 'stories'}
                                {q.trim() ? ` matching “${q.trim()}”` : ''}
                                {` · Page ${safePage} of ${totalPages}`}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFiltersOpen((open) => !open)}
                            className="inline-flex items-center gap-2.5 text-sm font-bold text-earth-dusk transition hover:text-olive-700"
                            aria-expanded={filtersOpen}
                        >
                            {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                            <Filter className="h-4 w-4 fill-current" />
                        </button>
                    </div>

                    <div
                        className={`grid gap-8 xl:gap-10 ${
                            filtersOpen
                                ? 'lg:grid-cols-[17.5rem_minmax(0,1fr)] xl:grid-cols-[19rem_minmax(0,1fr)]'
                                : ''
                        }`}
                    >
                        {filtersOpen ? (
                            <div className="min-w-0">{sidebar}</div>
                        ) : null}

                        <div className="min-w-0">
                            {filtered.length === 0 ? (
                                <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-soft">
                                    <p className="font-display text-lg text-olive-800">
                                        No stories match that filter.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="mt-4 text-sm font-semibold text-olive-700 underline-offset-2 hover:underline"
                                    >
                                        Clear filters
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {featured ? (
                                        <StoryCard
                                            article={featured}
                                            featured
                                        />
                                    ) : null}
                                    {(safePage === 1 ? rest : pageItems)
                                        .length > 0 ? (
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            {(safePage === 1
                                                ? rest
                                                : pageItems
                                            ).map((article) => (
                                                <StoryCard
                                                    key={article.id}
                                                    article={article}
                                                />
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            <div className="mt-10 flex flex-col items-center gap-3">
                                <nav
                                    className="inline-flex items-center gap-1 rounded-2xl border border-olive-200/80 bg-white p-1.5 shadow-soft"
                                    aria-label="Stories pagination"
                                >
                                    <button
                                        type="button"
                                        disabled={safePage <= 1}
                                        onClick={() =>
                                            setPage((p) => Math.max(1, p - 1))
                                        }
                                        className="inline-flex h-9 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-olive-700 transition hover:bg-olive-50 disabled:cursor-not-allowed disabled:opacity-35"
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        <span className="hidden sm:inline">
                                            Prev
                                        </span>
                                    </button>
                                    <div className="mx-0.5 h-5 w-px bg-olive-200" />
                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1,
                                    ).map((n) => {
                                        const active = n === safePage;
                                        return (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setPage(n)}
                                                className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                                                    active
                                                        ? 'bg-[#4f5a3e] text-white shadow-sm'
                                                        : 'text-earth-dusk hover:bg-olive-50'
                                                }`}
                                                aria-current={
                                                    active ? 'page' : undefined
                                                }
                                            >
                                                {n}
                                            </button>
                                        );
                                    })}
                                    <div className="mx-0.5 h-5 w-px bg-olive-200" />
                                    <button
                                        type="button"
                                        disabled={safePage >= totalPages}
                                        onClick={() =>
                                            setPage((p) =>
                                                Math.min(totalPages, p + 1),
                                            )
                                        }
                                        className="inline-flex h-9 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-olive-700 transition hover:bg-olive-50 disabled:cursor-not-allowed disabled:opacity-35"
                                        aria-label="Next page"
                                    >
                                        <span className="hidden sm:inline">
                                            Next
                                        </span>
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </nav>
                                <p className="text-xs font-medium text-olive-500">
                                    Page {safePage} of {totalPages}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
