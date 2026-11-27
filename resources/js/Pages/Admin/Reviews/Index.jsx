import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionMenu,
    AdminInput,
    AdminSelect,
    DataCard,
    DataTable,
    EmptyState,
    FilterBar,
    MediaCell,
    PageHeader,
    Pagination,
    StatusBadge,
    SummaryCard,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    ClipboardList,
    Hourglass,
    Star,
} from '@/Components/site/LucideCompat';
import { useEffect, useRef, useState } from 'react';

function formatDate(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString(undefined, {
            dateStyle: 'medium',
        });
    } catch {
        return '—';
    }
}

function Stars({ value }) {
    const rating = Math.max(0, Math.min(5, Number(value) || 0));

    return (
        <span
            className="inline-flex items-center gap-0.5 text-mustard"
            aria-label={`${rating} out of 5 stars`}
        >
            {Array.from({ length: 5 }, (_, index) => (
                <Star
                    key={index}
                    className={`h-3.5 w-3.5 ${
                        index < rating ? 'fill-mustard text-mustard' : 'text-olive-300'
                    }`}
                />
            ))}
        </span>
    );
}

export default function Index({ reviews, filters, counts }) {
    const { confirm, dialog } = useConfirm();
    const [local, setLocal] = useState({
        q: filters.q || '',
        status: filters.status || 'unpublished',
        per_page: filters.per_page || 15,
    });
    const skipDebounce = useRef(true);
    const rows = reviews?.data || [];
    const total = reviews?.meta?.total ?? reviews?.total ?? rows.length;

    const pushFilters = (next) => {
        router.get(route('admin.reviews.index'), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    useEffect(() => {
        if (skipDebounce.current) {
            skipDebounce.current = false;
            return undefined;
        }

        const timer = setTimeout(() => {
            pushFilters(local);
        }, 350);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [local.q]);

    const setSelect = (key, value) => {
        const next = { ...local, [key]: value };
        setLocal(next);
        pushFilters(next);
    };

    const applyCardFilter = (status) => {
        const next = { ...local, status };
        setLocal(next);
        pushFilters(next);
    };

    const publishReview = async (review) => {
        const ok = await confirm({
            title: 'Publish review?',
            message: `Show this review on “${review.listing?.title || 'listing'}”?`,
            confirmLabel: 'Publish',
        });
        if (!ok) return;
        router.post(route('admin.reviews.publish', review.id), {}, {
            preserveScroll: true,
        });
    };

    const unpublishReview = async (review) => {
        const ok = await confirm({
            title: 'Unpublish review?',
            message: `Hide this review from “${review.listing?.title || 'listing'}”?`,
            confirmLabel: 'Unpublish',
            tone: 'warning',
        });
        if (!ok) return;
        router.post(route('admin.reviews.unpublish', review.id), {}, {
            preserveScroll: true,
        });
    };

    const deleteReview = async (review) => {
        const ok = await confirm({
            title: 'Delete review?',
            message: 'This cannot be undone.',
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        router.delete(route('admin.reviews.destroy', review.id), {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout>
            <Head title="Reviews" />
            {dialog}

            <PageHeader
                title="Reviews"
                description="Moderate member ratings and reviews before they appear on listings."
            />

            <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <SummaryCard
                    title="Awaiting publish"
                    value={counts?.unpublished ?? 0}
                    hint="Hidden until approved"
                    icon={Hourglass}
                    iconTone="amber"
                    actionLabel="Review queue"
                    onAction={() => applyCardFilter('unpublished')}
                />
                <SummaryCard
                    title="Published"
                    value={counts?.published ?? 0}
                    hint="Live on listings"
                    icon={CheckCircle2}
                    iconTone="mint"
                    actionLabel="View published"
                    onAction={() => applyCardFilter('published')}
                />
                <SummaryCard
                    title="All reviews"
                    value={counts?.all ?? 0}
                    hint="Every submission"
                    icon={ClipboardList}
                    iconTone="slate"
                    actionLabel="View all"
                    onAction={() => applyCardFilter('all')}
                />
            </div>

            <FilterBar>
                <AdminInput
                    label="Search"
                    value={local.q}
                    onChange={(e) => setLocal({ ...local, q: e.target.value })}
                    placeholder="Review text, listing, member…"
                    className="min-w-[180px] flex-1"
                />
                <AdminSelect
                    label="Status"
                    value={local.status}
                    onChange={(e) => setSelect('status', e.target.value)}
                    className="w-[160px]"
                >
                    <option value="unpublished">Unpublished</option>
                    <option value="published">Published</option>
                    <option value="all">All</option>
                </AdminSelect>
            </FilterBar>

            {rows.length === 0 ? (
                <EmptyState
                    title="No reviews found"
                    description="When members leave ratings, they will show up here for moderation."
                />
            ) : (
                <DataCard
                    title={`${total} review${total === 1 ? '' : 's'}`}
                    footer={
                        <Pagination
                            links={reviews.links}
                            meta={reviews.meta || reviews}
                            perPage={local.per_page}
                            onPerPageChange={(n) => {
                                const next = { ...local, per_page: n };
                                setLocal(next);
                                pushFilters(next);
                            }}
                        />
                    }
                >
                    <DataTable>
                        <thead>
                            <tr>
                                <Th>Listing</Th>
                                <Th>Rating</Th>
                                <Th>Review</Th>
                                <Th>Member</Th>
                                <Th>Submitted</Th>
                                <Th>Status</Th>
                                <Th align="right">Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((review) => (
                                <tr key={review.id}>
                                    <Td>
                                        <MediaCell
                                            image={review.listing?.image}
                                            title={
                                                review.listing?.title ||
                                                'Listing removed'
                                            }
                                        />
                                    </Td>
                                    <Td>
                                        <Stars value={review.rating} />
                                    </Td>
                                    <Td>
                                        <p className="line-clamp-2 max-w-xs text-sm text-olive-800 dark:text-olive-100">
                                            {review.body}
                                        </p>
                                    </Td>
                                    <Td>
                                        <p className="truncate text-sm text-olive-800 dark:text-olive-100">
                                            {review.author?.name || 'Member'}
                                        </p>
                                        {review.author?.email ? (
                                            <p className="truncate text-xs text-olive-500">
                                                {review.author.email}
                                            </p>
                                        ) : null}
                                    </Td>
                                    <Td>
                                        <span className="whitespace-nowrap text-sm text-olive-600 dark:text-olive-300">
                                            {formatDate(review.created_at)}
                                        </span>
                                    </Td>
                                    <Td>
                                        <StatusBadge
                                            status={
                                                review.is_published
                                                    ? 'published'
                                                    : 'pending'
                                            }
                                        />
                                    </Td>
                                    <Td align="right">
                                        <ActionMenu
                                            items={[
                                                review.listing?.slug
                                                    ? {
                                                          label: 'View listing',
                                                          href: route(
                                                              'listings.show',
                                                              review.listing.slug,
                                                          ),
                                                      }
                                                    : null,
                                                review.is_published
                                                    ? {
                                                          label: 'Unpublish',
                                                          onClick: () =>
                                                              unpublishReview(
                                                                  review,
                                                              ),
                                                      }
                                                    : {
                                                          label: 'Publish',
                                                          onClick: () =>
                                                              publishReview(
                                                                  review,
                                                              ),
                                                      },
                                                {
                                                    label: 'Delete',
                                                    danger: true,
                                                    onClick: () =>
                                                        deleteReview(review),
                                                },
                                            ].filter(Boolean)}
                                        />
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </DataTable>
                </DataCard>
            )}
        </AdminLayout>
    );
}
