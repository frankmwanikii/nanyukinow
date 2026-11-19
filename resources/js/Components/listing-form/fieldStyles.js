export const field =
    'w-full min-w-0 border border-olive-900/20 bg-white px-3.5 py-3 text-base text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-olive-900 focus:ring-0 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50 dark:placeholder:text-olive-500 dark:focus:border-mustard';

export const fieldInvalid =
    'border-rose-500 focus:border-rose-600 dark:border-rose-500 dark:focus:border-rose-400';

export function fieldClass(hasError = false) {
    return hasError ? `${field} ${fieldInvalid}` : field;
}

export const label =
    'mb-1.5 block text-sm font-semibold text-olive-800 dark:text-olive-300';

export const help = 'mt-1.5 text-xs text-olive-600 dark:text-olive-400';

export const errorText = 'mt-1.5 text-sm text-rose-600 dark:text-rose-400';

export const sectionCard =
    'space-y-5 border border-olive-900/15 bg-white p-5 sm:p-7 dark:border-olive-800 dark:bg-olive-900';

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
