import DetailSection from './DetailSection';

export default function FloorPlan({ floorPlan }) {
    if (!floorPlan?.image) return null;

    return (
        <DetailSection title="Floor plan">
            <div className="overflow-hidden rounded-xl bg-olive-50">
                <img
                    src={floorPlan.image}
                    alt={floorPlan.title || 'Floor plan'}
                    className="aspect-[16/10] w-full object-cover"
                    loading="lazy"
                />
            </div>
            {floorPlan.title ? (
                <p className="mt-2 text-sm font-medium text-olive-700">
                    {floorPlan.title}
                </p>
            ) : null}
        </DetailSection>
    );
}
