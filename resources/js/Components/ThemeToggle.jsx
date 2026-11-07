import { MoonMark, SunMark } from '@/Components/site/Mark';

/**
 * Square light/dark control for account chrome.
 */
export default function ThemeToggle({ isDark, setTheme, className = '' }) {
    return (
        <div
            role="group"
            aria-label="Color theme"
            className={`inline-grid h-9 shrink-0 grid-cols-2 items-stretch border border-olive-900/20 bg-white dark:border-olive-700 dark:bg-olive-950 ${className}`}
        >
            <button
                type="button"
                onClick={() => setTheme('light')}
                aria-label="Light mode"
                aria-pressed={!isDark}
                className={
                    'flex items-center justify-center px-2.5 transition ' +
                    (!isDark
                        ? 'bg-olive-900 text-white dark:bg-mustard dark:text-earth-dusk'
                        : 'text-olive-500 hover:bg-olive-50 hover:text-olive-900 dark:text-olive-400 dark:hover:bg-olive-900 dark:hover:text-olive-100')
                }
            >
                <SunMark className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                onClick={() => setTheme('dark')}
                aria-label="Dark mode"
                aria-pressed={isDark}
                className={
                    'flex items-center justify-center border-l border-olive-900/20 px-2.5 transition dark:border-olive-700 ' +
                    (isDark
                        ? 'bg-olive-900 text-white dark:bg-mustard dark:text-earth-dusk'
                        : 'text-olive-500 hover:bg-olive-50 hover:text-olive-900 dark:text-olive-400 dark:hover:bg-olive-900 dark:hover:text-olive-100')
                }
            >
                <MoonMark className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}
