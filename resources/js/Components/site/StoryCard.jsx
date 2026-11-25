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
            className={`group flex h-full flex-col overflow-hidden rounded-xl border border-olive-200/90 bg-white transition hover:border-olive-300 ${className}`}
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
                    <span className="text-sm text-olive-600">
                        {article.category}
                    </span>
                ) : null}
                <h3
                    className={`font-display text-base font-semibold leading-snug tracking-tight text-earth-dusk transition group-hover:underline sm:text-lg ${
                        article.category ? 'mt-1.5' : ''
                    }`}
                >
                    {article.title}
                </h3>
                {(article.excerpt || article.subtitle) && (
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-olive-700">
                        {article.excerpt || article.subtitle}
                    </p>
                )}
                <div className="mt-4 flex items-center gap-3 text-xs text-olive-500">
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
