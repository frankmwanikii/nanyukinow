/** Fixed seating areas — guests only enter seat counts. */
export const CAPACITY_AREAS = [
    { key: 'indoors', label: 'Indoors' },
    { key: 'outdoor', label: 'Outdoor' },
    { key: 'terrace', label: 'Terrace' },
];

/**
 * Normalize capacity to `{ indoors?: number, outdoor?: number, terrace?: number }`.
 * Legacy free-text strings are ignored so the form can collect digits cleanly.
 */
export function asCapacityAreas(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
    }

    const out = {};
    for (const area of CAPACITY_AREAS) {
        const raw = value[area.key];
        if (raw === '' || raw == null) continue;
        const n = Number(raw);
        if (Number.isFinite(n) && n >= 0) {
            out[area.key] = Math.floor(n);
        }
    }
    return out;
}

export function formatCapacityLabel(value) {
    if (typeof value === 'string' && value.trim()) {
        return value.trim();
    }

    const areas = asCapacityAreas(value);
    const parts = CAPACITY_AREAS.map((area) => {
        if (areas[area.key] == null) return null;
        return `${areas[area.key].toLocaleString()} ${area.label.toLowerCase()}`;
    }).filter(Boolean);

    return parts.join(' · ');
}

export function formatAvgMealLabel(value) {
    if (value == null || value === '') return '';
    if (typeof value === 'string' && /[a-zA-Z]/.test(value)) {
        return value.trim();
    }
    const n = Number(String(value).replace(/[^\d.]/g, ''));
    if (!Number.isFinite(n)) return String(value);
    return `KES ${Math.floor(n).toLocaleString()}`;
}

export const WEEKDAYS = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
];

function formatClockTime(time) {
    if (!time || typeof time !== 'string') return '';
    const [hRaw, mRaw] = time.split(':');
    const h = Number(hRaw);
    const m = Number(mRaw);
    if (!Number.isFinite(h)) return time;
    const suffix = h >= 12 ? 'pm' : 'am';
    const hour12 = ((h + 11) % 12) + 1;
    const mins = Number.isFinite(m) ? String(m).padStart(2, '0') : '00';
    return mins === '00' ? `${hour12}${suffix}` : `${hour12}:${mins}${suffix}`;
}

/**
 * Build the public "When" label for an eat-drink gig row.
 * Supports one-time dates, weekly recurrence, and legacy free-text labels.
 */
export function formatGigWhenLabel(item) {
    if (!item || typeof item !== 'object') return '';

    const timePart = formatClockTime(item.time);
    const type = item.type === 'recurring' || item.weekday ? 'recurring' : 'once';

    if (type === 'recurring' && item.weekday) {
        const day =
            WEEKDAYS.find((d) => d.key === String(item.weekday).toLowerCase())
                ?.label || String(item.weekday);
        return timePart ? `Every ${day} · ${timePart}` : `Every ${day}`;
    }

    if (item.date) {
        const parsed = new Date(`${item.date}T12:00:00`);
        if (!Number.isNaN(parsed.getTime())) {
            const datePart = parsed.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
            });
            return timePart ? `${datePart} · ${timePart}` : datePart;
        }
    }

    return typeof item.label === 'string' ? item.label.trim() : '';
}

export function gigScheduleHasContent(item) {
    if (!item || typeof item !== 'object') return false;
    return Boolean(
        formatGigWhenLabel(item) ||
            (typeof item.value === 'string' && item.value.trim()),
    );
}
