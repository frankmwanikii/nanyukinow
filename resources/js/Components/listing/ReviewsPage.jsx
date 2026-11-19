import { ChevronLeft, ChevronRight, Star } from '@/Components/site/LucideCompat';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import DetailSection from './DetailSection';

const PAGE_SIZE = 5;
const MAX_REVIEW_WORDS = 400;

function countWords(value) {
    const text = String(value || '')
        .replace(/\s+/g, ' ')
        .trim();
    if (!text) {
        return 0;
    }
    return text.split(' ').filter(Boolean).length;
}

function Stars({ value = 0, size = 'md', interactive = false, onSelect }) {
    const cls = size === 'lg' ? 'h-7 w-7' : 'h-4 w-4';
    return (
        <div className="inline-flex items-center gap-1" role={interactive ? 'radiogroup' : undefined}>
            {[1, 2, 3, 4, 5].map((n) => {
                const filled = n <= value;
                if (!interactive) {
                    return (
                        <span key={n}>
                            <Star
                                className={`${cls} ${
                                    filled
                                        ? 'fill-mustard text-mustard'
                                        : 'text-olive-300'
                                }`}
                            />
                        </span>
                    );
                }

                return (
                    <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={value === n}
                        aria-label={`${n} star${n === 1 ? '' : 's'}`}
                        onClick={() => onSelect?.(n)}
                        className="rounded-md p-0.5 transition hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive-700"
                    >
                        <Star
                            className={`${cls} ${
                                filled
                                    ? 'fill-mustard text-mustard'
                                    : 'text-olive-300'
                            }`}
                        />
                    </button>
                );
            })}
        </div>
    );
}

function ReviewForm({ listing }) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            rating: 0,
            body: '',
        });
    const [touched, setTouched] = useState({ rating: false, body: false });
    const [attempted, setAttempted] = useState(false);

    const wordCount = countWords(data.body);
    const ratingMissing = !data.rating;
    const bodyEmpty = !String(data.body || '').trim();
    const bodyTooShort =
        !bodyEmpty && String(data.body || '').trim().length < 10;
    const bodyOverLimit = wordCount > MAX_REVIEW_WORDS;

    const ratingError =
        errors.rating ||
        ((touched.rating || attempted) && ratingMissing
            ? 'Please choose a star rating.'
            : null);
    const bodyError =
        errors.body ||
        ((touched.body || attempted) && bodyEmpty
            ? 'Please write a short review.'
            : null) ||
        ((touched.body || attempted) && bodyTooShort
            ? 'Please write at least 10 characters.'
            : null) ||
        (bodyOverLimit
            ? `Reviews can be at most ${MAX_REVIEW_WORDS} words.`
            : null);

    const canSubmit =
        !processing &&
        !ratingMissing &&
        !bodyEmpty &&
        !bodyTooShort &&
        !bodyOverLimit;

    const submit = (event) => {
        event.preventDefault();
        setAttempted(true);
        if (!canSubmit) {
            return;
        }
        post(route('listings.reviews.store', listing.slug), {
            preserveScroll: true,
            onSuccess: () => {
                reset('rating', 'body');
                setTouched({ rating: false, body: false });
                setAttempted(false);
            },
        });
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <div>
                <p className="mb-2 text-sm font-medium text-olive-800">
                    Your rating <span className="text-olive-500">*</span>
                </p>
                <Stars
                    value={data.rating}
                    size="lg"
                    interactive
                    onSelect={(n) => {
                        clearErrors('rating');
                        setTouched((prev) => ({ ...prev, rating: true }));
                        setData('rating', n);
                    }}
                />
                {ratingError ? (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                        {ratingError}
                    </p>
                ) : null}
            </div>
            <div>
                <label
                    htmlFor="review-body"
                    className="mb-2 block text-sm font-medium text-olive-800"
                >
                    Your review <span className="text-olive-500">*</span>
                </label>
                <textarea
                    id="review-body"
                    rows={4}
                    required
                    aria-required="true"
                    aria-invalid={bodyError ? true : undefined}
                    value={data.body}
                    onChange={(event) => {
                        clearErrors('body');
                        setTouched((prev) => ({ ...prev, body: true }));
                        setData('body', event.target.value);
                    }}
                    onBlur={() =>
                        setTouched((prev) => ({ ...prev, body: true }))
                    }
                    placeholder="Share what stood out about your visit"
                    className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-olive-900 shadow-sm outline-none transition placeholder:text-olive-400 focus:ring-2 ${
                        bodyError
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-olive-200 focus:border-olive-500 focus:ring-olive-500/20'
                    }`}
                />
                <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
                    {bodyError ? (
                        <p className="text-sm text-red-600" role="alert">
                            {bodyError}
                        </p>
                    ) : (
                        <span />
                    )}
                    <p
                        className={`ml-auto text-sm tabular-nums ${
                            bodyOverLimit
                                ? 'font-semibold text-red-600'
                                : 'text-olive-500'
                        }`}
                        aria-live="polite"
                    >
                        {wordCount} / {MAX_REVIEW_WORDS} words
                    </p>
                </div>
            </div>
            <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-olive-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
                {processing ? 'Posting…' : 'Post review'}
            </button>
        </form>
    );
}

export default function ReviewsPage({ listing }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const reviews = Array.isArray(listing.reviews) ? listing.reviews : [];
    const [page, setPage] = useState(1);

    const alreadyReviewed = Boolean(
        user && reviews.some((review) => Number(review.userId) === Number(user.id)),
    );

    const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageItems = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;
        return reviews.slice(start, start + PAGE_SIZE);
    }, [reviews, safePage]);

    const avg = listing.rating;

    const goTo = (next) => {
        setPage(Math.min(totalPages, Math.max(1, next)));
        const list = document.getElementById('reviews-list');
        list?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="mx-auto grid max-w-[900px] gap-4 px-4 sm:px-6">
            <DetailSection title="Reviews">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="inline-flex items-center gap-2 font-display text-4xl font-semibold text-earth-dusk">
                            <Star className="h-8 w-8 fill-mustard text-mustard" />
                            {avg ? Number(avg).toFixed(1) : '—'}
                        </p>
                        <p className="mt-1 text-sm text-olive-600">
                            {reviews.length === 1
                                ? `1 review for ${listing.title}`
                                : `${reviews.length} reviews for ${listing.title}`}
                        </p>
                    </div>
                </div>
            </DetailSection>

            <DetailSection title="Write a review">
                {!user ? (
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm leading-relaxed text-olive-700">
                            Sign in to share your experience with other visitors.
                        </p>
                        <Link
                            href={route('login')}
                            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-olive-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950"
                        >
                            Sign in
                        </Link>
                    </div>
                ) : alreadyReviewed ? (
                    <p className="text-sm leading-relaxed text-olive-700">
                        Thanks, you already reviewed this place.
                    </p>
                ) : (
                    <ReviewForm listing={listing} />
                )}
            </DetailSection>

            <div id="reviews-list" className="flex flex-col gap-4">
                {pageItems.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-olive-200 bg-olive-50/50 px-4 py-8 text-center text-sm text-olive-600">
                        <span className="mb-2 block text-3xl" aria-hidden="true">
                            ⭐
                        </span>
                        no review yet
                    </p>
                ) : (
                    pageItems.map((review) => (
                        <article
                            key={review.id}
                            className="rounded-xl border border-olive-200/70 bg-white p-4 sm:p-5"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-display text-base font-semibold text-earth-dusk">
                                        {review.name}
                                    </p>
                                    <p className="mt-0.5 text-xs text-olive-500">
                                        {review.dateLabel || review.date}
                                    </p>
                                </div>
                                <Stars value={review.rating} />
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-olive-800">
                                {review.body || review.text}
                            </p>
                        </article>
                    ))
                )}
            </div>

            {totalPages > 1 ? (
                <div className="flex flex-col items-center gap-3 pb-2">
                    <nav
                        className="inline-flex items-center gap-1 rounded-xl border border-olive-200/80 bg-white p-1.5"
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
                </div>
            ) : null}
        </div>
    );
}
