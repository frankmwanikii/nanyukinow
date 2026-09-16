import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function ListingModal({
    open,
    onClose,
    title,
    children,
    wide = false,
}) {
    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[1200] flex items-end justify-center bg-earth-dusk/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={onClose}
        >
            <div
                className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-lift sm:rounded-2xl ${
                    wide ? 'sm:max-w-lg' : 'sm:max-w-md'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-olive-100 bg-white px-5 py-4">
                    <h2 className="font-display text-lg font-semibold text-earth-dusk">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-olive-50 text-olive-800 transition hover:bg-mustard"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                </div>
                <div className="px-5 py-5">{children}</div>
            </div>
        </div>
    );
}
