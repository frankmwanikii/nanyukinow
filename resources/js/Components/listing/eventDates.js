function formatEventDate(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatEventTime(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date
        .toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        })
        .toLowerCase();
}

export function eventDateRangeLabel(startDate, endDate) {
    const start = formatEventDate(startDate);
    if (!start) return null;
    const end = formatEventDate(endDate);
    if (!end || start === end) return start;
    return `${start} – ${end}`;
}

export { formatEventDate, formatEventTime };
