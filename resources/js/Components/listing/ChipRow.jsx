import DetailSection, { useDetailSectionTone } from './DetailSection';

export default function ChipRow({ chips }) {
    const tone = useDetailSectionTone();
    const region = chips?.region || null;

    // Stay open layout already has Getting here with area + map.
    if (tone === 'open' || !region) {
        return null;
    }

    return (
        <DetailSection title="Location">
            <p className="text-sm font-semibold text-olive-900 dark:text-olive-100">
                {region}
            </p>
        </DetailSection>
    );
}
