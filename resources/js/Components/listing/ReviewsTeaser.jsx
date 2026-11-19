import { Star } from '@/Components/site/LucideCompat';
import DetailSection from './DetailSection';

export default function ReviewsTeaser({ rating, reviewSummary }) {
    if (!rating && !reviewSummary?.count) return null;

    return (
        <DetailSection id="reviews" title="Reviews">
            <div className="flex flex-wrap items-end gap-4">
                <div>
                    <p className="inline-flex items-center gap-2 font-display text-3xl font-semibold text-earth-dusk">
                        <Star className="h-7 w-7 fill-mustard text-mustard" />
                        {rating ?? '—'}
                    </p>
                    {reviewSummary?.count ? (
                        <p className="mt-1 text-sm text-olive-600">
                            Based on {reviewSummary.count} reviews
                        </p>
                    ) : null}
                </div>
                {reviewSummary?.highlight ? (
                    <p className="max-w-md text-sm leading-relaxed text-olive-800">
                        “{reviewSummary.highlight}”
                    </p>
                ) : null}
            </div>
        </DetailSection>
    );
}
