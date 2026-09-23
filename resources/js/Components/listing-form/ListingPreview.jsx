import ListingCard from '@/Components/site/ListingCard';
import { categoryStepTitle } from './categoryFieldConfig';

export default function ListingPreview({
    formData,
    category,
    categoryKey,
    coverPreview,
    logoPreview,
    posterPreview,
}) {
    const previewListing = {
        id: 'preview',
        title: formData.title || 'Untitled listing',
        location: formData.location || 'Nanyuki',
        category: category?.name || 'Listing',
        categoryKey: categoryKey || 'eatDrink',
        subcategory: formData.subcategory || null,
        propertyType: formData.property_type || null,
        rating: 5,
        image: coverPreview || '/images/logo.png',
        logo: logoPreview || null,
        eventPoster: posterPreview || null,
        startDate: formData.start_at
            ? new Date(formData.start_at).toISOString()
            : null,
        endDate: formData.end_at
            ? new Date(formData.end_at).toISOString()
            : null,
        tier: formData.tier || 'free',
    };

    const details = formData.details || {};
    const amenities = formData.amenities || [];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-display text-lg font-semibold text-olive-950">
                    Preview & confirm
                </h3>
                <p className="mt-1 text-sm text-olive-600">
                    This is how your listing card will look. Double-check details
                    before submitting.
                </p>
            </div>

            <div className="mx-auto max-w-sm">
                <ListingCard listing={previewListing} allowClick={false} />
            </div>

            <dl className="grid gap-3 rounded-2xl border border-olive-100 bg-olive-50/50 p-4 text-sm sm:grid-cols-2">
                <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                        Category
                    </dt>
                    <dd className="mt-0.5 font-semibold text-olive-950">
                        {category?.name}
                        {formData.subcategory ? ` · ${formData.subcategory}` : ''}
                        {formData.property_type
                            ? ` · ${formData.property_type}`
                            : ''}
                    </dd>
                </div>
                <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                        Location
                    </dt>
                    <dd className="mt-0.5 font-semibold text-olive-950">
                        {formData.location || '—'}
                    </dd>
                </div>
                <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                        Tagline
                    </dt>
                    <dd className="mt-0.5 text-olive-900">
                        {formData.tagline || '—'}
                    </dd>
                </div>
                <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                        Description
                    </dt>
                    <dd className="mt-0.5">
                        {formData.description ? (
                            <div
                                className="nn-editor line-clamp-6 text-olive-800"
                                dangerouslySetInnerHTML={{
                                    __html: formData.description,
                                }}
                            />
                        ) : (
                            <span className="text-olive-800">—</span>
                        )}
                    </dd>
                </div>
                <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                        Contact
                    </dt>
                    <dd className="mt-0.5 text-olive-900">
                        {[formData.phone, formData.whatsapp, formData.email]
                            .filter(Boolean)
                            .join(' · ') || '—'}
                    </dd>
                </div>
                <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                        {categoryStepTitle(categoryKey)}
                    </dt>
                    <dd className="mt-0.5 text-olive-900">
                        {Object.entries(details)
                            .filter(
                                ([k, v]) =>
                                    v &&
                                    k !== 'payments' &&
                                    k !== 'about' &&
                                    !Array.isArray(v),
                            )
                            .slice(0, 4)
                            .map(([, v]) => v)
                            .join(' · ') || '—'}
                    </dd>
                </div>
                {amenities.length ? (
                    <div className="sm:col-span-2">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                            Amenities
                        </dt>
                        <dd className="mt-1 flex flex-wrap gap-1.5">
                            {amenities.map((a) => (
                                <span
                                    key={a}
                                    className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-olive-800 ring-1 ring-olive-200"
                                >
                                    {a}
                                </span>
                            ))}
                        </dd>
                    </div>
                ) : null}
                {categoryKey === 'events' ? (
                    <div className="sm:col-span-2">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                            When & tickets
                        </dt>
                        <dd className="mt-0.5 text-olive-900">
                            {[
                                formData.start_at,
                                formData.venue,
                                formData.ticket_price,
                            ]
                                .filter(Boolean)
                                .join(' · ') || '—'}
                        </dd>
                    </div>
                ) : null}
            </dl>
        </div>
    );
}
