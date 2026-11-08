import DetailSection from './DetailSection';

export default function FactStrip({ facts = [], title = 'At a glance' }) {
    const items = Array.isArray(facts)
        ? facts.filter((f) => f?.label && f.label !== 'Charges')
        : [];
    if (!items.length) return null;

    return (
        <DetailSection title={title}>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {items.map((fact) => (
                    <div
                        key={fact.label}
                        className="min-w-0 border-l-2 border-mustard pl-3"
                    >
                        <dt className="text-sm text-olive-600">{fact.label}</dt>
                        <dd className="mt-0.5 font-display text-base font-semibold tracking-tight text-earth-dusk">
                            {fact.href ? (
                                <a
                                    href={fact.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline decoration-olive-300 underline-offset-2 transition hover:text-olive-700 hover:decoration-mustard"
                                >
                                    {fact.value}
                                </a>
                            ) : (
                                fact.value
                            )}
                        </dd>
                    </div>
                ))}
            </dl>
        </DetailSection>
    );
}
