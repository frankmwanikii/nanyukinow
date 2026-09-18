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
    StatusBadge,
    StatCard,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { useAdminTheme } from '@/hooks/useAdminTheme';
import { Head, Link } from '@inertiajs/react';
import {
    Eye,
    LayoutList,
    Sparkles,
    Timer,
    Users,
    ArrowUpCircle,
    ClipboardList,
} from 'lucide-react';

export default function Dashboard(props) {
    return (
        <AdminLayout title="Overview">
            <Head title="Admin overview" />
            <DashboardBody {...props} />
        </AdminLayout>
    );
}

function DashboardBody({ stats, recentListings, expiringListings, charts }) {
    const { isDark } = useAdminTheme();
    const activity = charts?.activity || [];
    const categories = charts?.categories || [];
    const statuses = charts?.statuses || [];
    const tiers = charts?.tiers || [];

    return (
        <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
                <StatCard
                    label="Listings"
                    value={stats.listings}
                    hint={`${stats.published} published`}
                    icon={LayoutList}
                />
                <StatCard
                    label="Pending review"
                    value={stats.pending_listings ?? 0}
                    hint="Member submissions"
                    icon={ClipboardList}
                />
                <StatCard
                    label="Upgrade queue"
                    value={stats.pending_upgrades ?? 0}
                    hint="Awaiting payment check"
                    icon={ArrowUpCircle}
                />
                <StatCard
                    label="Featured"
                    value={stats.featured}
                    hint="Promoted in explore"
                    icon={Sparkles}
                />
                <StatCard
                    label="Expiring soon"
                    value={stats.expiring_soon}
                    hint={`${stats.expired} already expired`}
                    icon={Timer}
                />
                <StatCard
                    label="Users"
                    value={stats.users}
                    hint={`${stats.admins} admins · ${stats.stories} stories`}
                    icon={Users}
                />
                <StatCard
                    label="Listing views"
                    value={Number(stats.views || 0).toLocaleString()}
                    hint="All-time directory views"
                    icon={Eye}
                />
            </div>

            {(stats.pending_upgrades > 0 || stats.pending_listings > 0) && (
                <div className="mt-4 flex flex-wrap gap-3">
                    {stats.pending_upgrades > 0 && (
                        <Link
                            href={route('admin.upgrades.index', { status: 'pending' })}
                            className="inline-flex items-center gap-2 rounded-full bg-mustard/20 px-4 py-2 text-sm font-semibold text-earth-dusk transition hover:bg-mustard/30 dark:text-mustard"
                        >
                            <ArrowUpCircle className="h-4 w-4" />
                            Review {stats.pending_upgrades} upgrade{stats.pending_upgrades === 1 ? '' : 's'}
                        </Link>
                    )}
                    {stats.pending_listings > 0 && (
                        <Link
                            href={route('admin.listings.index', { status: 'pending' })}
                            className="inline-flex items-center gap-2 rounded-full bg-olive-100 px-4 py-2 text-sm font-semibold text-olive-800 transition hover:bg-olive-200 dark:bg-olive-800 dark:text-olive-100"
                        >
                            <ClipboardList className="h-4 w-4" />
                            Review {stats.pending_listings} listing{stats.pending_listings === 1 ? '' : 's'}
                        </Link>
                    )}
                </div>
            )}

            <div className="mt-5 grid gap-4 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <DataCard
                        title="Activity · last 30 days"
                        tools={
                            <div className="flex items-center gap-3 text-sm text-olive-600 dark:text-olive-300">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-olive-600" />
                                    Listings
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-mustard" />
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
                                {recentListings.map((listing) => (
                                    <tr key={listing.id}>
                                        <Td>
                                            <Link
                                                href={route('admin.listings.edit', listing.id)}
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
                                {recentListings.length === 0 && (
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
                            {expiringListings.map((listing) => (
                                <tr key={listing.id}>
                                    <Td>
                                        <Link
                                            href={route('admin.listings.edit', listing.id)}
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
                            {expiringListings.length === 0 && (
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
        </>
    );
}
