export const field =
    'w-full rounded-xl border border-olive-200 bg-white px-3.5 py-3 text-base text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-mustard focus:ring-2 focus:ring-mustard/30';

export const label = 'mb-1.5 block text-sm font-semibold text-olive-600';

export const help = 'mt-1.5 text-xs text-olive-500';

export const sectionCard =
    'space-y-5 rounded-3xl border border-olive-200/80 bg-white p-6 shadow-soft sm:p-8';

export const DAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

export function defaultHours() {
    return DAYS.map((day) => ({
        day,
        open: '08:00',
        close: '18:00',
        closed: day === 'Sunday',
    }));
}
