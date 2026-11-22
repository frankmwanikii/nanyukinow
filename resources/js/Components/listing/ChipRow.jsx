import { Link } from '@inertiajs/react';
import {
    PROPERTY_TYPES,
    explorePath,
    getCategoryByKey,
    mainCategories,
} from '@/data/categories';
import DetailSection from './DetailSection';

function normalizeLabel(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/\s*&\s*/g, ' & ')
        .replace(/\s+/g, ' ')
        .trim();
}

function labelsMatch(a, b) {
    return normalizeLabel(a) === normalizeLabel(b);
}

/**
 * Resolve an "Appears in" label to Explore href + canonical display text.
 * @returns {{ href: string|null, label: string }}
 */
export function resolveAppearsInChip(label, categoryKey = null) {
    const text = String(label || '').trim();
    if (!text) {
        return { href: null, label: '' };
    }

    const current = getCategoryByKey(categoryKey);

    if (current && labelsMatch(current.label, text)) {
        return {
            href: explorePath({ category: current.key }),
            label: current.label,
        };
    }

    const mainByLabel = mainCategories.find((cat) =>
        labelsMatch(cat.label, text),
    );
    if (mainByLabel) {
        return {
            href: explorePath({ category: mainByLabel.key }),
            label: mainByLabel.label,
        };
    }

    if (
        categoryKey === 'properties' &&
        PROPERTY_TYPES.some((type) => labelsMatch(type, text))
    ) {
        const propertyType =
            PROPERTY_TYPES.find((type) => labelsMatch(type, text)) || text;
        return {
            href: explorePath({ category: 'properties', propertyType }),
            label: propertyType,
        };
    }

    if (current?.children?.some((child) => labelsMatch(child, text))) {
        const subcategory =
            current.children.find((child) => labelsMatch(child, text)) || text;
        return {
            href: explorePath({ category: current.key, subcategory }),
            label: subcategory,
        };
    }

    for (const cat of mainCategories) {
        const match = (cat.children || []).find((child) =>
            labelsMatch(child, text),
        );
        if (match) {
            return {
                href: explorePath({ category: cat.key, subcategory: match }),
                label: match,
            };
        }
    }

    return { href: null, label: text };
}

function CategoryLink({ label, href }) {
    const className =
        'text-sm font-semibold text-olive-900 underline decoration-olive-300 underline-offset-4 transition hover:text-olive-700 hover:decoration-mustard dark:text-olive-100 dark:decoration-olive-600 dark:hover:text-mustard dark:hover:decoration-mustard';

    if (!href) {
        return <span className="text-sm font-semibold text-olive-800 dark:text-olive-200">{label}</span>;
    }

    return (
        <Link href={href} prefetch className={className}>
            {label}
        </Link>
    );
}

export default function ChipRow({ chips, categoryKey = null }) {
    const categories = Array.isArray(chips?.categories)
        ? chips.categories.filter(Boolean)
        : [];
    const region = chips?.region || null;

    if (!region && !categories.length) {
        return null;
    }

    return (
        <div className="space-y-4">
            {region ? (
                <DetailSection title="Location">
                    <p className="text-sm font-semibold text-olive-900 dark:text-olive-100">
                        {region}
                    </p>
                </DetailSection>
            ) : null}

            {categories.length ? (
                <DetailSection title="Appears in">
                    <ul className="flex flex-wrap items-baseline gap-x-1 gap-y-2">
                        {categories.map((item, index) => {
                            const resolved = resolveAppearsInChip(
                                item,
                                categoryKey,
                            );
                            return (
                                <li
                                    key={`cat-${resolved.label}-${index}`}
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
                                    <CategoryLink
                                        label={resolved.label}
                                        href={resolved.href}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                </DetailSection>
            ) : null}
        </div>
    );
}
