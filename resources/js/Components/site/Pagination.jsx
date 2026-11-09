import { useEffect, useMemo, useState } from 'react';
import { BackMark, ForwardMark } from '@/Components/site/Mark';

/**
 * Client-side paging for account lists that arrive as full arrays.
 */
export function useClientPagination(items = [], pageSize = 12) {
    const list = Array.isArray(items) ? items : [];
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    const safePage = Math.min(page, totalPages);

    useEffect(() => {
        setPage(1);
    }, [list.length, pageSize]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const pageItems = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return list.slice(start, start + pageSize);
    }, [list, pageSize, safePage]);

    return {
        page: safePage,
        totalPages,
        setPage,
        pageItems,
        total: list.length,
    };
}

/**
 * Build page tokens: numbers plus 'ellipsis' gaps.
 * Example for page 1 of 700: [1, 2, 3, 'ellipsis', 700]
 * Example for page 350: [1, 'ellipsis', 349, 350, 351, 'ellipsis', 700]
 */
export function paginationItems(current, total, siblingCount = 1) {
    const safeTotal = Math.max(1, Number(total) || 1);
    const safeCurrent = Math.min(Math.max(1, Number(current) || 1), safeTotal);

    if (safeTotal <= 7) {
        return Array.from({ length: safeTotal }, (_, i) => i + 1);
    }

    const pages = new Set([1, safeTotal]);
    for (
        let i = safeCurrent - siblingCount;
        i <= safeCurrent + siblingCount;
        i += 1
    ) {
        if (i >= 1 && i <= safeTotal) {
            pages.add(i);
        }
    }

    // Keep a short run at the start / end so first pages read as 1 2 3 … N
    if (safeCurrent <= siblingCount + 2) {
        for (let i = 1; i <= Math.min(3 + siblingCount, safeTotal); i += 1) {
            pages.add(i);
        }
    }
    if (safeCurrent >= safeTotal - siblingCount - 1) {
        for (
            let i = Math.max(1, safeTotal - (2 + siblingCount));
            i <= safeTotal;
            i += 1
        ) {
            pages.add(i);
        }
    }

    const sorted = [...pages].sort((a, b) => a - b);
    const items = [];
    let previous = 0;

    for (const page of sorted) {
        if (previous && page - previous > 1) {
            items.push('ellipsis');
        }
        items.push(page);
        previous = page;
    }

    return items;
}

const btnBase =
    'inline-flex h-10 min-w-10 shrink-0 items-center justify-center border text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-35';
const btnIdle =
    'border-transparent text-olive-700 hover:border-olive-900/15 hover:bg-olive-50 hover:text-olive-950';
const btnActive =
    'border-olive-900 bg-olive-900 text-white';
const btnNav =
    'border-olive-900/15 bg-white text-olive-800 hover:border-olive-900/35 hover:bg-olive-50';

/**
 * Modern directory pagination: first / near / last with ellipsis, no soft pill chrome.
 */
export default function Pagination({
    page,
    totalPages,
    onPageChange,
    className = '',
    label = 'Pagination',
}) {
    const safeTotal = Math.max(1, Number(totalPages) || 1);
    const safePage = Math.min(Math.max(1, Number(page) || 1), safeTotal);

    if (safeTotal <= 1) {
        return null;
    }

    const items = paginationItems(safePage, safeTotal);

    return (
        <div className={`flex flex-col items-center gap-2.5 ${className}`.trim()}>
            <nav
                className="flex max-w-full items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label={label}
            >
                <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => onPageChange?.(safePage - 1)}
                    className={`${btnBase} gap-1.5 px-2.5 sm:px-3 ${btnNav}`}
                    aria-label="Previous page"
                >
                    <BackMark className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Prev</span>
                </button>

                {items.map((item, index) => {
                    if (item === 'ellipsis') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="inline-flex h-10 min-w-8 shrink-0 items-center justify-center text-sm font-semibold tracking-widest text-olive-400"
                                aria-hidden="true"
                            >
                                …
                            </span>
                        );
                    }

                    const active = item === safePage;

                    return (
                        <button
                            key={item}
                            type="button"
                            onClick={() => onPageChange?.(item)}
                            className={`${btnBase} px-2 ${
                                active ? btnActive : btnIdle
                            }`}
                            aria-label={`Page ${item}`}
                            aria-current={active ? 'page' : undefined}
                        >
                            {item}
                        </button>
                    );
                })}

                <button
                    type="button"
                    disabled={safePage >= safeTotal}
                    onClick={() => onPageChange?.(safePage + 1)}
                    className={`${btnBase} gap-1.5 px-2.5 sm:px-3 ${btnNav}`}
                    aria-label="Next page"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ForwardMark className="h-3.5 w-3.5" />
                </button>
            </nav>

            <p className="text-xs font-medium text-olive-500">
                Page {safePage} of {safeTotal}
            </p>
        </div>
    );
}
