import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

/** Brand palette: olive, mustard, mint, clay */
const BRAND = ['#4b533a', '#f2b82e', '#7bc45f', '#8b5a3c', '#6b7758', '#d49a14', '#a8e190', '#3d4430'];

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-md border border-olive-200 bg-white px-3 py-2 text-xs shadow-soft dark:border-olive-700 dark:bg-olive-900">
            {label && (
                <p className="mb-1 font-semibold text-olive-800 dark:text-olive-100">{label}</p>
            )}
            {payload.map((entry) => (
                <p key={entry.dataKey} className="text-olive-500 dark:text-olive-400">
                    <span className="font-medium capitalize text-olive-800 dark:text-olive-100">
                        {entry.name || entry.dataKey}
                    </span>
                    {': '}
                    <span className="tabular-nums">{entry.value}</span>
                </p>
            ))}
        </div>
    );
}

export function ActivityAreaChart({ data, isDark }) {
    const axis = isDark ? '#a8b393' : '#889571';
    const grid = isDark ? '#3d4430' : '#e4e7dc';
    const listings = isDark ? '#a8b393' : '#4b533a';
    const users = '#f2b82e';

    return (
        <div className="h-64 w-full px-2 pb-2 pt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                        <linearGradient id="listingsFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={listings} stopOpacity={0.28} />
                            <stop offset="100%" stopColor={listings} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={users} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={users} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="label"
                        tick={{ fill: axis, fontSize: 13 }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                        minTickGap={28}
                    />
                    <YAxis
                        allowDecimals={false}
                        tick={{ fill: axis, fontSize: 13 }}
                        tickLine={false}
                        axisLine={false}
                        width={36}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="listings"
                        name="Listings"
                        stroke={listings}
                        strokeWidth={2}
                        fill="url(#listingsFill)"
                        dot={false}
                        activeDot={{ r: 3, strokeWidth: 0 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="users"
                        name="Users"
                        stroke={users}
                        strokeWidth={1.75}
                        fill="url(#usersFill)"
                        dot={false}
                        activeDot={{ r: 3, strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export function HorizontalBarChart({ data, isDark, dataKey = 'count', nameKey = 'name' }) {
    const axis = isDark ? '#a8b393' : '#6b7758';
    const bar = isDark ? '#f2b82e' : '#4b533a';

    return (
        <div className="h-64 w-full px-2 pb-2 pt-2">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
                >
                    <CartesianGrid stroke={isDark ? '#3d4430' : '#e4e7dc'} strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: axis, fontSize: 13 }} tickLine={false} axisLine={false} />
                    <YAxis
                        type="category"
                        dataKey={nameKey}
                        width={88}
                        tick={{ fill: axis, fontSize: 13 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        content={<ChartTooltip />}
                        cursor={{ fill: isDark ? 'rgba(242,184,46,0.08)' : 'rgba(75,83,58,0.06)' }}
                    />
                    <Bar dataKey={dataKey} name="Count" radius={[0, 4, 4, 0]} barSize={14} fill={bar} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function DistributionBars({ data, isDark }) {
    const axis = isDark ? '#a8b393' : '#6b7758';

    return (
        <div className="h-52 w-full px-2 pb-2 pt-2">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke={isDark ? '#3d4430' : '#e4e7dc'} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: axis, fontSize: 13 }} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: axis, fontSize: 13 }} tickLine={false} axisLine={false} width={28} />
                    <Tooltip
                        content={<ChartTooltip />}
                        cursor={{ fill: isDark ? 'rgba(242,184,46,0.08)' : 'rgba(75,83,58,0.06)' }}
                    />
                    <Bar dataKey="count" name="Listings" radius={[4, 4, 0, 0]} barSize={28}>
                        {data.map((_, index) => (
                            <Cell key={index} fill={BRAND[index % BRAND.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
