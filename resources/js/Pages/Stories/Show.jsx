import { Link } from '@inertiajs/react';
import { ArrowLeft, Clock } from 'lucide-react';
import SiteLayout from '@/Layouts/SiteLayout';
import StoryCard from '@/Components/site/StoryCard';
import {
    articles,
    formatArticleDate,
    getArticleBySlug,
} from '@/data/articles';

export default function StoryShow({ slug }) {
    const article = getArticleBySlug(slug);

    if (!article) {
        return (
            <SiteLayout title="Story not found">
                <section className="mx-auto max-w-2xl px-4 py-28 text-center sm:px-6">
                    <h1 className="font-display text-3xl font-semibold text-earth-dusk">
                        Story not found
                    </h1>
                    <p className="mt-3 text-olive-700">
                        That article may have moved or isn’t published yet.
                    </p>
                    <Link
                        href="/stories"
                        className="mt-8 inline-flex rounded-full bg-olive-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950"
                    >
                        Back to stories
                    </Link>
                </section>
            </SiteLayout>
        );
    }

    const related = articles
        .filter((item) => item.id !== article.id)
        .slice(0, 3);

    return (
        <SiteLayout title={article.title}>
            <article>
                <header className="relative overflow-hidden bg-olive-900 pt-24 sm:pt-28">
                    <div className="absolute inset-0">
                        <img
                            src={article.image}
                            alt=""
                            className="h-full w-full object-cover opacity-45"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-olive-950 via-olive-900/80 to-olive-900/55" />
                    </div>
                    <div className="relative mx-auto max-w-3xl px-4 pb-14 pt-8 sm:px-6 sm:pb-16">
                        <Link
                            href="/stories"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-mustard"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            All stories
                        </Link>
                        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-mint">
                            {article.category}
                        </p>
                        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
                            {article.title}
                        </h1>
                        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/75">
                            <span>{formatArticleDate(article.publishedAt)}</span>
                            <span className="inline-flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {article.readMinutes} min read
                            </span>
                            <span>By {article.author}</span>
                        </div>
                    </div>
                </header>

                <div className="bg-earth-sand py-10 sm:py-14">
                    <div className="mx-auto max-w-3xl px-4 sm:px-6">
                        <p className="font-display text-lg leading-relaxed text-olive-800 sm:text-xl sm:leading-8">
                            {article.excerpt}
                        </p>
                        <div className="mt-8 space-y-5 text-base leading-relaxed text-olive-800/90 sm:text-[1.05rem] sm:leading-8">
                            {article.body.map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                            ))}
                        </div>

                        <div className="mt-12 flex flex-wrap gap-3 border-t border-olive-200 pt-8">
                            <Link
                                href={`/stories?category=${encodeURIComponent(article.category)}`}
                                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-olive-700 ring-1 ring-olive-200 transition hover:bg-olive-600 hover:text-white hover:ring-olive-600"
                            >
                                More in {article.category}
                            </Link>
                            <Link
                                href="/stories"
                                className="rounded-full bg-olive-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950"
                            >
                                Browse all stories
                            </Link>
                        </div>
                    </div>
                </div>
            </article>

            {related.length > 0 ? (
                <section className="border-t border-olive-200/80 bg-white py-12 sm:py-16">
                    <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                        <h2 className="font-display text-2xl font-semibold text-earth-dusk sm:text-3xl">
                            Keep reading
                        </h2>
                        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {related.map((item) => (
                                <StoryCard key={item.id} article={item} />
                            ))}
                        </div>
                    </div>
                </section>
            ) : null}
        </SiteLayout>
    );
}
