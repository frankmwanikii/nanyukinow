import { useEffect, useState } from 'react';
import DetailSection from './DetailSection';
import { formatEventDate, formatEventTime } from './eventDates';

function parseEventDate(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function sameCalendarDay(a, b) {
    if (!a || !b) return false;
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function formatCountdown(ms) {
    if (ms <= 0) return null;

    const totalMinutes = Math.floor(ms / 60000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    if (days >= 14) {
        const weeks = Math.round(days / 7);
        return `Starts in ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
    }
    if (days >= 2) {
        return `Starts in ${days} days`;
    }
    if (days === 1) {
        return 'Starts tomorrow';
    }
    if (hours >= 1) {
        return `Starts in ${hours} ${hours === 1 ? 'hr' : 'hrs'}${
            minutes > 0 ? ` ${minutes} min` : ''
        }`;
    }
    if (minutes <= 1) {
        return 'Starting soon';
    }
    return `Starts in ${minutes} min`;
}

function formatDoorsOpen(value) {
    const raw = String(value || '').trim();
    if (!raw) return null;

    const match = raw.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
    if (!match) return raw;

    let hour = Number(match[1]);
    const minute = match[2];
    const meridiem = match[3]?.toLowerCase();

    if (meridiem) {
        return `${((hour + 11) % 12) + 1}:${minute} ${meridiem}`;
    }

    if (hour > 23) return raw;
    const suffix = hour >= 12 ? 'pm' : 'am';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${suffix}`;
}

function calendarParts(date) {
    if (!date) return null;
    return {
        weekday: date.toLocaleDateString('en-GB', { weekday: 'short' }),
        day: String(date.getDate()),
        month: date.toLocaleDateString('en-GB', { month: 'short' }),
        year: String(date.getFullYear()),
    };
}

export default function EventWhen({ listing }) {
    if (listing?.categoryKey !== 'events') return null;

    const doorsOpen = formatDoorsOpen(
        listing.doorsOpen || listing.details?.doors_open || '',
    );
    if (!listing.startDate && !listing.endDate && !doorsOpen) return null;

    const startAt = parseEventDate(listing.startDate);
    const endAt = parseEventDate(listing.endDate);
    const startDateLabel = formatEventDate(listing.startDate);
    const startTimeLabel = formatEventTime(listing.startDate);
    const endDateLabel = formatEventDate(listing.endDate);
    const endTimeLabel = formatEventTime(listing.endDate);
    const singleDay = sameCalendarDay(startAt, endAt);
    const badge = calendarParts(startAt);

    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!startAt) return undefined;
        const remaining = startAt.getTime() - Date.now();
        if (remaining <= 0) return undefined;

        const intervalMs = remaining < 24 * 60 * 60 * 1000 ? 30_000 : 60_000;
        const id = window.setInterval(() => setNow(Date.now()), intervalMs);
        return () => window.clearInterval(id);
    }, [startAt]);

    const countdown =
        startAt && startAt.getTime() > now
            ? formatCountdown(startAt.getTime() - now)
            : null;

    const timeLine = (() => {
        if (!startTimeLabel && !endTimeLabel) return null;
        if (singleDay && startTimeLabel && endTimeLabel) {
            return `${startTimeLabel} to ${endTimeLabel}`;
        }
        if (startTimeLabel) return startTimeLabel;
        return endTimeLabel;
    })();

    const showEndBlock = endAt && endDateLabel && (!startAt || !singleDay);

    if (!startDateLabel && !showEndBlock && !doorsOpen && !countdown) {
        return null;
    }

    return (
        <DetailSection title="Date & time">
            <div className="space-y-5">
                {badge || startDateLabel ? (
                    <div className="flex items-start gap-4 sm:gap-5">
                        {badge ? (
                            <div className="flex h-[4.75rem] w-[4.25rem] shrink-0 flex-col items-center justify-center bg-olive-900 text-center text-white sm:h-20 sm:w-[4.5rem]">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mustard">
                                    {badge.month}
                                </span>
                                <span className="font-display text-[1.85rem] font-semibold leading-none tracking-tight sm:text-[2rem]">
                                    {badge.day}
                                </span>
                                <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-white/65">
                                    {badge.weekday}
                                </span>
                            </div>
                        ) : null}

                        <div className="min-w-0 pt-0.5">
                            <p className="font-display text-xl font-semibold leading-snug tracking-tight text-earth-dusk sm:text-2xl">
                                {startDateLabel}
                            </p>
                            {timeLine ? (
                                <p className="mt-1 text-base text-olive-800">
                                    {timeLine}
                                </p>
                            ) : null}
                            {countdown ? (
                                <p className="mt-2 inline-flex rounded-sm bg-mustard/20 px-2.5 py-1 text-sm font-semibold text-earth-dusk">
                                    {countdown}
                                </p>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                {showEndBlock ? (
                    <div className="border-t border-olive-100 pt-4">
                        <p className="text-sm text-olive-600">Runs until</p>
                        <p className="mt-0.5 font-display text-lg font-semibold text-earth-dusk">
                            {endDateLabel}
                            {endTimeLabel ? (
                                <span className="font-sans text-base font-medium text-olive-800">
                                    {`, ${endTimeLabel}`}
                                </span>
                            ) : null}
                        </p>
                    </div>
                ) : null}

                {doorsOpen ? (
                    <p className="text-sm text-olive-700">
                        Doors open at{' '}
                        <span className="font-semibold text-earth-dusk">
                            {doorsOpen}
                        </span>
                    </p>
                ) : null}
            </div>
        </DetailSection>
    );
}
