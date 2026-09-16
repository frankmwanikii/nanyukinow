import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import DetailSection from './DetailSection';

const PAGE_SIZE = 5;

function buildSeedReviews(listing) {
    const names = [
        'Amina K.',
        'James O.',
        'Wanjiru M.',
        'David N.',
        'Grace W.',
        'Peter L.',
        'Njeri T.',
        'Brian M.',
        'Faith K.',
        'Samuel R.',
        'Lucy A.',
        'Kevin O.',
    ];
    const bodies = [
        'Great experience overall — clear communication and exactly as described.',
        'Would happily return. The highland setting made the visit special.',
        'Friendly team and smooth arrangements from start to finish.',
        'Solid value for Nanyuki. Recommend booking ahead on weekends.',
        'Beautiful spot. A few small wait times, but still worth it.',
        'Easy to find and well organised. Photos matched reality.',
        'Clean, welcoming, and the staff went the extra mile.',
        'Perfect stop between Nairobi and the mountain — highly recommend.',
        'Came with family and everyone enjoyed it. Will book again.',
        'Good communication on WhatsApp and fair pricing.',
        'Atmosphere was lovely in the evening. Food was fresh.',
        'Quiet nights and a great base for exploring Timau.',
    ];
    const dates = [
        '2 days ago',
        '1 week ago',
        '2 weeks ago',
        '3 weeks ago',
        'Last month',
        '6 weeks ago',
        '2 months ago',
    ];

    const count = Math.max(
        12,
        Math.min(18, Math.round((listing.reviewSummary?.count || 24) / 2)),
    );

    return Array.from({ length: count }, (_, i) => ({
        id: `r-${listing.id}-${i}`,
        name: names[i % names.length],
        rating: Math.min(
            5,
            Math.max(3, Math.round((listing.rating || 4.5) - (i % 4) * 0.25)),
        ),
        date: dates[i % dates.length],
        text: bodies[i % bodies.length],
    }));
}

function Stars({ value = 0, onChange = null, size = 'md' }) {
    const cls = size === 'lg' ? 'h-7 w-7' : 'h-4 w-4';
    return (
        <div className="inline-flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => {
                const filled = n <= value;
                const Comp = onChange ? 'button' : 'span';
                return (
                    <Comp
                        key={n}
                        type={onChange ? 'button' : undefined}
                        onClick={onChange ? () => onChange(n) : undefined}
                        className={
                            onChange ? 'rounded p-0.5 transition hover:scale-110' : ''
                        }
                        aria-label={onChange ? `Rate ${n} stars` : undefined}
                    >
                        <Star
                            className={`${cls} ${
                                filled
                                    ? 'fill-mustard text-mustard'
                                    : 'text-olive-300'
                            }`}
                        />
                    </Comp>
                );
            })}
        </div>
    );
}

export default function ReviewsPage({ listing }) {
    const seed = useMemo(() => buildSeedReviews(listing), [listing]);
    const [reviews, setReviews] = useState(seed);
    const [page, setPage] = useState(1);
    const [name, setName] = useState('');
    const [text, setText] = useState('');
    const [rating, setRating] = useState(5);
    const [submitted, setSubmitted] = useState(false);

    const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageItems = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;
        return reviews.slice(start, start + PAGE_SIZE);
    }, [reviews, safePage]);

    const avg =
        reviews.length > 0
            ? (
                  reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
              ).toFixed(1)
            : listing.rating;

    const submit = (e) => {
        e.preventDefault();
        if (!name.trim() || !text.trim() || !rating) return;

        setReviews((prev) => [
            {
                id: `local-${Date.now()}`,
                name: name.trim(),
                rating,
                date: 'Just now',
                text: text.trim(),
            },
            ...prev,
        ]);
        setPage(1);
        setName('');
        setText('');
        setRating(5);
        setSubmitted(true);
        window.setTimeout(() => setSubmitted(false), 2500);
    };

    const goTo = (next) => {
        setPage(Math.min(totalPages, Math.max(1, next)));
        const list = document.getElementById('reviews-list');
        list?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="mx-auto grid max-w-[900px] gap-5 px-4 sm:px-6">
            <DetailSection title="Reviews">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="inline-flex items-center gap-2 font-display text-4xl font-semibold text-earth-dusk">
                            <Star className="h-8 w-8 fill-mustard text-mustard" />
                            {avg}
                        </p>
                        <p className="mt-1 text-sm text-olive-600">
                            {reviews.length} review
                            {reviews.length === 1 ? '' : 's'} for {listing.title}
                        </p>
                    </div>
                    {listing.reviewSummary?.highlight ? (
                        <p className="max-w-md rounded-xl bg-olive-50 px-4 py-3 text-sm leading-relaxed text-olive-800">
                            “{listing.reviewSummary.highlight}”
                        </p>
                    ) : null}
                </div>
            </DetailSection>

            <DetailSection title="Write a review">
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500">
                            Your rating
                        </label>
                        <Stars value={rating} onChange={setRating} size="lg" />
                    </div>
                    <div>
                        <label
                            htmlFor="review-name"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500"
                        >
                            Name
                        </label>
                        <input
                            id="review-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            required
                            className="w-full rounded-xl border-0 bg-olive-50 px-4 py-3 text-sm text-earth-dusk ring-1 ring-olive-200 placeholder:text-olive-400 focus:ring-2 focus:ring-mustard"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="review-text"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-olive-500"
                        >
                            Your review
                        </label>
                        <textarea
                            id="review-text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Share what stood out…"
                            required
                            rows={4}
                            className="w-full resize-y rounded-xl border-0 bg-olive-50 px-4 py-3 text-sm text-earth-dusk ring-1 ring-olive-200 placeholder:text-olive-400 focus:ring-2 focus:ring-mustard"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="submit"
                            className="inline-flex rounded-full bg-olive-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950"
                        >
                            Submit review
                        </button>
                        {submitted ? (
                            <span className="text-sm font-semibold text-olive-700">
                                Thanks — your review was added.
                            </span>
                        ) : null}
                    </div>
                </form>
            </DetailSection>

            <div id="reviews-list" className="flex flex-col gap-4">
                {pageItems.map((review) => (
                    <article
                        key={review.id}
                        className="rounded-2xl bg-white p-5 shadow-soft sm:p-6"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="font-display text-base font-semibold text-earth-dusk">
                                    {review.name}
                                </p>
                                <p className="mt-0.5 text-xs text-olive-500">
                                    {review.date}
                                </p>
                            </div>
                            <Stars value={review.rating} />
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-olive-800">
                            {review.text}
                        </p>
                    </article>
                ))}
            </div>

            {totalPages > 1 ? (
                <div className="flex flex-col items-center gap-3 pb-2">
                    <nav
                        className="inline-flex items-center gap-1 rounded-2xl border border-olive-200/80 bg-white p-1.5 shadow-soft"
                        aria-label="Reviews pagination"
                    >
                        <button
                            type="button"
                            disabled={safePage <= 1}
                            onClick={() => goTo(safePage - 1)}
                            className="inline-flex h-9 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-olive-700 transition hover:bg-olive-50 disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Prev</span>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                            (n) => {
                                const active = n === safePage;
                                return (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => goTo(n)}
                                        className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 text-sm font-semibold transition ${
                                            active
                                                ? 'bg-olive-700 text-white'
                                                : 'text-olive-700 hover:bg-olive-50'
                                        }`}
                                        aria-current={active ? 'page' : undefined}
                                    >
                                        {n}
                                    </button>
                                );
                            },
                        )}

                        <button
                            type="button"
                            disabled={safePage >= totalPages}
                            onClick={() => goTo(safePage + 1)}
                            className="inline-flex h-9 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-olive-700 transition hover:bg-olive-50 disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label="Next page"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </nav>
                    <p className="text-xs font-medium text-olive-500">
                        Page {safePage} of {totalPages} · showing {pageItems.length}{' '}
                        of {reviews.length}
                    </p>
                </div>
            ) : null}
        </div>
    );
}
