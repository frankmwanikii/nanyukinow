import DetailSection from './DetailSection';

export default function WaysToPay({ payments = [] }) {
    const items = Array.isArray(payments) ? payments.filter(Boolean) : [];
    if (!items.length) return null;

    return (
        <DetailSection title="Ways to pay">
            <ul className="flex flex-wrap items-baseline gap-x-1 gap-y-2">
                {items.map((method, index) => (
                    <li
                        key={`${method}-${index}`}
                        className="inline-flex min-w-0 items-baseline"
                    >
                        {index > 0 ? (
                            <span
                                className="mx-1.5 select-none text-olive-300 dark:text-olive-600"
                                aria-hidden="true"
                            >
                                /
                            </span>
                        ) : null}
                        <span className="text-sm font-semibold text-olive-900 dark:text-olive-100">
                            {method}
                        </span>
                    </li>
                ))}
            </ul>
        </DetailSection>
    );
}
