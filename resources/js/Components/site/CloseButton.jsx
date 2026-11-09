import { CloseMark } from '@/Components/site/Mark';

const SIZE = {
    sm: {
        button: 'h-8 w-8',
        icon: 'h-3.5 w-3.5',
    },
    md: {
        button: 'h-9 w-9',
        icon: 'h-4 w-4',
    },
    lg: {
        button: 'h-10 w-10',
        icon: 'h-5 w-5',
    },
};

/**
 * Shared dismiss control: hairline mark, square frame, no soft gray pill.
 */
export default function CloseButton({
    onClick,
    className = '',
    label = 'Close',
    size = 'md',
    tone = 'default',
}) {
    const dims = SIZE[size] || SIZE.md;
    const toneClass =
        tone === 'onDark'
            ? 'border-white/25 text-white/85 hover:border-white/55 hover:bg-white/10 hover:text-white'
            : 'border-olive-900/15 text-olive-700 hover:border-olive-900/40 hover:bg-olive-50 hover:text-earth-dusk dark:border-olive-600 dark:text-olive-200 dark:hover:border-olive-400 dark:hover:bg-olive-800 dark:hover:text-olive-50';

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={`inline-flex ${dims.button} shrink-0 items-center justify-center border transition ${toneClass} ${className}`.trim()}
        >
            <CloseMark className={dims.icon} />
        </button>
    );
}
