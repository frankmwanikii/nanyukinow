import DetailSection, { useDetailSectionTone } from './DetailSection';
import MobileFadeExpand from './MobileFadeExpand';

function itemKey(item, index) {
    if (typeof item === 'string') {
        return `${item}-${index}`;
    }
    return `${item?.time || ''}-${item?.title || item?.label || item?.value || index}`;
}

function itemText(item) {
    if (typeof item === 'string') {
        return item.trim();
    }
    return item?.title || item?.label || item?.value || '';
}

function cleanDisplayText(raw) {
    return String(raw || '')
        .replace(/^[\s•·▪▫◦●○\-–—*]+/, '')
        .trim();
}

export default function BulletList({ title, items = [], ordered = false }) {
    const tone = useDetailSectionTone();
    const openSurface = tone === 'open';

    const list = Array.isArray(items)
        ? items
              .map((item) =>
                  typeof item === 'string' ? item.trim() : item,
              )
              .filter((item) => {
                  if (typeof item === 'string') return item.length > 0;
                  return Boolean(itemText(item));
              })
        : [];
    if (!list.length) return null;

    // Two columns only when the list earns the width; short lists stay dense.
    const useTwoColumns = openSurface && list.length >= 4;

    const listEl = (
        <ul
            className={
                openSurface
                    ? useTwoColumns
                        ? 'grid grid-cols-1 gap-x-10 gap-y-2.5 sm:grid-cols-2 sm:gap-y-3'
                        : 'grid grid-cols-1 gap-y-2.5 sm:gap-y-3'
                    : 'divide-y divide-olive-900/10'
            }
        >
            {list.map((item, index) => {
                const text = itemText(item);
                const cleaned = cleanDisplayText(text);
                const display =
                    typeof item === 'string'
                        ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
                        : cleaned;

                return (
                    <li
                        key={itemKey(item, index)}
                        className={
                            openSurface
                                ? 'flex min-w-0 gap-2.5'
                                : 'flex gap-3 py-2.5 first:pt-0 last:pb-0'
                        }
                    >
                        {ordered ? null : (
                            <span
                                className={`mt-[0.55rem] h-1 w-1 shrink-0 rounded-full ${
                                    openSurface
                                        ? 'bg-olive-500'
                                        : 'bg-mustard'
                                }`}
                                aria-hidden
                            />
                        )}
                        <span className="min-w-0 text-sm leading-relaxed text-olive-800 sm:text-[0.95rem]">
                            {ordered ? (
                                <span className="mr-2 font-semibold tabular-nums text-earth-dusk">
                                    {index + 1}.
                                </span>
                            ) : null}
                            {typeof item !== 'string' && item.time ? (
                                <span className="font-semibold text-earth-dusk">
                                    {item.time}
                                    {': '}
                                </span>
                            ) : null}
                            {display}
                        </span>
                    </li>
                );
            })}
        </ul>
    );

    return (
        <DetailSection title={title}>
            {openSurface ? (
                <MobileFadeExpand maxHeight={400}>{listEl}</MobileFadeExpand>
            ) : (
                listEl
            )}
        </DetailSection>
    );
}
