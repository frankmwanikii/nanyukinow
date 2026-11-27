import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActivityAreaChart,
    DistributionBars,
    HorizontalBarChart,
} from '@/Components/Admin/charts';
import {
    DataCard,
    DataTable,
    ExpiryCell,
    AdminNotice,
    PageHeader,
    StatusBadge,
    StatCard,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { useAdminTheme } from '@/hooks/useAdminTheme';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard(props) {
    return (
        <AdminLayout>
            <Head title="Admin overview" />
            <DashboardBody {...props} />
        </AdminLayout>
    );
}

function DashboardBody({
    stats,
    recentListings,
    expiringListings,
    recentReviews,
    charts,
}) {
    const { isDark } = useAdminTheme();
    const activity = Array.isArray(charts?.activity) ? charts.activity : [];
    const categories = Array.isArray(charts?.categories) ? charts.categories : [];
    const statuses = Array.isArray(charts?.statuses) ? charts.statuses : [];
    const tiers = Array.isArray(charts?.tiers) ? charts.tiers : [];
    const recent = Array.isArray(recentListings) ? recentListings : [];
    const expiring = Array.isArray(expiringListings) ? expiringListings : [];
    const reviews = Array.isArray(recentReviews) ? recentReviews : [];
    const [dismissed, setDismissed] = useState({});

    const dismiss = (key) => setDismissed((prev) => ({ ...prev, [key]: true }));

    const insights = [
        stats.pending_upgrades > 0 &&
            !dismissed.upgrades && {
                key: 'upgrades',
                href: route('admin.finance.index', { tab: 'payments', status: 'pending' }),
                text: `${stats.pending_upgrades} payment${stats.pending_upgrades === 1 ? '' : 's'} awaiting finance approval.`,
            },
        stats.pending_listings > 0 &&
            !dismissed.listings && {
                key: 'listings',
                href: route('admin.listings.index', { status: 'pending' }),
                text: `${stats.pending_listings} listing${stats.pending_listings === 1 ? '' : 's'} waiting for review.`,
            },
        stats.pending_reviews > 0 &&
            !dismissed.reviews && {
                key: 'reviews',
                href: route('admin.reviews.index', { status: 'unpublished' }),
                text: `${stats.pending_reviews} review${stats.pending_reviews === 1 ? '' : 's'} awaiting publish.`,
            },
        stats.expiring_soon > 0 &&
            !dismissed.expiring && {
                key: 'expiring',
                href: route('admin.listings.index', { expiry: 'soon' }),
                text: `${stats.expiring_soon} listing${stats.expiring_soon === 1 ? '' : 's'} expiring soon${stats.expired ? `, ${stats.expired} already expired` : ''}.`,
            },
    ].filter(Boolean);

    return (
        <>
            <PageHeader title="Overview" />

            {insights.length > 0 && (
                <div className="mb-5 grid max-w-3xl gap-3">
                    {insights.map((item) => (
                        <AdminNotice
                            key={item.key}
                            tone="decreasing"
                            href={item.href}
                            onDismiss={() => dismiss(item.key)}
                        >
                            {item.text}
                        </AdminNotice>
                    ))}
                </div>
            )}

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
                <StatCard
                    label="Listings"
                    value={stats.listings}
                    hint={`${stats.published} published`}
                />
                <StatCard
                    label="Pending review"
                    value={stats.pending_listings ?? 0}
                    hint="Member submissions"
                />
                <StatCard
                    label="Finance queue"
                    value={stats.pending_upgrades ?? 0}
                    hint="Awaiting payment check"
                />
                <StatCard
                    label="Reviews queue"
                    value={stats.pending_reviews ?? 0}
                    hint={`${stats.reviews ?? 0} total reviews`}
                />
                <StatCard
                    label="Featured"
                    value={stats.featured}
                    hint="Promoted in explore"
                />
                <StatCard
                    label="Expiring soon"
                    value={stats.expiring_soon}
                    hint={`${stats.expired} already expired`}
                />
                <StatCard
                    label="Users"
                    value={stats.users}
                    hint={`${stats.admins} admins, ${stats.stories} stories`}
                />
                <StatCard
                    label="Listing views"
                    value={Number(stats.views || 0).toLocaleString()}
                    hint="All-time directory views"
                />
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <DataCard
                        title="Activity, last 30 days"
                        tools={
                            <div className="flex items-center gap-3 text-sm text-olive-600 dark:text-olive-300">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2 w-2 bg-olive-600" />
                                    Listings
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2 w-2 bg-mustard" />
                                    Users
                                </span>
                            </div>
                        }
                    >
                        {activity.length > 0 ? (
                            <ActivityAreaChart data={activity} isDark={isDark} />
                        ) : (
                            <p className="px-4 py-10 text-center text-sm text-olive-400">
                                No activity data yet.
                            </p>
                        )}
                    </DataCard>
                </div>

                <DataCard title="Listings by category">
                    {categories.length > 0 ? (
                        <HorizontalBarChart data={categories} isDark={isDark} />
                    ) : (
                        <p className="px-4 py-10 text-center text-sm text-olive-400">
                            No categories yet.
                        </p>
                    )}
                </DataCard>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <DataCard title="Status mix">
                    {statuses.length > 0 ? (
                        <DistributionBars data={statuses} isDark={isDark} />
                    ) : (
                        <p className="px-4 py-8 text-center text-sm text-olive-400">No status data.</p>
                    )}
                </DataCard>
                <DataCard title="Package / tier mix">
                    {tiers.length > 0 ? (
                        <DistributionBars data={tiers} isDark={isDark} />
                    ) : (
                        <p className="px-4 py-8 text-center text-sm text-olive-400">No tier data.</p>
                    )}
                </DataCard>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <DataCard
                        title="Recent listings"
                        tools={
                            <Link
                                href={route('admin.listings.index')}
                                className="text-xs font-medium text-olive-500 hover:text-olive-800 dark:text-olive-300 dark:hover:text-olive-100"
                            >
                                View all
                            </Link>
                        }
                    >
                        <DataTable>
                            <thead>
                                <tr>
                                    <Th>Listing</Th>
                                    <Th>Status</Th>
                                    <Th>Tier</Th>
                                    <Th>Expires</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((listing) => (
                                    <tr key={listing.id}>
                                        <Td>
                                            <Link
                                                href={route('admin.listings.edit', listing.slug || listing.id)}
                                                className="text-base font-medium text-olive-900 hover:text-earth-dusk dark:text-olive-100 dark:hover:text-white"
                                            >
                                                {listing.title}
                                            </Link>
                                            <p className="text-sm text-olive-500 dark:text-olive-400">
                                                {listing.category || 'Uncategorized'}
                                            </p>
                                        </Td>
                                        <Td>
                                            <StatusBadge status={listing.status} />
                                        </Td>
                                        <Td>
                                            <StatusBadge status={listing.tier} />
                                        </Td>
                                        <Td>
                                            <ExpiryCell
                                                expiresAt={listing.expires_at}
                                                label={listing.expiry_label}
                                                isExpired={listing.is_expired}
                                            />
                                        </Td>
                                    </tr>
                                ))}
                                {recent.length === 0 && (
                                    <tr>
                                        <Td colSpan={4} className="py-8 text-center text-olive-400">
                                            No listings yet.
                                        </Td>
                                    </tr>
                                )}
                            </tbody>
                        </DataTable>
                    </DataCard>
                </div>

                <DataCard
                    title="Expiry watchlist"
                    tools={
                        <Link
                            href={route('admin.listings.index', { expiry: 'soon' })}
                            className="text-xs font-medium text-olive-500 hover:text-olive-800 dark:text-olive-300 dark:hover:text-olive-100"
                        >
                            Filter
                        </Link>
                    }
                >
                    <DataTable>
                        <thead>
                            <tr>
                                <Th>Listing</Th>
                                <Th>Status</Th>
                                <Th align="right">Expires</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {expiring.map((listing) => (
                                <tr key={listing.id}>
                                    <Td>
                                        <Link
                                            href={route('admin.listings.edit', listing.slug || listing.id)}
                                            className="text-base font-medium text-olive-900 hover:text-earth-dusk dark:text-olive-100"
                                        >
                                            {listing.title}
                                        </Link>
                                        <p className="text-sm text-olive-500">
                                            {listing.category || '—'}
                                        </p>
                                    </Td>
                                    <Td>
                                        <StatusBadge
                                            status={
                                                listing.is_expired ? 'expired' : listing.status
                                            }
                                        />
                                    </Td>
                                    <Td align="right">
                                        <ExpiryCell
                                            expiresAt={listing.expires_at}
                                            label={listing.expiry_label}
                                            isExpired={listing.is_expired}
                                        />
                                    </Td>
                                </tr>
                            ))}
                            {expiring.length === 0 && (
                                <tr>
                                    <Td colSpan={3} className="py-8 text-center text-olive-400">
                                        Nothing in the watch window.
                                    </Td>
                                </tr>
                            )}
                        </tbody>
                    </DataTable>
                </DataCard>
            </div>

            <div className="mt-4">
                <DataCard
                    title="Recent reviews"
                    tools={
                        <Link
                            href={route('admin.reviews.index')}
                            className="text-xs font-medium text-olive-500 hover:text-olive-800 dark:text-olive-300 dark:hover:text-olive-100"
                        >
                            Manage reviews
                        </Link>
                    }
                >
                    <DataTable>
                        <thead>
                            <tr>
                                <Th>Listing</Th>
                                <Th>Rating</Th>
                                <Th>Member</Th>
                                <Th>Status</Th>
                                <Th>Review</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map((review) => (
                                <tr key={review.id}>
                                    <Td>
                                        <Link
                                            href={route('admin.reviews.index', {
                                                status: review.is_published
                                                    ? 'published'
                                                    : 'unpublished',
                                            })}
                                            className="text-base font-medium text-olive-900 hover:text-earth-dusk dark:text-olive-100 dark:hover:text-white"
                                        >
                                            {review.listing?.title || 'Listing removed'}
                                        </Link>
                                    </Td>
                                    <Td>
                                        <span className="tabular-nums text-sm font-semibold text-olive-900 dark:text-olive-50">
                                            {review.rating}/5
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-olive-700 dark:text-olive-200">
                                            {review.author?.name || 'Member'}
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
                                    <Td>
                                        <p className="line-clamp-2 max-w-md text-sm text-olive-600 dark:text-olive-300">
                                            {review.body}
                                        </p>
                                    </Td>
                                </tr>
                            ))}
                            {reviews.length === 0 && (
                                <tr>
                                    <Td colSpan={5} className="py-8 text-center text-olive-400">
                                        No reviews yet.
                                    </Td>
                                </tr>
                            )}
                        </tbody>
                    </DataTable>
                </DataCard>
            </div>
        </>
    );
}
