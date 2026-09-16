import { useEffect, useMemo, useState } from 'react';
import DetailSection from './DetailSection';

const DAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

function parseHourMinute(value) {
    if (value == null) return null;
    const raw = String(value).trim();
    if (!raw || raw.toLowerCase() === 'closed') return null;

    const match12 = raw.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (match12) {
        let hour = Number(match12[1]);
        const minute = Number(match12[2]);
        const period = match12[3].toLowerCase();
        if (period === 'pm' && hour < 12) hour += 12;
        if (period === 'am' && hour === 12) hour = 0;
        return { hour, minute };
    }

    const match24 = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
        return { hour: Number(match24[1]), minute: Number(match24[2]) };
    }

    return null;
}

function formatTime12(value) {
    const parsed = parseHourMinute(value);
    if (!parsed) return null;

    const period = parsed.hour >= 12 ? 'pm' : 'am';
    const hour12 = parsed.hour % 12 || 12;
    const minute = String(parsed.minute).padStart(2, '0');
    return `${hour12}:${minute} ${period}`;
}

function formatLocalNow(date) {
    const datePart = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
    const timePart = date
        .toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        })
        .toLowerCase();
    return `${datePart} ${timePart} local time`;
}

function findTodayRow(hours, date) {
    const todayName = DAY_NAMES[date.getDay()];
    return (
        hours.find(
            (row) =>
                String(row.day || '')
                    .trim()
                    .toLowerCase() === todayName.toLowerCase(),
        ) || null
    );
}

function todayHoursLabel(row) {
    if (!row) return 'Hours not listed for today';

    const closed =
        !row.close || String(row.open).toLowerCase() === 'closed';
    if (closed) return 'Closed today';

    const open = formatTime12(row.open);
    const close = formatTime12(row.close);
    if (!open || !close) {
        return `${row.open} – ${row.close}`;
    }
    return `${open} - ${close}`;
}

export default function HoursList({ hours, status = 'open', title = 'Hours' }) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const tick = () => setNow(new Date());
        tick();
        const id = window.setInterval(tick, 30_000);
        return () => window.clearInterval(id);
    }, []);

    const todayRow = useMemo(() => findTodayRow(hours || [], now), [hours, now]);
    const localTimeLabel = useMemo(() => formatLocalNow(now), [now]);
    const todayLabel = useMemo(() => todayHoursLabel(todayRow), [todayRow]);

    if (!Array.isArray(hours) || !hours.length) return null;

    const isOpen = status === 'open';
    const todayName = DAY_NAMES[now.getDay()];

    return (
        <DetailSection
            title={title}
            action={
                <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                        isOpen
                            ? 'bg-mint/30 text-olive-900'
                            : 'bg-red-100 text-red-700'
                    }`}
                >
                    {isOpen ? 'Open' : 'Closed'}
                </span>
            }
        >
            <div className="mb-4 space-y-2 border-b border-olive-100 pb-4">
                <p className="text-sm font-medium text-olive-700">
                    {localTimeLabel}
                </p>
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-olive-500">
                        Open hours today
                    </p>
                    <p className="mt-0.5 font-display text-base font-semibold text-earth-dusk">
                        {todayLabel}
                    </p>
                </div>
            </div>

            <ul className="divide-y divide-olive-100">
                {hours.map((row) => {
                    const closed =
                        !row.close ||
                        String(row.open).toLowerCase() === 'closed';
                    const isToday =
                        String(row.day || '').toLowerCase() ===
                        todayName.toLowerCase();
                    const openLabel = formatTime12(row.open) || row.open;
                    const closeLabel = formatTime12(row.close) || row.close;

                    return (
                        <li
                            key={row.day}
                            className={`flex items-center justify-between gap-3 py-2.5 text-sm ${
                                isToday ? 'font-semibold text-earth-dusk' : ''
                            }`}
                        >
                            <span
                                className={
                                    isToday
                                        ? 'text-earth-dusk'
                                        : 'font-medium text-olive-800'
                                }
                            >
                                {row.day}
                                {isToday ? (
                                    <span className="ml-1.5 text-[11px] font-semibold uppercase tracking-wide text-mustard-deep">
                                        Today
                                    </span>
                                ) : null}
                            </span>
                            <span
                                className={
                                    isToday ? 'text-earth-dusk' : 'text-olive-600'
                                }
                            >
                                {closed ? 'Closed' : `${openLabel} – ${closeLabel}`}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </DetailSection>
    );
}
