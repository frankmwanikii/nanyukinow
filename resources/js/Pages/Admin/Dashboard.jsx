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
    AdminLink,
} from '@/Components/Admin/ui';
import { useAdminTheme } from '@/hooks/useAdminTheme';
import { Head, Link } from '@inertiajs/react';
import {
    Eye,
    LayoutList,
    Plus,
    Sparkles,
    Timer,
    Users,
} from 'lucide-react';

export default function Dashboard(props) {
    return (
        <AdminLayout
            title="Overview"
            actions={
                <AdminLink href={route('admin.listings.create')}>
                    <Plus className="h-4 w-4" />
                    New listing
                </AdminLink>
            }
        >
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
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                    label="Listings"
                    value={stats.listings}
                    hint={`${stats.published} published`}
                    icon={LayoutList}
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

            <div className="mt-5 grid gap-4 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <DataCard
                        title="Activity · last 30 days"
                        tools={
                            <div className="flex items-center gap-3 text-[11px] text-olive-600 dark:text-olive-300">
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
                                                className="text-sm font-medium text-olive-900 hover:text-earth-dusk dark:text-olive-100 dark:hover:text-white"
                                            >
                                                {listing.title}
                                            </Link>
                                            <p className="text-[11px] text-olive-400 dark:text-olive-500">
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
                                            className="text-sm font-medium text-olive-900 hover:text-earth-dusk dark:text-olive-100"
                                        >
                                            {listing.title}
                                        </Link>
                                        <p className="text-[11px] text-olive-400">
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
