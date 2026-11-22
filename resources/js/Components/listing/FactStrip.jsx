import DetailSection from './DetailSection';
import MobileFadeExpand from './MobileFadeExpand';
import { iconForFactLabel } from './FactIcons';

const SNAPSHOT_LABELS = new Set([
    'Guests',
    'Rooms',
    'Bedrooms',
    'Beds',
    'Baths',
]);

/** Stay overview: split mixed facts into titled sections. */
const STAY_FACT_SECTIONS = [
    {
        title: 'Rooms and sleeping',
        labels: [
            'Guests',
            'Rooms',
            'Bedrooms',
            'Beds',
            'Baths',
            'Room types',
        ],
    },
    {
        title: 'Arrival and board',
        labels: ['Check-in', 'Check-out', 'Board'],
    },
    {
        title: 'Rates',
        labels: ['Per night', 'From', 'Price range'],
    },
    {
        title: 'Booking and policies',
        labels: ['Booking', 'Cancellation'],
    },
];

/** Only numeric capacity like 2, 2-4, 3.5 belongs in the snapshot strip. */
function isCapacitySnapshotValue(value) {
    const text = String(value ?? '')
        .trim()
        .replace(/\u2013|\u2014/g, '-');
    if (!text) return false;
    return /^\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?$/.test(text);
}

function displayLabel(label, lodging) {
    if (lodging && String(label).trim().toLowerCase() === 'from') {
        return 'Per night';
    }
    return label;
}

function displayValue(fact, lodging) {
    let value = fact?.value;
    const label = String(fact?.label || '')
        .trim()
        .toLowerCase();
    if (
        lodging &&
        (label === 'from' || label === 'per night') &&
        typeof value === 'string'
    ) {
        value = value.replace(/^from\s+/i, '');
    }
    return value;
}

function factValues(value) {
    if (Array.isArray(value)) {
        return value.map((item) => String(item || '').trim()).filter(Boolean);
    }
    return [];
}

function FactValueList({ values }) {
    return (
        <ul className="grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2 sm:gap-y-2.5">
            {values.map((item) => (
                <li key={item} className="flex min-w-0 gap-2.5">
                    <span
                        className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-olive-500"
                        aria-hidden
                    />
                    <span className="min-w-0 font-medium leading-relaxed text-earth-dusk dark:text-olive-50">
                        {item}
                    </span>
                </li>
            ))}
        </ul>
    );
}

function FactValue({ fact, lodging = false }) {
    const value = displayValue(fact, lodging);
    const values = factValues(value);

    if (values.length) {
        return <FactValueList values={values} />;
    }

    if (fact.href) {
        return (
            <a
                href={fact.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-olive-300 underline-offset-4 transition hover:text-olive-700 hover:decoration-mustard"
            >
                {value}
            </a>
        );
    }

    return value;
}

function FactMark({ label }) {
    const Icon = iconForFactLabel(label);
    return <Icon className="h-6 w-6" />;
}

function SnapshotStrip({ items, lodging }) {
    if (!items.length) return null;

    return (
        <ul className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4 sm:gap-x-10">
            {items.map((fact) => {
                const label = displayLabel(fact.label, lodging);
                return (
                    <li
                        key={fact.label}
                        className="flex min-w-0 items-start gap-3.5 text-olive-900 dark:text-olive-50"
                    >
                        <span className="mt-0.5 text-olive-700 dark:text-olive-200">
                            <FactMark label={label} />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-base font-semibold tracking-tight text-earth-dusk dark:text-olive-50">
                                <FactValue fact={fact} lodging={lodging} />
                            </span>
                            <span className="mt-1 block text-sm text-olive-600 dark:text-olive-300">
                                {label.toLowerCase()}
                            </span>
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}

function FactTile({ fact, lodging = false }) {
    const label = displayLabel(fact.label, lodging);
    const isList = factValues(displayValue(fact, lodging)).length > 0;

    return (
        <div
            className={`flex min-w-0 gap-4 ${isList ? 'sm:col-span-2' : ''}`}
        >
            <span className="mt-1 text-olive-700 dark:text-olive-200">
                <FactMark label={label} />
            </span>
            <div className="min-w-0 flex-1">
                <dt className="text-sm text-olive-600 dark:text-olive-300">
                    {label}
                </dt>
                <dd
                    className={`mt-1.5 text-[0.95rem] leading-relaxed sm:text-base ${
                        isList
                            ? ''
                            : 'font-medium text-earth-dusk dark:text-olive-50'
                    }`}
                >
                    <FactValue fact={fact} lodging={lodging} />
                </dd>
            </div>
        </div>
    );
}

function DetailGrid({ items, lodging }) {
    if (!items.length) return null;

    return (
        <dl className="grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2 sm:gap-y-9">
            {items.map((fact) => (
                <FactTile key={fact.label} fact={fact} lodging={lodging} />
            ))}
        </dl>
    );
}

function GlanceGrid({ items }) {
    return (
        <dl className="grid grid-cols-1 gap-x-12 gap-y-7 sm:grid-cols-2 sm:gap-y-8">
            {items.map((fact) => (
                <FactTile key={fact.label} fact={fact} />
            ))}
        </dl>
    );
}

function groupStayFacts(items) {
    const byLabel = new Map(items.map((fact) => [fact.label, fact]));
    const used = new Set();

    const sections = STAY_FACT_SECTIONS.map(({ title, labels }) => {
        const sectionItems = labels
            .map((label) => byLabel.get(label))
            .filter(Boolean);
        sectionItems.forEach((fact) => used.add(fact.label));
        return { title, items: sectionItems };
    }).filter((section) => section.items.length > 0);

    const rest = items.filter((fact) => !used.has(fact.label));
    if (rest.length) {
        sections.push({ title: 'More details', items: rest });
    }

    return sections;
}

function StayFactSections({ facts }) {
    const items = Array.isArray(facts)
        ? facts.filter((f) => f?.label && f.label !== 'Charges')
        : [];
    if (!items.length) return null;

    const sections = groupStayFacts(items);
    if (!sections.length) return null;

    return (
        <>
            {sections.map((section) => (
                <DetailSection key={section.title} title={section.title}>
                    <MobileFadeExpand maxHeight={260}>
                        <DetailGrid items={section.items} lodging />
                    </MobileFadeExpand>
                </DetailSection>
            ))}
        </>
    );
}

export default function FactStrip({
    facts = [],
    title = 'The essentials',
    layout = 'glance',
}) {
    if (layout === 'stay') {
        return <StayFactSections facts={facts} />;
    }

    const items = Array.isArray(facts)
        ? facts.filter((f) => f?.label && f.label !== 'Charges')
        : [];
    if (!items.length) return null;

    const lodging = layout === 'lodging';

    const snapshot = lodging
        ? items.filter(
              (f) =>
                  SNAPSHOT_LABELS.has(f.label) &&
                  isCapacitySnapshotValue(f.value),
          )
        : [];
    const snapshotKeys = new Set(snapshot.map((f) => f.label));
    const details = lodging
        ? items.filter((f) => !snapshotKeys.has(f.label))
        : items;

    return (
        <DetailSection title={title}>
            {lodging ? (
                <div className="space-y-9 sm:space-y-11">
                    {snapshot.length ? (
                        <>
                            <SnapshotStrip items={snapshot} lodging />
                            {details.length ? (
                                <div
                                    className="border-t border-olive-900/10"
                                    aria-hidden="true"
                                />
                            ) : null}
                        </>
                    ) : null}
                    <DetailGrid items={details} lodging />
                </div>
            ) : (
                <GlanceGrid items={details} />
            )}
        </DetailSection>
    );
}
