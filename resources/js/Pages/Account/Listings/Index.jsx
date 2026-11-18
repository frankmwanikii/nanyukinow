import AccountLayout from '@/Layouts/AccountLayout';
import {
    ActionMenu,
    DataTable,
    ExpiryCell,
    StatusBadge,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import Pagination, {
    useClientPagination,
} from '@/Components/site/Pagination';
import { ListMark, PlusMark, UpgradePlansMark } from '@/Components/site/Mark';
import { Head, Link, router } from '@inertiajs/react';

const PAGE_SIZE = 10;

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatGraceDate(iso) {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function Index({ plan, listings = [] }) {
    const { confirm, dialog } = useConfirm();
    const { page, totalPages, setPage, pageItems } = useClientPagination(
        listings,
        PAGE_SIZE,
    );

    const graceListings = listings.filter((listing) => listing.claim_grace_active);
    const graceEndsAt = graceListings
        .map((listing) => listing.claim_grace_ends_at)
        .filter(Boolean)
        .sort()[0];
    const graceDateLabel = formatGraceDate(graceEndsAt);

    const remove = async (listing) => {
        const ok = await confirm({
            title: 'Delete listing?',
            message: `Delete “${listing.title || 'Untitled'}”? This cannot be undone.`,
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        router.delete(route('account.listings.destroy', listing.slug || listing.id));
    };

    return (
        <AccountLayout title="Listings">
            {dialog}
            <Head title="Listings" />

            <div className="space-y-5">
                {graceListings.length > 0 && graceDateLabel ? (
                    <div className="border border-mustard/40 bg-mustard/15 px-4 py-3 text-sm text-earth-dusk dark:border-mustard/30 dark:bg-mustard/10 dark:text-mustard sm:px-5">
                        <p>
                            {graceListings.length === 1
                                ? `“${graceListings[0].title || 'Your listing'}” keeps its current plan until ${graceDateLabel}. After that it moves to Free. Verified status stays.`
                                : `Claimed listings keep their current plan until ${graceDateLabel}. After that they move to Free. Verified status stays.`}
                        </p>
                        {plan.key !== 'premium' ? (
                            <Link
                                href={route('account.upgrade')}
                                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-2 hover:underline"
                            >
                                Upgrade to keep paid placement
                            </Link>
                        ) : null}
                    </div>
                ) : null}

                <section className="border border-olive-900/15 bg-white dark:border-olive-800 dark:bg-olive-900">
                    <div className="flex items-center justify-between gap-3 border-b border-olive-900/10 px-4 py-4 sm:px-5 dark:border-olive-800">
                        <div className="flex min-w-0 items-center gap-2.5">
                            <ListMark className="h-5 w-5 shrink-0 text-olive-800 dark:text-olive-200" />
                            <div className="min-w-0">
                                <h2 className="font-display text-base font-semibold text-olive-950 dark:text-olive-50">
                                    Your listings
                                </h2>
                                <p className="mt-0.5 text-sm text-olive-600 dark:text-olive-400">
                                    {plan.listings_used}/{plan.listing_limit} used
                                </p>
                            </div>
                        </div>
                        {plan.can_create ? (
                            <Link
                                href={route('account.listings.create')}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-olive-100 px-3.5 py-2 text-sm font-semibold text-olive-950 transition hover:bg-olive-200 dark:bg-olive-800 dark:text-olive-50 dark:hover:bg-olive-700"
                            >
                                <PlusMark className="h-4 w-4" />
                                Add listing
                            </Link>
                        ) : plan.key !== 'premium' ? (
                            <Link
                                href={route('account.upgrade')}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-mustard bg-mustard px-3.5 py-2 text-sm font-semibold text-earth-dusk transition hover:bg-olive-900 hover:text-white"
                            >
                                <UpgradePlansMark className="h-4 w-4" />
                                Upgrade plan
                            </Link>
                        ) : null}
                    </div>

                    {listings.length === 0 ? (
                        <div className="px-4 py-12 text-center sm:px-5">
                            <p className="text-sm font-semibold text-olive-900 dark:text-olive-100">
                                No listings yet
                            </p>
                            <p className="mx-auto mt-1 max-w-sm text-sm text-olive-600 dark:text-olive-400">
                                Your plan includes {plan.listing_limit} listing
                                {plan.listing_limit === 1 ? '' : 's'}. Submit one for review to go
                                live.
                            </p>
                            {plan.can_create ? (
                                <Link
                                    href={route('account.listings.create')}
                                    className="mt-5 inline-flex items-center gap-1.5 rounded-sm bg-olive-100 px-3.5 py-2 text-sm font-semibold text-olive-950 transition hover:bg-olive-200 dark:bg-olive-800 dark:text-olive-50"
                                >
                                    <PlusMark className="h-4 w-4" />
                                    Add listing
                                </Link>
                            ) : null}
                        </div>
                    ) : (
                        <>
                            <DataTable>
                                <thead>
                                    <tr>
                                        <Th>Title</Th>
                                        <Th>Category</Th>
                                        <Th>Last modified</Th>
                                        <Th>Expiry date</Th>
                                        <Th>Date published</Th>
                                        <Th>Status</Th>
                                        <Th align="right">Actions</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageItems.map((listing) => (
                                        <tr
                                            key={listing.id}
                                            className="transition hover:bg-olive-50/60 dark:hover:bg-olive-800/40"
                                        >
                                            <Td>
                                                <Link
                                                    href={route(
                                                        'account.listings.edit',
                                                        listing.slug || listing.id,
                                                    )}
                                                    className="flex min-w-[12rem] items-center gap-3 outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-mustard"
                                                >
                                                    <div className="h-10 w-10 shrink-0 overflow-hidden bg-olive-100 dark:bg-olive-800">
                                                        {listing.image_url ? (
                                                            <img
                                                                src={listing.image_url}
                                                                alt=""
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full items-center justify-center text-[9px] font-semibold text-olive-400 dark:text-olive-500">
                                                                N/A
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-olive-950 underline-offset-2 hover:underline dark:text-olive-50">
                                                            {listing.title || 'Untitled'}
                                                        </p>
                                                        {listing.claim_grace_active &&
                                                        listing.claim_grace_ends_at ? (
                                                            <p className="mt-0.5 truncate text-xs text-earth-dusk dark:text-mustard">
                                                                Plan grace until{' '}
                                                                {formatGraceDate(
                                                                    listing.claim_grace_ends_at,
                                                                )}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </Link>
                                            </Td>
                                            <Td>
                                                <span className="text-sm text-olive-700 dark:text-olive-200">
                                                    {listing.category || '—'}
                                                </span>
                                            </Td>
                                            <Td>
                                                <span className="whitespace-nowrap text-sm text-olive-600 dark:text-olive-300">
                                                    {formatDate(listing.updated_at)}
                                                </span>
                                            </Td>
                                            <Td>
                                                <ExpiryCell
                                                    expiresAt={listing.expires_at}
                                                    isExpired={listing.is_expired}
                                                />
                                            </Td>
                                            <Td>
                                                <span className="whitespace-nowrap text-sm text-olive-600 dark:text-olive-300">
                                                    {formatDate(listing.published_at)}
                                                </span>
                                            </Td>
                                            <Td>
                                                <StatusBadge status={listing.status} />
                                            </Td>
                                            <Td align="right">
                                                <ActionMenu
                                                    label="Actions"
                                                    items={[
                                                        ...(listing.is_published &&
                                                        listing.status === 'published'
                                                            ? [
                                                                  {
                                                                      label: 'View',
                                                                      href: route(
                                                                          'listings.show',
                                                                          listing.slug,
                                                                      ),
                                                                  },
                                                              ]
                                                            : []),
                                                        {
                                                            label: 'Edit',
                                                            href: route(
                                                                'account.listings.edit',
                                                                listing.slug || listing.id,
                                                            ),
                                                        },
                                                        {
                                                            label: 'Delete',
                                                            danger: true,
                                                            onClick: () => remove(listing),
                                                        },
                                                    ]}
                                                />
                                            </Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </DataTable>
                            <Pagination
                                className="border-t border-olive-900/10 px-4 py-5 dark:border-olive-800"
                                page={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                                label="Listings pagination"
                            />
                        </>
                    )}
                </section>
            </div>
        </AccountLayout>
    );
}
