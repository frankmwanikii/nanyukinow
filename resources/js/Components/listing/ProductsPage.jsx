import { ChevronLeft, ChevronRight, Package, Tag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const PAGE_SIZE = 12;

function formatPrice(price) {
    if (price == null || price === '') return null;
    if (typeof price === 'number') {
        return `KES ${price.toLocaleString('en-KE')}`;
    }
    const raw = String(price).trim();
    if (!raw) return null;
    if (/^(kes|ksh|\$|€|£)/i.test(raw)) return raw;
    if (/^\d/.test(raw)) return `KES ${raw}`;
    return raw;
}

function normalizeProducts(products = []) {
    if (!Array.isArray(products)) return [];
    return products
        .map((item, index) => {
            if (!item) return null;
            if (typeof item === 'string') {
                return {
                    id: `product-${index}`,
                    name: item,
                    price: null,
                    image: null,
                    description: null,
                    category: null,
                };
            }
            const name = item.name || item.title || item.label;
            if (!name) return null;
            return {
                id: item.id || `product-${index}`,
                name,
                price: item.price ?? item.amount ?? null,
                image: item.image || item.src || item.photo || null,
                description: item.description || item.note || null,
                category: item.category || item.tag || null,
            };
        })
        .filter(Boolean);
}

export default function ProductsPage({ listing }) {
    const products = useMemo(
        () => normalizeProducts(listing?.products),
        [listing?.products],
    );
    const categories = useMemo(() => {
        const set = new Set(
            products.map((p) => p.category).filter(Boolean),
        );
        return ['All', ...Array.from(set)];
    }, [products]);
    const [filter, setFilter] = useState('All');
    const [page, setPage] = useState(1);

    const visible = useMemo(
        () =>
            filter === 'All'
                ? products
                : products.filter((p) => p.category === filter),
        [products, filter],
    );

    const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageItems = visible.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE,
    );

    useEffect(() => {
        setPage(1);
    }, [filter, listing?.id]);

    const goTo = (next) => {
        const clamped = Math.min(totalPages, Math.max(1, next));
        setPage(clamped);
        document
            .getElementById('products-list')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
            <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="font-display text-2xl font-semibold text-earth-dusk sm:text-3xl">
                        Products
                    </h2>
                    <p className="mt-1 text-sm text-olive-600">
                        {products.length
                            ? `What ${listing?.title || 'this store'} offers — with prices.`
                            : `Products from ${listing?.title || 'this store'} will appear here.`}
                    </p>
                </div>
                {products.length ? (
                    <p className="text-sm font-semibold text-olive-700">
                        {visible.length} item{visible.length === 1 ? '' : 's'}
                    </p>
                ) : null}
            </div>

            {!products.length ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-olive-300 bg-white px-6 py-16 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-olive-50 text-olive-700">
                        <Package className="h-7 w-7" strokeWidth={1.75} />
                    </span>
                    <p className="mt-4 font-display text-lg font-semibold text-earth-dusk">
                        No products listed yet
                    </p>
                    <p className="mt-1 max-w-sm text-sm text-olive-600">
                        This shop hasn’t published a product list. Check back
                        soon or reach out via Contact info.
                    </p>
                </div>
            ) : (
                <>
                    {categories.length > 2 ? (
                        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                            {categories.map((cat) => {
                                const active = filter === cat;
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setFilter(cat)}
                                        className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                                            active
                                                ? 'bg-olive-700 text-white'
                                                : 'bg-white text-olive-800 ring-1 ring-olive-200 hover:bg-olive-50'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    ) : null}

                    <ul
                        id="products-list"
                        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    >
                        {pageItems.map((product) => {
                            const priceLabel = formatPrice(product.price);
                            return (
                                <li
                                    key={product.id}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-olive-200/70 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden bg-olive-50">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt=""
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-olive-400">
                                                <Package
                                                    className="h-10 w-10"
                                                    strokeWidth={1.5}
                                                />
                                            </div>
                                        )}
                                        {product.category ? (
                                            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-olive-800 shadow-soft">
                                                <Tag className="h-3 w-3 text-mustard" />
                                                {product.category}
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="flex flex-1 flex-col gap-2 p-4">
                                        <h3 className="font-display text-base font-semibold text-earth-dusk">
                                            {product.name}
                                        </h3>
                                        {product.description ? (
                                            <p className="line-clamp-2 text-sm leading-relaxed text-olive-600">
                                                {product.description}
                                            </p>
                                        ) : null}
                                        <div className="mt-auto border-t border-olive-100 pt-3">
                                            {priceLabel ? (
                                                <p className="font-display text-lg font-semibold text-olive-800">
                                                    {priceLabel}
                                                </p>
                                            ) : (
                                                <p className="text-sm font-semibold text-olive-500">
                                                    Price on request
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    {totalPages > 1 ? (
                        <div className="mt-8 flex flex-col items-center gap-3">
                            <nav
                                className="inline-flex items-center gap-1 rounded-xl border border-olive-200/80 bg-white p-1.5"
                                aria-label="Products pagination"
                            >
                                <button
                                    type="button"
                                    disabled={safePage <= 1}
                                    onClick={() => goTo(safePage - 1)}
                                    className="inline-flex h-9 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-olive-700 transition hover:bg-olive-50 disabled:cursor-not-allowed disabled:opacity-35"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Prev
                                    </span>
                                </button>

                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1,
                                ).map((n) => {
                                    const active = n === safePage;
                                    return (
                                        <button
                                            key={n}
                                            type="button"
                                            onClick={() => goTo(n)}
                                            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 text-sm font-semibold transition ${
                                                active
                                                    ? 'bg-olive-700 text-white'
                                                    : 'text-olive-700 hover:bg-olive-50'
                                            }`}
                                            aria-current={
                                                active ? 'page' : undefined
                                            }
                                        >
                                            {n}
                                        </button>
                                    );
                                })}

                                <button
                                    type="button"
                                    disabled={safePage >= totalPages}
                                    onClick={() => goTo(safePage + 1)}
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
                                Page {safePage} of {totalPages} · showing{' '}
                                {pageItems.length} of {visible.length}
                            </p>
                        </div>
                    ) : null}
                </>
            )}
        </div>
    );
}
