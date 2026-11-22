import { createContext, useContext } from 'react';

/** @typedef {'card' | 'open' | 'rail'} DetailSectionTone */

export const DetailSectionToneContext = createContext(
    /** @type {DetailSectionTone} */ ('card'),
);

export function useDetailSectionTone() {
    return useContext(DetailSectionToneContext);
}

const TONE_CLASS = {
    card: {
        section: 'min-w-0 border border-olive-900/15 bg-white',
        header:
            'flex items-start justify-between gap-3 border-b border-olive-900/10 px-4 py-3 sm:px-5 sm:py-3.5',
        body: 'px-4 py-4 sm:px-5 sm:py-5',
        title: 'font-display text-base font-semibold tracking-tight text-earth-dusk sm:text-lg',
    },
    open: {
        section: 'min-w-0 py-8 sm:py-11',
        header: 'mb-4 flex items-start justify-between gap-3 sm:mb-5',
        body: 'min-w-0',
        title: 'font-display text-xl font-semibold tracking-tight text-earth-dusk sm:text-2xl',
    },
    rail: {
        section: 'min-w-0 border border-olive-900/20 bg-white',
        header:
            'flex items-start justify-between gap-3 border-b border-olive-900/10 px-4 py-3 sm:px-4 sm:py-3',
        body: 'px-4 py-4 sm:px-4 sm:py-4',
        title: 'font-display text-base font-semibold tracking-tight text-earth-dusk',
    },
};

/**
 * Listing body section shell.
 * tone: card (default boxed) | open (editorial, no box) | rail (quiet side panel)
 */
export default function DetailSection({
    id,
    title,
    action = null,
    children,
    className = '',
    empty = false,
    tone: toneProp = null,
}) {
    const toneFromContext = useDetailSectionTone();
    const tone = toneProp || toneFromContext || 'card';
    const styles = TONE_CLASS[tone] || TONE_CLASS.card;

    if (empty || children == null || children === false) {
        return null;
    }

    return (
        <section
            id={id || undefined}
            className={`${styles.section} ${className}`.trim()}
        >
            {(title || action) && (
                <div className={styles.header}>
                    {title ? (
                        <h2 className={styles.title}>{title}</h2>
                    ) : (
                        <span />
                    )}
                    {action}
                </div>
            )}
            <div className={styles.body}>{children}</div>
        </section>
    );
}
