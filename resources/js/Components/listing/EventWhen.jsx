import { CalendarDays } from 'lucide-react';
import { useEffect, useState } from 'react';
import DetailSection from './DetailSection';
import { formatEventDate, formatEventTime } from './eventDates';

function parseEventDate(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatCountdown(ms) {
    if (ms <= 0) return null;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (hours > 0) {
        parts.push(`${hours} ${hours === 1 ? 'hr' : 'hrs'}`);
    }
    parts.push(`${minutes} ${minutes === 1 ? 'min' : 'mins'}`);
    parts.push(`${seconds} ${seconds === 1 ? 'sec' : 'secs'}`);
    return parts.join(' ');
}

function datetimeLabel(dateValue) {
    const date = formatEventDate(dateValue);
    const time = formatEventTime(dateValue);
    if (!date && !time) return null;
    return [date, time].filter(Boolean).join(', ');
}

export default function EventWhen({ listing }) {
    if (listing?.categoryKey !== 'events') return null;
    if (!listing.startDate && !listing.endDate) return null;

    const startAt = parseEventDate(listing.startDate);
    const endAt = parseEventDate(listing.endDate);
    const startLabel = datetimeLabel(listing.startDate);
    const endLabel = datetimeLabel(listing.endDate);

    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!startAt || startAt.getTime() <= Date.now()) return undefined;
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, [startAt]);

    const rows = [];
    if (startLabel) {
        rows.push({ label: 'Start date', value: startLabel });
    }
    if (endLabel) {
        rows.push({ label: 'End date', value: endLabel });
    }

    const countdown =
        startAt && startAt.getTime() > now
            ? formatCountdown(startAt.getTime() - now)
            : null;
    if (countdown) {
        rows.push({ label: 'Starts in', value: countdown });
    }

    if (!rows.length) return null;

    return (
        <DetailSection
            title="Date & time"
            action={
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mustard/25 text-olive-900">
                    <CalendarDays className="h-4 w-4" strokeWidth={2} />
                </span>
            }
        >
            <dl className="divide-y divide-olive-100">
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-olive-500">
                            {row.label}
                        </dt>
                        <dd className="text-right font-display text-[15px] font-semibold text-earth-dusk">
                            {row.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </DetailSection>
    );
}
