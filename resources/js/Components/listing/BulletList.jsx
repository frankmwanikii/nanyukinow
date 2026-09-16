import DetailSection from './DetailSection';

export default function BulletList({ title, items = [], ordered = false }) {
    const list = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!list.length) return null;

    const Tag = ordered ? 'ol' : 'ul';

    return (
        <DetailSection title={title}>
            <Tag
                className={`space-y-2 text-sm text-olive-800 ${
                    ordered ? 'list-decimal pl-5' : 'list-disc pl-5'
                }`}
            >
                {list.map((item) => {
                    if (typeof item === 'string') {
                        return <li key={item}>{item}</li>;
                    }
                    return (
                        <li key={`${item.time}-${item.title}`}>
                            {item.time ? (
                                <span className="font-semibold text-olive-900">
                                    {item.time}
                                    {' — '}
                                </span>
                            ) : null}
                            {item.title || item.label || item.value}
                        </li>
                    );
                })}
            </Tag>
        </DetailSection>
    );
}
