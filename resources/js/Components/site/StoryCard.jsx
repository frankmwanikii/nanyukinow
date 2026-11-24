import { Link } from '@inertiajs/react';
import { ArrowRight } from '@/Components/site/LucideCompat';
import { formatArticleDate } from '@/data/articles';

export default function StoryCard({ article, featured = false }) {
    return (
        <article
            className={`group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift ${
                featured ? 'sm:flex-row' : ''
            }`}
        >
            <Link
                href={`/stories/${article.slug}`}
                className={`relative block overflow-hidden ${
                    featured
                        ? 'aspect-[16/9] sm:aspect-auto sm:w-[46%] sm:min-h-[16rem]'
                        : 'aspect-[16/9] sm:aspect-[16/10]'
                }`}
            >
                <img
                    src={article.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-earth-dusk/25 via-transparent to-transparent" />
            </Link>

            <div
                className={`flex min-w-0 flex-1 flex-col p-4 sm:p-6 ${
                    featured ? 'sm:justify-center' : ''
                }`}
            >
                <div className="mb-2 flex min-w-0 flex-nowrap items-center gap-x-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-olive-600 sm:mb-3 sm:gap-x-3">
                    <span className="shrink-0 rounded-full bg-olive-100 px-2.5 py-1 text-[0.65rem] tracking-[0.14em] text-olive-700">
                        {article.category}
                    </span>
                    <span className="min-w-0 truncate normal-case tracking-normal text-olive-500">
                        {formatArticleDate(article.publishedAt)}
                        {article.readMinutes
                            ? ` · ${article.readMinutes} min read`
                            : ''}
                    </span>
                </div>

                <h3
                    className={`font-display font-semibold tracking-tight text-earth-dusk ${
                        featured
                            ? 'text-lg sm:text-2xl md:text-[1.7rem]'
                            : 'text-lg sm:text-xl'
                    }`}
                >
                    <Link
                        href={`/stories/${article.slug}`}
                        className="transition hover:text-olive-700"
                    >
                        {article.title}
                    </Link>
                </h3>

                <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-olive-700/85 sm:mt-3 sm:line-clamp-3 sm:text-[0.95rem] sm:leading-7">
                    {article.excerpt}
                </p>

                <Link
                    href={`/stories/${article.slug}`}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-olive-700 transition hover:text-mustard sm:mt-5"
                >
                    Read more
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
            </div>
        </article>
    );
}
