import { Moon, Sun } from 'lucide-react';

/**
 * Segmented light/dark control — same pattern as the admin dashboard.
 */
export default function ThemeToggle({ isDark, setTheme, className = '' }) {
    return (
        <div
            role="group"
            aria-label="Color theme"
            className={`relative inline-grid h-9 shrink-0 grid-cols-2 items-center rounded-full bg-olive-100 p-0.5 ring-1 ring-inset ring-olive-200/80 dark:bg-olive-950 dark:ring-olive-700 ${className}`}
        >
            <span
                aria-hidden
                className="pointer-events-none absolute top-0.5 left-0.5 h-8 w-8 rounded-full bg-white shadow-soft transition-transform duration-300 ease-out dark:bg-mustard"
                style={{ transform: isDark ? 'translateX(2rem)' : 'translateX(0)' }}
            />
            <button
                type="button"
                onClick={() => setTheme('light')}
                aria-label="Light mode"
                aria-pressed={!isDark}
                className={
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 ' +
                    (!isDark
                        ? 'text-earth-dusk'
                        : 'text-olive-400 hover:text-olive-200')
                }
            >
                <Sun className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
            <button
                type="button"
                onClick={() => setTheme('dark')}
                aria-label="Dark mode"
                aria-pressed={isDark}
                className={
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 ' +
                    (isDark
                        ? 'text-earth-dusk'
                        : 'text-olive-500 hover:text-olive-800')
                }
            >
                <Moon className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
        </div>
    );
}
