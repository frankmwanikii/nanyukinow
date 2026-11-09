import AccountLayout from '@/Layouts/AccountLayout';
import ListingCard from '@/Components/site/ListingCard';
import { useConfirm } from '@/Components/ConfirmDialog';
import Pagination, {
    useClientPagination,
} from '@/Components/site/Pagination';
import { Head, Link, router } from '@inertiajs/react';
import { BookmarkMark } from '@/Components/site/Mark';
import { toggleListingBookmark } from '@/utils/listingBookmark';

const PAGE_SIZE = 9;

export default function Bookmarks({ bookmarks = [] }) {
    const { confirm, dialog } = useConfirm();
    const { page, totalPages, setPage, pageItems } = useClientPagination(
        bookmarks,
        PAGE_SIZE,
    );

    const removeBookmark = async (listing) => {
        const ok = await confirm({
            title: 'Remove bookmark?',
            message: `Remove “${listing.title || 'Untitled'}” from your bookmarks?`,
            confirmLabel: 'Remove',
        });
        if (!ok) return;
        try {
            await toggleListingBookmark(listing.slug, false);
        } finally {
            router.reload({ only: ['bookmarks'] });
        }
    };

    const removeAllBookmarks = async () => {
        const count = bookmarks.length;
        const ok = await confirm({
            title: 'Remove all bookmarks?',
            message:
                count === 1
                    ? 'Remove your 1 saved listing? This cannot be undone.'
                    : `Remove all ${count} saved listings? This cannot be undone.`,
            confirmLabel: 'Remove all',
            tone: 'danger',
        });
        if (!ok) return;
        router.delete(route('account.bookmarks.destroy-all'));
    };

    return (
        <AccountLayout title="Bookmarks">
            {dialog}
            <Head title="Bookmarks" />

            <div className="space-y-5">
                <section className="border border-olive-900/15 bg-white dark:border-olive-800 dark:bg-olive-900">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-olive-900/10 px-4 py-4 sm:px-5 dark:border-olive-800">
                        <div className="flex min-w-0 items-center gap-2.5">
                            <BookmarkMark
                                className="h-5 w-5 shrink-0 text-olive-800 dark:text-olive-200"
                                filled
                            />
                            <h2 className="font-display text-base font-semibold text-olive-950 dark:text-olive-50">
                                Saved listings
                            </h2>
                            <span className="bg-olive-100 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-olive-700 dark:bg-olive-950 dark:text-olive-400">
                                {bookmarks.length}
                            </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                            {bookmarks.length > 0 ? (
                                <button
                                    type="button"
                                    onClick={removeAllBookmarks}
                                    className="text-sm font-semibold text-rose-700 transition hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300"
                                >
                                    Remove all
                                </button>
                            ) : null}
                            <Link
                                href={route('explore')}
                                className="text-sm font-semibold text-olive-800 transition hover:text-olive-950 dark:text-olive-200 dark:hover:text-olive-50"
                            >
                                Explore
                            </Link>
                        </div>
                    </div>

                    {bookmarks.length === 0 ? (
                        <div className="px-4 py-12 text-center sm:px-5">
                            <p className="text-sm font-semibold text-olive-900 dark:text-olive-100">
                                No bookmarks yet
                            </p>
                            <p className="mx-auto mt-1 max-w-sm text-sm text-olive-600 dark:text-olive-400">
                                Tap the bookmark icon on any listing card to save
                                it here for quick access.
                            </p>
                            <Link
                                href={route('explore')}
                                className="mt-5 inline-flex items-center gap-1.5 bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-mustard hover:text-earth-dusk dark:bg-mustard dark:text-earth-dusk"
                            >
                                Browse listings
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
                                {pageItems.map((listing) => (
                                    <div
                                        key={listing.id}
                                        className="relative min-w-0"
                                    >
                                        <ListingCard listing={listing} />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeBookmark(listing)
                                            }
                                            className="absolute bottom-3 right-3 z-10 border border-olive-900/15 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-olive-700 dark:bg-olive-950 dark:text-rose-400 dark:hover:bg-rose-950/40"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <Pagination
                                className="border-t border-olive-900/10 px-4 py-5 dark:border-olive-800"
                                page={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                                label="Bookmarks pagination"
                            />
                        </>
                    )}
                </section>
            </div>
        </AccountLayout>
    );
}
