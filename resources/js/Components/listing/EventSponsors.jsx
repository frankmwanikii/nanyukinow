import DetailSection from './DetailSection';

export default function EventSponsors({ sponsors = [] }) {
    const list = Array.isArray(sponsors)
        ? sponsors.filter((s) => s?.logo || s?.name)
        : [];
    if (!list.length) return null;

    return (
        <DetailSection title="Sponsors">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {list.map((sponsor) => (
                    <li
                        key={sponsor.name || sponsor.logo}
                        className="flex flex-col items-center justify-center gap-2 rounded-xl bg-olive-50/80 px-3 py-4 ring-1 ring-olive-100"
                    >
                        {sponsor.logo ? (
                            <img
                                src={sponsor.logo}
                                alt={sponsor.name || 'Sponsor'}
                                className="h-12 w-12 rounded-full object-cover shadow-sm sm:h-14 sm:w-14"
                                loading="lazy"
                            />
                        ) : (
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-bold text-olive-700 ring-1 ring-olive-200 sm:h-14 sm:w-14">
                                {(sponsor.name || '?').slice(0, 1)}
                            </span>
                        )}
                        {sponsor.name ? (
                            <span className="text-center text-xs font-semibold text-olive-800 sm:text-sm">
                                {sponsor.name}
                            </span>
                        ) : null}
                    </li>
                ))}
            </ul>
        </DetailSection>
    );
}
