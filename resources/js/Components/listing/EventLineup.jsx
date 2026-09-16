import DetailSection from './DetailSection';

function formatAgendaTime(value) {
    if (!value) return null;
    const raw = String(value).trim();
    const match24 = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (!match24) return raw;

    let hour = Number(match24[1]);
    const minute = match24[2];
    const period = hour >= 12 ? 'pm' : 'am';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute} ${period}`;
}

export default function EventLineup({ items = [], title = 'Line-up' }) {
    const rows = Array.isArray(items)
        ? items.filter((item) => item && (item.title || item.label || item.time))
        : [];
    if (!rows.length) return null;

    return (
        <DetailSection title={title}>
            <div className="overflow-hidden rounded-xl ring-1 ring-olive-100">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="bg-olive-50/90">
                            <th
                                scope="col"
                                className="w-[7.5rem] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-olive-500 sm:w-36 sm:px-5"
                            >
                                Time
                            </th>
                            <th
                                scope="col"
                                className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-olive-500 sm:px-5"
                            >
                                What happens
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((item, index) => {
                            const time = formatAgendaTime(item.time);
                            const label =
                                item.title || item.label || item.value || '—';
                            const isLast = index === rows.length - 1;

                            return (
                                <tr
                                    key={`${item.time}-${label}-${index}`}
                                    className={`group bg-white transition hover:bg-mustard/10 ${
                                        isLast
                                            ? ''
                                            : 'border-b border-olive-100'
                                    }`}
                                >
                                    <td className="relative px-4 py-3.5 align-middle sm:px-5 sm:py-4">
                                        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-full bg-mustard opacity-0 transition group-hover:opacity-100" />
                                        <span className="inline-flex min-w-[4.75rem] items-center justify-center rounded-full bg-olive-50 px-2.5 py-1 font-display text-sm font-semibold tabular-nums text-olive-900 ring-1 ring-olive-100 sm:min-w-[5.5rem] sm:text-[15px]">
                                            {time || 'TBA'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 align-middle sm:px-5 sm:py-4">
                                        <p className="font-display text-[15px] font-semibold text-earth-dusk sm:text-base">
                                            {label}
                                        </p>
                                        {item.note ? (
                                            <p className="mt-0.5 text-sm text-olive-600">
                                                {item.note}
                                            </p>
                                        ) : null}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </DetailSection>
    );
}
