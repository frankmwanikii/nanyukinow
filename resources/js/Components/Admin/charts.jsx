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

const MUTED = ['#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#94a3b8', '#cbd5e1', '#6366f1'];

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-slate-600 dark:bg-slate-900">
            {label && (
                <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">{label}</p>
            )}
            {payload.map((entry) => (
                <p key={entry.dataKey} className="text-slate-500 dark:text-slate-400">
                    <span className="font-medium capitalize text-slate-700 dark:text-slate-200">
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
    const axis = isDark ? '#94a3b8' : '#94a3b8';
    const grid = isDark ? '#334155' : '#e2e8f0';
    const listings = isDark ? '#94a3b8' : '#334155';
    const users = isDark ? '#818cf8' : '#4f46e5';

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
                            <stop offset="0%" stopColor={users} stopOpacity={0.22} />
                            <stop offset="100%" stopColor={users} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="label"
                        tick={{ fill: axis, fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                        minTickGap={28}
                    />
                    <YAxis
                        allowDecimals={false}
                        tick={{ fill: axis, fontSize: 11 }}
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
                        strokeWidth={1.5}
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
    const axis = isDark ? '#94a3b8' : '#64748b';
    const bar = isDark ? '#94a3b8' : '#334155';

    return (
        <div className="h-64 w-full px-2 pb-2 pt-2">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
                >
                    <CartesianGrid stroke={isDark ? '#334155' : '#e2e8f0'} strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: axis, fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis
                        type="category"
                        dataKey={nameKey}
                        width={88}
                        tick={{ fill: axis, fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.04)' }} />
                    <Bar dataKey={dataKey} name="Count" radius={[0, 4, 4, 0]} barSize={14} fill={bar} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function DistributionBars({ data, isDark }) {
    const axis = isDark ? '#94a3b8' : '#64748b';

    return (
        <div className="h-52 w-full px-2 pb-2 pt-2">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke={isDark ? '#334155' : '#e2e8f0'} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: axis, fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: axis, fontSize: 11 }} tickLine={false} axisLine={false} width={28} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.04)' }} />
                    <Bar dataKey="count" name="Listings" radius={[4, 4, 0, 0]} barSize={28}>
                        {data.map((_, index) => (
                            <Cell key={index} fill={MUTED[index % MUTED.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
