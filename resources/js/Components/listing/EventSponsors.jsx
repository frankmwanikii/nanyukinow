import DetailSection from './DetailSection';

export default function EventSponsors({ sponsors = [] }) {
    const list = Array.isArray(sponsors)
        ? sponsors.filter((s) => s?.logo || s?.name)
        : [];
    if (!list.length) return null;

    return (
        <DetailSection title="Sponsors">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {list.map((sponsor, index) => (
                    <li
                        key={sponsor.name || sponsor.logo || index}
                        className="flex min-w-0 flex-col items-center gap-2 border border-olive-900/10 bg-olive-50/50 px-3 py-4"
                    >
                        {sponsor.logo ? (
                            <span className="flex h-16 w-full items-center justify-center bg-white px-2 py-2 sm:h-20">
                                <img
                                    src={sponsor.logo}
                                    alt={sponsor.name || 'Sponsor'}
                                    className="max-h-full max-w-full object-contain"
                                    loading="lazy"
                                />
                            </span>
                        ) : (
                            <span className="flex h-16 w-full items-center justify-center bg-white text-sm font-semibold text-olive-700 sm:h-20">
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
