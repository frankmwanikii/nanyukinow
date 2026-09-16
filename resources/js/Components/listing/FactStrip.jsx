import DetailSection from './DetailSection';

export default function FactStrip({ facts = [], title = 'At a glance' }) {
    const items = Array.isArray(facts) ? facts.filter((f) => f?.label) : [];
    if (!items.length) return null;

    return (
        <DetailSection title={title}>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((fact) => (
                    <div key={fact.label} className="min-w-0">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-olive-500">
                            {fact.label}
                        </dt>
                        <dd className="mt-1 truncate font-display text-base font-semibold text-earth-dusk">
                            {fact.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </DetailSection>
    );
}
