import DetailSection from './DetailSection';

export default function ChipRow({ priceRangeLabel }) {
    if (!priceRangeLabel) {
        return null;
    }

    return (
        <DetailSection>
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-olive-500">
                    Price range
                </p>
                <p className="mt-1 font-display text-lg font-semibold text-earth-dusk">
                    {priceRangeLabel}
                </p>
            </div>
        </DetailSection>
    );
}
