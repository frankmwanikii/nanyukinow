/**
 * Small circular prev/next control for media carousels and lightboxes.
 * White face, hairline border, thin chevron. Parents handle show/hide.
 */
export default function MediaNavButton({
    direction = 'next',
    label,
    onClick,
    className = '',
    disabled = false,
}) {
    const isPrev = direction === 'prev';

    return (
        <button
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-olive-900/12 bg-white text-olive-900 shadow-sm transition hover:border-olive-900/25 hover:bg-olive-50 disabled:pointer-events-none disabled:opacity-35 ${className}`}
        >
            <svg
                viewBox="0 0 24 24"
                className="h-3 w-3"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path
                    d={
                        isPrev
                            ? 'M14.5 6.5 9 12l5.5 5.5'
                            : 'M9.5 6.5 15 12l-5.5 5.5'
                    }
                />
            </svg>
        </button>
    );
}
