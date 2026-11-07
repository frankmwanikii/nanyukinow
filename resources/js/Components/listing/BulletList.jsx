import DetailSection from './DetailSection';

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

export default function BulletList({ title, items = [], ordered = false }) {
    const list = Array.isArray(items)
        ? items
              .map((item) =>
                  typeof item === 'string'
                      ? item.trim()
                      : item,
              )
              .filter((item) => {
                  if (typeof item === 'string') return item.length > 0;
                  return Boolean(itemText(item));
              })
        : [];
    if (!list.length) return null;

    return (
        <DetailSection title={title}>
            <ul className="divide-y divide-olive-900/10">
                {list.map((item, index) => {
                    const text = itemText(item);
                    const display =
                        typeof item === 'string'
                            ? text.charAt(0).toUpperCase() + text.slice(1)
                            : text;

                    return (
                        <li
                            key={itemKey(item, index)}
                            className="flex gap-3 py-2.5 first:pt-0 last:pb-0"
                        >
                            <span
                                className="mt-2 h-1.5 w-1.5 shrink-0 bg-mustard"
                                aria-hidden
                            />
                            <span className="min-w-0 text-sm leading-relaxed text-olive-800 sm:text-[0.95rem]">
                                {ordered ? (
                                    <span className="mr-2 font-semibold tabular-nums text-earth-dusk">
                                        {index + 1}.
                                    </span>
                                ) : null}
                                {typeof item !== 'string' && item.time ? (
                                    <span className="font-semibold text-earth-dusk">
                                        {item.time}
                                        {' — '}
                                    </span>
                                ) : null}
                                {display}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </DetailSection>
    );
}
