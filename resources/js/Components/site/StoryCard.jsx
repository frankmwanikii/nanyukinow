import { Link } from '@inertiajs/react';
import { Eye } from '@/Components/site/LucideCompat';

export default function StoryCard({
    article,
    className = '',
    compact = false,
}) {
    return (
        <Link
            href={`/stories/${article.slug}`}
            className={`group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_4px_15px_rgba(0,0,0,0.05)] ring-1 ring-olive-100/80 transition duration-300 hover:-translate-y-2 hover:shadow-lift ${className}`}
            data-category={article.categorySlug || article.category || ''}
            data-views={article.views ?? 0}
            data-date={article.publishedAt || ''}
            data-featured={article.isFeatured ? '1' : '0'}
        >
            <div
                className={`bg-cover bg-center ${
                    compact ? 'h-40' : 'h-[12.5rem] sm:h-[13.5rem]'
                }`}
                style={{
                    backgroundImage: article.image
                        ? `url('${article.image}')`
                        : undefined,
                    backgroundColor: '#3f3127',
                }}
                role="img"
                aria-label=""
            />
            <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                {article.category ? (
                    <span className="inline-flex w-fit rounded-md bg-mustard px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-olive-950">
                        {article.category}
                    </span>
                ) : null}
                <h3 className="mt-3 font-display text-base font-semibold leading-snug tracking-tight text-earth-dusk transition group-hover:text-olive-700 sm:text-lg">
                    {article.title}
                </h3>
                {(article.excerpt || article.subtitle) && (
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-olive-700/85">
                        {article.excerpt || article.subtitle}
                    </p>
                )}
                <div className="mt-4 flex items-center gap-3 text-xs font-medium text-olive-500">
                    <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        {Number(article.views || 0).toLocaleString()}{' '}
                        {Number(article.views || 0) === 1 ? 'view' : 'views'}
                    </span>
                </div>
            </div>
        </Link>
    );
}
