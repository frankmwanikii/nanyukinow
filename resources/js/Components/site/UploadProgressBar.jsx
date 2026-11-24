/**
 * Compact upload progress meter (mustard fill on olive track).
 *
 * @param {{ value?: number, label?: string, className?: string }} props
 */
export default function UploadProgressBar({
    value = 0,
    label = 'Uploading…',
    className = '',
}) {
    const pct = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

    return (
        <div
            className={`space-y-1.5 ${className}`.trim()}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label}
        >
            <div className="flex items-center justify-between gap-2 text-sm font-medium text-olive-700 dark:text-olive-300">
                <span>{label}</span>
                <span className="tabular-nums">{pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-olive-200 dark:bg-olive-800">
                <div
                    className="h-full rounded-full bg-mustard transition-[width] duration-150 ease-out motion-reduce:transition-none"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
