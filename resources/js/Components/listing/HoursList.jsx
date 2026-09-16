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

function toMinutes(parsed) {
    if (!parsed) return null;
    return parsed.hour * 60 + parsed.minute;
}

/**
 * Whether the business is open right now based on today's hours row.
 * Supports overnight windows (e.g. 10:00 pm – 2:00 am).
 */
function isOpenNow(row, date) {
    if (!row) return false;
    if (!row.close || String(row.open).toLowerCase() === 'closed') {
        return false;
    }

    const openMins = toMinutes(parseHourMinute(row.open));
    const closeMins = toMinutes(parseHourMinute(row.close));
    if (openMins == null || closeMins == null) return false;

    const nowMins = date.getHours() * 60 + date.getMinutes();

    // Same-day window: 8:00 am – 10:00 pm
    if (closeMins > openMins) {
        return nowMins >= openMins && nowMins < closeMins;
    }

    // Overnight window: 10:00 pm – 2:00 am
    if (closeMins < openMins) {
        return nowMins >= openMins || nowMins < closeMins;
    }

    // open === close → treat as closed / invalid
    return false;
}

export default function HoursList({ hours, title = 'Working hours' }) {
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
    const isOpen = useMemo(() => isOpenNow(todayRow, now), [todayRow, now]);

    if (!Array.isArray(hours) || !hours.length) return null;

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
            <div className="mb-4 space-y-1 border-b border-olive-100 pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-olive-500">
                    Open hours today
                </p>
                <p className="font-display text-base font-semibold text-earth-dusk">
                    {todayLabel}
                </p>
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

            <p className="mt-3 border-t border-olive-100 pt-3 text-right text-xs italic text-olive-500">
                {localTimeLabel}
            </p>
        </DetailSection>
    );
}
